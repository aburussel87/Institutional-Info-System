const { Client } = require('pg');
const { format, addDays, isFriday } = require('date-fns');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

function randomDateAround(base, before = true) {
  let date;
  do {
    const days = Math.floor(Math.random() * 10) + 1;
    date = before ? addDays(base, -days) : addDays(base, days);
  } while (isFriday(date));
  return date;
}

function randomNovember(year) {
  let date;
  do {
    const day = Math.floor(Math.random() * 30) + 1;
    date = new Date(`${year}-11-${String(day).padStart(2, '0')}`);
  } while (isFriday(date));
  return date;
}

function generateExamId(courseId, type, idx) {
  const base = courseId.slice(-4); // last 4 digits of course_id
  if (type === 'CT') return `${base}T${idx}`;   // e.g., 1101T1
  if (type === 'TERM') return `${base}TM`;     // e.g., 1101TM
  if (type === 'QUIZ') return `${base}QZ`;     // e.g., 1102QZ
  return `${base}XX`; // fallback
}


async function populateExams(semester, departmentId) {
  if (!semester || !departmentId) {
    throw new Error('Both semester and departmentId are required');
  }

  await client.connect();

  const today = new Date();
  const currentYear = today.getFullYear();

  const courses = await client.query(
    `SELECT course_id, title, semester FROM Course
     WHERE semester = $1 AND department_id = $2`,
    [semester, departmentId]
  );

  console.log(`Found ${courses.rows.length} courses.`);

  const allExams = [];

  for (const course of courses.rows) {
    const { course_id, title } = course;
    const last3 = parseInt(course_id.slice(-3));
    const isTheory = last3 % 2 === 1;

    const exams = [];
    const usedDates = [];

    if (isTheory) {
      console.log(`Theory course: ${course_id}`);

      // Generate 4 CTs
      for (let i = 1; i <= 4; i++) {
        let date;
        do {
          date = randomDateAround(today, i <= 2);
        } while (
          usedDates.some(
            (d) => Math.abs((d - date) / (1000 * 60 * 60 * 24)) < 4
          )
        );
        usedDates.push(date);

        exams.push({
          exam_id: generateExamId(course_id, 'CT', i),
          course_id,
          title,
          exam_type: `CT${i}`,
          total_marks: 20,
          date_of_exam: format(date, 'yyyy-MM-dd HH:mm:ss'),
          semester,
          academic_session: '2025-26'
        });
      }

      // Term exam in November
      let termDate;
      do {
        termDate = randomNovember(currentYear);
      } while (
        usedDates.some(
          (d) => Math.abs((d - termDate) / (1000 * 60 * 60 * 24)) < 4
        )
      );
      usedDates.push(termDate);

      exams.push({
        exam_id: generateExamId(course_id, 'TERM', ''),
        course_id,
        title,
        exam_type: `Term`,
        total_marks: 270,
        date_of_exam: format(termDate, 'yyyy-MM-dd HH:mm:ss'),
        semester,
        academic_session: `${currentYear}-${currentYear + 1}`
      });

    } else {
      console.log(`Lab course: ${course_id}`);

      // Single Quiz for lab
      let quizDate;
      do {
        quizDate = randomDateAround(today, false);
      } while (isFriday(quizDate));

      exams.push({
        exam_id: generateExamId(course_id, 'QUIZ', ''),
        course_id,
        title,
        exam_type: `Quiz`,
        total_marks: 50,
        date_of_exam: format(quizDate, 'yyyy-MM-dd HH:mm:ss'),
        semester,
        academic_session: `${currentYear}-${currentYear + 1}`
      });
    }

    for (const exam of exams) {
      console.log(`Preparing exam: ${exam.exam_id} on ${exam.date_of_exam}`);

      await client.query(
        `INSERT INTO Exam (exam_id, course_id, title, exam_type, total_marks, date_of_exam, semester, academic_session)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (exam_id) DO NOTHING`,
        [
          exam.exam_id,
          exam.course_id,
          exam.title,
          exam.exam_type,
          exam.total_marks,
          exam.date_of_exam,
          exam.semester,
          '2025-26'
        ]
      );

      allExams.push(exam);
    }
  }

  await client.end();

  const csvWriter = createCsvWriter({
    path: `exam_schedule_${semester}_${departmentId}.csv`,
    header: [
      {id: 'exam_id', title: 'Exam ID'},
      {id: 'course_id', title: 'Course ID'},
      {id: 'title', title: 'Title'},
      {id: 'exam_type', title: 'Exam Type'},
      {id: 'total_marks', title: 'Total Marks'},
      {id: 'date_of_exam', title: 'Date of Exam'},
      {id: 'semester', title: 'Semester'},
      {id: 'academic_session', title: 'Academic Session'}
    ]
  });

  await csvWriter.writeRecords(allExams);
  console.log(`✅ Saved ${allExams.length} exams to CSV.`);
}

// Call it directly
populateExams('L4T2', 4)
  .then(() => console.log('🎉 Done!'))
  .catch(console.error);
