import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiInteractionHistory } from './ai-interaction-history';

const { listInteractions } = vi.hoisted(() => ({ listInteractions: vi.fn() }));

vi.mock('@/lib/api', () => ({
    api: {
        ai: { listInteractions },
    },
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
}));

describe('AiInteractionHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listInteractions.mockResolvedValue({
            data: [{
                id: 'interaction-1',
                userQuery: 'How do I restore the toolbar?',
                responseGenerated: '## Solution\n1. Open workspace settings.\n<script>alert(1)</script>',
                confidenceBand: 'HIGH',
                similarityScore: 0.91,
                autoAnswered: true,
                ticketCreated: false,
                channel: 'WEB',
                provider: 'gemini',
                model: 'gemini-2.5-flash',
                createdAt: '2026-08-06T10:00:00.000Z',
                user: { id: 'user-1', fullName: 'Ada User', email: 'ada@example.com', companyName: 'Ada Ltd' },
                ticket: null,
                matchedArticle: { id: 'article-1', title: 'Workspace reset' },
            }],
            total: 1,
            page: 1,
            limit: 20,
            pages: 1,
        });
    });

    it('shows the user, exact question, safe AI answer and ticketless state', async () => {
        const { container } = render(<AiInteractionHistory />);

        expect(await screen.findByText('Ada User')).toBeInTheDocument();
        expect(screen.getByText('How do I restore the toolbar?')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Solution' })).toBeInTheDocument();
        expect(screen.getAllByText('ticketless')).toHaveLength(2);
        expect(container.querySelector('script')).toBeNull();
        expect(listInteractions).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
    });

    it('applies the ticket-state filter through the API', async () => {
        render(<AiInteractionHistory />);
        await screen.findByText('Ada User');

        fireEvent.change(screen.getByLabelText('ticket_state'), { target: { value: 'TICKETED' } });

        await waitFor(() => expect(listInteractions).toHaveBeenLastCalledWith(expect.objectContaining({ ticketState: 'TICKETED' })));
    });
});
