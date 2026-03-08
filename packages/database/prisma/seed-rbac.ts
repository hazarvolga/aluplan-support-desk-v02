import { PrismaClient } from '../client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Dynamic RBAC...');

    const permissions = [
        { name: 'ticket:read', group: 'TICKETS', description: 'View tickets' },
        { name: 'ticket:create', group: 'TICKETS', description: 'Create new tickets' },
        { name: 'ticket:update', group: 'TICKETS', description: 'Update ticket status/details' },
        { name: 'ticket:delete', group: 'TICKETS', description: 'Delete tickets (Soft delete)' },
        { name: 'kb:read', group: 'KNOWLEDGE', description: 'Read knowledge base' },
        { name: 'article:write', group: 'KNOWLEDGE', description: 'Create/Edit articles' },
        { name: 'kb:approve', group: 'KNOWLEDGE', description: 'Approve draft articles' },
        { name: 'settings:read', group: 'ADMIN', description: 'Read system settings' },
        { name: 'settings:write', group: 'ADMIN', description: 'Update system settings' },
        { name: 'users:manage', group: 'ADMIN', description: 'Manage users and roles' },
    ];

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
        { name: 'ADMIN', isSystem: true, perms: permissions.map(p => p.name) },
        { name: 'AGENT', isSystem: true, perms: ['ticket:read', 'ticket:update', 'kb:read'] },
        { name: 'DEPARTMENT_MANAGER', isSystem: true, perms: ['ticket:read', 'ticket:update', 'kb:read', 'kb:approve'] },
        { name: 'CUSTOMER', isSystem: true, perms: ['ticket:read', 'ticket.create'] },
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
