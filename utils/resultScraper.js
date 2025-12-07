const puppeteer = require('puppeteer');

const fetchResult = async (regNo, semester) => {
    console.log(`[Scraper] Starting fetch for Reg: ${regNo}, Sem: ${semester}`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // ---------------------------------------------------------
        // STRATEGY 1: Check NEW Site (beu-bih.ac.in/result-one)
        // ---------------------------------------------------------
        let foundOnNewSite = false;
        try {
            console.log('[Scraper] Checking New Site...');
            await page.goto('https://beu-bih.ac.in/result-one', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForSelector('table', { timeout: 5000 });

            // Find valid row
            // Text to find: "B.Tech" AND "3rd" (example)
            const clicked = await page.evaluate((sem) => {
                const tds = Array.from(document.querySelectorAll('td'));
                // Flexible match: "B.Tech" + sem
                const target = tds.find(el => {
                    const txt = el.innerText.toLowerCase();
                    return txt.includes('b.tech') && txt.includes(sem.toLowerCase());
                });
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            }, semester);

            if (clicked) {
                console.log('[Scraper] Found on New Site. Navigating...');
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

                // CHECK IF PAGE IS BROKEN (404 / Server Error)
                const pageText = await page.evaluate(() => document.body.innerText);
                if (pageText.includes('Server Error') || pageText.includes('resource cannot be found') || pageText.includes('404')) {
                    console.log('[Scraper] New Site returned Server Error (404). Triggering fallback to Old Site.');
                    foundOnNewSite = false;
                } else {
                    foundOnNewSite = true;
                    // NEW SITE SCRAPING LOGIC
                    // Assume generic input for Reg No
                    const inputSelector = 'input[type="text"]';
                    await page.waitForSelector(inputSelector);
                    await page.type(inputSelector, regNo);

                    // Click generic Submit/Search button
                    await page.evaluate(() => {
                        const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
                        const resultBtn = btns.find(b => b.innerText.toLowerCase().includes('result') || b.value.toLowerCase().includes('show'));
                        if (resultBtn) resultBtn.click();
                        else if (btns.length > 0) btns[0].click();
                    });

                    await page.waitForSelector('table', { timeout: 10000 });
                    // Scrape New Format (Generic Table Scraper)
                    return await scrapeGenericTable(page, regNo, semester);
                }
            }
        } catch (e) {
            console.log('[Scraper] New Site check failed, falling back to Old Site:', e.message);
        }

        if (!foundOnNewSite) {
            // ---------------------------------------------------------
            // STRATEGY 2: Check OLD Site (results.beup.ac.in)
            // ---------------------------------------------------------
            console.log('[Scraper] Checking Old Site...');
            await page.goto('http://results.beup.ac.in', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Using XPath for OLD site format (Case Insensitive)
            // "B.Tech. 3rd Semester..."
            // translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')

            const links = await page.$x(`//a[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "b.tech") and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${semester.toLowerCase()}")]`);

            if (links.length === 0) {
                console.log(`[Scraper] Link for "B.Tech ${semester}" not found on Old Site.`);
                // Last ditch effort: Try finding any link with just the semester number if 'b.tech' is implicit?
                // No, dangerous.
                throw new Error(`Result link for "B.Tech ${semester}" not found on either site.`);
            }

            console.log('[Scraper] Found link on Old Site. Clicking...');

            // Promise.all to handle navigation race conditions
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                links[0].click()
            ]);

            const inputSelector = 'input[name*="RegistrationNo"]';
            await page.waitForSelector(inputSelector);
            await page.type(inputSelector, regNo);

            const submitSelector = 'input[name*="ShowResult"]';
            await page.click(submitSelector);

            await page.waitForSelector('#ContentPlaceHolder1_GridView1', { timeout: 10000 });
            return await scrapeGenericTable(page, regNo, semester);
        }

    } catch (error) {
        console.error('[Scraper Error]', error);
        throw new Error('Result scraping failed: ' + error.message);
    } finally {
        if (browser) await browser.close();
    }
};

async function scrapeGenericTable(page, regNo, semester) {
    return await page.evaluate((r, s) => {
        // Generic Text extraction
        const getText = (sel) => document.querySelector(sel)?.innerText?.trim() || 'N/A';

        // Try to find Name by common labels
        // Often in a span with id *Name*
        let name = 'Student';
        const nameEl = Array.from(document.querySelectorAll('span, td')).find(el => el.innerText.includes('Name') && el.innerText.length < 50);
        if (nameEl && nameEl.nextElementSibling) name = nameEl.nextElementSibling.innerText;
        else if (document.querySelector('#ContentPlaceHolder1_Label_Name')) name = getText('#ContentPlaceHolder1_Label_Name');

        // Subjects Table
        // Usually the biggest table
        const tables = Array.from(document.querySelectorAll('table'));
        // Sort by number of rows desc
        tables.sort((a, b) => b.rows.length - a.rows.length);
        const mainTable = tables[0];

        const subjects = [];
        if (mainTable) {
            const rows = Array.from(mainTable.querySelectorAll('tr'));
            // Skip header
            rows.slice(1).forEach(row => {
                const cols = Array.from(row.querySelectorAll('td'));
                if (cols.length >= 4) {
                    subjects.push({
                        code: cols[0]?.innerText?.trim() || '-',
                        name: cols[1]?.innerText?.trim() || 'Subject',
                        theory: cols[2]?.innerText?.trim() || '0',
                        grade: cols[cols.length - 2]?.innerText?.trim() || '-',
                        credit: cols[cols.length - 1]?.innerText?.trim() || '-'
                    });
                }
            });
        }

        // SGPA
        let sgpa = 'N/A';
        const sgpaEl = Array.from(document.querySelectorAll('span, td')).find(el => el.innerText.includes('SGPA'));
        if (sgpaEl) {
            // Extract number from text "SGPA: 8.5"
            const match = sgpaEl.innerText.match(/[0-9.]+/);
            if (match) sgpa = match[0];
            else if (sgpaEl.nextElementSibling) sgpa = sgpaEl.nextElementSibling.innerText;
        } else {
            sgpa = getText('#ContentPlaceHolder1_Label_SGPA');
        }

        return {
            studentInfo: { name, regNo: r, course: 'B.Tech', semester: s, branch: 'N/A' },
            subjects,
            sgpa,
            result: 'PASS' // Simplified
        };

    }, regNo, semester);
}

module.exports = { fetchResult };
