const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_students_by_provost , get_basic_hall_info_for_provost } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const students = await get_students_by_provost(uid); 
    const basic_details = await get_basic_hall_info_for_provost(uid);
    if (!students || !basic_details) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log("All hall students Requested by :" + uid);
    console.log(basic_details);
    res.json({ success: true, students , basic_details });
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
