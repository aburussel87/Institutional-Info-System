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

async function get_all_payments_ordered_by_type(sid) {
  const query = `
    SELECT * FROM get_all_payments_ordered_by_type($1)
  `;
  const res = await client.query(query, [sid]);
  return formatFee(res.rows);
}


(async () => {
  try {
    const result = await get_all_payments_ordered_by_type(2204032);
    console.log(result.paid['Dining Fee']);
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
