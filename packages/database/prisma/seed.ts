import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

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

    // Call Knowledge Base Seed
    await seedKnowledgeBase();

    console.log('\n🎉 Seed complete!');
    console.log(`👤 Admin: admin@aluplan.com / ${adminPassword}`);
}

function parseFrontmatter(content: string) {
    const fmRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(fmRegex);
    let title = null;
    let body = content;
    if (match) {
        body = content.slice(match[0].length).trim();
        const titleMatch = match[1].match(/^title:\s*"?([^"\n]*)"?/m);
        if (titleMatch) title = titleMatch[1];
    }
    return { title, body };
}


function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function seedKnowledgeBase() {
    console.log('\n📚 1. Knowledge Base (Bilgi Havuzu) Taraması Başlıyor...');
    // Proje kökündeki Bilgi Bankası klasörüne erişim
    const kbPath = path.resolve(__dirname, '../../../Bilgi Bankası/BilgiHavuzuMD');

    if (!fs.existsSync(kbPath)) {
        console.log(`⚠️ Bilgi Havuzu klasörü bulunamadı: ${kbPath}`);
        return;
    }

    const admin = await prisma.user.findUnique({ where: { email: 'admin@aluplan.com' } });
    if (!admin) {
        console.log('⚠️ Admin kullanıcısı bulunamadı, KB seed atlanıyor.');
        return;
    }

    let fileCount = 0;
    let chunkCount = 0;

    async function walk(dir: string, categoryPath: { name: string, slug: string, id: string }[] = []) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name === '.DS_Store' || entry.name === 'scraper') continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const slug = generateSlug(entry.name) || `cat-${Date.now()}`;

                let parentId = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : null;

                let cat = await prisma.category.findUnique({ where: { slug } });
                if (!cat) {
                    cat = await prisma.category.create({
                        data: {
                            name: entry.name.replace(/_/g, ' '),
                            slug,
                            parentId
                        }
                    });
                }

                await walk(fullPath, [...categoryPath, { name: cat.name, slug: cat.slug, id: cat.id }]);
            } else if (entry.name.endsWith('.md') || entry.name.endsWith('.txt') || entry.name.endsWith('.MD')) {
                const contentText = fs.readFileSync(fullPath, 'utf-8');
                const { body } = parseFrontmatter(contentText);

                // Use the exact filename as the base title
                let articleTitle = entry.name.replace(/\.(md|txt|MD)$/i, '');

                const categoryId = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : null;
                const categoryName = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].name : null;

                // Implement Option B: Prepend category name to differentiate files with the same name
                if (categoryName) {
                    articleTitle = `[${categoryName}] ${articleTitle}`;
                }

                fileCount++; // Tracking total items
                chunkCount++; // We consider each file as 1 major chunk/article now

                let slugBase = generateSlug(articleTitle);

                const existing = await prisma.knowledgeArticle.findFirst({
                    where: { title: articleTitle }
                });

                if (existing) {
                    const latestVersion = await prisma.knowledgeArticleVersion.findFirst({
                        where: { articleId: existing.id },
                        orderBy: { version: 'desc' }
                    });

                    if (!latestVersion || latestVersion.content !== body) {
                        const newVersionNum = (latestVersion?.version || 0) + 1;
                        await prisma.knowledgeArticleVersion.create({
                            data: {
                                articleId: existing.id,
                                version: newVersionNum,
                                title: articleTitle,
                                content: body,
                                contentPlain: body.replace(/[#*`_\[\]]/g, ''),
                                createdBy: admin.id,
                            }
                        });
                        await prisma.knowledgeArticle.update({
                            where: { id: existing.id },
                            data: { currentVersion: newVersionNum, status: 'REVIEW', approved: false }
                        });
                    }
                } else {
                    let finalSlug = slugBase;
                    let suffix = 1;
                    while (true) {
                        const clash = await prisma.knowledgeArticle.findUnique({ where: { slug: finalSlug } });
                        if (!clash) break;
                        finalSlug = `${slugBase}-${suffix}`;
                        suffix++;
                    }

                    const newArticle = await prisma.knowledgeArticle.create({
                        data: {
                            categoryId,
                            title: articleTitle,
                            slug: finalSlug,
                            status: 'REVIEW',
                            createdBy: admin.id,
                            currentVersion: 1,
                        }
                    });

                    await prisma.knowledgeArticleVersion.create({
                        data: {
                            articleId: newArticle.id,
                            version: 1,
                            title: articleTitle,
                            content: body,
                            contentPlain: body.replace(/[#*`_\[\]]/g, ''),
                            createdBy: admin.id
                        }
                    });
                }
            }
        }
    }

    await walk(kbPath);
    console.log(`✅ Bilgi Havuzu Yüklemesi Tamamlandı. ${fileCount} parça incelendi, ${chunkCount} parçada yeni versiyon/ekleme yapıldı.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
