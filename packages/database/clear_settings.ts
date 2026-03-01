import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.setting.deleteMany({
    where: { key: { in: ['email.resend.api_key', 'email.active_provider'] } }
  });
  console.log("Settings cleared from DB. Will fallback to .env.");
}
run().finally(() => prisma.$disconnect());
