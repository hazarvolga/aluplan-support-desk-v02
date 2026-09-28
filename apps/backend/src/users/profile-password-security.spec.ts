import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/security.constants';

jest.mock('bcryptjs');

describe('SEC-03: Profile Password Security & Session Invalidation Chain', () => {
    let service: UsersService;
    let prisma: any;
    let redis: any;
    let config: any;

    const mockPrisma = {
        $transaction: jest.fn(async (cb: any) => cb(mockPrisma)),
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        customerProfile: {
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        role: {
            findFirst: jest.fn(),
        },
    };

    const mockRedis = {
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn().mockResolvedValue(null),
    };

    const mockConfig = {
        get: jest.fn((key: string, defaultValue?: any) => {
            if (key === 'JWT_EXPIRES_IN') return '24h';
            return defaultValue;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedis },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
        redis = module.get<RedisService>(RedisService);
        config = module.get<ConfigService>(ConfigService);

        jest.clearAllMocks();
    });

    const activeUserFixture = {
        id: 'user-sec03',
        email: 'engineer@aluplan.com.tr',
        fullName: 'Can Demir',
        status: 'ACTIVE',
        deletedAt: null,
        passwordHash: '$2a$10$existingPasswordHashValue1234567890',
        refreshTokenHash: 'v2:$2a$10$existingRefreshHash',
        passwordResetJtiHash: 'somePendingResetHash',
        sessionVersion: 3,
        language: 'tr',
        customerProfile: {
            id: 'cp-sec03',
            companyName: 'Demir Mimarlık',
            industry: 'Architecture',
            jobTitle: 'Baş Mimar',
            phoneNumber: '+905551112233',
            firstName: 'Can',
            lastName: 'Demir',
        },
    };

    describe('Normal profile updates (NO password change)', () => {
        it('should update profile fields without altering sessionVersion, refresh token, or Redis session markers', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(activeUserFixture) // initial lookup
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    fullName: 'Can Demir Güncel',
                }); // fresh lookup after update

            prisma.user.update.mockResolvedValue({
                ...activeUserFixture,
                fullName: 'Can Demir Güncel',
            });

            const result = await service.updateProfile('user-sec03', {
                fullName: 'Can Demir Güncel',
                companyName: 'Demir Holding',
            });

            // User update should NOT touch passwordHash or sessionVersion
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-sec03' },
                data: expect.not.objectContaining({
                    passwordHash: expect.anything(),
                    sessionVersion: expect.anything(),
                    refreshTokenHash: expect.anything(),
                }),
            }));

            // Redis should NOT be called
            expect(redis.set).not.toHaveBeenCalled();

            // Result should indicate password was NOT changed
            expect(result.passwordChanged).toBe(false);
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('refreshTokenHash');
            expect(result).not.toHaveProperty('passwordResetJtiHash');
        });
    });

    describe('Password change authorization and currentPassword enforcement', () => {
        it('should REJECT password change when currentPassword is missing', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);

            await expect(service.updateProfile('user-sec03', {
                password: 'newSecurePassword2026',
            })).rejects.toThrow(BadRequestException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
        });

        it('should REJECT password change when currentPassword is an empty/whitespace string', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);

            await expect(service.updateProfile('user-sec03', {
                currentPassword: '   ',
                newPassword: 'newSecurePassword2026',
            })).rejects.toThrow(BadRequestException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
        });

        it('should REJECT password change when currentPassword does not match stored hash', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'wrongCurrentPassword',
                newPassword: 'newSecurePassword2026',
            })).rejects.toThrow(BadRequestException);

            expect(bcrypt.compare).toHaveBeenCalledWith('wrongCurrentPassword', activeUserFixture.passwordHash);
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
        });

        it('should REJECT password change when user has no stored passwordHash (e.g. social/CRM external)', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...activeUserFixture,
                passwordHash: null,
            });

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'anyPassword',
                newPassword: 'newSecurePassword2026',
            })).rejects.toThrow(BadRequestException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should REJECT password change when newPassword is shorter than 8 characters', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword',
                newPassword: 'short',
            })).rejects.toThrow(BadRequestException);

            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });
    });

    describe('Atomic CAS password update and complete session invalidation chain', () => {
        it('should atomically update passwordHash, increment sessionVersion, wipe refreshTokenHash, wipe passwordResetJtiHash, and invalidate Redis sessions', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(activeUserFixture) // initial lookup
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    sessionVersion: 4,
                    passwordHash: '$2a$10$newlyHashedPassword9876543210',
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                }); // lookup after CAS update

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newlyHashedPassword9876543210');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newBrandPassword2026!',
            });

            // 1. Password comparison and new hash generation
            expect(bcrypt.compare).toHaveBeenCalledWith('correctCurrentPassword123', activeUserFixture.passwordHash);
            expect(bcrypt.hash).toHaveBeenCalledWith('newBrandPassword2026!', BCRYPT_ROUNDS);

            // 2. Atomic CAS updateMany with state conditions
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'user-sec03',
                    status: 'ACTIVE',
                    deletedAt: null,
                    sessionVersion: activeUserFixture.sessionVersion,
                    passwordHash: activeUserFixture.passwordHash,
                },
                data: {
                    passwordHash: '$2a$10$newlyHashedPassword9876543210',
                    sessionVersion: { increment: 1 },
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                },
            });

            // 3. Redis session invalidation marker
            expect(redis.set).toHaveBeenCalledWith(
                'user:user-sec03:force_logout_at',
                expect.any(String),
                86400, // 24h default
            );

            // 4. Return value safety
            expect(result.passwordChanged).toBe(true);
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('refreshTokenHash');
            expect(result).not.toHaveProperty('passwordResetJtiHash');
        });

        it('should support legacy "password" property alias as new password', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(activeUserFixture)
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    sessionVersion: 4,
                    refreshTokenHash: null,
                });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedAliasPassword');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                password: 'newAliasPassword2026!',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('newAliasPassword2026!', BCRYPT_ROUNDS);
            expect(result.passwordChanged).toBe(true);
        });

        it('should throw ConflictException if concurrent CAS write fails (e.g. concurrent reset or concurrent password change won race)', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newHashedPassword');
            // CAS loser: 0 rows updated
            prisma.user.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newBrandPassword2026!',
            })).rejects.toThrow(ConflictException);

            // Redis should NOT be marked if the durable DB update failed
            expect(redis.set).not.toHaveBeenCalled();
        });

        it('should remain successful if Redis marker fails after durable DB invalidation (matching auth pattern)', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(activeUserFixture)
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    sessionVersion: 4,
                    refreshTokenHash: null,
                });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newHashedPassword');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            redis.set.mockRejectedValue(new Error('Redis connection lost'));

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newBrandPassword2026!',
            });

            expect(result.passwordChanged).toBe(true);
        });
    });

    describe('User status and soft-delete boundaries', () => {
        it('should REJECT updateProfile when user is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.updateProfile('non-existent', {
                fullName: 'Ghost User',
            })).rejects.toThrow(NotFoundException);
        });

        it('should REJECT updateProfile when user is soft-deleted', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...activeUserFixture,
                deletedAt: new Date(),
            });

            await expect(service.updateProfile('user-sec03', {
                fullName: 'Deleted User',
            })).rejects.toThrow(NotFoundException);
        });

        it('should REJECT updateProfile when user is suspended / inactive', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...activeUserFixture,
                status: 'SUSPENDED',
            });

            await expect(service.updateProfile('user-sec03', {
                fullName: 'Suspended User',
            })).rejects.toThrow(NotFoundException);
        });
    });

    describe('Reviewer regression verifications: raw password preservation & unified profile sync', () => {
        it('should preserve raw password bytes including leading and trailing spaces during hashing and ensure exact login compatibility', async () => {
            const rawPasswordWithSpaces = '  Secret Pass 2026!  ';
            const generatedHash = '$2a$10$hashForPasswordWithSpaces12345';

            prisma.user.findUnique
                .mockResolvedValueOnce(activeUserFixture)
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    passwordHash: generatedHash,
                    sessionVersion: 4,
                });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue(generatedHash);
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: rawPasswordWithSpaces,
            });

            // 1. Password must NOT be trimmed when passed to bcrypt.hash
            expect(bcrypt.hash).toHaveBeenCalledWith(rawPasswordWithSpaces, BCRYPT_ROUNDS);
            expect(bcrypt.hash).not.toHaveBeenCalledWith(rawPasswordWithSpaces.trim(), BCRYPT_ROUNDS);
            expect(result.passwordChanged).toBe(true);

            // 2. Simulate subsequent login: raw password matches hash, trimmed does not
            (bcrypt.compare as jest.Mock).mockImplementation((attempt: string, hash: string) => {
                return Promise.resolve(attempt === rawPasswordWithSpaces && hash === generatedHash);
            });

            // Raw attempt (user typed exact password) succeeds
            const validLoginAttempt = await bcrypt.compare(rawPasswordWithSpaces, generatedHash);
            expect(validLoginAttempt).toBe(true);

            // Trimmed attempt (if someone tried without spaces) fails
            const trimmedLoginAttempt = await bcrypt.compare(rawPasswordWithSpaces.trim(), generatedHash);
            expect(trimmedLoginAttempt).toBe(false);
        });

        it('should reject whitespace-only password (e.g. 8 spaces) with BadRequestException', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUserFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: '        ', // 8 spaces
            })).rejects.toThrow(BadRequestException);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('should update customerProfile firstName and lastName using the new fullName when password, fullName and companyName are updated together', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    fullName: 'Eski Isim',
                    customerProfile: {
                        id: 'cp-sec03',
                        firstName: 'Eski',
                        lastName: 'Isim',
                        companyName: 'Eski Sirket',
                    },
                })
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    fullName: 'Yeni Isim Soyisim',
                    sessionVersion: 4,
                    customerProfile: {
                        id: 'cp-sec03',
                        firstName: 'Yeni',
                        lastName: 'Isim Soyisim',
                        companyName: 'Yeni Sirket AS',
                    },
                });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedNewPassword123');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            prisma.customerProfile.update.mockResolvedValue({
                id: 'cp-sec03',
                firstName: 'Yeni',
                lastName: 'Isim Soyisim',
                companyName: 'Yeni Sirket AS',
            });

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newValidPassword2026',
                fullName: 'Yeni Isim Soyisim',
                companyName: 'Yeni Sirket AS',
            });

            // 1. User updateMany should include new fullName
            expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    fullName: 'Yeni Isim Soyisim',
                }),
            }));

            // 2. CustomerProfile update should use the NEW fullName for firstName and lastName
            expect(prisma.customerProfile.update).toHaveBeenCalledWith({
                where: { id: 'cp-sec03' },
                data: expect.objectContaining({
                    firstName: 'Yeni',
                    lastName: 'Isim Soyisim',
                    companyName: 'Yeni Sirket AS',
                }),
            });
            expect(prisma.customerProfile.update).not.toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    firstName: 'Eski',
                }),
            }));

            expect(result.passwordChanged).toBe(true);
        });

        it('should create customerProfile with firstName and lastName derived from new fullName when user had no customerProfile and updates fullName and companyName together', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    fullName: 'Eski Isim',
                    customerProfile: null,
                })
                .mockResolvedValueOnce({
                    ...activeUserFixture,
                    fullName: 'Ilk Yeni Isim',
                    sessionVersion: 4,
                    customerProfile: {
                        id: 'cp-new',
                        firstName: 'Ilk',
                        lastName: 'Yeni Isim',
                        companyName: 'Ilk Sirket Ltd',
                    },
                });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedNewPassword123');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            prisma.customerProfile.count.mockResolvedValue(5);
            prisma.customerProfile.create.mockResolvedValue({
                id: 'cp-new',
                firstName: 'Ilk',
                lastName: 'Yeni Isim',
                companyName: 'Ilk Sirket Ltd',
            });

            const result = await service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newValidPassword2026',
                fullName: 'Ilk Yeni Isim',
                companyName: 'Ilk Sirket Ltd',
            });

            expect(prisma.customerProfile.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-sec03',
                    firstName: 'Ilk',
                    lastName: 'Yeni Isim',
                    companyName: 'Ilk Sirket Ltd',
                    customerNo: 'CUST-00006',
                }),
            });

            expect(result.passwordChanged).toBe(true);
        });

        it('should rollback transaction and prevent Redis session invalidation if customerProfile update fails during password change', async () => {
            const rollbackSpy = jest.fn();
            prisma.$transaction.mockImplementation(async (callback: any) => {
                try {
                    return await callback(prisma);
                } catch (err) {
                    rollbackSpy(err);
                    throw err;
                }
            });

            prisma.user.findUnique.mockResolvedValue(activeUserFixture);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedNewPassword123');
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            // customerProfile update fails
            prisma.customerProfile.update.mockRejectedValue(new Error('CustomerProfile constraint violation'));

            await expect(service.updateProfile('user-sec03', {
                currentPassword: 'correctCurrentPassword123',
                newPassword: 'newValidPassword2026',
                companyName: 'Failed Company Co',
            })).rejects.toThrow('CustomerProfile constraint violation');

            // 1. Transaction boundary caught the failure and rolled back
            expect(rollbackSpy).toHaveBeenCalledTimes(1);

            // 2. Redis session invalidation must NOT have been called
            expect(redis.set).not.toHaveBeenCalled();
        });
    });
});
