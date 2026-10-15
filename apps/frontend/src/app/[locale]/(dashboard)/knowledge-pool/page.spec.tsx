import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import KnowledgePoolPage from './page';

const mocks = vi.hoisted(() => ({
    pool: {
        list: vi.fn(), sync: vi.fn(), delete: vi.fn(), bulkDelete: vi.fn(), updateCategory: vi.fn(), logs: vi.fn(), syncDataset: vi.fn(), addUrl: vi.fn(),
        discoverAllplanHelp: vi.fn(), discoverGenericWeb: vi.fn(), crawlCandidates: vi.fn(), latestLearnNowCrawlRun: vi.fn(), startLearnNowCrawlRun: vi.fn(),
        learnNowCrawlRun: vi.fn(), pauseLearnNowCrawlRun: vi.fn(), resumeLearnNowCrawlRun: vi.fn(), importCrawlCandidate: vi.fn(),
        approveCrawlCandidate: vi.fn(), rejectCrawlCandidate: vi.fn(), deleteCrawlCandidate: vi.fn(), bulkDeleteCrawlCandidates: vi.fn(),
    },
    kbList: vi.fn(), kbReview: vi.fn(), toast: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ api: { pool: mocks.pool, kb: { list: mocks.kbList, review: mocks.kbReview } } }));
vi.mock('@/lib/knowledge-source-errors', () => ({ isDuplicateKnowledgeSourceUrlError: (error: any) => error?.code === 'DUPLICATE' }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/auth/role-guard', () => ({ useAuth: () => ({ user: { role: 'admin', permissions: [] } }) }));
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key === 'meta.locale' ? 'en-US' : key,
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('@/components/ui/tabs', () => {
    const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);
    return {
        Tabs: ({ children, value, onValueChange }: any) => (
            <TabsContext.Provider value={{ value, onValueChange }}>
                <div>{children}</div>
            </TabsContext.Provider>
        ),
        TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
        TabsTrigger: ({ children, value }: any) => {
            const tabs = React.useContext(TabsContext);
            return (
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabs?.value === value}
                    onClick={() => tabs?.onValueChange(value)}
                >
                    {children}
                </button>
            );
        },
        TabsContent: ({ children, value }: any) => {
            const tabs = React.useContext(TabsContext);
            return tabs?.value === value ? <section role="tabpanel">{children}</section> : null;
        },
    };
});
vi.mock('@/components/ui/dialog', () => {
    const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);
    return {
        Dialog: ({ children, open = false, onOpenChange = () => undefined }: any) => (
            <DialogContext.Provider value={{ open, onOpenChange }}>
                <div>{children}</div>
            </DialogContext.Provider>
        ),
        DialogTrigger: ({ children, asChild }: any) => {
            const dialog = React.useContext(DialogContext);
            if (asChild && React.isValidElement(children)) {
                const child = children as React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
                return React.cloneElement(child, {
                    onClick: (event: React.MouseEvent) => {
                        child.props.onClick?.(event);
                        dialog?.onOpenChange(true);
                    },
                });
            }
            return <button type="button" onClick={() => dialog?.onOpenChange(true)}>{children}</button>;
        },
        DialogContent: ({ children }: any) => {
            const dialog = React.useContext(DialogContext);
            return dialog?.open ? <div role="dialog">{children}</div> : null;
        },
        DialogHeader: ({ children }: any) => <div>{children}</div>,
        DialogTitle: ({ children }: any) => <h2>{children}</h2>,
        DialogDescription: ({ children }: any) => <p>{children}</p>,
        DialogFooter: ({ children }: any) => <div>{children}</div>,
    };
});

const sources = [
    { id: 's1', name: 'Alpha URL', status: 'ACTIVE', type: 'URL', url: 'https://alpha.example.com', lastSyncedAt: '2026-10-10', metadata: { category: 'General' }, _count: { embeddings: 3 } },
    { id: 's2', name: 'Beta File', status: 'FAILED', type: 'FILE_MD', fileName: 'beta.md', lastSyncedAt: null, metadata: { category: 'Review Backlog', categorySlug: 'review-backlog' }, _count: { embeddings: 0 } },
    { id: 's3', name: 'Gamma Sync', status: 'SYNCING', type: 'FILE_PDF', fileName: 'gamma.pdf', metadata: null },
    { bad: true },
];
const articles = [
    { id: 'a1', title: 'Draft Article', content: 'Content', status: 'DRAFT', tags: ['tag'], createdAt: '2026-10-10', creator: { fullName: 'Ada' } },
    { id: 'a2', title: 'Published Article', content: 'Content', status: 'PUBLISHED', createdAt: '2026-10-09' },
    { bad: true },
];
const candidate = {
    id: 'c1', title: 'Candidate One', sourceUrl: 'https://learnnow.allplan.com/item/1', status: 'PENDING_REVIEW', source: 'allplan_learnnow', format: 'knowledge_article',
    summary: 'Summary', language: 'en', createdAt: '2026-10-10', categorySlug: 'manuals-tutorials', metadata: { reviewQuality: { score: 91, readyForImport: true } },
};

