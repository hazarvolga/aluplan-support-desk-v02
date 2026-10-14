import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KnowledgeBasePage from './page';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { useSearchParams } from 'next/navigation';

// Mock the Auth Hook
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const mockedUseAuth = vi.mocked(useAuth);
const setAuthUser = (role: string) => mockedUseAuth.mockReturnValue({
    user: { id: 'user-1', fullName: 'Test User', email: 'test@example.com', role },
    loading: false,
    backendUnavailable: false,
    login: vi.fn(),
    logout: vi.fn(),
    retryAuth: vi.fn(),
});

describe('KnowledgeBasePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
    });

    it('renders loading state initially', () => {
        setAuthUser('ADMIN');
        render(<KnowledgeBasePage />);
        expect(screen.getByText(/empty.loading/i)).toBeDefined();
    });

    it('renders articles list after loading', async () => {
        setAuthUser('ADMIN');

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.queryByText(/empty.loading/i)).toBeNull();
        });

        expect(await screen.findByText(/How to reset password/i)).toBeDefined();
    });

    it('shows action buttons for staff members', async () => {
        setAuthUser('ADMIN');

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText(/buttons.new_article/i)).toBeDefined();
        });
    });

    it('hides action buttons for customer members', async () => {
        setAuthUser('CUSTOMER');

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.queryByText(/buttons.new_article/i)).toBeNull();
        });
    });

    it('handles empty state correctly', async () => {
        setAuthUser('ADMIN');

        // Override MSW for empty state
        server.use(
            http.get(`${API_BASE}/kb/articles`, () => {
                return HttpResponse.json({ data: [], total: 0 });
            })
        );

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText(/empty.no_records/i)).toBeDefined();
        });
    });

    it('reloads when the review status query changes on the same route', async () => {
        setAuthUser('ADMIN');
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('status=REVIEW') as never);
        const requestedStatuses: Array<string | null> = [];
        server.use(
            http.get(`${API_BASE}/kb/articles`, ({ request }) => {
                requestedStatuses.push(new URL(request.url).searchParams.get('status'));
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        const view = render(<KnowledgeBasePage />);
        await waitFor(() => expect(requestedStatuses).toContain('REVIEW'));

        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
        view.rerender(<KnowledgeBasePage />);

        await waitFor(() => expect(requestedStatuses.at(-1)).toBe('PUBLISHED'));
    });
});
