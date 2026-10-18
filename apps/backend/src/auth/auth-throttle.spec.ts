import { getLoginThrottleLimit } from './auth-throttle';

describe('getLoginThrottleLimit', () => {
    it('keeps the production login limit at 20 requests per minute', () => {
        expect(getLoginThrottleLimit('production')).toBe(20);
        expect(getLoginThrottleLimit(undefined)).toBe(20);
    });

    it('allows the isolated test suite to reuse seeded identities', () => {
        expect(getLoginThrottleLimit('test')).toBe(1000);
    });
});
