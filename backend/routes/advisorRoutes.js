const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_advisor_data,getRegistrationCourse, get_all_failed_courses, get_eligible_missed_courses} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();
const client = require('../config/db')


router.get('/get', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const students = await get_advisor_data(uid); 
    if (!students) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log("Advisor info Requested by :" + uid);
    res.json({ success: true, students:students.get_advised_students});
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



router.get('/registration/:student_id', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;
    const id = parseInt(student_id);
    console.log("registration requested for: ", id);

    const registrationCourses = await getRegistrationCourse(id);
    if (!registrationCourses || registrationCourses.length === 0) {
      return res.status(404).json({ success: false, msg: 'No courses found for the given semester and department' });
    }

    const failed = await get_all_failed_courses(id);
    const missed_courses = await get_eligible_missed_courses(id);

    const approved = await client.query(
      `SELECT e.course_id, u.username as approved_by
       FROM enrollment e
       JOIN "User" u ON u.user_id = e.approved_by::integer
       WHERE e.student_id = $1 
       AND e.semester = (SELECT current_semester FROM student WHERE student_id = $2)
       AND approved_by IS NOT NULL`,
      [id, id]
    );

    const pending = await client.query(
      `SELECT course_id,academic_session
       FROM enrollment 
       WHERE student_id = $1 
       AND semester = (SELECT current_semester FROM student WHERE student_id = $2) 
       AND approved_by IS NULL`,
      [id, id]
    );

    res.json({
      success: true,
      courses: registrationCourses,
      approved: approved.rows,
      pending: pending.rows,
      failed: failed,
      missed: missed_courses
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/approve', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, academic_session } = req.body;
    const advisor_id = req.user.userId; 
console.log(student_id,course_id,academic_session);
    if (!student_id || !course_id || !academic_session) {
      return res.status(400).json({ success: false, error: 'Missing student_id or course_id' });
    }
    
    const updateQuery = `
      UPDATE enrollment
      SET approved_by = $1
      WHERE student_id = $2 AND course_id = $3 and academic_session = $4
      RETURNING *;
    `;

    const result = await client.query(updateQuery, [advisor_id, student_id, course_id, academic_session]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Enrollment record not found' });
    }

    res.json({ success: true, msg: 'Course approved successfully' });
  } catch (err) {
    console.error('Error approving course:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



module.exports = router;
