const { Pool } = require('pg');
const { generateRoutine } = require('./utils'); // Assuming this function is defined in utils.js
const client = new Pool({
  user: 'system',
  host: 'localhost',
  database: 'postgres',
  password: 'Russel87',
  port: 5432
});


async function getExamResults(studentId) {
  const query = `
    SELECT
      er.result_id,
      er.exam_id,
      e.title AS exam_title,
      e.course_id,
      c.title AS course_title,
      e.exam_type,
      er.marks_obtained,
      er.remarks,
      e.date_of_exam,
      e.semester,
      e.academic_session
    FROM ExamResult er
    JOIN Exam e ON er.exam_id = e.exam_id
    JOIN Course c ON e.course_id = c.course_id
    WHERE er.student_id = $1
    ORDER BY e.date_of_exam;
  `;

  try {
    const res = await client.query(query, [studentId]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching exam results:', err);
    throw err;
  }
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
                ON en.course_id = cs.course_id 
                AND en.section_type = cs.section_type
            JOIN course c ON en.course_id = c.course_id
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
  const routine = generateRoutine(res);
  console.log(routine);
}
// Example usage
getStudentRoutine(2505072)
  .then(results => {
    //console.log('Student routine:', results);
  })
  .catch(err => {
    console.error('Failed to fetch results:', err);
  });
