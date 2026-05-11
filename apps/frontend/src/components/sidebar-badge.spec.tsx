import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * GAP-6.3 / Property 10: Badge display caps at 99+
 *
 * Tests the badge rendering logic in the Sidebar's announcement bell button.
 * We test the pure display logic directly (no need to mount the full Sidebar).
 */

// ── Mocks required by Sidebar ─────────────────────────────────────────
vi.mock('@/components/auth/role-guard', () => ({
    useAuth: () => ({
        user: { role: 'CUSTOMER', id: 'user-1', email: 'c@test.com' },
        logout: vi.fn(),
    }),
}));

vi.mock('@/lib/api', () => ({
    api: {
        kb: { listPending: vi.fn().mockResolvedValue({ total: 0 }) },
        announcements: { getUnreadCount: vi.fn().mockResolvedValue({ count: 0 }) },
    },
}));

vi.mock('@/components/language-switcher', () => ({
    LanguageSwitcher: () => null,
}));

// ── Mock useAnnouncementStore with controllable unreadCount ───────────
const mockOpenArchive = vi.fn();
let mockUnreadCount = 0;

vi.mock('@/stores/announcement-store', () => ({
    useAnnouncementStore: () => ({
        unreadCount: mockUnreadCount,
        setUnreadCount: vi.fn(),
        openArchive: mockOpenArchive,
        closeArchive: vi.fn(),
        incrementUnread: vi.fn(),
        decrementUnread: vi.fn(),
        isArchiveOpen: false,
        scrollToLogId: null,
    }),
}));

import { Sidebar } from './sidebar';

// ── Helper: render sidebar and find the badge span ────────────────────
function renderSidebar() {
    return render(<Sidebar />);
}

function getBadge() {
    // The badge is a <span> inside the bell button
    return document.querySelector(
        'button[data-testid="nav-announcements_bell"] span.ml-auto'
    );
}

describe('Sidebar — announcement bell badge display (Property 10)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('hides badge when unreadCount is 0', () => {
        mockUnreadCount = 0;
        renderSidebar();
        expect(getBadge()).toBeNull();
    });

    it('shows badge with "1" when unreadCount is 1', () => {
        mockUnreadCount = 1;
        renderSidebar();
        const badge = getBadge();
        expect(badge).not.toBeNull();
        expect(badge?.textContent).toBe('1');
    });

    it('shows badge with "99" when unreadCount is 99', () => {
        mockUnreadCount = 99;
        renderSidebar();
        const badge = getBadge();
        expect(badge).not.toBeNull();
        expect(badge?.textContent).toBe('99');
    });

    it('shows "99+" when unreadCount is 100', () => {
        mockUnreadCount = 100;
        renderSidebar();
        const badge = getBadge();
        expect(badge).not.toBeNull();
        expect(badge?.textContent).toBe('99+');
    });

    it('shows "99+" when unreadCount is 999', () => {
        mockUnreadCount = 999;
        renderSidebar();
        const badge = getBadge();
        expect(badge).not.toBeNull();
        expect(badge?.textContent).toBe('99+');
    });

    it('shows "99+" when unreadCount is 1000', () => {
        mockUnreadCount = 1000;
        renderSidebar();
        expect(getBadge()?.textContent).toBe('99+');
    });

    it('clicking the bell button calls openArchive()', () => {
        mockUnreadCount = 3;
        renderSidebar();
        const bellBtn = screen.getByTestId('nav-announcements_bell');
        fireEvent.click(bellBtn);
        expect(mockOpenArchive).toHaveBeenCalledTimes(1);
    });
});

// ── Pure badge logic unit tests (no DOM) ─────────────────────────────
describe('Badge display logic — pure function (Property 10)', () => {
    function badgeText(count: number): string | null {
        if (count <= 0) return null;
        return count > 99 ? '99+' : String(count);
    }

    it('returns null for count 0', () => {
        expect(badgeText(0)).toBeNull();
    });

    it('returns null for negative count', () => {
        expect(badgeText(-1)).toBeNull();
    });

    it('returns "1" for count 1', () => {
        expect(badgeText(1)).toBe('1');
    });

    it('returns "50" for count 50', () => {
        expect(badgeText(50)).toBe('50');
    });

    it('returns "99" for count 99', () => {
        expect(badgeText(99)).toBe('99');
    });

    it('returns "99+" for count 100', () => {
        expect(badgeText(100)).toBe('99+');
    });

    it('returns "99+" for count 101', () => {
        expect(badgeText(101)).toBe('99+');
    });

    it('returns "99+" for count 9999', () => {
        expect(badgeText(9999)).toBe('99+');
    });
});
