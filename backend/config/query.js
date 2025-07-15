const client = require('./db');
const { generateRoutine, formatGradeSheet, formatSemesterRoutine, formatFee, formatExamData } = require('../utils');







async function get_scheduled_exam_by_teacher(teacherId, session = '2025-26') {
  const query = `SELECT * FROM get_exams_by_teacher_and_session($1,$2)`;

  const res = await client.query(query, [teacherId, session]);
  return res.rows;
}

async function getRegistrationCourse(sid) {
  const query = `SELECT * from get_registration_course($1);`;
  const res = await client.query(query, [sid]);
  return res.rows;
}

async function getGradeSheet(uid) {
  const query = `
  SELECT * FROM get_student_grades($1);
  `;
  const result = await client.query(query, [uid]);
  return formatGradeSheet(result.rows);
}


async function getEnrolledCourse(studentId) {
  const query = `
    SELECT * FROM get_student_enrolled_courses($1);
  `;
  try {
    const result = await client.query(query, [studentId]);
    return result.rows;
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    throw err;
  }
}

async function getSessionInfo(uid) {
  const query = `
    SELECT * from last_7_days_login($1);
  `;
  const res = await client.query(query, [uid]);
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows;
}


async function getTeacherInfo(teacherId) {
  const query = `SELECT get_teacher_info($1);`;
  const res = await client.query(query, [teacherId]);

  if (!res.rows || res.rows.length === 0) {
    return null;
  }

  return res.rows[0] || null;
}



async function get_teached_Course(teacherId) {
  const query = `
    SELECT * FROM get_teacher_courses($1);
  `;

  const res = await client.query(query, [teacherId]);
  return res.rows;
}

async function get_allstudent_info_under_ateacher(teacherId) {  //change by provat
  const query = `
    SELECT * FROM get_students_by_advisor($1);

  `;

  const res = await client.query(query, [teacherId]);
  return res.rows;
}

async function get_hall_info_by_provost(teacherId) {
  const query = `
   
SELECT * FROM get_hall_info_by_provost($1);

  `;

  const res = await client.query(query, [teacherId]);
  return res.rows;
}



async function get_exam_info_by_teacher(teacherId) {
  const query = `
   

SELECT * FROM get_all_exams_by_teacher($1);

  `;

  const res = await client.query(query, [teacherId]);
  return res.rows;
}


async function get_course_info_by_teacher(teacherId, academic_session = '2025-26') {
  const query = `
   

SELECT * FROM get_courses_by_teacher_id($1, $2);

  `;

  const res = await client.query(query, [teacherId, academic_session]);
  return res.rows;
}

async function getStudent_exam_Routine(studentId, session = '2025-26') {
  const query = `
    SELECT * FROM get_student_exams($1,$2);
  `;
  const res = await client.query(query, [studentId, session]);
  return (formatExamData(res.rows));
}

async function getUserNotifications(uid, role) {
  const query = `
    SELECT * FROM get_user_notifications($1,$2);
  `;
  const res = await client.query(query, [uid, role]);
  return res.rows;
}


async function pay_student_fee(feeId) {
  const query = `
    SELECT * FROM pay_student_fee($1,CURRENT_DATE)
  `;
  const res = await client.query(query, [feeId]);
  return res.rows;
}


async function get_all_payments_ordered_by_type(sid) {
  const query = `
    SELECT * FROM get_all_payments_ordered_by_type($1)
  `;
  const res = await client.query(query, [sid]);
  return formatFee(res.rows);
}

async function getEnrolledCourseOutline(sid) {
  const query = `
    SELECT * FROM get_student_course_outlines($1);
  `;
  const res = await client.query(query, [sid]);
  return res.rows;
}

async function getSemesterRoutine(sid) {
  const query = `
    SELECT * FROM get_class_routine($1,$2,$3);
  `;
  const subq = `
   Select current_semester , academic_session, department_id from student where student_id = $1
  `;
  const r1 = await client.query(subq, [sid]);
  let student = r1.rows[0];
  const res = await client.query(query, [student.current_semester, student.academic_session, student.department_id]);
  return formatSemesterRoutine(res.rows);
}


async function getStudentInfo(studentId) {
  const query = `
    SELECT * FROM get_student_full_info($1);
  `;

  const res = await client.query(query, [studentId]);
  return res.rows;
}

// all are function above this 

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


async function getUser(uid) {
  try {
    let user = {
      user_table: [],
      role_table: [],
      emergency_contact: []
    };

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


async function updateLogin(uid) {
  try {
    const query = 'UPDATE "User" SET "login_attempts" = "login_attempts" + 1, last_login = CURRENT_TIMESTAMP WHERE "user_id" = $1';
    const result = await client.query(query, [uid]);
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}


async function get_student_hall_details(studentId) {
  const query = `
    SELECT * FROM get_student_hall_details($1);
  `;
  const res = await client.query(query, [studentId]);
  return res.rows;
}


async function get_students_by_provost(studentId) {
  const query = `
    SELECT * FROM get_students_by_provost($1);
  `;
  const res = await client.query(query, [studentId]);
  return res.rows;
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
  getSemesterRoutine,
  getEnrolledCourseOutline,
  pay_student_fee,
  get_all_payments_ordered_by_type,
  getStudent_exam_Routine,
  get_teached_Course,
  getTeacherInfo,
  getSessionInfo,
  get_allstudent_info_under_ateacher,
  get_hall_info_by_provost,
  get_exam_info_by_teacher,
  getRegistrationCourse,
  get_course_info_by_teacher,
  get_scheduled_exam_by_teacher,
  get_students_by_provost,
  get_student_hall_details

  
};