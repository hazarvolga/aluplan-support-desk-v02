# Session Summary - 2026-05-13

## Goal
Stabilize the backend startup path, harden a few real code risks, reduce repo-root noise, and clean up frontend AI settings debt without trusting stale root markdown reports.

## What Was Done

### Faz 0 - Checkpoint
- Commit: `137309c chore: checkpoint pending product code changes`
- Preserved existing uncommitted product work before starting focused cleanup.

### Faz 1 - Backend startup blocker
- Root cause reproduced: `nest build` failed with `EMFILE: too many open files, watch`
- Fix: disabled asset watchers in `apps/backend/nest-cli.json`
- Commit: `10a5d1e fix(backend): disable asset watchers during build`
- Verification:
  - Backend build: passed
  - Backend startup: passed
  - App booted successfully on `http://localhost:4000/api/v1`

### Faz 2 - Security / ops hardening
- Locked down `POST /products/internal/restore-faqs` behind `JwtAuthGuard + RbacGuard + Roles('admin')`
- Tightened WebSocket CORS origin handling to configured origins only
- Reduced handshake diagnostics so token prefixes are no longer logged
- Commit: `6aebabe fix(backend): harden restore endpoint and ws origins`

### Faz 3 - Repo hygiene / archival cleanup
- Moved misleading root-level legacy reports and artifacts into:
  - `archive/legacy-root-docs/2026-05-13/`
  - `archive/legacy-artifacts/2026-05-13/`
- Added a short archive README to mark them as historical only
- Ignored local worktree / graphify scratch artifacts in `.gitignore`
- Commit: `6e3f81f chore(repo): archive legacy root reports`

### Faz 4 - Frontend stabilization
- Fixed `useAiHealthSocket()` listener duplication on reconnect by binding handlers once per hook lifecycle
- Replaced hardcoded AI settings strings with `next-intl` keys
- Added new translation keys to `tr.json`, `en.json`, and `de.json`
- Commit: `0f44840 fix(frontend): stabilize ai settings socket and i18n`

### Faz 5 - Verification / test reliability
- Backend typecheck: passed
- Backend build: passed
- Frontend typecheck: passed
- Targeted backend Jest run passed:
  - `src/notifications/notifications.gateway.spec.ts`
- Important note:
  - Earlier “SWC native binding” suspicion was not reproduced in the current shell path
  - The bigger issue here was flaky command streaming in this environment; `spawnSync` produced reliable verification output

## Current Clean State
- New commits in order:
  1. `10a5d1e fix(backend): disable asset watchers during build`
  2. `6aebabe fix(backend): harden restore endpoint and ws origins`
  3. `6e3f81f chore(repo): archive legacy root reports`
  4. `0f44840 fix(frontend): stabilize ai settings socket and i18n`

## Remaining Local Noise Not Touched
- Modified:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `graphify-out/GRAPH_REPORT.md`
- Untracked:
  - `.agents/skills/`
  - `.github/agents/`
  - `.kiro/specs/ai-pipeline-data-cleanup/`
  - `.kiro/specs/crm-realtime-sync/`
  - `.kiro/specs/rich-text-editor/`
  - `.kiro/specs/ui-contrast-accessibility/`

These were left alone deliberately because they look like user/workflow artifacts rather than product-code fixes.

## Blockers / Follow-up
- `graphify` CLI was not available in PATH during this session, so the requested post-phase graph refresh could not be executed here
- If phase-by-phase graph updates are mandatory, install or expose `graphify` in PATH and run:
  - `graphify update .`
- Good next targets:
  1. broader backend Jest sweep
  2. frontend AI settings interaction smoke test
  3. remaining direct `process.env` cleanup in backend

## Follow-up - 2026-05-13 Ticket Diagnosis Stabilization

### What changed
- Frontend ticket creation is now explicitly **AI-optional**:
  - users can continue directly to ticket creation without waiting for diagnosis
  - `my-tickets` now shows a retryable degraded state when backend fetch fails
  - API network failures are classified as `BACKEND_UNAVAILABLE` instead of leaking raw `Failed to fetch`
- Backend diagnosis now surfaces whether the answer came from:
  - `LLM`
  - `FALLBACK` (top grounded content used after bounded generation timeout / empty response)

### Commits
- `91777bb fix(frontend): make ai diagnosis optional for ticket creation`
- `8e61383 fix(ai): surface bounded diagnosis fallback mode`

### Verification
- Frontend:
  - `./node_modules/.bin/tsc --noEmit -p tsconfig.json` passed in `apps/frontend`
  - `./node_modules/.bin/vitest run src/lib/api.spec.ts` passed
- Backend:
  - `pnpm --filter @aluplan/backend typecheck` passed
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed

### Important notes
- `graphify update .` was attempted after each phase but the `graphify` binary is still unavailable in PATH in this shell.
- `gitnexus detect_changes` reports HIGH risk because the repository already contains unrelated modified files from prior RAG/indexing work; phase commits were staged narrowly to avoid pulling unrelated changes into the new commits.

## Follow-up - 2026-05-13 Sync Diagnosis Spinner

### Root cause
- A customer `POST /api/v1/ai/query?wait=true` reached backend and retrieval finished quickly.
- The request then hung in LLM re-ranking because Gemini free-tier returned `429 RESOURCE_EXHAUSTED` for `gemini-2.5-flash`, including retry delays up to ~59s.
- The existing 25s diagnosis fallback guarded the final answer generation, but not the earlier LLM re-ranking step.

### Fix applied
- Propagated the resolved `wait` flag from `AiQueryService.query()` into `queryInternal()`.
- For synchronous `wait=true` diagnosis calls, skipped LLM re-ranking and kept deterministic retrieval + heuristic re-ranking.
- Added a regression test proving synchronous wait queries do not call `ai.generate()` for re-ranking.

### Verification
- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed
- `pnpm --filter @aluplan/backend typecheck` passed
- `pnpm --filter @aluplan/backend build` passed
- Backend restarted successfully on `http://localhost:4000/api/v1`
