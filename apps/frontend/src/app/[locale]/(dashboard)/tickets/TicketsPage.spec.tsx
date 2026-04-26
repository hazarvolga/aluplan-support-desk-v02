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
        render(<TicketsClient initialTickets={tickets} initialTotal={1} />);

        await waitFor(() => {
            expect(screen.queryByText(/table.loading/i)).toBeNull();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'OPEN' } });

        // Component should show loading again
        expect(screen.getByText(/table.loading/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.queryByText(/table.loading/i)).toBeNull();
        });
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
