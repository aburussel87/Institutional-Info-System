const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


async function assignHeadsForDepartments() {
  try {
    const deptResult = await pool.query('SELECT department_id FROM Department');
    const departments = deptResult.rows;

    for (const dept of departments) {
      const department_id = dept.department_id;
      const teacherResult = await pool.query(
        'SELECT teacher_id FROM Teacher WHERE department_id = $1',
        [department_id]
      );
      const teachers = teacherResult.rows;

      if (teachers.length === 0) {
        console.log(`No teachers found for department ${department_id}, skipping...`);
        continue;
      }
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      await pool.query(
        `INSERT INTO Head_of_Department (department_id, teacher_id, assigned_on)
         VALUES ($1, $2, $3)`, 
        [department_id, randomTeacher.teacher_id, faker.date.past({ years: 5 }).toISOString().split('T')[0]]
      );

      console.log(`Assigned teacher ${randomTeacher.teacher_id} as head of department ${department_id}`);
    }

    console.log("Department head assignment complete!");
  } catch (err) {
    console.error('Error assigning department heads:', err);
  } finally {
    await pool.end();
  }
}

assignHeadsForDepartments();