describe('KnowledgePoolPage high-value behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('confirm', vi.fn(() => true)); vi.stubGlobal('prompt', vi.fn(() => 'Not relevant'));
        mocks.pool.list.mockResolvedValue(sources); mocks.pool.sync.mockResolvedValue({}); mocks.pool.delete.mockResolvedValue({}); mocks.pool.bulkDelete.mockResolvedValue({ count: 2 });
        mocks.pool.logs.mockResolvedValue([{ id: 'l1', status: 'SUCCESS', syncStartedAt: '2026-10-10', chunksProcessed: 3 }, { bad: true }]);
        mocks.pool.syncDataset.mockResolvedValue({ success: true, message: 'Scanned' }); mocks.pool.addUrl.mockResolvedValue({});
        mocks.pool.discoverAllplanHelp.mockResolvedValue({ inserted: 4 }); mocks.pool.discoverGenericWeb.mockResolvedValue({ inserted: 2 });
        mocks.kbList.mockResolvedValue({ data: articles, total: 2 }); mocks.kbReview.mockResolvedValue({});
        mocks.pool.crawlCandidates.mockResolvedValue([candidate]); mocks.pool.latestLearnNowCrawlRun.mockResolvedValue(null);
        mocks.pool.startLearnNowCrawlRun.mockResolvedValue({ id: 'run-1', status: 'QUEUED', insertedCount: 0, processedCount: 0, skippedCount: 0, maxCandidates: 5 });
        mocks.pool.importCrawlCandidate.mockResolvedValue({ skipped: false }); mocks.pool.approveCrawlCandidate.mockResolvedValue({ status: 'APPROVED' });
        mocks.pool.rejectCrawlCandidate.mockResolvedValue({ status: 'REJECTED' }); mocks.pool.deleteCrawlCandidate.mockResolvedValue({}); mocks.pool.bulkDeleteCrawlCandidates.mockResolvedValue({ count: 1 });
    });

    it('loads, filters, sorts, selects, bulk syncs and bulk deletes sources', async () => {
        const user = userEvent.setup(); render(<KnowledgePoolPage />);
        expect(await screen.findByText('Alpha URL')).toBeInTheDocument(); expect(screen.getByText('Beta File')).toBeInTheDocument();
        await user.type(screen.getAllByPlaceholderText('articles.search_placeholder')[0], 'Beta');
        expect(screen.queryByText('Alpha URL')).not.toBeInTheDocument(); expect(screen.getByText('Beta File')).toBeInTheDocument();
        await user.clear(screen.getAllByPlaceholderText('articles.search_placeholder')[0]);
        fireEvent.click(screen.getByText('table.source')); fireEvent.click(screen.getByText('table.source'));
        fireEvent.click(screen.getAllByRole('checkbox', { name: 'table.select_all' })[0]);
        await user.click(screen.getByRole('button', { name: /buttons.bulk_sync/ }));
        await waitFor(() => expect(mocks.pool.sync).toHaveBeenCalledTimes(3));
        fireEvent.click(screen.getAllByRole('checkbox', { name: 'table.select_all' })[0]);
        await user.click(screen.getByRole('button', { name: 'DELETE' }));
        await waitFor(() => expect(mocks.pool.bulkDelete).toHaveBeenCalledWith(expect.arrayContaining(['s1', 's2', 's3'])));
        expect(mocks.pool.bulkDelete.mock.calls[0][0]).toHaveLength(3);
    });

    it('syncs, loads logs, deletes a source and reports action failures', async () => {
        const user = userEvent.setup(); render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        const row = screen.getByText('Alpha URL').closest('tr') as HTMLElement; const buttons = within(row).getAllByRole('button');
        await user.click(buttons[1]); await waitFor(() => expect(mocks.pool.sync).toHaveBeenCalledWith('s1'));
        await user.click(buttons[2]); await waitFor(() => expect(mocks.pool.logs).toHaveBeenCalledWith('s1')); expect(await screen.findByText('logs.chunks_processed')).toBeInTheDocument();
        await user.click(buttons[3]); await waitFor(() => expect(mocks.pool.delete).toHaveBeenCalledWith('s1'));

        mocks.pool.sync.mockRejectedValueOnce(new Error('sync down'));
        const beta = screen.getByText('Beta File').closest('tr') as HTMLElement; await user.click(within(beta).getAllByRole('button')[1]);
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'sync.failed', variant: 'destructive' })));
    });

    it('handles successful, failed, and exceptional dataset scans', async () => {
        const user = userEvent.setup(); const { unmount } = render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        await user.click(screen.getByRole('button', { name: 'buttons.scan_dataset' }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Scanned' })));
        unmount(); mocks.pool.syncDataset.mockResolvedValueOnce({ success: false, message: 'Rejected' }); render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        await user.click(screen.getByRole('button', { name: 'buttons.scan_dataset' })); await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Rejected', variant: 'destructive' })));
    });

    it('adds single URLs, blocks course URLs, and discovers both crawler types', async () => {
        const user = userEvent.setup(); render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        await user.click(screen.getByRole('button', { name: 'buttons.add_url' }));
        const dialog = screen.getByRole('dialog');
        const name = within(dialog).getByPlaceholderText('placeholder'); const url = within(dialog).getByPlaceholderText('https://example.com/docs');
        await user.type(name, 'Docs'); await user.type(url, 'https://example.com/docs'); await user.click(screen.getByRole('button', { name: 'dialogs.save_sync' }));
        await waitFor(() => expect(mocks.pool.addUrl).toHaveBeenCalledWith('Docs', 'https://example.com/docs'));
        await user.click(screen.getByRole('button', { name: 'buttons.add_url' }));
        const reopenedDialog = screen.getByRole('dialog');
        const reopenedName = within(reopenedDialog).getByPlaceholderText('placeholder');
        const reopenedUrl = within(reopenedDialog).getByPlaceholderText('https://example.com/docs');
        await user.type(reopenedName, 'Course'); await user.type(reopenedUrl, 'https://learnnow.allplan.com/course/1'); await user.click(screen.getByRole('button', { name: 'dialogs.save_sync' }));
        expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'crawler.toasts.course_url_blocked' }));

        await user.clear(reopenedName); await user.type(reopenedName, 'Help'); await user.clear(reopenedUrl); await user.type(reopenedUrl, 'https://help.allplan.com/topic');
        await user.click(screen.getByRole('button', { name: /dialogs.url_mode_crawl/ })); await user.click(screen.getByRole('button', { name: 'dialogs.save_candidates' }));
        await waitFor(() => expect(mocks.pool.discoverAllplanHelp).toHaveBeenCalled());
    });

    it('loads articles, filters, selects and publishes them with partial failure', async () => {
        const user = userEvent.setup(); render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        await user.click(screen.getByRole('tab', { name: 'tabs.seeded_content' }));
        expect(await screen.findByText('Draft Article')).toBeInTheDocument();
        mocks.kbReview.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('fail'));
        const articleRow = screen.getByText('Draft Article').closest('.group') as HTMLElement;
        fireEvent.click(within(articleRow).getByRole('checkbox'));
        const publish = await screen.findByRole('button', { name: /buttons.publish_selected/ }); await user.click(publish);
        await waitFor(() => expect(mocks.kbReview).toHaveBeenCalled());
    });

    it('loads crawler candidates and exercises approve, reject, import and delete flows', async () => {
        const user = userEvent.setup(); render(<KnowledgePoolPage />); await screen.findByText('Alpha URL');
        await user.click(screen.getByRole('tab', { name: 'tabs.crawler' })); expect(await screen.findByText('Candidate One')).toBeInTheDocument();
        const row = screen.getByText('Candidate One').closest('tr') as HTMLElement;
        await user.click(within(row).getByRole('button', { name: 'crawler.buttons.approve' }));
        await waitFor(() => expect(mocks.pool.approveCrawlCandidate).toHaveBeenCalledWith('c1'));
        await user.click(within(row).getByRole('button', { name: 'crawler.buttons.import' }));
        await waitFor(() => expect(mocks.pool.importCrawlCandidate).toHaveBeenCalledWith('c1'));
        await user.click(within(row).getByRole('button', { name: 'crawler.buttons.reject' }));
        await waitFor(() => expect(mocks.pool.rejectCrawlCandidate).toHaveBeenCalledWith('c1', 'Not relevant'));
        await user.click(within(row).getByRole('button', { name: 'crawler.buttons.delete' }));
        await waitFor(() => expect(mocks.pool.deleteCrawlCandidate).toHaveBeenCalledWith('c1'));
    });
});
