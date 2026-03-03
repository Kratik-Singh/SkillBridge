require("dotenv").config();

const express = require("express");
const appl = express();
appl.use(express.json());
appl.use("/uploads", express.static("uploads"));

const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* ------------ MIDDLEWARE ------------ */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5500",
    "https://skillbridge-smoky.vercel.app/"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/* ------------ DATABASE ------------ */
console.log("MONGO_URI VALUE ->", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ------------ ROUTES ------------ */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

/* ------------ SERVER ------------ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
