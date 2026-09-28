import { randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

// Service-flow regression with real JWT/bcrypt and synthetic in-memory persistence.
// This does not certify CRM admission, database isolation or browser/ticket endpoints.
function fixture(permissions = ['ticket:create', 'ticket:read', 'ticket:update', 'kb:read'], status = 'ACTIVE') {
    const keys: Record<string, string> = {
        JWT_SECRET: randomBytes(32).toString('hex'),
        JWT_REFRESH_SECRET: randomBytes(32).toString('hex'),
        AUTH_ACTION_JWT_SECRET: randomBytes(32).toString('hex'),
        FRONTEND_URL: 'http://localhost:3000',
    };
    const jwt = new JwtService();
    let user = {
        id: 'synthetic-customer', email: 'member@example.test', fullName: 'Synthetic Customer',
        status, deletedAt: null, roleId: 'synthetic-role', passwordHash: 'CRM_SYNCED',
        passwordResetJtiHash: null as string | null, passwordResetSentAt: null as Date | null,
        refreshTokenHash: null as string | null, sessionVersion: 0,
    };
    const patch = (data: Record<string, unknown>) => {
        const { sessionVersion, ...rest } = data;
        user = { ...user, ...rest, sessionVersion: user.sessionVersion + (sessionVersion ? 1 : 0) };
    };
    const prisma = {
        user: {
            findUnique: jest.fn(async ({ where }) => where.email === user.email || where.id === user.id ? { ...user } : null),
            findFirst: jest.fn(async () => null),
            update: jest.fn(async ({ data }) => { patch(data); return { ...user }; }),
            updateMany: jest.fn(async ({ where, data }) => {
                if (Object.entries(where).some(([key, value]) => key !== 'OR' && user[key as keyof typeof user] !== value)) {
                    return { count: 0 };
                }
                if (where.OR && user.passwordResetSentAt && user.passwordResetSentAt > where.OR[1].passwordResetSentAt.lte) {
                    return { count: 0 };
                }
                patch(data);
                return { count: 1 };
            }),
        },
        role: { findUnique: jest.fn(async () => ({
            name: 'CUSTOMER', permissions: permissions.map(name => ({ permission: { name } })),
        })) },
    };
    const mail = { sendPasswordReset: jest.fn(async (_payload: { resetUrl: string }) => undefined) };
    const crm = { validateEmailInCrm: jest.fn(), isAdminBypass: jest.fn() };
    const service = new AuthService(
        prisma as any, jwt,
        { get: (key: string, fallback?: string) => keys[key] ?? fallback } as ConfigService,
        mail as any, { getValue: jest.fn(async () => null) } as any,
        { set: jest.fn(async () => undefined) } as any, crm as any,
    );
    const issueReset = async () => {
        await service.forgotPassword(user.email);
        return new URLSearchParams(new URL(mail.sendPasswordReset.mock.calls[0][0].resetUrl).hash.slice(1)).get('token')!;
    };
    return {
        service, jwt, keys, mail, crm, getUser: () => ({ ...user }), issueReset,
        changeEmail: (email: string) => { user = { ...user, email }; },
    };
}

describe('CRM-synchronized customer email claim compatibility', () => {
    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    });
    afterEach(() => jest.restoreAllMocks());

    it('requires email claim before the CRM_SYNCED account can obtain a password session', async () => {
        const f = fixture();
        await expect(f.service.login({ email: f.getUser().email, password: 'CRM_SYNCED' }))
            .rejects.toThrow(UnauthorizedException);
        expect(await f.service.lookupEmail(f.getUser().email)).toEqual({ action: 'CLAIM' });
        const token = await f.issueReset();
        const decoded = f.jwt.verify(token, {
            secret: f.keys.AUTH_ACTION_JWT_SECRET, audience: 'aluplan:password-reset', issuer: 'aluplan-support',
        });
        expect(decoded.purpose).toBe('password_reset');
        expect(f.getUser().passwordResetJtiHash).not.toBe(decoded.jti);
        await f.service.resetPassword(token, 'Synthetic-owned-password-42!');
        expect(await bcrypt.compare('Synthetic-owned-password-42!', f.getUser().passwordHash)).toBe(true);
        expect(f.getUser().sessionVersion).toBe(1);
        expect(f.getUser().passwordResetJtiHash).toBeNull();
        const result = await f.service.login({ email: f.getUser().email, password: 'Synthetic-owned-password-42!' });
        const access = f.jwt.verify(result.access_token, { secret: f.keys.JWT_SECRET });
        expect(access.role).toBe('CUSTOMER');
        expect(access.permissions).toEqual(['ticket:create', 'ticket:read', 'ticket:update', 'kb:read']);
        expect(access.sessionVersion).toBe(1);
    });

    it('rejects reset replay and does not replace the already claimed password', async () => {
        const f = fixture();
        const token = await f.issueReset();
        await f.service.resetPassword(token, 'First-owned-password-42!');
        const claimed = f.getUser();
        await expect(f.service.resetPassword(token, 'Replay-password-42!')).rejects.toThrow(UnauthorizedException);
        expect(f.getUser()).toEqual(claimed);
    });

    it('rejects a reset token as email-activation proof and rejects a different signing key', async () => {
        const f = fixture();
        const token = await f.issueReset();
        const before = f.getUser();
        await expect(f.service.verifyEmail(token)).rejects.toThrow(UnauthorizedException);
        const forged = f.jwt.sign({ sub: before.id, email: before.email, purpose: 'password_reset', jti: 'fake' }, {
            secret: randomBytes(32).toString('hex'), audience: 'aluplan:password-reset', issuer: 'aluplan-support', expiresIn: '30m',
        });
        await expect(f.service.resetPassword(forged, 'Attacker-password-42!')).rejects.toThrow(UnauthorizedException);
        expect(f.getUser()).toEqual(before);
    });

    it('does not invent ticket grants during claim/login when the stored customer role has none', async () => {
        const f = fixture([]);
        await f.service.resetPassword(await f.issueReset(), 'Owned-password-no-grants-42!');
        const result = await f.service.login({ email: f.getUser().email, password: 'Owned-password-no-grants-42!' });
        expect(f.jwt.verify(result.access_token, { secret: f.keys.JWT_SECRET }).permissions).toEqual([]);
    });

    it('does not activate an inactive account merely because a password reset succeeds', async () => {
        const f = fixture([], 'INACTIVE');
        await f.service.resetPassword(await f.issueReset(), 'Owned-inactive-password-42!');
        expect(f.getUser().status).toBe('INACTIVE');
        await expect(f.service.login({ email: f.getUser().email, password: 'Owned-inactive-password-42!' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('rejects an old reset challenge after the account email changes', async () => {
        const f = fixture();
        const token = await f.issueReset();
        f.changeEmail('replacement@example.test');
        const changed = f.getUser();
        await expect(f.service.resetPassword(token, 'Old-owner-password-42!')).rejects.toThrow(UnauthorizedException);
        expect(f.getUser()).toEqual(changed);
    });
});
