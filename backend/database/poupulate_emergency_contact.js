const { Pool } = require('pg');
const {faker} = require('@faker-js/faker');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


async function insertEmergencyContacts() {
  try {
    const client = await pool.connect();

    const result = await client.query(`SELECT user_id FROM "User"`);

    const userIds = result.rows.map(row => row.user_id);

    for (const userId of userIds) {
      const name = faker.person.fullName();
      const mobile = faker.phone.number('01#########').slice(0, 15);

      const address = faker.location.streetAddress();

      await client.query(
        `INSERT INTO Emergencycontact (user_id, name, mobile, address)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO NOTHING`, 
        [userId, name, mobile, address]
      );

      console.log(`Inserted emergency contact for user ${userId}`);
    }

    client.release();
    console.log('✅ All emergency contacts inserted successfully.');
  } catch (err) {
    console.error('❌ Error inserting emergency contacts:', err);
  } finally {
    await pool.end();
  }
}

insertEmergencyContacts();
