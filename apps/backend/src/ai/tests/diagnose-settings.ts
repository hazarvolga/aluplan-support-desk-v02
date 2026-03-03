import { PrismaClient } from '@aluplan/database';

async function diagnose() {
    const prisma = new PrismaClient();
    try {
        console.log('🔍 Diagnosing AI Settings in Database...');
        const aiSettings = await prisma.setting.findMany({
            where: {
                key: {
                    startsWith: 'ai.'
                }
            }
        });

        console.table(aiSettings.map(s => ({
            key: s.key,
            isSecret: s.isSecret,
            valueLength: s.value?.length || 0,
            hasColons: s.value?.includes(':') || false,
            // Don't log the actual value for security
        })));

        const activeProvider = aiSettings.find(s => s.key === 'ai.active_provider')?.value;
        console.log(`\n🤖 Active Provider: ${activeProvider}`);

    } catch (err) {
        console.error('❌ Diagnosis failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
