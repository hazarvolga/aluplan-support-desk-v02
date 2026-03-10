import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const settings = await prisma.setting.findMany({
        where: {
            key: {
                startsWith: 'ai.'
            }
        }
    });
    console.log(JSON.stringify(settings, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
