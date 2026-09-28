import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

describe('SEC-02: Refresh Token Bcrypt 72-Byte Security & Format Isolation', () => {
    let service: AuthService;
    let prisma: any;
    let jwt: any;
    let config: any;

    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
        },
        setting: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        $transaction: jest.fn((cb: any) => cb(mockPrisma)),
    };

    const mockJwt = {
        signAsync: jest.fn().mockResolvedValue('mocked-signed-jwt-token'),
        verify: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn((key: string, defaultValue?: any) => {
            const map: Record<string, any> = {
                JWT_SECRET: 'test-jwt-secret-at-least-32-chars-long-123456',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-at-least-32-chars-long-123456',
                JWT_REFRESH_EXPIRES_IN: '7d',
            };
            return map[key] ?? defaultValue;
        }),
    };

    const mockEmailService = {
        sendPasswordReset: jest.fn(),
        sendEmailVerification: jest.fn(),
        healthCheck: jest.fn().mockResolvedValue({ healthy: true }),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    const mockCrmEmailValidatorService = {
        isAdminBypass: jest.fn().mockReturnValue(false),
        validateEmailInCrm: jest.fn().mockResolvedValue({ isValid: true, contactId: 'crm-contact-1' }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
                { provide: ConfigService, useValue: mockConfig },
                { provide: EmailService, useValue: mockEmailService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: CrmEmailValidatorService, useValue: mockCrmEmailValidatorService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
        config = module.get<ConfigService>(ConfigService);

        jest.clearAllMocks();
    });

    describe('Cryptographic Proof: Bcrypt 72-Byte Truncation Vulnerability vs SHA-256 Pre-hash', () => {
        it('demonstrates standard bcrypt vulnerability: two distinct tokens sharing first 72 bytes collide', async () => {
            const sharedPrefix = 'A'.repeat(72);
            const token1 = sharedPrefix + '.SIGNATURE_AAA_SECRET_USER_1';
            const token2 = sharedPrefix + '.SIGNATURE_BBB_ATTACKER_2';

            expect(token1).not.toEqual(token2);

            // Raw bcrypt hashes only the first 72 bytes!
            const rawHash = await bcrypt.hash(token1, 4);
            const rawMatches = await bcrypt.compare(token2, rawHash);

            // This proves the vulnerability: token2 falsely matches token1's raw bcrypt hash!
            expect(rawMatches).toBe(true);
        });

        it('demonstrates that SHA-256 pre-hashing resolves the 72-byte truncation collision', async () => {
            const sharedPrefix = 'A'.repeat(72);
            const token1 = sharedPrefix + '.SIGNATURE_AAA_SECRET_USER_1';
            const token2 = sharedPrefix + '.SIGNATURE_BBB_ATTACKER_2';

            const digest1 = crypto.createHash('sha256').update(token1).digest('hex');
            const digest2 = crypto.createHash('sha256').update(token2).digest('hex');

            expect(digest1).not.toEqual(digest2);
            expect(digest1.length).toBe(64); // 64 chars < 72 bytes limit

            const secureHash = await bcrypt.hash(digest1, 4);
            const secureMatches = await bcrypt.compare(digest2, secureHash);

            // With SHA-256 pre-hashing, token2 CANNOT match token1
            expect(secureMatches).toBe(false);

            const genuineMatches = await bcrypt.compare(digest1, secureHash);
            expect(genuineMatches).toBe(true);
        });
    });

    describe('AuthService refreshTokens: SEC-02 format enforcement and collision resistance', () => {
        const userId = 'user-sec02-uuid';
        const validRefreshToken = 'header.payload-longer-than-72-bytes-customer-session-token-alpha-123456789.signature-xyz';

        it('should successfully refresh tokens when a valid token with new v2: format is presented', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 1,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.role.findUnique.mockResolvedValue({
                id: 'role-customer-id',
                name: 'CUSTOMER',
                permissions: [{ permission: { name: 'ticket:create' } }],
            });
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.refreshTokens(userId, validRefreshToken, 1);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');

            // Assert that rotation updated with the new v2: prefix format
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: userId,
                    status: 'ACTIVE',
                    deletedAt: null,
                    sessionVersion: 1,
                    refreshTokenHash: storedHash,
                },
                data: {
                    refreshTokenHash: expect.stringMatching(/^v2:\$2[aby]\$/),
                },
            });
        });

        it('should REJECT an attacker token sharing the first 72 bytes with the genuine token', async () => {
            const prefix72 = 'B'.repeat(72);
            const genuineToken = prefix72 + '.genuine-customer-secret-portion';
            const attackerToken = prefix72 + '.attacker-tampered-secret-portion';

            const genuineDigest = crypto.createHash('sha256').update(genuineToken).digest('hex');
            const bcryptHash = await bcrypt.hash(genuineDigest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            // Attacker presents token sharing first 72 bytes
            await expect(
                service.refreshTokens(userId, attackerToken, 0)
            ).rejects.toThrow(ForbiddenException);

            // Zero writes must occur on rejection
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT a completely wrong refresh token', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                service.refreshTokens(userId, 'completely-invalid-refresh-token', 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT legacy raw-bcrypt hashes without falling back to insecure raw comparison', async () => {
            // Legacy raw-bcrypt hash without v2: prefix
            const rawLegacyHash = await bcrypt.hash(validRefreshToken, 4);
            expect(rawLegacyHash).not.toMatch(/^v2:/);

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: rawLegacyHash, // Legacy format
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            // Must reject legacy format without fallback
            await expect(
                service.refreshTokens(userId, validRefreshToken, 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT malformed stored hash (e.g. prefix only or empty)', async () => {
            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: 'v2:', // Malformed: missing bcrypt payload
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                service.refreshTokens(userId, validRefreshToken, 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT rotated old token once a new token has been issued', async () => {
            const oldToken = 'old-customer-refresh-token-session-1';
            const newToken = 'new-customer-refresh-token-session-2';

            const newDigest = crypto.createHash('sha256').update(newToken).digest('hex');
            const newBcryptHash = await bcrypt.hash(newDigest, 4);
            const storedNewHash = `v2:${newBcryptHash}`;

            // Database now stores the newly rotated hash
            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: storedNewHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            // Presenting the old token must fail
            await expect(
                service.refreshTokens(userId, oldToken, 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT concurrent CAS loser when updateMany returns count 0', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 2,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.role.findUnique.mockResolvedValue({
                id: 'role-customer-id',
                name: 'CUSTOMER',
                permissions: [],
            });

            // Concurrent race: another request rotated the hash or incremented sessionVersion first
            prisma.user.updateMany.mockResolvedValue({ count: 0 });

            await expect(
                service.refreshTokens(userId, validRefreshToken, 2)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: userId,
                    status: 'ACTIVE',
                    deletedAt: null,
                    sessionVersion: 2,
                    refreshTokenHash: storedHash,
                },
                data: {
                    refreshTokenHash: expect.stringMatching(/^v2:\$2[aby]\$/),
                },
            });
        });

        it('should REJECT refresh when JWT sessionVersion does not match user sessionVersion', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 5, // User was bumped to v5
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            // Token presents stale sessionVersion 4
            await expect(
                service.refreshTokens(userId, validRefreshToken, 4)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT refresh when user is soft-deleted', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'ACTIVE',
                deletedAt: new Date(), // Soft-deleted
                sessionVersion: 0,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                service.refreshTokens(userId, validRefreshToken, 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT refresh when user is inactive / suspended', async () => {
            const digest = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
            const bcryptHash = await bcrypt.hash(digest, 4);
            const storedHash = `v2:${bcryptHash}`;

            const mockUser = {
                id: userId,
                email: 'customer@example.com',
                fullName: 'Müşteri Test',
                status: 'SUSPENDED',
                deletedAt: null,
                sessionVersion: 0,
                refreshTokenHash: storedHash,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                service.refreshTokens(userId, validRefreshToken, 0)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });
    });

    describe('AuthService login: SEC-02 hash generation with v2: prefix', () => {
        it('should generate and save refresh token hash using v2: prefix on successful login', async () => {
            const plainPassword = 'CorrectPassword123!';
            const passwordHash = await bcrypt.hash(plainPassword, 4);

            const mockUser = {
                id: 'login-user-uuid',
                email: 'login@example.com',
                fullName: 'Login User',
                passwordHash: passwordHash,
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: 0,
                roleId: 'role-customer-id',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.update.mockResolvedValue(mockUser);
            prisma.role.findUnique.mockResolvedValue({
                id: 'role-customer-id',
                name: 'CUSTOMER',
                permissions: [],
            });

            const result = await service.login({
                email: 'login@example.com',
                password: plainPassword,
            });

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');

            // Verify updateRefreshTokenHash saved the hash with v2: prefix
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'login-user-uuid' },
                data: {
                    refreshTokenHash: expect.stringMatching(/^v2:\$2[aby]\$/),
                },
            });
        });
    });
});
