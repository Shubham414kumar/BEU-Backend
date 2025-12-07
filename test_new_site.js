const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    console.log('Navigating to New Result Site...');
    try {
        await page.goto('https://beu-bih.ac.in/result-one', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Waiting for content...');
        // The screenshot shows a table. Let's wait for 'B.Tech' text.
        console.log('Waiting for content...');
        await page.waitForSelector('table', { timeout: 10000 });

        console.log('Clicking Row...');
        const result = await page.evaluate(async () => {
            // Target the 3rd Semester text specifically
            // Use querySelectorAll and find the one with matching text
            const elements = Array.from(document.querySelectorAll('td'));
            const target = elements.find(el => el.innerText.includes('B.Tech. 3rd Semester Examination, 2024'));

            if (target) {
                target.click(); // Try clicking TD
                return "Clicked TD";
            }
            return "Not Found";
        });

        console.log('Click Action:', result);

        // Wait for navigation
        await new Promise(r => setTimeout(r, 5000));
        console.log('Current URL:', page.url());

        console.log('Current URL:', page.url());

        // Dump inputs on the new page
        const inputs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('input, button')).map(el => ({
                tag: el.tagName,
                type: el.type,
                name: el.name,
                id: el.id,
                placeholder: el.placeholder,
                value: el.value,
                className: el.className
            }));
        });
        console.log('Inputs found:', JSON.stringify(inputs, null, 2));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
