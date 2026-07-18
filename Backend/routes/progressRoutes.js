const express = require("express");
const router = express.Router();

const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

const TRACKS = ["dsa", "webdev"];

const VALID_STATUSES = ["not-started", "in-progress", "completed"];

// Keep this in sync with the topic lists rendered on
// dsa-progress.html / webdev-progress.html
const TRACK_TOPIC_COUNT = {
  dsa: 10,
  webdev: 10
};

function fieldFor(track) {
  return track === "dsa" ? "dsaProgress" : "webdevProgress";
}

/* ---------------- GET PROGRESS FOR ONE TRACK ---------------- */

router.get("/summary/all", auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    function pct(map, total) {
      if (!map || map.size === 0) return 0;
      let score = 0;
      map.forEach(status => {
        if (status === "completed") score += 1;
        else if (status === "in-progress") score += 0.5;
      });
      return Math.round((score / total) * 100);
    }

    res.json({
      dsa: pct(user.dsaProgress, TRACK_TOPIC_COUNT.dsa),
      webdev: pct(user.webdevProgress, TRACK_TOPIC_COUNT.webdev)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

router.get("/:track", auth, async (req, res) => {

  try {

    const { track } = req.params;

    if (!TRACKS.includes(track)) {
      return res.status(400).json({ message: "Invalid track" });
    }

    const user = await User.findById(req.user.id);
    const field = fieldFor(track);

    const progress = Object.fromEntries(user[field] || new Map());

    res.json({ progress });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

/* ---------------- UPDATE ONE TOPIC ---------------- */

router.post("/:track", auth, async (req, res) => {

  try {

    const { track } = req.params;
    const { topic, status } = req.body;

    if (!TRACKS.includes(track)) {
      return res.status(400).json({ message: "Invalid track" });
    }

    if (!topic || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid topic or status" });
    }

    const user = await User.findById(req.user.id);
    const field = fieldFor(track);

    if (!user[field]) user[field] = new Map();
    user[field].set(topic, status);

    await user.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

module.exports = router;
