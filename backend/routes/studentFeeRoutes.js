const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {get_all_payments_ordered_by_type} = require('../config/query');
const {authenticateToken} = require ('../utils');
const router = express.Router();




router.get('/', authenticateToken, async (req, res) => {
    const uid = req.user.userId;
    const fee = await get_all_payments_ordered_by_type(uid);
    if (!fee) {
        return res.status(404).json({ success: false, error: 'Fee details not found' });
    } 
    console.log("Student Fee Request by :" + uid);
    res.json({ success: true, fee });  
});

module.exports = router;
