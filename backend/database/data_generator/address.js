require('dotenv').config();
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function generateAddresses() {
    const client = await pool.connect();

    try {
        const res = await client.query('SELECT u.user_id FROM "User" u except (select a.user_id from address a)');

        const users = res.rows;

        for (let i = 0; i < users.length; i++) {
            const userId = users[i].user_id;

            const country = faker.location.country();
            const city = faker.location.city();
            const street = faker.location.streetAddress();

            await client.query(
                `INSERT INTO Address (user_id,country, city, street)
         VALUES ($1, $2, $3,$4)`,
                [userId,
                    country.substring(0, 50),
                    city.substring(0, 50),
                    street.substring(0, 50)]
            );

            console.log(`Address inserted for user ${userId}`);
        }

        console.log('\Address generation completed!');
    } catch (err) {
        console.error('Error generating addresses:', err);
    } finally {
        client.release();
    }
}

generateAddresses();
