require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

require("./config/passport");

/* ROUTES */
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const xpRoutes = require("./routes/xpRoutes");
const progressRoutes = require("./routes/progressRoutes");

/* ------------ MIDDLEWARE ------------ */

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

const path = require("path");

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/* ------------ DATABASE ------------ */

if (process.env.NODE_ENV !== "production") {
    console.log("Connecting to MongoDB...");
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });

/* ------------ ROUTES ------------ */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/progress", progressRoutes);

/* ------------ SERVER ------------ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});