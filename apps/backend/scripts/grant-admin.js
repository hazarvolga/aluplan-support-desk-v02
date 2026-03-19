const { PrismaClient } = require('@aluplan/database');

async function grantAdmin() {
    console.log('🚀 Enforcing uppercase ADMIN role for hazarvolga@gmail.com...');
    const prisma = new PrismaClient();

    try {
        // 1. Ensure `ADMIN` role exists
        let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });

        if (!adminRole) {
            console.log('ADMIN role not found. Checking if lowercase admin exists...');
            const oldAdmin = await prisma.role.findFirst({ where: { name: 'admin' } });

            if (oldAdmin) {
                adminRole = await prisma.role.update({
                    where: { id: oldAdmin.id },
                    data: { name: 'ADMIN' }
                });
            } else {
                adminRole = await prisma.role.create({
                    data: { name: 'ADMIN', isSystem: true, description: 'Super Administrator' }
                });
            }
        }

        // 2. Transfer user to this role
        await prisma.user.updateMany({
            where: { email: 'hazarvolga@gmail.com' },
            data: { roleId: adminRole.id }
        });

        console.log('✅ Success! hazarvolga@gmail.com is now officially an ADMIN.');
    } catch (err) {
        console.error('Failed to grant admin:', err);
    } finally {
        await prisma.$disconnect();
    }
}

grantAdmin();
