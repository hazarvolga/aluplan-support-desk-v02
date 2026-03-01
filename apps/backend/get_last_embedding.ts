import { PrismaClient } from '@aluplan/database';
const prisma = new PrismaClient();

async function run() {
  const e = await prisma.knowledgePoolEmbedding.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log(e?.content);
}
run().finally(() => prisma.$disconnect());
