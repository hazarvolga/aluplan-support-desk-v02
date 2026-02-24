import { PrismaClient, SystemRole, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
    const hash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@aluplan.com' },
        update: {
            role: SystemRole.ADMIN,
        },
        create: {
            email: 'admin@aluplan.com',
            fullName: 'System Administrator',
            passwordHash: hash,
            role: SystemRole.ADMIN,
            status: 'ACTIVE',
        },
    });
    console.log('✅ Admin user seeded');

    // 2. Default Departments Seeding (from ekip.md)
    const DEFAULT_DEPARTMENTS = [
        {
            name: 'Technical Support',
            slug: 'technical-support',
            description: 'Handles: bug reports, software errors, integration issues, API problems',
            color: '#3B82F6', // Blue
            icon: 'Wrench',
            sla: {
                name: 'Technical Standard SLA',
                priority: TicketPriority.MEDIUM,
                firstResponseMinutes: 60,
                resolutionMinutes: 480
            }
        },
        {
            name: 'Billing & Payments',
            slug: 'billing-payments',
            description: 'Handles: invoice questions, payment failures, subscription changes, refunds',
            color: '#10B981', // Green
            icon: 'CreditCard',
            sla: {
                name: 'Billing Standard SLA',
                priority: TicketPriority.MEDIUM,
                firstResponseMinutes: 120,
                resolutionMinutes: 1440
            }
        },
        {
            name: 'Sales & Pre-Sales',
            slug: 'sales-pre-sales',
            description: 'Handles: product inquiries, demo requests, pricing questions, trial support',
            color: '#F59E0B', // Amber
            icon: 'ShoppingCart',
            sla: {
                name: 'Sales Fast Response SLA',
                priority: TicketPriority.HIGH,
                firstResponseMinutes: 30,
                resolutionMinutes: 240
            }
        },
        {
            name: 'Customer Success',
            slug: 'customer-success',
            description: 'Handles: onboarding, feature adoption, account reviews, renewals',
            color: '#8B5CF6', // Purple
            icon: 'Heart',
            sla: {
                name: 'CS Standard SLA',
                priority: TicketPriority.MEDIUM,
                firstResponseMinutes: 240,
                resolutionMinutes: 2880
            }
        },
        {
            name: 'General Inquiries',
            slug: 'general-inquiries',
            description: 'Handles: unclassified tickets, feedback, general questions',
            color: '#6B7280', // Gray
            icon: 'HelpCircle',
            sla: {
                name: 'General Resolution SLA',
                priority: TicketPriority.LOW,
                firstResponseMinutes: 240,
                resolutionMinutes: 1440
            }
        },
        {
            name: 'Security & Compliance',
            slug: 'security-compliance',
            description: 'Handles: security incidents, data requests, GDPR/privacy inquiries, abuse',
            color: '#EF4444', // Red
            icon: 'ShieldCheck',
            sla: {
                name: 'Security Critical SLA',
                priority: TicketPriority.URGENT,
                firstResponseMinutes: 30,
                resolutionMinutes: 240
            }
        }
    ];

    for (const deptDef of DEFAULT_DEPARTMENTS) {
        const { sla, ...deptData } = deptDef;
        const dept = await prisma.department.upsert({
            where: { slug: deptData.slug },
            update: {
                name: deptData.name,
                description: deptData.description,
                color: deptData.color,
                icon: deptData.icon,
                isDefault: true,
            },
            create: {
                ...deptData,
                isDefault: true,
            },
        });

        // Seed SLA for this dept
        const slaId = `00000000-0000-0000-0000-${dept.id.substring(dept.id.length - 12)}`;
        await prisma.slaPolicy.upsert({
            where: { id: slaId },
            create: {
                id: slaId,
                name: sla.name,
                departmentId: dept.id,
                priority: sla.priority,
                firstResponseMinutes: sla.firstResponseMinutes,
                resolutionMinutes: sla.resolutionMinutes,
                businessHoursOnly: true
            },
            update: {
                name: sla.name,
                priority: sla.priority,
                firstResponseMinutes: sla.firstResponseMinutes,
                resolutionMinutes: sla.resolutionMinutes,
            }
        });

        console.log(`✅ Department '${deptData.name}' with default SLA seeded`);
    }

    // 3. Seed Default Settings
    const defaultSettings = [
        { key: 'mail_provider', value: 'resend', isSecret: false },
        { key: 'app_name', value: 'Aluplan Support', isSecret: false },
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

    // 4. Products & Categories
    const PRODUCTS_TAXONOMY = [
        {
            name: "ALLPLAN",
            description: "Mimari ve Mühendislik BIM Çözümü",
            categories: [
                { name: "Sistem, Lisans & Abonelik", keywords: ["cloud licensing", "wibu", "dongle", "aktivasyon"] },
                { name: "Mimari ve 3B Modelleme", keywords: ["duvar", "taşıyıcı", "çizim"] },
                { name: "Mühendislik (Donatı & Çelik)", keywords: ["donatı", "çelik", "betonarme"] },
                { name: "BIM, Veri Paylaşımı & Altyapı", keywords: ["ifc", "dwg", "koordinasyon"] }
            ]
        },
        {
            name: "AX3000",
            description: "Mekanik ve Elektrik Tesisat (MEP) Çözümü",
            categories: [
                { name: "Mekanik, Elektrik & Sıhhi Tesisat", keywords: ["boru", "vana", "sıhhi tesisat"] },
                { name: "İklimlendirme (HVAC) & TS825", keywords: ["ısıtma", "soğutma", "havalandırma"] }
            ]
        },
        {
            name: "CDS Add-on",
            description: "Aluplan Geliştirilmiş Eklentileri",
            categories: [
                { name: "Arazi, Altyapı & Rampa", keywords: ["arazi", "kazı", "rampa"] },
                { name: "Akıllı Tasarım Araçları", keywords: ["çelik profil", "3b ölçü"] }
            ]
        }
    ];

    for (const prodDef of PRODUCTS_TAXONOMY) {
        let product = await prisma.product.findFirst({ where: { name: prodDef.name } });

        if (!product) {
            product = await prisma.product.create({
                data: { name: prodDef.name, description: prodDef.description, isActive: true }
            });
        }

        for (const catDef of prodDef.categories) {
            let category = await prisma.productCategory.findFirst({
                where: { productId: product.id, name: catDef.name }
            });

            if (!category) {
                await prisma.productCategory.create({
                    data: { productId: product.id, name: catDef.name, keywords: catDef.keywords, isActive: true }
                });
            }
        }
    }
    console.log('✅ Products and Categories seeded');

    // 5. Knowledge Base
    await seedKnowledgeBase(admin.id);

    console.log('\n🎉 Seed complete!');
}

