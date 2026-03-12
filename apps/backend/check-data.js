const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL missing');
        return;
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    console.log('--- Checking Settings ---');
    const settings = await client.query('SELECT key, value, is_secret FROM settings ORDER BY key');
    console.table(settings.rows);

    console.log('\n--- Checking Knowledge Pool ---');
    const kp = await client.query('SELECT name, type, status, file_path FROM knowledge_sources');
    console.table(kp.rows);

    await client.end();
}

check().catch(console.error);
