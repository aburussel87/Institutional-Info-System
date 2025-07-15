const express = require('express');
const { authenticateToken } = require('../utils');
const router = express.Router();
const client = require('../config/db');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    console.log("ADD EXAM REQUEST BY: "+ teacherId);
    const {
      course_id,
      title,
      exam_type,
      total_marks,
      date_of_exam,
      semester,
      academic_session,
      section
    } = req.body;
    console.log(req.body);
    if (!course_id || !title || !exam_type || !total_marks || !date_of_exam || !semester || !academic_session || !section) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await client.query(
      `SELECT add_exam_by_teacher(
        $1, $2, $3, $4::examtype, $5, $6::timestamp, $7::semester, $8, $9
      )`,
      [
        course_id,
        teacherId,
        title,
        exam_type,
        total_marks,
        date_of_exam,
        semester,
        academic_session,
        section
      ]
    );

    res.json({ success: true, message: 'Exam added successfully' });
  } catch (err) {
    console.error('Error adding exam:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
