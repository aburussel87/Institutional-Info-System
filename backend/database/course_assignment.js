const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


const academicSession = '2025-26';
const outputCsv = 'assignments.csv';

function saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession) {
    const header = 'teacher_id,course_id,section_type,academic_session\n';
    const row = `${teacherId},${courseId},${sectionType},${academicSession}\n`;
    if (!fs.existsSync(outputCsv)) fs.writeFileSync(outputCsv, header);
    fs.appendFileSync(outputCsv, row);
}

async function getRandomTeacherIdByDept(deptId) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT teacher_id
            FROM teacher
            WHERE SUBSTRING(CAST(teacher_id AS TEXT) FROM 5 FOR 2) = $1
        `;
        const result = await client.query(query, [deptId.toString()]);
        if (result.rowCount === 0) return null;

        const randomIndex = Math.floor(Math.random() * result.rowCount);
        return result.rows[randomIndex].teacher_id;
    } catch (err) {
        console.error('Error fetching teacher:', err);
        return null;
    } finally {
        client.release();
    }
}


function getSections(isLab, totalStudents) {
    if (isLab) {
        if (totalStudents <= 60) return ['A1', 'A2'];
        if (totalStudents <= 120) return ['A1', 'A2', 'B1', 'B2'];
        return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    } else {
        if (Math.random() < 0.25) return ['All'];  // 25% chance for All in theory
        if (totalStudents <= 60) return ['A'];
        if (totalStudents <= 120) return ['A', 'B'];
        return ['A', 'B', 'C'];
    }
}

async function getStudentCount(deptId, semester, academicSession) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT COUNT(*) AS total
            FROM student s
            WHERE s.department_id = $1
              AND s.current_semester = $2
              AND s.academic_session = $3
        `;
        const result = await client.query(query, [deptId, semester, academicSession]);
        return parseInt(result.rows[0].total);
    } catch (err) {
        console.error('Error counting students:', err);
        return 0;
    } finally {
        client.release();
    }
}

async function assignCourses() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM Course');
        const courses = res.rows;

        const insertQuery = `
            INSERT INTO SubjectAllocation (teacher_id, course_id, section_type, academic_session)
            VALUES ($1, $2, $3, $4)
        `;

        for (const course of courses) {
            const courseId = course.course_id;
            const deptId = course.department_id;
            const semester = course.semester;
            const isLab = parseInt(courseId.match(/\d+/)[0]) % 2 === 0;

            const studentCount = await getStudentCount(deptId, semester, academicSession);

            if (studentCount === 0) {
                console.log(`No students found for Dept ${deptId}, Semester ${semester}, skipping course ${courseId}`);
                continue;
            }

            const sectionTypes = getSections(isLab, studentCount);

            let teacherId = null;
            let tries = 0;
            const deptIdStr = deptId.toString().padStart(2, '0');

            while (!teacherId && tries <15) {
                teacherId = await getRandomTeacherIdByDept(deptIdStr);
                tries++;
            }
            if (!teacherId) {
                console.error(`No teacher found for Dept ${deptId}, skipping course ${courseId}`);
                continue;
            }

            for (const sectionType of sectionTypes) {
               await client.query(insertQuery, [teacherId, courseId, sectionType, academicSession]);
                console.log(`Assigned ${courseId} to teacher ${teacherId} for section ${sectionType}`);
                saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession);
                if (sectionType === 'All') break;
            }
        }
    } catch (err) {
        console.error('Error assigning courses:', err);
    } finally {
        client.release();
    }
}

assignCourses();
