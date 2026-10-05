import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketLifecycle } from './ticket-lifecycle';

const mocks = vi.hoisted(() => ({ resolution: vi.fn(), close: vi.fn(), requestReopen: vi.fn(), feedback: vi.fn(), updateStatus: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: { tickets: mocks } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const owner = { id: 'customer', role: 'CUSTOMER', permissions: ['ticket:read', 'ticket:update'] };
const fixture = { id: 'ticket', userId: 'customer', status: 'PENDING_CUSTOMER_REVIEW', satisfactionScore: null, messages: [] };
const onUpdated = vi.fn();
function mount(ticket = fixture, user = owner) { return render(<TicketLifecycle ticket={ticket} user={user} onUpdated={onUpdated} />); }

describe('ticket resolution and independent customer feedback', () => {
    beforeEach(() => { vi.resetAllMocks(); });
    it('closes on owner confirmation without collecting a score', async () => {
        mocks.resolution.mockResolvedValue({ ...fixture, status: 'CLOSED' });
        mount();
        fireEvent.click(screen.getByRole('button', { name: 'confirm_resolution' }));
        await waitFor(() => expect(mocks.resolution).toHaveBeenCalledWith('ticket', 'CONFIRM'));
        expect(mocks.feedback).not.toHaveBeenCalled();
        expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
    });
    it.each([
        { ...owner, id: 'other' }, { ...owner, role: 'VIEWER' }, { ...owner, role: 'UNKNOWN' },
    ])('does not expose owner actions for %j', (user) => {
        mount(fixture, user);
        expect(screen.queryByRole('button', { name: 'confirm_resolution' })).not.toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
    it('requires an explanation to continue support', async () => {
        mocks.resolution.mockResolvedValue({ ...fixture, status: 'OPEN' });
        mount();
        fireEvent.click(screen.getByRole('button', { name: 'continue_support' }));
        expect(screen.getByRole('button', { name: 'submit_action' })).toBeDisabled();
        fireEvent.change(screen.getByLabelText('action_comment'), { target: { value: 'Still failing' } });
        fireEvent.click(screen.getByRole('button', { name: 'submit_action' }));
        await waitFor(() => expect(mocks.resolution).toHaveBeenCalledWith('ticket', 'CONTINUE', 'Still failing'));
    });
    it('records a low rating without closing or reopening the ticket', async () => {
        mocks.feedback.mockResolvedValue({ ...fixture, satisfactionScore: 1 });
        mount();
        fireEvent.click(screen.getAllByRole('radio')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'submit_rating' }));
        await waitFor(() => expect(mocks.feedback).toHaveBeenCalledWith('ticket', 1, undefined));
        expect(mocks.resolution).not.toHaveBeenCalled();
        expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING_CUSTOMER_REVIEW', satisfactionScore: 1 }));
    });
    it('keeps previous feedback read-only after reopening', () => {
        mount({ ...fixture, status: 'OPEN', satisfactionScore: 5 } as never);
        expect(screen.getByText('previous_rating')).toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'confirm_resolution' })).toBeEnabled();
    });
    it('requests reopening a closed ticket without changing its state', async () => {
        const closed = { ...fixture, status: 'CLOSED' };
        mocks.requestReopen.mockResolvedValue(closed);
        mount(closed);
        fireEvent.click(screen.getByRole('button', { name: 'request_reopen' }));
        fireEvent.change(screen.getByLabelText('action_comment'), { target: { value: 'Problem returned' } });
        fireEvent.click(screen.getByRole('button', { name: 'submit_action' }));
        await waitFor(() => expect(mocks.requestReopen).toHaveBeenCalledWith('ticket', 'Problem returned'));
        expect(mocks.updateStatus).not.toHaveBeenCalled();
        expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
    });
    it('shows a current reopen request to staff and suppresses duplicate customer requests', () => {
        mount({ ...fixture, status: 'CLOSED', closedAt: '2026-10-01T00:00:00Z', messages: [{ isInternal: false, metadata: { action: 'TICKET_REOPEN_REQUESTED', previousClosedAt: '2026-10-01T00:00:00Z' } }] } as never);
        expect(screen.getByRole('status')).toHaveTextContent('reopen_request_pending');
        expect(screen.queryByRole('button', { name: 'request_reopen' })).not.toBeInTheDocument();
    });
    it('requires staff close permission and preserves an optional explanation without simulated customer ratings', async () => {
        const staff = { id: 'staff', role: 'AGENT', permissions: ['ticket:update', 'ticket:close'] };
        mocks.close.mockResolvedValue({ ...fixture, status: 'CLOSED' });
        mount(fixture, staff);
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'staff_close' }));
        fireEvent.change(screen.getByLabelText('close_comment'), { target: { value: 'Duplicate request' } });
        fireEvent.click(screen.getByRole('button', { name: 'submit_action' }));
        await waitFor(() => expect(mocks.close).toHaveBeenCalledWith('ticket', 'Duplicate request'));
        expect(mocks.feedback).not.toHaveBeenCalled();
    });
    it.each(['', '   '])('allows staff to close without a meaningful explanation (%j)', async (comment) => {
        mocks.close.mockResolvedValue({ ...fixture, status: 'CLOSED' });
        mount(fixture, { id: 'staff', role: 'AGENT', permissions: ['ticket:close'] });
        fireEvent.click(screen.getByRole('button', { name: 'staff_close' }));
        fireEvent.change(screen.getByLabelText('close_comment'), { target: { value: comment } });
        expect(screen.getByRole('button', { name: 'submit_action' })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: 'submit_action' }));
        await waitFor(() => expect(mocks.close).toHaveBeenCalledWith('ticket', undefined));
        expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
        expect(mocks.feedback).not.toHaveBeenCalled();
    });
    it.each(['CONTINUE', 'REQUEST'])('keeps the explanation mandatory for %s', (action) => {
        mount({ ...fixture, status: action === 'REQUEST' ? 'CLOSED' : 'PENDING_CUSTOMER_REVIEW' });
        fireEvent.click(screen.getByRole('button', { name: action === 'REQUEST' ? 'request_reopen' : 'continue_support' }));
        fireEvent.change(screen.getByLabelText('action_comment'), { target: { value: '   ' } });
        expect(screen.getByRole('button', { name: 'submit_action' })).toBeDisabled();
        expect(mocks.resolution).not.toHaveBeenCalled();
        expect(mocks.requestReopen).not.toHaveBeenCalled();
    });
    it('hides staff actions for a staff role without permissions', () => {
        mount({ ...fixture, status: 'OPEN' }, { id: 'staff', role: 'AGENT', permissions: [] });
        expect(screen.queryByRole('button', { name: 'staff_close' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'send_resolution' })).not.toBeInTheDocument();
    });
    it('deduplicates rapid confirmation clicks', async () => {
        let finish!: (ticket: unknown) => void;
        mocks.resolution.mockReturnValue(new Promise(resolve => { finish = resolve; }));
        mount();
        const button = screen.getByRole('button', { name: 'confirm_resolution' });
        act(() => { button.click(); button.click(); });
        expect(mocks.resolution).toHaveBeenCalledTimes(1);
        await act(async () => finish({ ...fixture, status: 'CLOSED' }));
    });
    it('retains the action comment on server failure for retry', async () => {
        mocks.resolution.mockRejectedValueOnce(new Error('Conflict'));
        mount();
        fireEvent.click(screen.getByRole('button', { name: 'continue_support' }));
        fireEvent.change(screen.getByLabelText('action_comment'), { target: { value: 'Unsaved explanation' } });
        fireEvent.click(screen.getByRole('button', { name: 'submit_action' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'submit_action' })).toBeEnabled());
        expect(screen.getByLabelText('action_comment')).toHaveValue('Unsaved explanation');
        expect(onUpdated).not.toHaveBeenCalled();
    });
    it('offers rating on a closed ticket and requires no rating to stay closed', () => {
        mount({ ...fixture, status: 'CLOSED' });
        expect(screen.getAllByRole('radio')).toHaveLength(5);
        expect(screen.queryByRole('button', { name: 'confirm_resolution' })).not.toBeInTheDocument();
        expect(mocks.resolution).not.toHaveBeenCalled();
    });
    it('does not expose resolution confirmation or customer review for drafts', () => {
        const view = mount({ ...fixture, status: 'DRAFT' });
        expect(screen.queryByRole('button', { name: 'confirm_resolution' })).not.toBeInTheDocument();
        view.rerender(<TicketLifecycle ticket={{ ...fixture, status: 'DRAFT' }} user={{ id: 'staff', role: 'ADMIN', permissions: ['*'] }} onUpdated={onUpdated} />);
        expect(screen.queryByRole('button', { name: 'send_resolution' })).not.toBeInTheDocument();
    });
    it('ignores reopen requests from a previous closure cycle', () => {
        mount({ ...fixture, status: 'CLOSED', closedAt: '2026-10-02T00:00:00Z', messages: [{ isInternal: false, createdAt: '2026-10-01T01:00:00Z', metadata: { action: 'TICKET_REOPEN_REQUESTED', previousClosedAt: '2026-10-01T00:00:00Z' } }] } as never);
        expect(screen.getByRole('button', { name: 'request_reopen' })).toBeEnabled();
        expect(screen.queryByText('reopen_request_pending')).not.toBeInTheDocument();
    });
    it('shows the pending customer reopen request to staff', () => {
        mount({ ...fixture, status: 'CLOSED', closedAt: '2026-10-01T00:00:00Z', messages: [{ isInternal: false, metadata: { action: 'TICKET_REOPEN_REQUESTED', previousClosedAt: '2026-10-01T00:00:00Z' } }] } as never, { id: 'staff', role: 'AGENT', permissions: ['ticket:update'] });
        expect(screen.getByRole('status')).toHaveTextContent('reopen_request_pending');
    });
});
