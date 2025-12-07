const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized with serviceAccountKey.json');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Parse JSON from Env Var
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized from FIREBASE_SERVICE_ACCOUNT env var');
    } else {
        // Fallback to environment variables (GOOGLE_APPLICATION_CREDENTIALS)
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('Firebase Admin Initialized with Default Credentials');
    }
} catch (error) {
    console.error('Firebase Admin Initialization Failed:', error.message);
    console.log('Please ensure you have a valid serviceAccountKey.json or environment variables set.');
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
