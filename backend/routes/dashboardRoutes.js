const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfo,getStudentRoutine,getTeacherRoutine ,getEnrolledCourse, getTeacherInfo} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();




router.get('/student', authenticateToken, async (req, res) => {
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
    console.log("Dashboard Info Request by :" + uid);
    res.json({ success: true, user , routine,courses: enrolledCourses });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/teacher', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const user = await getUserInfo(uid); 

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role !== 'Teacher') {
      return res.status(403).json({ success: false, error: 'User is not a teacher' });
    }

    const result = await getTeacherInfo(uid);
    if (!result || !result.get_teacher_info) { 
      return res.status(404).json({ success: false, error: 'Teacher info not found or malformed.' });
    }

    const teacherInfo = result.get_teacher_info; 

    console.log("Dashboard Info Request by Teacher:", uid);
    res.json({ success: true, teacher: teacherInfo }); 

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



module.exports = router;
