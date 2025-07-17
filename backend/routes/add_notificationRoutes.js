const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { authenticateToken } = require('../utils');
const { get_teacher_context_for_notification } = require('../config/query');




router.get('/get_context',authenticateToken,async(req, res)=>{
    try {
    const uid = req.user.userId;
    const notification = await get_teacher_context_for_notification(uid,'2025-26');
    console.log("Notification context  Requested by :" + uid);
    res.json({ success: true, notification ,uid});
  } catch (err) {
    console.error('Info error error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.post('/add',authenticateToken, async (req, res) => {
  const {
    title,
    message,
    created_by,
    student_id,
    teacher_id,
    department_id,
    course_id,
    hall_id,
    semester_id,
    pdf
  } = req.body;

  if (!title || !message || !created_by) {
    return res.status(400).json({ success: false, message: 'title, message & created_by are required' });
  }

  let pdfBuffer = null;
  if (pdf) {
    try {
      pdfBuffer = Buffer.from(pdf, 'base64');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid PDF format (base64 expected).' });
    }
  }

  const query = `
    INSERT INTO Notification
      (title, message, created_by, student_id, teacher_id, department_id, course_id, hall_id, semester_id, pdf)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING notification_id, created_at
  `;

  const values = [
    title,
    message,
    created_by,
    student_id || null,
    teacher_id || null,
    department_id || null,
    course_id || null,
    hall_id || null,
    semester_id || null,
    pdfBuffer
  ];

  try {
    const result = await client.query(query, values);
    res.json({
      success: true,
      message: 'Notification created successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error inserting notification:', err);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});



module.exports = router;
