const express = require('express');
const { authenticateToken } = require('../utils');
const router = express.Router();
const client = require('../config/db');
const multer = require('multer');
const csv = require('csv-parser');
const upload = multer({ storage: multer.memoryStorage() });
const stream = require('stream');
const readline = require('readline');
const pool = require('../config/db');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    console.log("ADD EXAM REQUEST BY: " + teacherId);
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

router.put('/update_exam', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    console.log("UPDATE EXAM REQUEST BY: " + teacherId);
    const {
      exam_id,
      course_id,
      title,
      exam_type,
      total_marks,
      date_of_exam,
      semester,
      academic_session,
      section
    } = req.body;

    if (!exam_id || !course_id || !title || !exam_type || !total_marks || !date_of_exam || !semester || !academic_session || !section) {
      return res.status(400).json({ success: false, error: 'Missing required fields for update' });
    }

    const result = await client.query(
      `
  UPDATE exam 
  SET date_of_exam = $1::timestamp, total_marks = $2 
  WHERE exam_id = $3 
  RETURNING *
  `,
      [date_of_exam, total_marks, exam_id]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Exam updated successfully', updatedExam: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Exam not found or not authorized to update' });
    }

  } catch (err) {
    console.error('Error updating exam:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.delete('/delete_exam/:exam_id', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    console.log("DELETE EXAM REQUEST BY: " + teacherId);
    const { exam_id } = req.params;

    if (!exam_id) {
      return res.status(400).json({ success: false, error: 'Exam ID is required for deletion' });
    }

    const result = await client.query(
      `DELETE FROM exam WHERE exam_id = $1`,
      [exam_id]
    );

    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Exam deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Exam not found or not authorized to delete' });
    }

  } catch (err) {
    console.error('Error deleting exam:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.post(
  '/upload_marks',
  authenticateToken,
  upload.single('csvFile'),
  async (req, res) => {
    const { exam_id } = req.body;
    console.log("update marks requested for exam:", exam_id);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const client = await pool.connect(); 

    try {
      await client.query('BEGIN');

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      const rl = readline.createInterface({
        input: bufferStream,
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        const entries = line.split('|').map(item => item.trim());
        for (const entry of entries) {
          const [id, mark] = entry.split('-').map(e => e.trim());
          const student_id = parseInt(id, 10);
          const marks_obtained = parseFloat(mark);

          if (isNaN(student_id) || isNaN(marks_obtained)) continue;
          console.log(student_id, marks_obtained);

          const result = await client.query(
            `UPDATE examresult
             SET marks_obtained = $1
             WHERE exam_id = $2 AND student_id = $3`,
            [marks_obtained, exam_id, student_id]
          );

          if (result.rowCount === 0) {
            console.warn(`⚠️ No update for student ${student_id}, exam ${exam_id}`);
          }
        }
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Marks uploaded successfully.' });
    } catch (err) {
      console.error(err);
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, message: 'Failed to process marks.', error: err.message });
    } finally {
      client.release(); // ✅ always release
    }
  }
);




router.get('/get_enrolled_students/:exam_id', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    console.log("Enrolled Students REQUEST BY: " + teacherId);
    const { exam_id } = req.params;
    if (!exam_id) {
      return res.status(400).json({ success: false, error: 'Exam ID is required for deletion' });
    }

    const result = await client.query(
      `SELECT student_id, COALESCE(marks_obtained, 0) as mark
        FROM examresult
        WHERE exam_id = $1
        ORDER BY student_id;
        `,
      [exam_id]
    );

    if (result) {
      res.json({ success: true, students: result.rows });
    } else {
      res.status(404).json({ success: false, message: 'students not found' });
    }

  } catch (err) {
    console.error('Error getting students', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



module.exports = router;
