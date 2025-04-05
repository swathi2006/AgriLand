// routes/soilapi.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const getLandCover = require("../modules/landCover");
const getNDVI = require("../modules/ndvi");
const getTemperature = require("../modules/temperature");
const getSoilMoisture = require("../modules/soilMoisture");
const getElevation = require("../modules/elevation");
const getSlope = require("../modules/slope");
const getPrecipitation = require("../modules/precipitation");
require("dotenv").config();

router.get("/soilapi", async (req, res) => {
  const { lat, lng } = req.query;
  const user = req.session.user;
  if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
    return res.status(400).send("Invalid coordinates.");
  }
  if (!user) return res.redirect("/login");

  try {
    const userRef = db.collection("users").doc(user.uid);
    await userRef.collection("coordinates").add({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const snapshot = await userRef.collection("coordinates")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) return res.status(404).send("No coordinates found.");

    const { latitude, longitude } = snapshot.docs[0].data();

    async function safeFetch(fn, lat, lng, name) {
      try {
        return await fn(lat, lng);
      } catch (e) {
        console.warn(`⚠️ Failed to fetch ${name}:`, e.message);
        return "Unavailable";
      }
    }

    const [landCover, ndvi, temperature, soilMoisture, elevation, slope, precipitation] = await Promise.all([
      safeFetch(getLandCover, latitude, longitude, "Land Cover"),
      safeFetch(getNDVI, latitude, longitude, "NDVI"),
      safeFetch(getTemperature, latitude, longitude, "Temperature"),
      safeFetch(getSoilMoisture, latitude, longitude, "Soil Moisture"),
      safeFetch(getElevation, latitude, longitude, "Elevation"),
      safeFetch(getSlope, latitude, longitude, "Slope"),
      safeFetch(getPrecipitation, latitude, longitude, "Precipitation")
    ]);

    console.log(landCover,ndvi,temperature,soilMoisture,elevation,slope,precipitation);

    // let landCoverStatus = "Possibly Barren";
    // if (landCover.includes("Water") || landCover.includes("💧")) landCoverStatus = "Water Body";
    // else if (/(Bare|Sparse|Barren|🏜)/.test(landCover)) landCoverStatus = "Sparse Vegetation / Barren";
    // else if (/(Rock|Hills|Slope)/.test(landCover) || elevation > 1200 || slope > 20) landCoverStatus = "Hilly / Rocky Terrain";
    // else if (/(Crop|Vegetation|Grass|Forest)/.test(landCover) || ndvi > 0.3) landCoverStatus = "Fertile"; // <- ✅ add NDVI fallback
    // console.log("ndvi",ndvi);

    const classification = {
      landCoverStatus : landCover,
      ndviStatus :
      ndvi > 0.4 ? "High Fertility" :
      ndvi > 0.2 ? "Moderately Fertile" :"Barren",
    
      soilMoistureStatus: soilMoisture > 0.2 ? "Fertile" : "Dry/Barren",
      temperatureStatus: temperature > 10 && temperature < 35 ? "Optimal" : "Harsh",
      elevationStatus: elevation <= 1000 ? "Good" : "Highland",
      slopeStatus: slope < 15 ? "Flat" : "Steep",
      precipitationStatus: precipitation > 1.5 ? "Adequate Rainfall" : "Low Rainfall"
    };
    console.log(classification);
    

    const fertileFactors = Object.values(classification).filter(val =>
      ["Fertile", "Optimal", "Good", "Flat", "Adequate Rainfall"].includes(val)
    ).length;

    classification.overall = fertileFactors >= 5
      ? "Likely Fertile Land ✅"
      : "Needs Soil Improvement 🛠️";

    await userRef.collection("landdata").add({
      latitude,
      longitude,
      classification,
      rawData: { landCover, ndvi, soilMoisture, temperature, elevation, slope, precipitation },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.render("soilgrids.ejs", {
      landCover, ndvi, temperature, soilMoisture, elevation, slope, precipitation,
      lat, lng, user,
      WT_API_KEY: process.env.WEATHER_KEY
    });

  } catch (err) {
    console.error("❌ Error in /soilapi route:", err);
    if (!res.headersSent) {
      res.status(500).render("error.ejs", {
        message: "Error retrieving land data. Please try again."
      });
    }
  }
});

module.exports = router;
