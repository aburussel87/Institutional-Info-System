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
const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
const timeSlots = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'];

async function generateClassSchedule() {
  const client = await pool.connect();
  const csvPath = path.join(__dirname, 'class_schedule.csv');

  try {
    const roomRes = await client.query('SELECT room_id, room_type FROM Room');
    const classroomRooms = roomRes.rows.filter(r => r.room_type === 'Classroom').map(r => r.room_id);
    const labRooms = roomRes.rows.filter(r => r.room_type === 'Laboratory').map(r => r.room_id);

    if (classroomRooms.length === 0 || labRooms.length === 0) {
      console.error('❌ Missing rooms. Ensure both classroom and lab rooms exist.');
      return;
    }

    const allocationRes = await client.query(`
      SELECT sa.teacher_id, sa.course_id, sa.section_type, c.credit_hours
      FROM SubjectAllocation sa
      JOIN Course c ON sa.course_id = c.course_id
    `);

    const allocations = allocationRes.rows;

    const csvHeader = 'teacher_id,course_id,section_type,room_id,day_of_week,start_time,end_time,academic_session\n';
    fs.writeFileSync(csvPath, csvHeader);

    let dayIndex = 0;
    let timeIndex = 0;
    let classroomIndex = 0;
    let labIndex = 0;

    for (const alloc of allocations) {
      const { teacher_id, course_id, section_type, credit_hours } = alloc;

      const isLab = credit_hours === 1.5;
      const numClasses = isLab ? 1 : Math.floor(credit_hours);

      for (let i = 0; i < numClasses; i++) {
        const day = days[dayIndex % days.length];
        const startTime = timeSlots[timeIndex % timeSlots.length];
        const endTime = new Date(`1970-01-01T${startTime}`);
        endTime.setHours(endTime.getHours() + 1);
        const endTimeStr = endTime.toTimeString().substring(0, 8);

        const room = isLab
          ? labRooms[labIndex % labRooms.length]
          : classroomRooms[classroomIndex % classroomRooms.length];

        await client.query(
          `INSERT INTO ClassSchedule (course_id, section_type, room_id, day_of_week, start_time, end_time, academic_session)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [course_id, section_type, room, day, startTime, endTimeStr, academicSession]
        );

        const csvRow = `${teacher_id},${course_id},${section_type},${room},${day},${startTime},${endTimeStr},${academicSession}\n`;
        fs.appendFileSync(csvPath, csvRow);

        dayIndex++;
        if (dayIndex % days.length === 0) timeIndex++;
        if (!isLab && timeIndex % timeSlots.length === 0) classroomIndex++;
        if (isLab) labIndex++;
      }
    }

    console.log('Class schedule saved in database and CSV:', csvPath);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
  }
}

generateClassSchedule();
