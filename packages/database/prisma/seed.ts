import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient, TicketPriority } from '../client';
import * as bcrypt from 'bcryptjs';
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

    const isProduction = process.env.NODE_ENV === 'production';
    const allowE2eSeed = process.env.ALLOW_E2E_SEED === 'true';

    // Fail before the first Prisma query. Database seeding is a deliberate
    // maintenance operation and must never be an implicit boot side effect.
    if (process.env.ALLOW_DATABASE_SEED !== 'true') {
        throw new Error(
            'Database seeding is disabled. Set ALLOW_DATABASE_SEED=true only for an approved maintenance run.',
        );
    }
    if (isProduction && allowE2eSeed) {
        throw new Error('E2E data must never be seeded in production.');
    }

    const adminEmail =
        process.env.ADMIN_EMAIL?.trim() ||
        (allowE2eSeed ? 'e2e-admin@aluplan.test' : undefined);
    if (!adminEmail) {
        throw new Error('ADMIN_EMAIL is required for database seeding.');
    }

    // 1. Seed Admin User
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    let adminPassword: string | undefined;
    if (!admin) {
        if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') {
            throw new Error(
                'Admin bootstrap is disabled. Set ALLOW_ADMIN_BOOTSTRAP=true only when creating the initial administrator.',
            );
        }
        adminPassword =
            process.env.ADMIN_PASSWORD ??
            (allowE2eSeed ? 'E2E-Only-Not-A-Secret-2026!' : undefined);
        if (!adminPassword) {
            throw new Error(
                'ADMIN_PASSWORD is required when bootstrapping an administrator.',
            );
        }
    }

    let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: { name: 'ADMIN', isSystem: true },
        });
    }

    if (admin) {
        console.log('ℹ️ Existing admin user preserved; seed does not reset credentials or role.');
    } else {
        const hash = await bcrypt.hash(adminPassword, 12);
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                fullName: 'hazarvolga',
                passwordHash: hash,
                roleId: adminRole.id,
                status: 'ACTIVE',
            }
        });
    }
    console.log('✅ Admin seed check completed');

    // 1.5 Seed E2E Test Users
    if (allowE2eSeed) {
        const e2ePasswordHashAdmin = await bcrypt.hash('E2eAdmin!Pass123', 12);
        const e2ePasswordHashAgent = await bcrypt.hash('E2eAgent!Pass123', 12);
        const e2ePasswordHashCustomer = await bcrypt.hash('E2eCustomer!Pass123', 12);

        let agentRole = await prisma.role.findFirst({ where: { name: 'AGENT' } });
        if (!agentRole) {
            agentRole = await prisma.role.create({ data: { name: 'AGENT', isSystem: true } });
        }

        let customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!customerRole) {
            customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', isSystem: true } });
        }

        const e2eUsers = [
            { email: 'e2e-admin@aluplan.test', fullName: 'E2E Admin', role: 'ADMIN', passwordHash: e2ePasswordHashAdmin },
            { email: 'e2e-agent@aluplan.test', fullName: 'E2E Agent', role: 'AGENT', passwordHash: e2ePasswordHashAgent },
            { email: 'e2e-customer@aluplan.test', fullName: 'E2E Customer', role: 'CUSTOMER', passwordHash: e2ePasswordHashCustomer },
        ];

        for (const eu of e2eUsers) {
            const targetRole = eu.role === 'ADMIN' ? adminRole : eu.role === 'AGENT' ? agentRole : customerRole;
            const user = await prisma.user.findUnique({ where: { email: eu.email } });
            if (!user) {
                await prisma.user.create({
                    data: {
                        email: eu.email,
                        fullName: eu.fullName,
                        passwordHash: eu.passwordHash,
                        roleId: targetRole.id,
                        status: 'ACTIVE',
                    }
                });
            } else {
                await prisma.user.update({
                    where: { email: eu.email },
                    data: {
                        passwordHash: eu.passwordHash,
                        roleId: targetRole.id,
                    }
                });
            }
        }
        console.log('✅ E2E test users seeded');
    } else {
        console.log('ℹ️ E2E user seed skipped; set ALLOW_E2E_SEED=true in a non-production environment to enable it.');
    }

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
                priority: TicketPriority.MEDIUM,
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
                priority: TicketPriority.HIGH,
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
                priority: TicketPriority.MEDIUM,
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
                priority: TicketPriority.LOW,
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
                priority: TicketPriority.URGENT,
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

        console.log(`✅ Department '${deptData.name}' with default teams and SLA seeded`);
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
        {
            key: 'SYSTEM_REQUIREMENTS',
            value: JSON.stringify({
                "tr": [
                    {
                        "title": "ALLPLAN 2026",
                        "sections": [
                            {
                                "name": "Donanım Gereksinimleri",
                                "items": [
                                    "**MİNİMUM:** Intel/AMD Ryzen işlemci (ARM desteklenmez), 8 GB RAM, 20 GB boş disk alanı, OpenGL 4.2 uyumlu GPU (4 GB RAM / Redshift için 8 GB), 1920x1080 çözünürlük.",
                                    "**ÖNERİLEN:** Intel i5/i7/i9 veya Ryzen 5/7/9, 32 GB RAM, SSD depolama, 4K çözünürlük, Vulkan 1.2 veya OpenGL 4.5 GPU (>= 16 GB RAM)."
                                ]
                            },
                            {
                                "name": "Yazılım Gereksinimleri",
                                "items": [
                                    "**İŞLETİM SİSTEMİ:** Windows 11 v24H2, Windows Server 2019/2022/2025 Standard Edition.",
                                    "**VERİ SUNUCULARI:** Windows Server 2019/2022/2025, Windows Storage Server 2022 (NAS).",
                                    "**NAS/DFS UYARISI:** DFS desteklenmez; kilitlenmelere ve veri kaybına yol açabilir."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "FRILO 2026",
                        "sections": [
                            {
                                "name": "Donanım ve Yazılım",
                                "items": [
                                    "**MİNİMUM:** Intel/AMD Ryzen, 8 GB RAM, 10 GB disk alanı, OpenGL uyumlu GPU (2GB VRAM), 1280x1024 çözünürlük.",
                                    "**ÖNERİLEN:** Intel Core i5/i7/i9 veya Ryzen 5/7/9, 16 GB RAM, SSD, OpenGL 4.3 GPU (4GB RAM), 1920x1080 çözünürlük.",
                                    "**İŞLETİM SİSTEMİ:** Windows 11 v24H2.",
                                    "**VT (Opsiyonel):** Firebird 4, MariaDB, MsSQL Server 2019/2022/8.4."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "SCIA Engineer 2026",
                        "sections": [
                            {
                                "name": "Gereksinimler",
                                "items": [
                                    "**MİNİMUM:** Intel i7/Ryzen 5, 16 GB RAM, SSD, 5GB disk, 256MB GPU, OpenGL 2.1, FHD (4K desteklenir).",
                                    "**ÖNERİLEN:** Intel i7/Ryzen 7, 32+ GB RAM, SSD, 5GB+ disk, 4GB+ GPU, FHD."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Sanal Ortamlar",
                        "sections": [
                            {
                                "name": "Politika",
                                "items": [
                                    "Citrix, Azure Sanal Masaüstü ve hibrit kurulumlar desteklenir.",
                                    "Kurulum yönteminden bağımsız olarak teknik destek sağlanmaktadır.",
                                    "Altyapısal sorunlar dahili BT birimlerince çözülmelidir."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Servisler (Share, BIMPLUS, Exchange)",
                        "sections": [
                            {
                                "name": "ALLPLAN Share",
                                "items": [
                                    "**AĞ:** 10/20 Mbit/s min (50/100 önerilen), gecikme < 50ms, LAN bağlantısı önerilir.",
                                    "**DEPOLAMA:** Yerel SSD önerilir; ağ sürücüleri erişimi yavaşlatır."
                                ]
                            },
                            {
                                "name": "BIMPLUS & Exchange",
                                "items": [
                                    "**BIMPLUS:** 10 Mbit/s İnternet, WebGL 1.0, Güncel Tarayıcı.",
                                    "**EXCHANGE:** 10 Mbit/s İnternet, Acrobat Reader, SSL Beyaz Liste."
                                ]
                            }
                        ]
                    }
                ],
                "en": [
                    {
                        "title": "ALLPLAN 2026",
                        "sections": [
                            {
                                "name": "Hardware Requirements",
                                "items": [
                                    "**MINIMUM:** Intel/AMD Ryzen processor (ARM not supported), 8 GB RAM, 20 GB free disk, OpenGL 4.2 compatible GPU (4 GB RAM / 8 GB for Redshift), 1920x1080 resolution.",
                                    "**RECOMMENDATION:** Intel i5/i7/i9 or Ryzen 5/7/9, 32 GB RAM, SSD, 4K resolution, Vulkan 1.2 or OpenGL 4.5 GPU (>= 16 GB RAM), allplan.com/info/graphiccards certification."
                                ]
                            },
                            {
                                "name": "Software Requirements",
                                "items": [
                                    "**OS:** Windows 11 v24H2 (LTSC 2024 supported), Windows Server 2019/2022/2025 Standard.",
                                    "**DATA SERVERS:** Windows Server 2019/2022/2025, Windows Storage Server 2022 (NAS).",
                                    "**NAS/DFS WARNING:** DFS is NOT supported; can lead to crashes, deadlocks, and deleted files."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "FRILO 2026",
                        "sections": [
                            {
                                "name": "Hardware & Software",
                                "items": [
                                    "**MINIMUM:** Intel/AMD Ryzen, 8 GB RAM, 10 GB disk, OpenGL GPU (2GB VRAM), 1280x1024 resolution.",
                                    "**RECOMMENDED:** Intel Core i5/i7/i9 or Ryzen 5/7/9, 16 GB RAM, SSD, OpenGL 4.3 GPU (4GB RAM), 1920x1080 resolution.",
                                    "**OS:** Windows 11 v24H2.",
                                    "**DB (Optional):** Firebird 4, MariaDB, MsSQL Server 2019/2022/8.4."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "SCIA Engineer 2026",
                        "sections": [
                            {
                                "name": "Requirements",
                                "items": [
                                    "**MINIMUM:** Intel i7/Ryzen 5, 16 GB RAM, SSD, 5GB disk, 256MB GPU, OpenGL 2.1, FHD (up to 4K).",
                                    "**RECOMMENDATION:** Intel i7/Ryzen 7, 32+ GB RAM, SSD, 5GB+ disk, 4GB+ GPU, FHD (up to 4K)."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Virtual Environments",
                        "sections": [
                            {
                                "name": "Policy",
                                "items": [
                                    "ALLPLAN can be deployed in local installations, Citrix-based solutions, Azure Virtual Desktop, and other remote/hybrid setups.",
                                    "Dedicated technical support is provided regardless of deployment approach.",
                                    "If the issue is infrastructure-linked, users will be directed to their internal IT departments."
                                ]
                            }
                        ]
                    },
                    {
                        "title": "ALLPLAN Share / BIMPLUS / Exchange",
                        "sections": [
                            {
                                "name": "ALLPLAN Share",
                                "items": [
                                    "**NETWORK:** 10/20 Mbit/s min (50/100 recommended), latency < 50ms (best < 10ms), LAN preferred over WLAN.",
                                    "**STORAGE:** Local SSD recommended for file storage; network drives slow down access and must not be shared between users."
                                ]
                            },
                            {
                                "name": "BIMPLUS (Technical prerequisites)",
                                "items": [
                                    "10 Mbit/s Internet (50 Mbps recommended), JavaScript, WebGL 1.0, Latest Modern Browser (IE not supported)."
                                ]
                            },
                            {
                                "name": "ALLPLAN Exchange",
                                "items": [
                                    "Exchange user/company account, 10 Mbit/s Internet, Acrobat Reader, Latest Browser, official SSL whitelisting."
                                ]
                            }
                        ]
                    }
                ]
            }),
            isSecret: false
        },

    ];

    for (const setting of defaultSettings) {
        const existingSetting = await prisma.setting.findFirst({ where: { key: setting.key } });
        if (existingSetting) {
            // Only update if it's not a secret or if we want to force update system data
            if (setting.key === 'SYSTEM_REQUIREMENTS' || !setting.isSecret) {
                await prisma.setting.update({
                    where: { key: setting.key },
                    data: { value: setting.value }
                });
            }
        } else {
            await prisma.setting.create({ data: setting });
        }
    }
    console.log('✅ Default settings seeded');

    // 4. Products & Categories
    const PRODUCTS_TAXONOMY = [
        {
            name: "ALLPLAN",
            description: "Mimari ve Mühendislik BIM Çözümü",
            categories: [
                {
                    name: "Sistem, Lisans & Abonelik",
                    keywords: [
                        "cloud licensing", "wibu", "dongle", "aktivasyon", "hata kodu", "ultimate", "professional", "concept", "basic",
                        "yavaşlama", "bağlantı hatası", "çökme", "açılmıyor", "donma", "performans", "kilitlendi", "yanıt vermiyor",
                        "eğitim lisansı", "kurulum hatası", "crash", "kurulum", "setup", "yükleme", "donanım", "sistem gereksinimleri",
                        "ekran kartı", "ram", "lisans", "etkinleştirme", "müşteri no", "destek", "abonelik", "allmenu", "güncelleme",
                        "update", "servis paketi", "return", "license transfer", "taşıma", "bilgisayar", "codemeter"
                    ]
                },
                {
                    name: "Mimari ve 3B Modelleme",
                    keywords: [
                        "duvar", "taşıyıcı", "çizim", "ölçülendirme", "katman", "pafta", "kesit", "ölçek", "ai görselleştirme", "render",
                        "kaplama", "lumion", "nasıl yapılır", "how to", "ayarlar", "arayüz bozuk", "siyah ekran", "kütüphane eksik",
                        "yazdır", "pdf çıktı", "model", "mimari", "ndo", "format", "dosya", "kalem", "pen", "renk", "çizgi", "sembol",
                        "kütüphane", "library", "smartpart", "pythonpart", "2d", "3d", "nesne", "wizard", "sihirbaz", "hız",
                        "object palette", "filtre", "yönetim", "plane set", "kot", "yükseklik", "güneş", "analiz", "gölge", "visual scripting",
                        "akıllı nesne", "pbc", "dob", "handles", "tutamaç", "more_horiz", "actionbar"
                    ]
                },
                {
                    name: "Mühendislik (Donatı & Çelik)",
                    keywords: [
                        "donatı", "çelik", "betonarme", "donatı pozlama", "metraj listesi", "scia", "frilo", "precast", "şantiye",
                        "hesap hatası", "rebar", "detay", "metraj", "liste", "rapor", "excel", "birleşim", "bağlantı", "bending schedule",
                        "shape code", "büküm şekli", "sds2", "bamtec", "statik", "yapısal analiz", "saf", "autoconverter"
                    ]
                },
                {
                    name: "BIM, Veri Paylaşımı & Altyapı",
                    keywords: [
                        "ifc", "dwg", "koordinasyon", "referans model", "bulut", "bimplus", "allplan share", "civil", "köprü",
                        "altyapı", "bozuk dosya", "corrupt", "senkronizasyon hatası", "kaydetme sorunu", "teamwork hatası", "yedekleme",
                        "kurtarma", "bak backup", "share", "cloud", "ortak çalışma", "revizyon", "çakışma", "point cloud", "nokta bulutu",
                        "import", "arazi", "topografya", "terren", "drawing file", "dgn", "xref", "referans", "bep", "standart", "iso 19650",
                        "federated model", "alignment", "landxml", "bcf", "clash detection", "eir", "property set manager", "ids", "mvd"
                    ]
                }
            ]
        },
        {
            name: "AX3000",
            description: "Mekanik ve Elektrik Tesisat (MEP) Çözümü",
            categories: [
                { name: "Mekanik, Elektrik & Sıhhi Tesisat", keywords: ["boru", "vana", "sıhhi tesisat", "şebeke", "bağlantı", "boyutlandırma", "elektrik", "tava", "kablo", "çarpışma", "çakışma", "mep", "ventilation", "heating", "cooling"] },
                { name: "İklimlendirme (HVAC) & TS825", keywords: ["ısıtma", "soğutma", "havalandırma", "ts825", "ekb", "iklim", "vr", "debi", "yalıtım", "enerji performansı", "hata kodu", "psychrometric", "duct", "pipe"] }
            ]
        },
        {
            name: "CDS Add-on",
            description: "Aluplan Geliştirilmiş Eklentileri",
            categories: [
                { name: "Arazi, Altyapı & Rampa", keywords: ["arazi", "kazı", "dolgu", "yol", "sürüş eğrisi", "rampa", "otopark", "drive curve", "hafriyat", "eğim hatası", "terrain", "road", "bridge", "tunnel"] },
                { name: "Akıllı Tasarım Araçları", keywords: ["çelik profil", "3b ölçü", "grafik metin", "dwg converter", "skp dönüştürücü", "geometri araçları", "eklenti çalışmıyor", "plugin hatası", "utility", "helper", "productivity"] }
            ]
        }
    ];

    for (const prodDef of PRODUCTS_TAXONOMY) {
        let product = await prisma.product.findFirst({ where: { name: prodDef.name } });

        if (product) {
            product = await prisma.product.update({
                where: { id: product.id },
                data: { description: prodDef.description, isActive: true }
            });
        } else {
            product = await prisma.product.create({
                data: { name: prodDef.name, description: prodDef.description, isActive: true }
            });
        }

        for (const catDef of prodDef.categories) {
            const category = await prisma.productCategory.findFirst({
                where: { productId: product.id, name: catDef.name }
            });

            if (category) {
                await prisma.productCategory.update({
                    where: { id: category.id },
                    data: { keywords: catDef.keywords, isActive: true }
                });
            } else {
                await prisma.productCategory.create({
                    data: { productId: product.id, name: catDef.name, keywords: catDef.keywords, isActive: true }
                });
            }
        }
    }
    console.log('✅ Products and Categories seeded');

    // 5. Seed Test Customers — explicit non-production only
    if (allowE2eSeed) {

        const customerRole = await prisma.role.findFirstOrThrow({
            where: { name: 'CUSTOMER' },
        });
        const e2eCustomerPasswordHash = await bcrypt.hash(
            process.env.E2E_CUSTOMER_PASSWORD ?? 'E2eCustomer!Pass123',
            12,
        );
        const testCustomers = [
            {
                email: 'e2e-customer@aluplan.com',
                fullName: 'E2E Test Customer',
                phoneNumber: '905550009988'
            }
        ];

        for (const testCust of testCustomers) {
            let user = await prisma.user.findUnique({ where: { email: testCust.email } });
            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        fullName: testCust.fullName,
                        passwordHash: e2eCustomerPasswordHash,
                        roleId: customerRole.id,
                    }
                });
            } else {
                user = await prisma.user.create({
                    data: {
                        email: testCust.email,
                        fullName: testCust.fullName,
                        passwordHash: e2eCustomerPasswordHash,
                        roleId: customerRole.id,
                        status: 'ACTIVE',
                    }
                });
            }

            const existingProfile = await prisma.customerProfile.findUnique({ where: { userId: user.id } });
            if (existingProfile) {
                await prisma.customerProfile.update({
                    where: { id: existingProfile.id },
                    data: { phoneNumber: testCust.phoneNumber }
                });
            } else {
                await prisma.customerProfile.create({
                    data: {
                        userId: user.id,
                        firstName: testCust.fullName.split(' ')[0],
                        lastName: testCust.fullName.split(' ')[1] || 'User',
                        companyName: 'Test Corp',
                        customerNo: `CUST-${user.id.substring(0, 5)}`,
                        phoneNumber: testCust.phoneNumber
                    }
                });
            }
        }
        console.log('✅ E2E test customers seeded');
    }

    console.log('\n🎉 Seed complete!');
}


main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
