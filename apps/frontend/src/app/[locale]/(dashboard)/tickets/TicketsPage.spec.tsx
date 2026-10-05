import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketsClient from './TicketsClient';
import { useAuth } from '@/components/auth/role-guard';
import { server } from '@/test/setup';
import { delay, http, HttpResponse } from 'msw';
import { useSearchParams } from 'next/navigation';

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
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);
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

    it('shows the short table headers and ticket category', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        const tickets = [
            {
                id: 't-category',
                ticketNumber: 'SUP-00002',
                subject: 'License activation',
                status: 'OPEN',
                priority: 'HIGH',
                channel: 'WEB',
                createdAt: new Date().toISOString(),
                tags: ['licensing'],
                department: { name: 'Lisans ve Aktivasyon' },
            },
        ];

        render(<TicketsClient initialTickets={tickets} initialTotal={1} />);

        // The shared next-intl test mock returns translation keys. The display
        // helper's localized value is covered separately in its focused tests.
        expect(await screen.findByText('departments.licensing')).toBeDefined();
        expect(screen.getByText('table.header.category')).toBeDefined();
        expect(screen.getByText('table.header.subject')).toBeDefined();
    });

    it('sorts the current ticket page by category when the category header is clicked', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });

        const tickets = [
            {
                id: 't-b', ticketNumber: 'SUP-00003', subject: 'Beta', status: 'OPEN', priority: 'LOW', channel: 'WEB',
                createdAt: '2026-10-02T10:00:00.000Z', department: { name: 'technical_support' },
            },
            {
                id: 't-a', ticketNumber: 'SUP-00004', subject: 'Alpha', status: 'OPEN', priority: 'LOW', channel: 'WEB',
                createdAt: '2026-10-01T10:00:00.000Z', department: { name: 'TICKETS.CATEGORY.LICENSING' },
            },
        ];

        render(<TicketsClient initialTickets={tickets} initialTotal={2} />);

        const sortCategory = await screen.findByTestId('sort-category');
        fireEvent.click(sortCategory);

        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('departments.licensing');
        expect(rows[2]).toHaveTextContent('departments.technical_support');

        fireEvent.click(sortCategory);
        const reversedRows = screen.getAllByRole('row');
        expect(reversedRows[1]).toHaveTextContent('departments.technical_support');
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

    it('reloads when the review-center query changes on the same route', async () => {
        (useAuth as any).mockReturnValue({
            user: { id: 'agent-1', role: 'SUPPORT_AGENT', isSupportTeamMember: true },
        });
        vi.mocked(useSearchParams).mockReturnValue(
            new URLSearchParams('chatStatus=REQUESTED&activeOnly=true') as never,
        );
        const requestedUrls: string[] = [];
        server.use(
            http.get(`${API_BASE}/tickets`, ({ request }) => {
                requestedUrls.push(request.url);
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        const view = render(<TicketsClient initialTickets={[]} initialTotal={0} />);
        await waitFor(() => expect(requestedUrls.length).toBeGreaterThan(0));

        vi.mocked(useSearchParams).mockReturnValue(
            new URLSearchParams('assignment=UNASSIGNED&activeOnly=true') as never,
        );
        view.rerender(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => expect(requestedUrls.length).toBeGreaterThan(1));
        const lastUrl = new URL(requestedUrls.at(-1)!);
        expect(lastUrl.searchParams.get('chatStatus')).toBeNull();
        expect(lastUrl.searchParams.get('assignment')).toBe('UNASSIGNED');
        expect(lastUrl.searchParams.get('activeOnly')).toBe('true');
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

    it('distinguishes a loading failure from an empty queue and retries', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'CUSTOMER' } });
        let attempts = 0;

        server.use(
            http.get(`${API_BASE}/tickets`, () => {
                attempts += 1;
                if (attempts === 1) {
                    return HttpResponse.json({ message: 'temporary failure' }, { status: 503 });
                }
                return HttpResponse.json({ data: [], total: 0 });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);

        await waitFor(() => {
            expect(screen.getByText(/table\.load_error/i)).toBeDefined();
        }, { timeout: 10000 });
        expect(screen.queryByText(/table\.empty/i)).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /table\.retry/i }));

        await waitFor(() => {
            expect(screen.getByText(/table\.empty/i)).toBeDefined();
        }, { timeout: 10000 });
        expect(attempts).toBe(2);
    });

    it('ignores a stale failed request after a newer filtered request succeeds', async () => {
        (useAuth as any).mockReturnValue({ user: { role: 'ADMIN' } });
        let staleRequestCompleted = false;

        server.use(
            http.get(`${API_BASE}/tickets`, async ({ request }) => {
                const status = new URL(request.url).searchParams.get('status');
                if (!status) {
                    await delay(100);
                    staleRequestCompleted = true;
                    return HttpResponse.json({ message: 'stale failure' }, { status: 503 });
                }

                return HttpResponse.json({
                    data: [{
                        id: 't-new',
                        ticketNumber: 'SUP-NEW',
                        subject: 'Newest filtered result',
                        status: 'OPEN',
                        priority: 'MEDIUM',
                        channel: 'WEB',
                        createdAt: new Date().toISOString(),
                    }],
                    total: 1,
                    statusCounts: { OPEN: 1 },
                });
            }),
        );

        render(<TicketsClient initialTickets={[]} initialTotal={0} />);
        fireEvent.click(screen.getByRole('button', { name: /status\.OPEN/i }));

        await waitFor(() => {
            expect(screen.getByText('Newest filtered result')).toBeDefined();
        });
        await waitFor(() => {
            expect(staleRequestCompleted).toBe(true);
            expect(screen.queryByText(/table\.load_error/i)).toBeNull();
            expect(screen.getByText('Newest filtered result')).toBeDefined();
        });
    });
});
