const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');
const admin = require('firebase-admin');

// GET /api/attendance/:userId
// Fetch all subjects for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('users').doc(userId).collection('attendance_subjects').get();

        const subjects = [];
        snapshot.forEach(doc => {
            subjects.push({ id: doc.id, ...doc.data() });
        });

        res.json(subjects);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/attendance/add
// Add a new subject
router.post('/add', async (req, res) => {
    try {
        const { userId, subjectName } = req.body;

        if (!userId || !subjectName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newSubject = {
            name: subjectName,
            attendedClasses: 0,
            totalClasses: 0,
            lastMarked: null // Timestamp
        };

        const docRef = await db.collection('users').doc(userId).collection('attendance_subjects').add(newSubject);
        res.status(201).json({ id: docRef.id, ...newSubject });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/attendance/mark
// Mark attendance for a subject (Enforce 24h rule)
router.post('/mark', async (req, res) => {
    try {
        const { userId, subjectId } = req.body;

        if (!userId || !subjectId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const subjectRef = db.collection('users').doc(userId).collection('attendance_subjects').doc(subjectId);
        const doc = await subjectRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const data = doc.data();
        const now = new Date();

        // Check 24-hour rule
        if (data.lastMarked) {
            const lastMarkedDate = data.lastMarked.toDate(); // Convert Firestore timestamp
            const diffTime = Math.abs(now - lastMarkedDate);
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

            if (diffHours < 24) {
                return res.status(400).json({ error: `You can only mark attendance once every 24 hours. Try again in ${24 - diffHours} hours.` });
            }
        }

        // Update attendance
        await subjectRef.update({
            attendedClasses: admin.firestore.FieldValue.increment(1),
            totalClasses: admin.firestore.FieldValue.increment(1),
            lastMarked: now
        });

        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
