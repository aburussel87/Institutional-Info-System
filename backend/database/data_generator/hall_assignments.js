const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


function isResident() {
  return Math.random() < 0.9; 
}

async function assignHallsToStudentsRoundRobin() {
  try {
    const client = await pool.connect();

    const res = await client.query(`
      SELECT s.student_id, u.gender
      FROM student s
      JOIN "User" u ON s.student_id = u.user_id
      WHERE s.student_id NOT IN (SELECT student_id FROM hallassignment)
      ORDER BY RANDOM()
    `);

    const students = res.rows;

    const halls = [
      { hall_id: 1, name: 'Suhrawardy Hall' },
      { hall_id: 2, name: 'Sher-e-Bangla Hall' },
      { hall_id: 3, name: 'Dr. MA Rashid Hall' },
      { hall_id: 4, name: 'Ahsanullah Hall' },
      { hall_id: 6, name: 'Titumir Hall' },
    ];

    const femaleStudents = students.filter(s => s.gender === 'Female');
    const maleStudents = students.filter(s => s.gender === 'Male');

    const maxPerRoom = 5;
    const roomsPerHall = 100;
    const permanentStudents = [];
    const temporaryStudents = [];

    for (let i = 0; i < maleStudents.length; i++) {
      if (i % 50 >= 40) temporaryStudents.push(maleStudents[i]);
      else permanentStudents.push(maleStudents[i]);
    }

    const assigned = [];

    let studentIndex = 0;
    for (let roomNumber = 1; roomNumber <= roomsPerHall; roomNumber++) {
      for (let h = 0; h < halls.length; h++) {
        const hall = halls[h];
        for (let s = 0; s < maxPerRoom; s++) {
          if (studentIndex >= permanentStudents.length) break;

          const studentId = permanentStudents[studentIndex++].student_id;
          const assignedOn = new Date().toISOString();

          const residentStatus = isResident();
          const roomNumberStr = residentStatus ? roomNumber.toString() : null;

          await client.query(
            `INSERT INTO HallAssignment (student_id, hall_id, room_number, resident, assigned_on)
             VALUES ($1, $2, $3, $4, $5)`,
            [studentId, hall.hall_id, roomNumberStr, residentStatus, assignedOn]
          );

          assigned.push({
            student_id: studentId,
            hall_id: hall.hall_id,
            room_number: roomNumberStr || '',
            resident: residentStatus,
            assigned_on: assignedOn
          });
        }
      }
    }

    for (let i = 0; i < temporaryStudents.length; i++) {
      const studentId = temporaryStudents[i].student_id;
      const hall = halls[i % halls.length];
      const assignedOn = new Date().toISOString();

      const residentStatus = isResident();
      const roomNumberStr = residentStatus ? null : null; 

      await client.query(
        `INSERT INTO HallAssignment (student_id, hall_id, room_number, resident, assigned_on)
         VALUES ($1, $2, $3, $4, $5)`,
        [studentId, hall.hall_id, roomNumberStr, residentStatus, assignedOn]
      );

      assigned.push({
        student_id: studentId,
        hall_id: hall.hall_id,
        room_number: roomNumberStr || '',
        resident: residentStatus,
        assigned_on: assignedOn
      });
    }

    for (let i = 0; i < femaleStudents.length; i++) {
      const studentId = femaleStudents[i].student_id;
      const assignedOn = new Date().toISOString();

      const residentStatus = isResident();
      const roomNumberStr = residentStatus ? null : null; // No room logic defined for female students yet

      await client.query(
        `INSERT INTO HallAssignment (student_id, hall_id, room_number, resident, assigned_on)
         VALUES ($1, $2, $3, $4, $5)`,
        [studentId, 5, roomNumberStr, residentStatus, assignedOn]
      );

      assigned.push({
        student_id: studentId,
        hall_id: 5,
        room_number: roomNumberStr || '',
        resident: residentStatus,
        assigned_on: assignedOn
      });
    }

    const csvLines = ['student_id,hall_id,room_number,resident,assigned_on'];
    for (const row of assigned) {
      csvLines.push([
        row.student_id,
        row.hall_id,
        row.room_number,
        row.resident,
        row.assigned_on
      ].join(','));
    }

    const filePath = path.join(__dirname, 'hall_assignments.csv');
    fs.writeFileSync(filePath, csvLines.join('\n'));
    console.log(`Hall assignments saved to ${filePath}`);

    client.release();
  } catch (err) {
    console.error("Error assigning halls:", err);
  }
}

assignHallsToStudentsRoundRobin();
