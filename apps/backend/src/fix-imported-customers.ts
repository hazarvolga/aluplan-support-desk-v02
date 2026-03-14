import { PrismaClient } from '../../../packages/database/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function fixImportedCustomers() {
  console.log('🔧 Fixing imported customers without role...');

  // Get customer role
  const customerRole = await prisma.role.findUnique({
    where: { name: 'customer' }
  });

  if (!customerRole) {
    console.error('❌ Customer role not found!');
    return;
  }

  // Find all users with customerProfile but no roleId
  const usersWithoutRole = await prisma.user.findMany({
    where: {
      roleId: null,
      customerProfile: {
        isNot: null
      }
    },
    include: {
      customerProfile: true
    }
  });

  console.log(`📊 Found ${usersWithoutRole.length} users without role`);

  // Update them
  for (const user of usersWithoutRole) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: customerRole.id }
    });
    console.log(`✅ Fixed user: ${user.email}`);
  }

  console.log('✨ Done!');
  await prisma.$disconnect();
}

fixImportedCustomers().catch(console.error);
