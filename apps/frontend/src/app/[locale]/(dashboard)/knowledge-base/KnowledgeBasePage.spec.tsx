import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KnowledgeBasePage from './page';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

// Mock the Auth Hook
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('KnowledgeBasePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });
        render(<KnowledgeBasePage />);
        expect(screen.getByText(/empty.loading/i)).toBeDefined();
    });

    it('renders articles list after loading', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.queryByText(/empty.loading/i)).toBeNull();
        });

        expect(await screen.findByText(/How to reset password/i)).toBeDefined();
    });

    it('shows action buttons for staff members', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText(/buttons.new_article/i)).toBeDefined();
        });
    });

    it('hides action buttons for customer members', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'CUSTOMER' } });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.queryByText(/buttons.new_article/i)).toBeNull();
        });
    });

    it('handles empty state correctly', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

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
});
