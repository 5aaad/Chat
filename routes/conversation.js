const express = require('express');
const Conversation =require('../models/Conversation')
const router = express.Router();
//new conv

router.post("/", async (req, res) => {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //get conv of a user
  
  
  router.get("/:userId", async (req, res) => {
    
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  // get conv includes two userId
  
  router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation)
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.get("/",async function (req, res) {
    try {
     console.log("test")
    const conv = await Conversation.find();
    console.log(conv)
    res.status(200).json({
        success: true,
        data: conv,
    } );
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;