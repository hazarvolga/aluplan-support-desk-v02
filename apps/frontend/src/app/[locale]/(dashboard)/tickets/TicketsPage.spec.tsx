import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketsClient from './TicketsClient';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

// Mock the Auth Hook
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('TicketsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock confirm
        vi.stubGlobal('confirm', vi.fn(() => true));
    });

    it('renders empty state when no tickets', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'CUSTOMER' } });

        // Mock the tickets API to return empty list so loading resolves
        server.use(
            http.get(`${API_BASE}/tickets`, () => {
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);
        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });
    });

    it('renders tickets list after loading', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'CUSTOMER' } });

        const tickets = [
            { id: 't1', ticketNumber: 'SUP-00001', subject: 'Test ticket', status: 'OPEN', priority: 'MEDIUM', channel: 'WEB', createdAt: new Date().toISOString() }
        ];
        render(<TicketsClient initialTickets={tickets} initialTotal={1} />);

        // Use findBy to wait for the ticket subject
        const ticket = await screen.findByText(/Test ticket/i);
        expect(ticket).toBeDefined();
    });

    it('shows bulk actions only when tickets are selected (Admin)', async () => {
        (useAuth as any).mockReturnValue({
            user: { role: 'ADMIN', fullName: 'Admin' }
        });

        const tickets = [
            { id: 't1', ticketNumber: 'SUP-00001', subject: 'Test ticket', status: 'OPEN', priority: 'MEDIUM', channel: 'WEB', createdAt: new Date().toISOString() }
        ];
        render(<TicketsClient initialTickets={tickets} initialTotal={1} />);

        await waitFor(() => {
            expect(screen.queryByText(/table.loading/i)).toBeNull();
        });

        // Initially bulk bar should not be visible
        expect(screen.queryByText(/bulk.selected/i)).toBeNull();

        // Select the first ticket (first checkbox)
        const checkboxes = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
        // The first ticket checkbox is usually the 2nd checkbox (1st is "Select All")
        fireEvent.click(checkboxes[1]);

        await waitFor(() => {
            expect(screen.getByText(/bulk.selected/i)).toBeDefined();
            // Match the precise "01" in the selected count badge
            const selectedCount = screen.getByText((content, element) => {
                return element?.tagName.toLowerCase() === 'span' && content === '01';
            });
            expect(selectedCount).toBeDefined();
        });

        // Check for bulk action buttons
        expect(screen.getByText(/bulk.start_process/i)).toBeDefined();
        expect(screen.getByText(/bulk.resolve_all/i)).toBeDefined();
    });

    it('updates list when filter changes', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        const tickets = [
            { id: 't1', ticketNumber: 'SUP-00001', subject: 'Test ticket', status: 'OPEN', priority: 'MEDIUM', channel: 'WEB', createdAt: new Date().toISOString() }
        ];
        let requestedUrl = '';
        server.use(
            http.get(`${API_BASE}/tickets`, ({ request }) => {
                requestedUrl = request.url;
                return HttpResponse.json({ data: [], total: 0, statusCounts: { OPEN: 1, DRAFT: 2 } });
            }),
        );

        render(<TicketsClient initialTickets={tickets} initialTotal={1} />);

        await waitFor(() => {
            expect(screen.queryByText(/table.loading/i)).toBeNull();
        });

        fireEvent.click(screen.getByRole('button', { name: /status\.OPEN/i }));

        // Component should show loading again
        expect(screen.getByText(/table.loading/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.queryByText(/table.loading/i)).toBeNull();
        });

        const url = new URL(requestedUrl);
        expect(url.searchParams.get('status')).toBe('OPEN');
        expect(url.searchParams.get('includeStatusCounts')).toBe('true');
    });

    it('renders draft status as a first-class filter option', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        server.use(
            http.get(`${API_BASE}/tickets`, () => {
                return HttpResponse.json({
                    data: [],
                    total: 0,
                    statusCounts: { DRAFT: 1, OPEN: 0 },
                });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });

        expect(screen.getByRole('button', { name: /status\.DRAFT1/i })).toBeDefined();
    });

    it('does not show misleading zero counts when an older backend omits statusCounts', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        server.use(
            http.get(`${API_BASE}/tickets`, () => {
                return HttpResponse.json({ data: [], total: 3 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });

        expect(screen.getByRole('button', { name: /^status\.OPEN$/i })).toBeDefined();
        expect(screen.queryByRole('button', { name: /status\.OPEN\s+0/i })).toBeNull();
    });

    it('loads the support agent queue scoped to the signed-in user', async () => {
        (useAuth as any).mockReturnValue({
            user: { id: 'agent-1', role: 'ADMIN', isSupportTeamMember: true },
        });

        let requestedUrl = '';
        server.use(
            http.get(`${API_BASE}/tickets`, ({ request }) => {
                requestedUrl = request.url;
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });

        const url = new URL(requestedUrl);
        expect(url.searchParams.get('assignedTo')).toBe('agent-1');
        expect(url.searchParams.get('limit')).toBe('100');
        expect(url.searchParams.get('includeStatusCounts')).toBe('true');
    });

    it('keeps support scope when status chip changes', async () => {
        (useAuth as any).mockReturnValue({
            user: { id: 'agent-1', role: 'ADMIN', isSupportTeamMember: true },
        });

        const requestedUrls: string[] = [];
        server.use(
            http.get(`${API_BASE}/tickets`, ({ request }) => {
                requestedUrls.push(request.url);
                return HttpResponse.json({ data: [], total: 0, statusCounts: { OPEN: 2 } });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });

        fireEvent.click(screen.getByRole('button', { name: /status\.OPEN/i }));

        await waitFor(() => {
            const lastUrl = new URL(requestedUrls[requestedUrls.length - 1]);
            expect(lastUrl.searchParams.get('status')).toBe('OPEN');
            expect(lastUrl.searchParams.get('assignedTo')).toBe('agent-1');
        });
    });

    it('loads the full queue by default for admins outside support teams', async () => {
        (useAuth as any).mockReturnValue({
            user: { id: 'admin-1', role: 'ADMIN', isSupportTeamMember: false },
        });

        let requestedUrl = '';
        server.use(
            http.get(`${API_BASE}/tickets`, ({ request }) => {
                requestedUrl = request.url;
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });

        const url = new URL(requestedUrl);
        expect(url.searchParams.get('assignedTo')).toBeNull();
        expect(url.searchParams.get('limit')).toBe('100');
    });

    it('handles empty state', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'CUSTOMER' } });

        server.use(
            http.get(`${API_BASE}/tickets`, () => {
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table.empty/i)).toBeDefined();
        }, { timeout: 10000 });
    });
});
