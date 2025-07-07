const { Pool } = require('pg');
const fs = require('fs');
const { parse } = require('json2csv');  
require('dotenv').config();


const client = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const currentSemester = "L4T2"; 
const courseSemester = "L3T2";  

async function main() {
  await client.connect();
  console.log("Connected");

  const results = [];

  const deptsRes = await client.query(`
    SELECT DISTINCT department_id
    FROM Student
    WHERE current_semester = $1
  `, [currentSemester]);

  for (const deptRow of deptsRes.rows) {
    const deptId = deptRow.department_id;
    console.log(`📚 Department: ${deptId}`);

    const studentsRes = await client.query(`
      SELECT student_id
      FROM Student
      WHERE current_semester = $1 AND department_id = $2
    `, [currentSemester, deptId]);
    const students = studentsRes.rows.map(r => r.student_id);

    const coursesRes = await client.query(`
      SELECT course_id
      FROM Course
      WHERE semester = $1 AND department_id = $2
    `, [courseSemester, deptId]);
    const courses = coursesRes.rows.map(r => r.course_id);

    if (students.length === 0 || courses.length === 0) {
      console.log(`No students or courses found for dept ${deptId}`);
      continue;
    }

    const studentCount = students.length;
    const failCount = Math.ceil(studentCount * 0.05);
    const topCount = Math.ceil(studentCount * 0.10);

    for (const courseId of courses) {
      console.log(`Preparing results for course: ${courseId}`);

      let i = 0;
      for (const studentId of students) {
        i++;
        let grade = "A";
        let gradePoint = 3 + Math.random() * 0.99;

        if (i <= failCount) {
          grade = "F";
          gradePoint = 0.0;
        } else if (i <= failCount + topCount) {
          grade = "A+";
          gradePoint = 4.0;
        } else {
          grade = "A";
          gradePoint = parseFloat((3 + Math.random() * 0.99).toFixed(2));
        }

        results.push({
          department_id: deptId,
          student_id: studentId,
          course_id: courseId,
          semester: courseSemester,
          final_grade: grade,
          grade_point: gradePoint
        });
        await client.query(`
          INSERT INTO CourseResult(student_id, course_id, semester, final_grade, grade_point)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [studentId, courseId, courseSemester, grade, gradePoint]);
      }
    }
  }

  console.log("Done generating dummy results.");
  const csv = parse(results);
  const filename = `dummy_results_${currentSemester}_${courseSemester}.csv`;
  fs.writeFileSync(filename, csv);
  console.log(`📄 CSV file saved as ${filename}`);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end();
});
