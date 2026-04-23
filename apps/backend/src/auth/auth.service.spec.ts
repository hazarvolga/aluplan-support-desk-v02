import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { mockPrismaService, mockConfigService, mockRedisService } from '../test/mock.utils';
import { RedisService } from '../redis/redis.service';
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

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
        signAsync: jest.fn(),
    };

    const mockEmailService = {
        sendPasswordReset: jest.fn(),
        healthCheck: jest.fn(),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
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
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
        email = module.get<EmailService>(EmailService);
        settings = module.get<SettingsService>(SettingsService);
        redis = module.get<RedisService>(RedisService);

        jest.clearAllMocks();
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
                roleId: null,
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
            const mockUser = { id: '1', email: 'test@test.com', status: 'ACTIVE', refreshTokenHash: 'hash', roleId: null };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwt.signAsync.mockResolvedValue('new-token');

            // Act
            const result = await service.refreshTokens('1', 'valid-token');

            // Assert
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
        });
    });

    describe('forgotPassword', () => {
        it('should send reset email when user exists', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', fullName: 'Test' });
            settings.getValue.mockResolvedValue('http://frontend.local');
            jwt.sign.mockReturnValue('reset-token');

            // Act
            const result = await service.forgotPassword('test@test.com');

            // Assert
            expect(result.success).toBe(true);
            expect(email.sendPasswordReset).toHaveBeenCalledWith({
                recipientEmail: 'test@test.com',
                recipientName: 'Test',
                resetUrl: 'http://frontend.local/reset-password?token=reset-token'
            });
        });
    });

    describe('resetPassword', () => {
        it('should update password and invalidate sessions for valid token', async () => {
            // Arrange
            jwt.verify.mockReturnValue({ type: 'password-reset', sub: '1' });
            prisma.user.findUnique.mockResolvedValue({ id: '1' });
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');

            // Act
            const result = await service.resetPassword('valid-token', 'new-password');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { passwordHash: 'new-password-hash', refreshTokenHash: null }
            });
        });
    });

    describe('logout', () => {
        it('should clear refresh token and blacklist jti', async () => {
            // Arrange
            prisma.user.updateMany.mockResolvedValue({ count: 1 });
            redis.set.mockResolvedValue('OK');

            // Act
            const result = await service.logout('user-1', 'jti-123');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.updateMany).toHaveBeenCalledWith({
                where: { id: 'user-1', refreshTokenHash: { not: null } },
                data: { refreshTokenHash: null }
            });
            expect(redis.set).toHaveBeenCalledWith('jwt:blacklist:jti-123', 'revoked', 15 * 60);
        });

        it('should clear refresh token without jti', async () => {
            // Arrange
            prisma.user.updateMany.mockResolvedValue({ count: 1 });

            // Act
            const result = await service.logout('user-1');

            // Assert
            expect(result.success).toBe(true);
            expect(prisma.user.updateMany).toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
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
                data: { refreshTokenHash: null }
            });
            expect(redis.set).toHaveBeenCalledWith(
                expect.stringContaining('user:user-1:force_logout_at'),
                expect.any(String),
                15 * 60
            );
        });
    });
});
