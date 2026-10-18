import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SsrfGuard } from './ssrf.guard';

const contextFor = (request: Record<string, unknown>): ExecutionContext => ({
    switchToHttp: () => ({
        getRequest: () => request,
    }),
} as unknown as ExecutionContext);

describe('SsrfGuard', () => {
    let guard: SsrfGuard;

    beforeEach(() => {
        guard = new SsrfGuard();
    });

    it.each([
        'https://support.allplan.com/path',
        'http://93.184.216.34/resource',
        'https://example.com:8443/hook',
    ])('allows public HTTP(S) URL %s', (url) => {
        expect(() => guard.validateUrl(url)).not.toThrow();
    });

    it.each([
        ['not a url', 'Invalid URL format'],
        ['file:///etc/passwd', 'Blocked protocol: file:'],
        ['ftp://example.com/file', 'Blocked protocol: ftp:'],
        ['data:text/plain,secret', 'Blocked protocol: data:'],
        ['ws://example.com/socket', 'Only HTTP/HTTPS protocols allowed'],
    ])('rejects unsafe URL syntax or protocol %s', (url, message) => {
        expect(() => guard.validateUrl(url)).toThrow(message);
    });

    it.each([
        'http://localhost/path',
        'http://LOCALHOST/path',
        'http://127.0.0.1/path',
        'http://0.0.0.0/path',
        'http://metadata.google.internal/computeMetadata/v1',
        'http://metadata/latest',
        'http://169.254.169.254/latest/meta-data',
    ])('rejects blocked host %s', (url) => {
        expect(() => guard.validateUrl(url)).toThrow(ForbiddenException);
        expect(() => guard.validateUrl(url)).toThrow(/Blocked host|Private IP/);
    });

    it.each([
        'http://10.0.0.1/path',
        'http://172.16.0.1/path',
        'http://172.31.255.255/path',
        'http://192.168.10.2/path',
        'http://169.254.1.2/path',
        'http://127.22.33.44/path',
    ])('rejects private or loopback IPv4 address %s', (url) => {
        expect(() => guard.validateUrl(url)).toThrow(/Private IP addresses are not allowed/);
    });

    it.each([
        'https://[2001:db8::1]/path',
        'https://[fe80::1]/path',
    ])('rejects IPv6 literals %s', (url) => {
        expect(() => guard.validateUrl(url)).toThrow(/IPv6 literals are not allowed/);
    });

    it.each([22, 25, 53, 5432, 6379, 27017])('rejects privileged port %s', (port) => {
        expect(() => guard.validateUrl(`https://example.com:${port}/hook`))
            .toThrow(`Privileged port not allowed: ${port}`);
    });

    it('recursively validates URL-like values from body, query, and params', () => {
        const context = contextFor({
            body: {
                callback: 'https://example.com/hook',
                nested: [{ documentation: 'https://support.allplan.com/article' }],
            },
            query: { returnUrl: 'https://example.org/return' },
            params: { id: 'not-a-url' },
        });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('blocks nested FTP and private HTTP URLs discovered in a request', () => {
        const ftpContext = contextFor({
            body: { nested: { target: 'ftp://example.com/file' } },
            query: {},
            params: {},
        });
        expect(() => guard.canActivate(ftpContext)).toThrow('Blocked protocol: ftp:');

        const privateContext = contextFor({
            body: {},
            query: { redirect: 'http://10.10.10.10/internal' },
            params: {},
        });
        expect(() => guard.canActivate(privateContext)).toThrow('Private IP addresses are not allowed');
    });

    it('ignores null, primitive, and non-URL request values', () => {
        const context = contextFor({
            body: null,
            query: { count: 1, label: 'example.com', empty: null },
            params: undefined,
        });

        expect(guard.canActivate(context)).toBe(true);
    });
});
