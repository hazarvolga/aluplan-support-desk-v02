// P0 — Güvenlik: CryptoService encrypt/decrypt round-trip
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

const VALID_HEX_KEY = 'a'.repeat(64); // 32 bytes hex

const mockConfigService = (key: string) => ({
    get: jest.fn().mockReturnValue(key),
});

describe('CryptoService', () => {
    let service: CryptoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CryptoService,
                { provide: ConfigService, useValue: mockConfigService(VALID_HEX_KEY) },
            ],
        }).compile();

        service = module.get<CryptoService>(CryptoService);
    });

    describe('encrypt / decrypt round-trip', () => {
        it('should decrypt to the original plaintext', () => {
            const plaintext = 'super-secret-client-secret-value';
            const encrypted = service.encrypt(plaintext);
            expect(service.decrypt(encrypted)).toBe(plaintext);
        });

        it('should produce different ciphertext each call (random IV)', () => {
            const plaintext = 'same-value';
            const enc1 = service.encrypt(plaintext);
            const enc2 = service.encrypt(plaintext);
            expect(enc1).not.toBe(enc2);
        });

        it('should encrypt to iv:authTag:ciphertext format', () => {
            const encrypted = service.encrypt('test');
            const parts = encrypted.split(':');
            expect(parts).toHaveLength(3);
            expect(parts[0]).toHaveLength(24);  // 12 bytes IV → 24 hex chars
            expect(parts[1]).toHaveLength(32);  // 16 bytes authTag → 32 hex chars
        });

        it('should handle unicode / special characters', () => {
            const plaintext = 'şifre-123!@#$%^&*()_+türkçe';
            expect(service.decrypt(service.encrypt(plaintext))).toBe(plaintext);
        });
    });

    describe('decrypt — error cases', () => {
        it('should throw InternalServerErrorException on tampered ciphertext', () => {
            const encrypted = service.encrypt('value');
            const parts = encrypted.split(':');
            // Tamper the ciphertext part
            parts[2] = 'deadbeef'.repeat(4);
            expect(() => service.decrypt(parts.join(':'))).toThrow(InternalServerErrorException);
        });

        it('should throw InternalServerErrorException on malformed format', () => {
            expect(() => service.decrypt('not-valid-format')).toThrow(InternalServerErrorException);
        });

        it('should throw InternalServerErrorException on tampered authTag', () => {
            const encrypted = service.encrypt('value');
            const parts = encrypted.split(':');
            parts[1] = 'ff'.repeat(16); // wrong authTag
            expect(() => service.decrypt(parts.join(':'))).toThrow(InternalServerErrorException);
        });
    });

    describe('constructor validation', () => {
        it('should throw if ENCRYPTION_KEY is missing', async () => {
            await expect(
                Test.createTestingModule({
                    providers: [
                        CryptoService,
                        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
                    ],
                }).compile(),
            ).rejects.toThrow();
        });

        it('should throw if ENCRYPTION_KEY is wrong length', async () => {
            await expect(
                Test.createTestingModule({
                    providers: [
                        CryptoService,
                        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('tooshort') } },
                    ],
                }).compile(),
            ).rejects.toThrow();
        });
    });
});
