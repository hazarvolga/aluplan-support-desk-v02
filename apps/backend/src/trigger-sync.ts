
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KnowledgePoolService } from './knowledge-pool/knowledge-pool.service';
import { Logger } from '@nestjs/common';

// Multer File interface for standalone script context
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

async function bootstrap() {
    const logger = new Logger('SyncScript');
    logger.log('🚀 Starting standalone Knowledge Pool Sync...');

    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const knowledgePoolService = app.get(KnowledgePoolService);

        logger.log('⏳ Triggering syncLocalDataset()...');
        const result = await knowledgePoolService.syncLocalDataset();

        logger.log('✅ Sync Result: ' + JSON.stringify(result, null, 2));

        await app.close();
        logger.log('👋 Standalone sync complete.');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Sync Failed:', error);
        process.exit(1);
    }
}

bootstrap();
