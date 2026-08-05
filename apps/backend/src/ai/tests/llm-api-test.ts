import { NestFactory } from '@nestjs/core';
import { AiModule } from '../ai.module';
import { LlmApiService } from '../llm-api.service';
import { AiService } from '../ai.service';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('LlmApiTest');

async function testLLMAPI() {
    const app = await NestFactory.createApplicationContext(AiModule);
    const llmApi = app.get(LlmApiService);
    const aiDispatcher = app.get(AiService);

    cliLogger.log('🚀 Starting LLMAPI.ai Integration Test...');

    const available = await llmApi.isAvailable();
    cliLogger.log(`📡 Service Available: ${available}`);

    if (!available) {
        cliLogger.error('❌ LLMAPI Key is missing in .env or Settings.');
        await app.close();
        return;
    }

    cliLogger.log('🧪 Testing Chat Completion (llmapi provider)...');
    try {
        const response = await llmApi.generate('Hello! Are you working correctly through LLMAPI.ai?', 10000);
        cliLogger.log('✅ Response:', response);
    } catch (err) {
        cliLogger.error('❌ Chat Completion Failed:', err.message);
    }

    cliLogger.log('🧪 Testing Dispatcher (AiService with llmapi)...');
    try {
        // We set the provider name manually for test if needed, or it uses the setting
        const result = await aiDispatcher.generate('Simple dispatcher test.');
        cliLogger.log('✅ Dispatcher Result:', result);
    } catch (err) {
        cliLogger.error('❌ Dispatcher Failed:', err.message);
    }

    await app.close();
}

testLLMAPI().catch((error) => cliLogger.error(error));
