const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");

// GET ALL USERS
router.get("/users",
   authMiddleware,
   adminMiddleware,
   async (req,res)=>{
      const users = await User.find();
      res.json(users);
});

module.exports = router;
