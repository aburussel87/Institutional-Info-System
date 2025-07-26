const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('../utils');
const router = express.Router();
const { get_department_id } = require('../config/query');
const client = require('../config/db');

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    console.log("Attempting to add subject allocation by:", uid);

    const allocationsToAdd = req.body.allocations;

    if (!Array.isArray(allocationsToAdd) || allocationsToAdd.length === 0) {
      return res.status(400).json({ success: false, msg: "Allocations array is required and must not be empty!" });
    }

    const successfulAllocations = [];
    const failedAllocations = [];

    for (const allocation of allocationsToAdd) {
      const { teacher_id, course_id, section_type } = allocation;

      if (!course_id || !section_type || !teacher_id) {
        failedAllocations.push({ allocation, error: "Missing required fields" });
        continue;
      }

      const query = `
        INSERT INTO subjectallocation (teacher_id, course_id, section_type, academic_session)
        VALUES ($1, $2, $3, '2025-26a')
        ON CONFLICT (teacher_id, course_id, section_type, academic_session) DO NOTHING
      `;

      const values = [teacher_id, course_id, section_type];

      try {
        const result = await client.query(query, values);
        if (result.rowCount > 0) {
          successfulAllocations.push(allocation);
        } else {
          failedAllocations.push({ allocation, error: "Already exists or insert failed" });
        }
      } catch (insertErr) {
        console.error('Individual allocation insert error:', insertErr);
        failedAllocations.push({ allocation, error: insertErr.message });
      }
    }

    return res.json({
      success: true,
      msg: `${successfulAllocations.length} allocations added.`,
      successfulAllocations,
      failedAllocations
    });

  } catch (err) {
    console.error('Add subject allocation error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/get', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const did = await get_department_id(uid);
    const academicSession = '2025-26a';

    const query = `
      SELECT t.teacher_id, u.username, sa.course_id, sa.section_type
      FROM subjectallocation sa
      JOIN teacher t ON sa.teacher_id = t.teacher_id
      JOIN "User" u ON u.user_id = t.teacher_id
      WHERE t.department_id = $1 AND sa.academic_session = $2
    `;

    const result = await client.query(query, [did, academicSession]);

    if (result.rowCount > 0) {
      return res.json({ success: true, allocations: result.rows });
    }

    return res.json({ success: true, allocations: [] });
  } catch (err) {
    console.error("Error fetching subject allocations:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
