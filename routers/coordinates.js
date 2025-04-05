const express = require("express");
const router = express.Router();
const checkAuth = require("../utils/middleware.js");

router.get("/location", checkAuth, (req, res) => {
    res.render("location.ejs", {
      user: req.session.user || null
    });
  });

router.post("/coordinates", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
      throw new Error("Invalid coordinates.");
    }
    res.redirect(`/soilapi?lat=${lat}&lng=${lng}`);
  } catch (err) {
    console.error("❌ /coordinates error:", err);
    res.status(400).send("Invalid coordinates submitted.");
  }
});

module.exports = router;
