const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const notificationTypes = ['admin', 'system', 'dean'];
const semesterValues = ['L1T1', 'L1T2', 'L2T1', 'L2T2', 'L3T1', 'L3T2', 'L4T1', 'L4T2'];
const NUM_PER_ENTITY = 5;

async function fetchData(query) {
    const res = await pool.query(query);
    return res.rows;
}

function generateNotification(entityKey, entityValue) {
    const notification = {
        title: faker.company.catchPhrase(),
        message: faker.lorem.paragraph(2),
        created_by: faker.helpers.arrayElement(notificationTypes),
        created_at: faker.date.recent({ days: 10 }).toISOString().slice(0, 19).replace('T', ' '),
        student_id: null,
        teacher_id: null,
        department_id: null,
        course_id: null,
        hall_id: null,
        semester_id: null
    };
    notification[entityKey] = entityValue;
    return notification;
}

async function insertNotificationToDB(notification) {
    const {
        title, message, created_by, created_at,
        student_id, teacher_id, department_id,
        course_id, hall_id, semester_id
    } = notification;

    await pool.query(`
    INSERT INTO Notification (
      title, message, created_by, created_at,
      student_id, teacher_id, department_id,
      course_id, hall_id, semester_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
        title, message, created_by, created_at,
        student_id, teacher_id, department_id,
        course_id, hall_id, semester_id
    ]);
}

async function generateNotifications() {
    try {
        const hall = await fetchData('SELECT hall_id FROM Hall');
        const departments = await fetchData('SELECT department_id FROM Department');
        const courses = await fetchData('SELECT course_id FROM Course');
        const students = await fetchData('SELECT student_id FROM Student');
        const teachers = await fetchData('SELECT teacher_id FROM Teacher');

        const allNotifications = [];

        for (const row of departments) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('department_id', row.department_id);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }

        for (const row of courses) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('course_id', row.course_id);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }

        for (const row of students) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('student_id', row.student_id);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }

        for (const row of teachers) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('teacher_id', row.teacher_id);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }

        for (const sem of semesterValues) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('semester_id', sem);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }
        for (const row of hall) {
            for (let i = 0; i < NUM_PER_ENTITY; i++) {
                const notif = generateNotification('hall_id', row.hall_id);
                allNotifications.push(notif);
                await insertNotificationToDB(notif);
            }
        }

        const csvWriter = createCsvWriter({
            path: path.join(__dirname, 'notifications.csv'),
            header: Object.keys(allNotifications[0]).map(field => ({ id: field, title: field })),
        });

        await csvWriter.writeRecords(allNotifications);
        console.log(`Inserted ${allNotifications.length} notifications and saved to notifications.csv`);

    } catch (err) {
        console.error('Error generating/inserting notifications:', err);
    } finally {
        await pool.end();
    }
}

generateNotifications();
