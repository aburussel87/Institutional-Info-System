const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_students_by_provost } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const students = await get_students_by_provost(uid); 
    if (!students) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log("All Users Requested by :" + uid);
    res.json({ success: true, students , });
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
