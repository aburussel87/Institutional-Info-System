const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('../utils');
const { getUserNotifications } = require('../config/query');
const router = express.Router();
const client = require('../config/db');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    let role = req.user.role;
    if (role === 'Advisor' || role === 'Provost' || role === 'HOD') {
      role = 'Teacher';
    } else if (role !== 'Student' && role !== 'Admin') {
      role = 'Teacher';
    }

    const notifications = await getUserNotifications(uid, role);
    const lastIdResult = await client.query(
      `SELECT COALESCE(last_notification, 0) AS last_notification FROM "User" WHERE user_id = $1`,
      [uid]
    );

    const last_notification = lastIdResult.rows[0]?.last_notification || 0;
    res.json({ success: true, notifications, last_notification });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/clear_all/:notification_id', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const notification_id = parseInt(req.params.notification_id);

    await client.query(
      `UPDATE "User" SET last_notification = $1 WHERE user_id = $2`,
      [notification_id, uid]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Clear notification error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
