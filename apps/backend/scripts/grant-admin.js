const { PrismaClient } = require('@aluplan/database');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function grantAdmin() {
    console.log('🚀 Enforcing uppercase ADMIN role for admin@example.com...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL environment variable is missing.');
        process.exit(1);
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

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
            where: {
                email: { in: ['admin@example.com', 'droneracingturkey@gmail.com'] }
            },
            data: { roleId: adminRole.id }
        });

        console.log('✅ Success! Target users are now officially ADMIN.');
    } catch (err) {
        console.error('❌ Failed to grant admin:', err.message);
        process.exit(1); // Exit with error so deploy.sh knows it failed
    } finally {
        await prisma.$disconnect();
    }
}

grantAdmin();
