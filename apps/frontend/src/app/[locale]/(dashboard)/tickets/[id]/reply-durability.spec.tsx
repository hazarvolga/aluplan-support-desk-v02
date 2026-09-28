import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TicketDetailPage from './page';

const mocks = vi.hoisted(() => ({ get: vi.fn(), addMessage: vi.fn(), upload: vi.fn(), toastError: vi.fn(), emit: vi.fn(), on: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: {
    tickets: { get: mocks.get, addMessage: mocks.addMessage },
    auth: { me: async () => ({ id: 'customer', fullName: 'Fixture Customer', role: 'CUSTOMER' }) },
    attachments: { upload: mocks.upload, getDownloadUrl: () => '/synthetic-download' },
} }));
vi.mock('@/lib/socket', () => ({ getSocket: () => ({ connected: true, emit: mocks.emit, on: mocks.on, off: vi.fn() }) }));
vi.mock('@/lib/socket-room', () => ({ subscribeTicketRoom: () => vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/components/macros/macro-picker', () => ({ MacroPicker: () => null }));
vi.mock('@/components/ui/hotinfo-grid', () => ({ HotinfoGrid: () => null }));
vi.mock('@/components/ai/AiVisualEvidence', () => ({ AiVisualEvidence: () => null }));
vi.mock('@/components/ai/ai-answer-content', () => ({ AiAnswerContent: () => null }));
vi.mock('@/components/ui/rich-text-renderer', () => ({ RichTextRenderer: ({ content }: { content: string }) => <div>{content}</div> }));
vi.mock('@/components/ui/rich-text-editor', () => ({ RichTextEditor: ({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) => <>
    <textarea aria-label="Reply fixture" value={value} onChange={(event) => onChange(event.target.value)} />
    <button onClick={onSubmit}>Submit reply fixture</button>
</> }));

const initial = (id = 'ticket-a') => ({ id, ticketNumber: id, subject: id, description: 'Initial description', status: 'OPEN', priority: 'MEDIUM', channel: 'WEB', createdAt: '2026-09-01T12:00:00Z', messages: [], creator: { id: 'customer', fullName: 'Fixture Customer' } });
const confirmed = { id: 'message-a', message: 'Original reply', senderId: 'customer', createdAt: '2026-09-01T12:01:00Z', attachments: [] };
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}
async function mount(id = 'ticket-a') {
    const params = Promise.resolve({ id });
    const result = await act(async () => render(<TicketDetailPage params={params} />));
    await screen.findByLabelText('Reply fixture');
    return result;
}
function compose(container: HTMLElement, files = [new File(['one'], 'one.txt'), new File(['two'], 'two.txt')]) {
    fireEvent.change(screen.getByLabelText('Reply fixture'), { target: { value: 'Original reply' } });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files } });
    fireEvent.click(screen.getByText('Submit reply fixture'));
}

