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
  }

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);