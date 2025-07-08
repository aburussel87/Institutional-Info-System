const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getStudent_exam_Routine,getUserInfo} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();




router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const user = await getUserInfo(uid); 
    console.log("Semester Routine Requested by:"+uid);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let routine = [];
    if(user.role == 'Student'){
      routine = await getStudent_exam_Routine(user.user_id);
    }else if(user.role == 'Teacher'){
      routine = await getTeacherRoutine(user.user_id);
    } 
    res.json({ success: true, user , routine});
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
