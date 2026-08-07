import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load root .env
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient } from '../client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type CanonicalRbacContract = {
    permissions: Array<{ name: string; group: string; description: string }>;
    rolePermissions: Record<string, string[]>;
};

const canonicalContract = JSON.parse(
    readFileSync(resolve(__dirname, 'rbac-canonical.json'), 'utf8'),
) as CanonicalRbacContract;

async function main() {
    if (process.env.ALLOW_DATABASE_SEED !== 'true') {
        throw new Error(
            'RBAC seeding is disabled. Set ALLOW_DATABASE_SEED=true only for an approved maintenance run.',
        );
    }

    console.log('🌱 Seeding Dynamic RBAC...');

    const permissions = canonicalContract.permissions;

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: { group: p.group, description: p.description },
            create: p,
        });
    }
    console.log('✅ Permissions created.');

    // 2. Create Roles and Assign Permissions
    const sysRoles = [
        { name: 'ADMIN', isSystem: true, perms: ['*'] },
        {
            name: 'SUPPORT_AGENT',
            isSystem: true,
            perms: canonicalContract.rolePermissions.SUPPORT_AGENT,
        },
        { name: 'AGENT', isSystem: true, perms: ['ticket:create', 'ticket:read', 'ticket:update', 'kb:read', 'faq:read'] },
        { name: 'DEPARTMENT_MANAGER', isSystem: true, perms: ['ticket:create', 'ticket:read', 'ticket:update', 'ticket:assign', 'kb:read', 'kb:approve', 'reports:read'] },
        { name: 'CUSTOMER', isSystem: true, perms: ['ticket:create', 'ticket:read', 'ticket:update', 'kb:read'] },
    ];

    for (const r of sysRoles) {
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: { isSystem: r.isSystem },
            create: { name: r.name, isSystem: r.isSystem },
        });

        // Clear existing permissions and re-add
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

        const dbPerms = await prisma.permission.findMany({
            where: { name: { in: r.perms } }
        });

        await prisma.rolePermission.createMany({
            data: dbPerms.map(p => ({
                roleId: role.id,
                permissionId: p.id
            }))
        });
    }
    console.log('✅ Roles and Role-Permissions seeded.');

    // 3. Map Users (Optional safety - mapping by old logic if needed)
    // Since we dropped 'role' column earlier, we might need manual mapping if users exist.
    // For now we just ensure default roles exist.
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
