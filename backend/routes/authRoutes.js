const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { updateLogin } = require('../config/query');
const { use } = require('react');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function authenticateUser(username, password) {
  console.log('Authenticating user:', username);
  const res = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [username]);
  if (res.rows.length === 0) {
    throw new Error('User not found');
  }
  const user = res.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    console.log("Invalid login for: "+user.user_id);
    throw new Error('Invalid credentials');
  }
  
  let student,teacher;
  if(user.role == 'Student'){
    const r = await pool.query('Select * from student where student_id = $1',[user.user_id]);
    student = r.rows[0];
  }
  else if(user.role == 'Teacher'){
    const r = await pool.query(' SELECT * FROM get_teacher_info($1)',[user.user_id]);
    console.log(r.rows); //test
    teacher = r.rows[0]; // This will contain teacher info
  }
  updateLogin(user.user_id);
  const token = jwt.sign(
  {
    userId: user.user_id,
    role: user.role,
    semester: student ? student.current_semester : null,
    department_id: student ? student.department_id : null
  },
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
