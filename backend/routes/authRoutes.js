const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { updateLogin } = require('../config/query');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});


async function authenticateUser(username, password) {
  console.log('Authenticating user:', username);

  const res = await pool.query(
    'SELECT * FROM "User" WHERE user_id = $1', 
    [username]
  );

  if (res.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = res.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    console.log("Invalid login for:", user.user_id);
    throw new Error('Invalid credentials');
  }

  let student, teacher;
  let role;
  if (user.role === 'Student') {
    const r = await pool.query(
      'SELECT * FROM student WHERE student_id = $1', 
      [user.user_id]
    );
    student = r.rows[0];
    role = 'Student';
  } 
  else if (user.role === 'Teacher') {
    const r = await pool.query(
      'SELECT * FROM get_teacher_info($1)', 
      [user.user_id]
    );
    const advisor = await pool.query(
      'SELECT * FROM advisor WHERE teacher_id = $1',
      [user.user_id]
    );
    const provost = await pool.query(
      'SELECT * FROM provost WHERE teacher_id = $1 AND resigned_on is null',
      [user.user_id]
    );
    if (advisor.rows.length > 0) {
      role = 'Advisor';
    }
    else if (provost.rows.length > 0) {
      role = 'Provost';
    } 
    teacher = r.rows[0];
  }

  await updateLogin(user.user_id);

  const token = jwt.sign(
    {
      userId: user.user_id,
      role: role,
      semester: student ? student.current_semester : null,
      department_id: student ? student.department_id : null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  return { token, user };
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { token, user } = await authenticateUser(username, password);

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await pool.query(
      `
      INSERT INTO UserSession (user_id, login_time, ip_address) 
      VALUES ($1, NOW(), $2)
      `,
      [user.user_id, ipAddress]
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
});

module.exports = router;
