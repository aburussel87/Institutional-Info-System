const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getStudentInfo } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.post('/', authenticateToken, async (req, res) => {
  try {
    const student_id = req.user.userId;
    console.log(student_id);
    if (isNaN(student_id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const student = await getStudentInfo(student_id); 

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, Student: student });
  } catch (err) {
    console.error('User details fetch error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
