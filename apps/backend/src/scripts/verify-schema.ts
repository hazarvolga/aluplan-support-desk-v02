import { PrismaClient } from '@aluplan/database';

async function verifySchema() {
    const prisma = new PrismaClient();
    console.log('🔍 Starting Schema Verification...');

    const checks = [
        { table: 'products', column: 'deleted_at' },
        { table: 'products', column: 'is_active' },
        { table: 'teams', column: 'deleted_at' },
        { table: 'teams', column: 'is_archived' },
        { table: 'teams', column: 'assignment_strategy' },
        { table: 'users', column: 'deleted_at' },
        { table: 'users', column: 'agent_status' },
        { table: 'departments', column: 'deleted_at' },
        { table: 'departments', column: 'color' },
        { table: 'tickets', column: 'deleted_at' },
        { table: 'ai_interactions', column: 'provider' },
        { table: 'ai_interactions', column: 'model' },
    ];

    let allOk = true;

    for (const check of checks) {
        try {
            const result: any[] = await prisma.$queryRawUnsafe(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${check.table}' AND column_name = '${check.column}';
            `);

            if (result.length > 0) {
                console.log(`✅ ${check.table}.${check.column} exists.`);
            } else {
                console.log(`❌ ${check.table}.${check.column} MISSING!`);
                allOk = false;
            }
        } catch (e: any) {
            console.log(`⚠️ Error checking ${check.table}.${check.column}: ${e.message}`);
            allOk = false;
        }
    }

    await prisma.$disconnect();

    if (allOk) {
        console.log('\n✨ DATABASE SCHEMA VERIFIED: ALL GHOST COLUMNS RESOLVED.');
        process.exit(0);
    } else {
        console.log('\n🚨 SCHEMA VERIFICATION FAILED: SOME COLUMNS ARE STILL MISSING.');
        process.exit(1);
    }
}

verifySchema().catch(err => {
    console.error(err);
    process.exit(1);
});
