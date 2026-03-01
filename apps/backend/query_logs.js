const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.knowledgeSourceSyncLog.findMany({
    where: { status: 'FAILED' },
    orderBy: { syncStartedAt: 'desc' },
    take: 5,
    include: { source: true }
  });
  console.log(JSON.stringify(logs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
