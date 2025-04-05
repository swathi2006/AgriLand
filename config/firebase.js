const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();
const firebaseKey = JSON.parse(process.env.FIREBASE_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
});

const db = admin.firestore();

module.exports = { admin, db };

