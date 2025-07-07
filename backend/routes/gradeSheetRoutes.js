const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfo,getGradeSheet } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const user = await getUserInfo(uid); 
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const result = await getGradeSheet(uid);
    console.log("Requested gradesheet by :" + uid);
    res.json({ success: true, user ,result,uid});
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
