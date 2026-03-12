import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor(private configService: ConfigService) {
        const hexKey = this.configService.get<string>('ENCRYPTION_KEY');
        if (!hexKey || hexKey.length !== 64) {
            throw new InternalServerErrorException('Invalid or missing ENCRYPTION_KEY in .env (must be 32 bytes hex)');
        }
        this.key = Buffer.from(hexKey, 'hex');
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    decrypt(encryptedData: string): string {
        try {
            const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
            if (!ivHex || !authTagHex || !encryptedHex) {
                throw new Error('Invalid encrypted data format');
            }

            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (_error) {
            throw new InternalServerErrorException('Failed to decrypt data');
        }
    }
}
