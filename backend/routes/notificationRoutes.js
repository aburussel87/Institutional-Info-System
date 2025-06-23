const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {authenticateToken} = require ('../utils');
const {getUserNotifications} = require ('../config/query');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const role = req.user.role;
    const notifications = await getUserNotifications(uid,role); 
    if (!notifications) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;