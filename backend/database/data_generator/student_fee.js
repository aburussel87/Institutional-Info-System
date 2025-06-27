require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

function saveToCsv(file, data) {
  const row = `${data.student_id},${data.fee_type_id},${data.amount},${data.due_date},${data.status},\n`;
  fs.appendFileSync(file, row);
}

async function insertHallFee(dueDate, residentAmount, nonResidentAmount) {
  const client = await pool.connect();
  const filename = 'hall_fee.csv';
  if (!fs.existsSync(filename)) fs.writeFileSync(filename, 'student_id,fee_type_id,amount,due_date,status,paid_on\n');

  try {
    const res = await client.query(`
      SELECT s.student_id, h.resident
      FROM Student s
      JOIN HallAssignment h ON s.student_id = h.student_id
      WHERE h.vacated_on IS NULL
    `);

    for (const { student_id, resident } of res.rows) {
      const amount = resident ? residentAmount : nonResidentAmount;

      await client.query(
        `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
         VALUES ($1, 'FT03', $2, $3, 'Unpaid', NULL)`,
        [student_id, amount, dueDate]
      );

      saveToCsv(filename, { student_id, fee_type_id: 'FT03', amount, due_date: dueDate, status: 'Unpaid' });
    }
  } finally {
    client.release();
  }
}

async function insertDiningFee(dueDate, amount) {
  const client = await pool.connect();
  const filename = 'dining_fee.csv';
  if (!fs.existsSync(filename)) fs.writeFileSync(filename, 'student_id,fee_type_id,amount,due_date,status,paid_on\n');

  try {
    const res = await client.query(`
      SELECT student_id FROM HallAssignment
      WHERE resident = TRUE AND vacated_on IS NULL
    `);

    for (const { student_id } of res.rows) {
      await client.query(
        `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
         VALUES ($1, 'FT02', $2, $3, 'Unpaid', NULL)`,
        [student_id, amount, dueDate]
      );

      saveToCsv(filename, { student_id, fee_type_id: 'FT02', amount, due_date: dueDate, status: 'Unpaid' });
    }
  } finally {
    client.release();
  }
}

async function insertExamFee(dueDate, amount) {
  const client = await pool.connect();
  const filename = 'exam_fee.csv';
  if (!fs.existsSync(filename)) fs.writeFileSync(filename, 'student_id,fee_type_id,amount,due_date,status,paid_on\n');

  try {
    const res = await client.query(`SELECT student_id FROM Student`);
    for (const { student_id } of res.rows) {
      await client.query(
        `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
         VALUES ($1, 'FT01', $2, $3, 'Unpaid', NULL)`,
        [student_id, amount, dueDate]
      );

      saveToCsv(filename, { student_id, fee_type_id: 'FT01', amount, due_date: dueDate, status: 'Unpaid' });
    }
  } finally {
    client.release();
  }
}

async function insertRegistrationFee(dueDate, amount) {
  const client = await pool.connect();
  const filename = 'registration_fee.csv';
  if (!fs.existsSync(filename)) fs.writeFileSync(filename, 'student_id,fee_type_id,amount,due_date,status,paid_on\n');

  try {
    const res = await client.query(`SELECT student_id FROM Student`);
    for (const { student_id } of res.rows) {
      await client.query(
        `INSERT INTO StudentFee (student_id, fee_type_id, amount, due_date, status, paid_on)
         VALUES ($1, 'FT05', $2, $3, 'Unpaid', NULL)`,
        [student_id, amount, dueDate]
      );

      saveToCsv(filename, { student_id, fee_type_id: 'FT05', amount, due_date: dueDate, status: 'Unpaid' });
    }
  } finally {
    client.release();
  }
}

// Example: Admin calls (you can comment/uncomment as needed)

//insertHallFee('2025-01-01', 22000, 10000);
//insertDiningFee('2025-01-10', 2200);
//insertExamFee('2024-09-01', 250);
//insertRegistrationFee('2024-09-01', 150);
