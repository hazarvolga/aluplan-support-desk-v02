import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmailValidationPage from './page';

const mocks = vi.hoisted(() => ({
    listCustomers: vi.fn(),
    verify: vi.fn(),
    verifyBulk: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        customers: { list: mocks.listCustomers },
        emailValidator: { verify: mocks.verify, verifyBulk: mocks.verifyBulk },
    },
}));
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }));

const validResult = {
    email: 'ada@example.com',
    status: 'VALID',
    score: 92,
    summary: { score: 92 },
    syntax: { isRoleBased: false, isValid: true, suggestion: 'ada@example.com' },
    dns: { isCatchAll: false, isDisposable: false, mxRecords: ['mx.example.com'], isValid: true },
    smtp: { canConnect: true, isValid: true, isGreyListed: false },
};

const riskyResult = {
    email: 'grace@example.com',
    status: 'RISKY',
    score: 55,
    summary: { score: 55 },
    syntax: { isRoleBased: true, isValid: true },
    dns: { isCatchAll: true, isDisposable: false, mxRecords: [], isValid: true },
    smtp: { canConnect: false, error: 'greylisted', isValid: false, isGreyListed: true },
};

const customers = [
    {
        id: 'customer-1', email: 'ada@example.com', fullName: 'Ada Lovelace', status: 'ACTIVE', createdAt: '2026-10-10',
        customerProfile: { customerNo: 'C-1', companyName: 'Alpha', industry: 'Architecture', tags: ['VIP'], account: { id: 'a-1', name: 'Alpha' } },
    },
    {
        id: 'customer-2', email: 'grace@example.com', fullName: 'Grace Hopper', status: 'ACTIVE', createdAt: '2026-10-09',
        customerProfile: { customerNo: 'C-2', companyName: 'Beta', industry: 'Engineering', tags: ['Lead'] },
    },
];

describe('EmailValidationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.listCustomers.mockResolvedValue({ data: customers });
        mocks.verify.mockResolvedValue(validResult);
        mocks.verifyBulk.mockResolvedValue([validResult, riskyResult]);
    });

    it('validates one address and renders the detailed result', async () => {
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        const input = screen.getByPlaceholderText('single.placeholder');
        await user.type(input, 'ada@example.com');
        await user.click(screen.getByRole('button', { name: 'single.button' }));

        await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith('ada@example.com'));
        expect(screen.getAllByText('92').length).toBeGreaterThan(0);
    });

    it('reports single-address failures without losing the form', async () => {
        mocks.verify.mockRejectedValueOnce(new Error('validator down'));
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        await user.type(screen.getByPlaceholderText('single.placeholder'), 'ada@example.com');
        await user.click(screen.getByRole('button', { name: 'single.button' }));

        await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('validator down'));
        expect(screen.getByPlaceholderText('single.placeholder')).toHaveValue('ada@example.com');
    });

    it('loads customers, selects rows, bulk verifies and opens a result detail', async () => {
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        await user.click(screen.getByRole('tab', { name: 'tabs.bulk' }));
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

        const adaRow = screen.getByText('Ada Lovelace').closest('tr') as HTMLElement;
        fireEvent.click(within(adaRow).getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: 'bulk.verify_selected' }));
        await waitFor(() => expect(mocks.verifyBulk).toHaveBeenCalledWith(['ada@example.com']));

        await user.click(within(adaRow).getByRole('button', { name: /Ada Lovelace/ }));
        expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    it('searches, sorts and validates all visible customers', async () => {
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        await user.click(screen.getByRole('tab', { name: 'tabs.bulk' }));
        await screen.findByText('Ada Lovelace');

        const search = screen.getByPlaceholderText('search.customer_search');
        await user.type(search, 'Beta');
        expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
        expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
        fireEvent.click(screen.getByText('table.email'));
        fireEvent.click(screen.getByText('table.email'));
        fireEvent.click(screen.getByText('table.group_score'));

        await user.click(screen.getByRole('button', { name: 'bulk.verify_all' }));
        await waitFor(() => expect(mocks.verifyBulk).toHaveBeenCalledWith(['grace@example.com']));
        expect(mocks.success).toHaveBeenCalled();
    });

    it('fails soft when the customer list cannot load', async () => {
        mocks.listCustomers.mockRejectedValueOnce(new Error('list down'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        await user.click(screen.getByRole('tab', { name: 'tabs.bulk' }));
        await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
        expect(screen.getByText('empty.no_results')).toBeInTheDocument();
        consoleSpy.mockRestore();
    });

    it('surfaces bulk-validator failures after a real selection', async () => {
        mocks.verifyBulk.mockRejectedValueOnce(new Error('bulk down'));
        const user = userEvent.setup();
        render(<EmailValidationPage />);
        await user.click(screen.getByRole('tab', { name: 'tabs.bulk' }));
        const adaRow = (await screen.findByText('Ada Lovelace')).closest('tr') as HTMLElement;
        fireEvent.click(within(adaRow).getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: 'bulk.verify_selected' }));
        await waitFor(() => expect(mocks.verifyBulk).toHaveBeenCalledWith(['ada@example.com']));
        expect(mocks.error).toHaveBeenCalledWith('bulk down');
    });
});
