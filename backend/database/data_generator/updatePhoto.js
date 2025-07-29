require('dotenv').config();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const imagePath = path.join(__dirname, '../images/provat.jpg');


const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function updateUserPhoto(userId, filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    await pool.query(`UPDATE "User" SET photo = $1 WHERE user_id = $2`, [imageBuffer, userId]);

    console.log(`Photo updated for user ID: ${userId}`);
  } catch (err) {
    console.error('Error updating user photo:', err);
  }
}

async function update_achievements(id, filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    await pool.query(`UPDATE achievements set photo = $1 where ach_id = $2`, [imageBuffer, id]);

    console.log(`Photo updated for user ID: ${id}`);
  } catch (err) {
    console.error('Error updating user photo:', err);
  }
}

async function main() {
  try {
    //await updateUserPhoto(2204032, imagePath);
    await update_achievements(1,imagePath);
    console.log('Photo update completed');
  } catch (err) {
    console.error('Error in photo update:', err);
  } finally {
    await pool.end();  
  }
}

main();
