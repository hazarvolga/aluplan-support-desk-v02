import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SettingsService } from '../../settings/settings.service';
import { LlmApiService } from '../llm-api.service';
import { AiService } from '../ai.service';

async function verify() {
    console.log('🏁 Starting Comprehensive LLMAPI Verification...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const settings = app.get(SettingsService);
    const llmApi = app.get(LlmApiService);
    const _ai = app.get(AiService);

    try {
        // 1. Check current state
        const currentKey = await settings.get('ai.llmapi.api_key', true);
        console.log(`🔑 Current LLMAPI Key in DB: ${currentKey?.isSecret ? '[ENCRYPTED]' : '[PLAINTEXT]'}`);

        // 2. Simulate Save (Fixing the state if it was plaintext)
        if (currentKey && !currentKey.isSecret && currentKey.value) {
            console.log('🔧 Converting plaintext key to secret...');
            await settings.upsert({
                key: 'ai.llmapi.api_key',
                value: currentKey.value,
                isSecret: true
            });
            console.log('✅ Key converted to secret.');
        }

        // 3. Test Connectivity
        console.log('📡 Testing LLMAPI connectivity...');
        const available = await llmApi.isAvailable();
        console.log(`Service Available: ${available}`);

        if (available) {
            const response = await llmApi.generate('Test ping', 5000);
            console.log('✅ AI Response:', response);
        } else {
            console.warn('⚠️ Service not available (key might still be empty).');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        await app.close();
    }
}

verify();
