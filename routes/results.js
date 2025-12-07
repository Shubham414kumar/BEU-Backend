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
            const data = doc.data();
            // If semester requested, ensure cache matches
            // Normalize: '3rd' vs '3'
            const cachedSem = data.studentInfo?.semester || '';
            const reqSem = semester || '';

            // Simple inclusion check or exact match
            if (!reqSem || cachedSem.includes(reqSem) || reqSem.includes(cachedSem)) {
                console.log('Serving result from Cache');
                return res.json(data);
            }
            console.log(`Cache mismatch (Req: ${reqSem}, Cached: ${cachedSem}). Re-fetching.`);
        }

        const { semester } = req.query;
        // 2. If not in cache, Scrape
        const resultData = await fetchResult(regNo, semester || '1st'); // Default to 1st if missing, but UI enforces it

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
