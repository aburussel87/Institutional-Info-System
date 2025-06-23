const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { updateLogin } = require('../config/query');
const { use } = require('react');
require('dotenv').config();

async function authenticateUser(username, password) {
  const res = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [username]);
  if (res.rows.length === 0) {
    throw new Error('User not found');
  }
  const user = res.rows[0];
  console.log(user);
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  updateLogin(user.user_id);
  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  return { token };
}


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { token, user } = await authenticateUser(username, password);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
});

module.exports = router;
