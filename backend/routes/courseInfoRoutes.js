const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getCourseInfo} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/:course_id', authenticateToken, async (req, res) =>{
  try {
    const { course_id } = req.params;
    const courseInfo = await getCourseInfo(course_id); 
    if (!courseInfo) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    console.log(courseInfo);
    res.json({ success: true, course:courseInfo });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
