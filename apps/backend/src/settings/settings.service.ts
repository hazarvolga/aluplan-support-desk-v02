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
                this.logger.warn(`❌ Decryption failed for setting: ${key}. ENCRYPTION_KEY mismatch or corrupt data? Error: ${error.message}`);
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
