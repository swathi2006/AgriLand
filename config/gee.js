const { GoogleAuth } = require("google-auth-library");
const ee = require("@google/earthengine");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const geeKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const geeCredentials = JSON.parse(fs.readFileSync(geeKeyPath, "utf8"));

const auth = new GoogleAuth({
  credentials: geeCredentials,
  scopes: ["https://www.googleapis.com/auth/earthengine"],
});

async function initializeGEE() {
  try {
    console.log("🔍 Initializing Google Earth Engine...");

    await auth.getClient();
    console.log("✅ Google Auth Client Obtained.");

    ee.data.authenticateViaPrivateKey(geeCredentials, () => {
      console.log("✅ Earth Engine Authenticated");

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
