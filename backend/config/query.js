const client = require('./db');
const { generateRoutine, formatGradeSheet,formatSemesterRoutine } = require('../utils');


// getUserInfo(uid) – Fetches all user information for a given user ID.
// getAllUser() – Retrieves all users from the database.
// getRoleInfo(uid) – (Empty) Intended to fetch role-specific info for a user.
// getStudentRoutine(studentId) – Gets the class schedule (routine) for a student based on current semester.
// getTeacherRoutine(teacherId) – Gets the class schedule (routine) for a teacher based on subject allocations.
// getUserNotifications(userId, role) – Retrieves relevant notifications for a user based on their role.
// getGradeSheet(uid) – Returns a student's formatted gradesheet including GPA and course info.
// updateLogin(uid) – Increments login attempt count and updates last login timestamp for a user.
// getUser(uid) – Fetches detailed user information including role-specific data.
// getImage(uid) – Retrieves the profile image of a user based on their ID.
// getCourseInfo
// semester routine

async function getSemesterRoutine(sid) {
  const query = `
    SELECT * FROM get_class_routine($1,$2,$3);
  `;
  const subq = `
   Select current_semester , academic_session, department_id from student where student_id = $1
  `;
  const r1 = await client.query(subq,[sid]);
  let student = r1.rows[0];
  const res = await client.query(query, [student.current_semester,student.academic_session,student.department_id]);
  return formatSemesterRoutine(res.rows);
}


async function getStudentInfo(studentId) {
  const query = `
    SELECT * FROM get_student_full_info($1);
  `;

  const res = await client.query(query, [studentId]);
  return res.rows;
}

async function getCourseInfo(studentId) {
  const query = `
    WITH course_info AS (
    SELECT c.course_id, c.title AS course_title, c.semester,
           d1.name AS department_name,
           d2.name AS offered_by
    FROM course c
    JOIN department d1 ON c.department_id = d1.department_id
    JOIN department d2 ON c.offered_by = d2.department_id
    WHERE c.course_id = $1
),
students AS (
    SELECT COUNT(*) AS enrolled_students
    FROM enrollment
    WHERE course_id = $1
),
teachers AS (
    SELECT ARRAY_AGG(u.username) AS assigned_teachers
    FROM subjectallocation sa
    JOIN teacher t ON sa.teacher_id = t.teacher_id
    JOIN "User" u ON t.teacher_id = u.user_id
    WHERE sa.course_id = $1
)
SELECT ci.course_id, ci.course_title, ci.semester,
       ci.department_name, ci.offered_by,
       COALESCE(s.enrolled_students, 0) AS enrolled_students,
       COALESCE(t.assigned_teachers, ARRAY[]::TEXT[]) AS assigned_teachers
FROM course_info ci
CROSS JOIN students s
CROSS JOIN teachers t;
  `;

  const res = await client.query(query, [studentId]);
  return res.rows;
}



async function getEnrolledCourse(studentId) {
  const query = `
    SELECT 
    e.course_id,
    c.title AS course_title,
    c.credit_hours,
    d.name AS offered_by,
    COALESCE(u.username, 'Not Assigned') AS teacher_name
FROM enrollment e
JOIN course c ON e.course_id = c.course_id
JOIN department d ON d.department_id = c.offered_by
LEFT JOIN subjectallocation sa ON e.course_id = sa.course_id 
LEFT JOIN teacher t ON sa.teacher_id = t.teacher_id
LEFT JOIN "User" u ON t.teacher_id = u.user_id
WHERE e.student_id = $1 AND (sa.section_type = 'All' or e.section_type = sa.section_type);
`
  try {
    const result = await client.query(query, [studentId]);
    return result.rows;
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    throw err;
  }
}

async function getUser(uid) {
  try {
    let user = {
      user_table: [],
      role_table: [],
      emergency_contact: []
    };

    // Get user general info
    let query = 'SELECT * FROM "User" WHERE user_id = $1';
    let result = await client.query(query, [uid]);

    if (result.rows.length === 0) {
      return null;
    }

    user.user_table = result.rows[0];

    const role = result.rows[0].role;
    if (role === 'Student') {
      query = 'SELECT * FROM student WHERE student_id = $1';
    } else if (role === 'Teacher') {
      query = 'SELECT * FROM teacher WHERE teacher_id = $1';
    } else if (role === 'Admin') {
      query = 'SELECT * FROM admin WHERE admin_id = $1';
    }

    result = await client.query(query, [uid]);
    user.role_table = result.rows[0];

    const contactQuery = 'SELECT * FROM emergencycontact WHERE user_id = $1';
    const contactResult = await client.query(contactQuery, [uid]);
    if (contactResult.rows.length > 0) {
      user.emergency_contact = contactResult.rows;
    }

    return user;

  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}

async function getImage(uid) {
  try {
    const query = 'SELECT photo FROM "User" WHERE user_id = $1';
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
    const query = 'SELECT * FROM "User"';
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
      en.student_id, 
      en.course_id, 
      c.title AS course_title,
      cs.day_of_week, 
      cs.start_time, 
      cs.end_time
    FROM enrollment en
    JOIN classschedule cs 
      ON en.course_id = cs.course_id AND en.section_type in (cs.section_type, 'All')
    JOIN course c 
      ON en.course_id = c.course_id
    WHERE en.student_id = $1
    ORDER BY 
      CASE 
        WHEN cs.day_of_week = 'Saturday' THEN 1
        WHEN cs.day_of_week = 'Sunday' THEN 2
        WHEN cs.day_of_week = 'Monday' THEN 3
        WHEN cs.day_of_week = 'Tuesday' THEN 4
        WHEN cs.day_of_week = 'Wednesday' THEN 5
        WHEN cs.day_of_week = 'Thursday' THEN 6
        WHEN cs.day_of_week = 'Friday' THEN 7
      END,
      cs.start_time;
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

async function getGradeSheet(uid) {
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
  const result = await client.query(query, [uid]);
  return formatGradeSheet(result.rows);
}


async function updateLogin(uid) {
  try {
    const query = 'UPDATE "User" SET "login_attempts" = "login_attempts" + 1, last_login = CURRENT_TIMESTAMP WHERE "user_id" = $1';
    const result = await client.query(query, [uid]);
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}

module.exports = {
  getUserInfo,
  getRoleInfo,
  getStudentRoutine,
  getTeacherRoutine,
  getUserNotifications,
  getGradeSheet,
  getAllUser,
  updateLogin,
  getUser,
  getImage,
  getEnrolledCourse,
  getCourseInfo,
  getStudentInfo,
  getSemesterRoutine
};