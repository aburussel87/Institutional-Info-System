const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {get_all_payments_ordered_by_type, pay_student_fee} = require('../config/query');
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

router.post('/pay/:feeId', authenticateToken, async (req, res) => {
    const feeId = req.params.feeId;
    const uid = req.user.userId;

    try {
        const payment = await pay_student_fee(feeId);
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment failed' });
        }
        console.log("Student Fee Payment Request by :" + uid);
        res.json({ success: true,  payment });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
