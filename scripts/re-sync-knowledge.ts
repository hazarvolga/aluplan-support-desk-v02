
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/backend/src/app.module';
import { KnowledgePoolService } from '../apps/backend/src/knowledge-pool/knowledge-pool.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('KB-Sync-Trigger');
    logger.log('🚀 Starting Knowledge Base re-sync trigger...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const knowledgePoolService = app.get(KnowledgePoolService);

    try {
        logger.log('🔄 Calling syncLocalDataset()...');
        const result = await knowledgePoolService.syncLocalDataset();
        logger.log(`✅ Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
        logger.error(`❌ Sync failed: ${error.message}`, error.stack);
    } finally {
        await app.close();
        logger.log('👋 Sync trigger finished.');
    }
}

bootstrap();
