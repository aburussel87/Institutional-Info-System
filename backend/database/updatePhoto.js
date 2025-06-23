require('dotenv').config();
const { Pool } = require('pg');
const { use } = require('react');
const { data } = require('react-router-dom');
const path = require('path');
const fs = require('fs');
const { get } = require('axios');

const imagePath = path.join(__dirname, '../database/images/logo.png'); 


const client = new Pool({
  user: 'system',
  host: 'localhost',
  database: 'postgres',
  password: 'Russel87',
  port: '5432'
});

async function updateUserPhoto(userId, filePath) {
  try {
    await client.connect();

    
    const imageBuffer = fs.readFileSync(filePath);

    const query = `UPDATE "User" SET photo = $1 WHERE user_id = $2`;
    const values = [imageBuffer, userId];

    await client.query(query, values);
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
