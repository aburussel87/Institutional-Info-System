const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {authenticateToken} = require ('../utils');
const {getUserNotifications} = require ('../config/query');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    let role = req.user.role;
    console.log('User ID:', uid, 'Role:', role);
    if (role === 'Advisor' || role === 'Provost') {
      role = 'Teacher'; 
    }else if (role === 'Student') {
      role = 'Student';
    } else if (role === 'Admin') {
      role = 'Admin';
    } else if (role === 'HOD') {
      role = 'HOD';
    }  else {
      role = 'Teacher'; 
    }
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