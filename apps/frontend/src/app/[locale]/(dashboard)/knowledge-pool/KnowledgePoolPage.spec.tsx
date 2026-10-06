import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';
import KnowledgePoolPage from './page';
import enMessages from '../../../../../messages/en.json';
import deMessages from '../../../../../messages/de.json';
import trMessages from '../../../../../messages/tr.json';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('KnowledgePoolPage review-center navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
    });

    it.each([
        ['en', enMessages],
        ['de', deMessages],
        ['tr', trMessages],
    ])('keeps controlled crawler messages in the admin namespace for %s', (_locale, messages) => {
        const crawler = (messages as any).admin.knowledge_pool.crawler;
        expect(crawler.buttons.start_slow_crawl).toBeTruthy();
        expect(crawler.buttons.approve).toBeTruthy();
        expect(crawler.run.status.queued).toBeTruthy();
        expect(crawler.toasts.run_started).toBeTruthy();
    });

    it('switches from the crawler queue to sources on a same-route query transition', async () => {
        vi.mocked(useSearchParams).mockReturnValue(
            new URLSearchParams('tab=crawler&status=PENDING_REVIEW') as never,
        );
        const crawlerStatuses: Array<string | null> = [];
        let sourceRequests = 0;
        server.use(
            http.get(`${API_BASE}/knowledge-pool/crawl/candidates`, ({ request }) => {
                crawlerStatuses.push(new URL(request.url).searchParams.get('status'));
                return HttpResponse.json([]);
            }),
            http.get(`${API_BASE}/knowledge-pool/sources`, () => {
                sourceRequests += 1;
                return HttpResponse.json([]);
            }),
        );

        const view = render(<KnowledgePoolPage />);
        await waitFor(() => expect(crawlerStatuses).toContain('PENDING_REVIEW'));

        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
        view.rerender(<KnowledgePoolPage />);

        await waitFor(() => expect(sourceRequests).toBeGreaterThan(0));
    });

    it('starts a durable low-rate LearnNow crawl instead of saving candidates synchronously', async () => {
        const user = userEvent.setup();
        vi.mocked(useSearchParams).mockReturnValue(
            new URLSearchParams('tab=crawler') as never,
        );
        let startRequests = 0;
        server.use(
            http.get(`${API_BASE}/knowledge-pool/sources`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/knowledge-pool/crawl/candidates`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/knowledge-pool/crawl/learnnow/runs/latest`, () => HttpResponse.json(null)),
            http.post(`${API_BASE}/knowledge-pool/crawl/learnnow/runs`, async ({ request }) => {
                startRequests += 1;
                const body = await request.json() as Record<string, unknown>;
                expect(body).toMatchObject({ maxCandidates: 5 });
                return HttpResponse.json({
                    id: '00000000-0000-4000-8000-000000000001',
                    status: 'QUEUED',
                    maxCandidates: 5,
                    processedCount: 0,
                    insertedCount: 0,
                    skippedCount: 0,
                }, { status: 202 });
            }),
        );

        render(<KnowledgePoolPage />);

        await user.click(await screen.findByRole('tab', { name: 'tabs.crawler' }));
        const startButton = await screen.findByRole('button', { name: 'crawler.buttons.start_slow_crawl' });
        await user.click(startButton);

        await waitFor(() => expect(startRequests).toBe(1));
        expect(await screen.findByText('crawler.run.status.queued')).toBeInTheDocument();
    });

    it('keeps the crawler queue mounted when no previous LearnNow run exists', async () => {
        vi.mocked(useSearchParams).mockReturnValue(
            new URLSearchParams('tab=crawler&status=PENDING_REVIEW') as never,
        );
        server.use(
            http.get(`${API_BASE}/knowledge-pool/crawl/candidates`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/knowledge-pool/crawl/learnnow/runs/latest`, () => (
                new HttpResponse(null, { status: 200 })
            )),
        );

        render(<KnowledgePoolPage />);

        expect(await screen.findByText('crawler.title')).toBeInTheDocument();
        expect(screen.getByText('crawler.no_candidates')).toBeInTheDocument();
    });

    it('continues polling when a pause request fails', async () => {
        const user = userEvent.setup();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=crawler') as never);
        const scheduledPolls: Array<() => void | Promise<void>> = [];
        const nativeSetTimeout = window.setTimeout.bind(window);
        const timeoutSpy = vi.spyOn(window, 'setTimeout').mockImplementation(((handler: TimerHandler, delay?: number, ...args: any[]) => {
            if (delay === 10_000 && typeof handler === 'function') {
                scheduledPolls.push(handler as () => void | Promise<void>);
                return 98765;
            }
            return nativeSetTimeout(handler, delay, ...args);
        }) as typeof window.setTimeout);
        let statusPolls = 0;
        const runningRun = {
            id: '00000000-0000-4000-8000-000000000002',
            status: 'RUNNING',
            maxCandidates: 5,
            processedCount: 0,
            insertedCount: 0,
            skippedCount: 0,
        };
        server.use(
            http.get(`${API_BASE}/knowledge-pool/sources`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/knowledge-pool/crawl/candidates`, () => HttpResponse.json([])),
            http.get(`${API_BASE}/knowledge-pool/crawl/learnnow/runs/latest`, () => HttpResponse.json(runningRun)),
            http.get(`${API_BASE}/knowledge-pool/crawl/learnnow/runs/${runningRun.id}`, () => {
                statusPolls += 1;
                return HttpResponse.json(runningRun);
            }),
            http.post(`${API_BASE}/knowledge-pool/crawl/learnnow/runs/${runningRun.id}/pause`, () => (
                HttpResponse.json({ message: 'temporary failure' }, { status: 503 })
            )),
        );

        try {
            render(<KnowledgePoolPage />);
            await user.click(await screen.findByRole('tab', { name: 'tabs.crawler' }));
            const pauseButton = await screen.findByRole('button', { name: 'crawler.buttons.pause' });
            await waitFor(() => expect(scheduledPolls.length).toBeGreaterThan(0));
            fireEvent.click(pauseButton);

            const firstPoll = scheduledPolls.shift();
            expect(firstPoll).toBeDefined();
            await act(async () => { await firstPoll?.(); });

            await waitFor(() => expect(statusPolls).toBe(1));
            expect(scheduledPolls.length).toBeGreaterThan(0);
        } finally {
            timeoutSpy.mockRestore();
        }
    });
});