function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function seedKnowledgeBase(adminId: string) {
    console.log('\n📚 Knowledge Base Seeding...');
    const kbPath = path.resolve(__dirname, '../../../Bilgi Bankası/BilgiHavuzuMD');

    if (!fs.existsSync(kbPath)) {
        console.log(`⚠️ KB directory not found: ${kbPath}`);
        return;
    }

    async function walk(dir: string, parentId: string | null = null) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'scraper') continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const slug = generateSlug(entry.name);
                let cat = await prisma.category.findUnique({ where: { slug } });
                if (!cat) {
                    cat = await prisma.category.create({
                        data: { name: entry.name.replace(/_/g, ' '), slug, parentId }
                    });
                }
                await walk(fullPath, cat.id);
            } else if (entry.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const title = entry.name.replace(/\.md$/i, '');
                const slug = generateSlug(title);

                const existing = await prisma.knowledgeArticle.findUnique({ where: { slug } });
                if (!existing) {
                    const article = await prisma.knowledgeArticle.create({
                        data: {
                            title,
                            slug,
                            status: 'PUBLISHED',
                            approved: true,
                            approvedBy: adminId,
                            createdBy: adminId,
                            categoryId: parentId,
                            isInternal: true,
                        }
                    });

                    await prisma.knowledgeArticleVersion.create({
                        data: {
                            articleId: article.id,
                            version: 1,
                            title,
                            content,
                            contentPlain: content.replace(/[#*`_\[\]]/g, ''),
                            createdBy: adminId,
                        }
                    });
                }
            }
        }
    }

    await walk(kbPath);
    console.log('✅ Knowledge Base seeded');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
