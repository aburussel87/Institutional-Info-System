require('dotenv').config();
const { Pool } = require('pg');
const { data } = require('react-router-dom');

const client = new Pool({
  user: 'system',
  host: 'localhost',
  database: 'postgres',
  password: 'Russel87',
  port: '5432'
});

async function getAllUser() {
  try {
    const query = 'SELECT * FROM course where department_id = $1';
    const result = await client.query(query,[5]);

    if (result.rows.length === 0) {
      return null;
    }
    console.log(result.rows);
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}

const id = 2505072;

async function main() {
  await getAllUser();
}

main();
