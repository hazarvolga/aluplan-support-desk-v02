const { Client } = require('pg');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL environment variable is missing.');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    console.log('--- Current AI Settings ---');
    const res = await client.query("SELECT key, value FROM settings WHERE key LIKE 'ai.%'");
    res.rows.forEach(row => {
        console.log(`${row.key}: ${row.value}`);
    });

    const providerRes = await client.query("SELECT value FROM settings WHERE key = 'ai.active_provider'");
    const activeProvider = providerRes.rows[0]?.value || 'not configured';
    console.log(`\nActive Provider: ${activeProvider}`);

    if (res.rows.length === 0) {
        console.warn('\n⚠️ AI settings are empty. Configure Gemini/LLMAPI through the supported settings or environment flow.');
    }

    console.log('\n--- Knowledge Pool Status ---');
    const poolRes = await client.query("SELECT count(*) FROM \"knowledge_sources\"");
    console.log(`Total Sources: ${poolRes.rows[0].count}`);

    await client.end();
}

run().catch(console.error);
