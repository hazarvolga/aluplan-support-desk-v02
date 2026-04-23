import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let redis: any;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_SECRET') return 'test-secret';
            return null;
        }),
    };

    const mockRedisService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        redis = module.get<RedisService>(RedisService);

        jest.clearAllMocks();
    });

    describe('validate', () => {
        const basePayload: JwtPayload = {
            sub: 'user-1',
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'ADMIN',
            permissions: ['*'],
            jti: 'jti-123',
            iat: Math.floor(Date.now() / 1000),
        };

        it('should return user object for valid token', async () => {
            // Arrange
            redis.get.mockResolvedValue(null);

            // Act
            const result = await strategy.validate(basePayload);

            // Assert
            expect(result).toMatchObject({
                id: 'user-1',
                email: 'test@example.com',
                role: 'ADMIN',
                permissions: ['*'],
                jti: 'jti-123',
            });
        });

        it('should throw UnauthorizedException for blacklisted jti', async () => {
            // Arrange
            redis.get.mockImplementation((key: string) => {
                if (key === 'jwt:blacklist:jti-123') return 'revoked';
                return null;
            });

            // Act & Assert
            await expect(strategy.validate(basePayload)).rejects.toThrow(
                new UnauthorizedException('Token has been revoked')
            );
        });

        it('should throw UnauthorizedException for force-logout session', async () => {
            // Arrange
            const forceLogoutAt = Date.now(); // now
            redis.get.mockImplementation((key: string) => {
                if (key === 'user:user-1:force_logout_at') return forceLogoutAt.toString();
                return null;
            });

            const payloadWithOldIat: JwtPayload = {
                ...basePayload,
                iat: Math.floor((forceLogoutAt - 60000) / 1000), // 1 minute before force logout
            };

            // Act & Assert
            await expect(strategy.validate(payloadWithOldIat)).rejects.toThrow(
                new UnauthorizedException('Session has been invalidated by administrator')
            );
        });

        it('should allow token issued after force logout', async () => {
            // Arrange
            const forceLogoutAt = Date.now() - 60000; // 1 minute ago
            redis.get.mockImplementation((key: string) => {
                if (key === 'user:user-1:force_logout_at') return forceLogoutAt.toString();
                return null;
            });

            const payloadWithNewIat: JwtPayload = {
                ...basePayload,
                iat: Math.floor(Date.now() / 1000), // now — after force logout
            };

            // Act
            const result = await strategy.validate(payloadWithNewIat);

            // Assert
            expect(result.id).toBe('user-1');
        });

        it('should allow token without jti (legacy compatibility)', async () => {
            // Arrange
            const payloadWithoutJti: JwtPayload = {
                ...basePayload,
                jti: undefined,
            };
            redis.get.mockResolvedValue(null);

            // Act
            const result = await strategy.validate(payloadWithoutJti);

            // Assert
            expect(result.id).toBe('user-1');
            expect(redis.get).not.toHaveBeenCalledWith(expect.stringContaining('jwt:blacklist'));
        });
    });
});
