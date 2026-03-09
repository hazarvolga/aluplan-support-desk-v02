
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get DATABASE_URL from .env
const dbUrl = "postgresql://postgres:changeme@localhost:5432/aluplan_support?schema=public";

async function main() {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    console.log('🐘 Connected to PostgreSQL');

    const datasetDir = '/Users/hazarekiz/Projects/aluplan-support-desk-V02/dataset';
    if (!fs.existsSync(datasetDir)) {
        console.error('❌ Dataset directory not found');
        process.exit(1);
    }

    const validExts = ['.md', '.json', '.csv', '.pdf', '.txt'];
    const filesToSync = [];

    function walk(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                walk(filePath);
            } else if (validExts.includes(path.extname(file).toLowerCase())) {
                filesToSync.push(filePath);
            }
        }
    }

    walk(datasetDir);
    console.log(`📄 Found ${filesToSync.length} files to sync.`);

    for (const filePath of filesToSync) {
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let type = 'FILE_TXT';
        if (ext === '.md') type = 'FILE_MD';
        if (ext === '.pdf') type = 'FILE_PDF';
        if (ext === '.csv') type = 'FILE_CSV';

        console.log(`⏳ Processing: ${fileName}...`);

        try {
            // Check if exists
            const checkRes = await client.query('SELECT id FROM knowledge_sources WHERE file_path = $1', [filePath]);

            if (checkRes.rows.length === 0) {
                await client.query(
                    'INSERT INTO knowledge_sources (id, name, type, file_name, file_path, status, metadata, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())',
                    [`[Dataset] ${fileName}`, type, fileName, filePath, 'ACTIVE', JSON.stringify({ useAiPreprocessing: true })]
                );
                console.log(`✅ Created: ${fileName}`);
            } else {
                console.log(`⏩ Already exists: ${fileName}`);
            }
        } catch (err) {
            console.error(`❌ Error syncing ${fileName}:`, err.message);
        }
    }

    await client.end();
    console.log('👋 Bulk sync finished.');
}

main().catch(console.error);
