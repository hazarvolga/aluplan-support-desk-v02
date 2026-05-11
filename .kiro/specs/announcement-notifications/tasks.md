# Implementation Plan: Announcement Notifications

## Overview

Extend the existing announcement broadcast pipeline with real-time WebSocket toasts, a persistent announcement archive, and an unread badge count. The implementation follows a strict dependency order: database schema first, then backend service/controller, then frontend store, components, and i18n.

## Tasks

- [x] 1. Prisma migration — add `readAt` to `AnnouncementLog`
  - [x] 1.1 Add `readAt DateTime? @map("read_at")` field to the `AnnouncementLog` model in `packages/database/prisma/schema.prisma`
    - Place the field after `sentAt`, before `error`
    - Add composite index `@@index([customerId, readAt], map: "idx_announcement_logs_customer_read")`
    - _Requirements: 1.1_
  - [x] 1.2 Generate and apply the Prisma migration
    - Run `pnpm prisma migrate dev --name add_announcement_log_read_at` from `packages/database`
    - Verify the generated SQL adds `read_at TIMESTAMPTZ` as nullable with no default
    - Regenerate the Prisma client (`pnpm prisma generate`)
    - _Requirements: 1.1, 1.2_
  - Commit: `feat(db): add readAt to AnnouncementLog + composite index`

- [x] 2. Backend service methods — `getMyAnnouncements`, `getMyUnreadCount`, `markLogRead`, `generateExcerpt`
  - [x] 2.1 Add `generateExcerpt(contentMjml: string): string` private helper to `AnnouncementsService`
    - Strip all HTML/MJML tags with `/<[^>]+>/g`, collapse whitespace, trim
    - Return the full string if `<= 160` chars, otherwise `plain.slice(0, 160)`
    - _Requirements: 2.2, 6.3, 6.4_
  - [x] 2.2 Write property test for `generateExcerpt` (Property 11)
    - **Property 11: Excerpt is a bounded prefix of original plain text**
    - Use `fast-check` — generate arbitrary strings of length 0–2000 with random HTML tags
    - Assert `excerpt.length <= 160` and that original plain text starts with `excerpt`
    - **Validates: Requirements 6.3, 6.4**
  - [x] 2.3 Add `getMyAnnouncements(userId: string, page = 1, limit = 20)` to `AnnouncementsService`
    - Look up `CustomerProfile` by `userId`; return `{ data: [], total: 0 }` if not found
    - Query `announcementLog.findMany` with `orderBy: { sentAt: 'desc' }`, `skip`/`take` pagination
    - Include `announcement: { select: { title: true, contentMjml: true } }`
    - _Requirements: 3.1, 3.2, 5.4_
  - [x] 2.4 Write property test for `getMyAnnouncements` ordering (Property 6)
    - **Property 6: GET /announcements/my returns records in descending sentAt order**
    - Generate random lists of `AnnouncementLog` records with arbitrary `sentAt` values
    - Assert that for any two adjacent records `a`, `b` in the response, `a.sentAt >= b.sentAt`
    - **Validates: Requirements 3.1, 6.7**
  - [x] 2.5 Write property test for data isolation (Property 7)
    - **Property 7: GET /announcements/my enforces customer data isolation**
    - Generate two distinct customer IDs and mixed log sets
    - Assert response for customer A contains no records with customer B's `customerId`
    - **Validates: Requirements 3.2, 5.4**
  - [x] 2.6 Add `getMyUnreadCount(userId: string): Promise<{ count: number }>` to `AnnouncementsService`
    - Look up `CustomerProfile` by `userId`; return `{ count: 0 }` if not found
    - Count `announcementLog` records where `customerId = customer.id AND readAt IS NULL`
    - _Requirements: 4.1_
  - [x] 2.7 Write property test for unread count accuracy (Property 8)
    - **Property 8: Unread count equals count of null-readAt records**
    - Generate random lists of logs with arbitrary `readAt` values (null or date)
    - Assert returned count equals `logs.filter(l => l.readAt == null).length`
    - **Validates: Requirements 4.1, 6.1**
  - [x] 2.8 Add `markLogRead(logId: string, userId: string): Promise<AnnouncementLog>` to `AnnouncementsService`
    - Look up `CustomerProfile`; throw `ForbiddenException` if not found
    - Look up log by `logId`; throw `NotFoundException` if not found
    - Throw `ForbiddenException` if `log.customerId !== customer.id`
    - If `log.readAt !== null`, return log unchanged (idempotent)
    - Otherwise update `readAt: new Date()` and return updated record
    - Import `ForbiddenException`, `NotFoundException` from `@nestjs/common`
    - _Requirements: 1.3, 1.4, 1.5, 5.2, 5.3_
  - [x] 2.9 Write property test for `markLogRead` idempotence (Property 2)
    - **Property 2: markRead is idempotent**
    - Generate a random log + N in [1..10] repeated calls
    - Assert `readAt` after N calls equals `readAt` after the first call
    - **Validates: Requirements 1.4, 6.2**
  - [x] 2.10 Write property test for `readAt` temporal ordering (Property 3)
    - **Property 3: readAt temporal ordering invariant**
    - Generate random `sentAt` datetimes; call `markLogRead`
    - Assert resulting `readAt >= sentAt`
    - **Validates: Requirements 1.6**
  - [x] 2.11 Write property test for count convergence (Property 12)
    - **Property 12: Count convergence after full markRead sweep**
    - Generate N unread logs; apply `markLogRead` to all N distinct records
    - Assert `getMyUnreadCount` returns `{ count: 0 }`
    - **Validates: Requirements 6.5**
  - [x] 2.12 Write unit tests for `AnnouncementsService` new methods
    - `generateExcerpt`: empty string, < 160 chars, exactly 160 chars, > 160 chars, MJML-heavy content
    - `markLogRead`: already-read log returns unchanged, missing log throws 404, wrong customer throws 403
    - `getMyUnreadCount`: no logs → 0, all read → 0, all unread → N, mixed → correct count
    - _Requirements: 1.3, 1.4, 1.5, 4.1_
  - Commit: `feat(backend): add getMyAnnouncements, getMyUnreadCount, markLogRead, generateExcerpt`

