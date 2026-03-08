import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 WordPress Kullanıcıları Aktarılıyor...');

    // Dosyayı oku
    const usersPath = path.join(__dirname, '../../../extracted_users.json');
    if (!fs.existsSync(usersPath)) {
        console.error('❌ extracted_users.json bulunamadı. Lütfen önce parse_sql.js betiğini çalıştırın.');
        process.exit(1);
    }

    const rawData = fs.readFileSync(usersPath, 'utf8');
    const wpUsers = JSON.parse(rawData);

    console.log(`📋 Toplam ${wpUsers.length} kullanıcı işleme alınıyor...`);

    // Gerekli Müşteri rolünü bul
    const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
    if (!customerRole) {
        console.error('❌ "customer" rolü bulunamadı. Lütfen db:seed komutunu kontrol edin.');
        process.exit(1);
    }

    // Use environment variable for default password, with a fallback for dev only
    const defaultPassword = process.env.WP_IMPORT_DEFAULT_PASSWORD;
    if (!defaultPassword) {
        console.error('❌ "WP_IMPORT_DEFAULT_PASSWORD" is required.');
        process.exit(1);
    }

    const defaultHash = await bcrypt.hash(defaultPassword, 12);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const wpUser of wpUsers) {
        const { email, name } = wpUser;

        // İsim ayırma
        let firstName = name;
        let lastName = '-';
        if (name && name.includes(' ')) {
            const parts = name.split(' ');
            lastName = parts.pop() || '-';
            firstName = parts.join(' ');
        }
        if (!firstName) firstName = 'Bilinmeyen';

        // Güvenlik amaçlı rastgele CustomerNo oluştur
        const uniqueId = Math.floor(100000 + Math.random() * 900000); // 6 digits
        const customerNo = `WP-${uniqueId}`;

        try {
            // Check if user exists
            let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

            if (!user) {
                // User'ı yarat
                user = await prisma.user.create({
                    data: {
                        email: email.toLowerCase(),
                        fullName: name || 'Bilinmeyen Kullanıcı',
                        passwordHash: defaultHash,
                        status: 'ACTIVE',
                        roleId: customerRole.id
                    }
                });

                // Customer Profilini Yarat
                await prisma.customerProfile.create({
                    data: {
                        userId: user.id,
                        firstName: firstName,
                        lastName: lastName,
                        customerNo: customerNo,
                        companyName: 'Bilinmeyen Şirket (Eski Sistem)',
                    }
                });

                successCount++;
                console.log(`✅ ${email} başarıyla içe aktarıldı.`);
            } else {
                // Kullanıcı zaten var
                skippedCount++;
            }
        } catch (error: any) {
            console.error(`❌ Hata (${email}):`, error.message || error);
            errorCount++;
        }
    }

    console.log('\n=======================================');
    console.log('🎉 WordPress Geçiş İşlemi Tamamlandı!');
    console.log(`✅ ${successCount} kullanıcı eklendi.`);
    console.log(`⏭️ ${skippedCount} kullanıcı zaten mevcut olduğu için atlandı.`);
    console.log(`❌ ${errorCount} kullanıcı hatalı/eksik veri sebebiyle eklenemedi.`);
    console.log('=======================================\n');
}

main()
    .catch((e) => {
        console.error('Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
