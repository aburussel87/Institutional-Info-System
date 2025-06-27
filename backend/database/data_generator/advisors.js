const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function assignAdvisors() {
    try {
        await client.connect();
        const deptResult = await client.query(`SELECT DISTINCT department_id FROM Teacher`);
        const departments = deptResult.rows.map(row => row.department_id);

        for (const departmentId of departments) {
            const teacherResult = await client.query(`
                SELECT teacher_id FROM Teacher
                WHERE department_id = $1
                ORDER BY RANDOM()
                LIMIT 4
            `, [departmentId]);

            for (const { teacher_id } of teacherResult.rows) {
                await client.query(`
                    INSERT INTO Advisor (teacher_id, total_student)
                    VALUES ($1, NULL)
                `, [teacher_id]);
                console.log(`Inserted advisor: Teacher ${teacher_id} from Department ${departmentId}`);
            }
        }
        console.log('Advisor assignment complete.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

assignAdvisors();
