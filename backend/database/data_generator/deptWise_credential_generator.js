const bcrypt = require('bcryptjs');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


pool.connect();

async function generateIdsAndPasswords(year, classCode, n, passwordLength = 8, filename = 'credentials.csv') {
    if (!(year >= 1000 && year <= 9999)) throw new Error("Year must be a 4-digit number");
    if (!(classCode.length === 2 && /^\d{2}$/.test(classCode))) throw new Error("Class code must be exactly 2 digits");

    const idPasswordMap = {};
    const yearPrefix = String(year).slice(-2);
    const promises = [];

    for (let i = 21; i <= n; i++) {
        const suffix = String(i).padStart(3, '0');
        const userId = yearPrefix + classCode + suffix;
        const rawPassword = generateRandomPassword(passwordLength);

        const promise = bcrypt.hash(rawPassword, 10).then(async hashedPassword => {
            idPasswordMap[userId] = { rawPassword, hashedPassword };
            await saveToDatabase(userId, hashedPassword);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    saveToCsv(idPasswordMap, filename);
}

function generateRandomPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function saveToDatabase(userId, hashedPassword) {
    const query = {
        text: 'INSERT INTO "User" (user_id, password_hash, role) VALUES ($1, $2, $3)',
        values: [userId, hashedPassword, 'Student'],
    };

    try {
        await pool.query(query);
        console.log(`✅ Inserted user: ${userId}`);
    } catch (err) {
        console.error(`❌ Error inserting user ${userId}:`, err.message);
    }
}

function saveToCsv(data, filename = 'credentials.csv') {
    const header = ['ID', 'Raw Password', 'Hashed Password'];
    const rows = [];

    for (const [userId, { rawPassword, hashedPassword }] of Object.entries(data)) {
        rows.push([userId, rawPassword, hashedPassword]);
    }

    const csvContent = [header, ...rows]
        .map(row => row.join(','))
        .join('\n');

    fs.writeFileSync(filename, csvContent, 'utf8');
    console.log(`✅ Saved credentials to ${filename}`);
}

async function run() {
    const year = 2025;
    const passwordLength = 8;
    const n = 60;

    for (let deptCode = 1; deptCode <= 12; deptCode++) {
        const classCode = String(deptCode).padStart(2, '0');
        const filename = `dept_${classCode}_L1T2.csv`;
        console.log(`🟢 Generating for department ${classCode}...`);
        await generateIdsAndPasswords(year, classCode, n, passwordLength, filename);
    }

    await pool.end();
    console.log('✅ All done.');
}

run();
