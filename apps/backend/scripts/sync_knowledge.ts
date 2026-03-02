
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { KnowledgePoolService } from '../src/knowledge-pool/knowledge-pool.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    console.log('🚀 Starting Knowledge Base Sync (Enhanced Logs)...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(KnowledgePoolService);
    const prisma = app.get(PrismaService);

    try {
        console.log('📊 Pre-sync Check:');
        const count = await prisma.knowledgeSource.count();
        console.log(` - Existing Knowledge Sources: ${count}`);

        const result = await service.syncLocalDataset();
        console.log('✅ Sync Method Result:', result);

        const afterCount = await prisma.knowledgeSource.count();
        console.log(` - Knowledge Sources after sync: ${afterCount}`);
    } catch (err) {
        console.error('❌ Sync Failed:', err);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
