const express = require("express");
const router = express.Router();

const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

/* -------- VISIT STREAK -------- */

router.post("/visit", auth, async (req,res)=>{

  try{

    const user = await User.findById(req.user.id);

    const today = new Date();
    const last = user.lastVisit;

    if(!last){

      user.streak = 1;

    }else{

      const diff = Math.floor((today - last) / (1000*60*60*24));

      if(diff === 1){
        user.streak += 1;
      }

      if(diff > 1){
        user.streak = 1;
      }

    }

    user.lastVisit = today;

    /* XP reward based on streak */

    let reward = 10;

    if(user.streak >= 75) reward = 200;
    else if(user.streak >= 50) reward = 120;
    else if(user.streak >= 25) reward = 70;
    else if(user.streak >= 5) reward = 30;

    user.xp += reward;

    await user.save();

    res.json({
      streak:user.streak,
      xp:user.xp,
      reward
    });

  }catch(err){
    res.status(500).json({error:err.message});
  }

});


/* -------- ACTIVE TIME XP -------- */

router.post("/active", auth, async (req,res)=>{

  try{

    const user = await User.findById(req.user.id);

    user.totalMinutes += 1;

    const xpEarned = 2;

    user.xp += xpEarned;

    await user.save();

    res.json({
      xp:user.xp
    });

  }catch(err){
    res.status(500).json({error:err.message});
  }

});


/* -------- GET CURRENT XP -------- */

router.get("/me", auth, async (req,res)=>{

  try{

    const user = await User.findById(req.user.id);

    res.json({
      xp: user.xp || 0,
      streak: user.streak || 0,
      totalMinutes: user.totalMinutes || 0
    });

  }catch(err){
    res.status(500).json({error:err.message});
  }

});


module.exports = router;