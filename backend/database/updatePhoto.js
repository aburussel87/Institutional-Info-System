require('dotenv').config();
const { Pool } = require('pg');
const { use } = require('react');
const { data } = require('react-router-dom');
const path = require('path');
const fs = require('fs');
const { get } = require('axios');

const imagePath = path.join(__dirname, '../database/images/logo.png');


const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


async function updateUserPhoto(userId, filePath) {
  try {
    await client.connect();


    const imageBuffer = fs.readFileSync(filePath);
    await pool.query(`UPDATE "User" SET photo = $1 WHERE user_id = $2`, [imageBuffer, 2505002]);
    // const result = await client.query('SELECT user_id FROM "User"');
    // for (const user of result.rows) {
    //   await client.query(`UPDATE "User" SET photo = $1 WHERE user_id = $2`, [imageBuffer, user.user_id]);
    // }
    console.log(`Photo updated for user ID: ${userId}`);
  } catch (err) {
    console.error('Error updating user photo:', err);
  } finally {
    await client.end();
  }
}

async function main() {
  updateUserPhoto(2505157, imagePath)
    .then(() => console.log('Photo update completed'))
    .catch(err => console.error('Error in photo update:', err));
}

main();
