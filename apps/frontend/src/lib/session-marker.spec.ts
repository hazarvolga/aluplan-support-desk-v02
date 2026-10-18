// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { verifySessionMarker } from './session-marker';

const secret = 'test-only-marker'.padEnd(32, 'x');

const signMarker = (overrides: { audience?: string; purpose?: string; expiresAt?: number } = {}) =>
    new SignJWT({ purpose: overrides.purpose ?? 'session-marker' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('aluplan-support')
        .setAudience(overrides.audience ?? 'aluplan:session-marker')
        .setExpirationTime(overrides.expiresAt ?? Math.floor(Date.now() / 1000) + 60)
        .sign(new TextEncoder().encode(secret));

describe('verifySessionMarker', () => {
    it('accepts only a correctly signed, scoped, unexpired marker', async () => {
        await expect(verifySessionMarker(await signMarker(), secret)).resolves.toBe(true);
    });

    it.each([
        ['wrong secret', async () => verifySessionMarker(await signMarker(), `${secret}x`)],
        ['wrong audience', async () => verifySessionMarker(await signMarker({ audience: 'other' }), secret)],
        ['wrong purpose', async () => verifySessionMarker(await signMarker({ purpose: 'access' }), secret)],
        ['expired', async () => verifySessionMarker(await signMarker({ expiresAt: Math.floor(Date.now() / 1000) - 1 }), secret)],
        ['constant marker', async () => verifySessionMarker('1', secret)],
        ['missing secret', async () => verifySessionMarker(await signMarker(), undefined)],
    ])('rejects %s', async (_label, verify) => {
        await expect(verify()).resolves.toBe(false);
    });
});
