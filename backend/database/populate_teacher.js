const bcrypt = require('bcryptjs');
const fs = require('fs');
const { Client } = require('pg');
const { faker } = require('@faker-js/faker');  
require('dotenv').config();

const client = new Client({
    user: 'system',
    host: 'localhost',
    database: 'postgres',
    password: 'Russel87',
    port: '5432'
});

client.connect();

const NUM_TEACHERS_PER_DEPT = 20;
const PASSWORD_LENGTH = 8;
const departments = {
    1: 'CSE', 2: 'EEE', 3: 'BME', 4: 'NCE',
    5: 'Math', 6: 'Physics', 7: 'Chemical', 8: 'Chemistry',
    9: 'MME', 10: 'Civil', 11: 'Mechanical', 12: 'Architecture'
};

const usedIds = new Set();

function generateRandomPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pw = '';
    for (let i = 0; i < length; i++) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
}

function generateUserId(joinYear, deptCode) {
    let userId;
    do {
        const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digits
        userId = `${joinYear}${String(deptCode).padStart(2, '0')}${randomPart}`;
    } while (usedIds.has(userId));
    usedIds.add(userId);
    return userId;
}

function generateRandomDate(year) {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generatePhoneNumber() {
    return `01${Math.floor(Math.random() * 5) + 5}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomGender() {
    const g = ['Male', 'Female', 'Other'];
    return g[Math.floor(Math.random() * g.length)];
}

function sanitizeUsername(name) {
    return name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '.');
}

function saveToCsvRow(userId, username, email, phone, dob, gender,password, hashed,deptCode, joinDate, lastLogin, filename = 'teachers.csv') {
    const header = 'ID,Username,Email,Phone,DOB,Gender,Hashed Password,Join Date,Last Login\n';
    const row = `${userId},${username},${email},${phone},${dob},${gender},${password},${hashed},Teacher,${deptCode},${joinDate},${lastLogin}\n`;
    if (!fs.existsSync(filename)) fs.writeFileSync(filename, header);
    fs.appendFileSync(filename, row);
}


async function insertTeacher(userId, username, email, phone, dob, gender, hash, joinDate, lastLogin) {
    const query = {
        text: `INSERT INTO "User" 
      (user_id, username, password_hash, email, phone, dob, gender, role, 
       date_joined, is_active, last_login, login_attempts, two_fa_enabled) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,'Teacher',$8,true,$9,0,false)`,
        values: [
            userId, username, hash, email, phone,
            dob, gender, joinDate, lastLogin
        ]
    };

    try {
        await client.query(query);
        console.log(`Inserted: ${userId}`);
    } catch (err) {
        console.error(`Error inserting ${userId}:`, err.message);
    }
}

(async () => {
    for (let deptCode = 1; deptCode <= 12; deptCode++) {
        console.log(`Generating for Dept ${deptCode} - ${departments[deptCode]}`);
        for (let i = 0; i < NUM_TEACHERS_PER_DEPT; i++) {
            const joinYear = Math.floor(Math.random() * 26) + 2000;
            const userId = generateUserId(joinYear, deptCode);
            const rawPassword = generateRandomPassword(PASSWORD_LENGTH);
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            const dept = deptCode;
            const fullName = faker.person.fullName(); 
            const username = fullName;
            const email = faker.internet.email(username.split('.')[0], username.split('.')[1] || '');


            const phone = generatePhoneNumber();
            const dob = generateRandomDate(joinYear - 30);
            const gender = generateRandomGender();
            const joinDate = generateRandomDate(joinYear);
            const lastLogin = generateRandomDate(joinYear + 1);

            await insertTeacher(userId, username, email, phone, dob, gender, hashedPassword, joinDate, lastLogin);

            saveToCsvRow(userId, username, email, phone, dob, gender,rawPassword, hashedPassword,deptCode, joinDate, lastLogin);
        }
    }

    console.log('All teacher accounts created and saved to teachers.csv');
    await client.end();
})();
