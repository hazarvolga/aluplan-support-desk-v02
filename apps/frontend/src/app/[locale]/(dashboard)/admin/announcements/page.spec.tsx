import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnnouncementsPage from './page';

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    getFilters: vi.fn(),
    getTargetCount: vi.fn(),
    createAnnouncement: vi.fn(),
    broadcast: vi.fn(),
    deleteAnnouncement: vi.fn(),
    listTemplates: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    previewTemplate: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        announcements: {
            list: mocks.list,
            getFilters: mocks.getFilters,
            getTargetCount: mocks.getTargetCount,
            create: mocks.createAnnouncement,
            broadcast: mocks.broadcast,
            delete: mocks.deleteAnnouncement,
        },
        announcementTemplates: {
            list: mocks.listTemplates,
            create: mocks.createTemplate,
            update: mocks.updateTemplate,
            delete: mocks.deleteTemplate,
        },
        email: { previewTemplate: mocks.previewTemplate },
    },
}));

vi.mock('sonner', () => ({
    toast: { success: mocks.success, error: mocks.error, info: mocks.info },
}));

vi.mock('@/components/email/RichTextEditor', () => ({
    RichTextEditor: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => (
        <textarea aria-label="rich-editor" value={content} onChange={(event) => onChange(event.target.value)} />
    ),
}));

vi.mock('@/components/ui/multi-select', () => ({
    MultiSelect: ({ placeholder, onChange }: { placeholder: string; onChange: (values: string[]) => void }) => (
        <button type="button" onClick={() => onChange([`${placeholder}-choice`])}>{placeholder}</button>
    ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/tabs', async () => {
    const ReactModule = await vi.importActual<typeof import('react')>('react');
    const ActiveTabContext = ReactModule.createContext<{
        value: string;
        onValueChange?: (value: string) => void;
    }>({ value: 'create' });

    return {
        Tabs: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange?: (value: string) => void }) => (
            <ActiveTabContext.Provider value={{ value, onValueChange }}>
                <div>{children}</div>
            </ActiveTabContext.Provider>
        ),
        TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => {
            const tabs = ReactModule.useContext(ActiveTabContext);
            return (
                <button
                    type="button"
                    aria-selected={tabs.value === value}
                    onClick={() => tabs.onValueChange?.(value)}
                >
                    {children}
                </button>
            );
        },
        TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => {
            const tabs = ReactModule.useContext(ActiveTabContext);
            return tabs.value === value ? <section data-tab={value}>{children}</section> : null;
        },
    };
});

const announcements = [
    { id: 'draft-1', title: 'Draft notice', subject: 'Draft subject', status: 'DRAFT', createdAt: '2026-10-10', author: { fullName: 'Ada' }, _count: { logs: 0 } },
    { id: 'sent-1', title: 'Sent notice', subject: 'Sent subject', status: 'SENT', createdAt: '2026-10-09', author: null, _count: { logs: 3 } },
];

const templates = [
    { id: 'template-1', name: 'Security bulletin', topic: 'Security', subject: 'Stay safe', contentHtml: '<p>Safe</p>', updatedAt: '2026-10-10' },
    { id: 'template-2', name: 'Empty template', topic: null, subject: null, contentHtml: null, contentMjml: null, updatedAt: '2026-10-09' },
];

