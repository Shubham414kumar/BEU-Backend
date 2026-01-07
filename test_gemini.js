
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const key = process.env.GEMINI_API_KEY || "";
    console.log("API Key length:", key.length);
    console.log("API Key start:", key.substring(0, 5));

    const genAI = new GoogleGenerativeAI(key);

    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS with ${modelName}! Response:`, result.response.text());
            return; // Exit on first success
        } catch (error) {
            console.error(`FAILED with ${modelName}: ${error.message} (Status: ${error.status || 'unknown'})`);
        }
    }
}

test();
