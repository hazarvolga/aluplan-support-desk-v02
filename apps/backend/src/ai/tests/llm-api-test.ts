import { NestFactory } from '@nestjs/core';
import { AiModule } from '../ai.module';
import { LlmApiService } from '../llm-api.service';
import { AiService } from '../ai.service';

async function testLLMAPI() {
    const app = await NestFactory.createApplicationContext(AiModule);
    const llmApi = app.get(LlmApiService);
    const aiDispatcher = app.get(AiService);

    console.log('🚀 Starting LLMAPI.ai Integration Test...');

    const available = await llmApi.isAvailable();
    console.log(`📡 Service Available: ${available}`);

    if (!available) {
        console.error('❌ LLMAPI Key is missing in .env or Settings.');
        await app.close();
        return;
    }

    console.log('🧪 Testing Chat Completion (llmapi provider)...');
    try {
        const response = await llmApi.generate('Hello! Are you working correctly through LLMAPI.ai?', 10000);
        console.log('✅ Response:', response);
    } catch (err) {
        console.error('❌ Chat Completion Failed:', err.message);
    }

    console.log('🧪 Testing Dispatcher (AiService with llmapi)...');
    try {
        // We set the provider name manually for test if needed, or it uses the setting
        const result = await aiDispatcher.generate('Simple dispatcher test.');
        console.log('✅ Dispatcher Result:', result);
    } catch (err) {
        console.error('❌ Dispatcher Failed:', err.message);
    }

    await app.close();
}

testLLMAPI().catch(console.error);
