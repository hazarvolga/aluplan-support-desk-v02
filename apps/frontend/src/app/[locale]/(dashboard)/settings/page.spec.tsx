import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './page';

const mocks = vi.hoisted(() => ({
    settingsList: vi.fn(),
    settingsUpsert: vi.fn(),
    macrosList: vi.fn(),
    macrosCreate: vi.fn(),
    macrosDelete: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        settings: { list: mocks.settingsList, upsert: mocks.settingsUpsert },
        macros: { list: mocks.macrosList, create: mocks.macrosCreate, delete: mocks.macrosDelete },
    },
}));

vi.mock('sonner', () => ({
    toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

vi.mock('./components/EmailTemplates', () => ({ EmailTemplates: () => <div>email-templates</div> }));
vi.mock('./components/AiSettings', () => ({ AiSettings: () => <div>ai-settings</div> }));
vi.mock('./components/StorageSettings', () => ({ StorageSettings: () => <div>storage-settings</div> }));
vi.mock('./components/CrmSettings', () => ({ CrmSettings: () => <div>crm-settings</div> }));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <button type="button" data-tab-trigger={value}>{children}</button>
    ),
    TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <section data-tab-content={value}>{children}</section>
    ),
}));

const settings = [
    { key: 'email.smtp.host', value: 'smtp.example.com' },
    { key: 'email.smtp.port', value: '587' },
    { key: 'email.smtp.user', value: 'smtp-user' },
    { key: 'email.imap.host', value: 'imap.example.com' },
    { key: 'email.imap.user', value: 'imap-user' },
];

const macro = { id: 'macro-1', name: 'Welcome', content: 'Hello customer' };

