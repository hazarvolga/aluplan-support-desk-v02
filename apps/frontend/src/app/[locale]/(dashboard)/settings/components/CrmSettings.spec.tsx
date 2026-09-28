import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/setup';
import { CrmSettings } from './CrmSettings';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

describe('CrmSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get(`${API_BASE}/crm/connections`, () => HttpResponse.json([
                {
                    id: 'connection-1',
                    provider: 'DYNAMICS_365',
                    instanceUrl: 'https://org.crm4.dynamics.com',
                    tenantId: 'tenant-1',
                    clientId: 'client-1',
                    clientSecret: '********',
                },
            ])),
            http.get(`${API_BASE}/settings/dynamics_api_key`, () => HttpResponse.json(
                { key: 'dynamics_api_key', value: '********' },
            )),
        );
    });

    it('loads the backend camelCase CRM contract into the form', async () => {
        render(<CrmSettings />);

        expect(await screen.findByLabelText('instance_url')).toHaveValue('https://org.crm4.dynamics.com');
        expect(screen.getByLabelText('tenant_id')).toHaveValue('tenant-1');
        expect(screen.getByLabelText('client_id')).toHaveValue('client-1');
        expect(screen.getByLabelText('client_secret')).toHaveValue('********');
    });

    it('saves through the canonical CRM client with a camelCase payload', async () => {
        let crmPayload: unknown;
        server.use(
            http.post(`${API_BASE}/crm/connections`, async ({ request }) => {
                crmPayload = await request.json();
                return HttpResponse.json({ id: 'connection-1' }, { status: 201 });
            }),
        );

        render(<CrmSettings />);
        await screen.findByDisplayValue('https://org.crm4.dynamics.com');
        fireEvent.click(screen.getByRole('button', { name: 'save_connection' }));

        await waitFor(() => expect(crmPayload).toEqual({
            provider: 'DYNAMICS_365',
            instanceUrl: 'https://org.crm4.dynamics.com',
            tenantId: 'tenant-1',
            clientId: 'client-1',
            clientSecret: '********',
        }));
        expect(toast.success).toHaveBeenCalledWith('save_success');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('reports CRM verification failure without writing the separate API key', async () => {
        let settingsWrites = 0;
        server.use(
            http.post(`${API_BASE}/crm/connections`, () => HttpResponse.json(
                { message: 'CRM verification failed' },
                { status: 400 },
            )),
            http.post(`${API_BASE}/settings`, () => {
                settingsWrites += 1;
                return HttpResponse.json({}, { status: 201 });
            }),
        );

        render(<CrmSettings />);
        await screen.findByDisplayValue('https://org.crm4.dynamics.com');
        fireEvent.click(screen.getByRole('button', { name: 'save_connection' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(settingsWrites).toBe(0);
        expect(toast.success).not.toHaveBeenCalled();
    });

    it('saves the legacy API key independently without rewriting CRM credentials', async () => {
        let crmWrites = 0;
        let settingsPayload: unknown;
        server.use(
            http.post(`${API_BASE}/crm/connections`, () => {
                crmWrites += 1;
                return HttpResponse.json({ id: 'connection-1' }, { status: 201 });
            }),
            http.post(`${API_BASE}/settings`, async ({ request }) => {
                settingsPayload = await request.json();
                return HttpResponse.json({ key: 'dynamics_api_key' }, { status: 201 });
            }),
        );

        render(<CrmSettings />);
        await screen.findByDisplayValue('https://org.crm4.dynamics.com');
        fireEvent.click(screen.getByRole('button', { name: 'save_api_key' }));

        await waitFor(() => expect(settingsPayload).toEqual({
            key: 'dynamics_api_key',
            value: '********',
            isSecret: true,
        }));
        expect(crmWrites).toBe(0);
        expect(toast.success).toHaveBeenCalledWith('save_success');
    });
});
