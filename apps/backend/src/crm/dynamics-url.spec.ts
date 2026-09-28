import { assertSameDynamicsOrigin, normalizeDynamicsInstanceUrl } from './dynamics-url';

describe('Dynamics URL trust boundary', () => {
    it('normalizes a trusted Dynamics instance origin', () => {
        expect(normalizeDynamicsInstanceUrl('https://org.crm4.dynamics.com/'))
            .toBe('https://org.crm4.dynamics.com');
    });

    it.each([
        'http://org.crm4.dynamics.com',
        'https://127.0.0.1',
        'https://dynamics.com',
        'https://dynamics.com.attacker.example',
        'https://user:pass@org.crm4.dynamics.com',
        'https://org.crm4.dynamics.com:444',
        'https://org.crm4.dynamics.com/api/data',
    ])('rejects an untrusted instance URL: %s', (url) => {
        expect(() => normalizeDynamicsInstanceUrl(url)).toThrow();
    });

    it('allows same-origin OData links and rejects cross-origin continuation links', () => {
        expect(assertSameDynamicsOrigin(
            'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=1',
            'https://org.crm4.dynamics.com',
        )).toContain('/api/data/v9.2/accounts');
        expect(() => assertSameDynamicsOrigin(
            'https://evil.crm4.dynamics.com/api/data/v9.2/accounts',
            'https://org.crm4.dynamics.com',
        )).toThrow(/changed origin/);
    });
});
