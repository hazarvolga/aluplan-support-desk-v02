const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL environment variable is missing.');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    // 1. Ensure AI Settings exist (Crucial for AI_NODE: ONLINE)
    console.log('--- Ensuring AI Settings ---');
    await client.query("INSERT INTO settings (key, value, \"isSecret\") VALUES ('ai.active_provider', 'ollama', false) ON CONFLICT (key) DO NOTHING");
    await client.query("INSERT INTO settings (key, value, \"isSecret\") VALUES ('ai.ollama.url', 'http://172.17.0.1:11434', false) ON CONFLICT (key) DO NOTHING");
    console.log('✅ AI settings verified.');

    console.log('--- Seeding Knowledge Pool from /dataset ---');

    // 2. Check if dataset directory exists
    const datasetDir = fs.existsSync('/app/dataset') ? '/app/dataset' : path.resolve(__dirname, '../../dataset');
    if (!fs.existsSync(datasetDir)) {
        console.warn(`⚠️ Dataset directory not found at ${datasetDir}. Skipping Knowledge Pool seeding.`);
        await client.end();
        return;
    }

    // 2. Scan files
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
    console.log(`Found ${filesToSync.length} files to potentially sync.`);

    let addedCount = 0;
    for (const filePath of filesToSync) {
        const ext = path.extname(filePath).toLowerCase();
        let type = 'FILE_TXT';
        if (ext === '.md') type = 'FILE_MD';
        if (ext === '.pdf') type = 'FILE_PDF';
        if (ext === '.csv') type = 'FILE_CSV';

        const fileName = path.basename(filePath);

        // Check if exists in DB (by name and type for simplicity in this script)
        const existing = await client.query('SELECT id FROM "knowledge_sources" WHERE "name" = $1', [`[Dataset] ${fileName}`]);

        if (existing.rows.length === 0) {
            await client.query(
                'INSERT INTO "knowledge_sources" (id, name, type, "file_name", "file_path", status, metadata, "created_at", "updated_at") VALUES (gen_random_uuid(), $1, $2, $3, $4, \'ACTIVE\', $5, NOW(), NOW())',
                [`[Dataset] ${fileName}`, type, fileName, filePath, JSON.stringify({ useAiPreprocessing: true })]
            );
            addedCount++;
        }
    }

    console.log(`✅ Successfully added ${addedCount} new sources to Knowledge Pool.`);

    await client.end();
}

run().catch(console.error);
