// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import middleware from './middleware';

const secret = 'test-only-marker'.padEnd(32, 'x');
const originalSecret = process.env.SESSION_MARKER_SECRET;

const marker = (expiresAt = Math.floor(Date.now() / 1000) + 60) =>
    new SignJWT({ purpose: 'session-marker' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('aluplan-support')
        .setAudience('aluplan:session-marker')
        .setExpirationTime(expiresAt)
        .sign(new TextEncoder().encode(secret));

const requestWithMarker = (value?: string) => new NextRequest('http://localhost:3000/tr/dashboard', {
    headers: value ? { cookie: `alu_session=${value}` } : undefined,
});

describe('protected-route session marker', () => {
    afterEach(() => {
        if (originalSecret === undefined) delete process.env.SESSION_MARKER_SECRET;
        else process.env.SESSION_MARKER_SECRET = originalSecret;
    });

    it('admits a valid signed marker when the short-lived access cookie has expired', async () => {
        process.env.SESSION_MARKER_SECRET = secret;
        const response = await middleware(requestWithMarker(await marker()));
        expect(response.headers.get('location')).toBeNull();
    });

    it.each([
        ['constant', '1'],
        ['tampered', 'eyJhbGciOiJIUzI1NiJ9.eyJwdXJwb3NlIjoic2Vzc2lvbi1tYXJrZXIifQ.invalid'],
    ])('redirects a %s marker to the localized login', async (_label, value) => {
        process.env.SESSION_MARKER_SECRET = secret;
        const response = await middleware(requestWithMarker(value));
        expect(response.headers.get('location')).toBe('http://localhost:3000/tr/login');
    });

    it('fails closed when the server marker secret is unavailable', async () => {
        delete process.env.SESSION_MARKER_SECRET;
        const response = await middleware(requestWithMarker(await marker()));
        expect(response.headers.get('location')).toBe('http://localhost:3000/tr/login');
    });

    it('rejects a forged frontend access cookie without a valid signed marker', async () => {
        process.env.SESSION_MARKER_SECRET = secret;
        const request = new NextRequest('http://localhost:3000/tr/dashboard', {
            headers: { cookie: 'alu_at=forged-by-client' },
        });

        const response = await middleware(request);

        expect(response.headers.get('location')).toBe('http://localhost:3000/tr/login');
    });

    it('redirects an expired marker', async () => {
        process.env.SESSION_MARKER_SECRET = secret;
        const response = await middleware(requestWithMarker(await marker(Math.floor(Date.now() / 1000) - 1)));
        expect(response.headers.get('location')).toBe('http://localhost:3000/tr/login');
    });
});
