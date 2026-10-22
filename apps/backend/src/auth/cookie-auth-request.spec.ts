import { isCookieAuthRequestAllowed, isTrustedCookieAuthRequest } from './cookie-auth-request';

describe('isTrustedCookieAuthRequest', () => {
    const allowedOrigins = ['https://allplan.net.tr', 'http://localhost:3000'];

    it('accepts only an exact allowed origin with the browser request header', () => {
        expect(isTrustedCookieAuthRequest(
            'https://allplan.net.tr',
            'XMLHttpRequest',
            allowedOrigins,
        )).toBe(true);
    });

    it.each([
        ['missing origin', undefined, 'XMLHttpRequest'],
        ['sibling subdomain', 'https://attacker.allplan.net.tr', 'XMLHttpRequest'],
        ['missing browser header', 'https://allplan.net.tr', undefined],
        ['wrong browser header', 'https://allplan.net.tr', 'fetch'],
    ])('rejects %s', (_label, origin, requestedWith) => {
        expect(isTrustedCookieAuthRequest(origin, requestedWith, allowedOrigins)).toBe(false);
    });
});

describe('isCookieAuthRequestAllowed', () => {
    const allowedOrigins = ['https://allplan.net.tr', 'http://localhost:3000'];

    it('allows bearer-only requests without browser origin headers', () => {
        expect(isCookieAuthRequestAllowed(
            false,
            undefined,
            undefined,
            allowedOrigins,
        )).toBe(true);
    });

    it('allows cookie authentication with an exact trusted origin', () => {
        expect(isCookieAuthRequestAllowed(
            true,
            'https://allplan.net.tr',
            'XMLHttpRequest',
            allowedOrigins,
        )).toBe(true);
    });

    it.each([
        ['missing origin', undefined, 'XMLHttpRequest'],
        ['missing browser header', 'https://allplan.net.tr', undefined],
    ])('rejects cookie authentication with %s', (_label, origin, requestedWith) => {
        expect(isCookieAuthRequestAllowed(
            true,
            origin,
            requestedWith,
            allowedOrigins,
        )).toBe(false);
    });
});
