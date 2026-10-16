import { describe, expect, it } from 'vitest';
import { POST } from './route';

const request = (origin = 'http://localhost:3000', requestedWith = 'XMLHttpRequest') =>
    new Request('http://localhost:3000/api/auth/clear-session', {
        method: 'POST',
        headers: { Origin: origin, 'X-Requested-With': requestedWith },
    });

describe('POST /api/auth/clear-session', () => {
    it('expires only the cross-host marker cookie owned by the frontend', async () => {
        const response = await POST(request());
        const cookies = response.headers.getSetCookie().join('\n');

        expect(cookies).toContain('alu_session=');
        expect(cookies).not.toContain('alu_at=');
        expect(cookies).not.toContain('alu_rt=');
        expect(cookies.match(/Max-Age=0/g)).toHaveLength(1);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it.each([
        ['missing requested-with header', new Request('http://localhost:3000/api/auth/clear-session', { method: 'POST', headers: { Origin: 'http://localhost:3000' } })],
        ['cross-origin request', request('https://attacker.example')],
    ])('rejects %s', async (_label, unsafeRequest) => {
        const response = await POST(unsafeRequest);
        expect(response.status).toBe(403);
        expect(response.headers.getSetCookie()).toHaveLength(0);
    });
});
