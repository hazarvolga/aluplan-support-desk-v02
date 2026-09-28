import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, HttpException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CustomersService } from './customers.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RegisterCustomerDto } from './dto/register-customer.dto';

// Real service/JWT/bcrypt with synthetic in-memory persistence only. These tests
// do not prove PostgreSQL locking, CRM reachability, or HTTP/browser acceptance.
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const registration: RegisterCustomerDto = {
    email: 'member@example.test', password: 'New-owned-password-42!',
    username: 'synthetic-customer',
    firstName: 'Synthetic', lastName: 'Customer', company: 'Fixture',
    usedProducts: [], isAllplanUser: false,
};

async function fixture(roleName: string | null = 'CUSTOMER', overrides: Record<string, unknown> = {}) {
    const role = roleName === null ? null : {
        id: `role-${roleName}`, name: roleName,
        permissions: [{ permission: { name: 'ticket:read' } }],
    };
    const keys: Record<string, string> = {
        JWT_SECRET: randomBytes(32).toString('hex'),
        JWT_REFRESH_SECRET: randomBytes(32).toString('hex'),
        AUTH_ACTION_JWT_SECRET: randomBytes(32).toString('hex'),
        FRONTEND_URL: 'http://localhost:3000',
    };
    const config = { get: (key: string, fallback?: string) => keys[key] ?? fallback } as ConfigService;
    const jwt = new JwtService();
    const oldJti = randomUUID();
    const oldRefreshToken = jwt.sign({ sub: 'reclaim-fixture', sessionVersion: 7 }, {
        secret: keys.JWT_REFRESH_SECRET, expiresIn: '1h',
    });
    let user: Record<string, any> = {
        id: 'reclaim-fixture', email: registration.email, fullName: 'Previous Name',
        status: 'INACTIVE', deletedAt: null, roleId: role?.id ?? null, role,
        passwordHash: await bcrypt.hash('Previous-password-42!', 4), sessionVersion: 7,
        refreshTokenHash: await bcrypt.hash(oldRefreshToken, 4),
        passwordResetJtiHash: digest(oldJti), passwordResetSentAt: new Date(),
        emailVerificationJtiHash: digest('previous-verification-challenge'),
        emailVerificationSentAt: new Date(),
        customerProfile: { id: 'profile-fixture', crmVerified: true,
            rawCrmPayload: { privateBusinessField: 'must-not-be-returned' } },
        futureAuthenticationSecret: 'must-not-be-returned', ...overrides,
    };
    let race: Record<string, unknown> | null = null;
    const patch = (data: Record<string, any>) => {
        const { sessionVersion, ...rest } = data;
        user = { ...user, ...rest,
            sessionVersion: sessionVersion?.increment !== undefined
                ? user.sessionVersion + sessionVersion.increment
                : sessionVersion ?? user.sessionVersion };
    };
    const matchesValue = (actual: any, expected: any): boolean => {
        if (expected === null || typeof expected !== 'object' || expected instanceof Date) return actual === expected;
        if ('equals' in expected) return expected.mode === 'insensitive'
            ? String(actual).toLowerCase() === String(expected.equals).toLowerCase()
            : actual === expected.equals;
        if ('is' in expected) return matchesValue(actual, expected.is);
        return actual !== null && actual !== undefined
            && Object.entries(expected).every(([key, value]) => matchesValue(actual[key], value));
    };
    const matches = (where: Record<string, any>) => matchesValue(user, where);
    const prisma = {
        user: {
            findFirst: jest.fn(async () => ({ ...user })),
            findUnique: jest.fn(async () => ({ ...user })),
            create: jest.fn(), update: jest.fn(),
            updateMany: jest.fn(async ({ where, data }) => {
                if (race) { user = { ...user, ...race }; race = null; }
                if (!matches(where)) return { count: 0 };
                patch(data);
                return { count: 1 };
            }),
        },
        role: { findUnique: jest.fn(async ({ where }) => where.name === 'CUSTOMER'
            ? { id: 'role-CUSTOMER', name: 'CUSTOMER' } : role) },
        customerProfile: { findUnique: jest.fn(async () => null), upsert: jest.fn(async () => ({})) },
        setting: { findUnique: jest.fn(async () => null) },
        $transaction: jest.fn(async (callback: (transaction: any) => Promise<unknown>) => callback(prisma)),
    };
    const mail = { enqueueEmail: jest.fn(async (_message: any) => undefined) };
    const crm = { validateEmailInCrm: jest.fn(async () => ({ isValid: true })), isAdminBypass: jest.fn() };
    const errors = { logError: jest.fn(async () => undefined) };
    const redis = { get: jest.fn(async () => null), set: jest.fn(async () => undefined) };
    const customers = new CustomersService(prisma as any, {} as any, mail as any, jwt, config, errors as any, crm as any);
    const auth = new AuthService(prisma as any, jwt, config, mail as any,
        { getValue: jest.fn(async () => null) } as any, redis as any, crm as any);
    const strategy = new JwtStrategy(config, redis as any, prisma as any);
    const oldResetToken = jwt.sign({ sub: user.id, email: user.email, purpose: 'password_reset', jti: oldJti }, {
        secret: keys.AUTH_ACTION_JWT_SECRET, audience: 'aluplan:password-reset',
        issuer: 'aluplan-support', expiresIn: '30m',
    });
    const oldAccessToken = jwt.sign({ sub: user.id, email: user.email, fullName: user.fullName,
        role: 'CUSTOMER', permissions: ['ticket:read'], sessionVersion: 7, jti: randomUUID() }, {
        secret: keys.JWT_SECRET, expiresIn: '1h',
    });
    const reclaimAndVerify = async () => {
        await customers.registerCustomer({ ...registration });
        const message = mail.enqueueEmail.mock.calls[0][0];
        const verificationToken = new URLSearchParams(new URL(message.data.verifyUrl).hash.slice(1)).get('token')!;
        await auth.verifyEmail(verificationToken);
    };
    return { customers, auth, strategy, prisma, crm, mail, jwt, keys, errors,
        getUser: () => ({ ...user }), raceWith: (change: Record<string, unknown>) => { race = change; },
        oldResetToken, oldAccessToken, oldRefreshToken, reclaimAndVerify };
}

