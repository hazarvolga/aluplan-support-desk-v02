import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../utils/crypto.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);
    private cache = new Map<string, string>();
    private secretCache = new Map<string, boolean>();

    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    async upsert(dto: UpsertSettingDto, userId?: string) {
        // AI Validation Logic
        if (dto.key.startsWith('ai.')) {
            await this.validateAiSetting(dto.key, dto.value);
        }

        // Guard: Do not overwrite existing secrets with the masked placeholder
        if (dto.value === '********') {
            const existing = await this.get(dto.key, true);
            if (existing) return existing;
        }

        let finalValue = dto.value;

        if (dto.isSecret) {
            finalValue = this.crypto.encrypt(dto.value);
        }

        const setting = await this.prisma.setting.upsert({
            where: { key: dto.key },
            update: {
                value: finalValue,
                isSecret: dto.isSecret ?? false,
                updatedBy: userId,
            },
            create: {
                key: dto.key,
                value: finalValue,
                isSecret: dto.isSecret ?? false,
                updatedBy: userId,
            },
        });

        // Update cache
        this.cache.set(dto.key, dto.value); // Store plaintext in cache for internal use
        this.secretCache.set(dto.key, dto.isSecret ?? false);

        return setting;
    }

    private async validateAiSetting(key: string, value: string) {
        // 1. If key is a provider switch, check if its models are configured
        if (key === 'ai.chat_provider' || key === 'ai.embed_provider') {
            if (value === 'ollama') {
                const url = await this.getValue('ai.ollama.url');
                const chatModel = await this.getValue('ai.ollama.chat_model');
                const embedModel = await this.getValue('ai.ollama.embed_model');
                if (!url || !chatModel || !embedModel) {
                    throw new Error(`Ollama yapılandırması eksik (URL, Chat Model veya Embed Model).`);
                }
            }
            if (value === 'openai') {
                const key = await this.getValue('ai.openai.api_key');
                const chatModel = await this.getValue('ai.openai.chat_model');
                const embedModel = await this.getValue('ai.openai.embed_model');
                if (!key || !chatModel || !embedModel) {
                    throw new Error(`OpenAI yapılandırması eksik (API Key, Chat Model veya Embed Model).`);
                }
            }
        }

        // 2. If key is a model field being emptied, check if it's the active provider
        if (key.endsWith('.chat_model') || key.endsWith('.embed_model') || key.endsWith('.api_key')) {
            if (!value || value.trim() === '') {
                const parts = key.split('.');
                const providerName = parts[1]; // e.g. 'openai' from 'ai.openai.chat_model'
                const currentChat = await this.getValue('ai.chat_provider');
                const currentEmbed = await this.getValue('ai.embed_provider');

                if (currentChat === providerName || currentEmbed === providerName) {
                    throw new Error(`Aktif AI sağlayıcısı (${providerName}) için "${key}" alanı boş bırakılamaz.`);
                }
            }
        }
    }

    async get(key: string, decrypt = false): Promise<any> {
        // Return from cache if available (plaintext internal cache)
        if (this.cache.has(key)) {
            const isSecret = this.secretCache.get(key);
            let value = this.cache.get(key) || '';

            if (isSecret && !decrypt) {
                value = '********';
            }

            return { key, value, isSecret };
        }

        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting) {
            return null;
        }

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
        this.secretCache.set(key, setting.isSecret);

        if (setting.isSecret && !decrypt) {
            setting.value = '********';
        } else {
            setting.value = plaintext;
        }

        return setting;
    }

    /**
     * Internal method for services to get plaintext values directly without DTO wrapper
     */
    async getValue(key: string): Promise<string | null> {
        const setting = await this.get(key, true);
        return setting?.value ?? null;
    }

    async getAll(decrypt = false) {
        const settings = await this.prisma.setting.findMany();

        return settings.map((s) => {
            let value = s.value;
            if (s.isSecret) {
                try {
                    const plaintext = this.crypto.decrypt(s.value);
                    this.cache.set(s.key, plaintext);
                    this.secretCache.set(s.key, true);
                    value = decrypt ? plaintext : '********';
                } catch (e) {
                    this.logger.warn(`Decryption failed for setting: ${s.key}`);
                    this.cache.set(s.key, '');
                    this.secretCache.set(s.key, true);
                    value = decrypt ? '' : '********';
                }
            } else {
                this.cache.set(s.key, s.value);
                this.secretCache.set(s.key, false);
            }
            return { ...s, value };
        });
    }

    async delete(key: string) {
        this.cache.delete(key);
        this.secretCache.delete(key);
        return this.prisma.setting.delete({
            where: { key },
        });
    }
}
