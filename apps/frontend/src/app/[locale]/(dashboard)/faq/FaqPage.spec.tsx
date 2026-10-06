import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import FaqPage from './page';

vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const pendingFaq = {
    id: 'faq-1',
    question: 'How is this FAQ reviewed?',
    answer: 'Review the complete answer.',
    status: 'PENDING_REVIEW',
    frequency: 1,
    confidenceScore: 0.9,
};

describe('FaqPage moderation actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get(`${API_BASE}/faq`, () => HttpResponse.json({ data: [pendingFaq] })),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('keeps dismissal available to reviewers but hides admin-only deletion', async () => {
        const user = userEvent.setup();
        let dismissRequests = 0;
        vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPPORT_AGENT' } } as never);
        server.use(
            http.post(`${API_BASE}/faq/faq-1/dismiss`, () => {
                dismissRequests += 1;
                return HttpResponse.json({ ...pendingFaq, status: 'DISMISSED' });
            }),
        );

        render(<FaqPage />);

        expect(await screen.findByRole('button', { name: 'dismiss' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'dismiss' }));

        await waitFor(() => expect(dismissRequests).toBe(1));
    });

    it('requires confirmation before an admin can delete and routes the action to DELETE', async () => {
        const user = userEvent.setup();
        let deleteRequests = 0;
        const confirmMock = vi.fn()
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true);
        vi.stubGlobal('confirm', confirmMock);
        vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN' } } as never);
        server.use(
            http.delete(`${API_BASE}/faq/faq-1`, () => {
                deleteRequests += 1;
                return HttpResponse.json({ ...pendingFaq, deletedAt: new Date().toISOString() });
            }),
        );

        render(<FaqPage />);

        const deleteButton = await screen.findByRole('button', { name: 'delete' });
        await user.click(deleteButton);
        expect(deleteRequests).toBe(0);

        await user.click(deleteButton);
        await waitFor(() => expect(deleteRequests).toBe(1));
        expect(confirmMock).toHaveBeenCalledTimes(2);
    });
});
