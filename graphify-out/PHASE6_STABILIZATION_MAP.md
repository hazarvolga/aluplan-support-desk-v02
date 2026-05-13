# Phase 6 Stabilization Map

Date: 2026-05-13

This phase map was generated from a targeted `graphify` AST extraction over the code files touched during the stabilization work, rather than a full-repo rebuild.

Reason:
- the existing `graphify` manifest had drifted out of format with the currently installed `graphify` package
- the last full graph snapshot was old enough that a repo-wide incremental update detected 705 changed files
- that update was not suitable for a fast, phase-end mapping pass

## Files mapped

- `apps/backend/src/notifications/notifications.gateway.ts`
- `apps/backend/src/products/products.controller.ts`
- `apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx`
- `apps/frontend/src/hooks/useAiHealthSocket.ts`

## Extraction summary

- Nodes: 50
- Edges: 98

## Per-file impact

### `apps/backend/src/notifications/notifications.gateway.ts`
- 25 nodes
- 44 edges
- Key symbols:
  - `resolveAllowedOrigins()`
  - `NotificationsGateway`
  - `.afterInit()`
  - `.handleConnection()`
  - `.handleDisconnect()`
  - `.updatePresence()`
  - `.joinTicket()`

High-signal graph observations:
- imports Prisma, Redis, Email, proactive chat queue constants, and AI health event service
- `handleDisconnect()`, `joinTicket()`, and `leaveTicket()` all converge on `updatePresence()`
- this remains one of the backend’s highest-blast-radius realtime nodes

### `apps/backend/src/products/products.controller.ts`
- 10 nodes
- 15 edges
- Key symbols:
  - `ProductsController`
  - `.findAll()`
  - `.create()`
  - `.findOne()`
  - `.createCategory()`
  - `.updateCategory()`
  - `.deleteCategory()`
  - `.restoreFaqs()`

High-signal graph observations:
- imports `JwtAuthGuard`, `RbacGuard`, and RBAC decorators directly
- the `restoreFaqs()` route now sits on the guarded/admin path instead of the public path

### `apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx`
- 13 nodes
- 36 edges
- Key symbols:
  - `AdminSettingsPage()`
  - `getListModelsButtonLabel()`
  - `loadSettings()`
  - `loadAiHealth()`
  - `getSetting()`
  - `updateValue()`
  - `handleLogoSelect()`
  - `handleSave()`

High-signal graph observations:
- imports `next-intl`, toast hook, API client, and telemetry dashboard
- the added `getListModelsButtonLabel()` function centralizes repeated model-list button text
- this file remains the main frontend integration hub for admin AI settings

### `apps/frontend/src/hooks/useAiHealthSocket.ts`
- 2 nodes
- 3 edges
- Key symbols:
  - `useAiHealthSocket.ts`
  - `useAiHealthSocket()`

High-signal graph observations:
- imports React hooks and the shared socket factory
- reconnect handling is now structurally concentrated inside a single hook boundary

## Audit note

This was an AST-first map, so `imports` edges are the most trustworthy output here.

Some `calls` edges are clearly noisy because graph extraction can over-link common method names across files. For example:
- `NotificationsGateway.emitTicketUpdated -> ProductsController.create`
- `handleSavePolicy -> ProductsController.create`

Treat those as extraction noise, not architectural truth.

## Phase 6 outcome

Phase 6 is considered complete at the stabilization level because:
- all phase commits are in place
- touched code surfaces were mapped with `graphify` extraction
- the manifest incompatibility that blocked incremental update was identified and repaired

What is still not done:
- a fresh full-repo `graphify update` or rebuild across the entire repository

That should be treated as a separate maintenance pass, not as part of this stabilization phase.
