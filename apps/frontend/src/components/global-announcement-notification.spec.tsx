import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobalAnnouncementNotification } from './global-announcement-notification';

// ── Mock socket ───────────────────────────────────────────────────────
const mockSocket = {
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
};

vi.mock('@/lib/socket', () => ({
    getSocket: () => mockSocket,
}));

// ── Mock sonner toast ─────────────────────────────────────────────────
const mockToast = vi.fn();
vi.mock('sonner', () => ({
    toast: (...args: any[]) => mockToast(...args),
    Toaster: () => null,
}));

// ── Mock useAnnouncementStore ─────────────────────────────────────────
const mockIncrementUnread = vi.fn();
const mockOpenArchive = vi.fn();

vi.mock('@/stores/announcement-store', () => ({
    useAnnouncementStore: () => ({
        incrementUnread: mockIncrementUnread,
        openArchive: mockOpenArchive,
        unreadCount: 0,
        isArchiveOpen: false,
        scrollToLogId: null,
        setUnreadCount: vi.fn(),
        decrementUnread: vi.fn(),
        closeArchive: vi.fn(),
    }),
}));

// ── Helpers ───────────────────────────────────────────────────────────
function makePayload(overrides: Partial<{
    logId: string;
    announcementId: string;
    title: string;
    excerpt: string;
    sentAt: string;
}> = {}) {
    return {
        logId: 'log-1',
        announcementId: 'ann-1',
        title: 'System Update',
        excerpt: 'Important update for all customers.',
        sentAt: new Date().toISOString(),
        ...overrides,
    };
}

/** Simulate the socket emitting ANNOUNCEMENT_RECEIVED */
function emitAnnouncementReceived(payload: ReturnType<typeof makePayload>) {
    const handler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'ANNOUNCEMENT_RECEIVED'
    )?.[1];
    if (!handler) throw new Error('ANNOUNCEMENT_RECEIVED handler not registered');
    act(() => handler(payload));
}

describe('GlobalAnnouncementNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders null — no DOM output', () => {
        const { container } = render(<GlobalAnnouncementNotification />);
        expect(container.firstChild).toBeNull();
    });

    it('connects the socket on mount', () => {
        render(<GlobalAnnouncementNotification />);
        expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    });

    it('registers ANNOUNCEMENT_RECEIVED handler on mount', () => {
        render(<GlobalAnnouncementNotification />);
        const registeredEvents = mockSocket.on.mock.calls.map((call) => call[0] as string);
        expect(registeredEvents).toContain('ANNOUNCEMENT_RECEIVED');
    });

    it('deregisters handler on unmount', () => {
        const { unmount } = render(<GlobalAnnouncementNotification />);
        unmount();
        const offEvents = mockSocket.off.mock.calls.map((call) => call[0] as string);
        expect(offEvents).toContain('ANNOUNCEMENT_RECEIVED');
    });

    it('calls incrementUnread when ANNOUNCEMENT_RECEIVED fires', () => {
        render(<GlobalAnnouncementNotification />);
        emitAnnouncementReceived(makePayload());
        expect(mockIncrementUnread).toHaveBeenCalledTimes(1);
    });

    it('calls toast with correct title and excerpt', () => {
        render(<GlobalAnnouncementNotification />);
        const payload = makePayload({ title: 'Critical Alert', excerpt: 'Server maintenance tonight.' });

        emitAnnouncementReceived(payload);

        expect(mockToast).toHaveBeenCalledTimes(1);
        const [title, options] = mockToast.mock.calls[0];
        expect(title).toBe('Critical Alert');
        expect(options.description).toBe('Server maintenance tonight.');
    });

    it('toast duration is 6000ms', () => {
        render(<GlobalAnnouncementNotification />);
        emitAnnouncementReceived(makePayload());

        const [, options] = mockToast.mock.calls[0];
        expect(options.duration).toBe(6000);
    });

    it('toast action label is the i18n key toast_view', () => {
        render(<GlobalAnnouncementNotification />);
        emitAnnouncementReceived(makePayload());

        const [, options] = mockToast.mock.calls[0];
        // useTranslations mock returns the key as-is
        expect(options.action.label).toBe('toast_view');
    });

    it('toast action onClick calls openArchive with the logId', () => {
        render(<GlobalAnnouncementNotification />);
        const payload = makePayload({ logId: 'log-xyz' });
        emitAnnouncementReceived(payload);

        const [, options] = mockToast.mock.calls[0];
        act(() => options.action.onClick());

        expect(mockOpenArchive).toHaveBeenCalledWith('log-xyz');
    });

    it('handles multiple ANNOUNCEMENT_RECEIVED events independently', () => {
        render(<GlobalAnnouncementNotification />);

        emitAnnouncementReceived(makePayload({ logId: 'log-1', title: 'First' }));
        emitAnnouncementReceived(makePayload({ logId: 'log-2', title: 'Second' }));

        expect(mockIncrementUnread).toHaveBeenCalledTimes(2);
        expect(mockToast).toHaveBeenCalledTimes(2);
        expect(mockToast.mock.calls[0][0]).toBe('First');
        expect(mockToast.mock.calls[1][0]).toBe('Second');
    });
});
