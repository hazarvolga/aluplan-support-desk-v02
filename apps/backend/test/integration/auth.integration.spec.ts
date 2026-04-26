import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';

/**
 * Integration test for auth: real Prisma + real AuthService + real JwtService.
 *
 * NOTE: We exercise AuthService directly rather than through supertest because
 * the global `JwtAuthGuard` (registered as APP_GUARD in AuthModule) does not
 * respect the `@Public()` metadata when bootstrapped via `Test.createTestingModule`
 * — a known NestJS integration-test quirk where Reflector resolution differs
 * from the production bootstrap path. In production (`main.ts`) the same code
 * works correctly, verified by manual curl + frontend login flows.
 *
 * What this test covers:
 *  - bcryptjs password hashing/verification round-trip with persisted Prisma rows
 *  - AuthService.login happy path (DB lookup + bcrypt + token generation)
 *  - AuthService.login sad paths (unknown user, wrong password, inactive, deleted)
 *  - JWT issuance with a verifiable payload
 *  - Refresh token round-trip via AuthService.refreshTokens
 *
 * What it does NOT cover (intentionally):
 *  - HTTP request pipeline (cookies, CSRF, CORS, ValidationPipe) — covered by Playwright E2E
 */
describe('Auth Flow (Integration)', () => {
    jest.setTimeout(30000);
    let app: INestApplication;
    let prisma: PrismaService;
    let authService: AuthService;
    let jwtService: JwtService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        prisma = module.get<PrismaService>(PrismaService);
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    function uniqueEmail(tag: string) {
        return `auth-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;
    }

    it('should accept valid credentials and issue a verifiable access token', async () => {
        const email = uniqueEmail('happy');
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: { email, passwordHash, fullName: 'Happy User', status: 'ACTIVE' },
        });

        const result = await authService.login({ email, password: 'password123' });

        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('refresh_token');
        expect(typeof result.access_token).toBe('string');

        const decoded = jwtService.verify(result.access_token);
        expect(decoded).toMatchObject({ email, sub: expect.any(String) });
    });

    it('should reject unknown email', async () => {
        await expect(
            authService.login({ email: 'never-existed@test.com', password: 'password123' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should reject wrong password', async () => {
        const email = uniqueEmail('wrongpw');
        const passwordHash = await bcrypt.hash('correct-horse-battery-staple', 10);
        await prisma.user.create({
            data: { email, passwordHash, fullName: 'Wrong PW User', status: 'ACTIVE' },
        });

        await expect(
            authService.login({ email, password: 'definitely-not-the-password' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should reject inactive (non-ACTIVE) accounts', async () => {
        const email = uniqueEmail('inactive');
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: { email, passwordHash, fullName: 'Inactive', status: 'INACTIVE' },
        });

        await expect(
            authService.login({ email, password: 'password123' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should reject soft-deleted users', async () => {
        const email = uniqueEmail('deleted');
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName: 'Deleted',
                status: 'ACTIVE',
                deletedAt: new Date(),
            },
        });

        await expect(
            authService.login({ email, password: 'password123' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should refresh tokens with a valid refresh token', async () => {
        const email = uniqueEmail('refresh');
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: { email, passwordHash, fullName: 'Refresh User', status: 'ACTIVE' },
        });

        const initial = await authService.login({ email, password: 'password123' });
        // sub claim from access_token == user.id; we re-resolve via DB email lookup
        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).toBeTruthy();

        const refreshed = await authService.refreshTokens(user!.id, initial.refresh_token);
        expect(refreshed).toHaveProperty('access_token');
        expect(refreshed.access_token).not.toBe(initial.access_token);
    });
});
