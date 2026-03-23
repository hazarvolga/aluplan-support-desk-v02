import { PrismaClient } from '../client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const datasetDir = path.resolve(__dirname, '../../../dataset');
const validExts = ['.md', '.pdf', '.csv', '.json', '.txt', '.docx'];

function walkSync(dir: string, files: string[] = []) {
    if (!fs.existsSync(dir)) return files;
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            walkSync(full, files);
        } else {
            const ext = path.extname(f).toLowerCase();
            if (validExts.includes(ext) && !f.endsWith('.metadata.json') && !f.includes('.resolved')) {
                files.push(full);
            }
        }
    }
    return files;
}

async function run() {
    console.log('🔍 Scanning dataset directory:', datasetDir);
    const files = walkSync(datasetDir);
    console.log('📄 Files found:', files.length);

    let added = 0, skipped = 0;
    for (const absPath of files) {
        const ext = path.extname(absPath).toLowerCase();
        let type: any = 'FILE_TXT';
        if (ext === '.md') type = 'FILE_MD';
        if (ext === '.pdf') type = 'FILE_PDF';
        if (ext === '.csv') type = 'FILE_CSV';

        const fileName = path.basename(absPath);
        // Relative path from project root
        const relPath = 'dataset' + absPath.split('dataset')[1];
        const sourceName = '[Dataset] ' + fileName;

        const existing = await prisma.knowledgeSource.findFirst({
            where: { name: sourceName }
        });

        if (!existing) {
            await prisma.knowledgeSource.create({
                data: {
                    name: sourceName,
                    type: type,
                    fileName: fileName,
                    filePath: relPath,
                    status: 'ACTIVE',
                    metadata: { useAiPreprocessing: true },
                    language: 'tr'
                }
            });
            added++;
        } else {
            skipped++;
        }
    }
    console.log(`✅ Finished: Added ${added}, Skipped ${skipped}`);
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
