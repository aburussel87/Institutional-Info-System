const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

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

async function getTeachersByDept(deptId) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT teacher_id
            FROM teacher
            WHERE SUBSTRING(CAST(teacher_id AS TEXT) FROM 5 FOR 2) = $1
            ORDER BY teacher_id
        `;
        const result = await client.query(query, [deptId.toString()]);
        return result.rows.map(row => row.teacher_id);
    } catch (err) {
        console.error('Error fetching teachers:', err);
        return [];
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
        if (Math.random() < 0.35) return ['All'];
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
        const res = await client.query('SELECT * FROM Course where course_id in (select distinct(course_id) from enrollment)');
        const courses = res.rows;

        const insertQuery = `
            INSERT INTO SubjectAllocation (teacher_id, course_id, section_type, academic_session)
            VALUES ($1, $2, $3, $4)
        `;

        const teacherIndexByDept = {};

        for (const course of courses) {
            const courseId = course.course_id;
            const deptId = course.department_id;
            const semester = course.semester;
            const isLab = parseInt(courseId.match(/\d+/)[0]) % 2 === 0;
            const deptIdStr = deptId.toString().padStart(2, '0');

            const studentCount = await getStudentCount(deptId, semester, academicSession);
            if (studentCount === 0) {
                console.log(`No students for Dept ${deptId}, Semester ${semester}, skipping ${courseId}`);
                continue;
            }

            const sectionTypes = getSections(isLab, studentCount);

            if (!teacherIndexByDept[deptId]) {
                const teacherList = await getTeachersByDept(deptIdStr);
                if (teacherList.length === 0) {
                    console.error(`No teachers found for Dept ${deptId}`);
                    continue;
                }
                teacherIndexByDept[deptId] = { list: teacherList, index: 0 };
            }

            const { list: teacherList } = teacherIndexByDept[deptId];

            for (const sectionType of sectionTypes) {
                let currentIndex = teacherIndexByDept[deptId].index;
                let teacherId = teacherList[currentIndex];

                await client.query(insertQuery, [teacherId, courseId, sectionType, academicSession]);
                saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession);

                teacherIndexByDept[deptId].index = (currentIndex + 1) % teacherList.length;

                if (sectionType === 'All') {
                    if (Math.random() < 0.5) {
                        let extraTeachers = 2;
                        while (extraTeachers--) {
                            currentIndex = teacherIndexByDept[deptId].index;
                            teacherId = teacherList[currentIndex];
                            await client.query(insertQuery, [teacherId, courseId, sectionType, academicSession]);
                            saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession);
                            teacherIndexByDept[deptId].index = (currentIndex + 1) % teacherList.length;
                        }
                    }
                    break;
                }
            }
        }
    } catch (err) {
        console.error('Error assigning courses:', err);
    } finally {
        client.release();
    }
}

assignCourses();
