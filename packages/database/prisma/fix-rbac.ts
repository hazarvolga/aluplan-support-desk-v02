import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🏗️ Fixing RBAC Permissions...');

    // 1. Ensure '*' permission exists
    const superPermission = await prisma.permission.upsert({
        where: { name: '*' },
        update: { group: 'SYSTEM', description: 'Full access to all resources' },
        create: {
            name: '*',
            group: 'SYSTEM',
            description: 'Full access to all resources'
        },
    });
    console.log('✅ Super-permission created:', superPermission.name);

    // 2. Ensure 'admin' role exists
    let adminRole = await prisma.role.findUnique({
        where: { name: 'admin' }
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'admin',
                isSystem: true,
                description: 'System Administrator'
            }
        });
        console.log('✅ Admin role created');
    } else {
        console.log('✅ Admin role found:', adminRole.name);
    }

    // 3. Link '*' to 'admin' role
    await prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId: adminRole.id,
                permissionId: superPermission.id
            }
        },
        update: {},
        create: {
            roleId: adminRole.id,
            permissionId: superPermission.id
        }
    });
    console.log('✅ Linked "*" permission to "admin" role');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    // 4. Ensure admin email is linked to admin role
    const user = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                roleId: adminRole.id,
                status: 'ACTIVE'
            }
        });
        console.log(`✅ User ${adminEmail} updated with admin roleId`);
    } else {
        console.warn(`⚠️ User ${adminEmail} not found. Please run seed-admin first.`);
    }

    console.log('\n🎉 RBAC Fix complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        pool.end();
    });
