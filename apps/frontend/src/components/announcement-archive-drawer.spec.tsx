import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnnouncementArchiveDrawer } from './announcement-archive-drawer';

// ── Mock api ──────────────────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  api: {
    announcements: {
      getMyAnnouncements: vi.fn(),
      markLogRead: vi.fn(),
    },
  },
}));

// ── Mock useAnnouncementStore ─────────────────────────────────────────
vi.mock('@/stores/announcement-store', () => ({
  useAnnouncementStore: vi.fn(),
}));

// ── Mock DOMPurify (jsdom doesn't have full DOM) ──────────────────────
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

import { api } from '@/lib/api';
import { useAnnouncementStore } from '@/stores/announcement-store';

// ── Helpers ───────────────────────────────────────────────────────────
const mockStore = (overrides: Partial<ReturnType<typeof useAnnouncementStore>> = {}) => {
  const defaults = {
    isArchiveOpen: true,
    scrollToLogId: null,
    unreadCount: 0,
    closeArchive: vi.fn(),
    decrementUnread: vi.fn(),
    openArchive: vi.fn(),
    setUnreadCount: vi.fn(),
    incrementUnread: vi.fn(),
  };
  (useAnnouncementStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    ...defaults,
    ...overrides,
  });
};

const makeItem = (overrides: Partial<{
  id: string;
  announcementId: string;
  sentAt: string | null;
  readAt: string | null;
  announcement: { title: string; contentMjml: string };
}> = {}) => ({
  id: 'log-1',
  announcementId: 'ann-1',
  sentAt: '2024-01-15T10:00:00.000Z',
  readAt: null,
  announcement: {
    title: 'Test Announcement',
    contentMjml: '<p>Hello world</p>',
  },
  ...overrides,
});

describe('AnnouncementArchiveDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolved with empty list
    (api.announcements.getMyAnnouncements as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      total: 0,
    });
    (api.announcements.markLogRead as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  // ── 1. Empty state ──────────────────────────────────────────────────
  describe('empty state', () => {
    it('renders the empty-state message when API returns { data: [], total: 0 }', async () => {
      mockStore();

      render(<AnnouncementArchiveDrawer />);

      // Wait for the loading state to finish and empty state to appear.
      // The t() mock returns the key without namespace prefix (e.g. 'archive_empty').
      await waitFor(() => {
        expect(screen.getByText('archive_empty')).toBeDefined();
      });
    });

    it('does not render the drawer when isArchiveOpen is false', () => {
      mockStore({ isArchiveOpen: false });

      const { container } = render(<AnnouncementArchiveDrawer />);

      expect(container.firstChild).toBeNull();
    });
  });

  // ── 2. Unread item indicator ────────────────────────────────────────
  describe('unread item indicator', () => {
    it('shows the unread dot for an item with readAt === null', async () => {
      const unreadItem = makeItem({ readAt: null });

      (api.announcements.getMyAnnouncements as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [unreadItem],
        total: 1,
      });

      mockStore();

      render(<AnnouncementArchiveDrawer />);

      await waitFor(() => {
        expect(screen.getByText('Test Announcement')).toBeDefined();
      });

      // The unread dot has title="archive_unread_dot" (t() mock returns key without namespace)
      const unreadDot = document.querySelector('[title="archive_unread_dot"]');
      expect(unreadDot).not.toBeNull();
    });

    it('does not show the unread dot for an item with a non-null readAt', async () => {
      const readItem = makeItem({ readAt: '2024-01-15T11:00:00.000Z' });

      (api.announcements.getMyAnnouncements as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [readItem],
        total: 1,
      });

      mockStore();

      render(<AnnouncementArchiveDrawer />);

      await waitFor(() => {
        expect(screen.getByText('Test Announcement')).toBeDefined();
      });

      // No element with the unread dot title
      const unreadDot = document.querySelector('[title="archive_unread_dot"]');
      expect(unreadDot).toBeNull();
    });
  });

  // ── 3. Clicking an unread item ──────────────────────────────────────
  describe('clicking an unread item', () => {
    it('calls markLogRead and decrementUnread when clicking an unread item', async () => {
      const decrementUnread = vi.fn();
      const unreadItem = makeItem({ id: 'log-unread-1', readAt: null });

      (api.announcements.getMyAnnouncements as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [unreadItem],
        total: 1,
      });

      mockStore({ decrementUnread });

      render(<AnnouncementArchiveDrawer />);

      // Wait for item to appear
      await waitFor(() => {
        expect(screen.getByText('Test Announcement')).toBeDefined();
      });

      // Click the item button
      const itemButton = screen.getByRole('button', { name: /Test Announcement/i });
      fireEvent.click(itemButton);

      // markLogRead should be called with the log id
      await waitFor(() => {
        expect(api.announcements.markLogRead).toHaveBeenCalledWith('log-unread-1');
        expect(api.announcements.markLogRead).toHaveBeenCalledTimes(1);
      });

      // decrementUnread should be called once
      await waitFor(() => {
        expect(decrementUnread).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── 4. Clicking an already-read item ───────────────────────────────
  describe('clicking an already-read item', () => {
    it('does NOT call markLogRead when clicking an item with a non-null readAt', async () => {
      const readItem = makeItem({
        id: 'log-read-1',
        readAt: '2024-01-15T11:00:00.000Z',
      });

      (api.announcements.getMyAnnouncements as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [readItem],
        total: 1,
      });

      const decrementUnread = vi.fn();
      mockStore({ decrementUnread });

      render(<AnnouncementArchiveDrawer />);

      await waitFor(() => {
        expect(screen.getByText('Test Announcement')).toBeDefined();
      });

      // Click the item button
      const itemButton = screen.getByRole('button', { name: /Test Announcement/i });
      fireEvent.click(itemButton);

      // Give async handlers time to run
      await waitFor(() => {
        expect(api.announcements.markLogRead).not.toHaveBeenCalled();
      });

      // decrementUnread should also NOT be called
      expect(decrementUnread).not.toHaveBeenCalled();
    });
  });
});
