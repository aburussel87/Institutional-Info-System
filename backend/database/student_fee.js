require('dotenv').config();
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

function randomFeeStatus() {
  return Math.random() < 0.7 ? 'Paid' : 'Unpaid';
}

async function insertHallFee(client, dueDate) {
  console.log('Inserting Hall Fees...');
  const hallResidents = await client.query(`
    SELECT student_id
    FROM HallAssignment
    WHERE resident = TRUE AND vacated_on IS NULL
  `);

  for (const row of hallResidents.rows) {
    const status = randomFeeStatus();
    console.log(row.student_id+'\n');
    await client.query(
      `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
       VALUES ($1, 'FT03', 22000, $2, $3, $4)`,
      [
        row.student_id,
        dueDate,
        status,
        status === 'Paid' ? faker.date.between({ from: '2025-11-01', to: dueDate }) : null,
      ]
    );
  }

  const hallNonResidents = await client.query(`
    SELECT student_id
    FROM HallAssignment
    WHERE resident = FALSE AND vacated_on IS NULL
    except
    select student_id from studentfee
  `);

  for (const row of hallNonResidents.rows) {
    const status = randomFeeStatus();
    console.log(row.student_id+'\n');
    await client.query(
      `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
       VALUES ($1, 'FT03', 10000, $2, $3, $4)`,
      [
        row.student_id,
        dueDate,
        status,
        status === 'Paid' ? faker.date.between({ from: '2025-11-01', to: dueDate }) : null,
      ]
    );
  }
}

async function insertDiningFeeForMonth(client, month, year) {
  console.log(`Inserting Dining Fees for ${year}-${month}...`);
  const diningStudents = await client.query(`
    SELECT student_id
    FROM HallAssignment
    WHERE resident = TRUE AND vacated_on IS NULL
  `);

  const dueDateDining = new Date(year, month - 1, 10).toISOString().split('T')[0];

  for (const row of diningStudents.rows) {
    const status = 'Paid';
    console.log(row.student_id+'\n');
    await client.query(
      `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
       VALUES ($1, 'FT02', 2400, $2, $3, $4)`,
      [
        row.student_id,
        dueDateDining,
        status,
        status === 'Paid'
          ? faker.date.between({ from: `${year}-${month}-01`, to: dueDateDining })
          : null,
      ]
    );
  }
}

async function insertSemesterExamFees(client, dueDate) {
  console.log('Inserting Semester Exam Fees...');
  const students = await client.query(`SELECT student_id FROM student`);

  for (const row of students.rows) {
    const statusExam = 'Paid';
    await client.query(
      `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
       VALUES ($1, 'FT01', 250, $2, $3, $4)`,
      [
        row.student_id,
        dueDate,
        statusExam,
        statusExam === 'Paid' ? faker.date.between({ from: '2025-06-01', to: dueDate }) : null,
      ]
    );
  }
}

async function insertRegistrationFees(client, dueDate) {
  console.log('Inserting Registration Fees...');
  const students = await client.query(`SELECT student_id FROM student`);

  for (const row of students.rows) {
    const statusReg = randomFeeStatus();
    await client.query(
      `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
       VALUES ($1, 'FT05', 150, $2, $3, $4)`,
      [
        row.student_id,
        dueDate,
        statusReg,
        statusReg === 'Paid' ? faker.date.between({ from: '2025-06-01', to: dueDate }) : null,
      ]
    );
  }
}

async function generateAllStudentFees() {
  const client = await pool.connect();
  const dueDate = '2025-08-01';

  try {
    //await insertHallFee(client, dueDate);
    //await insertSemesterExamFees(client, dueDate);
    //await insertRegistrationFees(client, dueDate);
    //await insertDiningFeeForMonth(client, 6, 2025); 
  } catch (err) {
    console.error('Error inserting fees:', err);
  } finally {
    client.release();
  }
}

generateAllStudentFees();
