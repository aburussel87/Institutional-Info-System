const express = require('express');
const { add_exam } = require('../config/query');  // Your DB function for inserting exam
const { authenticateToken } = require('../utils');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;  // Make sure your token has this property

    const {
      course_id,
      title,
      exam_type,
      total_marks,
      date_of_exam,
      semester,
      academic_session
    } = req.body;

    // Basic validation (you can extend this)
    if (!course_id || !title || !exam_type || !total_marks || !date_of_exam || !semester || !academic_session) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Call your DB function to insert the exam
    // Assuming your function signature matches these params
    await add_exam({
      course_id,
      teacher_id: teacherId,
      title,
      exam_type,
      total_marks,
      date_of_exam,
      semester,
      academic_session
    });

    res.json({ success: true, message: 'Exam added successfully' });
  } catch (err) {
    console.error('Error adding exam:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
