import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useSearchParams } from 'next/navigation';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/setup';
import AdminSettingsPage from './page';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const toast = vi.hoisted(() => vi.fn());

beforeAll(() => {
    Object.defineProperties(Element.prototype, {
        hasPointerCapture: { configurable: true, value: () => false },
        setPointerCapture: { configurable: true, value: vi.fn() },
        releasePointerCapture: { configurable: true, value: vi.fn() },
        scrollIntoView: { configurable: true, value: vi.fn() },
    });
});

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));

const providerConfig = {
    openai: { heading: 'ai.openai.title', key: 'ai.openai.api_key' },
    gemini: { heading: 'ai.gemini.title', key: 'ai.gemini.api_key' },
    groq: { heading: 'ai.providers.groq', key: 'ai.groq.api_key' },
} as const;

describe('AdminSettingsPage model listing credentials', () => {
    let activeProvider: keyof typeof providerConfig;
    let embedProvider: string | null;
    const omittedSettingKeys = new Set<string>();
    let extraSettings: Array<{ key: string; value: string; isSecret?: boolean }>;
    const modelListBodies: Array<Record<string, unknown>> = [];
    const bulkBodies: Array<Record<string, unknown>> = [];
    const storageBodies: Array<Record<string, unknown>> = [];
    const slaCreateBodies: Array<Record<string, unknown>> = [];
    const slaUpdateBodies: Array<{ id: string; body: Record<string, unknown> }> = [];
    const slaDeletedIds: string[] = [];
    const connectionBodies: Array<Record<string, unknown>> = [];
    const supportDepartmentId = '11111111-1111-4111-8111-111111111111';
    const priorityDepartmentId = '22222222-2222-4222-8222-222222222222';
    let settingsListCount: number;

    beforeEach(() => {
        activeProvider = 'openai';
        embedProvider = 'openai';
        omittedSettingKeys.clear();
        extraSettings = [];
        modelListBodies.length = 0;
        bulkBodies.length = 0;
        storageBodies.length = 0;
        slaCreateBodies.length = 0;
        slaUpdateBodies.length = 0;
        slaDeletedIds.length = 0;
        connectionBodies.length = 0;
        settingsListCount = 0;
        toast.mockClear();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
        server.use(
            http.get(`${API_BASE}/settings`, () => {
                settingsListCount += 1;
                return HttpResponse.json([
                    { key: 'ai.chat_provider', value: activeProvider },
                    { key: 'ai.active_provider', value: activeProvider },
                    ...(embedProvider === null ? [] : [{ key: 'ai.embed_provider', value: embedProvider }]),
                    { key: 'ai.openai.api_key', value: '********', isSecret: true },
                    { key: 'ai.openai.chat_model', value: 'gpt-4o-mini' },
                    { key: 'ai.openai.embed_model', value: 'text-embedding-3-small' },
                    { key: 'ai.gemini.api_key', value: '********', isSecret: true },
                    { key: 'ai.gemini.chat_model', value: 'gemini-2.5-flash' },
                    { key: 'ai.gemini.embed_model', value: 'text-embedding-004' },
                    { key: 'ai.groq.api_key', value: '********', isSecret: true },
                    { key: 'ai.groq.chat_model', value: 'llama-3.3-70b-versatile' },
                    ...extraSettings,
                ].filter((setting) => !omittedSettingKeys.has(setting.key)));
            }),
            http.get(`${API_BASE}/tickets/sla/policies`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/teams/departments`, () => HttpResponse.json([
                { id: supportDepartmentId, name: 'Support' },
                { id: priorityDepartmentId, name: 'Priority Support' },
            ])),
            http.get(`${API_BASE}/ai/health-status`, () => HttpResponse.json({
                status: 'HEALTHY',
                chatProvider: activeProvider,
                embedProvider: activeProvider === 'groq' ? 'openai' : activeProvider,
                providers: {},
            })),
            http.get(`${API_BASE}/ai/metrics`, () => HttpResponse.json({})),
            http.get(`${API_BASE}/ai/health-trends`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/ai/knowledge-gaps`, () => HttpResponse.json([])),
            http.post(`${API_BASE}/ai/list-models`, async ({ request }) => {
                modelListBodies.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({ chatModels: [], embedModels: [] });
            }),
            http.post(`${API_BASE}/ai/test-connection`, async ({ request }) => {
                connectionBodies.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({ success: true, provider: 'test', message: 'connection ok' });
            }),
            http.post(`${API_BASE}/settings/bulk`, async ({ request }) => {
                bulkBodies.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json([]);
            }),
            http.post(`${API_BASE}/settings/test-storage`, async ({ request }) => {
                storageBodies.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({ success: true, message: 'storage ok' });
            }),
            http.post(`${API_BASE}/tickets/sla/policies`, async ({ request }) => {
                slaCreateBodies.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({ id: 'created-policy' });
            }),
            http.patch(`${API_BASE}/tickets/sla/policies/:id`, async ({ params, request }) => {
                slaUpdateBodies.push({
                    id: String(params.id),
                    body: await request.json() as Record<string, unknown>,
                });
                return HttpResponse.json({});
            }),
            http.delete(`${API_BASE}/tickets/sla/policies/:id`, ({ params }) => {
                slaDeletedIds.push(String(params.id));
                return HttpResponse.json({});
            }),
            http.post(`${API_BASE}/email/admin/imap/verify`, () => HttpResponse.json({
                available: true,
                message: 'imap ok',
            })),
            http.post(`${API_BASE}/email/admin/provider/verify`, () => HttpResponse.json({
                provider: 'smtp',
                available: true,
            })),
            http.get(`${API_BASE}/email/gmail/auth-url`, () => HttpResponse.json({
                url: 'https://accounts.example.test/authorize',
            })),
            http.post(`${API_BASE}/branding/upload-logo`, () => HttpResponse.json({
                url: 'https://cdn.example.test/logo.png',
                publicUrl: 'https://public.example.test/logo.png',
                filename: 'logo.png',
            })),
        );
    });

    const openProviderCard = async (provider: keyof typeof providerConfig) => {
        activeProvider = provider;
        embedProvider = provider === 'groq' ? 'openai' : provider;
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.ai' }));
        const heading = await screen.findByRole('heading', { name: providerConfig[provider].heading });
        const card = heading.closest('.space-y-4') as HTMLElement;
        expect(card).not.toBeNull();
        return card;
    };

    it('omits a masked or blank key from the actual OpenAI model-list request', async () => {
        const card = await openProviderCard('openai');
        fireEvent.click(within(card).getByRole('button', { name: 'ai.list_models' }));
        await waitFor(() => expect(modelListBodies).toHaveLength(1));
        expect(modelListBodies[0]).toEqual({ provider: 'openai' });

        const credential = card.querySelector('input[type="password"]') as HTMLInputElement;
        fireEvent.change(credential, { target: { value: '   ' } });
        fireEvent.click(within(card).getByRole('button', { name: 'ai.list_models' }));
        await waitFor(() => expect(modelListBodies).toHaveLength(2));
        expect(modelListBodies[1]).toEqual({ provider: 'openai' });
    });

    it.each(Object.entries(providerConfig))(
        'sends only the newly typed %s credential to its provider model-list request',
        async (providerName, config) => {
            const provider = providerName as keyof typeof providerConfig;
            const card = await openProviderCard(provider);
            const credential = card.querySelector('input[type="password"]') as HTMLInputElement;
            fireEvent.change(credential, { target: { value: `new-${provider}-key` } });
            fireEvent.click(within(card).getByRole('button', { name: 'ai.list_models' }));

            await waitFor(() => expect(modelListBodies).toHaveLength(1));
            expect(modelListBodies[0]).toMatchObject({
                provider,
                apiKey: `new-${provider}-key`,
            });
            expect(config.key).toContain(provider);
            expect(JSON.stringify(modelListBodies[0])).not.toContain('********');
        },
    );

    it('masks a newly saved admin secret and omits it from the second bulk save', async () => {
        const card = await openProviderCard('openai');
        const credential = card.querySelector('input[type="password"]') as HTMLInputElement;
        fireEvent.change(credential, { target: { value: 'new-admin-key' } });
        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));

        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        const firstSettings = bulkBodies[0].settings as Array<Record<string, unknown>>;
        expect(firstSettings).toContainEqual({ key: 'ai.openai.api_key', value: 'new-admin-key', isSecret: true });
        await waitFor(() => expect(card.querySelector('input[type="password"]')).toHaveValue('********'));

        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(2));
        const secondSettings = bulkBodies[1].settings as Array<Record<string, unknown>>;
        expect(secondSettings.some((setting) => setting.key === 'ai.openai.api_key')).toBe(false);
    });

    it('blocks save when a legacy chat provider has no explicit supported embedding selection', async () => {
        activeProvider = 'groq';
        embedProvider = null;
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.ai' }));
        const heading = await screen.findByRole('heading', { name: providerConfig.groq.heading });
        const card = heading.closest('.space-y-4') as HTMLElement;
        expect(card).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));

        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'ai.validation.embed_provider_required',
            variant: 'destructive',
        })));
        expect(bulkBodies).toHaveLength(0);
    });

    it('keeps embedding unselected and blocks save when a supported chat provider has no explicit embedding selection', async () => {
        activeProvider = 'openai';
        embedProvider = null;
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.ai' }));

        const embedLabel = await screen.findByText('ai.embed_provider');
        const embedSelect = within(embedLabel.parentElement as HTMLElement).getByRole('combobox');
        expect(embedSelect.querySelector('span')?.textContent).toBe('');
        expect(embedSelect).not.toHaveTextContent('ai.providers.openai_cloud');

        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'ai.validation.embed_provider_required',
            variant: 'destructive',
        })));
        expect(bulkBodies).toHaveLength(0);
    });

    it('does not require an embedding model from a provider selected only for chat', async () => {
        activeProvider = 'openai';
        embedProvider = 'gemini';
        omittedSettingKeys.add('ai.openai.embed_model');
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.ai' }));

        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(toast).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
    });

    it('requires the embedding model from the explicitly selected embedding provider', async () => {
        activeProvider = 'openai';
        embedProvider = 'gemini';
        omittedSettingKeys.add('ai.gemini.embed_model');
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.ai' }));

        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'ai.validation.missing_fields',
            variant: 'destructive',
        })));
        expect(bulkBodies).toHaveLength(0);
    });

    it('saves Gmail credentials to the runtime mail.gmail namespace and marks the secret', async () => {
        extraSettings = [
            { key: 'email.active_provider', value: 'gmail' },
            { key: 'mail.gmail.email', value: 'support@example.com' },
            { key: 'mail.gmail.client_id', value: 'client-id' },
            { key: 'mail.gmail.client_secret', value: '********', isSecret: true },
        ];
        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.email' }));

        const secretInput = await screen.findByPlaceholderText('GOCSPX-...');
        fireEvent.change(secretInput, { target: { value: '  rotated-gmail-secret  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'email.gmail.credentials_save' }));

        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        const savedSettings = bulkBodies[0].settings as Array<Record<string, unknown>>;
        expect(savedSettings).toContainEqual({
            key: 'mail.gmail.client_secret',
            value: 'rotated-gmail-secret',
            isSecret: true,
        });
        expect(savedSettings.some((setting) => String(setting.key).startsWith('email.gmail.'))).toBe(false);
    });

    it('edits and persists general settings', async () => {
        extraSettings = [
            { key: 'general.portal_name', value: 'Old portal' },
            { key: 'general.frontend_url', value: 'https://old.example.test' },
        ];
        render(<AdminSettingsPage />);

        const nameInput = await screen.findByDisplayValue('Old portal');
        const urlInput = screen.getByDisplayValue('https://old.example.test');
        fireEvent.change(nameInput, { target: { value: 'New portal' } });
        fireEvent.change(urlInput, { target: { value: 'https://new.example.test' } });
        fireEvent.click(screen.getByRole('button', { name: 'ai.save_btn' }));

        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(bulkBodies[0].settings).toEqual(expect.arrayContaining([
            { key: 'general.portal_name', value: 'New portal', isSecret: false },
            { key: 'general.frontend_url', value: 'https://new.example.test', isSecret: false },
        ]));
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'toasts.save_success' }));
    });

    it('shows a localized failure when settings cannot be loaded without leaking the server error', async () => {
        server.use(http.get(`${API_BASE}/settings`, () => HttpResponse.json(
            { message: 'database-password-should-not-leak' },
            { status: 500 },
        )));
        render(<AdminSettingsPage />);

        await screen.findByRole('heading', { name: 'title' });
        expect(toast).toHaveBeenCalledWith({
            title: 'toasts.load_error',
            description: 'toasts.load_error',
            variant: 'destructive',
        });
        expect(JSON.stringify(toast.mock.calls)).not.toContain('database-password-should-not-leak');
    });

    it('persists SMTP and IMAP fields and masks both saved secrets', async () => {
        extraSettings = [
            { key: 'email.active_provider', value: 'smtp' },
            { key: 'email.from_address', value: 'old@example.test' },
            { key: 'email.smtp.host', value: 'smtp.example.test' },
            { key: 'email.smtp.port', value: '587' },
            { key: 'email.smtp.user', value: 'smtp-user' },
            { key: 'email.smtp.pass', value: '********', isSecret: true },
            { key: 'email.smtp.secure', value: 'false' },
            { key: 'email.imap.host', value: 'imap.example.test' },
            { key: 'email.imap.port', value: '993' },
            { key: 'email.imap.user', value: 'imap-user' },
            { key: 'email.imap.pass', value: '********', isSecret: true },
            { key: 'email.imap.tls', value: 'true' },
        ];
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.email' }));

        fireEvent.change(screen.getByDisplayValue('old@example.test'), { target: { value: 'new@example.test' } });
        fireEvent.change(screen.getByDisplayValue('smtp.example.test'), { target: { value: 'smtp-new.example.test' } });
        fireEvent.change(screen.getByDisplayValue('587'), { target: { value: '465' } });
        fireEvent.change(screen.getByDisplayValue('smtp-user'), { target: { value: 'new-smtp-user' } });
        fireEvent.change(screen.getByDisplayValue('imap.example.test'), { target: { value: 'imap-new.example.test' } });
        fireEvent.change(screen.getByDisplayValue('993'), { target: { value: '995' } });
        fireEvent.change(screen.getByDisplayValue('imap-user'), { target: { value: 'new-imap-user' } });
        const passwords = screen.getAllByDisplayValue('********');
        fireEvent.change(passwords[0], { target: { value: 'new-smtp-secret' } });
        fireEvent.change(passwords[1], { target: { value: 'new-imap-secret' } });
        await user.click(screen.getByLabelText('email.smtp_secure'));
        await user.click(screen.getByLabelText('SSL / TLS Senkronizasyonu'));
        await user.click(screen.getByRole('button', { name: 'email.save_provider_btn' }));

        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        const savedSettings = bulkBodies[0].settings as Array<Record<string, unknown>>;
        expect(savedSettings).toEqual(expect.arrayContaining([
            { key: 'email.smtp.pass', value: 'new-smtp-secret', isSecret: true },
            { key: 'email.imap.pass', value: 'new-imap-secret', isSecret: true },
            { key: 'email.smtp.secure', value: 'true', isSecret: false },
        ]));
        await waitFor(() => expect(screen.getAllByDisplayValue('********')).toHaveLength(2));

        await user.click(screen.getByRole('button', { name: 'email.save_provider_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(2));
        const secondSettings = bulkBodies[1].settings as Array<Record<string, unknown>>;
        expect(secondSettings.some(({ key }) => key === 'email.smtp.pass' || key === 'email.imap.pass')).toBe(false);
    });

    it('reports IMAP and outbound provider health success and failure states', async () => {
        extraSettings = [{ key: 'email.active_provider', value: 'smtp' }];
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.email' }));

        const testButtons = screen.getAllByRole('button', { name: 'email.test_connection_btn' });
        await user.click(testButtons[0]);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'success_title',
            description: 'imap ok',
        })));
        await user.click(testButtons[1]);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.connection_success',
            description: 'toasts.generic_success_hint',
        })));

        server.use(
            http.post(`${API_BASE}/email/admin/imap/verify`, () => HttpResponse.json({ available: false, message: 'imap down' })),
            http.post(`${API_BASE}/email/admin/provider/verify`, () => HttpResponse.json({ provider: 'smtp', available: false })),
        );
        await user.click(testButtons[0]);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'imap down',
            variant: 'destructive',
        })));
        await user.click(testButtons[1]);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.connection_failed',
            variant: 'destructive',
        })));
    });

    it('opens Gmail authorization and surfaces authorization errors safely', async () => {
        extraSettings = [
            { key: 'email.active_provider', value: 'gmail' },
            { key: 'mail.gmail.refresh_token', value: '********', isSecret: true },
        ];
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.email' }));

        expect(screen.getByText('email.authorized')).toBeInTheDocument();
        const authorize = screen.getByRole('button', { name: 'email.gmail.authorize_btn' });
        await user.click(authorize);
        await waitFor(() => expect(open).toHaveBeenCalledWith('https://accounts.example.test/authorize', '_blank'));

        server.use(http.get(`${API_BASE}/email/gmail/auth-url`, () => HttpResponse.json(
            { message: 'oauth-internal-details' },
            { status: 503 },
        )));
        await user.click(authorize);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.connection_error',
            description: 'toasts.gmail_credentials_hint',
            variant: 'destructive',
        })));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('oauth-internal-details');
        open.mockRestore();
    });

    it('shows Gmail OAuth callback results from the URL', async () => {
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('gmail_status=success') as never);
        const { unmount } = render(<AdminSettingsPage />);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: '✅ email.authorized',
            description: 'toasts.gmail_success',
        })));
        unmount();

        toast.mockClear();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('gmail_status=error&gmail_error=private-provider-detail') as never);
        render(<AdminSettingsPage />);
        await waitFor(() => expect(toast).toHaveBeenCalledWith({
            title: 'email.gmail_title',
            description: 'toasts.gmail_error',
            variant: 'destructive',
        }));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('private-provider-detail');
    });

    it('creates, updates, and deletes SLA policies through the visible controls', async () => {
        const policies = [{
            id: 'policy-1',
            name: 'Urgent response',
            priority: 'URGENT',
            departmentId: supportDepartmentId,
            department: { name: 'Support' },
            firstResponseMinutes: 15,
            resolutionMinutes: 120,
            businessHoursOnly: true,
        }];
        server.use(http.get(`${API_BASE}/tickets/sla/policies`, () => HttpResponse.json(policies)));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.sla' }));

        const policyRow = screen.getByText('Urgent response').closest('tr') as HTMLElement;
        expect(within(policyRow).getByText('Support')).toBeInTheDocument();
        expect(within(policyRow).getByText('sla.form.business_hours')).toBeInTheDocument();
        const rowButtons = within(policyRow).getAllByRole('button');
        await user.click(rowButtons[0]);
        expect(screen.getByText('sla.form.edit_title')).toBeInTheDocument();
        fireEvent.change(document.getElementById('sla_name') as HTMLInputElement, {
            target: { value: 'Updated urgent response' },
        });
        fireEvent.change(document.getElementById('sla_response') as HTMLInputElement, {
            target: { value: '20' },
        });
        await user.click(document.getElementById('sla_department_trigger') as HTMLElement);
        await user.click(await screen.findByRole('option', { name: 'Priority Support' }));
        fireEvent.change(document.getElementById('sla_resolve') as HTMLInputElement, {
            target: { value: '90' },
        });
        await user.click(screen.getByLabelText('sla.form.business_hours'));
        await user.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(slaUpdateBodies).toContainEqual({
            id: 'policy-1',
            body: expect.objectContaining({
                name: 'Updated urgent response',
                priority: 'URGENT',
                firstResponseMinutes: 20,
                departmentId: priorityDepartmentId,
                resolutionMinutes: 90,
                businessHoursOnly: false,
            }),
        }));

        await user.click(rowButtons[1]);
        await waitFor(() => expect(slaDeletedIds).toEqual(['policy-1']));
        expect(confirmSpy).toHaveBeenCalledWith('toasts.policy_confirm_delete');

        await user.click(screen.getByRole('button', { name: 'sla.add_policy' }));
        expect(document.getElementById('sla_name')).toHaveValue('');
        expect(document.getElementById('sla_response')).toHaveValue(480);
        fireEvent.change(document.getElementById('sla_name') as HTMLInputElement, {
            target: { value: 'Standard support' },
        });
        await user.click(document.getElementById('sla_department_trigger') as HTMLElement);
        await user.click(await screen.findByRole('option', { name: 'Support' }));
        await user.click(screen.getByRole('button', { name: 'ai.save_btn' }));
        await waitFor(() => expect(slaCreateBodies).toContainEqual(expect.objectContaining({
            name: 'Standard support',
            departmentId: supportDepartmentId,
            priority: 'MEDIUM',
            firstResponseMinutes: 480,
            resolutionMinutes: 1440,
        })));
        confirmSpy.mockRestore();
    });

    it('keeps SLA policies visible when the department lookup fails', async () => {
        server.use(
            http.get(`${API_BASE}/tickets/sla/policies`, () => HttpResponse.json([{
                id: 'policy-survives',
                name: 'Visible Policy',
                priority: 'HIGH',
                departmentId: supportDepartmentId,
                department: { name: 'Support' },
                responseTime: 60,
                resolutionTime: 240,
                businessHoursOnly: true,
            }])),
            http.get(`${API_BASE}/teams/departments`, () => HttpResponse.json(
                { message: 'private department failure' },
                { status: 500 },
            )),
        );

        render(<AdminSettingsPage />);
        await userEvent.setup().click(await screen.findByRole('tab', { name: 'tabs.sla' }));

        expect(await screen.findByText('Visible Policy')).toBeInTheDocument();
        expect(screen.queryByText('sla.empty_state')).not.toBeInTheDocument();
        expect(screen.queryByText('private department failure')).not.toBeInTheDocument();
    });

    it.each([
        ['blank name', { name: '   ', department: true, response: '60', resolution: '120' }],
        ['missing department', { name: 'Standard', department: false, response: '60', resolution: '120' }],
        ['zero response duration', { name: 'Standard', department: true, response: '0', resolution: '120' }],
        ['fractional resolution duration', { name: 'Standard', department: true, response: '60', resolution: '1.5' }],
    ])('rejects an invalid SLA create DTO: %s', async (_label, values) => {
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.sla' }));
        await user.click(screen.getByRole('button', { name: 'sla.add_policy' }));
        fireEvent.change(document.getElementById('sla_name') as HTMLInputElement, {
            target: { value: values.name },
        });
        if (values.department) {
            await user.click(document.getElementById('sla_department_trigger') as HTMLElement);
            await user.click(await screen.findByRole('option', { name: 'Support' }));
        }
        fireEvent.change(document.getElementById('sla_response') as HTMLInputElement, {
            target: { value: values.response },
        });
        fireEvent.change(document.getElementById('sla_resolve') as HTMLInputElement, {
            target: { value: values.resolution },
        });

        await user.click(screen.getByRole('button', { name: 'ai.save_btn' }));

        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            variant: 'destructive',
        })));
        expect(slaCreateBodies).toHaveLength(0);
    });

    it('does not delete an SLA policy when confirmation is declined', async () => {
        server.use(http.get(`${API_BASE}/tickets/sla/policies`, () => HttpResponse.json([{
            id: 'policy-2', name: '24/7 policy', priority: 'LOW', firstResponseMinutes: 60,
            resolutionMinutes: 240, businessHoursOnly: false,
        }])));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.sla' }));
        const row = screen.getByText('24/7 policy').closest('tr') as HTMLElement;
        await user.click(within(row).getAllByRole('button')[1]);
        expect(slaDeletedIds).toHaveLength(0);
        confirmSpy.mockRestore();
    });

    it('persists an uploaded logo, verifies read-back, reloads settings, then reports success', async () => {
        extraSettings = [
            { key: 'branding.company_name', value: 'Aluplan' },
            { key: 'branding.logo_url', value: 'https://old.example.test/logo.png' },
        ];
        const persistedSettings: Array<Record<string, unknown>> = [];
        let readBackCount = 0;
        server.use(
            http.post(`${API_BASE}/settings`, async ({ request }) => {
                const body = await request.json() as Record<string, unknown>;
                persistedSettings.push(body);
                extraSettings = [
                    { key: 'branding.company_name', value: 'Aluplan' },
                    { key: 'branding.logo_url', value: String(body.value) },
                ];
                return HttpResponse.json({});
            }),
            http.get(`${API_BASE}/settings/branding.logo_url`, () => {
                readBackCount += 1;
                return HttpResponse.json({
                    key: 'branding.logo_url',
                    value: 'https://public.example.test/logo.png',
                });
            }),
        );
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.branding' }));

        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        await user.upload(fileInput, new File(['logo'], 'logo.png', { type: 'image/png' }));
        await waitFor(() => expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
            'src',
            'https://public.example.test/logo.png',
        ));
        expect(persistedSettings).toEqual([{
            key: 'branding.logo_url',
            value: 'https://public.example.test/logo.png',
            isSecret: false,
        }]);
        expect(readBackCount).toBe(1);
        expect(settingsListCount).toBeGreaterThanOrEqual(2);
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'toasts.logo_success' }));

        await user.click(screen.getByRole('button', { name: 'reset' }));
        expect(screen.queryByRole('img', { name: 'Logo' })).not.toBeInTheDocument();
        fireEvent.change(screen.getByDisplayValue('Aluplan'), { target: { value: 'Aluplan Turkey' } });
        await user.click(screen.getByRole('button', { name: 'branding.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(bulkBodies[0].settings).toEqual(expect.arrayContaining([
            { key: 'branding.company_name', value: 'Aluplan Turkey', isSecret: false },
            { key: 'branding.logo_url', value: '', isSecret: false },
        ]));
    });

    it('keeps the previous logo and withholds success when logo persistence fails', async () => {
        extraSettings = [{ key: 'branding.logo_url', value: 'https://old.example.test/logo.png' }];
        server.use(http.post(`${API_BASE}/settings`, () => HttpResponse.json(
            { message: 'private-database-diagnostic' },
            { status: 500 },
        )));
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.branding' }));

        await user.upload(
            document.getElementById('logo-upload') as HTMLInputElement,
            new File(['logo'], 'logo.png', { type: 'image/png' }),
        );

        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            variant: 'destructive',
        })));
        expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
            'src',
            'https://old.example.test/logo.png',
        );
        expect(toast).not.toHaveBeenCalledWith(expect.objectContaining({ description: 'toasts.logo_success' }));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('private-database-diagnostic');
    });

    it('shows a safe branding upload error', async () => {
        server.use(http.post(`${API_BASE}/branding/upload-logo`, () => HttpResponse.json(
            { message: 'private-storage-diagnostic' },
            { status: 500 },
        )));
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.branding' }));
        await user.upload(
            document.getElementById('logo-upload') as HTMLInputElement,
            new File(['logo'], 'logo.png', { type: 'image/png' }),
        );
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.save_error',
            variant: 'destructive',
        })));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('private-storage-diagnostic');
    });

    it('copies the WhatsApp webhook and saves a newly entered secret', async () => {
        extraSettings = [
            { key: 'whatsapp.verify_token', value: 'verify' },
            { key: 'whatsapp.phone_number_id', value: '123' },
            { key: 'whatsapp.access_token', value: '********', isSecret: true },
        ];
        const user = userEvent.setup();
        const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.whatsapp' }));

        await user.click(screen.getByRole('button', { name: 'copy' }));
        expect(writeText).toHaveBeenCalledWith('http://localhost:4000/api/v1/whatsapp/webhook');
        fireEvent.change(screen.getByDisplayValue('verify'), { target: { value: 'verify-next' } });
        fireEvent.change(screen.getByDisplayValue('123'), { target: { value: '456' } });
        fireEvent.change(screen.getByDisplayValue('********'), { target: { value: 'new-whatsapp-secret' } });
        await user.click(screen.getByRole('button', { name: 'whatsapp.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(bulkBodies[0].settings).toContainEqual({
            key: 'whatsapp.access_token',
            value: 'new-whatsapp-secret',
            isSecret: true,
        });
        writeText.mockRestore();
    });

    it('tests storage with the current form values and preserves secret masking on save', async () => {
        extraSettings = [
            { key: 'storage.endpoint', value: 'https://storage.example.test' },
            { key: 'storage.region', value: 'eu-1' },
            { key: 'storage.bucket', value: 'support-files' },
            { key: 'storage.access_key', value: 'access-key' },
            { key: 'storage.secret_key', value: '********', isSecret: true },
        ];
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.storage' }));
        fireEvent.change(screen.getByDisplayValue('https://storage.example.test'), {
            target: { value: 'https://storage-new.example.test' },
        });
        fireEvent.change(screen.getByDisplayValue('eu-1'), { target: { value: 'eu-2' } });
        fireEvent.change(screen.getByDisplayValue('support-files'), { target: { value: 'support-files-new' } });
        fireEvent.change(screen.getByDisplayValue('access-key'), { target: { value: 'access-key-new' } });
        fireEvent.change(screen.getByPlaceholderText('storage.secret_key_placeholder'), {
            target: { value: 'new-storage-secret' },
        });

        await user.click(screen.getByRole('button', { name: 'storage.test_btn' }));
        await waitFor(() => expect(storageBodies).toEqual([{
            endpoint: 'https://storage-new.example.test',
            region: 'eu-2',
            bucket: 'support-files-new',
            accessKey: 'access-key-new',
            secretKey: 'new-storage-secret',
        }]));
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.connection_success',
            description: 'storage ok',
        }));

        await user.click(screen.getByRole('button', { name: 'general.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(bulkBodies[0].settings).toContainEqual({
            key: 'storage.secret_key', value: 'new-storage-secret', isSecret: true,
        });
        await waitFor(() => expect(screen.getAllByDisplayValue('********')).toHaveLength(2));
    });

    it('reports storage rejection and request errors', async () => {
        const user = userEvent.setup();
        server.use(http.post(`${API_BASE}/settings/test-storage`, () => HttpResponse.json({
            success: false,
            message: 'cannot connect',
            details: { advice: 'check region' },
        })));
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.storage' }));
        const testButton = screen.getByRole('button', { name: 'storage.test_btn' });
        await user.click(testButton);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'cannot connect\n\ncheck region',
            variant: 'destructive',
        })));

        server.use(http.post(`${API_BASE}/settings/test-storage`, () => HttpResponse.error()));
        await user.click(testButton);
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'toasts.connection_error',
            variant: 'destructive',
        })));
    });

    it('lists and selects OpenAI and Gemini models while exercising their connection checks', async () => {
        activeProvider = 'openai';
        embedProvider = 'gemini';
        omittedSettingKeys.add('ai.openai.chat_model');
        omittedSettingKeys.add('ai.openai.embed_model');
        extraSettings = [
            { key: 'ai.fallback_provider', value: 'xai' },
            { key: 'ai.embed_fallback_provider', value: 'custom' },
            { key: 'ai.xai.api_key', value: '********', isSecret: true },
            { key: 'ai.xai.url', value: 'https://api.x.ai/v1' },
            { key: 'ai.xai.chat_model', value: 'grok-2-latest' },
            { key: 'ai.custom.api_key', value: '********', isSecret: true },
            { key: 'ai.custom.url', value: 'https://custom.example.test/v1' },
            { key: 'ai.custom.chat_model', value: 'custom-chat' },
            { key: 'ai.custom.embed_model', value: 'custom-embed' },
        ];
        server.use(http.post(`${API_BASE}/ai/list-models`, async ({ request }) => {
            const body = await request.json() as Record<string, unknown>;
            modelListBodies.push(body);
            return HttpResponse.json(body.provider === 'openai'
                ? {
                    chatModels: [
                        { id: 'gpt-new', displayName: 'GPT New', recommended: true },
                        { id: 'gpt-old', displayName: 'GPT Old', recommended: false },
                    ],
                    embedModels: [{ id: 'embed-new', displayName: 'Embed New', recommended: true }],
                }
                : {
                    chatModels: [{ id: 'gemini-new', displayName: 'Gemini New', recommended: true }],
                    embedModels: [{ id: 'gemini-embed-new', displayName: 'Gemini Embed New', recommended: true }],
                });
        }));
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.ai' }));

        const openaiCard = (await screen.findByRole('heading', { name: 'ai.openai.title' })).closest('.space-y-4') as HTMLElement;
        await user.click(within(openaiCard).getByRole('button', { name: 'ai.list_models' }));
        const openaiSelects = await within(openaiCard).findAllByRole('combobox');
        expect(openaiSelects).toHaveLength(2);
        fireEvent.change(openaiSelects[0], { target: { value: 'gpt-old' } });
        fireEvent.change(openaiSelects[1], { target: { value: 'embed-new' } });
        await user.click(within(openaiCard).getByRole('button', { name: 'ai.test_btn' }));

        const geminiCard = (await screen.findByRole('heading', { name: 'ai.gemini.title' })).closest('.space-y-4') as HTMLElement;
        fireEvent.change(within(geminiCard).getByPlaceholderText('AIza...'), { target: { value: 'new-gemini-key' } });
        fireEvent.change(within(geminiCard).getByPlaceholderText('gemini-1.5-flash'), { target: { value: '' } });
        fireEvent.change(within(geminiCard).getByPlaceholderText('gemini-embedding-2'), { target: { value: '' } });
        await user.click(within(geminiCard).getByRole('button', { name: 'Flash 2.5' }));
        await user.click(within(geminiCard).getByRole('button', { name: 'Embedding 1' }));
        await user.click(within(geminiCard).getByRole('button', { name: 'ai.list_models' }));
        const geminiSelects = await within(geminiCard).findAllByRole('combobox');
        fireEvent.change(geminiSelects[0], { target: { value: 'gemini-new' } });
        fireEvent.change(geminiSelects[1], { target: { value: 'gemini-embed-new' } });
        await user.click(within(geminiCard).getByRole('button', { name: 'ai.test_btn' }));

        for (const [heading, placeholders] of [
            ['ai.xai.title', ['xai-...', 'https://api.x.ai/v1', 'grok-2-latest']],
            ['ai.providers.other_custom', ['https://...', 'sk-...', 'model-name', 'embed-name']],
        ] as const) {
            const card = screen.getByRole('heading', { name: heading }).closest('.space-y-4') as HTMLElement;
            placeholders.forEach((placeholder, index) => {
                fireEvent.change(within(card).getByPlaceholderText(placeholder), { target: { value: `changed-${index}` } });
            });
            await user.click(within(card).getByRole('button', { name: 'ai.test_btn' }));
        }

        await waitFor(() => expect(connectionBodies).toEqual(expect.arrayContaining([
            { provider: 'openai' },
            { provider: 'gemini' },
            { provider: 'xai' },
            { provider: 'custom' },
        ])));
    });

    it('edits Groq, DeepSeek and LLMAPI settings and handles model and connection failures safely', async () => {
        activeProvider = 'groq';
        embedProvider = 'llmapi';
        extraSettings = [
            { key: 'ai.fallback_provider', value: 'deepseek' },
            { key: 'ai.embed_fallback_provider', value: 'openai' },
            { key: 'ai.groq.url', value: 'https://api.groq.test/v1' },
            { key: 'ai.deepseek.api_key', value: '********', isSecret: true },
            { key: 'ai.deepseek.url', value: 'https://api.deepseek.test/v1' },
            { key: 'ai.deepseek.chat_model', value: 'deepseek-chat' },
            { key: 'ai.llmapi.api_key', value: '********', isSecret: true },
            { key: 'ai.llmapi.base_url', value: 'https://llmapi.test' },
            { key: 'ai.llmapi.chat_model', value: 'llm-chat' },
            { key: 'ai.llmapi.embed_model', value: 'llm-embed' },
        ];
        server.use(
            http.post(`${API_BASE}/ai/list-models`, () => HttpResponse.json({ message: 'private-model-error' }, { status: 502 })),
            http.post(`${API_BASE}/ai/test-connection`, () => HttpResponse.json({ message: 'private-connection-error' }, { status: 502 })),
        );
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.ai' }));

        const groqCard = screen.getByRole('heading', { name: 'ai.providers.groq' }).closest('.space-y-4') as HTMLElement;
        for (const [placeholder, value] of [
            ['gsk_...', 'new-groq-key'],
            ['https://api.groq.com/openai/v1', 'https://new-groq.test/v1'],
            ['llama-3.1-8b-instant', 'new-groq-model'],
        ]) fireEvent.change(within(groqCard).getByPlaceholderText(placeholder), { target: { value } });
        await user.click(within(groqCard).getByRole('button', { name: 'ai.list_models' }));
        await user.click(within(groqCard).getByRole('button', { name: 'ai.test_btn' }));

        const deepseekCard = screen.getByRole('heading', { name: 'ai.providers.deepseek' }).closest('.space-y-4') as HTMLElement;
        for (const [placeholder, value] of [
            ['sk-...', 'new-deepseek-key'],
            ['https://api.deepseek.com/v1', 'https://new-deepseek.test/v1'],
            ['deepseek-chat', 'new-deepseek-model'],
        ]) fireEvent.change(within(deepseekCard).getByPlaceholderText(placeholder), { target: { value } });
        await user.click(within(deepseekCard).getByRole('button', { name: 'ai.test_btn' }));

        const llmapiCard = screen.getByText('LLMAPI.ai').closest('.space-y-4') as HTMLElement;
        for (const [placeholder, value] of [
            ['llm-...', 'new-llm-key'],
            ['https://api.llmapi.io', 'https://new-llmapi.test'],
            ['gpt-4o', 'new-llm-chat'],
            ['text-embedding-3-small', 'new-llm-embed'],
        ]) fireEvent.change(within(llmapiCard).getByPlaceholderText(placeholder), { target: { value } });
        await user.click(within(llmapiCard).getByRole('button', { name: 'ai.test_btn' }));

        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'toasts.generic_error',
            variant: 'destructive',
        })));
        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            description: 'toasts.server_unreachable',
            variant: 'destructive',
        })));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('private-model-error');
        expect(JSON.stringify(toast.mock.calls)).not.toContain('private-connection-error');
    });

    it('updates all branding contact and social fields before persistence', async () => {
        const user = userEvent.setup();
        render(<AdminSettingsPage />);
        await user.click(await screen.findByRole('tab', { name: 'tabs.branding' }));

        const updates: Array<[string, string]> = [
            ['branding.placeholders.company', 'Company'],
            ['branding.placeholders.email', 'mail@example.test'],
            ['branding.placeholders.phone', '+90 555'],
            ['branding.placeholders.address', 'Istanbul'],
            ['https://linkedin.com/company/...', 'https://linkedin.test/company'],
            ['https://x.com/...', 'https://x.test/company'],
            ['https://facebook.com/...', 'https://facebook.test/company'],
            ['https://instagram.com/...', 'https://instagram.test/company'],
            ['https://pinterest.com/...', 'https://pinterest.test/company'],
        ];
        updates.forEach(([placeholder, value]) => {
            fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
        });
        await user.click(screen.getByRole('button', { name: 'branding.save_btn' }));
        await waitFor(() => expect(bulkBodies).toHaveLength(1));
        expect(bulkBodies[0].settings).toEqual(expect.arrayContaining([
            { key: 'branding.email', value: 'mail@example.test', isSecret: false },
            { key: 'branding.social_pinterest', value: 'https://pinterest.test/company', isSecret: false },
        ]));
    });
});
