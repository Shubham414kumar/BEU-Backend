const puppeteer = require('puppeteer');

// This function would ideally launch a browser, navigate to the BEU website,
// enter the registration number, and scrape the table.
// Due to the complexity of maintaining a live scraper without the exact URL/DOM,
// we are simulating the delay and returning realistic structure data.

const fetchResult = async (regNo) => {
    console.log(`[Scraper] Fetching result for Reg No: ${regNo}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock Data Generation based on Reg No
    // In a real scenario, this would be extracted from page.evaluate()
    const subjects = [
        { code: '100301', name: 'Engineering Mathematics-III', theory: 55, sessional: 18, practical: 0, total: 73, grade: 'A', credit: 4 },
        { code: '100302', name: 'Object Oriented Programming', theory: 48, sessional: 19, practical: 22, total: 89, grade: 'A+', credit: 5 },
        { code: '100303', name: 'Digital Electronics', theory: 42, sessional: 17, practical: 20, total: 79, grade: 'A', credit: 4 },
        { code: '100304', name: 'Data Structures', theory: 58, sessional: 19, practical: 23, total: 100, grade: 'O', credit: 5 },
        { code: '100305', name: 'Technical Writing', theory: 35, sessional: 15, practical: 0, total: 50, grade: 'B', credit: 3 },
    ];

    // Calculate SGPA
    let totalCreditPoints = 0;
    let totalCredits = 0;

    const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };

    subjects.forEach(sub => {
        const gp = gradePoints[sub.grade] || 0;
        totalCreditPoints += gp * sub.credit;
        totalCredits += sub.credit;
    });

    const sgpa = (totalCreditPoints / totalCredits).toFixed(2);

    return {
        studentInfo: {
            name: 'Shubham Kumar', // Mock name
            regNo: regNo,
            college: 'BCE Bhagalpur',
            course: 'B.Tech',
            branch: 'CSE',
            semester: '3rd'
        },
        subjects,
        sgpa,
        result: 'PASS'
    };
};

module.exports = { fetchResult };
