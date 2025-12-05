const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');

// GET /api/posts
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('posts')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/posts
router.post('/', async (req, res) => {
    try {
        const { authorId, authorName, content, collegeId } = req.body;

        if (!authorId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newPost = {
            authorId,
            authorName: authorName || 'Anonymous',
            content,
            collegeId: collegeId || null,
            likes: 0,
            commentsCount: 0,
            timestamp: new Date()
        };

        const docRef = await db.collection('posts').add(newPost);
        res.status(201).json({ id: docRef.id, ...newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/posts/:id/like
router.post('/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const postRef = db.collection('posts').doc(id);

        // Simple increment for now, ideally we track WHO liked to prevent duplicates
        await postRef.update({
            likes: admin.firestore.FieldValue.increment(1)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
