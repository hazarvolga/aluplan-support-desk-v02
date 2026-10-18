import { Suspense } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CrmManagementPage from './page';

const { toast, socketHandlers, socket, crm, latestMappingProps } = vi.hoisted(() => {
    const handlers = new Map<string, (payload?: { connectionId?: string }) => Promise<void>>();
    return {
        toast: vi.fn(),
        socketHandlers: handlers,
        socket: {
            connected: false,
            on: vi.fn((event: string, handler: (payload?: { connectionId?: string }) => Promise<void>) => handlers.set(event, handler)),
            off: vi.fn(),
            connect: vi.fn(),
        },
        crm: {
            getConnections: vi.fn(), getFieldDefinitions: vi.fn(), getLogs: vi.fn(), getChanges: vi.fn(),
            getDiscoveryData: vi.fn(), upsertConnection: vi.fn(), triggerSync: vi.fn(), triggerDeltaSync: vi.fn(),
        },
        latestMappingProps: new Map<'account' | 'contact', MappingProps>(),
    };
});

vi.mock('@/lib/api', () => ({ api: { crm } }));
vi.mock('@/lib/socket', () => ({ getSocket: () => socket }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('next-intl', () => ({
    useLocale: () => 'en-US',
    useTranslations: () => (key: string, values?: { count?: number }) => values?.count === undefined ? key : `${key}:${values.count}`,
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

type MappingProps = {
    entityType: 'account' | 'contact';
    definitions: unknown[];
    discoveryData: unknown[];
    currentMapping: Record<string, string>;
    displaySettings: Array<{ key: string; visible: boolean }>;
    onMappingChange: (key: string, value: string) => void;
    onDisplayChange: (value: Array<{ key: string; visible: boolean }>) => void;
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
};

vi.mock('./field-mapping', () => ({
    FieldMapping: (props: MappingProps) => {
        latestMappingProps.set(props.entityType, props);
        return (
            <section data-testid={`mapping-${props.entityType}`}>
                <span>{JSON.stringify({ mapping: props.currentMapping, display: props.displaySettings, discovery: props.discoveryData })}</span>
                <button onClick={() => props.onMappingChange('custom', 'crm_custom')}>map-{props.entityType}</button>
                <button onClick={() => props.onMappingChange('custom', '')}>unmap-{props.entityType}</button>
                <button onClick={() => props.onDisplayChange([{ key: 'custom', visible: false }])}>display-{props.entityType}</button>
                <button onClick={props.onReset}>reset-{props.entityType}</button>
                <button onClick={props.onSave}>save-{props.entityType}</button>
            </section>
        );
    },
}));

const definitions = {
    account: [{ key: 'name', label: 'name', defaultCrmField: 'name' }],
    contact: [{ key: 'email', label: 'email', defaultCrmField: 'emailaddress1' }],
};

const discovery = {
    account: [{ logicalName: 'name', displayName: 'Name' }],
    contact: [{ logicalName: 'emailaddress1', displayName: 'Email' }],
};

const connection = {
    id: 'conn-1',
    provider: 'DYNAMICS_365' as const,
    tenantId: 'tenant-1',
    clientId: 'client-1',
    clientSecret: '********',
    webhookSecret: '********',
    instanceUrl: 'https://crm.example.test',
    isActive: true,
    lastSyncAt: '2026-10-14T10:00:00Z',
    syncStatus: 'READY',
    syncSettings: {
        accountMapping: { name: 'accountname', ignored: 5 },
        contactMapping: null,
        displaySettings: {
            account: [{ key: 'name' }, { key: 'hidden', visible: false }, null],
            contact: 'invalid',
        },
    },
};

const logs = [
    {
        id: 'success-log', status: 'SUCCESS', startedAt: '2026-10-14T10:00:00Z', completedAt: null,
        totalRecords: 4, successCount: 4, errorCount: 0, errorMessage: undefined, details: null,
    },
    {
        id: 'error-log', status: 'ERROR', startedAt: '2026-10-14T11:00:00Z', completedAt: null,
        totalRecords: 2, successCount: 0, errorCount: 2, errorMessage: 'Import failed',
        details: {
            failedRecords: [{ externalId: 'external-7', entityType: 'contact', errorMessage: 'Bad row' }],
            skippedRecords: [], skippedLinks: [], summary: { successCount: 0, errorCount: 2, skippedCount: 0 },
        },
    },
    {
        id: 'pending-log', status: 'RUNNING', startedAt: '2026-10-14T12:00:00Z', completedAt: null,
        totalRecords: 1, successCount: 0, errorCount: 0, errorMessage: null, details: { failedRecords: [], skippedRecords: [], skippedLinks: [], summary: { successCount: 0, errorCount: 0, skippedCount: 0 } },
    },
];

const changes = [
    { id: 'change-1', entityType: 'account', entityId: 'ext-a', localRecordId: 'local-a', fieldName: 'name', oldValue: null, newValue: 'Acme', source: 'WEBHOOK', status: 'SUCCESS', changedAt: '2026-10-14T09:00:00Z' },
    { id: 'change-2', entityType: 'contact', entityId: 'ext-c', localRecordId: null, fieldName: 'email', oldValue: 'old@test', newValue: null, source: 'SYNC', status: 'ERROR', changedAt: '2026-10-14T09:30:00Z' },
];

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
};

const renderPage = async () => {
    let result!: ReturnType<typeof render>;
    await act(async () => {
        result = render(
            <Suspense fallback={<div>suspended</div>}>
                <CrmManagementPage params={Promise.resolve({ locale: 'en-US' })} />
            </Suspense>,
        );
    });
    return result;
};

describe('CrmManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        socketHandlers.clear();
        socket.connected = false;
        latestMappingProps.clear();
        crm.getConnections.mockResolvedValue([]);
        crm.getFieldDefinitions.mockResolvedValue(definitions);
        crm.getLogs.mockResolvedValue([]);
        crm.getChanges.mockResolvedValue([]);
        crm.getDiscoveryData.mockResolvedValue(discovery);
        crm.upsertConnection.mockResolvedValue({});
        crm.triggerSync.mockResolvedValue({});
        crm.triggerDeltaSync.mockResolvedValue({});
    });

    it('renders empty disconnected state with safe defaults', async () => {
        await renderPage();
        expect(await screen.findByRole('heading', { name: 'crm.title' })).toBeInTheDocument();

        expect(screen.getByText('labels.passive')).toBeInTheDocument();
        expect(screen.getByText('crm.never_synced')).toBeInTheDocument();
        expect(screen.getByText('crm.ready')).toBeInTheDocument();
        expect(screen.getByText('crm.log_empty')).toBeInTheDocument();
        expect(screen.getByText('crm.change_history_empty')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'crm.sync_btn' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'crm.delta_sync_btn' })).toBeDisabled();
        expect(latestMappingProps.get('account')?.currentMapping).toEqual({});
        expect(latestMappingProps.get('contact')?.displaySettings).toEqual([]);
        expect(socket.on).not.toHaveBeenCalled();
    });

    it('loads and normalizes CRM data, logs, changes, discovery, and socket lifecycle', async () => {
        crm.getConnections.mockResolvedValue([connection]);
        crm.getLogs.mockResolvedValue(logs);
        crm.getChanges.mockResolvedValue(changes);
        crm.getDiscoveryData.mockResolvedValue(discovery);
        const { unmount } = await renderPage();

        expect(await screen.findByDisplayValue('tenant-1')).toBeInTheDocument();
        await waitFor(() => expect(crm.getLogs).toHaveBeenCalledWith('conn-1'));
        await waitFor(() => expect(screen.getAllByText('crm.error').length).toBeGreaterThanOrEqual(1));
        expect(screen.queryByText('Import failed')).not.toBeInTheDocument();
        expect(screen.getByText('labels.active')).toBeInTheDocument();
        expect(screen.getAllByText('crm.ready').length).toBeGreaterThan(0);
        expect(screen.getByText('ext-a')).toBeInTheDocument();
        expect(screen.getByText('old@test')).toBeInTheDocument();
        expect(latestMappingProps.get('account')?.currentMapping).toEqual({ name: 'accountname' });
        expect(latestMappingProps.get('account')?.displaySettings).toEqual([{ key: 'name', visible: true }, { key: 'hidden', visible: false }]);
        expect(latestMappingProps.get('contact')?.currentMapping).toEqual({});
        expect(latestMappingProps.get('contact')?.discoveryData).toEqual(discovery.contact);
        expect(socket.on).toHaveBeenCalledWith('crm:changes', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('crm:sync_error', expect.any(Function));
        expect(socket.connect).toHaveBeenCalledOnce();

        const initialChangeCalls = crm.getChanges.mock.calls.length;
        await act(async () => socketHandlers.get('crm:changes')?.({ connectionId: 'another-connection' }));
        expect(crm.getChanges).toHaveBeenCalledTimes(initialChangeCalls);
        await act(async () => socketHandlers.get('crm:changes')?.());
        expect(crm.getChanges).toHaveBeenLastCalledWith('conn-1', 50);
        expect(crm.getConnections.mock.calls.length).toBeGreaterThan(1);

        unmount();
        expect(socket.off).toHaveBeenCalledWith('crm:changes', expect.any(Function));
        expect(socket.off).toHaveBeenCalledWith('crm:sync_error', expect.any(Function));
    });

    it('updates non-secret form and mapping state while preserving masked secrets on save', async () => {
        const user = userEvent.setup();
        crm.getConnections.mockResolvedValueOnce([connection]).mockResolvedValue([]);
        await renderPage();
        expect(await screen.findByDisplayValue('tenant-1')).toBeInTheDocument();

        await user.clear(screen.getByLabelText('crm.tenant_id'));
        await user.type(screen.getByLabelText('crm.tenant_id'), 'tenant-new');
        await user.clear(screen.getByLabelText('crm.client_id'));
        await user.type(screen.getByLabelText('crm.client_id'), 'client-new');
        expect(screen.getByLabelText('crm.client_secret')).toHaveValue('********');
        expect(screen.getByLabelText('crm.webhook_api_key')).toHaveValue('********');
        await user.clear(screen.getByLabelText('crm.instance_url'));
        await user.type(screen.getByLabelText('crm.instance_url'), 'https://new.example.test');

        await user.click(screen.getByRole('button', { name: 'map-account' }));
        await user.click(screen.getByRole('button', { name: 'unmap-account' }));
        await user.click(screen.getByRole('button', { name: 'map-contact' }));
        await user.click(screen.getByRole('button', { name: 'display-contact' }));
        await user.click(screen.getByRole('button', { name: 'reset-contact' }));
        await user.click(screen.getByRole('button', { name: 'crm.save_and_verify' }));

        await waitFor(() => expect(crm.upsertConnection).toHaveBeenCalledOnce());
        expect(crm.upsertConnection).toHaveBeenCalledWith({
            provider: 'DYNAMICS_365',
            tenantId: 'tenant-new', clientId: 'client-new', clientSecret: '********', webhookSecret: '********',
            instanceUrl: 'https://new.example.test',
            syncSettings: {
                accountMapping: { name: 'accountname' },
                contactMapping: {},
                displaySettings: { account: [{ key: 'name', visible: true }, { key: 'hidden', visible: false }], contact: [{ key: 'custom', visible: false }] },
            },
        });
        expect(toast).toHaveBeenCalledWith({ title: '✅ success_title', description: 'toasts.bulk_update_success:1' });
    });

    it.each([
        { response: { data: { message: 'Invalid credential sk-live-super-secret for tenant tenant-sensitive at https://internal.crm.local' } } },
        new Error('connect ECONNREFUSED https://internal.crm.local?client_secret=super-secret'),
        42,
        { response: { data: { message: 12 } }, message: 9 },
    ])('uses a localized generic save error without disclosing failure details for %p', async (failure) => {
        const user = userEvent.setup();
        crm.getConnections.mockResolvedValue([connection]);
        crm.upsertConnection.mockRejectedValue(failure);
        await renderPage();
        await screen.findByDisplayValue('tenant-1');

        await user.click(screen.getByRole('button', { name: 'crm.save_and_verify' }));

        await waitFor(() => expect(toast).toHaveBeenCalledWith({ variant: 'destructive', title: '❌ crm.error', description: 'crm.error' }));
        expect(JSON.stringify(toast.mock.calls)).not.toMatch(/super-secret|tenant-sensitive|internal\.crm\.local|ECONNREFUSED/i);
        expect(screen.getByRole('button', { name: 'crm.save_and_verify' })).toBeEnabled();
    });

    it('allows a safe retry after a secret-bearing save failure', async () => {
        const user = userEvent.setup();
        crm.getConnections.mockResolvedValue([connection]);
        crm.upsertConnection
            .mockRejectedValueOnce(new Error('credential super-secret rejected for tenant-sensitive'))
            .mockResolvedValueOnce({});
        await renderPage();
        await screen.findByDisplayValue('tenant-1');

        const saveButton = screen.getByRole('button', { name: 'crm.save_and_verify' });
        await user.click(saveButton);
        await waitFor(() => expect(toast).toHaveBeenCalledWith({
            variant: 'destructive',
            title: '❌ crm.error',
            description: 'crm.error',
        }));
        expect(JSON.stringify(toast.mock.calls)).not.toContain('super-secret');

        await user.click(saveButton);

        await waitFor(() => expect(crm.upsertConnection).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(toast).toHaveBeenCalledWith({
            title: '✅ success_title',
            description: 'toasts.bulk_update_success:1',
        }));
        expect(saveButton).toBeEnabled();
    });

    it('triggers full and delta syncs, prevents duplicate actions, and recovers from failures', async () => {
        const user = userEvent.setup();
        const full = deferred<Record<string, never>>();
        const delta = deferred<Record<string, never>>();
        crm.getConnections.mockResolvedValue([connection]);
        crm.triggerSync.mockReturnValue(full.promise);
        crm.triggerDeltaSync.mockReturnValue(delta.promise);
        await renderPage();
        await screen.findByDisplayValue('tenant-1');

        const syncButton = screen.getByRole('button', { name: 'crm.sync_btn' });
        await user.click(syncButton);
        expect(crm.triggerSync).toHaveBeenCalledWith('conn-1');
        expect(syncButton).toBeDisabled();
        full.resolve({});
        await waitFor(() => expect(syncButton).toBeEnabled());
        expect(toast).toHaveBeenCalledWith({ title: '🔄 crm.sync_btn', description: 'toasts.sync_started' });

        const deltaButton = screen.getByRole('button', { name: 'crm.delta_sync_btn' });
        await user.click(deltaButton);
        expect(crm.triggerDeltaSync).toHaveBeenCalledWith('conn-1');
        expect(deltaButton).toBeDisabled();
        delta.resolve({});
        await waitFor(() => expect(deltaButton).toBeEnabled());
        expect(toast).toHaveBeenCalledWith({ title: '🔄 crm.delta_sync_btn', description: 'crm.delta_sync_started' });
        expect(crm.getChanges).toHaveBeenCalledWith('conn-1', 50);

        crm.triggerSync.mockRejectedValueOnce(new Error('sync failed with credential super-secret'));
        crm.triggerDeltaSync.mockRejectedValueOnce(new Error('delta failed for https://internal.crm.local/tenant-sensitive'));
        await user.click(syncButton);
        await waitFor(() => expect(syncButton).toBeEnabled());
        await user.click(deltaButton);
        await waitFor(() => expect(deltaButton).toBeEnabled());
        expect(toast).toHaveBeenCalledWith({ variant: 'destructive', title: '❌ crm.error', description: 'crm.error' });
        expect(JSON.stringify(toast.mock.calls)).not.toMatch(/super-secret|tenant-sensitive|internal\.crm\.local/i);
    });

    it('renders every status branch and expands failed sync details', async () => {
        const user = userEvent.setup();
        crm.getConnections.mockResolvedValue([{ ...connection, syncStatus: 'ERROR', lastSyncAt: null }]);
        crm.getLogs.mockResolvedValue(logs);
        crm.getChanges.mockResolvedValue(changes);
        await renderPage();

        expect((await screen.findAllByText('crm.error')).length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('crm.success')).toHaveLength(1);
        expect(screen.getAllByText('crm.error').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('crm.in_progress')).toHaveLength(1);
        expect(screen.getByText('crm.never_synced')).toBeInTheDocument();
        const details = screen.getByTestId('details-button');
        await user.click(details);
        expect(screen.getByText('external-7')).toBeInTheDocument();
        expect(screen.getAllByText('crm.error').length).toBeGreaterThanOrEqual(3);
        expect(screen.queryByText('Import failed')).not.toBeInTheDocument();
        expect(screen.queryByText('Bad row')).not.toBeInTheDocument();
        expect(screen.getByText('import.stats_error')).toBeInTheDocument();
        await user.click(details);
        expect(screen.queryByText('external-7')).not.toBeInTheDocument();

        const history = screen.getByText('crm.change_history_title').closest('div')?.parentElement?.parentElement as HTMLElement;
        expect(within(history).getByText('ext-c')).toBeInTheDocument();
        expect(within(history).getAllByText('-').length).toBeGreaterThanOrEqual(2);
    });

    it('tolerates auxiliary fetch failures and already-connected sockets', async () => {
        socket.connected = true;
        crm.getConnections.mockResolvedValue([connection]);
        crm.getLogs.mockRejectedValue(new Error('logs unavailable'));
        crm.getChanges.mockRejectedValue(new Error('changes unavailable'));
        crm.getDiscoveryData.mockRejectedValue(new Error('discovery unavailable'));
        await renderPage();

        expect(await screen.findByText('crm.log_empty')).toBeInTheDocument();
        expect(screen.getByText('crm.change_history_empty')).toBeInTheDocument();
        expect(latestMappingProps.get('account')?.discoveryData).toEqual([]);
        expect(socket.connect).not.toHaveBeenCalled();
    });

    it('shows a retryable load error and recovers after the CRM API becomes available', async () => {
        const user = userEvent.setup();
        crm.getConnections
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce([connection]);
        await renderPage();

        expect(await screen.findByRole('alert')).toHaveTextContent('backend_unavailable_title');
        expect(screen.getByRole('alert')).toHaveTextContent('backend_unavailable_desc');
        expect(screen.queryByRole('heading', { name: 'crm.title' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'retry' }));

        expect(await screen.findByDisplayValue('tenant-1')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(crm.getConnections).toHaveBeenCalledTimes(2);
    });
});
