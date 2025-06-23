const client = require('./db');
const {generateRoutine, formatGradeSheet} = require('../utils');
async function getUserInfo(uid) {
  try {
    const query = 'SELECT * FROM "User" WHERE user_id = $1';
    const result = await client.query(query, [uid]);

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}

async function getAllUser() {
  try {
    const query = 'SELECT * FROM "User" s where mod(user_id,2)=0';
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows;
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}

async function getRoleInfo(uid) {

}

async function getStudentRoutine(studentId) {

  const query = `
  SELECT 
    cs.day_of_week,
    c.title AS course_title,
    cs.start_time
  FROM "enrollment" e
  JOIN "classschedule" cs 
    ON e.course_id = cs.course_id 
    AND e.section_type = cs.section_type 
    AND e.semester = cs.semester
  JOIN "course" c ON e.course_id = c.course_id
  JOIN "student" s on e.semester = s.current_semester
  WHERE e.student_id = $1 
  ORDER BY cs.day_of_week, cs.start_time;
`;


  const res = await client.query(query, [studentId]);
  return generateRoutine(res);
}


async function getTeacherRoutine(teacherId) {
  const query = `
    SELECT 
      cs.day_of_week,
      c.title AS course_title,
      cs.start_time
    FROM "subjectallocation" sa
    JOIN "classschedule" cs 
      ON sa.course_id = cs.course_id 
      AND sa.section_type = cs.section_type 
      AND sa.academic_session = cs.academic_session
    JOIN "course" c ON sa.course_id = c.course_id
    WHERE sa.teacher_id = $1
    ORDER BY cs.day_of_week, cs.start_time;
  `;

  const res = await client.query(query, [teacherId]);
  return generateRoutine(res);
}


async function getUserNotifications(userId, role) {
  let query = '';
  let values = [];

  if (role === 'Student') {
    query = `
      SELECT message
      FROM "notification"
      WHERE student_id = $1
         OR department_id = (
            SELECT department_id FROM "student" WHERE student_id = $1
         )
         OR hall_id = (
            SELECT hall_id FROM student WHERE student_id = $1
         )
         OR semester_id = (
            SELECT current_semester FROM student WHERE student_id = $1
         )
         OR course_id IN (
            SELECT course_id FROM "enrollment" e join student s
            on e.student_id = s.student_id 
            where e.student_id = $1 and e.semester = s.current_semester
         )
      ORDER BY created_at DESC;
    `;
    values = [userId];
  } else if (role === 'Teacher') {
    query = `
      SELECT message
      FROM "notification"
      WHERE teacher_id = $1
         OR department_id = (
            SELECT department_id FROM "teacher" WHERE teacher_id = $1
         )
         OR course_id IN (
            SELECT course_id FROM "subjectallocation" WHERE teacher_id = $1
         )
      ORDER BY created_at DESC;
    `;
    values = [userId];
  } else if (role === 'Admin') {
    query = `
      SELECT message
      FROM "notification"
      ORDER BY created_at DESC;
    `;
  }

  try {
    const result = await client.query(query, values);
    return result.rows.map(row => row.message);
  } catch (err) {
    console.error('Notification fetch error:', err);
    return [];
  }
}

async function getGradeSheet(uid){
  const query = `
  SELECT 
  s.student_id,
  s.current_semester AS level_term,
  c.course_id,
  c.title,
  c.credit_hours AS credit,
  cr.grade_point AS gpa
FROM courseresult cr
JOIN course c ON cr.course_id = c.course_id
JOIN student s ON cr.student_id = s.student_id
WHERE s.student_id = $1
ORDER BY cr.semester;
  `;
const result = await client.query(query,[uid]);
  return formatGradeSheet(result.rows);
}

module.exports = {
  getUserInfo,
  getRoleInfo,
  getStudentRoutine,
  getTeacherRoutine,
  getUserNotifications,
  getGradeSheet,
  getAllUser
};