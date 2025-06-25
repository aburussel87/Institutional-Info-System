const { Client } = require('pg');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


client.connect();

function generateRandomDateBetween(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function generatePhoneNumber() {
    return `01${Math.floor(Math.random() * 5) + 5}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomGender() {
    const genders = ['Male', 'Female', 'Other'];
    return genders[Math.floor(Math.random() * genders.length)];
}

const filename = 'students_updated.csv';
const header = 'user_id,username,email,phone,dob,gender,date_joined,last_login\n';
if (!fs.existsSync(filename)) fs.writeFileSync(filename, header);

function saveToCsvRow(data) {
    const row = `${data.user_id},${data.username},${data.email},${data.phone},${data.dob},${data.gender},${data.date_joined},${data.last_login}\n`;
    fs.appendFileSync(filename, row);
}

async function updateStudents() {
    try {
        const res = await client.query(`SELECT user_id FROM "User" WHERE role = 'Student' and username is null`);
        const students = res.rows;

        for (const { user_id } of students) {
            const fullName = faker.person.fullName();
            const email = faker.internet.email(fullName.split(' ')[0], fullName.split(' ')[1] || '');
            const phone = generatePhoneNumber();
            const dob = generateRandomDateBetween(1980, 2005);
            const gender = generateRandomGender();
            const dateJoined = generateRandomDateBetween(2018, 2025);
            const lastLogin = generateRandomDateBetween(2023, 2025);

            const updateQuery = {
                text: `UPDATE "User" SET 
                    username = $1, 
                    email = $2, 
                    phone = $3, 
                    dob = $4, 
                    gender = $5, 
                    date_joined = $6,
                    last_login = $7
                    WHERE user_id = $8`,
                values: [fullName, email, phone, dob, gender, dateJoined, lastLogin, user_id]
            };

            await client.query(updateQuery);
            console.log(`Updated student: ${user_id} (${fullName})`);

            saveToCsvRow({
                user_id,
                username: fullName,
                email,
                phone,
                dob,
                gender,
                date_joined: dateJoined,
                last_login: lastLogin
            });
        }
    } catch (err) {
        console.error('Error updating students:', err);
    } finally {
        await client.end();
        console.log('Done updating all students and saved to', filename);
    }
}

updateStudents();
