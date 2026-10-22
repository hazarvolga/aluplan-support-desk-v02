import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerProfilePage from './page';

const mocks = vi.hoisted(() => ({
    getById: vi.fn(), update: vi.fn(), resetPassword: vi.fn(), downloadHotinfo: vi.fn(),
    toast: vi.fn(), push: vi.fn(), createObjectURL: vi.fn(), click: vi.fn(), confirm: vi.fn(),
    router: { push: vi.fn() },
}));
vi.mock('@/lib/api', () => ({ api: { customers: {
    getById: mocks.getById, update: mocks.update, resetPassword: mocks.resetPassword, downloadHotinfo: mocks.downloadHotinfo,
} } }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'customer-1', locale: 'tr' }), useRouter: () => mocks.router }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/ui/hotinfo-grid', () => ({ HotinfoGrid: ({ data }: { data: Record<string, unknown> }) => <div>hotinfo:{String(data.version)}</div> }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

const customer = {
    fullName: 'Ada Lovelace', email: 'ada@example.com', hasRealEmail: true, status: 'ACTIVE', createdAt: '2026-10-10T10:00:00.000Z',
    customerProfile: {
        firstName: 'Ada', lastName: 'Lovelace', companyName: 'Analytical Engines', jobTitle: 'Engineer', phoneNumber: '+90555',
        contractStatus: 'ACTIVE', customerNo: 'LOCAL-1', isVip: false, subscriptionModel: 'SUBSCRIPTION', fax: '123', mobilePhone: '456',
        primaryTimeZone: 'Europe/Istanbul', preferredContactMethod: 'EMAIL', address: 'Istanbul', hotinfoData: { version: '2026' },
        account: { id: 'account-1', name: 'CRM Company', account_number: 'CRM-42', website: 'https://example.com', address: 'CRM address' },
    },
};

describe('CustomerProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.router.push = mocks.push;
        mocks.getById.mockResolvedValue(customer);
        mocks.update.mockRejectedValue(new Error('Postgres connection string: postgres://private-host'));
        mocks.resetPassword.mockResolvedValue(undefined);
        mocks.downloadHotinfo.mockResolvedValue({ blob: new Blob(['hotinfo']), filename: 'ada.hxl' });
        mocks.createObjectURL.mockReturnValue('blob:hotinfo');
        Object.defineProperty(window.URL, 'createObjectURL', { configurable: true, value: mocks.createObjectURL });
        vi.stubGlobal('confirm', mocks.confirm);
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(mocks.click);
    });

    it('loads complete CRM details, preserves authoritative account number and renders Hotinfo', async () => {
        render(<CustomerProfilePage />);
        expect(screen.getByText('loading')).toBeInTheDocument();
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getAllByText('ada@example.com').length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: 'CRM Company' })).toHaveAttribute('href', '/customers/accounts/account-1');
        expect(screen.getByDisplayValue('CRM-42')).toBeDisabled();
        expect(screen.getByText('hotinfo:2026')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /example.com/ })).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('edits mutable fields and reports a localized error without exposing server details', async () => {
        render(<CustomerProfilePage />);
        await screen.findByText('Ada Lovelace');
        const firstName = screen.getAllByDisplayValue('Ada')[0];
        fireEvent.change(firstName, { target: { value: 'Grace' } });
        fireEvent.change(screen.getByDisplayValue('Lovelace'), { target: { value: 'Hopper' } });
        fireEvent.change(screen.getByDisplayValue('Engineer'), { target: { value: 'Admiral' } });
        fireEvent.change(screen.getByDisplayValue('+90555'), { target: { value: '+90444' } });
        fireEvent.change(screen.getByDisplayValue('Analytical Engines'), { target: { value: 'Navy' } });
        fireEvent.change(screen.getByDisplayValue('ACTIVE'), { target: { value: 'PAUSED' } });
        fireEvent.click(screen.getByRole('switch'));
        fireEvent.submit(screen.getByRole('button', { name: /labels.save_all/ }).closest('form')!);

        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith('customer-1', expect.objectContaining({
            firstName: 'Grace', lastName: 'Hopper', jobTitle: 'Admiral', phoneNumber: '+90444', companyName: 'Navy', contractStatus: 'PAUSED', isVip: true,
        })));
        expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', description: 'toasts.update_error' }));
        expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ description: expect.stringContaining('postgres://private-host') }));
        expect(screen.queryByText(/postgres:\/\/private-host/)).not.toBeInTheDocument();
    });

    it('requires confirmation before password reset and reports success and failure', async () => {
        mocks.confirm.mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(true);
        render(<CustomerProfilePage />);
        await screen.findByText('Ada Lovelace');
        const button = screen.getByRole('button', { name: 'labels.reset_password' });
        fireEvent.click(button);
        expect(mocks.resetPassword).not.toHaveBeenCalled();
        fireEvent.click(button);
        await waitFor(() => expect(mocks.resetPassword).toHaveBeenCalledWith('customer-1'));
        expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: expect.stringContaining('ada@example.com') }));
        mocks.resetPassword.mockRejectedValueOnce(new Error('SMTP provider token=secret-value'));
        fireEvent.click(button);
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', description: 'toasts.password_reset_error' })));
        expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ description: expect.stringContaining('secret-value') }));
    });

    it('downloads Hotinfo using the server filename and reports download failures', async () => {
        render(<CustomerProfilePage />);
        await screen.findByText('Ada Lovelace');
        const button = screen.getByRole('button', { name: /labels.download_hxl/ });
        fireEvent.click(button);
        await waitFor(() => expect(mocks.downloadHotinfo).toHaveBeenCalledWith('customer-1'));
        expect(mocks.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(mocks.click).toHaveBeenCalled();

        mocks.downloadHotinfo.mockRejectedValueOnce(new Error('failed'));
        fireEvent.click(button);
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', description: 'toasts.download_error' })));
    });

    it('redirects and shows a destructive toast when the customer cannot be loaded', async () => {
        mocks.getById.mockRejectedValueOnce(new Error('not found'));
        render(<CustomerProfilePage />);
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/customers'));
        expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', description: 'accounts.not_found' }));
        expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });

    it('renders safe fallbacks when optional profile, email and account data are absent', async () => {
        mocks.getById.mockResolvedValueOnce({ fullName: 'Unknown', hasRealEmail: false, status: 'PASSIVE', createdAt: '2026-10-10T10:00:00.000Z' });
        render(<CustomerProfilePage />);
        expect(await screen.findByText('Unknown')).toBeInTheDocument();
        expect(screen.getAllByText('labels.email_missing').length).toBeGreaterThan(0);
        expect(screen.getByText('labels.passive')).toBeInTheDocument();
        expect(screen.queryByText('accounts.crm_account_details')).not.toBeInTheDocument();
        expect(screen.queryByText('hotinfo:2026')).not.toBeInTheDocument();
    });
});
