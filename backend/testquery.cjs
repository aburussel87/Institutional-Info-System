const { Pool } = require('pg');
require('dotenv').config();

const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function getTeacherInfo(teacherId) {
  const query = `
    SELECT get_teacher_info($1);
  `;
  const res = await client.query(query, [teacherId]);
  return res.rows[0];
}


(async () => {
  try {
    const result = await getTeacherInfo(2020111597);
    console.log(result); // Access the function result
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
