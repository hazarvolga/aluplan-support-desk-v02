import { isUnsafePublicEmailUrl, joinPublicUrl, normalizeEmailLogoUrl } from './public-url.util';

describe('public-url.util', () => {
    it('joins API_URL without duplicating /api/v1', () => {
        expect(joinPublicUrl('https://api.example.com/api/v1', '/api/v1/branding/assets/logo.png'))
            .toBe('https://api.example.com/api/v1/branding/assets/logo.png');
    });

    it('normalizes branding asset paths against the public API URL', () => {
        expect(normalizeEmailLogoUrl('/api/v1/branding/assets/brand/logos/logo.png', {
            apiBaseUrl: 'https://api.example.com/api/v1',
            frontendUrl: 'https://support.example.com',
        })).toBe('https://api.example.com/api/v1/branding/assets/brand/logos/logo.png');
    });

    it('normalizes frontend assets against the frontend URL', () => {
        expect(normalizeEmailLogoUrl('/logo.png', {
            apiBaseUrl: 'https://api.example.com/api/v1',
            frontendUrl: 'https://support.example.com',
        })).toBe('https://support.example.com/logo.png');
    });

    it('keeps absolute HTTPS URLs unchanged', () => {
        expect(normalizeEmailLogoUrl('https://cdn.example.com/logo.png', {
            apiBaseUrl: 'https://api.example.com/api/v1',
            frontendUrl: 'https://support.example.com',
        })).toBe('https://cdn.example.com/logo.png');
    });

    it('warns for localhost URLs in production', () => {
        const warn = jest.fn();
        const result = normalizeEmailLogoUrl('http://localhost:4000/api/v1/branding/assets/logo.png', {
            nodeEnv: 'production',
            warn,
        });

        expect(result).toBe('http://localhost:4000/api/v1/branding/assets/logo.png');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('not email-safe'));
        expect(isUnsafePublicEmailUrl(result)).toBe(true);
    });
});
