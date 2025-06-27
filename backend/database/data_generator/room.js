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

const buildings = [
    { building_id: 1, prefix: 'cse' },
    { building_id: 2, prefix: 'eee' },
    { building_id: 3, prefix: 'bme' },
    { building_id: 4, prefix: 'nce' },
    { building_id: 5, prefix: 'math' },
    { building_id: 6, prefix: 'phy' },
    { building_id: 7, prefix: 'che' },
    { building_id: 8, prefix: 'chem' },
    { building_id: 9, prefix: 'mme' },
    { building_id: 10, prefix: 'civil' },
    { building_id: 11, prefix: 'me' },
    { building_id: 12, prefix: 'arch' },
];


const floors = 5;

async function insertRooms() {
    const csvFile = 'rooms.csv';
    const header = 'room_id, building_id, capacity, room_type\n';
    if (!fs.existsSync(csvFile)) fs.writeFileSync(csvFile, header);
    try {
        for (const building of buildings) {
            const { building_id, prefix } = building;

            for (let floor = 1; floor <= floors; floor++) {
                for (let i = 1; i <= 5; i++) {
                    const roomNumber = i + floor * 100;
                    const room_id = `${prefix}${roomNumber}`;
                    const capacity = 60;
                    const room_type = 'Classroom';

                    await pool.query(
                        `INSERT INTO room (room_id, building_id, capacity, room_type) VALUES ($1, $2, $3, $4)`,
                        [room_id, building_id, capacity, room_type]
                    );
                    const row = `${room_id}, ${building_id}, ${capacity}, ${room_type}\n`;
                    fs.appendFileSync(csvFile, row);
                }

                for (let labIndex = 1; labIndex <= 2; labIndex++) {
                    const room_id = `${prefix}lab${floor}${labIndex}`;
                    const capacity = 30;
                    const room_type = 'Laboratory';

                    await pool.query(
                        `INSERT INTO room (room_id, building_id, capacity, room_type) VALUES ($1, $2, $3, $4)`,
                        [room_id, building_id, capacity, room_type]
                    );
                    const row = `${room_id}, ${building_id}, ${capacity}, ${room_type}\n`;
                    fs.appendFileSync(csvFile, row);
                }

                const office_id = `${prefix}off${floor}`;
                const office_capacity = 10;
                const office_type = 'Office';

                await pool.query(
                    `INSERT INTO room (room_id, building_id, capacity, room_type) VALUES ($1, $2, $3, $4)`,
                    [office_id, building_id, office_capacity, office_type]
                );
                const row = `${office_id}, ${building_id}, ${office_capacity}, ${office_type}\n`;
                fs.appendFileSync(csvFile, row);

                const tr_id = `${prefix}tr${floor}`;
                const tr_capacity = 20;
                const tr_type = 'Office';

                await pool.query(
                    `INSERT INTO room (room_id, building_id, capacity, room_type) VALUES ($1, $2, $3, $4)`,
                    [tr_id, building_id, tr_capacity, tr_type]
                );
                const rowTR = `${tr_id}, ${building_id}, ${tr_capacity}, ${tr_type}\n`;
                fs.appendFileSync(csvFile, rowTR);
            }
        }

        console.log('All rooms inserted successfully.');
    } catch (err) {
        console.error('Error inserting rooms:', err);
    } finally {
        await pool.end();
    }
}

insertRooms();
