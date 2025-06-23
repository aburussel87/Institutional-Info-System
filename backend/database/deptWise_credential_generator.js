const bcrypt = require('bcryptjs');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();


const client = new Client({
    user: 'system',
    host: 'localhost',
    database: 'postgres',
    password: 'Russel87',
    port: '5432'
});

client.connect();

async function generateIdsAndPasswords(year, classCode, n, passwordLength = 8) {
    if (!(year >= 1000 && year <= 9999)) {
        throw new Error("Year must be a 4-digit number");
    }
    if (!(classCode.length === 2 && /^\d{2}$/.test(classCode))) {
        throw new Error("Class code must be exactly 2 digits");
    }

    const idPasswordMap = {};
    const yearPrefix = String(year).slice(-2);

    const promises = [];

    for (let i = 1; i <= n; i++) {
        const suffix = String(i).padStart(3, '0');
        const userId = yearPrefix + classCode + suffix;
        const rawPassword = generateRandomPassword(passwordLength);

        const promise = bcrypt.hash(rawPassword, 10).then(hashedPassword => {
            idPasswordMap[userId] = { rawPassword, hashedPassword };
            saveToDatabase(userId, hashedPassword);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    saveToCsv(idPasswordMap,filename);
}


function generateRandomPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function saveToDatabase(userId, hashedPassword) {
    const query = {
        text: 'INSERT INTO "User" (user_id, password_hash, role) VALUES ($1, $2, $3)',
        values: [userId, hashedPassword, 'Student'],
    };

    client.query(query, (err, res) => {
        if (err) {
            console.error('Error inserting into user table', err);
        } else {
            console.log('User inserted successfully');
        }
    });
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
}


const year = 2025;
const passwordLength = 8;
const n = 20; 
let filename;
for (let deptCode = 2; deptCode <= 12; deptCode++) {
  const classCode = String(deptCode).padStart(2, '0');
  filename = `dept_${classCode}.csv`;
  generateIdsAndPasswords(year, classCode, n, passwordLength);
}

