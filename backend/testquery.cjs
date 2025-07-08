const { Pool } = require('pg');
require('dotenv').config();
const {formatExamData} = require('../backend/utils');

const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function getStudent_exam_Routine(studentId) {
  const query = `
    SELECT * FROM get_exam_routine($1);
  `;
  const res = await client.query(query, [studentId]);
  return (formatExamData(res.rows));
}


(async () => {
  try {
    const result = await getStudent_exam_Routine(2204032);
    console.log(result);
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
