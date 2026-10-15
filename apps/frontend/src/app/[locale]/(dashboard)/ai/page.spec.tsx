import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AiPage from './page';

const mocks = vi.hoisted(() => ({
    replace: vi.fn(), query: vi.fn(), getJobStatus: vi.fn(), feedback: vi.fn(), connect: vi.fn(), on: vi.fn(), off: vi.fn(),
    user: { id: 'staff-1', role: 'ADMIN' } as { id: string; role: string | { name?: string } } | null,
    authLoading: false,
    handlers: {} as Record<string, (data: unknown) => void>,
    router: { replace: vi.fn() },
}));

vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'tr' }), useRouter: () => mocks.router }));
vi.mock('@/components/auth/role-guard', () => ({ useAuth: () => ({ user: mocks.user, loading: mocks.authLoading }) }));
vi.mock('@/lib/api', () => ({ api: { ai: { query: mocks.query, getJobStatus: mocks.getJobStatus, feedback: mocks.feedback } } }));
vi.mock('@/lib/socket', () => ({ getSocket: () => ({
    connect: mocks.connect,
    on: (event: string, cb: (data: unknown) => void) => { mocks.on(event, cb); mocks.handlers[event] = cb; },
    off: mocks.off,
}) }));
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, { get: (_target, element: string) => ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => React.createElement(element, props, children) }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/ai/AiVisualEvidence', () => ({ AiVisualEvidence: ({ visuals }: { visuals?: unknown[] }) => <div>visuals:{visuals?.length || 0}</div> }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

