const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfo,getStudentRoutine,getTeacherRoutine ,getEnrolledCourse} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const user = await getUserInfo(uid); 
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let routine = [];
    let enrolledCourses = [];
    if(user.role == 'Student'){
      routine = await getStudentRoutine(user.user_id);
      enrolledCourses = await getEnrolledCourse(user.user_id);
    }else if(user.role == 'Teacher'){
      routine = await getTeacherRoutine(user.user_id);
    } 
    console.log("Request by :" + uid);
    res.json({ success: true, user , routine,courses: enrolledCourses });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
