const { PrismaClient } = require('../../../packages/database/client');
const prisma = new PrismaClient();

const systemRequirements = {
    "en": [
        {
            "title": "ALLPLAN 2026",
            "sections": [
                {
                    "name": "Hardware Requirements",
                    "items": [
                        "**MINIMUM:** Intel/AMD Ryzen processor, 8 GB RAM, 20 GB disk, OpenGL 4.2 GPU (4GB RAM)",
                        "**RECOMMENDED:** Intel i5/i7/i9 or Ryzen 5/7/9, 32 GB RAM, SSD, 4K Screen, Vulkan 1.2 or OpenGL 4.5 GPU (16GB RAM)"
                    ]
                },
                {
                    "name": "Software Requirements",
                    "items": [
                        "**OS:** Windows 11 v24H2, Windows Server 2019/2022/2025",
                        "**DATA SERVERS:** Windows Server 2019/2022/2025, Windows Storage Server 2022",
                        "**NAS/DFS WARNING:** DFS is NOT supported; can lead to crashes and data loss."
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
                        "**MINIMUM:** Intel/AMD Ryzen, 8 GB RAM, 10 GB disk, OpenGL GPU (2GB VRAM)",
                        "**RECOMMENDED:** Intel i5/i7/i9, 16 GB RAM, OpenGL 4.3 GPU (4GB RAM)",
                        "**OS:** Windows 11 v24H2",
                        "**DB:** Firebird 4, MariaDB, MsSQL 2019/2022/8.4"
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
                        "**MINIMUM:** Intel i7/Ryzen 5, 16 GB RAM, SSD, 256MB GPU, OpenGL 2.1",
                        "**RECOMMENDED:** Intel i7/Ryzen 7, 32 GB RAM, SSD, 4GB+ GPU"
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
                        "Supports Citrix, Azure Virtual Desktop, and hybrid setups.",
                        "Technical support is provided regardless of deployment approach.",
                        "Infrastructure issues should be handled by internal IT."
                    ]
                }
            ]
        },
        {
            "title": "Services (Share, BIMPLUS, Exchange)",
            "sections": [
                {
                    "name": "ALLPLAN Share",
                    "items": [
                        "**NETWORK:** 10/20 Mbit/s min (50/100 recommended), latency < 50ms (best < 10ms).",
                        "**STORAGE:** Local SSD recommended for file storage folder."
                    ]
                },
                {
                    "name": "BIMPLUS & Exchange",
                    "items": [
                        "**BIMPLUS:** 10 Mbit/s Internet, WebGL 1.0, Modern Browser (No IE).",
                        "**EXCHANGE:** 10 Mbit/s Internet, Acrobat Reader, SSL Whitelisting."
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
                        "**MİNİMUM:** Intel/AMD Ryzen işlemci, 8 GB RAM, 20 GB disk, OpenGL 4.2 GPU (4GB RAM)",
                        "**ÖNERİLEN:** Intel i5/i7/i9 veya Ryzen 5/7/9, 32 GB RAM, SSD, 4K Ekran, Vulkan 1.2 veya OpenGL 4.5 GPU (16GB RAM)"
                    ]
                },
                {
                    "name": "Yazılım Gereksinimleri",
                    "items": [
                        "**İŞLETİM SİSTEMİ:** Windows 11 v24H2, Windows Server 2019/2022/2025",
                        "**VERİ SUNUCULARI:** Windows Server 2019/2022/2025, Windows Storage Server 2022",
                        "**NAS/DFS UYARISI:** DFS desteklenmez; kilitlenme ve veri kaybına yol açabilir."
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
                        "**MİNİMUM:** Intel/AMD Ryzen, 8 GB RAM, 10 GB disk, OpenGL GPU (2GB VRAM)",
                        "**ÖNERİLEN:** Intel i5/i7/i9, 16 GB RAM, OpenGL 4.3 GPU (4GB RAM)",
                        "**İŞLETİM SİSTEMİ:** Windows 11 v24H2",
                        "**VT:** Firebird 4, MariaDB, MsSQL 2019/2022/8.4"
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
                        "**MİNİMUM:** Intel i7/Ryzen 5, 16 GB RAM, SSD, 256MB GPU, OpenGL 2.1",
                        "**ÖNERİLEN:** Intel i7/Ryzen 7, 32 GB RAM, SSD, 4GB+ GPU"
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
                        "Citrix, Azure Virtual Desktop ve hibrit kurulumları destekler.",
                        "Kurulum yaklaşımından bağımsız olarak teknik destek sağlanır.",
                        "Altyapı sorunları dahili BT birimleri tarafından yönetilmelidir."
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
                        "**AĞ:** 10/20 Mbit/s min (50/100 önerilen), gecikme < 50ms (en iyi < 10ms).",
                        "**DEPOLAMA:** Yerel dosya depolama klasörü için yerel SSD önerilir."
                    ]
                },
                {
                    "name": "BIMPLUS & Exchange",
                    "items": [
                        "**BIMPLUS:** 10 Mbit/s İnternet, WebGL 1.0, Modern Tarayıcı (IE desteklenmez).",
                        "**EXCHANGE:** 10 Mbit/s İnternet, Acrobat Reader, SSL Beyaz Liste."
                    ]
                }
            ]
        }
    ],
    "de": [
        {
            "title": "ALLPLAN 2026",
            "sections": [
                {
                    "name": "Hardware-Anforderungen",
                    "items": [
                        "**MINIMUM:** Intel/AMD Ryzen Prozessor, 8 GB RAM, 20 GB Festplatte, OpenGL 4.2 GPU (4GB RAM)",
                        "**EMPFEHLUNG:** Intel i5/i7/i9 oder Ryzen 5/7/9, 32 GB RAM, SSD, 4K-Bildschirm, Vulkan 1.2 oder OpenGL 4.5 GPU (16GB RAM)"
                    ]
                },
                {
                    "name": "Software-Anforderungen",
                    "items": [
                        "**BS:** Windows 11 v24H2, Windows Server 2019/2022/2025",
                        "**DATENSERVER:** Windows Server 2019/2022/2025, Windows Storage Server 2022",
                        "**NAS/DFS WARNUNG:** DFS wird NICHT unterstützt; kann zu Abstürzen und Datenverlust führen."
                    ]
                }
            ]
        }
    ]
};

async function main() {
    console.log('Seeding System Requirements...');

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
