import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const systemRequirements = {
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
    ],
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
    ]
};

async function main() {
    console.log('Seeding System Requirements (TS)...');

    await prisma.setting.upsert({
        where: { key: 'SYSTEM_REQUIREMENTS' },
        update: {
            value: JSON.stringify(systemRequirements),
            isSecret: false,
        },
        create: {
            key: 'SYSTEM_REQUIREMENTS',
            value: JSON.stringify(systemRequirements),
            isSecret: false,
        },
    });

    console.log('✅ System Requirements seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
