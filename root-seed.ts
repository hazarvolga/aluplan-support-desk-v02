import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:changeme@localhost:5432/aluplan_support?schema=public"
    }
  }
});

async function main() {
  const adminEmail = 'hazarvolga@gmail.com';
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
      role: 'ADMIN'
    },
  });

  console.log('✅ Admin user hazarvolga@gmail.com created/updated on Production DB!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });
