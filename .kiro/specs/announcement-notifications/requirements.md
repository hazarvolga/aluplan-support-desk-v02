# Requirements Document

## Introduction

This feature extends the existing announcement broadcast system in the Allplan support desk (allplan.net.tr) to deliver real-time and persistent notifications to customers. Currently, `AnnouncementsService.broadcast()` sends emails and creates `AnnouncementLog` records, but customers have no in-app awareness of announcements. This spec covers three sub-features:

1. **Real-time toast notification** — customers online at broadcast time receive an instant WebSocket-driven toast.
2. **Announcement archive** — customers can browse all announcements sent to them, with full content in a modal/drawer.
3. **Unread badge count** — a persistent badge shows how many announcements the customer has not yet read.

The system is trilingual (Turkish, English, German) and uses NestJS + Prisma on the backend and Next.js 14 App Router + shadcn/ui on the frontend.

---

## Glossary

- **AnnouncementsService**: NestJS service responsible for targeting customers and executing the broadcast.
- **AnnouncementLog**: Prisma model that records one row per customer per announcement, containing `customerId`, `announcementId`, `status`, `sentAt`, and (new) `readAt`.
- **NotificationsGateway**: NestJS WebSocket gateway that manages Socket.io connections and exposes `sendToUser(userId, event, payload)`.
- **Dashboard**: The customer-facing Next.js page at `/[locale]/(dashboard)/dashboard/page.tsx`.
- **Sidebar**: The navigation component at `apps/frontend/src/components/sidebar.tsx`.
- **Toast**: A transient UI notification rendered via the `sonner` toast library already present in the frontend.
- **Announcement_Archive**: The new UI section (accessible from the Dashboard or Sidebar) listing all announcements sent to the authenticated customer.
- **Unread_Count**: The number of `AnnouncementLog` records for the authenticated customer where `readAt IS NULL`.
- **ANNOUNCEMENT_RECEIVED**: The WebSocket event name emitted by the backend when a broadcast reaches an online customer.
- **i18n**: Internationalisation handled by `next-intl`; all user-visible strings must have keys in `en.json`, `tr.json`, and `de.json`.

---

## Requirements

### Requirement 1: Persist Read-Status on AnnouncementLog

**User Story:** As a system, I need to track whether each customer has read each announcement, so that unread counts and archive read-state are accurate.

#### Acceptance Criteria

1. THE Database_Schema SHALL add a nullable `readAt` `DateTime` field to the `AnnouncementLog` model.
2. WHEN a new `AnnouncementLog` record is created during broadcast, THE AnnouncementsService SHALL set `readAt` to `NULL`.
3. WHEN a customer opens an announcement in the Announcement_Archive, THE Backend_API SHALL set `readAt` to the current UTC timestamp for the corresponding `AnnouncementLog` record.
4. IF a `markRead` request is received for an `AnnouncementLog` that already has a non-null `readAt`, THEN THE Backend_API SHALL leave `readAt` unchanged and return a success response.
5. THE Backend_API SHALL expose a `PATCH /announcements/logs/:logId/read` endpoint that sets `readAt` and returns the updated `AnnouncementLog`.
6. FOR ALL `AnnouncementLog` records, THE Database_Schema SHALL enforce that `readAt` is either `NULL` or a timestamp that is greater than or equal to `sentAt`.

---

### Requirement 2: Real-Time Toast Notification

**User Story:** As a customer, I want to see an instant toast notification when an admin broadcasts an announcement while I am online, so that I am immediately aware of important updates without checking my email.

#### Acceptance Criteria

1. WHEN `AnnouncementsService.broadcast()` creates an `AnnouncementLog` record for a customer, THE AnnouncementsService SHALL call `NotificationsGateway.sendToUser(customerId, 'ANNOUNCEMENT_RECEIVED', payload)` immediately after the log is created.
2. THE WebSocket payload for `ANNOUNCEMENT_RECEIVED` SHALL contain: `logId` (string), `announcementId` (string), `title` (string), `excerpt` (string, first 160 characters of plain-text content), and `sentAt` (ISO 8601 string).
3. WHEN the frontend WebSocket client receives an `ANNOUNCEMENT_RECEIVED` event, THE Dashboard SHALL display a toast notification containing the announcement title and excerpt.
4. THE Toast SHALL remain visible for a minimum of 6 seconds before auto-dismissing.
5. THE Toast SHALL include a labelled action button that, when activated, opens the Announcement_Archive and scrolls to the received announcement.
6. WHERE the customer's browser locale is Turkish, English, or German, THE Toast SHALL render all static labels in the corresponding language using i18n keys.
7. IF the customer is not connected via WebSocket at broadcast time, THEN THE AnnouncementsService SHALL NOT attempt a WebSocket emit and SHALL rely on the email and archive for delivery.
8. WHEN `AnnouncementsService.broadcast()` emits `ANNOUNCEMENT_RECEIVED` for a batch of customers, THE AnnouncementsService SHALL emit one event per customer using the customer's own `userId`, not a shared room.

---

### Requirement 3: Announcement Archive

**User Story:** As a customer, I want to view all announcements that were sent to me in a dedicated archive section, so that I can read past announcements I may have missed or want to revisit.

#### Acceptance Criteria

