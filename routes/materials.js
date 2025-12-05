const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');

// GET /api/materials
// Query params: branch, semester, subject, type
router.get('/', async (req, res) => {
    try {
        const { branch, semester, subject, type } = req.query;

        let query = db.collection('materials');

        if (branch) query = query.where('branch', '==', branch);
        if (semester) query = query.where('semester', '==', semester);
        if (subject) query = query.where('subject', '==', subject);
        if (type) query = query.where('type', '==', type);

        const snapshot = await query.get();

        if (snapshot.empty) {
            // Return mock data if DB is empty for testing
            return res.json([
                {
                    id: 'mock1',
                    title: 'Engineering Mathematics I - Notes',
                    subject: 'Mathematics',
                    type: 'note',
                    branch: 'CSE',
                    semester: '1',
                    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    uploadedBy: 'admin',
                    timestamp: new Date()
                },
                {
                    id: 'mock2',
                    title: '2023 PYQ - Physics',
                    subject: 'Physics',
                    type: 'pyq',
                    branch: 'CSE',
                    semester: '1',
                    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    uploadedBy: 'admin',
                    timestamp: new Date()
                }
            ]);
        }

        const materials = [];
        snapshot.forEach(doc => {
            materials.push({ id: doc.id, ...doc.data() });
        });

        res.json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/materials
router.post('/', async (req, res) => {
    try {
        const { title, subject, branch, semester, type, fileUrl, uploadedBy } = req.body;

        if (!title || !subject || !branch || !semester || !type || !fileUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newMaterial = {
            title,
            subject,
            branch,
            semester,
            type,
            fileUrl,
            uploadedBy: uploadedBy || 'admin',
            timestamp: new Date()
        };

        const docRef = await db.collection('materials').add(newMaterial);
        res.status(201).json({ id: docRef.id, ...newMaterial });
    } catch (error) {
        console.error('Error adding material:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
