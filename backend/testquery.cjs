// const client = require('../backend/config/db'); 
// require('dotenv').config();
const { Pool } = require('pg');
const  { formatExamData }  = require('./utils');

// const client = require('./config/db');
const client = new Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.cqvkwvnvjtmlvxssjars',
  password: 'hrePMrmh0oyHY9qS',
  database: 'postgres'
});



async function getRegistrationCourse(studentId) {
  const student = await client.query(
      'Select * from get_student_exams($1)',
      [studentId]
    );

  return formatExamData(student.rows);
}


(async () => {
  try {
    const result = await getRegistrationCourse(2204032);
    console.log(result);
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
