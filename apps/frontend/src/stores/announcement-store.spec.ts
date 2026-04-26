import { describe, it, expect, beforeEach } from 'vitest';
import { useAnnouncementStore } from './announcement-store';

// Reset store state before each test
function resetStore() {
    useAnnouncementStore.setState({
        unreadCount: 0,
        isArchiveOpen: false,
        scrollToLogId: null,
    });
}

describe('useAnnouncementStore — state transitions', () => {
    beforeEach(() => {
        resetStore();
    });

    // ── setUnreadCount ──────────────────────────────────────────────────
    describe('setUnreadCount', () => {
        it('sets unreadCount to the given value', () => {
            useAnnouncementStore.getState().setUnreadCount(7);
            expect(useAnnouncementStore.getState().unreadCount).toBe(7);
        });

        it('sets unreadCount to 0', () => {
            useAnnouncementStore.getState().setUnreadCount(5);
            useAnnouncementStore.getState().setUnreadCount(0);
            expect(useAnnouncementStore.getState().unreadCount).toBe(0);
        });
    });

    // ── incrementUnread ─────────────────────────────────────────────────
    describe('incrementUnread', () => {
        it('increments from 0 to 1', () => {
            useAnnouncementStore.getState().incrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(1);
        });

        it('increments N → N+1', () => {
            useAnnouncementStore.getState().setUnreadCount(5);
            useAnnouncementStore.getState().incrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(6);
        });

        it('increments multiple times correctly', () => {
            for (let i = 0; i < 10; i++) {
                useAnnouncementStore.getState().incrementUnread();
            }
            expect(useAnnouncementStore.getState().unreadCount).toBe(10);
        });
    });

    // ── decrementUnread ─────────────────────────────────────────────────
    describe('decrementUnread', () => {
        it('decrements N → N-1', () => {
            useAnnouncementStore.getState().setUnreadCount(5);
            useAnnouncementStore.getState().decrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(4);
        });

        it('floors at 0 — does not go negative', () => {
            useAnnouncementStore.getState().setUnreadCount(0);
            useAnnouncementStore.getState().decrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(0);
        });

        it('floors at 0 after multiple decrements below zero', () => {
            useAnnouncementStore.getState().setUnreadCount(1);
            useAnnouncementStore.getState().decrementUnread();
            useAnnouncementStore.getState().decrementUnread();
            useAnnouncementStore.getState().decrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(0);
        });

        it('decrement from 1 → 0', () => {
            useAnnouncementStore.getState().setUnreadCount(1);
            useAnnouncementStore.getState().decrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(0);
        });
    });

    // ── openArchive ─────────────────────────────────────────────────────
    describe('openArchive', () => {
        it('sets isArchiveOpen to true', () => {
            useAnnouncementStore.getState().openArchive();
            expect(useAnnouncementStore.getState().isArchiveOpen).toBe(true);
        });

        it('sets scrollToLogId when logId is provided', () => {
            useAnnouncementStore.getState().openArchive('log-abc');
            expect(useAnnouncementStore.getState().scrollToLogId).toBe('log-abc');
            expect(useAnnouncementStore.getState().isArchiveOpen).toBe(true);
        });

        it('sets scrollToLogId to null when no logId is provided', () => {
            useAnnouncementStore.getState().openArchive();
            expect(useAnnouncementStore.getState().scrollToLogId).toBeNull();
        });

        it('overwrites previous scrollToLogId', () => {
            useAnnouncementStore.getState().openArchive('log-1');
            useAnnouncementStore.getState().openArchive('log-2');
            expect(useAnnouncementStore.getState().scrollToLogId).toBe('log-2');
        });
    });

    // ── closeArchive ────────────────────────────────────────────────────
    describe('closeArchive', () => {
        it('sets isArchiveOpen to false', () => {
            useAnnouncementStore.getState().openArchive('log-x');
            useAnnouncementStore.getState().closeArchive();
            expect(useAnnouncementStore.getState().isArchiveOpen).toBe(false);
        });

        it('resets scrollToLogId to null', () => {
            useAnnouncementStore.getState().openArchive('log-x');
            useAnnouncementStore.getState().closeArchive();
            expect(useAnnouncementStore.getState().scrollToLogId).toBeNull();
        });

        it('is idempotent — calling twice leaves state consistent', () => {
            useAnnouncementStore.getState().closeArchive();
            useAnnouncementStore.getState().closeArchive();
            expect(useAnnouncementStore.getState().isArchiveOpen).toBe(false);
            expect(useAnnouncementStore.getState().scrollToLogId).toBeNull();
        });
    });

    // ── combined sequences ───────────────────────────────────────────────
    describe('combined sequences', () => {
        it('increment then decrement returns to original count', () => {
            useAnnouncementStore.getState().setUnreadCount(3);
            useAnnouncementStore.getState().incrementUnread();
            useAnnouncementStore.getState().decrementUnread();
            expect(useAnnouncementStore.getState().unreadCount).toBe(3);
        });

        it('open then close resets archive state', () => {
            useAnnouncementStore.getState().openArchive('log-seq');
            useAnnouncementStore.getState().closeArchive();
            expect(useAnnouncementStore.getState().isArchiveOpen).toBe(false);
            expect(useAnnouncementStore.getState().scrollToLogId).toBeNull();
        });

        it('unreadCount is independent of archive state', () => {
            useAnnouncementStore.getState().setUnreadCount(10);
            useAnnouncementStore.getState().openArchive('log-1');
            useAnnouncementStore.getState().closeArchive();
            expect(useAnnouncementStore.getState().unreadCount).toBe(10);
        });
    });
});
