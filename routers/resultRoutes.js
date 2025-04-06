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
router.post('/chatbot', async (req, res) => {
  try {
    const { message, soilData } = req.body;
    console.log("/chatbot",soilData);

    const geminiPrompt = `
    I am an agricultural AI model. Here is the soil data I have received:
    - Soil Moisture: 0.3453684802469053
    - Temperature: 28.26457436618199
    - Precipitation: 0.32524096958608506
    - Elevation: 35
    - Slope: 2.0324287144984883
    - NDVI: 0.3484859187581897
    - Land Cover: Built-Up Area 🏙 | Urban/Built-Up 🏙
    
    User question: ${message}
    
   give answer to according to the ${message} and dont use soil data until user question asks to 
   and only send compact responses and only send what prompt ${message} relates 
    `;
    

    
    // Make the request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: geminiPrompt }] }]
        })
      }
    );
    
    const result = await geminiResponse.json();
    const geminiData = result.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response received.";
    
    
    if (geminiResponse.ok) {
      // Return Gemini's response as JSON
      res.json({ reply: geminiData });
    } else {
      res.status(500).json({ error: 'Error from Gemini API', details: geminiData });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;


