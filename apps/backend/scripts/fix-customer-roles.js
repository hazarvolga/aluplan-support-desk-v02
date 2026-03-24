const { PrismaClient } = require('@aluplan/database');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
    console.log("🛠️ Starting CRM synced users role fix script...");
    if (!process.env.DATABASE_URL) {
        console.error("❌ Error: DATABASE_URL environment variable is missing.");
        process.exit(1);
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const customerRole = await prisma.role.findUnique({
            where: { name: 'CUSTOMER' }
        });

        if (!customerRole) {
            console.error("❌ CUSTOMER role not found in the database. Aborting script.");
            process.exit(1);
        }

        console.log(`✅ Found CUSTOMER role with ID: ${customerRole.id}`);

        // Update any user that has a CustomerProfile but no role
        const usersWithProfiles = await prisma.user.findMany({
            where: {
                customerProfile: {
                    isNot: null
                },
                roleId: null,
            },
            select: { id: true }
        });

        console.log(`🔍 Found ${usersWithProfiles.length} users with CustomerProfiles but no roleId.`);

        let profileUpdateCount = 0;
        for (const u of usersWithProfiles) {
            await prisma.user.update({
                where: { id: u.id },
                data: { roleId: customerRole.id }
            });
            profileUpdateCount++;
        }

        // Also bulk update any remaining users exactly marked as CRM_SYNCED without a role
        const crmSyncedUsers = await prisma.user.updateMany({
            where: {
                passwordHash: 'CRM_SYNCED',
                roleId: null
            },
            data: {
                roleId: customerRole.id
            }
        });

        console.log(`✅ Fixed ${profileUpdateCount} users linked to profiles.`);
        console.log(`✅ Bulk fixed ${crmSyncedUsers.count} orphaned CRM synced users.`);
        console.log("🎉 Customer role fix script completed successfully.");

    } catch (err) {
        console.error("❌ Error running fix script:", err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
