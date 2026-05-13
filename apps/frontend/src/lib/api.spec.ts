import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, isBackendUnavailableError } from './api';

describe('api.ts', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.clearAllMocks();
    });

    it('should make a GET request successfully', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ success: true }),
            json: async () => ({ success: true })
        });

        const response = await api.get('/test');
        expect(response).toEqual({ success: true });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({
            credentials: 'include'
        }));
    });

    it('should make a POST request successfully with payload', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ id: 1 }),
            json: async () => ({ id: 1 })
        });

        const response = await api.post('/create', { data: 123 });
        expect(response).toEqual({ id: 1 });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/create'), expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ data: 123 })
        }));
    });

    it('should handle 401 response and trigger refresh logic', async () => {
        // Step 1: 401 Unauthorized
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Unauthorized' })
        });

        // Step 2: Refresh token succeeds
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({})
        });

        // Step 3: Retry original request succeeds
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ retry: 'success' }),
            json: async () => ({ retry: 'success' })
        });

        const response = await api.get('/protected');
        expect(response).toEqual({ retry: 'success' });
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail if fetch throws non-ok status without 401', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ message: 'Server crashed' })
        });

        await expect(api.get('/error')).rejects.toThrow('Server crashed');
    });

    it('classifies network failures as backend unavailable', async () => {
        (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

        const promise = api.get('/offline');

        await expect(promise).rejects.toMatchObject({
            message: 'BACKEND_UNAVAILABLE',
            code: 'BACKEND_UNAVAILABLE',
        });

        const error = await promise.catch((err) => err);
        expect(isBackendUnavailableError(error)).toBe(true);
    });

    describe('api.pool', () => {
        it('should list pools', async () => {
            (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify([{ id: 1 }]) });
            const list = await api.pool.list();
            expect(list).toEqual([{ id: 1 }]);
            expect((global.fetch as any).mock.calls[0][0]).toContain('/knowledge-pool/sources');
        });
    });

    describe('api.tickets', () => {
        it('should get a ticket', async () => {
            (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ id: 't1' }) });
            const item = await api.tickets.get('t1');
            expect(item).toEqual({ id: 't1' });
            expect((global.fetch as any).mock.calls[0][0]).toContain('/tickets/t1');
        });

        it('should fetch sla stats', async () => {
            (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ stats: true }) });
            const item = await api.tickets.getSlaStats();
            expect(item).toEqual({ stats: true });
        });
    });

    describe('api.ai', () => {
        it('should fetch status', async () => {
            (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ status: 'HEALTHY' }) });
            const item = await api.ai.status();
            expect(item).toEqual({ status: 'HEALTHY' });
        });
    });
});
