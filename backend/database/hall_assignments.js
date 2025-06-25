const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'system',
  host: 'localhost',
  database: 'postgres',
  password: 'Russel87',
  port: 5432,
});

async function assignHallsToStudentsRoundRobin() {
  try {
    const client = await pool.connect();

    const res = await client.query(`SELECT student_id FROM Student ORDER BY student_id`);
    const students = res.rows;

    const halls = [
      { hall_id: 1, name: 'Suhrawardy Hall' },
      { hall_id: 2, name: 'Sher-e-Bangla Hall' },
      { hall_id: 3, name: 'Dr. MA Rashid Hall' },
      { hall_id: 4, name: 'Ahsanullah Hall' },
      { hall_id: 5, name: 'Shadhinata Hall' },
      { hall_id: 6, name: 'Titumir Hall' },
    ];

    const maxPerRoom = 5;
    const roomsPerHall = 100;
    const permanentStudents = [];
    const temporaryStudents = [];

    for (let i = 0; i < students.length; i++) {
      if (i % 50 >= 40) temporaryStudents.push(students[i]);
      else permanentStudents.push(students[i]);
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

        
          await client.query(
            `INSERT INTO HallAssignment (student_id, hall_id, room_number, assignment_type, assigned_on)
             VALUES ($1, $2, $3, $4, $5)`,
            [studentId, hall.hall_id, roomNumber.toString(), 'Permanent', assignedOn]
          );

          assigned.push({
            student_id: studentId,
            hall_id: hall.hall_id,
            room_number: roomNumber.toString(),
            assignment_type: 'Permanent',
            assigned_on: assignedOn
          });
        }
      }
    }

    for (let i = 0; i < temporaryStudents.length; i++) {
      const studentId = temporaryStudents[i].student_id;
      const hall = halls[i % halls.length];
      const assignedOn = new Date().toISOString();

      await client.query(
        `INSERT INTO HallAssignment (student_id, hall_id, room_number, assignment_type, assigned_on)
         VALUES ($1, $2, NULL, $3, $4)`,
        [studentId, hall.hall_id, 'Temporary', assignedOn]
      );

      assigned.push({
        student_id: studentId,
        hall_id: hall.hall_id,
        room_number: '',
        assignment_type: 'Temporary',
        assigned_on: assignedOn
      });
    }
    const csvLines = ['student_id,hall_id,room_number,assignment_type,assigned_on'];
    for (const row of assigned) {
      csvLines.push([
        row.student_id,
        row.hall_id,
        row.room_number,
        row.assignment_type,
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
