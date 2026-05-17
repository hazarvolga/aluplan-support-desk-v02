const { PrismaClient, TicketPriority } = require('../client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🏁 Starting Production Synchronization Loop...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing! Skipping sync.');
        return;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
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
            await prisma.permission.upsert({
                where: { name: permDef.name },
                update: { group: permDef.group, description: permDef.description },
                create: permDef
            });
        }

        let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
        if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: 'ADMIN', isSystem: true, description: 'Super Administrator' } });
        }

        let customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!customerRole) {
            customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', isSystem: true, description: 'Standard Customer' } });
        }

        // Connect ALL permissions to ADMIN role
        const perms = await prisma.permission.findMany();
        for (const p of perms) {
            await prisma.rolePermission.upsert({
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
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        console.log(`👤 Ensuring Admin user integrity (${adminEmail})...`);
        let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (adminUser) {
            await prisma.user.update({
                where: { id: adminUser.id },
                data: { roleId: adminRole.id, status: 'ACTIVE', deletedAt: null }
            });
        } else {
            const passwordHash = await bcrypt.hash('Vol1872017', 10);
            adminUser = await prisma.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: passwordHash,
                    fullName: 'Hazar Volga',
                    roleId: adminRole.id,
                    status: 'ACTIVE'
                }
            });
            console.log(`✅ Created default admin user: ${adminEmail}`);
        }

        // --- 3. User Recovery ---
        console.log('🩹 Running User Recovery...');
        // ... (rest of user recovery)
        const recovered = await prisma.user.updateMany({
            where: { OR: [{ deletedAt: { not: null } }, { status: 'INACTIVE' }] },
            data: { deletedAt: null, status: 'ACTIVE' }
        });
        if (recovered.count > 0) {
            console.log(`✅ Recovered ${recovered.count} users.`);
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
            let product = await prisma.product.findFirst({ where: { name: prod.name } });
            if (product) {
                product = await prisma.product.update({
                    where: { id: product.id },
                    data: { description: prod.description, isActive: true }
                });
            } else {
                product = await prisma.product.create({
                    data: { name: prod.name, description: prod.description, isActive: true }
                });
            }


            for (const catName of prod.categories) {
                // Find first because unique is not on name+productId in schema (only id)
                const existingCat = await prisma.productCategory.findFirst({
                    where: { productId: product.id, name: catName }
                });

                if (!existingCat) {
                    await prisma.productCategory.create({
                        data: { productId: product.id, name: catName, isActive: true }
                    });
                } else {
                    await prisma.productCategory.update({
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
            let dept = await prisma.department.findFirst({ where: { slug: deptData.slug } });
            if (dept) {
                dept = await prisma.department.update({
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
                dept = await prisma.department.create({
                    data: {
                        ...deptData,
                        isDefault: true,
                    }
                });
            }

            // Seed SLA for this dept
            const slaId = `00000000-0000-0000-0000-${dept.id.substring(dept.id.length - 12)}`;
            const existingSla = await prisma.slaPolicy.findUnique({ where: { id: slaId } });
            if (existingSla) {
                await prisma.slaPolicy.update({
                    where: { id: slaId },
                    data: {
                        name: sla.name,
                        priority: sla.priority,
                        firstResponseMinutes: sla.firstResponseMinutes,
                        resolutionMinutes: sla.resolutionMinutes,
                    }
                });
            } else {
                await prisma.slaPolicy.create({
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
                    const existingTeam = await prisma.team.findFirst({ where: { slug: teamDef.slug } });
                    if (existingTeam) {
                        await prisma.team.update({
                            where: { id: existingTeam.id },
                            data: {
                                name: teamDef.name,
                                departmentId: dept.id,
                            }
                        });
                    } else {
                        await prisma.team.create({
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
            const existingSetting = await prisma.setting.findUnique({
                where: { key: setting.key },
                select: { key: true }
            });

            if (!existingSetting) {
                await prisma.setting.create({
                    data: { key: setting.key, value: setting.value, isSecret: false }
                });
            }
        }

        await prisma.setting.updateMany({
            where: {
                key: 'ai.gemini.chat_model',
                value: { in: ['gemini-2.0-flash-exp', 'models/gemini-2.0-flash-exp'] },
            },
            data: { value: 'gemini-2.5-flash', isSecret: false },
        });

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
            await prisma.category.upsert({
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

        // --- 7. Test Customer Account ---
        console.log('🧪 Ensuring test customer account (droneracingturkey@gmail.com)...');
        let testCustomer = await prisma.user.findUnique({ where: { email: 'droneracingturkey@gmail.com' } });
        if (!testCustomer) {
            const testPassHash = await bcrypt.hash('Test1234!', 10);
            testCustomer = await prisma.user.create({
                data: {
                    email: 'droneracingturkey@gmail.com',
                    passwordHash: testPassHash,
                    fullName: 'Test Customer',
                    roleId: customerRole.id,
                    status: 'ACTIVE',
                    customerProfile: {
                        create: {
                            firstName: 'Test',
                            lastName: 'Customer',
                            customerNo: 'TEST-001',
                            companyName: 'Drone Racing Turkey',
                            phoneNumber: '5550000000'
                        }
                    }
                }
            });
            console.log('✅ Created test customer account.');
        } else {
            // Ensure they have the correct role and are active
            await prisma.user.update({
                where: { id: testCustomer.id },
                data: { roleId: customerRole.id, status: 'ACTIVE', deletedAt: null }
            });
        }

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
            await prisma.announcementTemplate.upsert({
                where: { name: t.name },
                update: { topic: t.topic, subject: t.subject, contentMjml: t.contentMjml },
                create: { ...t, createdBy: adminUser.id }
            });
        }
        console.log('✅ Announcement templates synchronized.');

        console.log('🎉 Production Sync completed successfully!');
    } catch (error) {
        console.error('❌ Production Sync FAILED:', error);
        // We don't exit(1) here because we want the app to try to start anyway
        // but we log the error clearly.
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