- [x] 3. Backend — inject `NotificationsGateway` into `AnnouncementsService`, emit `ANNOUNCEMENT_RECEIVED` in `broadcast()`
  - [x] 3.1 Add `NotificationsModule` to `AnnouncementsModule` imports in `announcements.module.ts`
    - Import `NotificationsModule` from `../notifications/notifications.module`
    - No `forwardRef` needed — no circular dependency
    - _Requirements: 2.1_
  - [x] 3.2 Inject `NotificationsGateway` into `AnnouncementsService` constructor
    - Add `private readonly notificationsGateway: NotificationsGateway` parameter
    - Import `NotificationsGateway` from `../notifications/notifications.gateway`
    - _Requirements: 2.1_
  - [x] 3.3 Update the `broadcast()` customer query to also select `user.id`
    - In the `findMany` call, change `user: { select: { email: true } }` to `user: { select: { email: true, id: true } }`
    - _Requirements: 2.1, 2.8_
  - [x] 3.4 Emit `ANNOUNCEMENT_RECEIVED` inside the `broadcast()` loop, after `announcementLog` is created
    - Call `this.generateExcerpt(announcement.contentMjml)` to produce the excerpt
    - Call `this.notificationsGateway.sendToUser(target.user.id, 'ANNOUNCEMENT_RECEIVED', { logId: annLog.id, announcementId: id, title: announcement.title, excerpt, sentAt: new Date().toISOString() })`
    - Place the call after `announcementLog.create` and before the email enqueue
    - Skip the emit if `!target.user?.id` (same guard as the email skip)
    - _Requirements: 2.1, 2.2, 2.7, 2.8_
  - [x] 3.5 Write property test for one `sendToUser` call per customer (Property 5)
    - **Property 5: One sendToUser call per customer in broadcast batch**
    - Mock `NotificationsGateway.sendToUser`; generate random lists of 1–50 distinct customers
    - Assert mock called exactly N times, each with a distinct `userId`
    - **Validates: Requirements 2.8**
  - [x] 3.6 Write property test for payload completeness (Property 4)
    - **Property 4: ANNOUNCEMENT_RECEIVED payload completeness**
    - Generate arbitrary title and content strings
    - Assert the emitted payload contains all five fields: `logId`, `announcementId`, `title`, `excerpt`, `sentAt` (ISO 8601)
    - **Validates: Requirements 2.2**
  - [x] 3.7 Write property test for new logs having null readAt (Property 1)
    - **Property 1: New logs have null readAt**
    - Generate random announcement + customer list; run broadcast
    - Assert every created `AnnouncementLog` has `readAt = null`
    - **Validates: Requirements 1.2**
  - Commit: `feat(backend): wire NotificationsGateway into broadcast(), emit ANNOUNCEMENT_RECEIVED`

