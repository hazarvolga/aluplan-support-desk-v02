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
    const activeProvider = providerRes.rows[0]?.value || 'ollama (default)';
    console.log(`\nActive Provider: ${activeProvider}`);

    // Check if we need to set defaults for a fresh DB
    if (res.rows.length === 0) {
        console.log('\nAI settings are empty. Initializing defaults...');
        await client.query("INSERT INTO settings (key, value, \"isSecret\") VALUES ('ai.active_provider', 'ollama', false) ON CONFLICT (key) DO NOTHING");
        await client.query("INSERT INTO settings (key, value, \"isSecret\") VALUES ('ai.ollama.url', 'http://host.docker.internal:11434', false) ON CONFLICT (key) DO NOTHING");
        console.log('✅ Default AI settings initialized (Ollama at host.docker.internal).');
    }

    console.log('\n--- Knowledge Pool Status ---');
    const poolRes = await client.query("SELECT count(*) FROM \"knowledge_sources\"");
    console.log(`Total Sources: ${poolRes.rows[0].count}`);

    await client.end();
}

run().catch(console.error);
