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
        // --- 1. Roles Enforcement ---
        console.log('📡 Enforcing System Roles...');
        let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
        if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: 'ADMIN', isSystem: true, description: 'Super Administrator' } });
        }

        let customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!customerRole) {
            customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', isSystem: true, description: 'Standard Customer' } });
        }

        // --- 2. Admin User Protection ---
        console.log('👤 Ensuring Admin user integrity (hazarvolga@gmail.com)...');
        const adminUser = await prisma.user.findUnique({ where: { email: 'hazarvolga@gmail.com' } });
        if (adminUser) {
            await prisma.user.update({
                where: { id: adminUser.id },
                data: { roleId: adminRole.id, status: 'ACTIVE', deletedAt: null }
            });
        }

        // --- 3. User Recovery (Current Production Issues Fix) ---
        console.log('🩹 Running User Recovery (Undeleting stuck users)...');
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
            const product = await prisma.product.upsert({
                where: { name: prod.name },
                update: { description: prod.description, isActive: true },
                create: { name: prod.name, description: prod.description, isActive: true }
            });

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

        // --- 5. Mandatory Settings ---
        console.log('⚙️ Enforcing mandatory settings...');
        const mandatorySettings = [
            { key: 'ai_provider', value: 'openai' },
            { key: 'ai_model', value: 'text-embedding-3-small' }
        ];

        for (const setting of mandatorySettings) {
            await prisma.setting.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: { key: setting.key, value: setting.value, isSecret: false }
            });
        }

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