- [x] 4. Backend — new `CustomerAnnouncementsController`
  - [x] 4.1 Create `apps/backend/src/announcements/customer-announcements.controller.ts`
    - Decorate with `@Controller('announcements')` and `@UseGuards(JwtAuthGuard)` only (no `RbacGuard`, no `@Roles`)
    - Inject `AnnouncementsService`
    - _Requirements: 5.1_
  - [x] 4.2 Add `GET /announcements/my` endpoint — `getMyAnnouncements(@Request() req, @Query('page') page?, @Query('limit') limit?)`
    - Call `this.announcementsService.getMyAnnouncements(req.user.id, +page || 1, +limit || 20)`
    - _Requirements: 3.1, 3.2_
  - [x] 4.3 Add `GET /announcements/my/unread-count` endpoint — `getMyUnreadCount(@Request() req)`
    - Call `this.announcementsService.getMyUnreadCount(req.user.id)`
    - _Requirements: 4.1_
  - [x] 4.4 Add `PATCH /announcements/logs/:logId/read` endpoint — `markLogRead(@Param('logId') logId, @Request() req)`
    - Call `this.announcementsService.markLogRead(logId, req.user.id)`
    - _Requirements: 1.3, 1.5, 5.2, 5.3_
  - [x] 4.5 Register `CustomerAnnouncementsController` in `AnnouncementsModule.controllers` array
    - _Requirements: 5.1_
  - [ ] 4.6 Write integration tests for the three new endpoints
    - `GET /announcements/my` — JWT required (401 without token), returns only caller's logs
    - `GET /announcements/my/unread-count` — count matches DB state
    - `PATCH /announcements/logs/:logId/read` — 403 for wrong customer, 200 + `readAt` set for correct customer, 404 for missing log
    - _Requirements: 1.3, 1.5, 3.1, 3.2, 4.1, 5.1, 5.2, 5.3_
  - Commit: `feat(backend): CustomerAnnouncementsController with my, unread-count, mark-read endpoints`

- [x] 5. Checkpoint — backend tests pass
  - Run `pnpm test` in `apps/backend`; ensure all new unit, property, and integration tests pass
  - Fix any TypeScript strict-mode errors in the new files
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Frontend — Zustand store `useAnnouncementStore`
  - [x] 6.1 Create `apps/frontend/src/stores/announcement-store.ts`
    - Define `AnnouncementStore` interface with: `unreadCount: number`, `isArchiveOpen: boolean`, `scrollToLogId: string | null`
    - Actions: `setUnreadCount(n)`, `incrementUnread()`, `decrementUnread()` (floors at 0 via `Math.max(0, state.unreadCount - 1)`), `openArchive(logId?)`, `closeArchive()`
    - Use `create` from `zustand`
    - _Requirements: 4.4, 4.5, 6.6_
  - [x] 6.2 Add `getUnreadCount` and `getMyAnnouncements` and `markLogRead` methods to `api.announcements` in `apps/frontend/src/lib/api.ts`
    - `getUnreadCount: () => request<{ count: number }>('/announcements/my/unread-count')`
    - `getMyAnnouncements: (page = 1, limit = 20) => request<{ data: any[]; total: number }>('/announcements/my?page=...')`
    - `markLogRead: (logId: string) => request<any>('/announcements/logs/${logId}/read', { method: 'PATCH' })`
    - _Requirements: 3.1, 4.1, 1.5_
  - [ ] 6.3 Write unit tests for `useAnnouncementStore` state transitions
    - `incrementUnread`: N → N+1
    - `decrementUnread`: N → N-1, 0 → 0 (floor)
    - `openArchive(logId)`: sets `isArchiveOpen = true`, `scrollToLogId = logId`
    - `closeArchive`: resets both
    - _Requirements: 4.4, 4.5, 6.6_
  - [ ] 6.4 Write property test for the count state machine (Property 9)
    - **Property 9: Local unread count state machine — increment and floor**
    - Generate random N >= 0 and random sequences of increment/decrement ops
    - Assert count never goes negative; increments add 1; decrements subtract 1 floored at 0
    - **Validates: Requirements 4.4, 4.5, 6.6**
  - Commit: `feat(frontend): useAnnouncementStore Zustand store + api.announcements customer methods`

