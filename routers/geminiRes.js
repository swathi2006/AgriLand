const express = require("express");
const router = express.Router();

// POST route to render gemini.ejs with soil data
router.post("/geminires", async (req, res) => {
  try {
    const { data, landCover, temperature, precipitation, soilMoisture, elevation, slope, ndvi } = req.body;
    console.log("geminires",landCover,temperature,precipitation,soilMoisture,elevation,slope,ndvi);
    const soilData = JSON.parse(data);
    res.render("gemini.ejs", {
      soilData,
      landCover,
      temperature,
      precipitation,
      soilMoisture,
      elevation,
      slope,
      ndvi,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("❌ Error parsing JSON data:", error);
    if (!res.headersSent) {
      return res.status(500).render("error.ejs", { message: "Error processing soil data." });
    }
  }
});

// app.get("/geminires",(req,res)=>{});


module.exports = router;
