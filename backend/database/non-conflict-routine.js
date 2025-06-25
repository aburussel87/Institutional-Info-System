const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


const academicSession = '2025-26';
const semester = 'L1T2';

const timeSlots = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

const labSlots = [
  { start: '08:00', end: '10:30' },
  { start: '10:30', end: '13:00' },
  { start: '13:00', end: '15:30' },
  { start: '15:30', end: '18:00' },
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

async function getStudents(course_id, section_type) {
  const res = await pool.query(
    `SELECT student_id FROM Enrollment WHERE course_id = $1 AND section_type = $2 AND semester = $3`,
    [course_id, section_type, semester]
  );
  return res.rows.map(row => row.student_id);
}

async function hasConflict(day, start, end, teacher_id, room_id, studentIds) {
  // Teacher conflict by joining SubjectAllocation on ClassSchedule course_id, section_type, academic_session
  const teacherConflict = await pool.query(
    `SELECT 1 FROM ClassSchedule c
     JOIN SubjectAllocation s ON c.course_id = s.course_id AND c.section_type = s.section_type AND c.academic_session = s.academic_session
     WHERE c.day_of_week = $1
       AND c.start_time < $3
       AND c.end_time > $2
       AND s.teacher_id = $4
       AND c.academic_session = $5`,
    [day, start, end, teacher_id, academicSession]
  );
  if (teacherConflict.rowCount > 0) return true;

  // Room conflict
  const roomConflict = await pool.query(
    `SELECT 1 FROM ClassSchedule
     WHERE day_of_week = $1 AND start_time < $3 AND end_time > $2 AND room_id = $4 AND academic_session = $5`,
    [day, start, end, room_id, academicSession]
  );
  if (roomConflict.rowCount > 0) return true;

  // Student conflict
  if (studentIds.length > 0) {
    const studentConflict = await pool.query(
      `SELECT 1 FROM ClassSchedule cs
       JOIN Enrollment e ON cs.course_id = e.course_id AND cs.section_type = e.section_type
       WHERE cs.day_of_week = $1
         AND cs.start_time < $3
         AND cs.end_time > $2
         AND e.student_id = ANY($4::int[])
         AND e.semester = $5
         AND cs.academic_session = $6`,
      [day, start, end, studentIds, semester, academicSession]
    );
    if (studentConflict.rowCount > 0) return true;
  }

  return false;
}

async function generateSchedule() {
  const scheduledClasses = [];

  try {
    const allocations = await pool.query(
      `SELECT * FROM SubjectAllocation WHERE academic_session = $1`,
      [academicSession]
    );

    let scheduleCount = 0;

    for (const allocation of allocations.rows) {
      const { teacher_id, course_id, section_type } = allocation;
      const studentIds = await getStudents(course_id, section_type);

      const courseData = await pool.query(
        `SELECT credit_hours, semester FROM Course WHERE course_id = $1`,
        [course_id]
      );
      if (courseData.rowCount === 0) continue;

      const { credit_hours, semester: courseSemester } = courseData.rows[0];
      const isLab = parseInt(course_id.slice(-1)) % 2 === 0;

      // Get rooms based on course type
      let rooms;
      if (isLab) {
        rooms = await pool.query(
          `SELECT room_id FROM Room WHERE room_id LIKE 'LAB%'`
        );
      } else {
        rooms = await pool.query(
          `SELECT room_id FROM Room WHERE room_type = 'Classroom'`
        );
      }

      if (rooms.rowCount === 0) {
        console.log(`❌ No suitable room for ${isLab ? 'Lab' : 'Theory'} course ${course_id} ${section_type}`);
        continue;
      }

      if (isLab) {
        // Lab: One 2.5 hour slot per week
        let scheduled = false;
        for (const day of days) {
          for (const slot of labSlots) {
            for (const room of rooms.rows) {
              const conflict = await hasConflict(day, slot.start, slot.end, teacher_id, room.room_id, studentIds);
              if (!conflict) {
                const schedule_id = `${course_id}_${section_type}_${day}_${slot.start.replace(':', '')}`;
                await pool.query(
                  `INSERT INTO ClassSchedule ( course_id, section_type, room_id, day_of_week, start_time, end_time, academic_session)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                  [course_id, section_type, room.room_id, day, slot.start, slot.end,academicSession]
                );
                scheduledClasses.push({
                  schedule_id,
                  course_id,
                  section_type,
                  room_id: room.room_id,
                  day,
                  start_time: slot.start,
                  end_time: slot.end,
                  semester: courseSemester,
                  academic_session: academicSession,
                });
                console.log(`✅ Lab Scheduled: ${course_id} ${section_type} on ${day} ${slot.start}-${slot.end} in ${room.room_id}`);
                scheduleCount++;
                scheduled = true;
                break;
              }
            }
            if (scheduled) break;
          }
          if (scheduled) break;
        }
        if (!scheduled) console.log(`❌ Lab Conflict: Could not schedule ${course_id} ${section_type}`);
      } else {
        // Theory: schedule 'credit_hours' 1-hr classes per week
        let theoryClassesScheduled = 0;
        for (const day of days) {
          for (const slot of timeSlots) {
            for (const room of rooms.rows) {
              if (theoryClassesScheduled >= credit_hours) break;
              const conflict = await hasConflict(day, slot.start, slot.end, teacher_id, room.room_id, studentIds);
              if (!conflict) {
                const schedule_id = `${course_id}_${section_type}_${day}_${slot.start.replace(':', '')}`;
                await pool.query(
                  `INSERT INTO ClassSchedule (course_id, section_type, room_id, day_of_week, start_time, end_time, academic_session)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                  [course_id, section_type, room.room_id, day, slot.start, slot.end,  academicSession]
                );
                scheduledClasses.push({
                  schedule_id,
                  course_id,
                  section_type,
                  room_id: room.room_id,
                  day,
                  start_time: slot.start,
                  end_time: slot.end,
                  semester: courseSemester,
                  academic_session: academicSession,
                });
                console.log(`✅ Theory Scheduled: ${course_id} ${section_type} on ${day} ${slot.start}-${slot.end} in ${room.room_id}`);
                scheduleCount++;
                theoryClassesScheduled++;
              }
            }
            if (theoryClassesScheduled >= credit_hours) break;
          }
          if (theoryClassesScheduled >= credit_hours) break;
        }
        if (theoryClassesScheduled < credit_hours) {
          console.log(`❌ Theory Conflict: ${course_id} ${section_type} scheduled only ${theoryClassesScheduled} of ${credit_hours} needed`);
        }
      }
    }

    console.log(`✅ Total Classes Scheduled: ${scheduleCount}`);

    // Write CSV file
    const csvLines = [
      'schedule_id,course_id,section_type,room_id,day,start_time,end_time,semester,academic_session'
    ];

    for (const entry of scheduledClasses) {
      const line = [
        entry.schedule_id,
        entry.course_id,
        entry.section_type,
        entry.room_id,
        entry.day,
        entry.start_time,
        entry.end_time,
        entry.semester,
        entry.academic_session,
      ].join(',');
      csvLines.push(line);
    }

    const filePath = path.join(__dirname, 'classRoutine.csv');
    fs.writeFileSync(filePath, csvLines.join('\n'));
    console.log(`✅ Schedule saved to CSV: ${filePath}`);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

generateSchedule();
