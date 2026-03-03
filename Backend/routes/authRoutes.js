const express = require("express");
const router = express.Router();

const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, "uploads/");
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ---------------- SIGNUP ---------------- */

router.post("/signup", upload.single("profilePicture"), async (req,res)=>{
  try {
    const { scholarNumber, name, email, password, semester } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ scholarNumber }, { email }]
    });

    if(existingUser){
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    // 3️⃣ Create user
    const newUser = new User({
      scholarNumber,
      name,
      email,
      password: hashedPassword,
      semester,
      profilePicture: req.file ? req.file.filename : null,
    });

    await newUser.save();

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message:"User created successfully",
      token
    });

  } catch(err){
    console.error(err);
    res.status(500).json({message:"Signup failed"});
  }
});

/* ---------------- LOGIN ---------------- */

router.post("/login", async (req,res)=>{
  try {
    const { scholarNumber, password, remember } = req.body;

    const user = await User.findOne({ scholarNumber });
    if(!user) return res.status(400).json({message:"Invalid credentials"});

    const valid = await bcrypt.compare(password,user.password);
    if(!valid) return res.status(400).json({message:"Invalid password"});

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: remember ? "7d" : "1h" }
    );

    res.json({ token });

  } catch(err){
    res.status(500).json({message:"Login failed"});
  }
});

/* ---------------- DASHBOARD ---------------- */

router.get("/me", authMiddleware, async (req,res)=>{
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

/* ---------------- FORGOT PASSWORD ---------------- */

router.post("/forgot-password", async (req,res)=>{
  const { email } = req.body;

  const user = await User.findOne({ email });
  if(!user) return res.json({ message:"User not found" });

  const resetToken = jwt.sign(
    { id:user._id },
    process.env.JWT_SECRET,
    { expiresIn:"15m" }
  );

  const resetLink = process.env.CLIENT_URL + "/reset.html?token=" + resetToken;

  res.json({ message:"Reset link generated (email sending optional)", resetLink });
});

/* ---------------- RESET PASSWORD ---------------- */

router.post("/reset-password", async (req,res)=>{
  const { token, newPassword } = req.body;

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashed = await bcrypt.hash(newPassword,10);

    await User.findByIdAndUpdate(decoded.id,{
      password: hashed
    });

    res.json({ message:"Password updated successfully" });

  }catch(err){
    res.json({ message:"Invalid or expired token" });
  }
});

/* ---------------- GOOGLE LOGIN ---------------- */

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(process.env.CLIENT_URL + "/dashboard.html?token=" + token);
  }
);

module.exports = router;