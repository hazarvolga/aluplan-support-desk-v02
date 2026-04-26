import { create } from 'zustand';

interface AnnouncementStore {
  unreadCount: number;
  isArchiveOpen: boolean;
  scrollToLogId: string | null;
  setUnreadCount: (n: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  openArchive: (logId?: string) => void;
  closeArchive: () => void;
}

export const useAnnouncementStore = create<AnnouncementStore>((set) => ({
  unreadCount: 0,
  isArchiveOpen: false,
  scrollToLogId: null,
  setUnreadCount: (n) => set({ unreadCount: n }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  openArchive: (logId) => set({ isArchiveOpen: true, scrollToLogId: logId ?? null }),
  closeArchive: () => set({ isArchiveOpen: false, scrollToLogId: null }),
}));
