import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDialog } from './user-dialog';

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), create: vi.fn(), update: vi.fn(), toast: vi.fn() }));
const selectHarness = vi.hoisted(() => ({ change: (_value: string): void => undefined }));

vi.mock('@/lib/api', () => ({
    api: { users: { lookup: mocks.lookup, create: mocks.create, update: mocks.update } },
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => open ? <div>{children}</div> : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange: (value: string) => void; value: string }) => {
        selectHarness.change = onValueChange;
        return <div role="listbox" data-value={value}>{children}</div>;
    },
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <button type="button" role="option" data-value={value} onClick={() => selectHarness.change(value)}>{children}</button>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));

const existing = {
    id: 'user-1', email: 'existing@example.com', fullName: 'Existing User', role: { name: 'customer' },
    roles: [{ role: { name: 'support_manager' } }],
};

describe('UserDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.lookup.mockResolvedValue(null);
        mocks.create.mockResolvedValue(existing);
        mocks.update.mockResolvedValue(existing);
    });
    afterEach(() => vi.useRealTimers());

    it('creates a new user with the selected allowed role and closes successfully', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const onOpenChange = vi.fn();
        render(<UserDialog open onOpenChange={onOpenChange} onSuccess={onSuccess} />);
        await user.type(screen.getByPlaceholderText('dialog.email_placeholder'), 'new@example.com');
        await user.type(screen.getByPlaceholderText('dialog.name_placeholder'), 'New User');
        await user.type(screen.getByPlaceholderText('dialog.password_placeholder'), 'secret1');
        expect(screen.getAllByRole('option').map(option => option.getAttribute('data-value'))).toEqual([
            'admin', 'support_manager', 'support_agent', 'viewer',
        ]);
        expect(screen.queryByRole('option', { name: /super.?admin/i })).not.toBeInTheDocument();
        await user.click(screen.getByRole('option', { name: 'dialog.roles.support_manager' }));
        await user.click(screen.getByRole('button', { name: 'dialog.btn_create' }));
        await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({
            fullName: 'New User', email: 'new@example.com', roles: ['support_manager'], password: 'secret1',
        }));
        expect(onSuccess).toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('requires a password for a genuinely new account', async () => {
        const user = userEvent.setup();
        render(<UserDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />);
        await user.type(screen.getByPlaceholderText('dialog.email_placeholder'), 'new@example.com');
        await user.type(screen.getByPlaceholderText('dialog.name_placeholder'), 'New User');
        await user.click(screen.getByRole('button', { name: 'dialog.btn_create' }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: 'validation.password_required', variant: 'destructive' }));
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it('looks up and upgrades an existing account without requiring a password', async () => {
        vi.useFakeTimers();
        mocks.lookup.mockResolvedValue(existing);
        render(<UserDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />);
        fireEvent.change(screen.getByPlaceholderText('dialog.email_placeholder'), { target: { value: 'existing@example.com' } });
        await act(async () => { await vi.advanceTimersByTimeAsync(800); });
        expect(screen.getByText('Mevcut Kullanıcı Bulundu')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('dialog.name_placeholder')).toHaveValue('Existing User');
        fireEvent.click(screen.getByRole('button', { name: 'Güncelle ve Rütbe Ver' }));
        await act(async () => { await Promise.resolve(); });
        expect(mocks.update).toHaveBeenCalledWith('user-1', expect.objectContaining({ email: 'existing@example.com' }));
    });

    it('updates edit-mode users with only the selected allowed role and accepts the alternate userRoles shape', async () => {
        const user = userEvent.setup();
        const editUser = { ...existing, roles: undefined, userRoles: [{ role: { name: 'admin' } }] };
        render(<UserDialog open user={editUser as never} onOpenChange={vi.fn()} onSuccess={vi.fn()} />);
        expect(screen.getByPlaceholderText('dialog.email_placeholder')).toBeDisabled();
        await user.clear(screen.getByPlaceholderText('dialog.name_placeholder'));
        await user.type(screen.getByPlaceholderText('dialog.name_placeholder'), 'Edited User');
        await user.click(screen.getByRole('option', { name: 'dialog.roles.viewer' }));
        await user.click(screen.getByRole('button', { name: 'dialog.btn_update' }));
        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith('user-1', {
            fullName: 'Edited User', email: 'existing@example.com', roles: ['viewer'],
        }));
        expect(mocks.lookup).not.toHaveBeenCalled();
    });

    it('fails closed without silently demoting an unsupported persisted role', async () => {
        const user = userEvent.setup();
        const editUser = { ...existing, roles: [{ role: { name: 'super_admin' } }] };
        render(<UserDialog open user={editUser as never} onOpenChange={vi.fn()} onSuccess={vi.fn()} />);

        expect(screen.getByText(/super_admin/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'dialog.btn_update' })).toBeDisabled();
        await user.click(screen.getByRole('button', { name: 'dialog.btn_update' }));

        expect(mocks.update).not.toHaveBeenCalled();
    });

    it('fails soft on lookup and surfaces persistence errors', async () => {
        vi.useFakeTimers();
        mocks.lookup.mockRejectedValueOnce(new Error('lookup down'));
        mocks.create.mockRejectedValueOnce(new Error('provider token=secret-value'));
        render(<UserDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />);
        fireEvent.change(screen.getByPlaceholderText('dialog.email_placeholder'), { target: { value: 'new@example.com' } });
        await act(async () => { await vi.advanceTimersByTimeAsync(800); });
        fireEvent.change(screen.getByPlaceholderText('dialog.name_placeholder'), { target: { value: 'New User' } });
        fireEvent.change(screen.getByPlaceholderText('dialog.password_placeholder'), { target: { value: 'secret1' } });
        fireEvent.click(screen.getByRole('button', { name: 'dialog.btn_create' }));
        await act(async () => { await Promise.resolve(); });
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'error_title', description: 'error', variant: 'destructive' });
        expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ description: expect.stringContaining('secret-value') }));
    });
});
