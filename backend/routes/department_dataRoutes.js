const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { get_department_data,get_department_id } = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();




router.get('/getData', authenticateToken, async (req, res) =>{
  try {
    const uid = req.user.userId;
    const did = await get_department_id(uid)
    const data = await get_department_data(did); 
    if (!data) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    console.log("department data requested by: "+req.user.userId);
    res.json({ success: true, data:data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
