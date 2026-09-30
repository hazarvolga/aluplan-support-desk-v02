import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../utils/crypto.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { BulkUpsertSettingDto } from './dto/bulk-upsert-setting.dto';
import { assertEmbeddingMigrationApproved, isEmbeddingModelSetting } from '../ai/embedding-migration.guard';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);
    private cache = new Map<string, string>();
    private secretCache = new Map<string, boolean>();
    private readonly secretKeyPatterns = [
        /\.api_key$/,
        /\.secret_key$/,
        /\.client_secret$/,
        /\.webhook_secret$/,
        /\.credentials_json$/,
        /\.token$/,
        /^resend_api_key$/,
        /^dynamics_api_key$/,
        /^crm\.dynamics\.api_key$/,
    ];

    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
        private eventEmitter: EventEmitter2,
    ) { }

    async upsert(dto: UpsertSettingDto, userId?: string) {
        if (isEmbeddingModelSetting(dto.key) && dto.value !== '********') {
            assertEmbeddingMigrationApproved();
        }
        const existing = await this.get(dto.key, true);
        const oldValue = existing?.value;

        // AI Validation Logic
        if (dto.key.startsWith('ai.')) {
            const context = new Map([[dto.key, dto.value]]);
            await this.validateAiSetting(dto.key, dto.value, context);
        }

        // Guard: Do not overwrite existing secrets with the masked placeholder
        if (dto.value === '********') {
            const existing = await this.get(dto.key, true);
            if (existing) return this.maskSettingResponse(existing);
        }

        const isSecret = this.resolveSecretFlag(dto.key, dto.isSecret);
        let finalValue = dto.value;
        if (isSecret) {
            finalValue = this.crypto.encrypt(dto.value);
        }

        const setting = await this.prisma.setting.upsert({
            where: { key: dto.key },
            update: {
                value: finalValue,
                isSecret,
                updatedBy: userId,
            },
            create: {
                key: dto.key,
                value: finalValue,
                isSecret,
                updatedBy: userId,
            },
        });

        // Update cache
        this.cache.set(dto.key, dto.value); // Store plaintext in cache for internal use
        this.secretCache.set(dto.key, isSecret);

        if (dto.key === 'ai.chat_provider' && dto.value !== '********') {
            await this.prisma.setting.upsert({
                where: { key: 'ai.active_provider' },
                update: {
                    value: dto.value,
                    isSecret: false,
                    updatedBy: userId,
                },
                create: {
                    key: 'ai.active_provider',
                    value: dto.value,
                    isSecret: false,
                    updatedBy: userId,
                },
            });
            this.cache.set('ai.active_provider', dto.value);
            this.secretCache.set('ai.active_provider', false);
        }

        if ((dto.key === 'ai.embed_provider' || dto.key.endsWith('.embed_model')) && oldValue !== finalValue) {
            this.eventEmitter.emit('ai.embedding.provider_changed', { key: dto.key, newValue: finalValue, oldValue });
        }

        return this.maskSettingResponse(setting);
    }

    private isSecretKey(key: string): boolean {
        return this.isMailPasswordKey(key) || this.secretKeyPatterns.some((pattern) => pattern.test(key));
    }

    private isMailPasswordKey(key: string): boolean {
        return key === 'email.imap.pass' || key === 'email.smtp.pass';
    }

    private resolveSecretFlag(key: string, requested?: boolean): boolean {
        return requested === true || this.isSecretKey(key);
    }

    private maskSettingResponse<T extends { key: string; value: string; isSecret: boolean }>(setting: T): T {
        const isSecret = this.resolveSecretFlag(setting.key, setting.isSecret);
        return isSecret
            ? { ...setting, value: '********', isSecret: true }
            : setting;
    }

    private async securePlaintextSecret<T extends { key: string; value: string; isSecret: boolean }>(setting: T): Promise<T> {
        // Legacy mail passwords remain readable without introducing a read-time DB rewrite.
        // Explicit saves encrypt them; API responses and caches still classify them as secrets.
        if (setting.isSecret || this.isMailPasswordKey(setting.key) || !this.isSecretKey(setting.key)) {
            return setting;
        }

        const plaintext = setting.value ?? '';
        const encryptedValue = this.crypto.encrypt(plaintext);
        await this.prisma.setting.update({
            where: { key: setting.key },
            data: {
                value: encryptedValue,
                isSecret: true,
            },
        });

        this.logger.warn(`Secured plaintext secret setting: ${setting.key}`);
        this.cache.set(setting.key, plaintext);
        this.secretCache.set(setting.key, true);

        return {
            ...setting,
            value: encryptedValue,
            isSecret: true,
        };
    }

    private async validateAiSetting(key: string, value: string, context?: Map<string, string>) {
        const getVal = async (k: string) => context?.get(k) ?? await this.getValue(k);

        // 1. If key is a provider switch, check if its models are configured
        if (key === 'ai.chat_provider' || key === 'ai.embed_provider' || key.startsWith('ai.specialized.')) {
            const providerToValidate = value;

            if (providerToValidate === 'ollama') {
                const url = await getVal('ai.ollama.url');
                const chatModel = await getVal('ai.ollama.chat_model');
                const embedModel = await getVal('ai.ollama.embed_model');
                if (!url || !chatModel || !embedModel) {
                    throw new Error(`Ollama yapılandırması eksik (URL, Chat Model veya Embed Model).`);
                }
            }
            if (providerToValidate === 'openai') {
                const apiKey = await getVal('ai.openai.api_key');
                const chatModel = await getVal('ai.openai.chat_model');
                const embedModel = await getVal('ai.openai.embed_model');
                if (!apiKey || !chatModel || !embedModel) {
                    throw new Error(`OpenAI yapılandırması eksik (API Key, Chat Model veya Embed Model).`);
                }
            }
            if (providerToValidate === 'anthropic') {
                const apiKey = await getVal('ai.anthropic.api_key');
                const chatModel = await getVal('ai.anthropic.chat_model');
                if (!apiKey || !chatModel) {
                    throw new Error(`Anthropic yapılandırması eksik (API Key veya Chat Model).`);
                }
            }
            if (providerToValidate === 'gemini') {
                const apiKey = await getVal('ai.gemini.api_key');
                const chatModel = await getVal('ai.gemini.chat_model');
                const embedModel = await getVal('ai.gemini.embed_model');
                if (!apiKey || !chatModel || (key === 'ai.embed_provider' && !embedModel)) {
                    throw new Error(`Gemini yapılandırması eksik (API Key, Chat Model veya Embed Model).`);
                }
            }
            if (providerToValidate === 'vertex') {
                const projectId = await getVal('ai.vertex.project_id');
                const chatModel = await getVal('ai.vertex.chat_model');
                // credentials_json is optional if using ADC, but project_id is required in our UI flow
                if (!projectId || !chatModel) {
                    throw new Error(`Google Vertex AI yapılandırması eksik (GCP Project ID veya Chat Model).`);
                }
            }
        }

        // 2. If key is a model field being emptied, check if it's the active provider or used in specialized mappings
        if (key.endsWith('.chat_model') || key.endsWith('.embed_model') || key.endsWith('.api_key') || key.endsWith('.project_id') || key.endsWith('.credentials_json')) {
            if (!value || value.trim() === '' || value === '********') {
                if (value === '********') return; // Valid masked secret

                const parts = key.split('.');
                const providerName = parts[1]; // e.g. 'openai' from 'ai.openai.chat_model'

                const currentChat = await getVal('ai.chat_provider');
                const currentEmbed = await getVal('ai.embed_provider');

                // Also check specialized mappings
                const specializedKeys = [
                    'ai.specialized.categorization_provider',
                    'ai.specialized.summarization_provider',
                    'ai.specialized.reformatting_provider',
                    'ai.specialized.analyze_sentiment_provider',
                    'ai.specialized.translate_provider'
                ];

                let isUsedInSpecialized = false;
                for (const sKey of specializedKeys) {
                    if (await getVal(sKey) === providerName) {
                        isUsedInSpecialized = true;
                        break;
                    }
                }

                if (currentChat === providerName || currentEmbed === providerName || isUsedInSpecialized) {
                    const reason = isUsedInSpecialized ? 'bir özel görev eşleşmesinde' : 'aktif sağlayıcı olarak';
                    throw new Error(`Şu anda ${reason} kullanılan "${providerName}" için "${key}" alanı boş bırakılamaz.`);
                }
            }
        }
    }

    async get(key: string, decrypt = false): Promise<any> {
        // Return from cache if available (plaintext internal cache)
        if (this.cache.has(key)) {
            const isSecret = this.resolveSecretFlag(key, this.secretCache.get(key));
            let value = this.cache.get(key) || '';

            if (isSecret && !decrypt) {
                value = '********';
            }

            this.secretCache.set(key, isSecret);
            return { key, value, isSecret };
        }

        let setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting) {
            return null;
        }

        setting = await this.securePlaintextSecret(setting);

        let plaintext = setting.value;
        if (setting.isSecret) {
            try {
                plaintext = this.crypto.decrypt(setting.value);
            } catch (error: any) {
                this.logger.warn(`❌ Decryption failed for setting: ${key}. This usually means ENCRYPTION_KEY has changed or data is corrupt. ACTION: Please re-save this setting in the Admin Panel to update the encryption. Error: ${error.message}`);
                plaintext = ''; // Return empty fallback so UI doesn't break
            }
        }

        // Hydrate cache
        this.cache.set(key, plaintext);
        const isSecret = this.resolveSecretFlag(key, setting.isSecret);
        this.secretCache.set(key, isSecret);

        return { ...setting, value: isSecret && !decrypt ? '********' : plaintext, isSecret };
    }

    /**
     * Internal method for services to get plaintext values directly without DTO wrapper
     */
    async getValue(key: string): Promise<string | null> {
        const setting = await this.get(key, true);
        return setting?.value ?? null;
    }

    /**
     * Quick setter for services that need to update a single setting value.
     */
    async setValue(key: string, value: string): Promise<void> {
        await this.upsert({ key, value, isSecret: false });
    }

    async getAll(decrypt = false) {
        const settings = await this.prisma.setting.findMany();
        const securedSettings = await Promise.all(settings.map((s) => this.securePlaintextSecret(s)));

        return securedSettings.map((s) => {
            let value = s.value;
            const isSecret = this.resolveSecretFlag(s.key, s.isSecret);
            if (s.isSecret) {
                try {
                    const plaintext = this.crypto.decrypt(s.value);
                    this.cache.set(s.key, plaintext);
                    this.secretCache.set(s.key, true);
                    value = decrypt ? plaintext : '********';
                } catch (_e) {
                    this.logger.warn(`Decryption failed for setting: ${s.key}`);
                    this.cache.set(s.key, '');
                    this.secretCache.set(s.key, true);
                    value = decrypt ? '' : '********';
                }
            } else {
                this.cache.set(s.key, s.value);
                this.secretCache.set(s.key, isSecret);
            }
            return { ...s, value: isSecret && !decrypt ? '********' : value, isSecret };
        });
    }

    async bulkUpsert(dto: BulkUpsertSettingDto, userId?: string) {
        const settings = this.withLegacyAiProviderSync(dto.settings);

        if (settings.some((item) => isEmbeddingModelSetting(item.key) && item.value !== '********')) {
            assertEmbeddingMigrationApproved();
        }

        // Run validations first with full context of this request
        const context = new Map<string, string>(settings.map(s => [s.key, s.value]));
        
        // Fetch existing settings before bulk update to compare changes
        const keysToUpdate = settings.map(s => s.key);
        const existingSettings = await this.prisma.setting.findMany({
            where: { key: { in: keysToUpdate } }
        });
        const existingMap = new Map(existingSettings.map(s => [s.key, s.isSecret ? this.crypto.decrypt(s.value) : s.value]));

        for (const item of settings) {
            if (item.key.startsWith('ai.')) {
                await this.validateAiSetting(item.key, item.value, context);
            }
        }

        // Use a transaction for all upserts
        const results = await this.prisma.$transaction(
            settings.map((item) => {
                let finalValue = item.value;
                const isSecret = this.resolveSecretFlag(item.key, item.isSecret);

                // Handle masked secrets
                if (item.value === '********') {
                    // This is a bit tricky in a transaction because we need the existing value
                    // But in a bulk save, usually the user didn't change this, so we skip it
                    return this.prisma.setting.findUnique({ where: { key: item.key } });
                }

                if (isSecret) {
                    finalValue = this.crypto.encrypt(item.value);
                }

                return this.prisma.setting.upsert({
                    where: { key: item.key },
                    update: {
                        value: finalValue,
                        isSecret,
                        updatedBy: userId,
                    },
                    create: {
                        key: item.key,
                        value: finalValue,
                        isSecret,
                        updatedBy: userId,
                    },
                });
            })
        );

        // Update caches after success
        for (const item of settings) {
            if (item.value !== '********') {
                this.cache.set(item.key, item.value);
                this.secretCache.set(item.key, this.resolveSecretFlag(item.key, item.isSecret));
                
                const oldVal = existingMap.get(item.key);
                if ((item.key === 'ai.embed_provider' || item.key.endsWith('.embed_model')) && oldVal !== item.value) {
                    this.eventEmitter.emit('ai.embedding.provider_changed', { key: item.key, newValue: item.value, oldValue: oldVal });
                }
            }
        }

        return results.map((result) => result ? this.maskSettingResponse(result) : result);
    }

    private withLegacyAiProviderSync<T extends { key: string; value: string; isSecret?: boolean }>(settings: T[]): T[] {
        const chatProvider = settings.find((item) => item.key === 'ai.chat_provider')?.value;
        if (!chatProvider || chatProvider === '********') {
            return settings;
        }

        const activeProviderIndex = settings.findIndex((item) => item.key === 'ai.active_provider');
        if (activeProviderIndex >= 0) {
            return settings.map((item, index) => index === activeProviderIndex
                ? { ...item, value: chatProvider, isSecret: false }
                : item);
        }

        return [
            ...settings,
            { key: 'ai.active_provider', value: chatProvider, isSecret: false } as T,
        ];
    }

    async delete(key: string) {
        this.cache.delete(key);
        this.secretCache.delete(key);
        return this.prisma.setting.delete({
            where: { key },
        });
    }
}