describe('Public customer reclaim authorization and credential lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        for (const level of ['error', 'warn', 'log', 'debug'] as const) {
            jest.spyOn(Logger.prototype, level).mockImplementation(() => undefined);
        }
    });
    afterEach(() => jest.restoreAllMocks());

    it.each(['ADMIN', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'SUPERUSER', 'VIEWER', 'UNKNOWN', null])(
        'denies an inactive %s account before CRM checks or identity/challenge writes', async role => {
            const f = await fixture(role);
            const before = f.getUser();
            await expect(f.customers.registerCustomer({ ...registration })).rejects.toBeInstanceOf(HttpException);
            expect(f.crm.validateEmailInCrm).not.toHaveBeenCalled();
            expect(f.prisma.$transaction).not.toHaveBeenCalled();
            expect(f.prisma.user.updateMany).not.toHaveBeenCalled();
            expect(f.prisma.user.update).not.toHaveBeenCalled();
            expect(f.prisma.user.create).not.toHaveBeenCalled();
            expect(f.prisma.customerProfile.upsert).not.toHaveBeenCalled();
            expect(f.mail.enqueueEmail).not.toHaveBeenCalled();
            expect(f.getUser()).toEqual(before);
        },
    );

    it.each([
        { status: 'ACTIVE' }, { status: 'SUSPENDED' },
        { status: 'INACTIVE', deletedAt: new Date('2026-01-01') },
    ])('denies non-reclaimable lifecycle state %j without CRM or writes', async state => {
        const f = await fixture('CUSTOMER', state);
        await expect(f.customers.registerCustomer({ ...registration })).rejects.toBeInstanceOf(HttpException);
        expect(f.crm.validateEmailInCrm).not.toHaveBeenCalled();
        expect(f.prisma.user.updateMany).not.toHaveBeenCalled();
        expect(f.mail.enqueueEmail).not.toHaveBeenCalled();
    });

    it.each([
        ['staff promotion', { roleId: 'role-ADMIN', role: { id: 'role-ADMIN', name: 'ADMIN' } }],
        ['activation', { status: 'ACTIVE' }],
        ['role removal', { roleId: null, role: null }],
    ] as const)('rechecks eligibility inside the transaction after concurrent %s', async (_name, changedFields) => {
        const f = await fixture();
        const before = f.getUser();
        f.prisma.user.findFirst.mockResolvedValueOnce(before).mockResolvedValueOnce({ ...before, ...changedFields });
        await expect(f.customers.registerCustomer({ ...registration })).rejects.toBeInstanceOf(HttpException);
        expect(f.crm.validateEmailInCrm).toHaveBeenCalledTimes(1);
        expect(f.prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(f.prisma.user.updateMany).not.toHaveBeenCalled();
        expect(f.prisma.user.update).not.toHaveBeenCalled();
        expect(f.prisma.user.create).not.toHaveBeenCalled();
        expect(f.prisma.customerProfile.upsert).not.toHaveBeenCalled();
        expect(f.mail.enqueueEmail).not.toHaveBeenCalled();
    });

    it('reclaims an inactive customer with CRM membership, preserving role and atomically revoking old credentials', async () => {
        const f = await fixture();
        const before = f.getUser();
        await f.customers.registerCustomer({ ...registration });
        expect(f.crm.validateEmailInCrm).toHaveBeenCalledWith(registration.email);
        expect(f.getUser()).toMatchObject({ roleId: before.roleId, status: 'INACTIVE',
            sessionVersion: before.sessionVersion + 1, refreshTokenHash: null,
            passwordResetJtiHash: null, passwordResetSentAt: null });
        expect(await bcrypt.compare(registration.password, f.getUser().passwordHash)).toBe(true);
        expect(f.prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: before.id, email: before.email, roleId: before.roleId,
                status: 'INACTIVE', deletedAt: null, sessionVersion: before.sessionVersion, passwordHash: before.passwordHash }),
            data: expect.objectContaining({ sessionVersion: { increment: 1 }, refreshTokenHash: null,
                passwordResetJtiHash: null, passwordResetSentAt: null }),
        }));
        expect(f.prisma.user.updateMany.mock.calls[0][0].data).not.toHaveProperty('roleId');
        expect(f.mail.enqueueEmail).toHaveBeenCalledTimes(1);
        const message = f.mail.enqueueEmail.mock.calls[0][0];
        const verificationToken = new URLSearchParams(new URL(message.data.verifyUrl).hash.slice(1)).get('token')!;
        const decoded = f.jwt.verify(verificationToken, { secret: f.keys.AUTH_ACTION_JWT_SECRET,
            audience: 'aluplan:email-verification', issuer: 'aluplan-support', algorithms: ['HS256'] });
        expect(decoded).toMatchObject({ sub: before.id, email: before.email, purpose: 'email_verify' });
        expect(f.getUser().emailVerificationJtiHash).toBe(digest(decoded.jti));
    });

    it.each(['customer', ' Customer '])('preserves the stored role ID for the normalized %s customer alias', async roleName => {
        const f = await fixture(roleName);
        const before = f.getUser();
        await f.customers.registerCustomer({ ...registration });
        expect(f.getUser().roleId).toBe(before.roleId);
        expect(f.prisma.user.updateMany.mock.calls[0][0].data).not.toHaveProperty('roleId');
        expect(f.getUser().sessionVersion).toBe(before.sessionVersion + 1);
    });

    it.each([
        ['role', { roleId: 'role-ADMIN' }], ['status', { status: 'ACTIVE' }],
        ['session version', { sessionVersion: 8 }], ['email', { email: 'replacement@example.test' }],
        ['password', { passwordHash: 'concurrently-replaced-password-hash' }],
        ['role definition', { role: { id: 'role-CUSTOMER', name: 'ADMIN', permissions: [] } }],
        ['deletion', { deletedAt: new Date('2026-01-01') }],
    ] as const)('rejects a concurrent %s change without profile, challenge or email writes', async (_name, change) => {
        const f = await fixture();
        const before = f.getUser();
        f.raceWith(change);
        await expect(f.customers.registerCustomer({ ...registration })).rejects.toBeInstanceOf(HttpException);
        expect(f.prisma.customerProfile.upsert).not.toHaveBeenCalled();
        expect(f.mail.enqueueEmail).not.toHaveBeenCalled();
        expect(f.getUser()).toEqual({ ...before, ...change });
    });

    it('returns only the positive public DTO, never hashes, raw CRM profile or future secret fields', async () => {
        const f = await fixture();
        const result = await f.customers.registerCustomer({ ...registration });
        expect(result).toEqual({ id: 'reclaim-fixture', email: registration.email,
            fullName: 'Synthetic Customer', status: 'INACTIVE' });
    });

    it('returns the same minimal DTO for a new CRM member without exposing nested creation results', async () => {
        const f = await fixture();
        f.prisma.user.findFirst.mockResolvedValue(null as any);
        f.prisma.user.create.mockImplementation(async ({ data }) => ({ ...f.getUser(), ...data,
            customerProfile: { rawCrmPayload: { privateBusinessField: 'private' } } }));
        await expect(f.customers.registerCustomer({ ...registration })).resolves.toEqual({
            id: 'reclaim-fixture', email: registration.email, fullName: 'Synthetic Customer', status: 'INACTIVE',
        });
        expect(f.prisma.user.create).toHaveBeenCalledTimes(1);
        expect(f.prisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('fails closed when a new CRM member has no configured CUSTOMER role', async () => {
        const f = await fixture();
        f.prisma.user.findFirst.mockResolvedValue(null as any);
        f.prisma.role.findUnique.mockResolvedValue(null as any);
        await expect(f.customers.registerCustomer({ ...registration })).rejects.toBeInstanceOf(HttpException);
        expect(f.prisma.user.create).not.toHaveBeenCalled();
        expect(f.prisma.user.updateMany).not.toHaveBeenCalled();
        expect(f.mail.enqueueEmail).not.toHaveBeenCalled();
    });

    it('preserves an existing customer alias when the separate canonical CUSTOMER role is absent', async () => {
        const f = await fixture('customer');
        const before = f.getUser();
        f.prisma.role.findUnique.mockResolvedValue(null as any);
        await expect(f.customers.registerCustomer({ ...registration })).resolves.toEqual({
            id: before.id, email: before.email, fullName: 'Synthetic Customer', status: 'INACTIVE',
        });
        expect(f.getUser()).toMatchObject({ roleId: before.roleId, sessionVersion: before.sessionVersion + 1 });
        expect(f.prisma.user.updateMany.mock.calls[0][0].data).not.toHaveProperty('roleId');
        expect(f.prisma.user.create).not.toHaveBeenCalled();
        expect(f.mail.enqueueEmail).toHaveBeenCalledTimes(1);
    });

    it('invalidates a previously issued reset challenge after reclaim and email verification', async () => {
        const f = await fixture();
        await f.reclaimAndVerify();
        const verified = f.getUser();
        await expect(f.auth.resetPassword(f.oldResetToken, 'Old-link-owner-password-42!'))
            .rejects.toThrow(UnauthorizedException);
        expect(f.getUser()).toEqual(verified);
    });

    it('invalidates a previously issued access JWT after reclaim and email verification', async () => {
        const f = await fixture();
        await f.reclaimAndVerify();
        const payload = f.jwt.verify(f.oldAccessToken, { secret: f.keys.JWT_SECRET });
        await expect(f.strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('invalidates a previously issued refresh JWT after reclaim and email verification', async () => {
        const f = await fixture();
        await f.reclaimAndVerify();
        const payload = f.jwt.verify(f.oldRefreshToken, { secret: f.keys.JWT_REFRESH_SECRET });
        await expect(f.auth.refreshTokens(payload.sub, f.oldRefreshToken, payload.sessionVersion))
            .rejects.toThrow(ForbiddenException);
    });
});