describe('AnnouncementsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('confirm', vi.fn(() => true));
        Element.prototype.scrollIntoView = vi.fn();
        mocks.list.mockResolvedValue(announcements);
        mocks.listTemplates.mockResolvedValue(templates);
        mocks.getFilters.mockResolvedValue({ industries: ['AEC'], statuses: ['ACTIVE'], companies: ['Aluplan'] });
        mocks.getTargetCount.mockResolvedValue({ count: 7 });
        mocks.createAnnouncement.mockResolvedValue({ id: 'new-draft' });
        mocks.broadcast.mockResolvedValue({ count: 4 });
        mocks.deleteAnnouncement.mockResolvedValue(undefined);
        mocks.createTemplate.mockResolvedValue({ id: 'new-template' });
        mocks.updateTemplate.mockResolvedValue({ id: 'template-1' });
        mocks.deleteTemplate.mockResolvedValue(undefined);
        mocks.previewTemplate.mockResolvedValue({ html: '<p>Preview</p>' });
    });

    it('loads announcements, templates, filters and target count', async () => {
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await waitFor(() => {
            expect(mocks.list).toHaveBeenCalledTimes(1);
            expect(mocks.listTemplates).toHaveBeenCalledTimes(1);
            expect(mocks.getFilters).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => expect(mocks.getTargetCount).toHaveBeenCalledWith({ industries: [], statuses: [], companyNames: [], tags: [] }));
        expect(await screen.findByText('7')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'tabs.templates' }));
        expect(await screen.findByText('Security bulletin')).toBeInTheDocument();
        expect(screen.queryByText('Draft notice')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'tabs.history' }));
        expect(await screen.findByText('Draft notice')).toBeInTheDocument();
        expect(screen.getByText('Sent notice')).toBeInTheDocument();
        expect(screen.queryByText('Security bulletin')).not.toBeInTheDocument();
    });

    it('builds audience criteria, previews content, saves a draft and resets it', async () => {
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(1));
        await user.click(screen.getByRole('button', { name: 'audience.industry_placeholder' }));
        await user.click(screen.getByRole('button', { name: 'audience.status_placeholder' }));
        await user.click(screen.getByRole('button', { name: 'audience.company_placeholder' }));
        const tagInput = screen.getByPlaceholderText('audience.tags_placeholder');
        await user.type(tagInput, 'VIP{enter}');
        await user.click(screen.getByText('VIP ×'));

        await user.type(screen.getByPlaceholderText('editor.title_placeholder'), 'Release');
        await user.type(screen.getByPlaceholderText('editor.subject_placeholder'), 'Release subject');
        await user.click(screen.getAllByRole('button', { name: 'editor.preview' })[0]);
        await waitFor(() => expect(mocks.previewTemplate).toHaveBeenCalled());
        expect(await screen.findByTitle('announcement-preview')).toHaveAttribute('srcdoc', '<p>Preview</p>');
        await user.click(screen.getByRole('button', { name: 'close' }));

        await user.click(screen.getByRole('button', { name: 'editor.save_draft' }));
        await waitFor(() => expect(mocks.createAnnouncement).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Release', subject: 'Release subject', type: 'BROADCAST',
            targetCriteria: expect.objectContaining({ industries: ['audience.industry_placeholder-choice'] }),
        })));
        expect(mocks.success).toHaveBeenCalledWith('toasts.draft_saved');
    });

    it('validates required draft and template fields and reports preview errors', async () => {
        mocks.previewTemplate.mockRejectedValueOnce(new Error('preview down'));
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(1));
        await user.click(screen.getByRole('button', { name: 'editor.save_draft' }));
        expect(mocks.error).toHaveBeenCalledWith('toasts.title_subject_required');
        await user.click(screen.getByRole('button', { name: 'tabs.templates' }));
        await user.click(screen.getByRole('button', { name: 'template_editor.archive' }));
        expect(mocks.error).toHaveBeenCalledWith('toasts.required_fields');
        await user.click(screen.getByRole('button', { name: 'tabs.create' }));
        await user.click(screen.getAllByRole('button', { name: 'editor.preview' })[0]);
        await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('toasts.preview_error preview down'));
    });

    it('creates, edits, previews, applies and deletes templates', async () => {
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await user.click(screen.getByRole('button', { name: 'tabs.templates' }));
        await screen.findByText('Security bulletin');
        const library = screen.getByText('Security bulletin').closest('div.p-4') as HTMLElement;

        await user.click(within(library).getByTitle('library.preview'));
        await waitFor(() => expect(mocks.previewTemplate).toHaveBeenCalledWith('master-announcement', expect.objectContaining({ contentHtml: '<p>Safe</p>' })));
        expect(await screen.findByTitle('template-archive-preview')).toBeInTheDocument();
        await user.click(screen.getAllByRole('button', { name: /close/ }).at(-1)!);
        await user.click(within(library).getByTitle('library.apply'));
        expect(mocks.info).toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'tabs.templates' }));
        fireEvent.click(screen.getByText('Security bulletin'));
        expect(screen.getByPlaceholderText('template_editor.name_placeholder')).toHaveValue('Security bulletin');
        await user.click(screen.getByRole('button', { name: 'template_editor.update' }));
        await waitFor(() => expect(mocks.updateTemplate).toHaveBeenCalledWith('template-1', expect.objectContaining({ name: 'Security bulletin' })));

        const refreshedLibrary = screen.getByText('Security bulletin').closest('div.p-4') as HTMLElement;
        await user.click(within(refreshedLibrary).getAllByRole('button').at(-1)!);
        await waitFor(() => expect(mocks.deleteTemplate).toHaveBeenCalledWith('template-1'));
    });

    it('creates a new template and handles empty-template preview', async () => {
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await user.click(screen.getByRole('button', { name: 'tabs.templates' }));
        await screen.findByText('Empty template');
        await user.type(screen.getByPlaceholderText('template_editor.name_placeholder'), 'New template');
        await user.type(screen.getByPlaceholderText('template_editor.topic_placeholder'), 'Operations');
        await user.type(screen.getByPlaceholderText('template_editor.subject_placeholder'), 'Ops');
        const editors = screen.getAllByLabelText('rich-editor');
        fireEvent.change(editors.at(-1)!, { target: { value: '<p>Ops</p>' } });
        await user.click(screen.getByRole('button', { name: 'template_editor.archive' }));
        await waitFor(() => expect(mocks.createTemplate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New template', contentMjml: '<p>Ops</p>' })));

        const emptyCard = screen.getByText('Empty template').closest('div.p-4') as HTMLElement;
        await user.click(within(emptyCard).getByTitle('library.preview'));
        expect(mocks.error).toHaveBeenCalledWith('toasts.template_empty');
    });

    it('broadcasts and deletes history rows while respecting cancellation and errors', async () => {
        const user = userEvent.setup();
        render(<AnnouncementsPage />);
        await user.click(screen.getByRole('button', { name: 'tabs.history' }));
        await screen.findByText('Draft notice');
        const draftRow = screen.getByText('Draft notice').closest('div.flex.items-center.justify-between.p-5') as HTMLElement;
        await user.click(within(draftRow).getByRole('button', { name: 'history.broadcast' }));
        await waitFor(() => expect(mocks.broadcast).toHaveBeenCalledWith('draft-1'));
        expect(mocks.success).toHaveBeenCalledWith('toasts.broadcast_success');

        const deleteButton = within(draftRow).getAllByRole('button').at(-1)!;
        await user.click(deleteButton);
        await waitFor(() => expect(mocks.deleteAnnouncement).toHaveBeenCalledWith('draft-1'));

        vi.mocked(confirm).mockReturnValueOnce(false);
        await user.click(within(draftRow).getByRole('button', { name: 'history.broadcast' }));
        expect(mocks.broadcast).toHaveBeenCalledTimes(1);

        mocks.deleteAnnouncement.mockRejectedValueOnce('delete down');
        await user.click(deleteButton);
        await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('toasts.delete_failed'));
    });

    it('fails soft when initial loading or target counting fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.list.mockRejectedValueOnce(new Error('load down'));
        mocks.getTargetCount.mockRejectedValueOnce(new Error('count down'));
        render(<AnnouncementsPage />);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledTimes(2));
        await userEvent.click(screen.getByRole('button', { name: 'tabs.history' }));
        expect(await screen.findByText('history.empty')).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
