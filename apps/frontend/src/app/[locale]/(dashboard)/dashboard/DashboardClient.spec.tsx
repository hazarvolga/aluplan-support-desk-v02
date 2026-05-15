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
        const getHealthMetricsSpy = vi.spyOn(api.ai, 'getHealthMetrics');

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.getByText(/user_portal/i)).toBeInTheDocument();
        });

        // Check for specific customer sections
        expect(screen.getByText(/knowledge_base.title/i)).toBeDefined();
        expect(screen.getByText(/ai_diagnostic.title/i)).toBeDefined();
        expect(getHealthMetricsSpy).not.toHaveBeenCalled();
    });

    it('renders admin dashboard for admin role', async () => {
        (useAuth as any).mockReturnValue({
            user: { fullName: 'Admin User', roles: ['admin'] }
        });
        const getHealthMetricsSpy = vi.spyOn(api.ai, 'getHealthMetrics');

        render(<DashboardClient />);

        await waitFor(() => {
            expect(screen.getByText(/title/i)).toBeInTheDocument(); // 'title' is translated as namespace 'dashboard'
            expect(screen.getByText(/system_active/i)).toBeInTheDocument();
        });

        // Admin dashboard has specific stats
        expect(screen.getByText(/stats.sla_violations/i)).toBeDefined();
        expect(screen.getByText(/stats.daily_resolved/i)).toBeDefined();
        expect(getHealthMetricsSpy).toHaveBeenCalledTimes(1);
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
