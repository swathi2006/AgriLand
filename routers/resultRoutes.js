const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const checkAuth = require("../utils/middleware"); // if you're using it

// Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const alert = req.query.alert || 0; 
  res.render("home.ejs", { user: req.session.user, alert });
});

// Save and show result
router.post("/result", async (req, res) => {
  const { soildata, geminires } = req.body;
  try {
    await db.collection("users")
      .doc(req.session.user.uid)
      .collection("landdata")
      .add({
        soilData: soildata,
        roadmap: geminires,
        createdAt: new Date()
      });
  } catch (err) {
    console.error("Error saving soil data:", err);
    return res.status(500).send("Something went wrong.");
  }

  const responses = JSON.parse(geminires);
  res.render("result.ejs", { responses, user: req.session.user || null });
});

// GET result (optional)
router.get("/result", (req, res) => {
  res.redirect("/dashboard"); // or res.render("result.ejs") with data if needed
});

// Mentor page
router.get("/mentor", checkAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("mentors").get();
    const mentors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render("mentor.ejs", { mentors, user: req.session.user || null });
  } catch (err) {
    console.error("Error fetching mentors:", err);
    res.status(500).send("Error loading mentors");
  }
});

// Book mentor (dummy for now)
router.post("/book", async (req, res) => {
  res.render("book",{user: req.session.user || null });
});

module.exports = router;
