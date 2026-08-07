import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';
import KnowledgePoolPage from './page';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('KnowledgePoolPage review-center navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
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
});
