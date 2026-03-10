
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- FETCHING RECENT AUDIT LOGS ---');
        const logs = await prisma.auditLog.findMany({
            where: {
                action: 'api_exception'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        console.log(JSON.stringify(logs, null, 2));

        console.log('\n--- CHECKING SETTINGS FOR LOGO ---');
        const logo = await prisma.setting.findUnique({
            where: { key: 'branding.logo_url' }
        });
        console.log('Logo Setting:', logo);

    } catch (e) {
        console.error('Database query failed:', e.message);
        console.error('Stack:', e.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