- [x] 7. Frontend — `GlobalAnnouncementNotification` component + layout integration
  - [x] 7.1 Create `apps/frontend/src/components/global-announcement-notification.tsx`
    - `'use client'` component that returns `null`
    - In `useEffect`: call `getSocket()`, `socket.connect()`, register handler for `'ANNOUNCEMENT_RECEIVED'`
    - Handler calls `incrementUnread()` from `useAnnouncementStore` and fires a `sonner` `toast()` with `title`, `description: payload.excerpt`, `duration: 6000`, and an `action` button labelled `t('announcements.toast_view')` that calls `openArchive(payload.logId)`
    - Clean up with `socket.off('ANNOUNCEMENT_RECEIVED', handler)` on unmount
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 4.4_
  - [x] 7.2 Add `<GlobalAnnouncementNotification />` to `apps/frontend/src/app/[locale]/(dashboard)/layout.tsx`
    - Place it alongside `<GlobalTicketNotification />` inside `<RoleGuard>`
    - _Requirements: 2.3_
  - [ ] 7.3 Write unit test for `GlobalAnnouncementNotification`
    - Mock `getSocket`; simulate `ANNOUNCEMENT_RECEIVED` event
    - Assert `sonner` toast called with correct `title` and `excerpt`
    - Assert `incrementUnread` called once
    - _Requirements: 2.3, 2.4, 4.4_
  - Commit: `feat(frontend): GlobalAnnouncementNotification component + layout integration`

- [x] 8. Frontend — Sidebar bell icon with unread badge (customer only)
  - [x] 8.1 Add a bell nav entry to `CUSTOMER_NAV` in `apps/frontend/src/components/sidebar.tsx`
    - Add `{ icon: Bell, labelKey: 'announcements', isAnnouncementBell: true }` entry (import `Bell` from `lucide-react`)
    - _Requirements: 3.3, 4.2_
  - [x] 8.2 Fetch initial unread count on mount for customer role
    - In `Sidebar`, import `useAnnouncementStore`
    - Add `useEffect` that calls `api.announcements.getUnreadCount()` when `user?.role?.toUpperCase() === 'CUSTOMER'` and calls `setUnreadCount(r.count)`
    - _Requirements: 4.2_
  - [x] 8.3 Render the bell button with unread badge
    - For the `isAnnouncementBell` nav item, render a `<button>` instead of a `<Link>` that calls `openArchive()`
    - Show `<span className="badge">` with `unreadCount > 99 ? '99+' : unreadCount` when `unreadCount > 0`; hide badge when count is 0
    - _Requirements: 4.2, 4.3, 4.6_
  - [ ] 8.4 Write unit tests for badge display logic (Property 10)
    - **Property 10: Badge display caps at 99+**
    - Test counts: 0 (badge hidden), 1, 99, 100 → "99+", 999 → "99+"
    - **Validates: Requirements 4.6**
  - Commit: `feat(frontend): sidebar bell icon with unread badge for customer role`

