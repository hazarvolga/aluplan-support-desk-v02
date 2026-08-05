
import { PrismaClient } from '@aluplan/database';
import * as fs from 'fs';
import * as path from 'path';
import { createCliLogger } from './common/utils/cli-logger';

const cliLogger = createCliLogger('DirectSync');

const prisma = new PrismaClient();

async function main() {
    const datasetDir = path.resolve(process.cwd(), '../../dataset');
    cliLogger.log(`📂 Scanning dataset directory: ${datasetDir}`);

    if (!fs.existsSync(datasetDir)) {
        cliLogger.error('❌ Dataset directory not found');
        return;
    }

    const validExts = ['.md', '.json', '.csv', '.pdf', '.txt'];
    const filesToSync: string[] = [];

    function walk(dir: string) {
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
    cliLogger.log(`📄 Found ${filesToSync.length} files to sync.`);

    for (const filePath of filesToSync) {
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let type = 'FILE_TXT';
        if (ext === '.md') type = 'FILE_MD';
        if (ext === '.pdf') type = 'FILE_PDF';
        if (ext === '.csv') type = 'FILE_CSV';
        if (ext === '.json') type = 'FILE_JSON'; // Added missing JSON type

        cliLogger.log(`⏳ Processing: ${fileName}...`);

        try {
            let _source;
            const existingSource = await prisma.knowledgeSource.findFirst({
                where: { filePath }
            });
            if (existingSource) {
                _source = await prisma.knowledgeSource.update({
                    where: { id: existingSource.id },
                    data: { status: 'ACTIVE' }
                });
            } else {
                _source = await prisma.knowledgeSource.create({
                    data: {
                        name: `[Dataset] ${fileName}`,
                        type: type as any,
                        fileName,
                        filePath,
                        status: 'ACTIVE',
                        metadata: { useAiPreprocessing: true }
                    }
                });
            }
            cliLogger.log(`✅ Synced: ${fileName}`);
        } catch (_e) {
            // Logic for non-unique id dummy
            const existing = await prisma.knowledgeSource.findFirst({
                where: { filePath }
            });

            if (!existing) {
                await prisma.knowledgeSource.create({
                    data: {
                        name: `[Dataset] ${fileName}`,
                        type: type as any,
                        fileName,
                        filePath,
                        status: 'ACTIVE',
                        metadata: { useAiPreprocessing: true }
                    }
                });
                cliLogger.log(`✅ Created: ${fileName}`);
            } else {
                cliLogger.log(`⏩ Already exists: ${fileName}`);
            }
        }
    }

    cliLogger.log('🚀 Bulk creation complete. Next step: Trigger background processing in NestJS.');
}

main()
    .catch(e => cliLogger.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
