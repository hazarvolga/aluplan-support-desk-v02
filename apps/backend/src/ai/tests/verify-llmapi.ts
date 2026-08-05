import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SettingsService } from '../../settings/settings.service';
import { LlmApiService } from '../llm-api.service';
import { AiService } from '../ai.service';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('VerifyLlmapi');

async function verify() {
    cliLogger.log('🏁 Starting Comprehensive LLMAPI Verification...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const settings = app.get(SettingsService);
    const llmApi = app.get(LlmApiService);
    const _ai = app.get(AiService);

    try {
        // 1. Check current state
        const currentKey = await settings.get('ai.llmapi.api_key', true);
        cliLogger.log(`🔑 Current LLMAPI Key in DB: ${currentKey?.isSecret ? '[ENCRYPTED]' : '[PLAINTEXT]'}`);

        // 2. Simulate Save (Fixing the state if it was plaintext)
        if (currentKey && !currentKey.isSecret && currentKey.value) {
            cliLogger.log('🔧 Converting plaintext key to secret...');
            await settings.upsert({
                key: 'ai.llmapi.api_key',
                value: currentKey.value,
                isSecret: true
            });
            cliLogger.log('✅ Key converted to secret.');
        }

        // 3. Test Connectivity
        cliLogger.log('📡 Testing LLMAPI connectivity...');
        const available = await llmApi.isAvailable();
        cliLogger.log(`Service Available: ${available}`);

        if (available) {
            const response = await llmApi.generate('Test ping', 5000);
            cliLogger.log('✅ AI Response:', response);
        } else {
            cliLogger.warn('⚠️ Service not available (key might still be empty).');
        }

    } catch (err) {
        cliLogger.error('❌ Verification failed:', err);
    } finally {
        await app.close();
    }
}

verify();
