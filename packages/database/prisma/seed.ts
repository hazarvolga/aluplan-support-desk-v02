import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Vol1872017';
    const hash = await bcrypt.hash(adminPassword, 12);

    let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
    if (!adminRole) { // Fallback if roles aren't seeded yet
        adminRole = await prisma.role.create({ data: { name: 'admin', isSystem: true } });
    }

    const admin = await prisma.user.upsert({
        where: { email: 'hazarvolga@gmail.com' },
        update: {
            roleId: adminRole.id,
            passwordHash: hash,
            fullName: 'hazarvolga',
        },
        create: {
            email: 'hazarvolga@gmail.com',
            fullName: 'hazarvolga',
            passwordHash: hash,
            roleId: adminRole.id,
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
        { key: 'resend_api_key', value: process.env.RESEND_API_KEY || '', isSecret: true },
        { key: 'mail_from', value: process.env.MAIL_FROM || 'support@aluplan.com', isSecret: false },
        { key: 'app_name', value: 'Aluplan Support', isSecret: false },
        { key: 'app_logo', value: '', isSecret: false },
        { key: 'app_primary_color', value: '#1d4ed8', isSecret: false },
        { key: 'ai_provider', value: 'openai', isSecret: false },
        { key: 'ai_model', value: 'text-embedding-3-small', isSecret: false },
        { key: 'ai_confidence_threshold_high', value: '0.90', isSecret: false },
        { key: 'ai_confidence_threshold_medium', value: '0.80', isSecret: false },
        { key: 'ai_similarity_threshold', value: '0.35', isSecret: false },
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
                { name: "Sistem, Lisans & Abonelik", keywords: ["cloud licensing", "wibu", "dongle", "aktivasyon", "hata kodu", "ultimate", "professional", "concept", "basic", "yavaşlama", "bağlantı hatası", "çökme", "açılmıyor", "donma", "performans", "kilitlendi", "yanıt vermiyor", "eğitim lisansı", "kurulum hatası", "crash"] },
                { name: "Mimari ve 3B Modelleme", keywords: ["duvar", "taşıyıcı", "çizim", "ölçülendirme", "katman", "pafta", "kesit", "ölçek", "ai görselleştirme", "render", "kaplama", "lumion", "nasıl yapılır", "how to", "ayarlar", "arayüz bozuk", "siyah ekran", "kütüphane eksik", "yazdır", "pdf çıktı"] },
                { name: "Mühendislik (Donatı & Çelik)", keywords: ["donatı", "çelik", "betonarme", "donatı pozlama", "metraj listesi", "scia", "frilo", "precast", "şantiye", "hesap hatası"] },
                { name: "BIM, Veri Paylaşımı & Altyapı", keywords: ["ifc", "dwg", "koordinasyon", "referans model", "bulut", "bimplus", "allplan share", "civil", "köprü", "altyapı", "bozuk dosya", "corrupt", "senkronizasyon hatası", "kaydetme sorunu", "teamwork hatası", "yedekleme", "kurtarma", "bak backup"] }
            ]
        },
        {
            name: "AX3000",
            description: "Mekanik ve Elektrik Tesisat (MEP) Çözümü",
            categories: [
                { name: "Mekanik, Elektrik & Sıhhi Tesisat", keywords: ["boru", "vana", "sıhhi tesisat", "şebeke", "bağlantı", "boyutlandırma", "elektrik", "tava", "kablo", "çarpışma", "çakışma"] },
                { name: "İklimlendirme (HVAC) & TS825", keywords: ["ısıtma", "soğutma", "havalandırma", "ts825", "ekb", "iklim", "vr", "debi", "yalıtım", "enerji performansı", "hata kodu"] }
            ]
        },
        {
            name: "CDS Add-on",
            description: "Aluplan Geliştirilmiş Eklentileri",
            categories: [
                { name: "Arazi, Altyapı & Rampa", keywords: ["arazi", "kazı", "dolgu", "yol", "sürüş eğrisi", "rampa", "otopark", "drive curve", "hafriyat", "eğim hatası"] },
                { name: "Akıllı Tasarım Araçları", keywords: ["çelik profil", "3b ölçü", "grafik metin", "dwg converter", "skp dönüştürücü", "geometri araçları", "eklenti çalışmıyor", "plugin hatası"] }
            ]
        }
    ];

    for (const prodDef of PRODUCTS_TAXONOMY) {
        let product = await prisma.product.findFirst({ where: { name: prodDef.name } });

        if (!product) {
            product = await prisma.product.create({
                data: { name: prodDef.name, description: prodDef.description, isActive: true }
            });
        } else {
            await prisma.product.update({
                where: { id: product.id },
                data: { description: prodDef.description, isActive: true }
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
            } else {
                await prisma.productCategory.update({
                    where: { id: category.id },
                    data: { keywords: catDef.keywords, isActive: true }
                });
            }
        }
    }
    console.log('✅ Products and Categories seeded');

    // 5. Seed Test Customers
    let customerRole = await prisma.role.findFirst({ where: { name: 'customer' } });
    if (!customerRole) {
        customerRole = await prisma.role.create({ data: { name: 'customer', isSystem: true } });
    }

    const testCustomers = [
        {
            email: 'e2e-customer@aluplan.com',
            fullName: 'E2E Test Customer',
            phoneNumber: '905550009988'
        },
        {
            email: 'hazarvolga@gmail.com', // Admin but also having profile for testing convenience
            fullName: 'hazarvolga',
            phoneNumber: '905550007766'
        }
    ];

    for (const testCust of testCustomers) {
        const user = await prisma.user.upsert({
            where: { email: testCust.email },
            update: { fullName: testCust.fullName },
            create: {
                email: testCust.email,
                fullName: testCust.fullName,
                passwordHash: hash,
                roleId: testCust.email === 'hazarvolga@gmail.com' ? adminRole.id : customerRole.id,
                status: 'ACTIVE',
            }
        });

        await prisma.customerProfile.upsert({
            where: { userId: user.id },
            update: { phoneNumber: testCust.phoneNumber },
            create: {
                userId: user.id,
                firstName: testCust.fullName.split(' ')[0],
                lastName: testCust.fullName.split(' ')[1] || 'User',
                companyName: 'Test Corp',
                customerNo: `CUST-${user.id.substring(0, 5)}`,
                phoneNumber: testCust.phoneNumber
            }
        });
    }
    console.log('✅ Test customers seeded');

    // 5. Knowledge Base seeding removed — articles are now managed via admin UI only.

    console.log('\n🎉 Seed complete!');
}


main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
