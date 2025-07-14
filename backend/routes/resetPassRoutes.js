const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const client = require('../config/db');
const { authenticateToken } = require('../utils');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// router.post('/reset', authenticateToken, async (req, res) => {
//   const userId = req.user.userId;
//   console.log("password reset request for user:", userId);
//   const { oldPassword, newPassword } = req.body;

//   if (!oldPassword || !newPassword) {
//     return res.status(400).json({ message: 'Old and new password required' });
//   }

//   try {
//     const result = await client.query(
//       'SELECT password_hash FROM "User" WHERE user_id = $1',
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const currentHash = result.rows[0].password_hash;
//     const match = await bcrypt.compare(oldPassword, currentHash);

//     if (!match) {
//       return res.status(401).json({ success: false, message: 'Old password is incorrect' });
//     }

//     const newHash = await bcrypt.hash(newPassword, 10);

//     await client.query(
//       'UPDATE "User" SET password_hash = $1 WHERE user_id = $2',
//       [newHash, userId]
//     );

//     return res.json({ success: true, message: 'Password updated successfully' });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });

router.post('/reset/request', authenticateToken, async (req, res) => {
  const uid = req.user.userId;
  const result = await client.query(
    'SELECT email FROM "User" WHERE user_id = $1',
    [uid]
  );

  const email = result.rows[0]?.email;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email not found' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query(
      'UPDATE "User" SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
      [token, expiresAt, uid]
    );

    const resetLink = `${process.env.FRONTEND_URL}/passwordReset?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.PASSKEY,
      },
    });

    const mailOptions = {
      from: `"Institutional Information System" <${process.env.EMAIL_HOST}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here: ${resetLink}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetLink}" style="padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, token: token, message: 'Password reset email sent!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/reset', authenticateToken, async (req, res) => {
  const { resetToken, oldPassword, newPassword } = req.body;
  const uid = req.user.userId;
  console.log('Reset password request:', { resetToken, oldPassword, newPassword, uid });
  if (!resetToken || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token, old password, and new password required' });
  }

  try {
    const result = await client.query(
      'SELECT reset_token_expires FROM "User" WHERE reset_token = $1 and user_id = $2',
      [resetToken, uid]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = result.rows[0];

    if (new Date() > user.reset_token_expires) {
      return res.status(400).json({ success: false, message: 'Token expired' });
    }


    const r = await client.query(
      'SELECT password_hash FROM "User" WHERE user_id = $1',
      [uid]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentHash = r.rows[0].password_hash;
    const match = await bcrypt.compare(oldPassword, currentHash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await client.query(
      'UPDATE "User" SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2',
      [newHash, uid]
    );

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
