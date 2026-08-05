
const { Client } = require('pg');
const { Logger } = require('@nestjs/common');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const logger = new Logger('RawSync');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        logger.error('❌ DATABASE_URL is required');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    logger.log('🐘 Connected to PostgreSQL');

    const datasetDir = process.env.DATASET_DIR || path.resolve(process.cwd(), '../../dataset');
    if (!fs.existsSync(datasetDir)) {
        logger.error('❌ Dataset directory not found');
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
    logger.log(`📄 Found ${filesToSync.length} files to sync.`);

    for (const filePath of filesToSync) {
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let type = 'FILE_TXT';
        if (ext === '.md') type = 'FILE_MD';
        if (ext === '.pdf') type = 'FILE_PDF';
        if (ext === '.csv') type = 'FILE_CSV';

        logger.log(`⏳ Processing: ${fileName}...`);

        try {
            // Check if exists
            const checkRes = await client.query('SELECT id FROM knowledge_sources WHERE file_path = $1', [filePath]);

            if (checkRes.rows.length === 0) {
                await client.query(
                    'INSERT INTO knowledge_sources (id, name, type, file_name, file_path, status, metadata, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())',
                    [`[Dataset] ${fileName}`, type, fileName, filePath, 'ACTIVE', JSON.stringify({ useAiPreprocessing: true })]
                );
                logger.log(`✅ Created: ${fileName}`);
            } else {
                logger.log(`⏩ Already exists: ${fileName}`);
            }
        } catch (err) {
            logger.error(`❌ Error syncing ${fileName}: ${err.message}`);
        }
    }

    await client.end();
    logger.log('👋 Bulk sync finished.');
}

main().catch((error) => logger.error(error));
