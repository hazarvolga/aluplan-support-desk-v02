import { PrismaClient } from '@aluplan/database';
import { createCliLogger } from './common/utils/cli-logger';

const cliLogger = createCliLogger('CheckSyncFails');

async function main() {
    const prisma = new PrismaClient();
    try {
        const latestFails = await prisma.knowledgeSourceSyncLog.findMany({
            where: { status: 'FAILED' },
            orderBy: { syncStartedAt: 'desc' },
            take: 5
        });
        cliLogger.log("Latest 5 sync fails:");
        for (const log of latestFails) {
            cliLogger.log(`ID: ${log.id} - Source: ${log.sourceId}`);
            cliLogger.log(`Error: ${log.error}`);
            cliLogger.log(`Time: ${log.syncStartedAt?.toISOString()}`);
            cliLogger.log('---');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => cliLogger.error(error));
