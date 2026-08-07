import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    currentUser: { role: 'SUPPORT_AGENT' },
    summary: vi.fn(),
}));

vi.mock('@/components/auth/role-guard', () => ({
    useAuth: () => ({ user: mocks.currentUser, logout: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
    api: {
        reviewCenter: { summary: mocks.summary },
        announcements: { getUnreadCount: vi.fn().mockResolvedValue({ count: 0 }) },
    },
}));

vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => null }));

vi.mock('@/stores/announcement-store', () => ({
    useAnnouncementStore: () => ({
        unreadCount: 0,
        setUnreadCount: vi.fn(),
        openArchive: vi.fn(),
    }),
}));

import { Sidebar } from './sidebar';

describe('Sidebar review center navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.currentUser = { role: 'SUPPORT_AGENT' };
        mocks.summary.mockResolvedValue({
            pendingActions: 4,
            items: [{
                id: 'faq-candidates',
                kind: 'ACTION',
                group: 'EDITORIAL',
                href: '/kb-approvals',
                priority: 'NORMAL',
                count: 4,
            }],
        });
    });

    it('shows staff the central queue and only authorized task links', async () => {
        render(<Sidebar />);

        expect(await screen.findByTestId('nav-review_center')).toHaveAttribute('href', '/review-center');
        expect(screen.getByTestId('review-center-badge')).toHaveTextContent('4');
        expect(screen.getByTestId('review-task-faq-candidates')).toHaveAttribute('href', '/kb-approvals');
        expect(screen.queryByTestId('review-task-crawler-candidates')).not.toBeInTheDocument();
        expect(screen.queryByTestId('nav-my_tickets')).not.toBeInTheDocument();
    });

    it('does not query or expose the staff center to customers', async () => {
        mocks.currentUser = { role: 'CUSTOMER' };

        render(<Sidebar />);

        await waitFor(() => expect(screen.getByTestId('nav-my_tickets')).toBeInTheDocument());
        expect(mocks.summary).not.toHaveBeenCalled();
        expect(screen.queryByTestId('nav-review_center')).not.toBeInTheDocument();
    });

    it('caps the aggregate staff badge at 99+', async () => {
        mocks.summary.mockResolvedValue({ items: [], pendingActions: 127 });

        render(<Sidebar />);

        expect(await screen.findByTestId('review-center-badge')).toHaveTextContent('99+');
    });
});
