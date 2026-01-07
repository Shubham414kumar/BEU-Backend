# BEU Adda Backend

## Setup
1.  Run `npm install`
2.  Set up `serviceAccountKey.json` from Firebase Console -> Project Settings -> Service Accounts.
3.  Set up `.env` with:
    ```
    PORT=5000
    GEMINI_API_KEY=your_key_here
    ```
4.  Run `node server.js`

## Deployment
- **Render/Heroku:** Set `FIREBASE_SERVICE_ACCOUNT` env var with the content of `serviceAccountKey.json`.
