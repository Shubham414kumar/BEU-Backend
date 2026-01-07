const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContentWithFallback(prompt) {
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "models/gemini-1.5-flash",
        "gemini-pro",
        "models/gemini-pro",
        "gemini-1.0-pro"
    ];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`Model ${modelName} failed: ${error.message}`);
            lastError = error;
        }
    }
    throw lastError;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const text = await generateContentWithFallback(message);
        res.json({ response: text });
    } catch (error) {
        console.error('All AI models failed:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// POST /api/ai/quiz
router.post('/quiz', async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic is required' });

        // Prompt Engineering for JSON output
        const prompt = `Generate a quiz about "${topic}" with 5 questions. 
        Output ONLY valid JSON array with this structure:
        [
            {
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correctIndex": 0 // 0-3 index of correct option
            }
        ]
        Do not include markdown formatting like \`\`\`json. Just the raw JSON array.`;

        let text = await generateContentWithFallback(prompt);

        // Cleanup if model returns markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const quiz = JSON.parse(text);
        res.json({ quiz });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

module.exports = router;
