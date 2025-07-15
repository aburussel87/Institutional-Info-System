const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_course_info_by_teacher } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const courses = await get_course_info_by_teacher(uid); 
    if (!courses) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log("All Users Requested by :" + uid);
    res.json({ success: true, courses , });
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
