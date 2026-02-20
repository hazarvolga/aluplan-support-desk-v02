import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../utils/crypto.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    async upsert(dto: UpsertSettingDto, userId?: string) {
        let finalValue = dto.value;

        if (dto.isSecret) {
            finalValue = this.crypto.encrypt(dto.value);
        }

        return this.prisma.setting.upsert({
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
    }

    async get(key: string, decrypt = false) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundException(`Setting with key "${key}" not found`);
        }

        if (decrypt && setting.isSecret) {
            setting.value = this.crypto.decrypt(setting.value);
        } else if (setting.isSecret) {
            setting.value = '********'; // Mask secret values by default
        }

        return setting;
    }

    async getAll(decrypt = false) {
        const settings = await this.prisma.setting.findMany();

        return settings.map((s) => {
            if (decrypt && s.isSecret) {
                s.value = this.crypto.decrypt(s.value);
            } else if (s.isSecret) {
                s.value = '********';
            }
            return s;
        });
    }

    async delete(key: string) {
        return this.prisma.setting.delete({
            where: { key },
        });
    }
}