1. THE Backend_API SHALL expose a `GET /announcements/my` endpoint that returns all `AnnouncementLog` records for the authenticated customer, ordered by `sentAt` descending, including `announcementId`, `title`, `contentHtml`, `sentAt`, and `readAt`.
2. WHEN the `GET /announcements/my` endpoint is called, THE Backend_API SHALL only return records belonging to the authenticated customer's `customerId`, never records of other customers.
3. THE Dashboard SHALL render an Announcement_Archive section accessible via a bell icon in the Sidebar or a dedicated widget on the Dashboard page.
4. WHEN the Announcement_Archive is opened, THE Dashboard SHALL fetch and display the list of announcements showing title and `sentAt` date for each entry.
5. WHEN a customer selects an announcement entry in the Announcement_Archive, THE Dashboard SHALL display the full announcement content in a modal or drawer.
6. WHEN the modal or drawer is opened for an unread announcement, THE Dashboard SHALL call `PATCH /announcements/logs/:logId/read` to mark it as read.
7. THE Announcement_Archive SHALL visually distinguish unread announcements from read ones (e.g., bold title or unread indicator dot).
8. WHERE the customer's browser locale is Turkish, English, or German, THE Announcement_Archive SHALL render all static labels and date formats in the corresponding language using i18n keys.
9. IF the `GET /announcements/my` endpoint returns an empty list, THEN THE Announcement_Archive SHALL display an empty-state message indicating no announcements have been received.
10. THE Announcement_Archive SHALL support pagination or infinite scroll for customers with more than 20 announcement records, loading 20 records per page.

---

### Requirement 4: Unread Badge Count

**User Story:** As a customer, I want to see a badge showing the number of unread announcements on the navigation or dashboard, so that I know at a glance whether there are announcements I have not yet read.

#### Acceptance Criteria

1. THE Backend_API SHALL expose a `GET /announcements/my/unread-count` endpoint that returns `{ count: number }` representing the number of `AnnouncementLog` records for the authenticated customer where `readAt IS NULL`.
2. WHEN the Dashboard page loads, THE Dashboard SHALL fetch the Unread_Count and display it as a numeric badge on the bell icon in the Sidebar or the Announcement_Archive widget.
3. WHEN the Unread_Count is zero, THE Dashboard SHALL hide the badge entirely rather than displaying "0".
4. WHEN the frontend receives an `ANNOUNCEMENT_RECEIVED` WebSocket event, THE Dashboard SHALL increment the local Unread_Count by 1 without requiring a full refetch.
5. WHEN a customer marks an announcement as read (by opening it), THE Dashboard SHALL decrement the local Unread_Count by 1 if the announcement was previously unread.
6. THE Badge SHALL cap the displayed number at 99, showing "99+" for counts exceeding 99.
7. WHERE the customer's browser locale is Turkish, English, or German, THE Badge SHALL use locale-appropriate number formatting via i18n.

---

### Requirement 5: Security and Data Isolation

**User Story:** As a system operator, I want to ensure that customers can only access their own announcement data, so that announcement content is not leaked between customers.

#### Acceptance Criteria

1. THE Backend_API SHALL authenticate all `/announcements/my*` and `/announcements/logs/:logId/read` endpoints using the existing JWT guard.
2. WHEN a `PATCH /announcements/logs/:logId/read` request is received, THE Backend_API SHALL verify that the `AnnouncementLog` record's `customerId` matches the authenticated customer's profile ID before updating.
3. IF the `customerId` does not match, THEN THE Backend_API SHALL return HTTP 403 Forbidden without modifying any data.
4. THE Backend_API SHALL NOT expose announcement content, `readAt`, or `sentAt` of other customers in any response.

---

### Requirement 6: Correctness Properties (Property-Based Testing)

**User Story:** As a developer, I want well-defined correctness properties for the announcement notification logic, so that property-based tests can catch edge cases in data transformation and state management.

#### Acceptance Criteria

1. FOR ALL valid `AnnouncementLog` records, THE Unread_Count_Calculator SHALL return a count equal to the number of records where `readAt IS NULL` — this invariant must hold regardless of the order records are processed.
2. FOR ALL sequences of `markRead` operations applied to the same `AnnouncementLog`, THE Backend_API SHALL produce the same final `readAt` value as applying the operation once (idempotence property).
3. FOR ALL `ANNOUNCEMENT_RECEIVED` WebSocket payloads, THE Excerpt_Generator SHALL produce an excerpt of at most 160 characters that is a prefix of the original plain-text content (truncation invariant).
4. FOR ALL valid announcement content strings, THE Excerpt_Generator SHALL produce an excerpt such that `excerpt.length <= 160` and `originalPlainText.startsWith(excerpt.trimEnd())` (round-trip prefix property).
5. FOR ALL customers with N unread announcements, THE Unread_Count_Calculator SHALL return N after N `markRead` operations are applied to distinct records (count convergence property).
6. WHEN the frontend applies a sequence of `ANNOUNCEMENT_RECEIVED` increments and `markRead` decrements to the local Unread_Count, THE Dashboard SHALL never display a negative Unread_Count (floor invariant: `count >= 0`).
7. FOR ALL `GET /announcements/my` responses, THE Backend_API SHALL return records in strictly descending `sentAt` order — for any two adjacent records `a` and `b` in the response, `a.sentAt >= b.sentAt` (ordering invariant).
