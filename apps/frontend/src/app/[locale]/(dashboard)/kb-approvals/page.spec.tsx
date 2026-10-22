import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import KbApprovalsPage from './page';

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    approve: vi.fn(),
    dismiss: vi.fn(),
    runPipeline: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
    toastSuccess: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: { faq: { list: mocks.list, approve: mocks.approve, dismiss: mocks.dismiss, runPipeline: mocks.runPipeline } },
}));
vi.mock('sonner', () => ({
    toast: { error: mocks.toastError, info: mocks.toastInfo, success: mocks.toastSuccess },
}));
vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

const drafts = [
    {
        id: 'draft-high',
        question: 'High confidence question',
        answer: 'High confidence answer',
        confidenceScore: 0.91,
        sources: [{ id: 'source-ticket', sourceType: 'TICKET', ticket: { id: 'ticket-1', ticketNumber: 'T-100' } }],
    },
    {
        id: 'draft-medium',
        question: 'Medium confidence question',
        answer: 'Medium confidence answer',
        confidenceScore: 0.7,
        sources: [{ id: 'source-ai', sourceType: 'AI_INTERACTION', interaction: { id: 'ai/id?x=1' } }],
    },
    {
        id: 'draft-low',
        question: 'Low confidence question',
        answer: 'Low confidence answer',
        confidenceScore: 0.3,
        sources: [{ id: 'source-invalid', sourceType: 'TICKET', ticket: null }],
    },
    { id: 'draft-legacy', question: '', answer: '', confidenceScore: 0.5 },
];

describe('KbApprovalsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockResolvedValue(drafts);
        mocks.approve.mockResolvedValue(undefined);
        mocks.dismiss.mockResolvedValue(undefined);
        mocks.runPipeline.mockResolvedValue(undefined);
    });

    it('loads only pending drafts and renders confidence and source variants safely', async () => {
        render(<KbApprovalsPage />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();

        expect(await screen.findByText('High confidence question')).toBeInTheDocument();
        expect(mocks.list).toHaveBeenCalledWith('PENDING_REVIEW');
        expect(screen.getAllByText('table.reliable')).toHaveLength(4);
        expect(screen.getByRole('link', { name: 'T-100' })).toHaveAttribute('href', '/tr/tickets/ticket-1');
        expect(screen.getByRole('link', { name: 'table.ai_interaction' })).toHaveAttribute(
            'href',
            '/tr/admin/ai-interactions?interactionId=ai%2Fid%3Fx%3D1',
        );
        expect(screen.getByText('table.legacy_source')).toBeInTheDocument();
        const legacyRow = screen.getByText('""').closest('tr') as HTMLElement;
        expect(within(legacyRow).getByRole('button', { name: 'buttons.approve' })).toBeDisabled();
    });

    it('accepts an API envelope and shows the empty queue state', async () => {
        mocks.list.mockResolvedValueOnce({ data: [] });
        render(<KbApprovalsPage />);

        expect(await screen.findByText('empty.title')).toBeInTheDocument();
        expect(screen.getByText('empty.desc')).toBeInTheDocument();
        expect(screen.getByText('units_loaded')).toBeInTheDocument();
    });

    it('reports load failures and allows a manual refresh', async () => {
        mocks.list.mockRejectedValueOnce(new Error('queue unavailable')).mockResolvedValueOnce([]);
        render(<KbApprovalsPage />);

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.fetch_error'));
        const refresh = screen.getByRole('button', { name: 'refresh_queue' });
        expect(refresh).not.toBeDisabled();
        fireEvent.click(refresh);
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
        expect(await screen.findByText('empty.title')).toBeInTheDocument();
    });

    it('approves a draft, reports success, and refreshes the queue', async () => {
        render(<KbApprovalsPage />);
        const question = await screen.findByText('High confidence question');
        fireEvent.click(within(question.closest('tr') as HTMLElement).getByRole('button', { name: 'buttons.approve' }));

        await waitFor(() => expect(mocks.approve).toHaveBeenCalledWith('draft-high'));
        expect(mocks.toastSuccess).toHaveBeenCalledWith('toasts.approve_success');
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
    });

    it('reports approval rejection without a success toast or queue refresh', async () => {
        mocks.approve.mockRejectedValueOnce(new Error('approval unavailable'));
        render(<KbApprovalsPage />);
        const question = await screen.findByText('High confidence question');
        fireEvent.click(within(question.closest('tr') as HTMLElement).getByRole('button', { name: 'buttons.approve' }));

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.approve_error'));
        expect(mocks.toastSuccess).not.toHaveBeenCalled();
        expect(mocks.list).toHaveBeenCalledTimes(1);
    });

    it('dismisses a draft, reports informational success, and refreshes the queue', async () => {
        render(<KbApprovalsPage />);
        const question = await screen.findByText('Medium confidence question');
        fireEvent.click(within(question.closest('tr') as HTMLElement).getByRole('button', { name: 'buttons.delete' }));

        await waitFor(() => expect(mocks.dismiss).toHaveBeenCalledWith('draft-medium'));
        expect(mocks.toastInfo).toHaveBeenCalledWith('toasts.dismiss_success');
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
    });

    it('reports dismiss rejection without refreshing the queue', async () => {
        mocks.dismiss.mockRejectedValueOnce(new Error('dismiss unavailable'));
        render(<KbApprovalsPage />);
        const question = await screen.findByText('Low confidence question');
        fireEvent.click(within(question.closest('tr') as HTMLElement).getByRole('button', { name: 'buttons.delete' }));

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.dismiss_error'));
        expect(mocks.list).toHaveBeenCalledTimes(1);
    });

    it('starts the pipeline and reports a failure with its error context', async () => {
        render(<KbApprovalsPage />);
        await screen.findByText('High confidence question');
        const run = screen.getByRole('button', { name: 'run_pipeline' });

        fireEvent.click(run);
        await waitFor(() => expect(mocks.runPipeline).toHaveBeenCalledTimes(1));
        expect(mocks.toastInfo).toHaveBeenCalledWith('toasts.pipeline_started');

        mocks.runPipeline.mockRejectedValueOnce(new Error('pipeline offline'));
        fireEvent.click(run);
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('toasts.pipeline_error'));
    });
});
