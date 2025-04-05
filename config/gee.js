const { GoogleAuth } = require("google-auth-library");
const ee = require("@google/earthengine");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Parse the JSON credentials from the environment variable
const geeCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Use GoogleAuth for authentication
const auth = new GoogleAuth({
  credentials: geeCredentials,
  scopes: ["https://www.googleapis.com/auth/earthengine"],
});

async function initializeGEE() {
  try {
    console.log("🔍 Initializing Google Earth Engine...");

    // Obtain the auth client
    await auth.getClient();
    console.log("✅ Google Auth Client Obtained.");

    // Authenticate with Google Earth Engine
    ee.data.authenticateViaPrivateKey(geeCredentials, () => {
      console.log("✅ Earth Engine Authenticated");

      // Initialize Earth Engine
      ee.initialize(null, null, () => {
        console.log("🌍 Earth Engine Initialized");
      }, (err) => {
        console.error("❌ EE Initialization Error:", err);
      });

    }, (err) => {
      console.error("❌ EE Authentication Error:", err);
    });

  } catch (error) {
    console.error("❌ GEE Auth Error:", error);
  }
}

module.exports = { ee, initializeGEE };
