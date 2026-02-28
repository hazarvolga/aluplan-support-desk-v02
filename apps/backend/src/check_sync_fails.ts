import { PrismaClient } from '@aluplan/database';

async function main() {
    const prisma = new PrismaClient();
    try {
        const latestFails = await prisma.knowledgeSourceSyncLog.findMany({
            where: { status: 'FAILED' },
            orderBy: { syncStartedAt: 'desc' },
            take: 5
        });
        console.log("Latest 5 sync fails:");
        for (const log of latestFails) {
            console.log(`ID: ${log.id} - Source: ${log.sourceId}`);
            console.log(`Error: ${log.error}`);
            console.log(`Time: ${log.syncStartedAt?.toISOString()}`);
            console.log('---');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
