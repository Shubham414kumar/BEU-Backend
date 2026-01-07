
const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("No API Key found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name}`);
                        }
                    });
                } else {
                    console.log("No models found in response:", json);
                }
            }
        } catch (e) {
            console.error("Parse Error:", e);
            console.log("Raw Response:", data);
        }
    });
}).on('error', (e) => {
    console.error("Network Error:", e);
});
