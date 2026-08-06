const { PrismaClient, TicketPriority } = require('../client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🏁 Starting explicitly authorized production synchronization...');

    if (process.env.ALLOW_PRODUCTION_DATA_SYNC !== 'true') {
        throw new Error(
            'Production data synchronization is disabled. Set ALLOW_PRODUCTION_DATA_SYNC=true only for an approved one-time maintenance run.',
        );
    }

    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required for production synchronization.');
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    if (!adminEmail) {
        throw new Error('ADMIN_EMAIL is required for production synchronization.');
    }

    if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') {
        throw new Error(
            'Admin bootstrap is disabled. Set ALLOW_ADMIN_BOOTSTRAP=true only for an approved one-time maintenance run.',
        );
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$transaction(async (tx) => {
        // BEGIN TRANSACTIONAL SYNC
        // --- 1. Roles & Permissions Enforcement ---
        console.log('📡 Enforcing System Roles & Permissions...');
        const ALL_PERMISSIONS = [
            { name: 'ticket:create', group: 'TICKETS', description: 'Create new support tickets' },
            { name: 'ticket:read', group: 'TICKETS', description: 'View tickets' },
            { name: 'ticket:update', group: 'TICKETS', description: 'Update ticket status/details' },
            { name: 'ticket:assign', group: 'TICKETS', description: 'Assign tickets to agents/teams' },
            { name: 'ticket:escalate', group: 'TICKETS', description: 'Escalate tickets to higher tiers' },
            { name: 'kb:read', group: 'KNOWLEDGE', description: 'View knowledge base articles' },
            { name: 'kb:write', group: 'KNOWLEDGE', description: 'Create/Edit knowledge base articles' },
            { name: 'faq:read', group: 'KNOWLEDGE', description: 'View FAQ learning candidates' },
            { name: 'faq:manage', group: 'KNOWLEDGE', description: 'Approve/Dismiss FAQ candidates' },
            { name: 'settings:read', group: 'SYSTEM', description: 'View system settings' },
            { name: 'settings:write', group: 'SYSTEM', description: 'Update system settings' },
            { name: 'reports:read', group: 'SYSTEM', description: 'View analytics and reports' },
            { name: 'users:manage', group: 'SYSTEM', description: 'Manage users and roles' },
            { name: '*', group: 'SYSTEM', description: 'Wildcard super-permission' }
        ];

        for (const permDef of ALL_PERMISSIONS) {
            await tx.permission.upsert({
                where: { name: permDef.name },
                update: { group: permDef.group, description: permDef.description },
                create: permDef
            });
        }

        let adminRole = await tx.role.findFirst({ where: { name: 'ADMIN' } });
        if (!adminRole) {
            adminRole = await tx.role.create({ data: { name: 'ADMIN', isSystem: true, description: 'Super Administrator' } });
        }

        let customerRole = await tx.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!customerRole) {
            customerRole = await tx.role.create({ data: { name: 'CUSTOMER', isSystem: true, description: 'Standard Customer' } });
        }

        // Connect ALL permissions to ADMIN role
        const perms = await tx.permission.findMany();
        for (const p of perms) {
            await tx.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: p.id
                    }
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: p.id
                }
            });
        }

        // --- 2. Admin User Protection ---
        console.log(`👤 Ensuring Admin user integrity (${adminEmail})...`);
        let adminUser = await tx.user.findUnique({ where: { email: adminEmail } });
        if (adminUser) {
            if (adminUser.deletedAt || adminUser.status !== 'ACTIVE') {
                throw new Error(
                    'Refusing to reactivate a deleted or inactive admin account automatically.',
                );
            }
            if (adminUser.roleId !== adminRole.id) {
                if (process.env.ALLOW_ADMIN_PROMOTION !== 'true') {
                    throw new Error(
                        'Refusing to promote an existing account without ALLOW_ADMIN_PROMOTION=true.',
                    );
                }
                adminUser = await tx.user.update({
                    where: { id: adminUser.id },
                    data: { roleId: adminRole.id }
                });
            }
        } else {
            const adminBootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
            if (!adminBootstrapPassword) {
                throw new Error(
                    'ADMIN_BOOTSTRAP_PASSWORD is required when the admin account does not exist.',
                );
            }
            const passwordHash = await bcrypt.hash(adminBootstrapPassword, 10);
            adminUser = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: passwordHash,
                    fullName: process.env.ADMIN_BOOTSTRAP_NAME || 'Bootstrap Administrator',
                    roleId: adminRole.id,
                    status: 'ACTIVE'
                }
            });
            console.log(`✅ Created default admin user: ${adminEmail}`);
        }

        // --- 4. Products & Categories Taxonomy (Sync from seed.ts logic) ---
        console.log('📦 Syncing Product Taxonomy...');
        const taxonomy = [
            {
                name: "ALLPLAN",
                description: "Mimari ve Mühendislik BIM Çözümü",
                categories: ["Sistem, Lisans & Abonelik", "Mimari ve 3B Modelleme", "Mühendislik (Donatı & Çelik)", "BIM, Veri Paylaşımı & Altyapı"]
            },
            {
                name: "AX3000",
                description: "Mekanik ve Elektrik Tesisat (MEP) Çözümü",
                categories: ["Mekanik, Elektrik & Sıhhi Tesisat", "İklimlendirme (HVAC) & TS825"]
            },
            {
                name: "CDS Add-on",
                description: "Aluplan Geliştirilmiş Eklentileri",
                categories: ["Arazi, Altyapı & Rampa", "Akıllı Tasarım Araçları"]
            }
        ];

        for (const prod of taxonomy) {
            let product = await tx.product.findFirst({ where: { name: prod.name } });
            if (product) {
                product = await tx.product.update({
                    where: { id: product.id },
                    data: { description: prod.description, isActive: true }
                });
            } else {
                product = await tx.product.create({
                    data: { name: prod.name, description: prod.description, isActive: true }
                });
            }


            for (const catName of prod.categories) {
                // Find first because unique is not on name+productId in schema (only id)
                const existingCat = await tx.productCategory.findFirst({
                    where: { productId: product.id, name: catName }
                });

                if (!existingCat) {
                    await tx.productCategory.create({
                        data: { productId: product.id, name: catName, isActive: true }
                    });
                } else {
                    await tx.productCategory.update({
                        where: { id: existingCat.id },
                        data: { isActive: true }
                    });
                }
            }
        }
        console.log('✅ Product Taxonomy synchronized.');

        // --- 4.5 Default Departments & SLA (Sync from seed.ts logic) ---
        console.log('🏢 Syncing Default Departments & SLA Policies...');
        const DEFAULT_DEPARTMENTS = [
            {
                name: 'Technical Support',
                slug: 'technical-support',
                description: 'Handles: bug reports, software errors, integration issues, API problems',
                color: '#3B82F6', // Blue
                icon: 'Wrench',
                sla: {
                    name: 'Technical Standard SLA',
                    priority: TicketPriority?.MEDIUM || 'MEDIUM',
                    firstResponseMinutes: 60,
                    resolutionMinutes: 480
                },
                teams: [
                    { name: 'L1 Support', slug: 'l1-support' },
                    { name: 'L2 Support', slug: 'l2-support' },
                    { name: 'Engineering Escalation', slug: 'engineering-escalation' }
                ]
            },
            {
                name: 'Billing & Payments',
                slug: 'billing-payments',
                description: 'Handles: invoice questions, payment failures, subscription changes, refunds',
                color: '#10B981', // Green
                icon: 'CreditCard',
                sla: {
                    name: 'Billing Standard SLA',
                    priority: TicketPriority?.MEDIUM || 'MEDIUM',
                    firstResponseMinutes: 120,
                    resolutionMinutes: 1440
                },
                teams: [
                    { name: 'Billing Support', slug: 'billing-support' }
                ]
            },
            {
                name: 'Sales & Pre-Sales',
                slug: 'sales-pre-sales',
                description: 'Handles: product inquiries, demo requests, pricing questions, trial support',
                color: '#F59E0B', // Amber
                icon: 'ShoppingCart',
                sla: {
                    name: 'Sales Fast Response SLA',
                    priority: TicketPriority?.HIGH || 'HIGH',
                    firstResponseMinutes: 30,
                    resolutionMinutes: 240
                },
                teams: [
                    { name: 'Sales Team', slug: 'sales-team' }
                ]
            },
            {
                name: 'Customer Success',
                slug: 'customer-success',
                description: 'Handles: onboarding, feature adoption, account reviews, renewals',
                color: '#8B5CF6', // Purple
                icon: 'Heart',
                sla: {
                    name: 'CS Standard SLA',
                    priority: TicketPriority?.MEDIUM || 'MEDIUM',
                    firstResponseMinutes: 240,
                    resolutionMinutes: 2880
                },
                teams: [
                    { name: 'CS Team', slug: 'cs-team' }
                ]
            },
            {
                name: 'General Inquiries',
                slug: 'general-inquiries',
                description: 'Handles: unclassified tickets, feedback, general questions',
                color: '#6B7280', // Gray
                icon: 'HelpCircle',
                sla: {
                    name: 'General Resolution SLA',
                    priority: TicketPriority?.LOW || 'LOW',
                    firstResponseMinutes: 240,
                    resolutionMinutes: 1440
                },
                teams: [
                    { name: 'General Support', slug: 'general-support' }
                ]
            },
            {
                name: 'Security & Compliance',
                slug: 'security-compliance',
                description: 'Handles: security incidents, data requests, GDPR/privacy inquiries, abuse',
                color: '#EF4444', // Red
                icon: 'ShieldCheck',
                sla: {
                    name: 'Security Critical SLA',
                    priority: TicketPriority?.URGENT || 'URGENT',
                    firstResponseMinutes: 30,
                    resolutionMinutes: 240
                },
                teams: [
                    { name: 'Security Team', slug: 'security-team' }
                ]
            }
        ];

        for (const deptDef of DEFAULT_DEPARTMENTS) {
            const { sla, teams, ...deptData } = deptDef;
            let dept = await tx.department.findFirst({ where: { slug: deptData.slug } });
            if (dept) {
                dept = await tx.department.update({
                    where: { id: dept.id },
                    data: {
                        name: deptData.name,
                        description: deptData.description,
                        color: deptData.color,
                        icon: deptData.icon,
                        isDefault: true,
                    }
                });
            } else {
                dept = await tx.department.create({
                    data: {
                        ...deptData,
                        isDefault: true,
                    }
                });
            }

            // Seed SLA for this dept
            const slaId = `00000000-0000-0000-0000-${dept.id.substring(dept.id.length - 12)}`;
            const existingSla = await tx.slaPolicy.findUnique({ where: { id: slaId } });
            if (existingSla) {
                await tx.slaPolicy.update({
                    where: { id: slaId },
                    data: {
                        name: sla.name,
                        priority: sla.priority,
                        firstResponseMinutes: sla.firstResponseMinutes,
                        resolutionMinutes: sla.resolutionMinutes,
                    }
                });
            } else {
                await tx.slaPolicy.create({
                    data: {
                        id: slaId,
                        name: sla.name,
                        departmentId: dept.id,
                        priority: sla.priority,
                        firstResponseMinutes: sla.firstResponseMinutes,
                        resolutionMinutes: sla.resolutionMinutes,
                        businessHoursOnly: true
                    }
                });
            }

            // Seed Teams for this dept
            if (teams) {
                for (const teamDef of teams) {
                    const existingTeam = await tx.team.findFirst({ where: { slug: teamDef.slug } });
                    if (existingTeam) {
                        await tx.team.update({
                            where: { id: existingTeam.id },
                            data: {
                                name: teamDef.name,
                                departmentId: dept.id,
                            }
                        });
                    } else {
                        await tx.team.create({
                            data: {
                                name: teamDef.name,
                                slug: teamDef.slug,
                                departmentId: dept.id,
                            }
                        });
                    }
                }
            }
        }
        console.log('✅ Default Departments, Teams, and SLA Policies seeded.');

        // --- 5. Mandatory Settings ---
        console.log('⚙️ Enforcing mandatory settings...');
        const mandatorySettings = [
            { key: 'ai.chat_provider', value: 'gemini' },
            { key: 'ai.active_provider', value: 'gemini' },
            { key: 'ai.embed_provider', value: 'gemini' },
            { key: 'ai.gemini.chat_model', value: 'gemini-2.5-flash' },
            { key: 'ai.gemini.embed_model', value: 'gemini-embedding-2' },
            { key: 'ai.openai.chat_model', value: 'gpt-4o-mini' },
            { key: 'ai.openai.embed_model', value: 'text-embedding-3-small' },
            { key: 'ai.fallback_provider', value: 'openai' }
        ];

        for (const setting of mandatorySettings) {
            const existingSetting = await tx.setting.findUnique({
                where: { key: setting.key },
                select: { key: true }
            });

            if (!existingSetting) {
                await tx.setting.create({
                    data: { key: setting.key, value: setting.value, isSecret: false }
                });
            }
        }

        await tx.setting.updateMany({
            where: {
                key: 'ai.gemini.chat_model',
                value: { in: ['gemini-2.0-flash-exp', 'models/gemini-2.0-flash-exp'] },
            },
            data: { value: 'gemini-2.5-flash', isSecret: false },
        });

        const currentChatProvider = await tx.setting.findUnique({
            where: { key: 'ai.chat_provider' },
            select: { value: true },
        });

        if (currentChatProvider?.value) {
            await tx.setting.upsert({
                where: { key: 'ai.active_provider' },
                update: { value: currentChatProvider.value, isSecret: false },
                create: {
                    key: 'ai.active_provider',
                    value: currentChatProvider.value,
                    isSecret: false,
                },
            });
        }

        // --- 6. Knowledge Base Categories (Sync from seed.ts logic) ---
        console.log('📚 Syncing Knowledge Base Categories...');
        const KB_CATEGORIES = [
            { name: 'Genel Bilgiler', description: 'Destek merkezi kullanımı ve genel duyurular' },
            { name: 'Teknik Destek', description: 'Yazılım kurulumu ve teknik hata çözümleri' },
            { name: 'Lisans ve Abonelik', description: 'Lisans aktivasyonu ve abonelik işlemleri' },
            { name: 'Eğitim Videoları', description: 'Ürün kullanım eğitimleri' }
        ];

        for (const catDef of KB_CATEGORIES) {
            const slug = catDef.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await tx.category.upsert({
                where: { slug },
                update: { description: catDef.description },
                create: {
                    name: catDef.name,
                    slug,
                    description: catDef.description
                }
            });
        }
        console.log('✅ Knowledge Base Categories synchronized.');

        // --- 8. Announcement Templates Seeding ---
        console.log('📢 Syncing Announcement Templates...');
        const templates = [
            {
                name: 'Ürün Yol Haritası Güncellemesi',
                topic: 'Product',
                subject: 'Aluplan 2026 Ürün Yol Haritası Yayınlandı',
                contentMjml: '<mj-section><mj-column><mj-text>2026 Yol Haritamız yayında!</mj-text></mj-column></mj-section>'
            },
            {
                name: 'Güvenlik Denetimi Sonuç Özeti',
                topic: 'Security',
                subject: 'Güvenlik Denetimi Tamamlandı',
                contentMjml: '<mj-section><mj-column><mj-text>Güvenlik denetimimiz başarıyla tamamlandı.</mj-text></mj-column></mj-section>'
            }
        ];

        for (const t of templates) {
            await tx.announcementTemplate.upsert({
                where: { name: t.name },
                update: { topic: t.topic, subject: t.subject, contentMjml: t.contentMjml },
                create: { ...t, createdBy: adminUser.id }
            });
        }
        console.log('✅ Announcement templates synchronized.');

        console.log('🎉 Production Sync completed successfully!');
        // END TRANSACTIONAL SYNC
        }, { maxWait: 10_000, timeout: 120_000 });
    } catch (error) {
        console.error('❌ Production Sync FAILED:', error);
        throw error;
    } finally {
        const cleanupResults = await Promise.allSettled([
            prisma.$disconnect(),
            pool.end(),
        ]);
        for (const result of cleanupResults) {
            if (result.status === 'rejected') {
                console.error('❌ Production Sync cleanup failed:', result.reason);
            }
        }
    }
}

function handleFatalError(error) {
    console.error('❌ Production synchronization aborted:', error);
    process.exitCode = 1;
}

if (require.main === module) {
    main().catch(handleFatalError);
}

module.exports = { main };
