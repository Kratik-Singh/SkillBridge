const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skillbridge_profiles",
    allowed_formats: ["jpg", "png", "jpeg", "HEIC", "heic"]
  }
});

const upload = multer({
  storage: storage
});

module.exports = upload;