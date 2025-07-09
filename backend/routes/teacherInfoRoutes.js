const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getTeacherInfo } = require('../config/query');
const { authenticateToken } = require('../utils');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacher_id = req.user.userId;
    console.log('Received teacher_id:', teacher_id); 
    const numericTeacherId = parseInt(teacher_id, 10);
    if (isNaN(numericTeacherId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format.' });
    }

    const result = await getTeacherInfo(numericTeacherId); 

    if (!result || !result.get_teacher_info) {
      return res.status(404).json({ success: false, error: 'Teacher not found or data structure is incorrect.' });
    }
    const teacher = result.get_teacher_info;

    console.log('Processed teacher info sent to frontend:', teacher); 
    res.json({ success: true, teacher: teacher });
  } catch (err) {
    console.error('User details fetch error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;