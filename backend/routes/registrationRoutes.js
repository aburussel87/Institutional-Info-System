const client = require('../config/db'); 
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getRegistrationCourse } = require('../config/query');
const { authenticateToken } = require('../utils');
const router = express.Router();

router.get('/',authenticateToken,async (req, res) => {
  try {
    const id = req.user.userId;
    const okay = await client.query('SELECT isactive from registration_log where  academic_session = (select academic_session from student where student_id = $1)', [id]);
    if(okay.rows.length === 0 || !okay.rows[0].isactive) {
      return res.json({ success: false, msg: 'Registration period is not Active For You now' });
    }
    const registrationCourses = await getRegistrationCourse(id);
    if (!registrationCourses || registrationCourses.length === 0) {
      return res.status(404).json({ success: false, msg: 'No courses found for the given semester and department' });
    }
    const approved = await client.query('SELECT e.course_id,u.username as approved_by FROM enrollment e JOIN "User" u ON u.user_id = e.approved_by::integer WHERE e.student_id = $1 AND e.semester = (SELECT current_semester FROM student WHERE student_id = $2) and approved_by IS not NULL', [id, id]);
    const pending = await client.query('SELECT course_id FROM enrollment WHERE student_id = $1 AND semester = (SELECT current_semester FROM student WHERE student_id = $2) and approved_by IS NULL', [id, id]);
    res.json({ success: true, courses: registrationCourses, approved: approved.rows, pending: pending.rows });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.post('/submit', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { courses } = req.body;

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ success: false, error: 'No courses provided for submission.' });
  }

  let clientDb;

  try {
    clientDb = await client.connect();
    await clientDb.query('BEGIN');

    const studentRes = await clientDb.query(
      `SELECT current_semester, academic_session, department_id FROM Student WHERE student_id = $1`,
      [userId]
    );
    console.log("Requested Registration by: " + userId);
    if (studentRes.rows.length === 0) {
      await clientDb.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const { current_semester, academic_session, department_id } = studentRes.rows[0];

    const allStudentsRes = await clientDb.query(
      `SELECT student_id
       FROM Student
       WHERE current_semester = $1 AND academic_session = $2 AND department_id = $3
       ORDER BY (student_id % 1000) ASC`,
      [current_semester, academic_session, department_id]
    );

    const sortedStudentIds = allStudentsRes.rows.map(row => row.student_id);
    const userIndex = sortedStudentIds.indexOf(userId);

    if (userIndex === -1) {
      await clientDb.query('ROLLBACK');
      return res.status(500).json({ success: false, error: 'Current student not found in the sorted student list.' });
    }

    for (const course of courses) {
      const { course_id, approved_by } = course;
      const lastDigit = parseInt(course_id.slice(-1), 10);
      const isTheoretical = lastDigit % 2 !== 0;

      let section_type;

      if (isTheoretical) {
        if (userIndex < 40) section_type = 'A';
        else if (userIndex < 80) section_type = 'B';
        else section_type = 'C';
      } else {
        if (userIndex < 20) section_type = 'A1';
        else if (userIndex < 40) section_type = 'A2';
        else if (userIndex < 60) section_type = 'B1';
        else if (userIndex < 80) section_type = 'B2';
        else if (userIndex < 100) section_type = 'C1';
        else section_type = 'C2';
      }

      const insertQuery = `
        INSERT INTO Enrollment (student_id, course_id, semester, enrolled_on, section_type, academic_session)
        VALUES ($1, $2, $3, NOW(), $4, $5)
        ON CONFLICT (student_id, course_id, semester) DO NOTHING
      `;
      await clientDb.query(insertQuery, [userId, course_id, current_semester, section_type, academic_session]);
    }

    await clientDb.query('COMMIT');
    res.status(200).json({ success: true, message: 'Courses enrolled successfully!' });

  } catch (err) {
    if (clientDb) {
      await clientDb.query('ROLLBACK');
    }
    console.error('Course enrollment error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error during course enrollment.' });
  } finally {
    if (clientDb) {
      clientDb.release();
    }
  }
});


module.exports = router;