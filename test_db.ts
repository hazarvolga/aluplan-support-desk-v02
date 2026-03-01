import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.emailLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log(logs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
