import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomersPage from './page';

const toast = vi.hoisted(() => vi.fn());
const apiMocks = vi.hoisted(() => ({
    listCustomers: vi.fn(),
    bulkDeleteCustomers: vi.fn(),
    getAccounts: vi.fn(),
    bulkDeleteAccounts: vi.fn(),
    getConnections: vi.fn(),
    getLogs: vi.fn(),
    triggerSync: vi.fn(),
    verifyBulk: vi.fn(),
    createSession: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        customers: {
            list: apiMocks.listCustomers,
            bulkDelete: apiMocks.bulkDeleteCustomers,
        },
        crm: {
            getAccounts: apiMocks.getAccounts,
            bulkDeleteAccounts: apiMocks.bulkDeleteAccounts,
            getConnections: apiMocks.getConnections,
            getLogs: apiMocks.getLogs,
            triggerSync: apiMocks.triggerSync,
        },
        emailValidator: { verifyBulk: apiMocks.verifyBulk },
        proactiveChat: { createSession: apiMocks.createSession },
    },
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: () => ({ user: { id: 'staff-1', role: 'ADMIN' } }),
}));
vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));
vi.mock('@/components/proactive-chat/ProactiveChatPendingBadge', () => ({
    ProactiveChatPendingBadge: ({ sessionId, onAccepted }: { sessionId: string; onAccepted: (sessionId: string) => void }) => (
        <button type="button" onClick={() => onAccepted(sessionId)}>pending-{sessionId}</button>
    ),
}));
vi.mock('@/components/proactive-chat/ProactiveChatWindow', () => ({
    ProactiveChatWindow: ({ sessionId, onClose }: { sessionId: string; onClose: () => void }) => (
        <button type="button" onClick={onClose}>active-{sessionId}</button>
    ),
}));
vi.mock('@/components/proactive-chat/ActiveSessionsPanel', () => ({
    ActiveSessionsPanel: () => <div>active-sessions-panel</div>,
}));
vi.mock('@/components/shared/confirm-modal', () => ({
    ConfirmModal: ({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) => (
        isOpen ? <button type="button" onClick={onConfirm}>confirm-delete</button> : null
    ),
}));
vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (value: string) => void }) => (
        <div>
            <button type="button" onClick={() => onValueChange?.('accounts')}>activate-accounts</button>
            <button type="button" onClick={() => onValueChange?.('list')}>activate-list</button>
            {children}
        </div>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => <button type="button">{value}-{children}</button>,
    TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => <section data-tab={value}>{children}</section>,
}));
vi.mock('./components/DataTableHeader', () => ({
    DataTableHeader: ({
        columnKey,
        onSort,
        onGroupBy,
        onFilterChange,
    }: {
        columnKey: string;
        onSort: (key: string, order: 'asc' | 'desc') => void;
        onGroupBy: (key: string | null) => void;
        onFilterChange: (key: string, value: string) => void;
    }) => (
        <th>
            <button type="button" onClick={() => onSort(columnKey, 'asc')}>sort-{columnKey}</button>
            <button type="button" onClick={() => onGroupBy(columnKey)}>group-{columnKey}</button>
            <button type="button" onClick={() => onFilterChange(columnKey, columnKey === 'fullName' ? 'Ada' : 'match')}>filter-{columnKey}</button>
        </th>
    ),
}));

const customers = [
    {
        id: 'customer-1',
        email: 'ada@example.com',
        fullName: 'Ada Lovelace',
        status: 'ACTIVE',
        createdAt: '2026-10-10T10:00:00.000Z',
        customerProfile: {
            isVip: true,
            customerNo: 'C-1',
            companyName: 'Match Company',
            firstName: 'Ada',
            lastName: 'Lovelace',
            jobTitle: 'Engineer',
            contractStatus: 'ACTIVE',
            subscriptionModel: 'SUBSCRIPTION',
            industry: 'Architecture',
            phoneNumber: '+90 555 000 0001',
            crmVerified: true,
            account: { id: 'account-1', name: 'Match Company', account_number: 'A-1' },
        },
    },
    {
        id: 'customer-2',
        email: 'grace@example.com',
        fullName: 'Grace Hopper',
        status: 'PASSIVE',
        createdAt: '2026-10-09T10:00:00.000Z',
        customerProfile: {
            customerNo: 'C-2',
            companyName: '',
            firstName: 'Grace',
            lastName: 'Hopper',
            phoneNumber: null,
        },
    },
];

const accounts = [
    {
        id: 'account-1',
        name: 'Match Company',
        industry: 'Architecture',
        website: 'https://example.com/',
        address: 'Istanbul',
        accountNumber: 'A-1',
        crmVerified: true,
        _count: { customers: 2 },
    },
    {
        id: 'account-2',
        name: 'Other Company',
        website: 'other.example.com',
        customers: [],
    },
    { id: '', name: '' },
];

const connection = {
    id: 'connection-1',
    provider: 'DYNAMICS365',
    instanceUrl: 'https://tenant.crm.dynamics.com',
    isActive: true,
    syncStatus: 'IDLE',
    lastSyncAt: '2026-10-10T10:00:00.000Z',
    syncSettings: {
        displaySettings: {
            contact: [
                { key: 'fullName', visible: true },
                { key: 'email', label: 'Custom email', visible: true },
                { key: 'hidden', visible: false },
                null,
            ],
            account: [
                { key: 'name', visible: true },
                { key: 'website', visible: true },
            ],
        },
    },
};

