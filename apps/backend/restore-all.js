const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL environment variable is missing.');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    console.log('--- Phase 1: Seeding System Settings ---');
    const settings = [
        // General
        { key: 'general.portal_name', value: 'Aluplan Destek', is_secret: false },
        { key: 'general.frontend_url', value: process.env.FRONTEND_URL || 'https://allplan.net.tr', is_secret: false },

        // Branding
        { key: 'branding.primary_color', value: '#10b981', is_secret: false },

        // Email (From .env)
        { key: 'email.active_provider', value: process.env.MAIL_PROVIDER || 'resend', is_secret: false },
        { key: 'email.from_address', value: process.env.MAIL_FROM || 'noreply@allplan.net.tr', is_secret: false },
        { key: 'email.resend.api_key', value: process.env.RESEND_API_KEY || '', is_secret: true },

        // AI (From .env)
        { key: 'ai.active_provider', value: 'custom', is_secret: false }, // Use custom for Groq/OpenAI flow
        { key: 'ai.openai.api_key', value: process.env.OPENAI_API_KEY || '', is_secret: true },
        { key: 'ai.groq.api_key', value: process.env.GROQ_API_KEY || '', is_secret: true },
        { key: 'ai.ollama.url', value: process.env.OLLAMA_BASE_URL || 'http://localhost:11434', is_secret: false },
        { key: 'ai.ollama.chat_model', value: process.env.OLLAMA_CHAT_MODEL || 'llama3.2:1b', is_secret: false },
        { key: 'ai.ollama.embed_model', value: process.env.OLLAMA_MODEL || 'nomic-embed-text', is_secret: false }
    ];

    for (const s of settings) {
        await client.query(
            "INSERT INTO settings (key, value, is_secret, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
            [s.key, s.value, s.is_secret]
        );
        console.log(`✅ Synced: ${s.key}`);
    }

    console.log('\n--- Phase 2: Cleaning and Re-seeding Knowledge Pool ---');
    
    // Clear old data to prevent path conflicts
    await client.query('DELETE FROM knowledge_sources');
    console.log('🗑️  Cleared existing knowledge_sources table.');

    const datasetDir = path.resolve(__dirname, '../../dataset');
    if (!fs.existsSync(datasetDir)) {
        console.warn(`⚠️ Dataset directory not found at ${datasetDir}. Skipping KP sync.`);
    } else {
        const validExts = ['.md', '.json', '.csv', '.pdf', '.txt'];
        const filesToSync = [];

        const walkSync = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    walkSync(filePath);
                } else if (validExts.includes(path.extname(file).toLowerCase())) {
                    filesToSync.push(filePath);
                }
            }
        };

        walkSync(datasetDir);
        console.log(`Found ${filesToSync.length} files in dataset.`);

        let addedCount = 0;
        for (const absolutePath of filesToSync) {
            const ext = path.extname(absolutePath).toLowerCase();
            let type = 'FILE_TXT';
            if (ext === '.md') type = 'FILE_MD';
            if (ext === '.pdf') type = 'FILE_PDF';
            if (ext === '.csv') type = 'FILE_CSV';

            const fileName = path.basename(absolutePath);
            // Storage path should stay relative to root for consistency
            const datasetRoot = path.resolve(__dirname, '../../');
            const dbFilePath = path.relative(datasetRoot, absolutePath);

            await client.query(
                'INSERT INTO "knowledge_sources" (id, name, type, "file_name", "file_path", status, metadata, "created_at", "updated_at") VALUES (gen_random_uuid(), $1, $2, $3, $4, \'ACTIVE\', $5, NOW(), NOW())',
                [`[Dataset] ${fileName}`, type, fileName, dbFilePath, JSON.stringify({ useAiPreprocessing: true })]
            );
            addedCount++;
        }
        console.log(`✅ Successfully re-seeded ${addedCount} sources with relative paths.`);
    }

    console.log('\n🌟 Restoration COMPLETE.');
    await client.end();
}

run().catch(console.error);
