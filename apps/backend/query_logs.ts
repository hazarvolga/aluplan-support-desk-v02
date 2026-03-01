import { PrismaClient } from '@aluplan/database';
const prisma = new PrismaClient();

async function run() {
  const logs = await prisma.knowledgeSourceSyncLog.findMany({
    where: { status: 'FAILED' },
    orderBy: { syncStartedAt: 'desc' },
    take: 5
  });
  console.log(logs);
}
run().finally(() => prisma.$disconnect());
