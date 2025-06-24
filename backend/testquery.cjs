require('dotenv').config();
const { Pool } = require('pg');
const { use } = require('react');
const { data } = require('react-router-dom');
const path = require('path');
const fs = require('fs');
const { get } = require('axios');

const imagePath = path.join(__dirname, 'logo.png'); // __dirname = folder of current file


const client = new Pool({
  user: 'system',
  host: 'localhost',
  database: 'postgres',
  password: 'Russel87',
  port: '5432'
});

async function getUser(uid) {
  try {
    let user = {
      user_table: [],
      role_table: [],
      emergency_contact: []
    };

    // Get user general info
    let query = 'SELECT * FROM "User" WHERE user_id = $1';
    let result = await client.query(query, [uid]);

    if (result.rows.length === 0) {
      return null;
    }

    user.user_table = result.rows[0];

    // Get role-specific data
    const role = result.rows[0].role;
    if (role === 'Student') {
      query = 'SELECT * FROM student WHERE student_id = $1';
    } else if (role === 'Teacher') {
      query = 'SELECT * FROM teacher WHERE teacher_id = $1';
    } else if (role === 'Admin') {
      query = 'SELECT * FROM admin WHERE admin_id = $1';
    }

    result = await client.query(query, [uid]);
    user.role_table = result.rows[0];

    // Get emergency contact info
    const contactQuery = 'SELECT * FROM emergencycontact WHERE user_id = $1';
    const contactResult = await client.query(contactQuery, [uid]);
    if (contactResult.rows.length > 0) {
      user.emergency_contact = contactResult.rows;
    }

    return user;

  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}


async function main() {
  getUser(2509003)
    .then(user => {
      console.log('User details fetched successfully:', user);
    })
    .catch(err => console.error('Error fetching user details:', err));
}

main();