describe('SettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.settingsList.mockResolvedValue(settings);
        mocks.settingsUpsert.mockResolvedValue(undefined);
        mocks.macrosList.mockResolvedValue([macro]);
        mocks.macrosCreate.mockResolvedValue({ id: 'macro-2', name: 'Closing', content: 'Kind regards' });
        mocks.macrosDelete.mockResolvedValue(undefined);
    });

    it('loads settings and macros, populates forms, and renders delegated panels', async () => {
        render(<SettingsPage />);

        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
        expect(await screen.findByDisplayValue('smtp.example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('587')).toBeInTheDocument();
        expect(screen.getByDisplayValue('smtp-user')).toBeInTheDocument();
        expect(screen.getByDisplayValue('imap.example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('imap-user')).toBeInTheDocument();
        expect(screen.getByText('Welcome')).toBeInTheDocument();
        expect(screen.getByText('email-templates')).toBeInTheDocument();
        expect(screen.getByText('ai-settings')).toBeInTheDocument();
        expect(screen.getByText('storage-settings')).toBeInTheDocument();
        expect(screen.getByText('crm-settings')).toBeInTheDocument();
        expect(mocks.settingsList).toHaveBeenCalledWith();
        expect(mocks.macrosList).toHaveBeenCalledTimes(1);
    });

    it('reports load failures using the backend message and leaves empty editable forms', async () => {
        mocks.settingsList.mockRejectedValueOnce(new Error('settings unavailable'));
        render(<SettingsPage />);

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith(
            'toasts.load_error',
        ));
        expect(screen.getByLabelText('email_forms.host', { selector: '#smtp-host' })).toHaveValue('');
        expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
    });

    it('saves SMTP public fields and a new secret, then masks the accepted secret', async () => {
        render(<SettingsPage />);
        const smtpHost = await screen.findByDisplayValue('smtp.example.com');
        fireEvent.change(smtpHost, { target: { value: 'smtp.new.example' } });
        fireEvent.change(screen.getByLabelText('email_forms.port'), { target: { value: '465' } });
        fireEvent.change(screen.getAllByLabelText('email_forms.user')[0], { target: { value: 'new-smtp-user' } });
        fireEvent.change(screen.getByLabelText('email_forms.pass', { selector: '#smtp-pass' }), { target: { value: 'new-secret' } });

        fireEvent.click(screen.getAllByRole('button', { name: 'email_forms.save' })[0]);

        await waitFor(() => expect(mocks.settingsUpsert).toHaveBeenCalledTimes(4));
        expect(mocks.settingsUpsert).toHaveBeenCalledWith({ key: 'email.smtp.host', value: 'smtp.new.example', isSecret: false });
        expect(mocks.settingsUpsert).toHaveBeenCalledWith({ key: 'email.smtp.port', value: '465', isSecret: false });
        expect(mocks.settingsUpsert).toHaveBeenCalledWith({ key: 'email.smtp.user', value: 'new-smtp-user', isSecret: false });
        expect(mocks.settingsUpsert).toHaveBeenCalledWith({ key: 'email.smtp.pass', value: 'new-secret', isSecret: true });
        await waitFor(() => expect(screen.getByLabelText('email_forms.pass', { selector: '#smtp-pass' })).toHaveValue('********'));
        expect(mocks.toastSuccess).toHaveBeenCalledWith('toasts.save_success');
    });

    it('does not overwrite stored SMTP credentials when the secret field is blank or masked', async () => {
        render(<SettingsPage />);
        await screen.findByDisplayValue('smtp.example.com');
        const save = screen.getAllByRole('button', { name: 'email_forms.save' })[0];

        fireEvent.click(save);
        await waitFor(() => expect(mocks.settingsUpsert).toHaveBeenCalledTimes(3));
        expect(mocks.settingsUpsert).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'email.smtp.pass' }));

        mocks.settingsUpsert.mockClear();
        fireEvent.change(screen.getByLabelText('email_forms.pass', { selector: '#smtp-pass' }), { target: { value: '********' } });
        fireEvent.click(save);
        await waitFor(() => expect(mocks.settingsUpsert).toHaveBeenCalledTimes(3));
        expect(mocks.settingsUpsert).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'email.smtp.pass' }));
    });

    it('keeps a rejected IMAP secret visible for retry and reports the error', async () => {
        mocks.settingsUpsert.mockImplementation(({ key }: { key: string }) => (
            key === 'email.imap.pass' ? Promise.reject(new Error('secret rejected')) : Promise.resolve()
        ));
        render(<SettingsPage />);
        const imapHost = await screen.findByDisplayValue('imap.example.com');
        fireEvent.change(imapHost, { target: { value: 'imap.new.example' } });
        fireEvent.change(screen.getAllByLabelText('email_forms.user')[1], { target: { value: 'new-imap-user' } });
        const secret = screen.getByLabelText('email_forms.pass', { selector: '#imap-pass' });
        fireEvent.change(secret, { target: { value: 'retry-secret' } });
        fireEvent.click(screen.getAllByRole('button', { name: 'email_forms.save' })[1]);

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.save_error'));
        expect(secret).toHaveValue('retry-secret');
    });

    it('uses empty defaults when optional email settings are absent', async () => {
        mocks.settingsList.mockResolvedValueOnce([]);
        mocks.macrosList.mockResolvedValueOnce([]);
        render(<SettingsPage />);

        await waitFor(() => expect(mocks.settingsList).toHaveBeenCalledTimes(1));
        expect(screen.getByLabelText('email_forms.host', { selector: '#smtp-host' })).toHaveValue('');
        expect(screen.getByLabelText('email_forms.port')).toHaveValue('');
        expect(screen.getAllByLabelText('email_forms.user')[0]).toHaveValue('');
        expect(screen.getByLabelText('email_forms.host', { selector: '#imap-host' })).toHaveValue('');
        expect(screen.getAllByLabelText('email_forms.user')[1]).toHaveValue('');
    });

    it('creates a valid macro, clears the editor, and appends the returned record', async () => {
        render(<SettingsPage />);
        const name = await screen.findByLabelText('macros.header_label');
        const content = screen.getByLabelText('macros.content_label');
        const add = screen.getByRole('button', { name: /macros.add/ });
        expect(add).toBeDisabled();

        fireEvent.change(name, { target: { value: 'Closing' } });
        fireEvent.change(content, { target: { value: 'Kind regards' } });
        fireEvent.click(add);

        await waitFor(() => expect(mocks.macrosCreate).toHaveBeenCalledWith({ name: 'Closing', content: 'Kind regards' }));
        expect(await screen.findByText('Closing')).toBeInTheDocument();
        expect(name).toHaveValue('');
        expect(content).toHaveValue('');
        expect(mocks.toastSuccess).toHaveBeenCalledWith('macros.create_success');
    });

    it('reports macro creation failure without clearing entered content', async () => {
        mocks.macrosCreate.mockRejectedValueOnce(new Error('macro unavailable'));
        render(<SettingsPage />);
        const name = await screen.findByLabelText('macros.header_label');
        const content = screen.getByLabelText('macros.content_label');
        fireEvent.change(name, { target: { value: 'Retry' } });
        fireEvent.change(content, { target: { value: 'Please retry' } });
        fireEvent.click(screen.getByRole('button', { name: /macros.add/ }));

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.save_error'));
        expect(name).toHaveValue('Retry');
        expect(content).toHaveValue('Please retry');
    });

    it('keeps macro actions visible for keyboard focus and gives delete a visible focus ring', async () => {
        render(<SettingsPage />);

        await screen.findByText('Welcome');
        const deleteButton = screen.getByRole('button', { name: 'delete Welcome' });
        const actionWrapper = deleteButton.parentElement;

        expect(actionWrapper).toHaveClass('group-focus-within:opacity-100');
        expect(deleteButton).toHaveClass(
            'focus-visible:ring-2',
            'focus-visible:ring-red-400',
            'focus-visible:ring-offset-2',
        );
        expect(deleteButton).toHaveClass('h-8', 'w-8');
    });

    it('deletes a macro only after the API accepts the deletion and reports rejection', async () => {
        render(<SettingsPage />);
        await screen.findByText('Welcome');
        const deleteButton = screen.getAllByRole('button').find(button => button.querySelector('svg.lucide-trash-2'));
        expect(deleteButton).toBeDefined();
        fireEvent.click(deleteButton as HTMLButtonElement);
        await waitFor(() => expect(mocks.macrosDelete).toHaveBeenCalledWith('macro-1'));
        expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
        expect(mocks.toastSuccess).toHaveBeenCalledWith('macros.delete_success');

        mocks.macrosList.mockResolvedValueOnce([macro]);
        mocks.macrosDelete.mockRejectedValueOnce(new Error('delete unavailable'));
        render(<SettingsPage />);
        await waitFor(() => expect(screen.getAllByText('Welcome')).toHaveLength(1));
        const retryDelete = screen.getAllByRole('button').find(button => button.querySelector('svg.lucide-trash-2'));
        fireEvent.click(retryDelete as HTMLButtonElement);
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('macros.delete_error'));
        expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
});
