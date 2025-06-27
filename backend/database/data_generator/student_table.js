const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function updateStudents() {
    try {
        await client.connect();

        const advisorsPerDeptRes = await client.query(`
            SELECT t.department_id, a.teacher_id
            FROM Advisor a
            JOIN Teacher t ON a.teacher_id = t.teacher_id
            ORDER BY t.department_id, a.teacher_id
        `);

        const advisorMap = {};
        advisorsPerDeptRes.rows.forEach(row => {
            if (!advisorMap[row.department_id]) advisorMap[row.department_id] = [];
            advisorMap[row.department_id].push(row.teacher_id);
        });

        const studentsRes = await client.query(`
            SELECT student_id FROM Student
            WHERE department_id IS NULL 
               OR academic_session IS NULL 
               OR current_semester IS NULL 
               OR advisor_id IS NULL
        `);

        const filename = 'students_table.csv';
        const header = 'student_id,department_id,academic_session,current_semester,advisor_id\n';
        if (!fs.existsSync(filename)) fs.writeFileSync(filename, header);

        for (const { student_id } of studentsRes.rows) {
            const studentIdStr = student_id.toString();
            const yearPrefix = parseInt(studentIdStr.substring(0, 2));
            const deptCode = parseInt(studentIdStr.substring(2, 4));

            let semester = null;
            if (yearPrefix === 25) semester = 'L1T2';
            else if (yearPrefix === 24) semester = 'L2T2';
            else if (yearPrefix === 23) semester = 'L3T2';
            else if (yearPrefix === 22) semester = 'L4T2';
            else semester = 'L1T1';

            const advisors = advisorMap[deptCode] || [];
            let advisorId = null;
            if (advisors.length > 0) {
                const semesterIndex = ['L1T1', 'L1T2', 'L2T1', 'L2T2', 'L3T1', 'L3T2', 'L4T1', 'L4T2'].indexOf(semester);
                advisorId = advisors[semesterIndex % advisors.length];
            }

            await client.query(`
                UPDATE Student
                SET 
                    department_id = COALESCE(department_id, $1),
                    academic_session = '2025-26',
                    current_semester = $2,
                    advisor_id = COALESCE(advisor_id, $3)
                WHERE student_id = $4
            `, [deptCode, semester, advisorId, student_id]);

            const row = `${student_id},${deptCode},2025-26,${semester},${advisorId}\n`;
            fs.appendFileSync(filename, row);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

updateStudents();
