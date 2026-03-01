import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'email' } }
  });
  console.log("DB SETTINGS:", settings);
}
run().finally(() => prisma.$disconnect());
