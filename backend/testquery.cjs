const { Pool } = require('pg');
require('dotenv').config();
const {formatFee} = require('../backend/utils');

const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function getEnrolledCourseOutline(uid,role) {
  const query = `
    SELECT * FROM get_user_notifications($1,$2);
  `;
  const res = await client.query(query, [uid, role]);
  return res.rows;
}


(async () => {
  try {
    const result = await getEnrolledCourseOutline(2204032,'Student');
    console.log(result);
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
