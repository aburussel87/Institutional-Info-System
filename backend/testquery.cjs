const { Pool } = require('pg');
require('dotenv').config();
const {formatSemesterRoutine} = require('../backend/utils');

const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function getSemesterRoutine(sid) {
  const query = `
    SELECT * FROM get_class_routine($1,$2,$3);
  `;
  const subq = `
   Select current_semester , academic_session, department_id from student where student_id = $1
  `;
  const r1 = await client.query(subq,[sid]);
  let student = r1.rows[0];
  const res = await client.query(query, [student.current_semester,student.academic_session,student.department_id]);
  return formatSemesterRoutine(res.rows);
}


(async () => {
  try {
    const result = await getSemesterRoutine(2204032);
    console.log(result);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
})();
