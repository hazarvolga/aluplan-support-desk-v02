import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching recent email logs:");
    const logs = await prisma.emailLog.findMany({
        take: 5,
        orderBy: { sentAt: 'desc' }
    });
    console.log(logs);

    console.log("Checking for 'welcome-customer' templates specifically:");
    const welcomeLogs = await prisma.emailLog.findMany({
        where: { templateName: 'welcome-customer' },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(welcomeLogs);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
