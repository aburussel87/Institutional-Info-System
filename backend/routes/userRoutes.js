const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUser } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();



router.post('/details', authenticateToken, async (req, res) => {
  try {
    const { required_uid } = req.body;
console.log('Received required_uid:', required_uid);

    const requestedUid = parseInt(required_uid);
    if (isNaN(requestedUid)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const users = await getUser(requestedUid); 

    if (!users) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log("User details requested by:", req.user.userId, " for:", requestedUid);
    res.json({ success: true, ...users });
  } catch (err) {
    console.error('User details fetch error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
