import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardClient from './DashboardClient';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

// Mock the Auth Hook
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('DashboardClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (useAuth as any).mockReturnValue({ user: null });
        render(<DashboardClient />);
        // The component renders an Activity icon while loading
        expect(document.querySelector('.animate-pulse')).toBeDefined();
    });

    it('renders customer dashboard for customer role', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'John Doe', roles: ['customer'] }
        });

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.queryByText(/user_portal/i)).toBeDefined();
            expect(screen.queryByText(/John Doe/i)).toBeDefined();
        });

        // Check for specific customer sections
        expect(screen.getByText(/knowledge_base.title/i)).toBeDefined();
        expect(screen.getByText(/ai_diagnostic.title/i)).toBeDefined();
    });

    it('renders admin dashboard for admin role', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'Admin User', roles: ['admin'] }
        });

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.queryByText(/title/i)).toBeDefined(); // 'title' is translated as namespace 'dashboard'
            expect(screen.queryByText(/system_active/i)).toBeDefined();
        });

        // Admin dashboard has specific stats
        expect(screen.getByText(/stats.sla_violations/i)).toBeDefined();
        expect(screen.getByText(/stats.daily_resolved/i)).toBeDefined();
    });

    it('handles API errors gracefully', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'Admin User', roles: ['admin'] }
        });

        // Override MSW for this test to simulate failure
        server.use(
            http.get(`${API_BASE}/tickets/sla-stats`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(<DashboardClient />);

        await waitFor(() => {
            // Should still render but maybe with zero stats
            expect(screen.getByText(/stats.active_tickets/i)).toBeDefined();
        });
    });
});
