import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '@/test/setup';
import { StorageSettings } from './StorageSettings';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('StorageSettings secret handling', () => {
    let settingsUrl = '';
    const writes: Array<Record<string, unknown>> = [];

    beforeEach(() => {
        settingsUrl = '';
        writes.length = 0;
        server.use(
            http.get(`${API_BASE}/settings`, ({ request }) => {
                settingsUrl = request.url;
                return HttpResponse.json([
                    { key: 'r2_access_key_id', value: '********', isSecret: true },
                    { key: 'r2_secret_access_key', value: '********', isSecret: true },
                    { key: 'r2_endpoint', value: 'https://example.invalid', isSecret: false },
                    { key: 'r2_bucket_name', value: 'test-bucket', isSecret: false },
                ]);
            }),
            http.post(`${API_BASE}/settings`, async ({ request }) => {
                writes.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({}, { status: 201 });
            }),
        );
    });

    it('loads masked settings and does not write masked credentials back', async () => {
        render(<StorageSettings />);
        await screen.findByDisplayValue('test-bucket');
        expect(settingsUrl).not.toContain('decrypt=true');

        fireEvent.click(screen.getByRole('button', { name: 'save_btn' }));
        await waitFor(() => expect(writes.length).toBe(2));
        expect(writes.some((write) => String(write.key).includes('access_key'))).toBe(false);
    });

    it('trims new credentials, marks them secret, then omits them on a second save', async () => {
        render(<StorageSettings />);
        await screen.findByDisplayValue('test-bucket');

        const accessKey = document.querySelector('#r2-access-key') as HTMLInputElement;
        const secretKey = document.querySelector('#r2-secret-key') as HTMLInputElement;
        fireEvent.change(accessKey, { target: { value: '  new-access  ' } });
        fireEvent.change(secretKey, { target: { value: '  new-secret  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'save_btn' }));

        await waitFor(() => expect(writes).toEqual(expect.arrayContaining([
            { key: 'r2_access_key_id', value: 'new-access', isSecret: true },
            { key: 'r2_secret_access_key', value: 'new-secret', isSecret: true },
        ])));
        await waitFor(() => {
            expect(accessKey).toHaveValue('********');
            expect(secretKey).toHaveValue('********');
        });

        writes.length = 0;
        fireEvent.click(screen.getByRole('button', { name: 'save_btn' }));
        await waitFor(() => expect(writes.length).toBe(2));
        expect(writes.some((write) => String(write.key).includes('access_key'))).toBe(false);
    });
});
