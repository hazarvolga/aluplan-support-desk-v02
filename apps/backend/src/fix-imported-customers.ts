import { PrismaClient } from '@aluplan/database';
import { createCliLogger } from './common/utils/cli-logger';

const cliLogger = createCliLogger('FixImportedCustomers');

const prisma = new PrismaClient();

async function fixImportedCustomers() {
  cliLogger.log('🔧 Fixing imported customers without role...');

  // Get customer role
  const customerRole = await prisma.role.findUnique({
    where: { name: 'CUSTOMER' }
  });

  if (!customerRole) {
    cliLogger.error('❌ Customer role not found!');
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

  cliLogger.log(`📊 Found ${usersWithoutRole.length} users without role`);

  // Update them
  for (const user of usersWithoutRole) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: customerRole.id }
    });
    cliLogger.log(`✅ Fixed user: ${user.email}`);
  }

  cliLogger.log('✨ Done!');
  await prisma.$disconnect();
}

fixImportedCustomers().catch((error) => cliLogger.error(error));
