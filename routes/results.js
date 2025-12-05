const express = require('express');
const router = express.Router();
const { fetchResult } = require('../utils/resultScraper');
const { db } = require('../firebaseConfig');

// GET /api/results/:regNo
router.get('/:regNo', async (req, res) => {
    try {
        const { regNo } = req.params;

        // 1. Check Cache in Firestore
        const resultRef = db.collection('results').doc(regNo);
        const doc = await resultRef.get();

        if (doc.exists) {
            console.log('Serving result from Cache');
            return res.json(doc.data());
        }

        // 2. If not in cache, Scrape
        const resultData = await fetchResult(regNo);

        // 3. Save to Cache
        await resultRef.set({
            ...resultData,
            lastUpdated: new Date()
        });

        res.json(resultData);
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ error: 'Failed to fetch result' });
    }
});

module.exports = router;
