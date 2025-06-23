const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getAllUser } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const users = await getAllUser(); 
    if (!users) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log("Request by :" + uid);
    res.json({ success: true, users , });
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
