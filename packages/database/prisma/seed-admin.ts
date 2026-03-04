import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'hazarvolga@gmail.com';
  // Use a secure placeholder password that they can change immediately later
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      fullName: 'Hazar Ekiz (Admin)',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user ensured:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
