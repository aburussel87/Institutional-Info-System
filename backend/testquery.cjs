const client = require('../backend/config/db'); 

async function getRegistrationCourse(studentId) {
  const pending = await client.query('SELECT course_id, approved_by FROM enrollment WHERE student_id = $1 AND semester = (SELECT current_semester FROM student WHERE student_id = $2) and approved_by IS not NULL', [studentId, studentId]);

  return pending.rows;
}


(async () => {
  try {
    const result = await getRegistrationCourse(2204032);
    console.log("Registration courses:", result);
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await client.end();
  }
})();
