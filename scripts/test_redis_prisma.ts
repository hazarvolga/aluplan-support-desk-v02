import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

async function main() {
    const prisma = new PrismaClient();
    const redis = new Redis();
    await redis.flushall();
    console.log('✅ Redis Cache Flushed');

    const logs = await prisma.emailLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('📧 Recent Email Logs:', logs);
    await prisma.$disconnect();
    process.exit(0);
}
main().catch(e => {
    console.error(e);
    process.exit(1);
});
