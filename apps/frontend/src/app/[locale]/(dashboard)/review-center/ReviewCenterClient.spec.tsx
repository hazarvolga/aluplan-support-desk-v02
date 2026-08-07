import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import ReviewCenterClient from './ReviewCenterClient';

vi.mock('@/lib/api', () => ({
    api: {
        reviewCenter: {
            summary: vi.fn(),
        },
    },
}));

describe('ReviewCenterClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders authorized action cards and keeps audit outside pending work', async () => {
        vi.mocked(api.reviewCenter.summary).mockResolvedValue({
            pendingActions: 3,
            items: [
                {
                    id: 'live-chat-requests',
                    kind: 'ACTION',
                    group: 'OPERATIONAL',
                    href: '/tickets?chatStatus=REQUESTED',
                    priority: 'URGENT',
                    count: 3,
                },
                {
                    id: 'ai-interaction-history',
                    kind: 'AUDIT',
                    group: 'FOLLOW_UP',
                    href: '/admin/ai-interactions',
                    priority: 'NORMAL',
                },
            ],
        });

        render(<ReviewCenterClient />);

        expect(await screen.findByText('items.live-chat-requests.title')).toBeInTheDocument();
        expect(screen.getByText('items.ai-interaction-history.title')).toBeInTheDocument();
        expect(screen.getByTestId('pending-actions-total')).toHaveTextContent('3');
        expect(screen.getByTestId('audit-ai-interaction-history')).not.toHaveTextContent('undefined');
    });

    it('renders a useful empty state when no authorized work exists', async () => {
        vi.mocked(api.reviewCenter.summary).mockResolvedValue({ items: [], pendingActions: 0 });

        render(<ReviewCenterClient />);

        expect(await screen.findByText('empty.title')).toBeInTheDocument();
        expect(screen.getByText('empty.description')).toBeInTheDocument();
    });

    it('renders a retryable error without exposing stale counts', async () => {
        vi.mocked(api.reviewCenter.summary).mockRejectedValueOnce(new Error('offline'));

        render(<ReviewCenterClient />);

        await waitFor(() => expect(screen.getByText('error.title')).toBeInTheDocument());
        expect(screen.queryByTestId('pending-actions-total')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'error.retry' })).toBeInTheDocument();
    });
});
