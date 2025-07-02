const { Pool } = require('pg');
require('dotenv').config();

const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function getStudentInfo(sid) {
  const query = 'SELECT * FROM Get_studentinfo($1)';
  try {
    const res = await client.query(query, [sid]); 
    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
    throw err;
  }
}

(async () => {
  try {
    const result = await getStudentInfo(2304030);
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();  
  }
})();
