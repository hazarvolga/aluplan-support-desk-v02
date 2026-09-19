import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions, Roles } from '../rbac/decorators/rbac.decorators';

@Controller('authority-test')
@UseGuards(RbacGuard)
class AuthorityTestController {
    @Get('restricted')
    @RequirePermissions('settings:write')
    restricted() { return { allowed: true }; }

    @Get('admin')
    @Roles('ADMIN')
    admin() { return { allowed: true }; }

    @Get('identity')
    identity(@Req() req: { user: { role: string; permissions: string[] } }) {
        return { role: req.user.role, permissions: req.user.permissions };
    }

    @Public()
    @Get('public')
    publicRoute() { return { public: true }; }
}

describe('HTTP current session authority (real JWT and RBAC guards, synthetic persistence)', () => {
    let app: INestApplication;
    const secret = 'synthetic-phase2-access-test-secret';
    const jwt = new JwtService({ secret });
    const prisma = { user: { findUnique: jest.fn() } };
    const redis = { get: jest.fn() };
    const active = (role = 'ADMIN', permissions = ['*']) => ({
        status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
        role: { name: role, permissions: permissions.map(name => ({ permission: { name } })) },
    });
    const token = (claims = {}) => jwt.sign({
        sub: '00000000-0000-4000-8000-000000000002', role: 'ADMIN',
        permissions: ['*'], sessionVersion: 0, jti: 'synthetic-access-jti', ...claims,
    }, { expiresIn: '1h' });

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [AuthorityTestController],
            providers: [JwtStrategy, RbacGuard,
                { provide: ConfigService, useValue: { get: () => secret } },
                { provide: PrismaService, useValue: prisma },
                { provide: RedisService, useValue: redis },
            ],
        }).compile();
        app = module.createNestApplication();
        app.use(cookieParser());
        app.useGlobalGuards(new JwtAuthGuard(module.get(Reflector)));
        try {
            const fixedPort = process.env.ALUPLAN_HTTP_TEST_FIXED_PORT;
            if (fixedPort !== undefined && fixedPort !== '52984') throw new Error('Invalid ALUPLAN_HTTP_TEST_FIXED_PORT');
            const testPort = fixedPort === '52984' ? 52984 : 0;
            await app.listen(testPort, '127.0.0.1');
            const address = app.getHttpServer().address();
            expect(address).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
            expect(address.port).toBeGreaterThan(0);
            if (testPort) expect(address.port).toBe(testPort);
        } catch (error) {
            await app.close();
            throw error;
        }
    });

    beforeEach(() => {
        jest.resetAllMocks();
        prisma.user.findUnique.mockResolvedValue(active());
        redis.get.mockResolvedValue(null);
    });
    afterAll(async () => { if (app) await app.close(); });

    it('immediately removes revoked DB permissions from a still-valid signed token', async () => {
        const signed = token();
        await request(app.getHttpServer()).get('/authority-test/restricted').auth(signed, { type: 'bearer' }).expect(200);
        prisma.user.findUnique.mockResolvedValue(active('ADMIN', []));
        await request(app.getHttpServer()).get('/authority-test/restricted').auth(signed, { type: 'bearer' }).expect(403);
        const identity = await request(app.getHttpServer()).get('/authority-test/identity').auth(signed, { type: 'bearer' }).expect(200);
        expect(identity.body.permissions).toEqual([]);
    });

    it('accepts a specific current grant even when the old token carried no grants', async () => {
        prisma.user.findUnique.mockResolvedValue(active('ADMIN', ['settings:write']));
        await request(app.getHttpServer()).get('/authority-test/restricted').auth(token({ permissions: [] }), { type: 'bearer' }).expect(200);
    });

    it('rejects an old administrator token after a role downgrade without relying on version writes', async () => {
        prisma.user.findUnique.mockResolvedValue(active('CUSTOMER', ['ticket:read']));
        await request(app.getHttpServer()).get('/authority-test/admin').auth(token(), { type: 'bearer' }).expect(401);
    });

    it('uses new customer role for role-only gates even if token includes stale wildcard', async () => {
        prisma.user.findUnique.mockResolvedValue(active('CUSTOMER', ['ticket:read']));
        await request(app.getHttpServer()).get('/authority-test/admin').auth(token({ role: 'CUSTOMER' }), { type: 'bearer' }).expect(403);
    });

    it('applies identical authority to HttpOnly cookie authentication', async () => {
        prisma.user.findUnique.mockResolvedValue(active('ADMIN', ['ticket:read']));
        await request(app.getHttpServer()).get('/authority-test/restricted').set('Cookie', `alu_at=${token()}`).expect(403);
    });

    it.each([
        { status: 'SUSPENDED' }, { deletedAt: new Date() }, { sessionVersion: 1 }, { role: null },
    ])('rejects invalid current user state %j', async (override) => {
        prisma.user.findUnique.mockResolvedValue({ ...active(), ...override });
        await request(app.getHttpServer()).get('/authority-test/identity').auth(token(), { type: 'bearer' }).expect(401);
    });

    it('does not accept a signed token with no expiry', async () => {
        const unbounded = jwt.sign({ sub: 'user-2', role: 'ADMIN', permissions: ['*'] });
        await request(app.getHttpServer()).get('/authority-test/identity').auth(unbounded, { type: 'bearer' }).expect(401);
    });

    it('does not accept missing issuance when a force-logout marker exists', async () => {
        redis.get.mockImplementation((key: string) => key.startsWith('user:') ? String(Date.now()) : null);
        const noIssuance = jwt.sign({ sub: 'user-2', role: 'ADMIN', permissions: ['*'] }, { expiresIn: '1h', noTimestamp: true });
        await request(app.getHttpServer()).get('/authority-test/identity').auth(noIssuance, { type: 'bearer' }).expect(401);
    });

    it('preserves public routes and denies unsigned or expired access', async () => {
        await request(app.getHttpServer()).get('/authority-test/public').expect(200);
        await request(app.getHttpServer()).get('/authority-test/identity').expect(401);
        const expired = jwt.sign({ sub: 'user-2', role: 'ADMIN', permissions: ['*'] }, { expiresIn: -1 });
        await request(app.getHttpServer()).get('/authority-test/identity').auth(expired, { type: 'bearer' }).expect(401);
        await request(app.getHttpServer()).get('/authority-test/identity').auth(`${token()}tampered`, { type: 'bearer' }).expect(401);
    });
});
