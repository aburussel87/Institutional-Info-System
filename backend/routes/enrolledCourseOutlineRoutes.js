const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfo,getEnrolledCourseOutline } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const user = await getUserInfo(uid); 
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const result = await getEnrolledCourseOutline(uid);
    console.log("Requested Course Outlines by :" + uid);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
