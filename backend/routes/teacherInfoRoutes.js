const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getTeacherInfo } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacher_id = req.user.userId;
    if (isNaN(teacher_id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const teacher = await getTeacherInfo(teacher_id); 

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, teacher: teacher });  // kahini here
  } catch (err) {
    console.error('User details fetch error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
