import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { mockPrismaService, mockConfigService, mockRedisService } from '../test/mock.utils';
import { RedisService } from '../redis/redis.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let prisma: any;
    let jwt: any;
    let email: any;
    let settings: any;
    let redis: any;
    let crmEmailValidator: any;

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
        signAsync: jest.fn(),
    };

    const mockEmailService = {
        sendPasswordReset: jest.fn(),
        sendEmailVerification: jest.fn(),
        healthCheck: jest.fn(),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    const mockCrmEmailValidatorService = {
        isAdminBypass: jest.fn().mockReturnValue(false),
        validateEmailInCrm: jest.fn().mockResolvedValue({ isValid: true, contactId: 'crm-contact-1' }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: EmailService, useValue: mockEmailService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: CrmEmailValidatorService, useValue: mockCrmEmailValidatorService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
        email = module.get<EmailService>(EmailService);
        settings = module.get<SettingsService>(SettingsService);
        redis = module.get<RedisService>(RedisService);
        crmEmailValidator = module.get<CrmEmailValidatorService>(CrmEmailValidatorService);

        jest.clearAllMocks();
        prisma.role = { findUnique: jest.fn().mockResolvedValue({
            name: 'CUSTOMER',
            permissions: ['ticket:create', 'ticket:read'].map(name => ({ permission: { name } })),
        }) };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        const loginDto = { email: 'test@example.com', password: 'password123' };

        it('should throw UnauthorizedException if user not found', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if account is inactive', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', status: 'INACTIVE', deletedAt: null });

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password does not match', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', status: 'ACTIVE', deletedAt: null, passwordHash: 'hash' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should return tokens and user info on successful login', async () => {
            // Arrange
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                fullName: 'Test User',
                status: 'ACTIVE',
                deletedAt: null,
                passwordHash: 'hash',
                roleId: 'role-customer',
            };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.update.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

            jwt.signAsync.mockImplementation(async (payload: any) => `token-${payload.role}`);

            // Act
            const result = await service.login(loginDto);

            // Assert
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result.user).toMatchObject({
                id: 'user-1',
                email: 'test@example.com'
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { refreshTokenHash: 'newHash' }
            });
        });

        it('resolves login emails case-insensitively when legacy casing exists', async () => {
            const mockUser = {
                id: 'user-legacy',
                email: 'Murat.sahin@enka.com',
                fullName: 'Murat Şahin',
                status: 'ACTIVE',
                deletedAt: null,
                passwordHash: 'hash',
                roleId: 'role-customer',
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.findFirst.mockResolvedValueOnce(mockUser);
            prisma.user.update.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');
            jwt.signAsync.mockResolvedValue('token');

            await service.login({ email: ' murat.sahin@ENKA.com ', password: 'password123' });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'murat.sahin@enka.com' },
            });
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    email: {
                        equals: 'murat.sahin@enka.com',
                        mode: 'insensitive',
                    },
                },
            });
        });
    });

    describe('refreshTokens', () => {
        it('should throw ForbiddenException if user not found or inactive', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.refreshTokens('1', 'token')).rejects.toThrow(ForbiddenException);
        });

        it('should return new tokens on valid refresh', async () => {
            // Arrange
            const mockUser = { id: '1', email: 'test@test.com', status: 'ACTIVE', deletedAt: null, sessionVersion: 0, refreshTokenHash: 'hash', roleId: 'role-customer' };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwt.signAsync.mockResolvedValue('new-token');

            // Act
            const result = await service.refreshTokens('1', 'valid-token');

            // Assert
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
        });

        it('preserves explicitly empty role permissions without resurrecting defaults', async () => {
            const mockUser = { id: '1', email: 'test@test.com', fullName: 'Test User', status: 'ACTIVE', deletedAt: null, sessionVersion: 0, refreshTokenHash: 'hash', roleId: 'role-customer' };
            prisma.role = { findUnique: jest.fn() };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.role.findUnique.mockResolvedValue({ name: 'CUSTOMER', permissions: [] });
            prisma.user.update.mockResolvedValue(mockUser);
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');
            jwt.signAsync.mockResolvedValue('new-token');

            await service.refreshTokens('1', 'valid-token');

            expect(jwt.signAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: 'CUSTOMER',
                    permissions: [],
                }),
                expect.any(Object),
            );
        });

        it('rejects refresh rotation when a concurrent reset changed the durable session', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: '1', email: 'test@test.com', fullName: 'Test User', status: 'ACTIVE',
                deletedAt: null, sessionVersion: 0, refreshTokenHash: 'old-hash', roleId: 'role-customer',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('next-hash');
            jwt.signAsync.mockResolvedValue('new-token');
            // A password reset wins between the read and conditional refresh write.
            prisma.user.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.refreshTokens('1', 'old-token', 0)).rejects.toThrow(ForbiddenException);
            expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    id: '1', sessionVersion: 0, refreshTokenHash: 'old-hash',
                }),
            }));
        });
    });

    describe('database session authority', () => {
        const user = {
            id: 'authority-user', email: 'authority@example.com', fullName: 'Authority Fixture',
            status: 'ACTIVE', deletedAt: null, passwordHash: 'password-hash',
            refreshTokenHash: 'refresh-hash', sessionVersion: 4, roleId: 'role-admin',
        };

        beforeEach(() => {
            prisma.user.findUnique.mockResolvedValue(user);
            prisma.user.update.mockResolvedValue(user);
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('next-hash');
            jwt.signAsync.mockResolvedValue('new-token');
        });

        it.each(['login', 'refresh'] as const)('%s never mints wildcard access for an empty ADMIN mapping', async operation => {
            prisma.role.findUnique.mockResolvedValue({ name: 'ADMIN', permissions: [] });

            if (operation === 'login') {
                await service.login({ email: user.email, password: 'valid-password' });
            } else {
                await service.refreshTokens(user.id, 'valid-refresh', 4);
            }

            expect(jwt.signAsync).toHaveBeenCalledTimes(2);
            for (const [payload] of jwt.signAsync.mock.calls) {
                expect(payload).toMatchObject({ role: 'ADMIN', permissions: [], sessionVersion: 4 });
            }
        });

        it.each([null, { name: ' ', permissions: [] }, { name: 'ADMIN', permissions: null }])(
            'rejects login when assigned role authority is invalid: %p', async role => {
                prisma.role.findUnique.mockResolvedValue(role);
                await expect(service.login({ email: user.email, password: 'valid-password' }))
                    .rejects.toThrow(UnauthorizedException);
                expect(jwt.signAsync).not.toHaveBeenCalled();
                expect(prisma.user.update).not.toHaveBeenCalled();
            },
        );

        it.each([null, { name: '', permissions: [] }, { name: 'ADMIN', permissions: [{ permission: null }] }])(
            'rejects refresh when assigned role authority is invalid: %p', async role => {
                prisma.role.findUnique.mockResolvedValue(role);
                await expect(service.refreshTokens(user.id, 'valid-refresh', 4)).rejects.toThrow(ForbiddenException);
                expect(jwt.signAsync).not.toHaveBeenCalled();
                expect(prisma.user.updateMany).not.toHaveBeenCalled();
            },
        );

        it('rejects an unassigned role on login and refresh', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...user, roleId: null });
            await expect(service.login({ email: user.email, password: 'valid-password' })).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshTokens(user.id, 'valid-refresh', 4)).rejects.toThrow(ForbiddenException);
            expect(prisma.role.findUnique).not.toHaveBeenCalled();
            expect(jwt.signAsync).not.toHaveBeenCalled();
        });

        it('refresh uses the current database permissions and preserves the assigned role spelling', async () => {
            prisma.role.findUnique.mockResolvedValue({
                name: 'team-lead', permissions: [{ permission: { name: 'ticket:read' } }],
            });
            await service.refreshTokens(user.id, 'valid-refresh', 4);
            expect(jwt.signAsync).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'team-lead', permissions: ['ticket:read'], sessionVersion: 4 }),
                expect.any(Object),
            );
        });
    });

    describe('forgotPassword', () => {
        it('should send reset email when user exists', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', fullName: 'Test' });
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            settings.getValue.mockResolvedValue('http://frontend.local');
            jwt.sign.mockReturnValue('reset-token');

            // Act
            const result = await service.forgotPassword('test@test.com');

            // Assert
            expect(result.success).toBe(true);
            expect(email.sendPasswordReset).toHaveBeenCalledWith({
                recipientEmail: 'test@test.com',
                recipientName: 'Test',
                resetUrl: 'http://frontend.local/reset-password#token=reset-token'
            });
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    sub: '1',
                    purpose: 'password_reset',
                    jti: expect.any(String),
                }),
                {
                    secret: 'test-action-secret',
                    audience: 'aluplan:password-reset',
                    issuer: 'aluplan-support',
                    algorithm: 'HS256',
                    expiresIn: '30m',
                },
            );
            expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ id: '1', deletedAt: null }),
                data: expect.objectContaining({
                    passwordResetJtiHash: expect.any(String),
                    passwordResetSentAt: expect.any(Date),
                }),
            }));
        });

        it('does not rotate a recently issued password-reset challenge', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: '1', email: 'test@test.com',
                passwordResetSentAt: new Date(Date.now() - 30_000),
            });

            await expect(service.forgotPassword('test@test.com')).resolves.toEqual({ success: true });
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(email.sendPasswordReset).not.toHaveBeenCalled();
        });

        it('restores the prior password-reset challenge and returns generic success on enqueue failure', async () => {
            const previousSentAt = new Date('2026-08-05T10:00:00Z');
            prisma.user.findUnique.mockResolvedValue({
                id: '1', email: 'test@test.com', fullName: 'Test', deletedAt: null,
                passwordResetJtiHash: 'prior-hash', passwordResetSentAt: previousSentAt,
            });
            prisma.user.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
            settings.getValue.mockResolvedValue('http://frontend.local');
            jwt.sign.mockReturnValue('reset-token');
            email.sendPasswordReset.mockRejectedValue(new Error('queue unavailable'));
            jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-08-05T10:03:00Z').getTime());

            await expect(service.forgotPassword('test@test.com')).resolves.toEqual({ success: true });
            expect(prisma.user.updateMany).toHaveBeenLastCalledWith({
                where: { id: '1', passwordResetJtiHash: expect.any(String) },
                data: { passwordResetJtiHash: 'prior-hash', passwordResetSentAt: previousSentAt },
            });
        });
    });

    describe('resendVerification', () => {
        it('reissues a verification token for an existing inactive account', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1', email: 'user@example.com', fullName: 'User',
                status: 'INACTIVE', deletedAt: null,
            });
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            settings.getValue.mockResolvedValue('https://support.example.com');
            jwt.sign.mockReturnValue('verification-token');

            await expect(service.resendVerification('user@example.com')).resolves.toEqual({ success: true });
            expect(email.sendEmailVerification).toHaveBeenCalledWith(expect.objectContaining({
                recipientEmail: 'user@example.com',
                verificationUrl: 'https://support.example.com/verify-email#token=verification-token',
            }));
        });

        it('does not reveal whether an account is eligible for verification', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.resendVerification('missing@example.com')).resolves.toEqual({ success: true });
            expect(email.sendEmailVerification).not.toHaveBeenCalled();
        });

        it('keeps the prior verification challenge when email enqueue fails', async () => {
            const previousSentAt = new Date('2026-08-05T10:00:00Z');
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1', email: 'user@example.com', fullName: 'User',
                status: 'INACTIVE', deletedAt: null,
                emailVerificationJtiHash: 'prior-hash', emailVerificationSentAt: previousSentAt,
            });
            prisma.user.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
            settings.getValue.mockResolvedValue('https://support.example.com');
            jwt.sign.mockReturnValue('verification-token');
            email.sendEmailVerification.mockRejectedValue(new Error('queue unavailable'));
            jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-08-05T10:03:00Z').getTime());

            await expect(service.resendVerification('user@example.com')).resolves.toEqual({ success: true });
            expect(prisma.user.updateMany).toHaveBeenLastCalledWith({
                where: { id: 'user-1', emailVerificationJtiHash: expect.any(String) },
                data: { emailVerificationJtiHash: 'prior-hash', emailVerificationSentAt: previousSentAt },
            });
        });

        it('does not rotate a recently issued verification challenge', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1', email: 'user@example.com', status: 'INACTIVE', deletedAt: null,
                emailVerificationSentAt: new Date(Date.now() - 30_000),
            });

            await expect(service.resendVerification('user@example.com')).resolves.toEqual({ success: true });
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(email.sendEmailVerification).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should update password and invalidate sessions for valid token', async () => {
            // Arrange
            jwt.verify.mockReturnValue({ purpose: 'password_reset', sub: '1', email: 'test@test.com', jti: 'reset-jti' });
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');

            // Act
            const result = await service.resetPassword('valid-token', 'new-password');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: '1',
                    email: 'test@test.com',
                    deletedAt: null,
                    passwordResetJtiHash: expect.any(String),
                },
                data: {
                    passwordHash: 'new-password-hash',
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                    sessionVersion: { increment: 1 },
                }
            });
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.objectContaining({
                algorithms: ['HS256'],
                issuer: 'aluplan-support',
            }));
            expect(redis.set).toHaveBeenCalledWith(
                'user:1:force_logout_at',
                expect.any(String),
                3600,
            );
        });

        it('rejects password-reset tokens with the wrong purpose', async () => {
            jwt.verify.mockReturnValue({ purpose: 'email_verify', sub: '1', jti: 'jti' });
            await expect(service.resetPassword('wrong-purpose', 'new-password')).rejects.toThrow(UnauthorizedException);
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('atomically consumes a password-reset token only once', async () => {
            jwt.verify.mockReturnValue({ purpose: 'password_reset', sub: '1', email: 'test@test.com', jti: 'reset-jti' });
            prisma.user.updateMany
                .mockResolvedValueOnce({ count: 1 })
                .mockResolvedValueOnce({ count: 0 });
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');

            await expect(service.resetPassword('reset-token', 'new-password')).resolves.toMatchObject({ success: true });
            await expect(service.resetPassword('reset-token', 'new-password')).rejects.toThrow(UnauthorizedException);
        });

        it('rejects a reset token whose email no longer matches the account', async () => {
            jwt.verify.mockReturnValue({ purpose: 'password_reset', sub: '1', email: 'old@example.com', jti: 'reset-jti' });
            prisma.user.updateMany.mockResolvedValue({ count: 0 });
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');

            await expect(service.resetPassword('reset-token', 'new-password')).rejects.toThrow(UnauthorizedException);
            expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ email: 'old@example.com' }),
            }));
        });

        it('keeps password reset successful when Redis is unavailable after durable invalidation', async () => {
            jwt.verify.mockReturnValue({ purpose: 'password_reset', sub: '1', email: 'test@test.com', jti: 'reset-jti' });
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');
            redis.set.mockRejectedValue(new Error('redis unavailable'));

            await expect(service.resetPassword('reset-token', 'new-password')).resolves.toMatchObject({ success: true });
        });
    });

    describe('verifyEmail security boundary', () => {
        it('T3 rejects an access JWT that has no email-verification purpose', async () => {
            jwt.verify.mockReturnValue({ sub: 'user-1', email: 'user@example.com' });

            await expect(service.verifyEmail('access-jwt')).rejects.toThrow(UnauthorizedException);

            expect(jwt.verify).toHaveBeenCalledWith('access-jwt', {
                secret: 'test-action-secret',
                audience: 'aluplan:email-verification',
                algorithms: ['HS256'],
                issuer: 'aluplan-support',
            });
            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
        });

        it('T4 never activates a suspended user with a valid verification token', async () => {
            jwt.verify.mockReturnValue({
                sub: 'user-1',
                email: 'user@example.com',
                purpose: 'email_verify',
                jti: 'verification-jti',
            });
            prisma.user.updateMany.mockResolvedValue({ count: 0 });
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1', status: 'SUSPENDED' });

            await expect(service.verifyEmail('valid-verification-token')).rejects.toThrow(UnauthorizedException);

            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'user-1',
                    status: 'INACTIVE',
                    deletedAt: null,
                    emailVerificationJtiHash: expect.any(String),
                    email: 'user@example.com',
                },
                data: {
                    status: 'ACTIVE',
                    emailVerificationJtiHash: null,
                },
            });
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('atomically consumes a verification token only once', async () => {
            jwt.verify.mockReturnValue({
                sub: 'user-1',
                email: 'user@example.com',
                purpose: 'email_verify',
                jti: 'verification-jti',
            });
            prisma.user.updateMany
                .mockResolvedValueOnce({ count: 1 })
                .mockResolvedValueOnce({ count: 0 });
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });

            await expect(service.verifyEmail('verification-token')).resolves.toMatchObject({ success: true });
            await expect(service.verifyEmail('verification-token')).rejects.toThrow(UnauthorizedException);
        });

        it('does not consume a verification token when its email no longer matches', async () => {
            jwt.verify.mockReturnValue({
                sub: 'user-1',
                email: 'old@example.com',
                purpose: 'email_verify',
                jti: 'verification-jti',
            });
            prisma.user.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.verifyEmail('verification-token')).rejects.toThrow(UnauthorizedException);
            expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ email: 'old@example.com' }),
            }));
        });
    });

    describe('logout', () => {
        beforeEach(() => {
            jest.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
        });

        it('should clear refresh token and blacklist jti', async () => {
            // Arrange
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            redis.set.mockResolvedValue('OK');

            // Act
            const expiration = Math.floor(Date.now() / 1000) + 3600;
            const result = await service.logout('user-1', 'jti-123', expiration);

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: { id: 'user-1', refreshTokenHash: { not: null } },
                data: { refreshTokenHash: null }
            });
            expect(redis.set).toHaveBeenCalledWith('jwt:blacklist:jti-123', 'revoked', 3600);
        });

        it('durably invalidates every session for a legacy token without jti', async () => {
            // Arrange
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            // Act
            const result = await service.logout('user-1', undefined, Math.floor(Date.now() / 1000) + 3600);

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { refreshTokenHash: null, sessionVersion: { increment: 1 } },
            });
            expect(redis.set).not.toHaveBeenCalled();
        });

        it.each([undefined, NaN, Infinity, -1, 0])('rejects missing or invalid expiration before writes: %p', async expiration => {
            await expect(service.logout('user-1', 'jti-123', expiration)).rejects.toThrow(UnauthorizedException);
            expect(prisma.user.updateMany).not.toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
        });

        it('rounds up the remaining token lifetime without dropping a fractional second', async () => {
            jest.spyOn(Date, 'now').mockReturnValue(1_800_000_000_250);
            await service.logout('user-1', 'jti-123', 1_800_000_000.75);
            expect(redis.set).toHaveBeenCalledWith('jwt:blacklist:jti-123', 'revoked', 1);
        });

        it('propagates a blacklist write failure instead of claiming logout succeeded after refresh clearing', async () => {
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            const redisFailure = new Error('Redis unavailable');
            redis.set.mockRejectedValueOnce(redisFailure);

            await expect(service.logout('user-1', 'jti-123', Math.floor(Date.now() / 1000) + 3600))
                .rejects.toBe(redisFailure);

            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: { id: 'user-1', refreshTokenHash: { not: null } },
                data: { refreshTokenHash: null },
            });
            expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
            // No session-version bump occurs: per-token revocation still requires the Redis write.
            expect(redis.set).toHaveBeenCalledWith('jwt:blacklist:jti-123', 'revoked', 3600);
        });
    });

    describe('forceLogout', () => {
        it('should invalidate all sessions for a user', async () => {
            // Arrange
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            redis.set.mockResolvedValue('OK');

            // Act
            const result = await service.forceLogout('user-1');

            // Assert
            expect(result.success).toBe(true);
            expect(result.userId).toBe('user-1');
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { refreshTokenHash: null, sessionVersion: { increment: 1 } }
            });
            expect(redis.set).toHaveBeenCalledWith(
                expect.stringContaining('user:user-1:force_logout_at'),
                expect.any(String),
                60 * 60
            );
        });

        it('remains successful when Redis is unavailable after durable force logout', async () => {
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            redis.set.mockRejectedValue(new Error('redis unavailable'));

            await expect(service.forceLogout('user-1')).resolves.toMatchObject({ success: true });
        });
    });

    describe('lookupEmail', () => {
        it('should return CLAIM for existing active user without CRM check', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', status: 'ACTIVE', deletedAt: null });

            // Act
            const result = await service.lookupEmail('test@test.com');

            // Assert
            expect(result).toEqual({ action: 'CLAIM' });
            expect(crmEmailValidator.validateEmailInCrm).not.toHaveBeenCalled();
        });

        it('should return DELETED for soft-deleted user without CRM check', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', status: 'ACTIVE', deletedAt: new Date() });

            // Act
            const result = await service.lookupEmail('test@test.com');

            // Assert
            expect(result).toEqual({ action: 'DELETED', companyName: null });
            expect(crmEmailValidator.validateEmailInCrm).not.toHaveBeenCalled();
        });

        it('should return INACTIVE for non-active user without CRM check', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', status: 'PENDING', deletedAt: null });

            // Act
            const result = await service.lookupEmail('test@test.com');

            // Assert
            expect(result).toEqual({ action: 'INACTIVE', status: 'PENDING', companyName: null });
            expect(crmEmailValidator.validateEmailInCrm).not.toHaveBeenCalled();
        });

        it('should validate NEW user with CRM and return NEW when valid', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.customerProfile.findFirst.mockResolvedValue(null);
            crmEmailValidator.isAdminBypass.mockReturnValue(false);
            crmEmailValidator.validateEmailInCrm.mockResolvedValue({ isValid: true, contactId: 'crm-1' });

            // Act
            const result = await service.lookupEmail('newuser@gmail.com');

            // Assert
            expect(result).toEqual({ action: 'NEW', companyName: null });
            expect(crmEmailValidator.validateEmailInCrm).toHaveBeenCalledWith('newuser@gmail.com');
        });

        it('should return CRM_REJECTED when CRM validation fails for NEW user', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.customerProfile.findFirst.mockResolvedValue(null);
            crmEmailValidator.isAdminBypass.mockReturnValue(false);
            crmEmailValidator.validateEmailInCrm.mockResolvedValue({
                isValid: false,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
            });

            // Act
            const result = await service.lookupEmail('unknown@gmail.com');

            // Assert
            expect(result).toEqual({
                action: 'CRM_REJECTED',
                errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
            });
        });

        it('should require CRM validation even for a submitted admin bypass email', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.customerProfile.findFirst.mockResolvedValue(null);
            crmEmailValidator.isAdminBypass.mockReturnValue(true);
            crmEmailValidator.validateEmailInCrm.mockResolvedValue({ isValid: true, contactId: 'crm-admin' });

            // Act
            const result = await service.lookupEmail('admin@example.com');

            // Assert
            expect(result).toEqual({ action: 'NEW', companyName: null });
            expect(crmEmailValidator.validateEmailInCrm).toHaveBeenCalledWith('admin@example.com');
        });

        it('should validate NEW_MATCHED_COMPANY user with CRM and return action when valid', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.customerProfile.findFirst.mockResolvedValue({ companyName: 'Acme Corp' });
            crmEmailValidator.isAdminBypass.mockReturnValue(false);
            crmEmailValidator.validateEmailInCrm.mockResolvedValue({ isValid: true, contactId: 'crm-2' });

            // Act
            const result = await service.lookupEmail('newuser@acme.com');

            // Assert
            expect(result).toEqual({ action: 'NEW_MATCHED_COMPANY', companyName: 'Acme Corp' });
            expect(crmEmailValidator.validateEmailInCrm).toHaveBeenCalledWith('newuser@acme.com');
        });

        it('should return CRM_REJECTED for NEW_MATCHED_COMPANY when CRM validation fails', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.customerProfile.findFirst.mockResolvedValue({ companyName: 'Acme Corp' });
            crmEmailValidator.isAdminBypass.mockReturnValue(false);
            crmEmailValidator.validateEmailInCrm.mockResolvedValue({
                isValid: false,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
            });

            // Act
            const result = await service.lookupEmail('unknown@acme.com');

            // Assert
            expect(result).toEqual({
                action: 'CRM_REJECTED',
                errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
            });
        });
    });

    describe('testEmailConfig', () => {
        it('reports whether a Resend key exists without leaking its prefix', async () => {
            email.healthCheck.mockResolvedValue({ status: 'ok' });
            mockConfigService.get.mockImplementation((key: string) => {
                switch (key) {
                    case 'RESEND_API_KEY':
                        return 're_live_secret_value';
                    case 'MAIL_FROM':
                        return 'support@example.com';
                    case 'FRONTEND_URL':
                        return 'https://allplan.net.tr';
                    default:
                        return 'test-value';
                }
            });
            prisma.setting = {
                findMany: jest.fn().mockResolvedValue([
                    { key: 'email.active_provider', value: 'resend' },
                ]),
            };

            const result = await service.testEmailConfig();

            expect(result.config.env).toEqual({
                hasResendKey: true,
                mailFrom: 'support@example.com',
                frontendUrl: 'https://allplan.net.tr',
            });
            expect(result.config.env).not.toHaveProperty('resendKeyPrefix');
            expect(JSON.stringify(result)).not.toContain('re_live_secret');
            expect(prisma.setting.findMany).toHaveBeenCalledWith({
                where: {
                    key: {
                        in: [
                            'email.active_provider',
                            'general.frontend_url',
                            'branding.logo_url',
                            'branding.help_center_url'
                        ]
                    }
                }
            });
        });
    });
});