describe('AiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.handlers = {};
        mocks.user = { id: 'staff-1', role: 'ADMIN' };
        mocks.authLoading = false;
        mocks.router.replace = mocks.replace;
        mocks.query.mockResolvedValue({ answer: 'Direct answer', confidence: 'HIGH', sources: [], interactionId: 'int-1', suggestTicket: false });
        mocks.getJobStatus.mockResolvedValue({ jobId: 'unused', status: 'PROCESSING' });
        mocks.feedback.mockResolvedValue(undefined);
        class TestFileReader {
            result: string | null = null;
            onload: null | (() => void) = null;
            onerror: null | ((error: unknown) => void) = null;
            readAsDataURL(file: File) {
                queueMicrotask(() => {
                    this.result = `data:${file.type};base64,YmV0YQ==`;
                    this.onload?.();
                });
            }
        }
        vi.stubGlobal('FileReader', TestFileReader);
    });

    it('fails closed while auth loads and redirects unauthenticated, customer and unknown roles', async () => {
        mocks.authLoading = true;
        const view = render(<AiPage />);
        expect(view.container).toBeEmptyDOMElement();

        mocks.authLoading = false;
        mocks.user = null;
        view.rerender(<AiPage />);
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/login'));

        mocks.user = { id: 'customer-1', role: { name: 'CUSTOMER' } };
        view.rerender(<AiPage />);
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/my-tickets'));
        expect(mocks.connect).not.toHaveBeenCalled();

        mocks.replace.mockClear();
        mocks.user = { id: 'unknown-1', role: { name: 'NEW_UNTRUSTED_ROLE' } };
        view.rerender(<AiPage />);
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/my-tickets'));
        expect(mocks.connect).not.toHaveBeenCalled();
    });

    it('submits conversation history, renders a direct response and records feedback only once', async () => {
        render(<AiPage />);
        expect(mocks.connect).toHaveBeenCalledOnce();
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: '  lisans sorusu  ' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);

        expect(await screen.findByText('Direct answer')).toBeInTheDocument();
        expect(mocks.query).toHaveBeenCalledWith('lisans sorusu', null, null, 'tr', [
            { role: 'user', content: 'lisans sorusu' },
        ], []);
        fireEvent.click(screen.getAllByRole('button').find(button => button.querySelector('.lucide-thumbs-up'))!);
        await waitFor(() => expect(mocks.feedback).toHaveBeenCalledWith('int-1', 5));
        expect(screen.getByText('feedback.success')).toBeInTheDocument();
    });

    it('accepts multiple attachments and removes only the selected file', () => {
        render(<AiPage />);
        const upload = document.querySelector('#ai-upload') as HTMLInputElement;
        const first = new File(['alpha'], 'alpha.txt', { type: 'text/plain' });
        const second = new File(['beta'], 'beta.txt', { type: 'text/plain' });
        fireEvent.change(upload, { target: { files: [first, second] } });
        expect(screen.getByText('alpha.txt')).toBeInTheDocument();
        fireEvent.click(screen.getByText('alpha.txt').parentElement!.querySelector('button')!);
        expect(screen.queryByText('alpha.txt')).not.toBeInTheDocument();
        expect(screen.getByText('beta.txt')).toBeInTheDocument();
        expect(mocks.query).not.toHaveBeenCalled();
    });

    it('renders streamed chunks and the completed async response with evidence, source and ticket link', async () => {
        mocks.query.mockResolvedValueOnce({ jobId: 'job-1' });
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'stream' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());
        await act(async () => { await Promise.resolve(); });

        act(() => {
            mocks.handlers.AI_CHUNK({ jobId: 'job-1', chunk: 'Parça ' });
            mocks.handlers.AI_CHUNK({ jobId: 'job-1', chunk: 'iki' });
        });
        expect(await screen.findByText(/Parça iki/)).toBeInTheDocument();
        act(() => mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'job-1', result: {
                answer: null, response: 'Tamamlandı', confidence: 'MEDIUM', interactionId: 'int-2', suggestTicket: true,
                sources: [{ articleId: 'a-1', title: 'Kaynak', similarity: 0.876 }], visuals: [{ id: 'v-1' }],
            } }));

        expect(await screen.findByText('Tamamlandı')).toBeInTheDocument();
        expect(screen.getByText('Kaynak')).toBeInTheDocument();
        expect(screen.getByText('%88')).toBeInTheDocument();
        expect(screen.getByText('visuals:1')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'suggest_ticket.cta' })).toHaveAttribute('href', '/tickets/new');
    });

    it('shows a safe error message when querying fails and unregisters socket listeners', async () => {
        mocks.query.mockRejectedValueOnce(new Error('secret backend detail'));
        const view = render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'fail' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        expect(await screen.findByText('response.error')).toBeInTheDocument();
        expect(screen.queryByText('secret backend detail')).not.toBeInTheDocument();
        view.unmount();
        expect(mocks.off).toHaveBeenCalledWith('AI_CHUNK', expect.any(Function));
        expect(mocks.off).toHaveBeenCalledWith('AI_QUERY_COMPLETED', expect.any(Function));
        expect(mocks.off).toHaveBeenCalledWith('AI_QUERY_FAILED', expect.any(Function));
    });

    it('ends queued loading safely when the backend emits a failed job', async () => {
        mocks.query.mockResolvedValueOnce({ jobId: 'job-failed' });
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'queued failure' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByText('AI düşünüyor...')).toBeInTheDocument());

        act(() => mocks.handlers.AI_QUERY_FAILED({ jobId: 'job-failed', error: 'private provider details' }));
        expect(await screen.findByText('response.error')).toBeInTheDocument();
        expect(screen.queryByText('private provider details')).not.toBeInTheDocument();
        expect(screen.queryByText('AI düşünüyor...')).not.toBeInTheDocument();

        act(() => {
            mocks.handlers.AI_CHUNK({ jobId: 'job-failed', chunk: 'Geç parça' });
            mocks.handlers.AI_QUERY_FAILED({ jobId: 'job-failed', error: 'duplicate failure' });
        });
        expect(screen.queryByText('Geç parça')).not.toBeInTheDocument();
        expect(screen.getAllByText('response.error')).toHaveLength(1);
    });

    it('reconciles an early completed event that arrives before the HTTP job id response', async () => {
        let resolveQuery!: (value: { jobId: string }) => void;
        mocks.query.mockReturnValueOnce(new Promise(resolve => { resolveQuery = resolve; }));
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'fast completion' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());

        act(() => mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'fast-job', result: {
            answer: 'Erken tamamlandı', confidence: 'HIGH', interactionId: 'fast-int', suggestTicket: false, sources: [],
        } }));
        expect(screen.queryByText('Erken tamamlandı')).not.toBeInTheDocument();

        await act(async () => { resolveQuery({ jobId: 'fast-job' }); });

        expect(await screen.findByText('Erken tamamlandı')).toBeInTheDocument();
        expect(screen.queryByText('AI düşünüyor...')).not.toBeInTheDocument();
    });

    it('reconciles an early failed event without exposing its payload or leaving loading stuck', async () => {
        let resolveQuery!: (value: { jobId: string }) => void;
        mocks.query.mockReturnValueOnce(new Promise(resolve => { resolveQuery = resolve; }));
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'fast failure' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());

        act(() => mocks.handlers.AI_QUERY_FAILED({
            jobId: 'fast-failed-job',
            error: { code: 'AI_QUERY_FAILED', message: 'private transport detail' },
        }));
        await act(async () => { resolveQuery({ jobId: 'fast-failed-job' }); });

        expect(await screen.findByText('response.error')).toBeInTheDocument();
        expect(screen.queryByText('private transport detail')).not.toBeInTheDocument();
        expect(screen.queryByText('AI düşünüyor...')).not.toBeInTheDocument();
    });

    it('ignores socket events while there is no active AI job', () => {
        render(<AiPage />);

        act(() => {
            mocks.handlers.AI_CHUNK({ jobId: 'idle-job', chunk: 'Yabancı parça' });
            mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'idle-job', result: {
                answer: 'Yabancı cevap', confidence: 'HIGH', interactionId: 'idle-int', suggestTicket: false, sources: [],
            } });
            mocks.handlers.AI_QUERY_FAILED({ jobId: 'idle-job', error: 'private provider details' });
        });

        expect(screen.queryByText('Yabancı parça')).not.toBeInTheDocument();
        expect(screen.queryByText('Yabancı cevap')).not.toBeInTheDocument();
        expect(screen.queryByText('response.error')).not.toBeInTheDocument();
    });

    it('accepts events only for the active job and ignores foreign job events', async () => {
        mocks.query.mockResolvedValueOnce({ jobId: 'active-job' });
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'active request' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());
        await act(async () => { await Promise.resolve(); });

        act(() => {
            mocks.handlers.AI_CHUNK({ jobId: 'foreign-job', chunk: 'Yabancı parça' });
            mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'foreign-job', result: {
                answer: 'Yabancı cevap', confidence: 'HIGH', interactionId: 'foreign-int', suggestTicket: false, sources: [],
            } });
            mocks.handlers.AI_QUERY_FAILED({ jobId: 'foreign-job', error: 'private provider details' });
        });

        expect(screen.queryByText('Yabancı parça')).not.toBeInTheDocument();
        expect(screen.queryByText('Yabancı cevap')).not.toBeInTheDocument();
        expect(screen.queryByText('response.error')).not.toBeInTheDocument();
        expect(screen.getByText('AI düşünüyor...')).toBeInTheDocument();

        act(() => mocks.handlers.AI_CHUNK({ jobId: 'active-job', chunk: 'Doğru parça' }));
        expect(screen.getByText(/Doğru parça/)).toBeInTheDocument();
    });

    it('clears the active job after completion and ignores duplicate or stale terminal events', async () => {
        mocks.query.mockResolvedValueOnce({ jobId: 'completed-job' });
        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'complete once' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await waitFor(() => expect(mocks.query).toHaveBeenCalled());
        await act(async () => { await Promise.resolve(); });

        act(() => mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'completed-job', result: {
            answer: 'Tek cevap', confidence: 'HIGH', interactionId: 'completed-int', suggestTicket: false, sources: [],
        } }));
        expect(await screen.findByText('Tek cevap')).toBeInTheDocument();

        act(() => {
            mocks.handlers.AI_CHUNK({ jobId: 'completed-job', chunk: 'Geç parça' });
            mocks.handlers.AI_QUERY_COMPLETED({ jobId: 'completed-job', result: {
                answer: 'Tekrarlanan cevap', confidence: 'HIGH', interactionId: 'duplicate-int', suggestTicket: false, sources: [],
            } });
            mocks.handlers.AI_QUERY_FAILED({ jobId: 'completed-job', error: 'late failure' });
        });

        expect(screen.queryByText('Geç parça')).not.toBeInTheDocument();
        expect(screen.queryByText('Tekrarlanan cevap')).not.toBeInTheDocument();
        expect(screen.queryByText('response.error')).not.toBeInTheDocument();
        expect(screen.getAllByText('Tek cevap')).toHaveLength(1);
    });

    it('polls the authenticated job status when the socket terminal event is lost', async () => {
        vi.useFakeTimers();
        mocks.query.mockResolvedValueOnce({ jobId: 'polled-job' });
        mocks.getJobStatus
            .mockResolvedValueOnce({ jobId: 'polled-job', status: 'PROCESSING' })
            .mockResolvedValueOnce({
                jobId: 'polled-job',
                status: 'COMPLETED',
                result: {
                    answer: 'Polling tamamladı', confidence: 'HIGH', interactionId: 'poll-int', suggestTicket: false, sources: [],
                },
            });

        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'poll request' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await act(async () => { await Promise.resolve(); });

        await act(async () => { await vi.advanceTimersByTimeAsync(4_000); });

        expect(mocks.getJobStatus).toHaveBeenCalledWith('polled-job');
        expect(screen.getByText('Polling tamamladı')).toBeInTheDocument();
        expect(screen.queryByText('AI düşünüyor...')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('fails safely after bounded polling instead of loading forever', async () => {
        vi.useFakeTimers();
        mocks.query.mockResolvedValueOnce({ jobId: 'stalled-job' });
        mocks.getJobStatus.mockResolvedValue({ jobId: 'stalled-job', status: 'PROCESSING' });

        render(<AiPage />);
        fireEvent.change(screen.getByPlaceholderText('input.placeholder'), { target: { value: 'stalled request' } });
        fireEvent.submit(screen.getByPlaceholderText('input.placeholder').closest('form')!);
        await act(async () => { await Promise.resolve(); });

        await act(async () => { await vi.advanceTimersByTimeAsync(122_000); });

        expect(screen.getByText('response.error')).toBeInTheDocument();
        expect(screen.queryByText('AI düşünüyor...')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});
