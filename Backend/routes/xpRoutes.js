const express = require("express");
const router = express.Router();

const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

/* ---------- Helper Functions ---------- */

// Check if two dates are same day
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Get day difference
function getDayDiff(d1, d2) {
  return Math.floor(
    (d1 - d2) / (1000 * 60 * 60 * 24)
  );
}

/* ---------- DAILY VISIT (SAFE) ---------- */

router.post("/visit", auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    const today = new Date();
    const lastVisit = user.lastVisit;

    // 🚫 Already visited today
    if (lastVisit && isSameDay(today, lastVisit)) {

      return res.json({
        message: "Already visited today",
        streak: user.streak || 0,
        xp: user.xp || 0,
        reward: 0
      });

    }

    // First visit ever
    if (!lastVisit) {

      user.streak = 1;

    } else {

      const diff = getDayDiff(today, lastVisit);

      if (diff === 1) {

        // Continue streak
        user.streak += 1;

      } else if (diff > 1) {

        // Missed day → reset
        user.streak = 1;

      }

    }

    user.lastVisit = today;

    /* XP reward logic */

    let reward = 10;

    if (user.streak >= 75) reward = 200;
    else if (user.streak >= 50) reward = 120;
    else if (user.streak >= 25) reward = 70;
    else if (user.streak >= 5) reward = 30;

    user.xp += reward;

    await user.save();

    res.json({
      message: "Daily reward claimed",
      streak: user.streak,
      xp: user.xp,
      reward
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


/* ---------- ACTIVE TIME XP (ANTI-SPAM) ---------- */

router.post("/active", auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    const now = new Date();

    // Prevent rapid XP farming
    if (user.lastActiveXP) {

      const diffSeconds =
        (now - user.lastActiveXP) / 1000;

      // Allow only every 60 seconds
      if (diffSeconds < 60) {

        return res.json({
          message: "XP cooldown active",
          xp: user.xp
        });

      }

    }

    user.totalMinutes += 1;

    const xpEarned = 2;

    user.xp += xpEarned;

    user.lastActiveXP = now;

    await user.save();

    res.json({
      message: "Active XP added",
      xp: user.xp
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


/* ---------- GET USER XP ---------- */

router.get("/me", auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    res.json({
      xp: user.xp || 0,
      streak: user.streak || 0,
      totalMinutes: user.totalMinutes || 0
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


/* ---------- LEADERBOARD ---------- */

router.get("/leaderboard", auth, async (req, res) => {

  try {

    // Top 10 users
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select("name xp profilePicture");

    // Find current rank
    const allUsers = await User.find()
      .sort({ xp: -1 })
      .select("_id");

    const rank =
      allUsers.findIndex(
        u => u._id.toString() === req.user.id
      ) + 1;

    res.json({
      leaderboard: users,
      myRank: rank
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;