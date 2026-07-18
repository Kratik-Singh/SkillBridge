const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  scholarNumber: {
    type: String,
    unique: true
  },

  password: {
    type: String
  },

  googleId: {
    type: String
  },

  semester: {
    type: String
  },

  profilePicture: {
    type: String
  },

  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },

  lastVisit: {
  type: Date
},

lastActiveXP: {
  type: Date
},

xp: {
  type: Number,
  default: 0
},

streak: {
  type: Number,
  default: 0
},

totalMinutes: {
  type: Number,
  default: 0
},

// Minutes of active time per calendar day, keyed "YYYY-MM-DD".
// Powers the Weekly Activity chart on the dashboard.
dailyActivity: {
  type: Map,
  of: Number,
  default: {}
},

// Per-topic status ("not-started" | "in-progress" | "completed")
// keyed by topic id. Powers the Track Progress pages + the
// Skill Progress bars on the dashboard.
dsaProgress: {
  type: Map,
  of: String,
  default: {}
},

webdevProgress: {
  type: Map,
  of: String,
  default: {}
}

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);