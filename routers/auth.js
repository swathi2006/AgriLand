const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

const settings = { timestampsInSnapshots: true };
db.settings(settings);

router.get("/signup",(req,res) => {
  res.render("signup.ejs");
});
// POST route to store user after signup
router.post("/signup", async (req, res) => {
  const { uid, name, email } = req.body;
  try {
    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date()
    });
    res.json({ status: "User saved in Firestore" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving user" });
  }
});

// GET login page
router.get("/login", (req, res) => {
  res.render("login", { alert: req.query.alert });
});

// POST route to verify login using Firebase ID token
router.post("/login", async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.session.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    await req.session.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Login failed:", err);
    res.json({ success: false, error: "no user found" });
  }
});



router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Logout failed!");
      }
      res.redirect('/?alert=1');
    });
  });
module.exports = router;
