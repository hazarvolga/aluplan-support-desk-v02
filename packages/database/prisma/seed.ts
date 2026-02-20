import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLES = [
    { name: 'admin', description: 'Full system access' },
    { name: 'support_manager', description: 'Can manage tickets, view reports, configure SLAs' },
    { name: 'support_agent', description: 'Handle and respond to tickets' },
    { name: 'kb_editor', description: 'Create and submit knowledge base articles for review' },
    { name: 'viewer', description: 'Read-only access' },
];

const PERMISSIONS = [
    // Tickets
    'ticket:create', 'ticket:read', 'ticket:update', 'ticket:delete',
    'ticket:assign', 'ticket:escalate', 'ticket:close',
    // Knowledge Base
    'kb:create', 'kb:read', 'kb:update', 'kb:delete',
    'kb:submit_review', 'kb:approve', 'kb:publish',
    // FAQ
    'faq:read', 'faq:review', 'faq:publish',
    // AI
    'ai:read_interactions', 'ai:manage_training',
    // Users
    'user:create', 'user:read', 'user:update', 'user:delete',
    'user:assign_role',
    // Settings
    'settings:read', 'settings:update',
    // Reports
    'reports:read',
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: PERMISSIONS, // All
    support_manager: [
        'ticket:create', 'ticket:read', 'ticket:update', 'ticket:assign',
        'ticket:escalate', 'ticket:close', 'kb:read', 'kb:approve', 'kb:publish',
        'faq:read', 'faq:review', 'faq:publish', 'ai:read_interactions',
        'ai:manage_training', 'user:read', 'reports:read', 'settings:read',
    ],
    support_agent: [
        'ticket:create', 'ticket:read', 'ticket:update', 'ticket:escalate',
        'kb:read', 'faq:read',
    ],
    kb_editor: [
        'kb:create', 'kb:read', 'kb:update', 'kb:submit_review', 'faq:read',
    ],
    viewer: ['ticket:read', 'kb:read', 'faq:read', 'reports:read'],
};

async function main() {
    console.log('🌱 Seeding database...');

    // Seed permissions
    for (const name of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log(`✅ ${PERMISSIONS.length} permissions seeded`);

    // Seed roles
    for (const role of ROLES) {
        const created = await prisma.role.upsert({
            where: { name: role.name },
            update: { description: role.description },
            create: role,
        });

        // Assign permissions to role
        const perms = ROLE_PERMISSIONS[role.name] ?? [];
        for (const permName of perms) {
            const perm = await prisma.permission.findUnique({ where: { name: permName } });
            if (perm) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: created.id, permissionId: perm.id } },
                    update: {},
                    create: { roleId: created.id, permissionId: perm.id },
                });
            }
        }
        console.log(`✅ Role '${role.name}' with ${perms.length} permissions`);
    }

    // Seed admin user
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
    const hash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@aluplan.com' },
        update: {},
        create: {
            email: 'admin@aluplan.com',
            fullName: 'System Administrator',
            passwordHash: hash,
            status: 'ACTIVE',
        },
    });

    if (adminRole) {
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
            update: {},
            create: { userId: admin.id, roleId: adminRole.id },
        });
    }

    // Seed default settings
    const defaultSettings = [
        { key: 'mail_provider', value: 'resend', isSecret: false },
        { key: 'app_name', value: 'Aluplan Support', isSecret: false },
        { key: 'sla_low_response_hours', value: '24', isSecret: false },
        { key: 'sla_medium_response_hours', value: '8', isSecret: false },
        { key: 'sla_high_response_hours', value: '4', isSecret: false },
        { key: 'sla_urgent_response_hours', value: '1', isSecret: false },
        { key: 'sla_low_resolve_hours', value: '72', isSecret: false },
        { key: 'sla_medium_resolve_hours', value: '24', isSecret: false },
        { key: 'sla_high_resolve_hours', value: '8', isSecret: false },
        { key: 'sla_urgent_resolve_hours', value: '4', isSecret: false },
        { key: 'ai_confidence_threshold_high', value: '0.90', isSecret: false },
        { key: 'ai_confidence_threshold_medium', value: '0.80', isSecret: false },
    ];

    for (const setting of defaultSettings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log('✅ Default settings seeded');

    console.log('\n🎉 Seed complete!');
    console.log(`👤 Admin: admin@aluplan.com / ${adminPassword}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
