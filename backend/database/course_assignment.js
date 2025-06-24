const { Pool } = require('pg');
const faker = require('@faker-js/faker').faker;

const pool = new Pool({
    user: 'system',
    host: 'localhost',
    database: 'postgres',
    password: 'Russel87',
    port: 5432,
});
const fs = require('fs');
const path = require('path');

function saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession, filename = 'assignments.csv') {
    const header = 'teacher_id,course_id,section_type,academic_session\n';
    const row = `${teacherId},${courseId},${sectionType},${academicSession}\n`;
    if (!fs.existsSync(filename)) fs.writeFileSync(filename, header);
    fs.appendFileSync(filename, row);
}



const academicSession = '2025-26';

const studentCounts = {
    1: 20, 2: 20, 3: 20, 4: 20,
    5: 180, 6: 20, 7: 20, 8: 20,
    9: 20, 10: 20, 11: 20, 12: 20
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getRandomTeacherIdByDept(deptId) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT teacher_id
            FROM teacher
            WHERE SUBSTRING(CAST(teacher_id AS TEXT) FROM 5 FOR 2) = $1;
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



function generateSections(isLab, allMode) {
    const sections = [];
    if (isLab) {
        const subs = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return subs;
    } else {
        const theory = ['A', 'B', 'C'];
        return allMode ? ['All'] : theory;
    }
}

async function assignCourses() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM Course');
        const courses = res.rows;

        const insertQuery = 'INSERT INTO SubjectAllocation (teacher_id, course_id, section_type, academic_session) VALUES ($1, $2, $3, $4)';

        for (const course of courses) {
            const courseId = course.course_id;
            const deptId = course.department_id.toString().padStart(2, '0'); 

            const isLab = parseInt(courseId.match(/\d+/)[0]) % 2 === 0;
            const allMode = Math.random() < 0.25; 
            let studentCount = studentCounts[parseInt(course.department_id)];

            let sectionTypes = ['A'];
            if (studentCount >= 120 && isLab) {
                sectionTypes = generateSections(isLab, false);
            } else if (studentCount >= 120 && !isLab) {
                sectionTypes = generateSections(isLab, allMode);
            }

            let teacherId = null;
            let tries = 0;
            const maxTries = 10;
            while (!teacherId && tries < maxTries) {
                teacherId = await getRandomTeacherIdByDept(deptId);
                tries++;
            }
            if (!teacherId) {
                console.error(`No teacher found for department ${deptId}, skipping course ${courseId}`);
                continue; 
            }

        
            for (const sectionType of sectionTypes) {
                if (sectionType === 'All') {
                    await client.query(insertQuery, [teacherId, courseId, sectionType, academicSession]);
                    console.log(`Assigned ${courseId} to teacher ${teacherId} for all sections`);
                    saveAssignmentToCsv(teacherId, courseId, 'All', academicSession);
                    break;
                }
                await client.query(insertQuery, [teacherId, courseId, sectionType, academicSession]);
                console.log(`Assigned ${courseId} to teacher ${teacherId} for section ${sectionType}`);
                saveAssignmentToCsv(teacherId, courseId, sectionType, academicSession);
        
            }
        }

    } catch (err) {
        console.error('Error assigning courses:', err);
    } finally {
        client.release();
    }
}





assignCourses();
