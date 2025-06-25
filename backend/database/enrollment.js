const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


const studentCounts = {
    1: 20, 2: 20, 3: 20, 4: 20,
    5: 180, 6: 20, 7: 20, 8: 20,
    9: 20, 10: 20, 11: 20, 12: 20
};

function getSectionType(studentId, deptCount, isLab) {
    const last3 = studentId % 1000;
    if (deptCount >= 120) {
        if (isLab) {
            const subsections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const groupSize = Math.ceil(deptCount / 6);
            const index = Math.floor(last3 / groupSize);
            return subsections[Math.min(index, 5)];
        } else {
            const sections = ['A', 'B', 'C'];
            const groupSize = Math.ceil(deptCount / 3);
            const index = Math.floor(last3 / groupSize);
            return sections[Math.min(index, 2)];
        }
    } else {
        return isLab ? 'A1' : 'A';
    }
}

async function generateEnrollment() {
    const client = await pool.connect();
    const csvFile = 'enrollment.csv';
    const header = 'student_id,course_id,semester,enrolled_on,approved_by,section_type\n';
    if (!fs.existsSync(csvFile)) fs.writeFileSync(csvFile, header);

    try {
        const departments = await client.query('SELECT DISTINCT department_id FROM student');

        for (const dept of departments.rows) {
            const departmentId = dept.department_id;
            console.log(`\n Processing Department: ${departmentId}`);

            const studentsResult = await client.query(`
                SELECT student_id, current_semester, advisor_id
                FROM student
                WHERE department_id = $1
            `, [departmentId]);

            const students = studentsResult.rows;
            const semesters = ['L1T1', 'L1T2', 'L2T1', 'L2T2', 'L3T1', 'L3T2', 'L4T1', 'L4T2'];

            for (const semester of semesters) {
                console.log(`  Semester: ${semester}`);
                const semesterStudents = students.filter(s => s.current_semester === semester);
                const semesterStudentCount = semesterStudents.length;

                if (semesterStudentCount === 0) {
                    console.log(`  No students in this semester for this department`);
                    continue;
                }

                const mainCoursesResult = await client.query(`
                    SELECT * FROM course
                    WHERE department_id = $1 AND semester = $2 AND department_id = offered_by
                `, [departmentId, semester]);
                const mainCourses = mainCoursesResult.rows;

                const otherCoursesResult = await client.query(`
                    SELECT * FROM course
                    WHERE department_id = $1 AND semester = $2 AND department_id != offered_by
                `, [departmentId, semester]);
                const otherCourses = otherCoursesResult.rows;

                if (mainCourses.length === 0 && otherCourses.length === 0) {
                    console.log(`  No courses for this department and semester`);
                    continue;
                }

                for (const student of semesterStudents) {
                    const { student_id, advisor_id } = student;
                    const enrolledOn = new Date().toISOString().slice(0, 10);
                    const selectedMainCourses = mainCourses.slice(0, 7);
                    let selectedOtherCourse = null;
                    if (otherCourses.length > 0) {
                        selectedOtherCourse = otherCourses[0];
                    }

                    for (const course of selectedMainCourses) {
                        const isLab = parseInt(course.course_id.match(/\d+/)[0]) % 2 === 0;
                        const sectionType = getSectionType(student_id, semesterStudentCount, isLab);

                        await client.query(`
                            INSERT INTO enrollment (student_id, course_id, semester, enrolled_on, approved_by, section_type)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT DO NOTHING
                        `, [student_id, course.course_id, semester, enrolledOn, advisor_id, sectionType]);

                        const row = `${student_id},${course.course_id},${semester},${enrolledOn},${advisor_id},${sectionType}\n`;
                        fs.appendFileSync(csvFile, row);
                    }

                    if (selectedOtherCourse) {
                        const isLab = parseInt(selectedOtherCourse.course_id.match(/\d+/)[0]) % 2 === 0;
                        const sectionType = getSectionType(student_id, semesterStudentCount, isLab);

                        await client.query(`
                            INSERT INTO enrollment (student_id, course_id, semester, enrolled_on, approved_by, section_type)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT DO NOTHING
                        `, [student_id, selectedOtherCourse.course_id, semester, enrolledOn, advisor_id, sectionType]);

                        const row = `${student_id},${selectedOtherCourse.course_id},${semester},${enrolledOn},${advisor_id},${sectionType}\n`;
                        fs.appendFileSync(csvFile, row);
                    }

                    console.log(` Enrolled Student: ${student_id} for semester ${semester}`);
                }
            }
        }

        console.log('\n Enrollment generation completed and saved in CSV! ');
    } catch (err) {
        console.error(' Enrollment generation error:', err);
    } finally {
        client.release();
    }
}

generateEnrollment();
