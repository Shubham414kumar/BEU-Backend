const puppeteer = require('puppeteer');
const { fetchResult } = require('./utils/resultScraper'); // We'll verify the actual function

const REG_NO = '23105142022'; // User's RegNo
const SEMESTER = '3rd';

async function runDebug() {
    console.log(`[DEBUG] Starting Test for ${REG_NO} - ${SEMESTER}`);
    try {
        const data = await fetchResult(REG_NO, SEMESTER);
        console.log('[DEBUG] SUCCESS!');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('[DEBUG] FAILED with error:', error);
        require('fs').writeFileSync('error.json', JSON.stringify({ message: error.message, stack: error.stack }));
    }
}

runDebug();