describe('ticket reply partial success', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
        mocks.get.mockImplementation(async (id: string) => initial(id));
        mocks.addMessage.mockResolvedValue(confirmed);
        mocks.upload.mockResolvedValue({ id: 'attachment-a', fileName: 'one.txt' });
    });
    it('keeps the acknowledged message and retries only remaining files without resending it', async () => {
        mocks.upload.mockResolvedValueOnce({ id: 'attachment-a', fileName: 'one.txt' }).mockRejectedValueOnce(new Error('Storage unavailable'));
        const { container } = await mount();
        compose(container);
        await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.getByLabelText('Reply fixture')).toHaveValue(''));
        expect(screen.getByText('Original reply')).toBeInTheDocument();
        fireEvent.click(await screen.findByRole('button', { name: 'retry_attachments' }));
        await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(3));
        expect(mocks.upload.mock.calls[2][0]).toBe('message-a');
        expect(mocks.upload.mock.calls[2][1].name).toBe('two.txt');
        expect(mocks.addMessage).toHaveBeenCalledTimes(1);
    });
    it('restores the unsent draft on message failure without uploading files', async () => {
        mocks.addMessage.mockRejectedValueOnce(new Error('Message rejected'));
        const { container } = await mount();
        compose(container);
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalled());
        expect(screen.getByLabelText('Reply fixture')).toHaveValue('Original reply');
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it.each(['before', 'after'] as const)('deduplicates the same socket attachment arriving %s HTTP acknowledgement', async (order) => {
        const first = deferred<unknown>();
        const second = deferred<unknown>();
        mocks.upload.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        const { container } = await mount();
        compose(container);
        await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
        const handler = mocks.on.mock.calls.find(([event]) => event === 'ticket:attachment_added')![1];
        const attachment = { id: 'attachment-a', fileName: 'one.txt' };
        if (order === 'before') act(() => handler({ messageId: 'message-a', attachment }));
        await act(async () => first.resolve(attachment));
        if (order === 'after') act(() => handler({ messageId: 'message-a', attachment }));
        await act(async () => second.reject(new Error('Storage unavailable')));
        expect(screen.getByText('Original reply').parentElement?.querySelectorAll('a')).toHaveLength(1);
    });
    it('prevents two submissions in the same render tick', async () => {
        const message = deferred<typeof confirmed>();
        mocks.addMessage.mockReturnValue(message.promise);
        await mount();
        fireEvent.change(screen.getByLabelText('Reply fixture'), { target: { value: 'Original reply' } });
        const button = screen.getByText('Submit reply fixture');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(mocks.addMessage).toHaveBeenCalledTimes(1);
        await act(async () => message.resolve(confirmed));
    });
    it('preserves a new draft typed while upload is in flight', async () => {
        const upload = deferred<unknown>();
        mocks.upload.mockReturnValueOnce(upload.promise);
        const { container } = await mount();
        compose(container);
        await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
        fireEvent.change(screen.getByLabelText('Reply fixture'), { target: { value: 'New draft' } });
        await act(async () => upload.reject(new Error('Storage unavailable')));
        expect(screen.getByLabelText('Reply fixture')).toHaveValue('New draft');
        expect(mocks.addMessage).toHaveBeenCalledTimes(1);
    });
    it.each(['resolve', 'reject'] as const)('preserves newer text and selected file identities when message creation %s completes', async (outcome) => {
        const message = deferred<typeof confirmed>();
        mocks.addMessage.mockReturnValueOnce(message.promise);
        const { container } = await mount();
        const originalFile = new File(['original'], 'same-name.txt');
        const newFile = new File(['new'], 'same-name.txt');
        compose(container, [originalFile]);
        fireEvent.change(screen.getByLabelText('Reply fixture'), { target: { value: 'Newer draft' } });
        fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [newFile] } });
        await act(async () => {
            if (outcome === 'resolve') message.resolve(confirmed);
            else message.reject(new Error('Message unavailable'));
        });
        expect(screen.getByLabelText('Reply fixture')).toHaveValue('Newer draft');
        expect(screen.getAllByText('same-name.txt')).toHaveLength(outcome === 'resolve' ? 1 : 2);
        if (outcome === 'resolve') expect(mocks.upload).toHaveBeenCalledWith('message-a', originalFile);
        else expect(mocks.upload).not.toHaveBeenCalled();
    });
    it('allows explicit discard of pending files without deleting or resending the confirmed message', async () => {
        mocks.upload.mockRejectedValueOnce(new Error('Storage unavailable'));
        const { container } = await mount();
        compose(container);
        const discard = await screen.findByRole('button', { name: 'discard_pending_attachments' });
        fireEvent.change(screen.getByLabelText('Reply fixture'), { target: { value: 'Next message' } });
        fireEvent.click(screen.getByText('Submit reply fixture'));
        expect(mocks.addMessage).toHaveBeenCalledTimes(1);
        fireEvent.click(discard);
        expect(screen.queryByRole('button', { name: 'retry_attachments' })).not.toBeInTheDocument();
        expect(screen.getByText('Original reply')).toBeInTheDocument();
        expect(mocks.addMessage).toHaveBeenCalledTimes(1);
        mocks.addMessage.mockResolvedValueOnce({ ...confirmed, id: 'message-b', message: 'Next message' });
        fireEvent.click(screen.getByText('Submit reply fixture'));
        await waitFor(() => expect(mocks.addMessage).toHaveBeenCalledTimes(2));
        expect(mocks.addMessage.mock.calls[1][1].message).toBe('Next message');
    });
    it('does not restore an acknowledged reply when refresh fails', async () => {
        mocks.get.mockResolvedValueOnce(initial()).mockRejectedValue(new Error('Refresh unavailable'));
        const { container } = await mount();
        compose(container, []);
        await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(2));
        expect(screen.getByLabelText('Reply fixture')).toHaveValue('');
        expect(screen.getByText('Original reply')).toBeInTheDocument();
    });
    it('does not upload remaining files or show a retry for a different ticket after navigation', async () => {
        const upload = deferred<unknown>();
        mocks.upload.mockReturnValueOnce(upload.promise);
        const { container, rerender } = await mount();
        compose(container);
        await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
        const params = Promise.resolve({ id: 'ticket-b' });
        await act(async () => rerender(<TicketDetailPage params={params} />));
        await screen.findByText('TICKET-B');
        await act(async () => upload.resolve({ id: 'attachment-a' }));
        expect(mocks.upload).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: 'retry_attachments' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Reply fixture')).toHaveValue('');
    });
});
