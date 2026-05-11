const { PrismaClient } = require('./packages/database/client');
const prisma = new PrismaClient();

async function monitor() {
    console.log('--- KNOWLEDGE POOL MONITOR STARTED ---');
    console.log('Watching for status changes and sync logs...\n');

    let lastLogId = '';
    
    // Get initial state
    const initialLogs = await prisma.knowledgeSourceSyncLog.findMany({
        orderBy: { syncStartedAt: 'desc' },
        take: 1
    });
    if (initialLogs.length > 0) lastLogId = initialLogs[0].id;

    while (true) {
        // 1. Check for SYNCING sources
        const syncing = await prisma.knowledgeSource.findMany({
            where: { status: 'SYNCING' },
            select: { id: true, name: true }
        });
        
        if (syncing.length > 0) {
            console.log(`[ACTIVE] ${syncing.length} items currently in SYNCING status:`);
            syncing.forEach(s => console.log(`  - ${s.name} (${s.id})`));
        }

        // 2. Check for NEW logs since last poll
        const newLogs = await prisma.knowledgeSourceSyncLog.findMany({
            where: {
                id: { not: lastLogId },
                syncStartedAt: { gte: new Date(Date.now() - 30000) } // Last 30 seconds
            },
            include: { source: true },
            orderBy: { syncStartedAt: 'asc' }
        });

        for (const log of newLogs) {
            if (log.id === lastLogId) continue;
            console.log(`[EVENT] ${log.status}: ${log.source.name}`);
            if (log.error) console.log(`  Error: ${log.error}`);
            lastLogId = log.id;
        }

        await new Promise(r => setTimeout(r, 2000)); // Poll every 2 seconds
    }
}

monitor().catch(console.error);
