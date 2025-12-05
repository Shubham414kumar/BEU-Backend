const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');

// GET /api/notices
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('notices')
            .orderBy('date', 'desc')
            .limit(20)
            .get();

        if (snapshot.empty) {
            // Return mock data if empty
            return res.json([
                {
                    id: 'mock1',
                    title: 'Exam Schedule Released',
                    body: 'The end semester examination schedule for 3rd semester has been released.',
                    date: new Date(),
                    category: 'exam'
                },
                {
                    id: 'mock2',
                    title: 'Holiday Notice',
                    body: 'College will remain closed on 15th August.',
                    date: new Date(Date.now() - 86400000),
                    category: 'holiday'
                }
            ]);
        }

        const notices = [];
        snapshot.forEach(doc => {
            notices.push({ id: doc.id, ...doc.data() });
        });

        res.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/notices (Admin only)
router.post('/', async (req, res) => {
    try {
        const { title, body, category } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newNotice = {
            title,
            body,
            category: category || 'general',
            date: new Date()
        };

        const docRef = await db.collection('notices').add(newNotice);
        res.status(201).json({ id: docRef.id, ...newNotice });
    } catch (error) {
        console.error('Error creating notice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