describe('CustomersPage', () => {
    const renderPage = async () => {
        await act(async () => {
            render(<CustomersPage params={Promise.resolve({ locale: 'tr' })} />);
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.listCustomers.mockResolvedValue({ data: customers, total: 202, page: 1, totalPages: 3 });
        apiMocks.getAccounts.mockResolvedValue(accounts);
        apiMocks.getConnections.mockResolvedValue([connection]);
        apiMocks.getLogs.mockResolvedValue([{
            id: 'log-1',
            startedAt: '2026-10-10T10:00:00.000Z',
            status: 'COMPLETED',
            totalRecords: 4,
            successCount: 3,
            errorCount: 1,
            errorMessage: null,
        }]);
        apiMocks.bulkDeleteCustomers.mockResolvedValue(undefined);
        apiMocks.bulkDeleteAccounts.mockResolvedValue(undefined);
        apiMocks.triggerSync.mockResolvedValue(undefined);
        apiMocks.verifyBulk.mockResolvedValue([
            { email: 'ada@example.com', status: 'VALID', score: 99 },
            { email: 'grace@example.com', status: 'RISKY', score: 61 },
        ]);
        apiMocks.createSession.mockResolvedValue({ id: 'chat-1' });
    });

    it('loads, normalizes and renders customers, accounts, CRM state and history', async () => {
        await renderPage();

        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
        expect(screen.getAllByText('Match Company').length).toBeGreaterThan(0);
        expect(screen.getByText('DYNAMICS365')).toBeInTheDocument();
        expect(screen.getByText('active-sessions-panel')).toBeInTheDocument();
        expect(apiMocks.listCustomers).toHaveBeenCalledWith({ page: 1, limit: 100, search: undefined });
        expect(apiMocks.getLogs).toHaveBeenCalledWith('connection-1');
    });

    it('filters, groups, sorts, selects and verifies customer rows', async () => {
        const user = userEvent.setup();
        await renderPage();
        await screen.findByText('Ada Lovelace');

        await user.click(screen.getByRole('button', { name: 'sort-fullName' }));
        await user.click(screen.getByRole('button', { name: 'group-fullName' }));
        expect(screen.getByText('GENERAL')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'filter-fullName' }));
        expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();

        const customerRow = screen.getByText('Ada Lovelace').closest('tr') as HTMLElement;
        fireEvent.click(within(customerRow).getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /actions.verify_selected/ }));

        await waitFor(() => expect(apiMocks.verifyBulk).toHaveBeenCalledWith(['ada@example.com']));
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('success_title') }));
    });

    it('deletes selected customers and accounts through confirmation', async () => {
        const user = userEvent.setup();
        await renderPage();
        await screen.findByText('Ada Lovelace');

        const customerRow = screen.getByText('Ada Lovelace').closest('tr') as HTMLElement;
        fireEvent.click(within(customerRow).getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /actions.delete_selected/ }));
        await user.click(screen.getByRole('button', { name: 'confirm-delete' }));
        await waitFor(() => expect(apiMocks.bulkDeleteCustomers).toHaveBeenCalledWith(['customer-1']));

        await user.click(screen.getByRole('button', { name: 'activate-accounts' }));
        const accountRow = screen.getAllByText('Match Company').find(element => element.closest('tr')?.querySelector('input[type="checkbox"]'))?.closest('tr') as HTMLElement;
        fireEvent.click(within(accountRow).getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /actions.delete_selected/ }));
        await user.click(screen.getByRole('button', { name: 'confirm-delete' }));
        await waitFor(() => expect(apiMocks.bulkDeleteAccounts).toHaveBeenCalled());
    });

    it('starts a CRM sync and proactive chat, then transitions the chat window', async () => {
        const user = userEvent.setup();
        await renderPage();
        await screen.findByText('Ada Lovelace');

        await user.click(screen.getByRole('button', { name: 'sync.trigger_sync' }));
        await waitFor(() => expect(apiMocks.triggerSync).toHaveBeenCalledWith('connection-1'));

        const customerRow = screen.getByText('Ada Lovelace').closest('tr') as HTMLElement;
        await user.click(within(customerRow).getByRole('button'));
        await waitFor(() => expect(apiMocks.createSession).toHaveBeenCalledWith('customer-1'));
        await user.click(screen.getByRole('button', { name: 'pending-chat-1' }));
        await user.click(screen.getByRole('button', { name: 'active-chat-1' }));
        expect(screen.queryByRole('button', { name: 'active-chat-1' })).not.toBeInTheDocument();
    });

    it('keeps the page usable and reports mutation failures', async () => {
        apiMocks.triggerSync.mockRejectedValueOnce(new Error('sync unavailable'));
        apiMocks.createSession.mockRejectedValueOnce('chat unavailable');
        apiMocks.verifyBulk.mockRejectedValueOnce(new Error('validator unavailable'));
        const user = userEvent.setup();
        await renderPage();
        await screen.findByText('Ada Lovelace');

        await user.click(screen.getByRole('button', { name: 'sync.trigger_sync' }));
        const customerRow = screen.getByText('Ada Lovelace').closest('tr') as HTMLElement;
        await user.click(within(customerRow).getByRole('button'));
        await user.click(screen.getByRole('button', { name: 'actions.verify_emails' }));

        await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
});
