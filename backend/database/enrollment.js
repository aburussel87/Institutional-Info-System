const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'system',
    host: 'localhost',
    database: 'postgres',
    password: 'Russel87',
    port: 5432,
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
        const students = await client.query('SELECT student_id, current_semester, department_id, advisor_id FROM student');

        for (const student of students.rows) {
            const { student_id, current_semester, department_id, advisor_id } = student;
            const deptCount = studentCounts[department_id] || 0;

            const semesterCourses = await client.query(`
                SELECT * FROM course
                WHERE semester = $1
            `, [current_semester]);

            const deptCourses = semesterCourses.rows.filter(c => c.department_id === department_id);
            const otherCourses = semesterCourses.rows.filter(c => c.department_id !== department_id);

            let selectedDeptCourses = deptCourses.sort(() => 0.5 - Math.random()).slice(0, 6);

            let selectedOtherCourses = otherCourses.sort(() => 0.5 - Math.random()).slice(0, 2);

            const finalCourses = [...selectedDeptCourses, ...selectedOtherCourses];

            for (const course of finalCourses) {
                const isLab = parseInt(course.course_id.match(/\d+/)[0]) % 2 === 0;
                const sectionType = getSectionType(student_id, deptCount, isLab);
                const enrolledOn = new Date().toISOString().slice(0, 10);

                await client.query(`
                    INSERT INTO enrollment (student_id, course_id, semester, enrolled_on, approved_by, section_type)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [student_id, course.course_id, current_semester, enrolledOn, advisor_id, sectionType]);

                const row = `${student_id},${course.course_id},${current_semester},${enrolledOn},${advisor_id},${sectionType}\n`;
                fs.appendFileSync(csvFile, row);
            }

            console.log(`Enrollment done for student: ${student_id}`);
        }
    } catch (err) {
        console.error('Enrollment generation error:', err);
    } finally {
        client.release();
    }
}

generateEnrollment();
