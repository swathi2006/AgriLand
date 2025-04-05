const express = require("express");
const router = express.Router();
const buildPrompt = require("../public/js/buildPrompt"); // Adjust path if needed
require("dotenv").config();

// Existing /geminires POST route goes here if not already present

// New POST route to render gemini_detail page
router.post("/geminidetail", async (req, res) => {
  const {
    index,
    soildata,
    landCover,
    ndvi,
    temperature,
    soilMoisture,
    elevation,
    slope,
    precipitation
  } = req.body;
  console.log("geminidetail", index ,soildata, landCover, ndvi,temperature, soilMoisture, elevation, slope,precipitation);

  const soilData = JSON.parse(soildata);
  const promptObj = buildPrompt(parseInt(index), {
    soilData,
    landCover,
    ndvi,
    temperature,
    soilMoisture,
    elevation,
    slope,
    precipitation
  });

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptObj.text }] }]
        })
      }
    );
    console.log("🔍 Final Prompt Sent to Gemini:\n", promptObj.text);

    const resultJson = await geminiResponse.json();
    const result = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response received.";

    res.render("gemini_detail", {
      title: promptObj.title,
      response: result
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.render("gemini_detail", {
      title: promptObj.title,
      response: "❌ Gemini API failed. Try again later.\n\n💡 Tip: Use organic compost, drip irrigation, and suitable crops."
    });
  }
});

module.exports = router;
