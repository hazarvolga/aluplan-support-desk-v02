import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TicketDetailPage from './page';

const mocks = vi.hoisted(() => ({ get: vi.fn(), me: vi.fn(), updateStatus: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: {
    tickets: { get: mocks.get, updateStatus: mocks.updateStatus, getAiTrace: async () => null, assignableAgents: async () => [] },
    auth: { me: mocks.me },
    attachments: { getDownloadUrl: () => '/synthetic-download' },
} }));
vi.mock('@/lib/socket', () => ({ getSocket: () => ({ connected: true, emit: vi.fn(), on: vi.fn(), off: vi.fn() }) }));
vi.mock('@/lib/socket-room', () => ({ subscribeTicketRoom: () => vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: mocks.success } }));
vi.mock('@/components/macros/macro-picker', () => ({ MacroPicker: () => null }));
vi.mock('@/components/ui/hotinfo-grid', () => ({ HotinfoGrid: () => null }));
vi.mock('@/components/ai/AiVisualEvidence', () => ({ AiVisualEvidence: () => null }));
vi.mock('@/components/ai/ai-answer-content', () => ({ AiAnswerContent: () => null }));
vi.mock('@/components/ui/rich-text-renderer', () => ({ RichTextRenderer: ({ content }: { content: string }) => <div>{content}</div> }));
vi.mock('@/components/ui/rich-text-editor', () => ({ RichTextEditor: ({ disabled }: { disabled: boolean }) => <textarea aria-label="Reply fixture" disabled={disabled} /> }));

const ticket = { id: 'synthetic-ticket', ticketNumber: 'SYNTHETIC-1', subject: 'Reopen fixture', description: 'Preserved description', status: 'CLOSED', priority: 'MEDIUM', channel: 'WEB', chatStatus: 'NORMAL', createdAt: '2026-09-01T12:00:00Z', messages: [], creator: { id: 'customer', fullName: 'Fixture Customer' } };
const staff = { id: 'agent', fullName: 'Fixture Agent', role: 'AGENT', permissions: ['ticket:update'] };
async function mount() {
    await act(async () => { render(<TicketDetailPage params={Promise.resolve({ id: ticket.id })} />); });
    await screen.findByText('REOPEN FIXTURE');
}

describe('closed ticket reopening', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
        mocks.get.mockResolvedValue(ticket);
        mocks.me.mockResolvedValue(staff);
        mocks.updateStatus.mockResolvedValue({ ...ticket, status: 'OPEN' });
    });
    it('reopens the same ticket and refreshes without creating a new ticket or losing its description', async () => {
        await mount();
        mocks.get.mockResolvedValue({ ...ticket, status: 'OPEN' });
        fireEvent.click(screen.getByRole('button', { name: 'reopen_ticket' }));
        await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith(ticket.id, 'OPEN'));
        await waitFor(() => expect(screen.getByLabelText('Reply fixture')).toBeEnabled());
        expect(mocks.get).toHaveBeenCalledTimes(2);
        expect(mocks.success).toHaveBeenCalledWith('reopen_success');
        expect(screen.queryByRole('button', { name: 'reopen_ticket' })).not.toBeInTheDocument();
        expect(screen.getByText('Preserved description')).toBeInTheDocument();
    });
    it.each([
        { role: 'CUSTOMER', permissions: ['ticket:update'] },
        { role: 'VIEWER', permissions: ['*'] },
        { role: 'UNKNOWN', permissions: ['ticket:update'] },
        { role: 'AGENT', permissions: [] },
    ])('hides reopening for unauthorized identity %j', async (identity) => {
        mocks.me.mockResolvedValue({ ...staff, ...identity });
        await mount();
        expect(screen.queryByRole('button', { name: 'reopen_ticket' })).not.toBeInTheDocument();
        expect(mocks.updateStatus).not.toHaveBeenCalled();
    });
    it.each(['OPEN', 'RESOLVED', 'PENDING_CUSTOMER_REVIEW'])('does not offer CLOSED reopening for %s', async (status) => {
        mocks.get.mockResolvedValue({ ...ticket, status });
        await mount();
        expect(screen.queryByRole('button', { name: 'reopen_ticket' })).not.toBeInTheDocument();
    });
    it('allows the explicit staff wildcard contract', async () => {
        mocks.me.mockResolvedValue({ ...staff, role: 'super-admin', permissions: ['*'] });
        await mount();
        expect(screen.getByRole('button', { name: 'reopen_ticket' })).toBeEnabled();
    });
    it.each(['ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER'])('offers reopening for authorized %s', async (role) => {
        mocks.me.mockResolvedValue({ ...staff, role });
        await mount();
        expect(screen.getByRole('button', { name: 'reopen_ticket' })).toBeEnabled();
    });
    it('retains an acknowledged reopen when the subsequent refresh fails', async () => {
        await mount();
        mocks.get.mockRejectedValue(new Error('Refresh unavailable'));
        fireEvent.click(screen.getByRole('button', { name: 'reopen_ticket' }));
        await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('load_error'));
        expect(mocks.success).toHaveBeenCalledWith('reopen_success');
        expect(screen.queryByRole('button', { name: 'reopen_ticket' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Reply fixture')).toBeEnabled();
        expect(screen.getByText('Preserved description')).toBeInTheDocument();
    });
    it('deduplicates pending clicks and preserves closed state on failure, allowing retry', async () => {
        let reject!: (error: Error) => void;
        mocks.updateStatus.mockReturnValueOnce(new Promise((_, rejectPromise) => { reject = rejectPromise; }));
        await mount();
        const button = screen.getByRole('button', { name: 'reopen_ticket' });
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(mocks.updateStatus).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'reopening' })).toBeDisabled();
        await act(async () => reject(new Error('Not authorized')));
        expect(mocks.error).toHaveBeenCalledWith('status_update_error');
        expect(screen.getByRole('button', { name: 'reopen_ticket' })).toBeEnabled();
        expect(screen.getByLabelText('Reply fixture')).toBeDisabled();
        expect(mocks.get).toHaveBeenCalledTimes(1);
    });
});
