const { Client } = require('pg');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL environment variable is missing.');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    const settings = [
        // General
        { key: 'general.portal_name', value: 'Aluplan Destek', is_secret: false },
        { key: 'general.frontend_url', value: 'https://allplan.net.tr', is_secret: false },

        // Branding
        { key: 'branding.logo_url', value: '', is_secret: false },
        { key: 'branding.primary_color', value: '#10b981', is_secret: false },

        // Email Implementation (Harmonized to email.*)
        { key: 'email.active_provider', value: 'resend', is_secret: false },
        { key: 'email.from_address', value: 'noreply@allplan.net.tr', is_secret: false },
        { key: 'email.resend.api_key', value: '', is_secret: true },

        // AI Integration
        { key: 'ai.active_provider', value: 'ollama', is_secret: false },
        { key: 'ai.ollama.url', value: 'http://172.17.0.1:11434', is_secret: false },
        { key: 'ai.ollama.chat_model', value: 'llama3.2:3b', is_secret: false },
        { key: 'ai.ollama.embed_model', value: 'nomic-embed-text', is_secret: false }
    ];

    console.log('--- Seeding Platform Settings ---');

    for (const s of settings) {
        try {
            await client.query(
                "INSERT INTO settings (key, value, is_secret, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO NOTHING",
                [s.key, s.value, s.is_secret]
            );
            console.log(`✅ Seeded: ${s.key}`);
        } catch (err) {
            console.error(`❌ Failed to seed ${s.key}:`, err.message);
        }
    }

    console.log('--- Syncing Knowledge Pool Metadata Defaults ---');
    // Ensure critical metadata for sync exists
    await client.query("UPDATE knowledge_sources SET metadata = '{\"useAiPreprocessing\": true}' WHERE metadata IS NULL");

    console.log('✅ Platform seeding completed.');
    await client.end();
}

run().catch(console.error);
