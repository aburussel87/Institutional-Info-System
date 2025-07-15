const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_student_hall_details } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const uid = req.user.userId;
//     const info = await get_student_hall_details(uid); 
//     if (!info) {
//       return res.status(404).json({ success: false, error: 'User not found' });
//     }
//     console.log("All Users Requested by :" + uid);
//     res.json({ success: true, info , });
//   } catch (err) {
//     console.error('Info error error:', err);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });


router.get('/:studentId', authenticateToken, async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const info = await get_student_hall_details(studentId);
  if (!info) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  console.log("Hall details requested for student ID:", studentId);
  res.json({ success: true, info });
});


module.exports = router;



