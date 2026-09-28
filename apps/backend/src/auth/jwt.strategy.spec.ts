import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const mockPrismaService = {
        user: { findUnique: jest.fn() },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        redis = module.get<RedisService>(RedisService);

        jest.clearAllMocks();
        mockPrismaService.user.findUnique.mockResolvedValue({
            status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
            role: { name: 'ADMIN', permissions: [{ permission: { name: '*' } }] },
        });
    });

    it('T12 does not extract access JWTs from the URL query string', () => {
        const extractor = (strategy as any)._jwtFromRequest;
        const request = {
            cookies: {},
            headers: {},
            query: { token: 'leaked-query-token' },
        };

        expect(extractor(request)).toBeNull();
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
            exp: Math.floor(Date.now() / 1000) + 3600,
        };

        it.each([undefined, 1, NaN])('rejects unbounded or expired access sessions: %s', async (exp) => {
            await expect(strategy.validate({ ...basePayload, exp })).rejects.toThrow(UnauthorizedException);
            expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
        });

        it('rejects stale administrator claims after a current role change', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
                role: { name: 'CUSTOMER', permissions: [] },
            });
            await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
        });

        it.each([null, { name: '', permissions: [] }])('rejects missing or unusable current roles: %j', async (role) => {
            mockPrismaService.user.findUnique.mockResolvedValue({ status: 'ACTIVE', deletedAt: null, sessionVersion: 0, role });
            await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
        });

        it.each([{ permissions: [] }, { permissions: ['ticket:read'] }])('uses exact current grants, never cached token wildcard: $permissions', async ({ permissions }) => {
            redis.get.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue({
                status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
                role: { name: 'ADMIN', permissions: permissions.map(name => ({ permission: { name } })) },
            });
            await expect(strategy.validate(basePayload)).resolves.toMatchObject({ permissions });
        });

        it('accepts role spelling aliases but returns current database authority', async () => {
            redis.get.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue({
                status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
                role: { name: 'SUPPORT_AGENT', permissions: [{ permission: { name: 'ticket:read' } }] },
            });
            await expect(strategy.validate({ ...basePayload, role: 'support-agent' })).resolves.toMatchObject({
                role: 'SUPPORT_AGENT', permissions: ['ticket:read'],
            });
        });

        it.each([undefined, NaN, 0])('rejects force-logout tokens with unprovable issuance: %s', async (sessionIssuedAt) => {
            redis.get.mockImplementation((key: string) => key.startsWith('user:') ? String(Date.now()) : null);
            await expect(strategy.validate({ ...basePayload, iat: undefined, sessionIssuedAt })).rejects.toThrow(UnauthorizedException);
        });

        it('fails closed on a malformed force-logout marker', async () => {
            redis.get.mockImplementation((key: string) => key.startsWith('user:') ? 'invalid-timestamp' : null);
            await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
        });

        it.each(['', undefined, ['user-1']])('rejects malformed subject before database access: %j', async (sub) => {
            await expect(strategy.validate({ ...basePayload, sub } as JwtPayload)).rejects.toThrow(UnauthorizedException);
            expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
        });

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

        it('uses millisecond session issuance to reject pre-reset access tokens', async () => {
            const forceLogoutAt = Date.now();
            redis.get.mockImplementation((key: string) =>
                key === 'user:user-1:force_logout_at' ? forceLogoutAt.toString() : null,
            );

            await expect(strategy.validate({
                ...basePayload,
                sessionIssuedAt: forceLogoutAt - 1,
            })).rejects.toThrow('Session has been invalidated');

            await expect(strategy.validate({
                ...basePayload,
                sessionIssuedAt: forceLogoutAt + 1,
            })).resolves.toMatchObject({ id: 'user-1' });
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

        it('rejects an access token after the durable session version changes', async () => {
            redis.get.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue({
                status: 'ACTIVE', deletedAt: null, sessionVersion: 1,
            });

            await expect(strategy.validate({ ...basePayload, sessionVersion: 0 }))
                .rejects.toThrow('Session is no longer valid');
        });
    });
});
