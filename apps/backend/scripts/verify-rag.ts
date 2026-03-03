import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AiQueryService } from '../src/ai/ai-query.service';
import { EmbeddingService } from '../src/ai/embedding.service';

async function bootstrap() {
    console.log('🧪 [VERIFY] Starting Production RAG Verification...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const aiQueryService = app.get(AiQueryService);
    const embeddingService = app.get(EmbeddingService);

    const testQuery = 'TBDY 2018 sismik kod ve yapısal analiz gereklilikleri nelerdir?';

    try {
        console.log(`🔍 [VERIFY] Testing Search for: "${testQuery}"`);
        const searchResults = await embeddingService.search(testQuery, 3);
        console.log(`✅ [VERIFY] Search successful! Found ${searchResults.results.length} results.`);

        if (searchResults.results.length > 0) {
            console.log('📄 [VERIFY] Top Result Sample:', searchResults.results[0].content.substring(0, 100) + '...');
        } else {
            console.warn('⚠️ [VERIFY] No results found. This might mean re-indexing is still in progress in background.');
        }

        console.log('🤖 [VERIFY] Testing Full RAG Query (includes Groq completion)...');
        // The service takes (userQuery, userId)
        const response = await aiQueryService.query(testQuery, null);

        console.log('✨ [VERIFY] Groq Response Received:');
        console.log('--------------------------------------------------');
        console.log(response.answer);
        console.log('--------------------------------------------------');
        console.log('📊 [VERIFY] Confidence:', response.confidence);
        console.log('🔗 [VERIFY] Interaction ID:', response.interactionId);

    } catch (err: any) {
        console.error('❌ [VERIFY] Test Failed:', err.message);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