- [x] 9. Frontend — `AnnouncementArchiveDrawer` component
  - [x] 9.1 Create `apps/frontend/src/components/announcement-archive-drawer.tsx`
    - Use shadcn `Sheet` (side drawer); controlled by `isArchiveOpen` / `closeArchive` from `useAnnouncementStore`
    - On open, fetch page 1 from `api.announcements.getMyAnnouncements()`
    - Display list of items showing `announcement.title` and `sentAt` formatted with `useFormatter` from `next-intl`
    - Visually distinguish unread items (`readAt === null`) with an unread indicator dot or bold title
    - Show empty-state message (`t('announcements.archive_empty')`) when list is empty
    - _Requirements: 3.4, 3.7, 3.8, 3.9_
  - [x] 9.2 Implement item click — open full content and mark as read
    - On item click, show full `announcement.contentMjml` rendered as HTML in an inner panel or modal
    - If `readAt === null`, call `api.announcements.markLogRead(logId)` and call `decrementUnread()` from the store
    - Update local item state to reflect `readAt` set (remove unread indicator)
    - _Requirements: 3.5, 3.6, 4.5_
  - [x] 9.3 Implement pagination / load-more
    - Add "Load more" button that fetches the next page and appends results
    - Disable button when all records are loaded (`data.length >= total`)
    - _Requirements: 3.10_
  - [x] 9.4 Implement `scrollToLogId` behaviour
    - After the drawer opens and data loads, if `scrollToLogId` is set, scroll to and highlight that item
    - Clear `scrollToLogId` after scrolling
    - _Requirements: 2.5_
  - [x] 9.5 Mount `<AnnouncementArchiveDrawer />` in the dashboard layout
    - Add it to `apps/frontend/src/app/[locale]/(dashboard)/layout.tsx` alongside the other global components
    - _Requirements: 3.3_
  - [x] 9.6 Write unit tests for `AnnouncementArchiveDrawer`
    - Empty state renders when API returns `{ data: [], total: 0 }`
    - Unread item shows indicator; clicking it calls `markLogRead` and `decrementUnread`
    - Already-read item does not call `markLogRead` on click
    - _Requirements: 3.6, 3.7, 3.9, 4.5_
  - Commit: `feat(frontend): AnnouncementArchiveDrawer with pagination, mark-read, scroll-to`

- [x] 10. Frontend — i18n keys (EN / TR / DE)
  - [x] 10.1 Add `announcements` namespace to `apps/frontend/messages/en.json`
    ```json
    "announcements": {
      "toast_view": "View",
      "archive_title": "Announcements",
      "archive_empty": "No announcements yet.",
      "archive_unread_dot": "Unread",
      "mark_read": "Mark as read",
      "badge_overflow": "99+"
    }
    ```
    Also add `"announcements": "Announcements"` under `sidebar.nav`
    - _Requirements: 2.6, 3.8, 4.7_
  - [x] 10.2 Add the same keys to `apps/frontend/messages/tr.json`
    ```json
    "announcements": {
      "toast_view": "Görüntüle",
      "archive_title": "Duyurular",
      "archive_empty": "Henüz duyuru yok.",
      "archive_unread_dot": "Okunmadı",
      "mark_read": "Okundu olarak işaretle",
      "badge_overflow": "99+"
    }
    ```
    Also add `"announcements": "Duyurular"` under `sidebar.nav`
    - _Requirements: 2.6, 3.8, 4.7_
  - [x] 10.3 Add the same keys to `apps/frontend/messages/de.json`
    ```json
    "announcements": {
      "toast_view": "Anzeigen",
      "archive_title": "Ankündigungen",
      "archive_empty": "Noch keine Ankündigungen.",
      "archive_unread_dot": "Ungelesen",
      "mark_read": "Als gelesen markieren",
      "badge_overflow": "99+"
    }
    ```
    Also add `"announcements": "Ankündigungen"` under `sidebar.nav`
    - _Requirements: 2.6, 3.8, 4.7_
  - Commit: `feat(i18n): announcement-notifications keys for EN/TR/DE`

- [x] 11. Final checkpoint — all tests pass, TypeScript strict mode
  - Run `pnpm test` in `apps/backend` — all unit, property, and integration tests must pass
  - Run `pnpm tsc --noEmit` in `apps/backend` and `apps/frontend` — zero TypeScript errors
  - Verify `readAt` field is present in the Prisma client types
  - Verify `api.announcements.getUnreadCount`, `getMyAnnouncements`, `markLogRead` are typed correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Sub-tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` (already in the project's dev dependencies)
- Each property test must include the tag comment: `// Feature: announcement-notifications, Property N: <property_text>`
- The `CustomerAnnouncementsController` is intentionally separate from `AnnouncementsController` to avoid overriding the class-level `@Roles('ADMIN')` guard
- `NotificationsGateway.sendToUser` is a fire-and-forget call — offline users will see the announcement in the archive on next login
- The `decrementUnread` floor at 0 prevents negative badge counts if WebSocket events arrive out of order
