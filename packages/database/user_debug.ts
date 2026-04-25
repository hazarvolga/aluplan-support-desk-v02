import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'droneracingturkey@gmail.com' },
    include: {
      role: true,
      teams: {
        include: {
          role: true,
        }
      }
    }
  });

  console.log("User details:", JSON.stringify(user, null, 2));

  // Check Settings
  const settings = await prisma.systemSetting.findMany({
    take: 5
  });
  console.log("Settings snippet:", JSON.stringify(settings.map(s => ({key: s.key, _isEncrypted: s.isEncrypted})), null, 2));

}

main().catch(console.error).finally(() => prisma.$disconnect());
