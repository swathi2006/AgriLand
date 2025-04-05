const express=require("express");
const app=express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
require("dotenv").config(); 
const checkAuth  =require("./utils/middleware.js");
const Error = require("./utils/ExpressError.js");
const fs = require("fs"); 
const port=2006;

require("dotenv").config();
const { admin, db } = require("./config/firebase");
const { ee, initializeGEE } = require("./config/gee");
initializeGEE();

//to store session 
const FirestoreStore = require("./utils/FirestoreStore");

const coordinatesRoutes = require("./routers/coordinates");
const soilapiRoute = require("./routers/soilapi.js");
const geminiRes = require("./routers/geminiRes.js");
const geminiDetail = require("./routers/geminidetail.js");
const authRoutes = require("./routers/auth");
const resultRoutes = require("./routers/resultRoutes.js");



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname,"public/js")))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
// Express Session Setup 
app.use(session({
  store: new FirestoreStore({ database: db, collection: "sessions" }),
  secret: process.env.SESSION_SECRET || "mysecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.get("/", (req, res) => {
  res.render("home.ejs", {
    user: req.session.user || null,
    alert: req.query.alert || 0
  });
});

app.use("/", coordinatesRoutes);
app.use("/",soilapiRoute);
app.use("/",geminiRes);
app.use("/",geminiDetail);
app.use("/", authRoutes);
app.use("/", resultRoutes);


app.listen(port,()=>{
  console.log(`listening on port ${port}`); 
});

