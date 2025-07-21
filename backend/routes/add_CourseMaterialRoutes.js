const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { authenticateToken } = require('../utils');
const { getCourseMaterials_for_Teacher, getCourseMaterials_for_Student, delete_courseMaterials } = require('../config/query');
const { de } = require('@faker-js/faker');

router.post('/add', authenticateToken, async (req, res) => {
    
  const {
    course_id,
    uploaded_by,
    description,
    pdf
  } = req.body;
  console.log("Add course Material requested by: ", uploaded_by)
  if (!course_id || !uploaded_by || !description) {
    return res.status(400).json({ success: false, message: 'course_id, uploaded_by & description are required' });
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
    INSERT INTO CourseMaterial
      (course_id, uploaded_by, description, pdf, upload_date)
    VALUES
      ($1, $2, $3, $4, NOW())
    RETURNING material_id, upload_date
  `;

  const values = [
    course_id,
    uploaded_by,
    description,
    pdfBuffer
  ];

  try {
    const result = await client.query(query, values);
    res.json({
      success: true,
      message: 'Course material added successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error inserting course material:', err);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});


router.post('/get', authenticateToken, async (req, res) => {
  const { course_id, uploaded_by } = req.body;
    console.log("course materials requested by: ",uploaded_by,"for ",course_id);
  if (!course_id || !uploaded_by) {
    return res.status(400).json({ success: false, message: 'Description and materials are required' });
  }

  try {
    const materials = await getCourseMaterials_for_Teacher(course_id,uploaded_by);
    res.json({
      success: true,
      materials
    });
  } catch (err) {
    console.error('Error fetching course materials:', err);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});


router.post('/student/get', authenticateToken, async (req, res) => {
  const { course_id } = req.body;
    console.log("course materials requested for :",course_id);
  if (!course_id ) {
    return res.status(400).json({ success: false, message: 'course_id is required' });
  }

  try {
    const materials = await getCourseMaterials_for_Student(course_id);
    res.json({
      success: true,
      materials
    });
  } catch (err) {
    console.error('Error fetching course materials:', err);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});


router.delete('/delete', authenticateToken, async (req, res) => {
  console.log("materials delete called by:", req.user.userId);

  try {
    const { material } = req.body;
    if (!material || !material.material_id) {
      return res.status(400).json({ success: false, message: "Material ID is required." });
    }

    const result = await delete_courseMaterials(material.material_id);

    if (result > 0) {
      return res.json({ success: true, msg: "Course Material deleted successfully!" });
    } else {
      return res.status(404).json({ success: false, msg: "Material not found." });
    }
  } catch (err) {
    console.error("Error deleting material:", err);
    return res.status(500).json({ success: false, msg: "Server error while deleting material." });
  }
});



module.exports = router;
