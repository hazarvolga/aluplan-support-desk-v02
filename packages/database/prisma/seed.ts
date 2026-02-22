import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLES = [
    { name: 'admin', description: 'Full system access' },
    { name: 'support_manager', description: 'Can manage tickets, view reports, configure SLAs' },
    { name: 'support_agent', description: 'Handle and respond to tickets' },
    { name: 'kb_editor', description: 'Create and submit knowledge base articles for review' },
    { name: 'viewer', description: 'Read-only access' },
    { name: 'customer', description: 'Self-registered customer with support access' },
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
    customer: ['ticket:create', 'ticket:read', 'kb:read'],
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

    // Seed Products and Categories (Taxonomy)
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
        // Find existing product by name to emulate upsert (since name isn't marked @unique in schema)
        let product = await prisma.product.findFirst({
            where: { name: prodDef.name }
        });

        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: prodDef.name,
                    description: prodDef.description,
                    isActive: true,
                }
            });
        } else {
            // Update description just in case
            await prisma.product.update({
                where: { id: product.id },
                data: { description: prodDef.description, isActive: true }
            });
        }

        // Seed Categories
        for (const catDef of prodDef.categories) {
            let category = await prisma.productCategory.findFirst({
                where: { productId: product.id, name: catDef.name }
            });

            if (!category) {
                await prisma.productCategory.create({
                    data: {
                        productId: product.id,
                        name: catDef.name,
                        keywords: catDef.keywords,
                        isActive: true
                    }
                });
            } else {
                await prisma.productCategory.update({
                    where: { id: category.id },
                    data: { keywords: catDef.keywords, isActive: true }
                });
            }
        }
    }
    console.log('✅ Base Products and Categories Taxonomy seeded');

    console.log('\n🎉 Seed complete!');
    console.log(`👤 Admin: admin@aluplan.com / ${adminPassword}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
