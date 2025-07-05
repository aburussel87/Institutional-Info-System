require('dotenv').config();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const imagePath = path.join(__dirname, '../images/logo.png');


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

    // Use pool.query directly - it manages connections automatically
    await pool.query(`UPDATE "User" SET photo = $1 WHERE user_id = $2`, [imageBuffer, userId]);

    console.log(`Photo updated for user ID: ${userId}`);
  } catch (err) {
    console.error('Error updating user photo:', err);
  }
}

async function main() {
  try {
    await updateUserPhoto(2204032, imagePath);
    console.log('Photo update completed');
  } catch (err) {
    console.error('Error in photo update:', err);
  } finally {
    await pool.end();  // Close the pool to exit script cleanly
  }
}

main();
