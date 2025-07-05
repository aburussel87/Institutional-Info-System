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

const academicSession = '2025-26';
const semester = 'L1T2';

const timeSlots = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
];

const labSlots = [
  { start: '14:30', end: '16:30' },
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

function getSubsections(deptCount, isLab) {
  if (deptCount >= 120) {
    return isLab
      ? ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      : ['A', 'B', 'C'];
  } else {
    return [isLab ? 'A1' : 'A'];
  }
}

async function getStudents(course_id, section_type) {
  const res = await pool.query(
    `SELECT student_id 
     FROM Enrollment 
     WHERE course_id = $1 AND (section_type = $2 OR $2 = 'All') AND semester = $3`,
    [course_id, section_type, semester]
  );
  return res.rows.map(row => parseInt(row.student_id));
}

async function hasConflict(day, start, end, teacher_id, room_id, studentIds) {
  const teacherConflict = await pool.query(
    `SELECT 1 FROM ClassSchedule c
     JOIN SubjectAllocation s 
       ON c.course_id = s.course_id AND c.section_type = s.section_type AND c.academic_session = s.academic_session
     WHERE c.day_of_week = $1 AND c.start_time < $3 AND c.end_time > $2
       AND s.teacher_id = $4 AND c.academic_session = $5`,
    [day, start, end, teacher_id, academicSession]
  );
  if (teacherConflict.rowCount > 0) return true;

  const roomConflict = await pool.query(
    `SELECT 1 FROM ClassSchedule 
     WHERE day_of_week = $1 AND start_time < $3 AND end_time > $2 
       AND room_id = $4 AND academic_session = $5`,
    [day, start, end, room_id, academicSession]
  );
  if (roomConflict.rowCount > 0) return true;

  if (studentIds.length > 0) {
    const studentConflict = await pool.query(
      `SELECT 1 FROM ClassSchedule cs
       JOIN Enrollment e 
         ON cs.course_id = e.course_id AND cs.section_type = e.section_type AND cs.academic_session = e.academic_session
       WHERE cs.day_of_week = $1
         AND cs.start_time < $3 AND cs.end_time > $2
         AND e.student_id = ANY($4::int[])
         AND e.semester = $5 AND cs.academic_session = $6`,
      [day, start, end, studentIds, semester, academicSession]
    );
    if (studentConflict.rowCount > 0) return true;
  }

  return false;
}

async function generateSchedule() {
  const allScheduledClasses = [];

  try {
    const departmentsRes = await pool.query(`SELECT department_id FROM Department`);
    const departments = departmentsRes.rows.map(row => row.department_id);

    if (departments.length === 0) {
      console.log("❌ No departments found.");
      return;
    }

    console.log(`Clearing existing schedule for ${academicSession}, ${semester}...`);
    await pool.query(
      `DELETE FROM ClassSchedule 
       WHERE academic_session = $1 AND course_id IN (
         SELECT course_id FROM Course WHERE semester = $2
       )`,
      [academicSession, semester]
    );
    console.log("✅ Existing schedule cleared.");

    for (const department_id of departments) {
      console.log(`\n--- Scheduling for Department: ${department_id} ---`);

      const allocationsRes = await pool.query(
        `SELECT sa.course_id, sa.section_type, sa.teacher_id, c.credit_hours, c.semester as course_semester
         FROM SubjectAllocation sa
         JOIN Course c ON sa.course_id = c.course_id
         JOIN Teacher t ON sa.teacher_id = t.teacher_id
         WHERE sa.academic_session = $1 AND t.department_id = $2 AND c.semester = $3`,
        [academicSession, department_id, semester]
      );
      const allocations = allocationsRes.rows;

      if (allocations.length === 0) {
        console.log(`No allocations for department ${department_id}.`);
        continue;
      }

      const deptStudentCountRes = await pool.query(
        `SELECT COUNT(*) FROM Student WHERE department_id = $1 AND current_semester = $2`,
        [department_id, semester]
      );
      const deptStudentCount = parseInt(deptStudentCountRes.rows[0].count);

      const usedTeacherSlots = new Set();
      const usedRoomSlots = new Set();
      const scheduledCourseSectionDays = new Set();

      let dayStartIndex = 0;

      for (const allocation of allocations) {
        const { teacher_id, course_id, section_type, credit_hours, course_semester } = allocation;

        const isLab = parseInt(course_id.slice(-1)) % 2 === 0;

        const roomsRes = await pool.query(
          `SELECT room_id FROM Room 
           WHERE room_type = $1 AND building_id = $2`,
          [isLab ? 'Laboratory' : 'Classroom', department_id]
        );
        const rooms = roomsRes.rows;

        if (rooms.length === 0) {
          console.log(`❌ No ${isLab ? 'Lab' : 'Classroom'} for dept ${department_id} (${course_id}).`);
          continue;
        }

        const slotsToUse = isLab ? labSlots : timeSlots;
        const requiredClasses = isLab ? 1 : credit_hours;

        const sections = (section_type === 'All')
          ? getSubsections(deptStudentCount, isLab)
          : [section_type];

        for (const sec of sections) {
          const studentIds = await getStudents(course_id, sec);
          let classesScheduled = 0;

          outer: for (let offset = 0; offset < days.length && classesScheduled < requiredClasses; offset++) {
            const day = days[(dayStartIndex + offset) % days.length];

            // 🚫 Already scheduled on this day? skip to next day
            if (scheduledCourseSectionDays.has(`${course_id}_${sec}_${day}`)) {
              continue outer;
            }

            let scheduledOnThisDay = false;

            for (const slot of slotsToUse) {
              if (classesScheduled >= requiredClasses) break outer;

              const teacherSlotKey = `${teacher_id}_${day}_${slot.start}`;
              if (usedTeacherSlots.has(teacherSlotKey)) continue;

              for (const room of rooms) {
                if (classesScheduled >= requiredClasses) break outer;

                const roomSlotKey = `${room.room_id}_${day}_${slot.start}`;
                if (usedRoomSlots.has(roomSlotKey)) continue;

                const conflict = await hasConflict(day, slot.start, slot.end, teacher_id, room.room_id, studentIds);
                if (!conflict) {
                  await pool.query(
                    `INSERT INTO ClassSchedule 
                     (course_id, section_type, room_id, day_of_week, start_time, end_time, academic_session)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [course_id, sec, room.room_id, day, slot.start, slot.end, academicSession]
                  );
                  allScheduledClasses.push({
                    course_id,
                    section_type: sec,
                    room_id: room.room_id,
                    day,
                    start_time: slot.start,
                    end_time: slot.end,
                    semester: course_semester,
                    academic_session: academicSession,
                    department_id
                  });

                  usedTeacherSlots.add(teacherSlotKey);
                  usedRoomSlots.add(roomSlotKey);
                  scheduledOnThisDay = true;

                  console.log(`✅ Scheduled: ${course_id} ${sec} (${department_id}) on ${day} ${slot.start}-${slot.end} in ${room.room_id}`);
                  classesScheduled++;
                  break; // exit room loop
                }
              }

              if (scheduledOnThisDay) break; // exit slot loop
            }

            if (scheduledOnThisDay) {
              scheduledCourseSectionDays.add(`${course_id}_${sec}_${day}`);
            }
          }

          if (classesScheduled < requiredClasses) {
            console.log(`⚠️ Could not fully schedule ${course_id} ${sec} (${department_id}): ${classesScheduled}/${requiredClasses} scheduled.`);
          }

          dayStartIndex++;
        }
      }
    }

    console.log(`\n--- Scheduling Complete ---`);
    console.log(`✅ Total Classes Scheduled: ${allScheduledClasses.length}`);

    const csvLines = [
      'course_id,section_type,room_id,day,start_time,end_time,semester,academic_session,department_id'
    ];

    for (const entry of allScheduledClasses) {
      csvLines.push([
        entry.course_id,
        entry.section_type,
        entry.room_id,
        entry.day,
        entry.start_time,
        entry.end_time,
        entry.semester,
        entry.academic_session,
        entry.department_id
      ].join(','));
    }

    const filePath = path.join(__dirname, 'fullClassRoutine.csv');
    fs.writeFileSync(filePath, csvLines.join('\n'));
    console.log(`✅ Schedule saved to: ${filePath}`);

  } catch (err) {
    console.error('❌ Error during schedule generation:', err);
  } finally {
    await pool.end();
  }
}

generateSchedule();
