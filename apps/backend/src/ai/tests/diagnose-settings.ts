import { PrismaClient } from '@aluplan/database';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('DiagnoseSettings');

async function diagnose() {
    const prisma = new PrismaClient();
    try {
        cliLogger.log('🔍 Diagnosing AI Settings in Database...');
        const aiSettings = await prisma.setting.findMany({
            where: {
                key: {
                    startsWith: 'ai.'
                }
            }
        });

        cliLogger.log(JSON.stringify(aiSettings.map(s => ({
            key: s.key,
            isSecret: s.isSecret,
            valueLength: s.value?.length || 0,
            hasColons: s.value?.includes(':') || false,
            // Don't log the actual value for security
        })), null, 2));

        const activeProvider = aiSettings.find(s => s.key === 'ai.active_provider')?.value;
        cliLogger.log(`\n🤖 Active Provider: ${activeProvider}`);

    } catch (err) {
        cliLogger.error('❌ Diagnosis failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
