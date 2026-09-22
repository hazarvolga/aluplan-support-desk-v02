import { randomBytes } from 'node:crypto';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';

// Composed loopback HTTP proof only: real controller/service/JWT/bcrypt, synthetic
// persistence/CRM/mail/Redis. NOT restored-DB, browser, TLS, provider, throttle,
// CSRF or full-main middleware acceptance. No AppModule or external connections.
jest.setTimeout(20_000); // Production reset/login/rotation still use real bcrypt cost 12.
describe('Synthetic HTTP customer admission and durable reset revocation', () => {
    let app: INestApplication;
    let user: any;
    let initialHash: string;
    const prefix = '/api/v1/auth';
    const oldPassword = 'Synthetic-old-password-42!';
    const newPassword = 'Synthetic-new-password-43!';
    const permissions = ['kb:read', 'ticket:create', 'ticket:read', 'ticket:update'];
    const role = { name: 'CUSTOMER', permissions: permissions.map(name => ({ permission: { name } })) };
    const keys = {
        JWT_SECRET: randomBytes(32).toString('hex'),
        JWT_REFRESH_SECRET: randomBytes(32).toString('hex'),
        AUTH_ACTION_JWT_SECRET: randomBytes(32).toString('hex'),
        NODE_ENV: 'test', FRONTEND_URL: 'http://localhost:3000',
    };
    const jwt = new JwtService();
    const config = { get: (key: string, fallback?: string) => keys[key as keyof typeof keys] ?? fallback };
    const redis = {
        get: jest.fn(async () => null),
        set: jest.fn(async () => { throw new Error('Synthetic Redis write unavailable'); }),
    };
    const mail = { sendPasswordReset: jest.fn(async (_value: { resetUrl: string }) => undefined) };
    const crm = { validateEmailInCrm: jest.fn(), isAdminBypass: jest.fn() };

    // Deliberately narrow fixture matching the exercised Prisma operations.
    // Unknown predicates fail closed instead of silently simulating a DB match.
    const matches = (where: Record<string, any>): boolean => Object.entries(where).every(([key, value]) => {
        if (key === 'OR') return value.some((condition: Record<string, any>) => matches(condition));
        if (key === 'passwordResetSentAt' && value && typeof value === 'object') {
            if (Object.keys(value).join() !== 'lte') throw new Error('Unsupported synthetic predicate');
            return user.passwordResetSentAt !== null && user.passwordResetSentAt <= value.lte;
        }
        if (!['id', 'email', 'status', 'deletedAt', 'sessionVersion', 'refreshTokenHash',
            'passwordResetJtiHash', 'passwordResetSentAt'].includes(key)) throw new Error('Unsupported synthetic predicate');
        return user[key] === value;
    });
    const patch = (data: Record<string, any>) => {
        const { sessionVersion, ...rest } = data;
        if (sessionVersion !== undefined && (Object.keys(sessionVersion).join() !== 'increment'
            || sessionVersion.increment !== 1)) throw new Error('Unsupported synthetic increment');
        user = { ...user, ...rest, sessionVersion: user.sessionVersion + (sessionVersion ? 1 : 0) };
    };
    const prisma = {
        user: {
            findUnique: jest.fn(async ({ where }) => matches(where) ? { ...user, role } : null),
            findFirst: jest.fn(async ({ where }) => where.email.equals === user.email ? { ...user, role } : null),
            update: jest.fn(async ({ where, data }) => {
                if (!matches(where)) throw new Error('Missing synthetic user');
                patch(data); return { ...user };
            }),
            updateMany: jest.fn(async ({ where, data }) => {
                if (!matches(where)) return { count: 0 };
                patch(data); return { count: 1 };
            }),
        },
        role: { findUnique: jest.fn(async () => role) },
        teamMember: { count: jest.fn(async () => 0) },
        customerProfile: { findFirst: jest.fn(async () => null) },
    };

    const cookie = (response: request.Response, name: string) => {
        const cookies = response.headers['set-cookie'] as unknown as string[];
        const found = cookies?.find(value => value.startsWith(`${name}=`));
        expect(Boolean(found)).toBe(true);
        expect(found).toContain('HttpOnly');
        expect(found).toContain(name === 'alu_rt' ? 'Path=/api/v1/auth/refresh' : 'Path=/');
        return found!.split(';')[0];
    };
    const login = (password = oldPassword) => request(app.getHttpServer())
        .post(`${prefix}/login`).send({ email: user.email, password });
    const me = (access: string) => request(app.getHttpServer()).get(`${prefix}/me`).set('Cookie', access);
    const refresh = (value: string) => request(app.getHttpServer()).post(`${prefix}/refresh`).set('Cookie', value);

    beforeAll(async () => {
        // Cheap synthetic starting hash only; this is not crypto/performance certification.
        initialHash = await bcrypt.hash(oldPassword, 4);
        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, JwtStrategy, JwtRefreshStrategy, JwtAuthGuard, RefreshGuard, RbacGuard,
                { provide: ConfigService, useValue: config }, { provide: JwtService, useValue: jwt },
                { provide: PrismaService, useValue: prisma }, { provide: RedisService, useValue: redis },
                { provide: EmailService, useValue: mail }, { provide: CrmEmailValidatorService, useValue: crm },
                { provide: SettingsService, useValue: { getValue: jest.fn(async () => null) } },
            ],
        }).compile();
        app = module.createNestApplication({ logger: false });
        app.setGlobalPrefix('api/v1');
        app.use(cookieParser());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalGuards(new JwtAuthGuard(module.get(Reflector)));
        try {
            const fixedPort = process.env.ALUPLAN_HTTP_TEST_FIXED_PORT;
            if (fixedPort !== undefined && fixedPort !== '52984') throw new Error('Invalid ALUPLAN_HTTP_TEST_FIXED_PORT');
            await app.listen(fixedPort ? 52984 : 0, '127.0.0.1');
            expect(app.getHttpServer().address()).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
        } catch (error) {
            await app.close(); throw error;
        }
    });
    beforeEach(() => {
        jest.clearAllMocks();
        for (const method of ['error', 'warn', 'log', 'debug'] as const) {
            jest.spyOn(Logger.prototype, method).mockImplementation(() => undefined);
        }
        user = {
            id: '00000000-0000-4000-8000-000000000123', email: 'member@example.test',
            fullName: 'Synthetic Customer', status: 'ACTIVE', deletedAt: null,
            roleId: 'synthetic-customer-role', passwordHash: initialHash, sessionVersion: 0,
            passwordResetJtiHash: null, passwordResetSentAt: null, refreshTokenHash: null,
        };
    });
    afterEach(() => jest.restoreAllMocks());
    afterAll(async () => { if (app) await app.close(); });

    it.each([
        [{ isValid: true, contactId: 'synthetic-contact' }, 200, 'NEW'],
        [{ isValid: false, errorCode: 'NOT_FOUND' }, 200, 'CRM_REJECTED'],
        [{ isValid: false, errorCode: 'CRM_ERROR', errorMessage: 'Synthetic private CRM detail' }, 503, undefined],
    ])('gates new-user lookup through CRM result %#', async (result, status, action) => {
        crm.validateEmailInCrm.mockResolvedValue(result);
        const before = { ...user };
        const response = await request(app.getHttpServer()).post(`${prefix}/lookup`)
            .send({ email: ' NEW-MEMBER@GMAIL.COM ' }).expect(status as number);
        expect(crm.validateEmailInCrm).toHaveBeenCalledWith('new-member@gmail.com');
        expect(crm.isAdminBypass).not.toHaveBeenCalled();
        if (action) expect(response.body.action).toBe(action);
        else expect(response.body.message).toBe('CRM kaydı şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.');
        expect(JSON.stringify(response.body)).not.toContain('Synthetic private CRM detail');
        expect(response.headers['set-cookie']).toBeUndefined();
        expect(user).toEqual(before);
        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('revokes issued access and refresh cookies after reset even when Redis cannot store a marker', async () => {
        const signedIn = await login().expect(200);
        expect(signedIn.body.access_token).toBeUndefined();
        expect(signedIn.body.refresh_token).toBeUndefined();
        await me(cookie(signedIn, 'alu_at')).expect(200);
        // Positive refresh control, then retain the freshly rotated cookie pair.
        const rotated = await refresh(cookie(signedIn, 'alu_rt')).expect(200);
        const oldAccess = cookie(rotated, 'alu_at');
        const oldRefresh = cookie(rotated, 'alu_rt');
        await me(oldAccess).expect(200);
        const beforeReset = { ...user };
        await request(app.getHttpServer()).post(`${prefix}/forgot-password`)
            .send({ email: user.email }).expect(200, { success: true });
        expect(mail.sendPasswordReset).toHaveBeenCalledTimes(1);
        const resetUrl = new URL(mail.sendPasswordReset.mock.calls[0][0].resetUrl);
        expect(resetUrl.search).toBe('');
        const token = new URLSearchParams(resetUrl.hash.slice(1)).get('token')!;
        const reset = () => request(app.getHttpServer()).post(`${prefix}/reset-password`)
            .send({ token, newPassword });
        await reset().expect(200);
        expect(user.sessionVersion).toBe(beforeReset.sessionVersion + 1);
        expect(user.refreshTokenHash).toBeNull();
        expect(user.passwordResetJtiHash).toBeNull();
        expect(user.status).toBe('ACTIVE');
        expect(user.roleId).toBe(beforeReset.roleId);
        expect(await bcrypt.compare(newPassword, user.passwordHash)).toBe(true);
        expect(redis.set).toHaveBeenCalledTimes(1);
        expect(await redis.get()).toBeNull();
        await me(oldAccess).expect(401);
        await refresh(oldRefresh).expect(403);
        const afterReset = { ...user };
        await reset().expect(401);
        expect(user).toEqual(afterReset);
        await login(oldPassword).expect(401);

        // In-memory fault injection: undo only durable version invalidation.
        // The same old access cookie works, demonstrating the 401 is not a
        // broken route, expired signature or Redis blacklist false positive.
        user = { ...afterReset, sessionVersion: beforeReset.sessionVersion };
        await me(oldAccess).expect(200);
        user = { ...afterReset };
        await me(oldAccess).expect(401);

        const renewed = await login(newPassword).expect(200);
        const renewedAccess = cookie(renewed, 'alu_at');
        const current = await me(renewedAccess).expect(200);
        expect(current.body.role).toBe('CUSTOMER');
        const claims = jwt.verify(renewedAccess.slice('alu_at='.length), { secret: keys.JWT_SECRET });
        expect(claims.permissions).toEqual(permissions);
        expect(claims.sessionVersion).toBe(1);
        await refresh(cookie(renewed, 'alu_rt')).expect(200);
        await me(oldAccess).expect(401);
        await refresh(oldRefresh).expect(403);
    });
});
