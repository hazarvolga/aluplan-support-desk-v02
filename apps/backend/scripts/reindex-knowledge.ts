import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EmbeddingService } from '../src/ai/embedding.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('ReindexScript');
    const app = await NestFactory.createApplicationContext(AppModule);
    const embeddingService = app.get(EmbeddingService);

    logger.log('🚀 Starting Knowledge Base Re-indexing...');
    logger.log('This will re-calculate embeddings for ALL published articles using the current model and chunking settings.');

    try {
        const result = await embeddingService.reindexAll();
        logger.log(`✅ Re-indexing complete! Results:`);
        logger.log(`   - Successfully indexed: ${result.indexed}`);
        logger.log(`   - Failed: ${result.failed}`);
    } catch (error: any) {
        logger.error(`❌ Re-indexing failed: ${error.message}`);
    } finally {
        await app.close();
    }
}

bootstrap();
