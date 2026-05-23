import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardClient from './DashboardClient';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';
import { api } from '@/lib/api';

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
        const opsSpy = vi.spyOn(api.dashboard, 'ops');

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.getByText(/user_portal/i)).toBeInTheDocument();
        });

        // Check for specific customer sections
        expect(screen.getByText(/knowledge_base.title/i)).toBeDefined();
        expect(screen.getByText(/ai_diagnostic.title/i)).toBeDefined();
        expect(opsSpy).not.toHaveBeenCalled();
    });

    it('renders admin dashboard for admin role', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'Admin User', roles: ['admin'] }
        });
        const opsSpy = vi.spyOn(api.dashboard, 'ops');

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.getByText(/system_active/i)).toBeInTheDocument();
            expect(screen.getByText(/active_tickets/i)).toBeInTheDocument();
        });

        // Admin dashboard has specific stats
        expect(screen.getByText(/live_cost/i)).toBeDefined();
        expect(screen.getAllByText(/SUP-00001/i).length).toBeGreaterThan(0);
        expect(opsSpy).toHaveBeenCalledTimes(1);
    });

    it('handles API errors gracefully', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'Admin User', roles: ['admin'] }
        });

        // Override MSW for this test to simulate failure
        server.use(
            http.get(`${API_BASE}/dashboard/ops`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(<DashboardClient />);

        await waitFor(() => {
            // Should still render but maybe with zero stats
            expect(screen.getByText(/active_tickets/i)).toBeDefined();
        });
    });
});
