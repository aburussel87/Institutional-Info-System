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

async function pay_student_fee(feeId) {
  const query = `
    SELECT * FROM pay_student_fee($1,CURRENT_DATE)
  `;
  const res = await client.query(query, [feeId]);
  return res.rows;
}


(async () => {
  try {
    const result = await pay_student_fee(2204032);
    console.log(result[0].msg
    );
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
