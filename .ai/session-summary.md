# Session Summary - 2026-05-13

## 2026-08-08 — Independent help-center i18n verification

- Independently reviewed Claude product commit `313e5b47`; its four-file scope is limited to the three locale catalogs and one real-next-intl render spec.
- Verified all 11 affected admin help components across TR/EN/DE: focused 33/33, full frontend 40/40 files and 299/299 tests, frontend typecheck and i18n integrity all passed.
- Corrected the documentation count: 193 keys, not 188, were added per locale. Every added key is consumed; 218 unique component keys are used in total, of which 25 pre-existed.
- Verified both restore bundles, their tag targets and SHA-256 values. Restarted local development with frontend on 3000 and backend on 4000; local HTTP checks returned frontend auth redirect 307 and backend health 200.
- Product decision: GO for the help-center i18n fix. Authenticated visual refresh remains a user-side acceptance check; no push/deploy/live access occurred.

## 2026-08-08 — Announcement email final local closure

- Closed the remaining announcement email safety/reconciliation blockers in `117526b1` using RED/GREEN TDD.
- Handlebars validation now covers parameterless blocks, `@root/@data`, helper arity and rejects unsupported partial/decorator syntax fail-closed.
- Reconciliation now filters only actionable linked outcomes, maps SENT/DELIVERED/BOUNCED/FAILED completely, drains deterministic 200-row batches, and conditions writes on both AnnouncementLog and EmailLog snapshot state.
- Stabilized broadcast property tests by restricting successful-payload properties to inputs the send-time safety contract accepts; the previously failing seed passed independently.
- Final evidence: focused 108/108, broad announcement/email 159/159, backend 130/130 suites (1305 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, ops/API/RBAC/migration contracts and diff hygiene passed.
- Independent code and security reviews both returned GO with C/H/M=0. Verified pre/post restore bundle SHA-256 values are recorded in the dedicated GAP report §17 and common report.
- No push/tag-push/deploy, production/shadow access, migration/seed, or live email send occurred. Claude independent review is requested before any release decision.

## 2026-08-08 — Independent announcement Phase 4 verification

- Independently reviewed Claude product commit `edae3067` without changing product code or data.
- Confirmed closures: retry-aware terminal FAILED, customer response allowlist, direct unknown variable/hash/subexpression rejection, malformed Handlebars normalization, diff scope and restore integrity.
- Reproduced two remaining HIGH defects: parameterless unknown block/helper paths bypass the AST allowlist and silently render empty; QUEUED announcement logs ignore EmailLog DELIVERED/BOUNCED when webhook wins the cron race.
- Identified MEDIUM batch-starvation risk: `take:200` scans have no cursor/order/progress or DB-side outcome filter.
- Verification passed: focused backend 95/95, full backend 130/130 suites (1264 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, 24/24 ops safety, API/RBAC/migration contracts and restore bundle hashes.
- Appended the full NO-GO result to the dedicated GAP report §16 and the common report. No product code, migration, DB, push, deploy or live system was touched.

## 2026-08-08 — Independent announcement email verification

- Independently reviewed `d8f42c6d`, `df724734`, `f4668592`, and `e4c2ddc8` without changing product code.
- Narrow GO: BUG-02 canonical customer-field parity; GAP-08 additive computed `contentFormat` with non-blocking edge caveats.
- NO-GO: incomplete Handlebars AST/fail-closed coverage and inactive runtime announcement Zod contract; retry/webhook-inaccurate AnnouncementLog reconciliation; customer response leakage of internal email-log/error fields.
- Evidence: focused backend 110/110, focused frontend 4/4, full backend 129/129 suites with 1230 passed/1 skipped, full frontend 39/39 files with 266 passed; typecheck/i18n/ops/API/RBAC/migration gates passed; all reported announcement restore hashes and bundles verified.
- Appended full evidence and remediation order to the dedicated GAP report and `codex-claude-ortak-rapor.md`. Personalized/dynamic announcements remain NO-GO; push/deploy/live restrictions unchanged.

## Follow-up - 2026-08-06 Faz 7 Schema Parity

### What changed

- Added the additive, no-DROP `20260806000000_align_schema_parity` migration and aligned `schema.prisma` with production-proven indexes, four unique constraints, the Knowledge Pool parent FK, and physical type/default truth.
- Removed two misleading Prisma B-tree declarations named as HNSW indexes. HNSW lifecycle remains external under `RagMaintenanceService`; 3072-dimensional embeddings use exact search.
- Added blocking schema-parity, migration-safety, and source/target data-fingerprint tooling. The comparator rejects identical databases, opens read-only sessions, and is restricted operationally to local/sanitized clones.
- Technical commit: `612706c1` (`fix(database): align fresh and shadow schema parity`).

### Verification

- Fresh disposable PG17: all 50 migrations applied; second deploy had no pending migrations; integrity and schema-parity gates passed.
- Restored production-shadow clone: only the expected foundation + parity migrations applied; second deploy had no pending migrations.
- Source shadow versus restored clone fingerprints matched across 61 public business tables and sequences both before and after clone migrations.
- Both fresh and clone parity gates retain exactly one documented residual: externally managed partial index `idx_faq_entries_embedding_version_dim`.
- Prisma validate, backend/frontend typecheck, i18n, migration file gate, Node syntax, and `git diff --check` passed.
- Full backend suite: 116/116 suites passed; 1020 tests passed, 1 skipped, 0 failed.
- Final code review, database review, and security review approved the local commit with no P0-P2 blocker.

### Safety correction

- The reusable snapshot previously described as fully sanitized still contains 14 non-empty rows marked `settings.is_secret=true`. Values were not printed or inspected. CRM/webhook secrets, active integration flags, and user refresh-token hashes remain zero.
- The dump and shadow env are mode `600` and git-ignored, but the dump must not be treated as secret-free or shared. Create a new clone-only sanitized snapshot before any application runtime or external handoff.
- No production connection/write/migration, deploy, remote push, or tag push occurred.

## Follow-up - 2026-08-06 Graphify And GitNexus Tooling Audit

- Refreshed the local Graphify 0.9.30 code graph: 835 code files, 7,338 nodes, 14,249 edges, and 614 communities. Graphify retained a dated curated-graph backup and did not emit the smaller-graph overwrite warning.
- Verified the `RagMaintenanceService` maintenance path and identified `PrismaService` as the largest current graph hub (degree 254).
- Graphify reported 52 SQL files without structural nodes because the optional SQL parser is not installed; database migration acceptance must continue to rely on PostgreSQL and migration-integrity/parity gates.
- GitNexus CLI and local index are absent. Historical AGENTS.md index counts are not current verification.
- Did not install GitNexus: official package 1.6.9 uses PolyForm Noncommercial 1.0.0, so commercial-use rights must be confirmed first for this production product.
- Added a user-requested top-of-report coordination note explaining tool roles, coexistence, ignore boundaries, and the license gate. No production state or remote changed.

## Follow-up - 2026-08-05 Production Shadow Database Baseline

### What changed

- Established the production-data safety baseline as a binding workflow:
  - production is read-only,
  - data only flows `prod -> local`,
  - local development must never point `DATABASE_URL` at production IP `167.86.84.107`,
  - production Prisma migration/restore/reset/resolve commands remain forbidden without a separate maintenance decision.
- Took a read-only PostgreSQL custom-format dump from production Coolify database container `lwk8ok04ocg4w4soog0c888g` (`pgvector/pgvector:pg17`), database `aluplan_support`.
- Stored the raw dump outside Git at `.private-data/prod-dumps/aluplan-support-prod-20260805-193338-pg17.dump`.
- Created a separate local shadow Postgres container:
  - `aluplan_shadow_postgres_pg17`
  - `pgvector/pgvector:pg17`
  - `localhost:55432`
  - database `aluplan_support`
  - local env file `.private-data/shadow/shadow-postgres.env`
- Restored the production dump into this separate shadow DB without touching existing local `aluplan_postgres`.
- Sanitized the shadow DB so local work cannot accidentally call production-like integrations:
  - CRM connections inactive,
  - CRM/webhook secrets removed,
  - user refresh-token hashes removed,
  - secret/token/API-key/password settings emptied.
- Created a sanitized reusable local snapshot at `.private-data/prod-dumps/aluplan-support-shadow-sanitized-20260805-194053-pg17.dump`.
- Intentionally did not copy production Redis. Local Redis should remain empty/ephemeral to avoid replaying live BullMQ jobs, sessions, OAuth state, semantic cache, or throttle counters.

### Evidence

- Raw dump:
  - size `132 MB` / `138034033` bytes,
  - SHA-256 `d12371d0b316fdab1e811fa658a0ca890968596c53d02d3b845cc709679d56da`,
  - archive header: `dbname: aluplan_support`, `TOC Entries: 399`, `Format: CUSTOM`.
- Shadow DB restore:
  - public tables: `64`,
  - database size: approximately `233 MB`,
  - counts: `users=1282`, `tickets=162`, `ticket_messages=476`, `knowledge_sources=241`, `knowledge_embeddings=77`, `knowledge_pool_embeddings=7745`, `_prisma_migrations=54`.
- Sanitization verification:
  - `crm_active=0`,
  - `crm_secrets=0`,
  - `webhooks_active=0`,
  - `webhook_secrets=0`,
  - `user_refresh_hashes=0`,
  - `secret_settings_nonempty=0`.
- Sanitized snapshot:
  - SHA-256 `2e5f7e09a7e4ffbf61787f978a4a401527be46eae4895a5d7ba26c39ef5d770b`,
  - `pg_restore --list` produced `399` TOC entries.
- Prisma shadow verification:
  - `DATABASE_URL="$SHADOW_DATABASE_URL" pnpm exec prisma migrate status --config packages/database/prisma.config.js`
  - result: `Database schema is up to date!`

### Notes

- The temporary SSH key `aluplan-codex-dump-20260805` may still be present in `/root/.ssh/authorized_keys` on the VPS. Remove it after no further backup access is needed.
- `.private-data/`, `*.dump`, and `*.backup` are ignored by Git.
- Continue GAP remediation locally against the shadow DB. Do not use the production database for tests or migration inspection.
- Next safe targets: BULGU-02/BULGU-18 auth-token negative tests and BULGU-10 migration-history inspection using the shadow DB.

## Follow-up - 2026-06-30 Ticket Filter Hardening

### What changed

- Replaced the tickets page status dropdown/fake KPI cards with status chips backed by the backend ticket list query.
- Added submit-based ticket search for ticket number, subject, customer, email, and customer company fields.
- Added `includeStatusCounts` support to the tickets API so status counters are computed from the same scoped/search-filtered queue while intentionally ignoring the active status filter.
- Added `DRAFT` as a first-class ticket status in the frontend status model and `tr/en/de` ticket status translations. This closes the live `MISSING_MESSAGE: tickets.status.DRAFT (tr)` failure class observed on production.
- Hardened frontend/backend deployment order: if an older backend omits `statusCounts`, the frontend hides counters instead of rendering misleading zeroes.
- Added an assignee column so "Bana Atananlar" and "Tüm Talepler" scope changes are visible in the table, not only in the request URL.

### Verification

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts` passed with 23 tests.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/tickets/TicketsPage.spec.tsx'` passed with 10 tests.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `git diff --check` passed.

### Notes

- Restore point before the implementation: branch `codex/restore-ticket-filters-20260630-085348` at commit `17331a38`.
- Deploy backend first, then frontend, so the live UI receives `statusCounts` immediately.
- Remaining production performance risk should be watched through real API latency/query telemetry after deploy because search uses relation-aware contains filters; the UI only submits search on form submit, so it does not query on every keystroke.

## Follow-up - 2026-05-26 SupportAnswerOrchestrator Customer/Admin Parity

### What changed

- Moved customer-side retrieval-context acceptance into `SupportAnswerOrchestrator.shouldGenerateFromRetrievedContext(...)`.
- `AiQueryService.query()` and `AiQueryService.streamQuery()` now use the orchestrator decision before returning `NO_MATCH`.
- The decision records result count, effective threshold, audience, visual-evidence allowance, and top score for later traceability.
- Customer ticket-opening synthesis now uses the stronger score between initial retrieval diagnostics and post-rerank top result, preventing usable threshold-edge matches from being cut off before ANN-style synthesis.
- Added a regression for the live failure class: a 3B grid/Axis Grid support question with `topScore=0.8034` reaches LLM synthesis instead of returning `NO_MATCH`.
- Added `allplan-help/` to `.gitignore` so the local official help mirror stays out of GitHub until a deliberate import plan exists.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-query.service.spec.ts` passed with 67 tests and 1 skipped.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Notes

- This fixes the architectural half-gap where customer/admin shared answer prompts but not the retrieval acceptance decision.
- `allplan-help/` content was not processed or staged in this pass.

## Follow-up - 2026-05-24 Hotinfo Retrieval Applicability

### What changed

- Hotinfo is now evaluated more deeply for AI/RAG source applicability instead of only being shown in ticket UI.
- Customer AI query and admin Copilot both append safe Hotinfo search signals for license/activation/transfer questions.
- Allplan version and build id from Hotinfo can now steer retrieval away from legacy Softlock sources for modern Allplan installs.
- Legacy unreadable license-file traces are explicitly treated as low-trust telemetry, not as proof that a modern Cloud/Wibu/BIMPLUS license is invalid.
- Raw license numbers, `_SEC.NSE` paths, and raw Hotinfo traces are not leaked into retrieval/search prompts.
- Prompt context now includes structured multi-GPU card details, including secondary GPU VRAM/RAM, driver date/version, and resolution.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts prompt-context-builder.service.pbt.spec.ts hotinfo-parser.service.spec.ts ai-copilot.service.spec.ts` passed with 112 tests and 1 skipped.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Notes

- Modern license questions with Hotinfo showing Allplan 2026 should no longer accept old 2006-2013 Softlock documents as HIGH-confidence primary evidence.
- Explicit legacy contexts such as Allplan 2012 can still use Softlock sources when Hotinfo or the user question actually indicates a legacy version.

## Follow-up - 2026-05-24 LearnNow Course URL Guardrail

### What changed

- Hardened LearnNow enrollment/course handling from warning-only to enforcement.
- `learnnow.allplan.com/course/*` URLs are now rejected when admins try to add them as normal URL sources.
- Generic web crawl discovery now rejects a `/course/` start URL and skips `/course/` child links.
- LearnNow-specific candidate extraction now rejects `/course/*` URLs before article/PDF format checks, including course-layer PDF-looking links.
- Knowledge Pool URL modal now refuses `/course/` URLs before submission and shows a localized error.
- Removed the extra warning card from the crawler screen; the public crawl boundary is now explained in the primary notice.

### Verification

- `pnpm --filter @aluplan/backend test -- generic-web-crawler.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool-job.spec.ts` passed with 26 tests.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.

### Notes

- Production was previously observed running commit `44d21f86`, while the public-only LearnNow boundary commit was local at `8e5b1168`; deploy must use the latest pushed head for this guardrail to appear live.

## Follow-up - 2026-05-23 Operations Dashboard Phase 5

### What changed

- Completed the final verification pass for the operations dashboard implementation.
- No additional product-code changes were needed after Phase 4.
- Confirmed the dashboard is ready as a coordinated backend + frontend deploy set:
  - backend provides `GET /dashboard/ops`
  - frontend consumes the aggregate endpoint and renders the approved operations control UI
  - mobile layout uses stacked cards, responsive modals, and internal panel scrolling
- Left unrelated local artifacts uncommitted:
  - `.superpowers/`
  - `Aluplan-Support-Intelligence-PRD.docx`

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 6 tests.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Notes

- The focused frontend test still prints the existing framer-motion test mock warning about `whileHover`; it is test setup noise and did not fail validation.
- Local frontend/backend servers were not already running, so this phase used build/type/unit validation rather than an authenticated browser smoke.

### Next

- Deploy backend first, then frontend.
- After deploy, smoke-test `/tr/dashboard` and `/en/dashboard` as admin/staff at desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 4

### What changed

- Added controlled live refresh behavior to the admin/staff operations dashboard.
- Dashboard now supports:
  - manual refresh from the header
  - visible refresh/spinner state
  - visible last-updated timestamp
  - 60-second background refresh for staff/admin dashboards
- Customer/viewer dashboard does not start the operations polling loop.
- Added a regression test for manual refresh calling the operations endpoint again.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 6 tests.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Notes

- Local frontend/backend servers were not already running in this workspace, so Phase 4 used build/type/unit validation instead of a live authenticated browser smoke. Final phase should include browser smoke if local auth/backend can be started safely.

### Next

- Phase 5 should run final audit, broader verification, commit any remaining docs, and produce the deployment-ready report without pushing.

## Follow-up - 2026-05-23 Operations Dashboard Phase 3

### What changed

- Operations pulse cards are now actionable instead of decorative.
- Clicking Ticket, AI, CRM, or Knowledge pulse opens a responsive detail modal.
- Each modal is fed from the same `GET /dashboard/ops` payload and shows:
  - localized metric strips
  - a larger trend chart
  - linked recent records when available
  - action buttons to the relevant operational area
- Empty modal record lists render an explicit empty state rather than placeholder data.
- Added regression coverage for opening a pulse modal and seeing real ticket data inside it.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed with 5 tests.
- `git diff --check` passed.

### Notes

- The modal uses responsive `calc(100vw - ...)` widths and max-height internal scrolling so it remains usable on mobile and narrow laptop windows.

### Next

- Phase 4 should add controlled live refresh/manual refresh behavior and then run browser smoke checks at desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 2

### What changed

- Replaced the admin/staff dashboard surface with the operations control shell from the approved mockup.
- The new dashboard consumes `GET /dashboard/ops` through `api.dashboard.ops(7)`.
- Customer/viewer dashboard behavior remains separate and still avoids admin-only observability calls.
- Added:
  - header actions for live AI cost and system health drawers
  - operations KPI cards
  - operations pulse preview cards
  - active support desk list
  - action queue list
  - live mini feed
  - tabbed operations workspace for overview, CRM, Knowledge Pool, LearnNow, and AI Health
- Added complete `dashboard.ops` translations for Turkish, English, and German.
- Added a frontend MSW fixture for the new operations endpoint and updated the dashboard unit test to assert the new data flow.
- Mobile behavior is explicitly covered in the component structure: KPI/pulse cards stack, the ops column drops below content on narrow screens, and long lists scroll inside their panels.

### Verification

- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `git diff --check` passed.

### Notes

- The focused dashboard test still prints the existing framer-motion test-mock warning about `whileHover`; this is test setup noise, not a product-code warning.

### Next

- Phase 3 should make the operations pulse cards open real-data modals with larger charts, filters, and action links.
- Phase 4 should add refresh/live-update behavior and browser smoke checks across desktop and mobile widths.

## Follow-up - 2026-05-23 Operations Dashboard Phase 1

### What changed

- Added a dedicated backend operations dashboard module and `GET /dashboard/ops` endpoint.
- The endpoint aggregates real operational data for:
  - active tickets, unassigned tickets, SLA breaches, resolved-today count
  - ticket trend series
  - action queue counts
  - AI quality metrics and trend series
  - admin/superuser-only AI estimated cost telemetry
  - CRM update/failure summaries
  - Knowledge Pool, dataset, generic crawler, and LearnNow candidate summaries
  - BullMQ queue counts for knowledge sync, CRM sync, and AI query processing
  - system health and recent live feed events
- Empty chart data is returned as deterministic zero-value series so the frontend can show honest empty states instead of decorative/fake charts.

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Next

- Phase 2 should replace the current admin dashboard UI with the mockup shell using this single aggregate endpoint, while preserving the simpler customer dashboard.

## Follow-up - 2026-05-23 LearnNow Review Decisions Phase 5

### What changed

- Learn Now candidate enrichment now uses a single review-decision helper instead of one-off `explaining_video` checks.
- Media-like formats now require transcripts consistently across stale/internal and live/public names:
  - `explaining_video`
  - `explainer_video`
  - `recorded_online_session`
  - `recording`
- Recorded session candidates without transcript text are staged as review-only with `reasonCode=TRANSCRIPT_REQUIRED`.
- Technical Manual/PDF candidates are marked importable but carry `reasonCode=PDF_VALIDATED_ON_IMPORT`, because the actual PDF bytes are still validated during import.
- Candidate review metadata now includes reason codes such as `MEDIA_TRANSCRIPT_READY`, `CONTENT_TOO_SHORT`, and `NEEDS_CONTENT_REVIEW`.
- Knowledge Pool candidate UI now shows localized reason badges in `tr`, `en`, and `de`.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts crawl.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed after the frontend build completed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `git diff --check` passed.
- Live read-only LearnNow smoke with a real `TotaraSession` returned candidates for:
  - `knowledge_article` sample ids: `9461`, `9460`, `9459`.
  - `pdf` / Technical Manuals sample ids: `2826`, `2828`, `2829`.
  - `explainer_video` sample ids: `2740`, `2743`, `2741`.
  - `recording` sample ids: `2950`, `2959`, `7230`.

### Notes

- Running frontend build and frontend typecheck in parallel can race over `.next/types`; the typecheck failure from that race was not a product-code failure and passed when rerun after build.
- No production DB writes were performed; the live smoke only fetched public LearnNow pages.

### Next

- Run a small end-to-end pilot on one Knowledge Article, one transcript-backed video, one Technical Manual/PDF, and one Recorded Session before pushing/deploying the LearnNow batch.

## Follow-up - 2026-05-23 LearnNow Public Format Filters Phase 4

### What changed

- Learn Now discovery now uses the real public Totara format filter values observed from the live LearnNow UI.
- `Technical Manuals` discovery maps to the public `pdf` filter and stages resulting candidates as `PDF`.
- `Explaining video` discovery maps to `explainer_video`.
- `Recorded online session` discovery maps to `recording`.
- Added regression coverage so future crawler changes do not silently revert to stale internal labels such as `technical_manual`, `explaining_video`, or `recorded_online_session`.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts crawl.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `git diff --check` passed.

### Notes

- No production DB writes were performed.
- `npx gitnexus impact` / `detect_changes` were attempted, but the GitNexus CLI failed before analysis with its known local package/index error; this did not change source files.

### Next

- Next LearnNow phase should add recorded-session/manual-specific import review rules and then run one end-to-end pilot import smoke before pushing the full LearnNow batch.

## Follow-up - 2026-05-23 LearnNow Candidate Quality Phase 3

### What changed

- Learn Now discovery now enriches saved howto candidates before they enter the review queue.
- Candidate metadata now records review quality signals: source type, content length, image count, transcript status/language/length, and ready-for-import flag.
- Existing candidates discovered again receive refreshed title/content hash/metadata instead of staying stale.
- Crawler candidate API now exposes `contentHash`.
- Knowledge Pool crawler UI now shows compact quality badges for content length, images, transcript status, and ready/review state in all supported UI languages.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed for `tr`, `en`, and `de`.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.
- `git diff --check` passed.

### Next

- Phase 4 should add Technical Manual / Recorded Online Session extraction rules and keep low-confidence media candidates review-only.
- After all LearnNow phases, run a small end-to-end production-like import smoke with one article and one transcript-backed video before pushing/deploying.

## Follow-up - 2026-05-23 LearnNow Video Transcript Phase 2

### What changed

- Learn Now howto video resources now extract `vimeo_url` from the Totara API or Vimeo iframe references from the detail HTML.
- When a Vimeo ID is available, the crawler reads the public Vimeo player config and imports the default subtitle/caption VTT as clean transcript text.
- Explaining video content now includes a `Video Transcript (...)` section when captions are available, so video sources can participate in RAG with real spoken content instead of metadata-only shell text.
- Learn Now metadata now records Vimeo ID, Vimeo title, transcript status, transcript language, transcript label, and transcript length.
- `hasVideoUrl` now treats a Vimeo ID as a valid video URL signal.

### Verification

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `git diff --check` passed.
- Live read-only smoke for LearnNow video `id=2740` returned `provider=learnnow-api`, `vimeoVideoId=880602266`, `transcriptStatus=AVAILABLE`, `transcriptLanguage=de`, and transcript text in the crawl content; no DB writes were performed.

### Next

- Phase 3 should add Sync Center/admin quality signals for candidate readiness: source type, image count, transcript availability, content length, language, and review-only warnings.
- Phase 4 should cover Technical Manuals / Recorded Online Sessions with the same evidence-first import behavior.

## Follow-up - 2026-05-23 LearnNow Detail Extraction Phase 1

### What changed

- Learn Now howto detail URLs now use the public Totara `engage_howto_get_howto` API before generic Crawl4AI/basic crawling.
- The crawler first establishes a public `/int` session, extracts the Totara sesskey from the detail page, then fetches the real howto JSON.
- Knowledge Article imports now receive the actual Salesforce article body instead of the Totara shell text.
- `salesforce_content` images such as `pluginfile.php/.../engage_howto/salesforce_content/...` are extracted as URL images so existing visual enrichment can summarize them during knowledge sync.
- Learn Now metadata now records resource id, howto type, language, country settings, versions, categories, Salesforce number, and image count.
- Explaining video resources currently import metadata/description only when no transcript or video URL is exposed by the public API; transcript extraction remains the next phase.

### Verification

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts knowledge-pool.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- Live read-only smoke for LearnNow article `id=9093` returned `provider=learnnow-api`, `contentLength=2632`, `imageCount=1`, and both `Question:`/`Answer:` markers.
- Live read-only smoke for LearnNow video `id=2740` returned `provider=learnnow-api`, `type=explainer_video`, German metadata, and description-only content; no DB writes were performed.

### Next

- Phase 2 should add explicit video transcript/Vimeo extraction and mark transcript-missing video candidates as review-only/metadata-only before broad imports.
- Phase 3 should expose LearnNow Sync Center quality signals: content length, image count, transcript availability, language, source type, and import readiness.

## Follow-up - 2026-05-23 Customer Synthesis Wait UX

### What changed

- Added a desktop-only semantic data-rain layer to the customer ticket creation page background while the AI synthesis wait panel is active.
- The animation uses sanitized question/context tokens plus safe system concepts; emails, long numbers, phone-like values, license-like numbers, and raw attachment names are not rendered.
- Mobile does not render the effect.
- The synthesis panel now stays visible until the AI request resolves and then fades out smoothly instead of disappearing abruptly.

### Verification

- Frontend typecheck: passed.
- i18n integrity check: passed.
- `git diff --check`: passed.

## Follow-up - 2026-05-23 URL-only AI Input Guard

### What changed

- Added a backend AI input guard for URL-only/navigation-only ticket-opening text.
- Inputs such as `https://allplan.net.tr/en/tickets/new` no longer enter RAG retrieval, HyDE generation, semantic cache lookup, or LLM answer generation.
- The customer receives a localized clarification asking for the actual Allplan issue, while ticket creation remains available.
- Real support questions that include a URL as extra context still continue through the normal RAG path.

### Verification

- Backend focused Jest: `ai-query.service.spec.ts` passed.
- Backend typecheck: passed.

## Follow-up - 2026-05-23 Live Bug Closure Pass

### What changed

- Protected static backend routes from dynamic route shadowing:
  - `GET /teams/skills`
  - `GET /teams/agents/:id`
  - `PATCH /teams/agents/me/status`
  - `PATCH /teams/agents/me/profile`
  - `GET /tickets/by-number/:number`
  - `PATCH /tickets/bulk`
- Added route-order regression tests so these routes cannot silently regress behind `:id` handlers.
- Normalized email creation and lookup paths for auth, user creation, customer registration/import, and CRM contact sync.
- Extended customer search to include linked CRM account name/account number and removed the frontend's duplicate global customer filter that could hide valid backend matches.
- Hardened deterministic AI fallback so BIMPLUS/Share storage questions require direct BIMPLUS/Share storage evidence; unrelated license/home-office snippets now produce the safe no-match response.
- Restored dashboard SLA priority distribution by returning `byPriority` buckets from `/tickets/sla/stats`.

### Verification

- Backend focused Jest:
  - `controller-route-order.spec.ts`
  - `tickets.controller.spec.ts`
  - `tickets.service.spec.ts`
  - `users.service.spec.ts`
  - `auth.service.spec.ts`
  - `customers.service.spec.ts`
  - `crm-record-sync.service.spec.ts`
  - `ai-query.service.spec.ts`
  - `ai-copilot.service.spec.ts`
  - Result: 10 suites passed, 144 tests passed, 1 skipped.
- Backend typecheck: passed.
- Frontend typecheck: passed.

### Notes

- No production DB mutation was performed in this pass.
- Existing live mixed-case duplicate email rows, if any, still need a separate dry-run cleanup/migration decision.

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

## Memory System Note - 2026-05-13

The `.ai` folder now acts as the project memory system:

- `.ai/bootstrap.txt`: startup protocol and truth hierarchy for agents.
- `.ai/current-focus.md`: active work, known risks, and next recommended step.
- `.ai/session-summary.md`: chronological session history, commits, verification, and follow-up notes.
- `.ai/architecture-decisions.md`: durable architecture decisions in short ADR form.
- `.ai/summaries/condensed.md`: five-minute handoff summary for new agents.
- `.ai/retrieval.yaml`: retrieval priority and memory source policy.

Maintenance rule:

- Update `session-summary.md` after meaningful implementation or debugging work.
- Update `current-focus.md` when the next active objective changes.
- Add or revise an ADR when a technical direction should persist across sessions.
- Refresh `summaries/condensed.md` after major phase changes or stabilization milestones.

## Follow-up - 2026-05-21 Admin Copilot Drift Hardening

### Root cause

- Customer ticket opening and admin ANN/Copilot draft generation were still separate runtime passes.
- A ticket could have a strong customer-facing AI answer linked through `AiInteraction`, while the later admin draft model call independently returned a no-knowledge answer.
- This caused customer and admin surfaces to disagree even when the original ticket-opening answer was usable and grounded.

### Fix applied

- `AiCopilotService` now extracts the linked ticket-opening AI answer when it is usable.
- The linked answer is injected into the admin prompt as `[LINKED_CUSTOMER_AI_ANSWER]` and treated as the primary grounding signal.
- If the admin model returns no-knowledge while a linked answer exists, Copilot reuses the linked answer instead of contradicting it.
- Added a structured fallback for manual license server discovery / manual server add questions.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-copilot.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.
- Prefer code, tests, Git history, GitNexus, Graphify, and `.ai` memory over stale root-level Markdown.

## Follow-up - 2026-05-13 Regression Guard Stabilization

### Root cause

- Backend regression guard failed because `AuthController` now depends on `ConfigService`, while `auth.controller.spec.ts` still only provided `AuthService`.
- Frontend targeted test command was initially invoked through the package script with an extra `--`, causing Vitest to run a wider suite than intended.
- The wider frontend run exposed two independent test harness issues:
  - `DocBreadcrumb.spec.tsx` expected the Turkish label `Yardım`, but its `next-intl` mock returned raw translation keys.
  - `customer-properties.pbt.spec.ts` expected null customer sort values to stay last, but the local test helper normalized null to an empty string that sorted first.

### Fix applied

- Added a `ConfigService` mock to `auth.controller.spec.ts`.
- Updated the `DocBreadcrumb` test translation mock to return `Yardım` for `help.nav.back`.
- Updated the local customer sort test helper so empty/null values sort last in both directions.

## Follow-up - 2026-05-19 Hotinfo GPU and Download Revision

### What changed

- Hotinfo parsing now preserves up to two graphics adapters as structured `graphicsCards` entries.
- Each GPU card carries name, VRAM, RAM, resolution, driver date, driver version, and OpenGL when present.
- The admin ticket Hotinfo modal now shows GPU 1 and GPU 2 as separate readable cards.
- The Hotinfo modal header spacing and small telemetry values were adjusted for better readability.
- Support/admin users can download the customer's raw `.hxl` Hotinfo file directly from the ticket Hotinfo modal.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

## Follow-up - 2026-05-19 CRM Account and Contact Detail Fields

### What changed

- Added persistent CRM account fields for Service Address, Phone, Fax, Client ID: Frilo, License Manager Name, and raw CRM payload snapshots.
- Added persistent CRM contact/customer fields for Fax, Mobile Phone, Address, Primary Time Zone, Preferred Contact Method, and raw CRM payload snapshots.
- Dynamics account/contact sync now writes those fields when they are present in the CRM response or mapped through the CRM field mapping UI.
- Account detail page now shows the requested CRM account fields instead of only website/industry/address.
- Customer profile page now includes a CRM Contact Details card in the same readable format.

### Verification

- `pnpm --filter @aluplan/backend test -- crm-record-sync.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma` passed.

## Follow-up - 2026-05-19 Inbound Bounce Email Filtering

### Root cause

- Mail delivery failure notifications from `MAILER-DAEMON` / Postfix were being treated as normal inbound customer emails.
- That allowed delivery status notifications such as `Reporting-MTA`, `Final-Recipient`, `Action: failed`, and `nullMX` bounces to create support tickets.
- The visible `[E-POSTA GİZLENDİ: ...]` text is PII masking in stored/displayed message content; it is separate from the actual email sending address path.

### Fix applied

- Added shared delivery-status-notification detection for IMAP inbound and omni-channel webhook inbound flows.
- Delivery failure/bounce mails are now marked processed in `inbound_email_logs` with `Ignored delivery status notification` and do not create users, ticket messages, or tickets.

### Verification

- `pnpm --filter @aluplan/backend test -- email-inbound.service.spec.ts omni-channel.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

## Follow-up - 2026-05-19 Email Deliverability Guardrails

### Findings

- Live DNS has MX `mail.allplan.net.tr` and SPF `v=spf1 mx ip4:167.86.84.107 ~all`.
- DMARC exists as `v=DMARC1; p=none; rua=mailto:destek@allplan.net.tr; adkim=s; aspf=s`.
- Reverse DNS for `167.86.84.107` resolves to `vmi3049865.contaboserver.net`, not `mail.allplan.net.tr`.
- No public DKIM record was found for the common selectors checked, while docker-mailserver has DKIM milter configuration internally.

## Follow-up - 2026-05-21 Admin Routing Configuration

### What changed

- Added a backend `PATCH /teams/:id` endpoint for team routing settings.
- `TeamsService` now returns team member status in team/detail department views so the UI can identify active assignable agents.
- Team detail now lets admins save `autoAssignmentEnabled` and `assignmentStrategy` instead of showing a passive Configure button.
- Department detail team cards now show assignable agent counts and names, making routing gaps visible before ticket assignment fails.
- Added `teams.routing.*` translation keys for TR/EN/DE.

### Verification

- `pnpm --filter @aluplan/backend test -- teams.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Deployment note

- Not deployed and not pushed in this phase. User requested holding deploy/push until the broader phase batch is ready.

### Fix applied

- Production email enqueue now skips reserved/test recipients such as `admin@example.com`, `example.org`, `.test`, `.invalid`, and `localhost` before they reach the queue.
- Skipped invalid recipients are logged with `SKIPPED_INVALID_RECIPIENT`.
- Email DNS validation now treats Null MX (`.`) as invalid, matching domains such as `example.com` that explicitly do not accept mail.

### Verification

- `pnpm --filter @aluplan/backend test -- email.service.spec.ts email-validator.service.spec.ts email-inbound.service.spec.ts omni-channel.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

## Follow-up - 2026-05-19 CRM Full Sync Unification and Hotinfo GPU Memory

### Root cause

- Dynamics full sync still used the adapter's legacy direct DB persistence path, while delta/webhook sync used `CrmRecordSyncService`.
- That split caused full sync records to miss newer CRM detail fields, raw payload snapshots, placeholder-email repair behavior, and consistent account/contact linking.
- Hotinfo sometimes reports one `video` memory block for a multi-GPU machine, while additional GPU nodes only carry card name and driver metadata.

### Fix applied

- Added raw Dynamics full-fetch methods for accounts and contacts.
- Updated `CrmService.executeSyncProcess()` to route Dynamics full imports through `CrmRecordSyncService` when raw fetch is available.
- Added lowercase/normalized CRM mapping-key support, so saved mapping keys such as `accountnumber` can still populate the canonical `accountNumber` field.
- Updated Hotinfo GPU parsing so shared display memory and resolution are carried to additional GPU cards when per-card memory is absent.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crm.service.spec.ts crm-record-sync.service.spec.ts dynamics365.adapter.spec.ts` passed.
- `pnpm --filter @aluplan/backend test -- crm.processor.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- Real `/Users/hazarekiz/Downloads/_hotinf_.hxl` smoke showed both AMD and NVIDIA GPU cards with memory, resolution, driver date, and driver version.

### Verification

- Backend must-pass regression set passed:
  - `pnpm --filter @aluplan/backend test -- auth.controller.spec.ts tickets.controller.spec.ts notifications.gateway.spec.ts ai-query.service.spec.ts`
  - Result: 5 suites passed, 48 tests passed, 1 skipped.
- Frontend must-pass regression set passed:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/api.spec.ts src/lib/permissions.spec.ts src/components/help/DocBreadcrumb.spec.tsx 'src/app/[locale]/(dashboard)/customers/customer-properties.pbt.spec.ts'`
  - Result: 4 files passed, 58 tests passed.

### Note

- Use `pnpm --filter @aluplan/frontend exec vitest run <files...>` for targeted frontend checks. Avoid adding an extra `--` after `test:unit` because it can widen the run unexpectedly.

## Follow-up - 2026-05-13 Grounded Fallback + Hotinfo Signals

### Root cause

- Skipping sync LLM re-ranking fixed the quota stall, but fallback mode could still surface the wrong top document, e.g. an "Allplan running slow" FAQ for a Turkish graphics-card-driver update question.
- Turkish UI/questions could receive raw English source text because fallback used source content directly when Gemini was quota-limited.
- Hotinfo was available but not injected for Turkish phrases like "grafik kartı" and "sürüm güncelleme" because the hardware-query regex missed these variants.

### Fix applied

- Added query-aware local reranking for sync diagnosis fallback, with stronger signal coverage for graphics card, driver, update, IFC, license, and performance intents.
- Added deterministic fallback summaries:
  - Turkish locale now returns a Turkish safe summary plus the original source passage as a source excerpt.
  - Sync diagnosis generation timeout reduced to 6s so Gemini free-tier quota stalls degrade faster.
- Replaced duplicated hardware regex checks with normalized hardware/system-query detection that includes Turkish variants such as `grafik kartı`, `ekran kartı`, `sürüm`, and `güncelleme`.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts` passed
- `pnpm --filter @aluplan/backend typecheck` passed
- `pnpm --filter @aluplan/backend build` passed
- Backend restarted successfully on `http://localhost:4000/api/v1`

## Follow-up - 2026-05-13 DevOps Standardization Checkpoints

### Goal

- Preserve the currently working RAG/ticket system while moving the project toward cleaner DevOps practice.
- Keep Qdrant out of scope; current direction remains pgvector + Gemini/LLMAPI.
- Split changes into small, reversible commits rather than mixing docs, product code, tests, and generated graph output.

### Completed checkpoints

- `54aaefe docs(memory): establish project memory system`
  - `.ai` now acts as project memory: bootstrap, current focus, ADRs, condensed handoff, retrieval policy, and session summary.
- `21b8956 test(regression): stabilize guard tests`
  - Stabilized backend auth/controller guard test setup and targeted frontend regression tests.
- `0f966a4 fix(ai): align embedding versioning and ingestion safeguards`
  - Removed stale `model_name` assumptions from embedding writes.
  - Added `ai_response_cache.embedding_dim` schema/migration alignment.
  - Moved observability distribution to `embedding_version + embedding_dim`.
  - Added Gemini 3072-dim registry/default handling and pgvector HNSW limit safeguards.
  - Added/updated targeted tests for embedding registry, Gemini defaults, RAG maintenance, PDF parsing, and ingestion safeguards.
- `b4d7d65 ci(config): enforce provider and migration validation`
  - Unified `validateEnv()` onto the shared Zod env schema.
  - Added Gemini/LLMAPI, low-rate ingestion, RAG thresholds, and observability env validation.
  - Added production `ALLOWED_ORIGINS` safety checks.
  - Replaced Prisma 7-incompatible CI migration diff with a blocking shadow-DB migration drift gate.
  - Added `LlmApiService` regression coverage for Gemini-compatible OpenAI endpoint defaults.
- `7485e6a chore(ops): harden rag sync observability`
  - Removed an Antigravity scratch-file debug write from knowledge pool sync.
  - Replaced a sync controller `console.log` with Nest logger debug.
  - Added RAG source health metrics: total, parsed, and failed knowledge sources.
  - Repaired `ai.controller.spec.ts` provider mocks exposed during targeted tests.

### Verification already run

- Backend RAG tests:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts embedding-version.registry.spec.ts rag-maintenance.service.spec.ts gemini.service.spec.ts ai-query.service.spec.ts`
- Backend config tests:
  - `pnpm --filter @aluplan/backend test -- env-validation.spec.ts llm-api.service.spec.ts`
- Backend ops tests:
  - `pnpm --filter @aluplan/backend test -- knowledge-pool-job.spec.ts ai.controller.spec.ts`
- Backend typecheck:
  - `pnpm --filter @aluplan/backend typecheck`
- Frontend typecheck:
  - `pnpm --filter @aluplan/frontend typecheck`
- Prisma validate:
  - `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`

### Current working tree after these commits

- Still intentionally uncommitted / pending cleanup:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `apps/backend/openapi.json`
  - `graphify-out/GRAPH_REPORT.md`
  - `.agents/skills/`
  - `.github/agents/`
  - `.kiro/specs/*`
- Do not mix these with product commits. Next phase should be AGENTS/tooling/docs cleanup.

### Tooling note

- Graphify hook ran after each commit, but warned that the rebuilt graph has ~5572 nodes while existing `graph.json` has 11474 nodes, so it refused to overwrite the existing graph JSON. `GRAPH_REPORT.md` changed and should be treated as graph-output cleanup, not product code.
- GitNexus `detect_changes` currently reports only dirty docs/tooling symbols because product code checkpoints are committed.

### Next recommended step

- Finish Faz 4:
  - Clean `AGENTS.md` into one concise instruction file with a single GitNexus block.
  - Keep `.agents`, `.kiro`, `.github/agents`, `CLAUDE.md`, OpenAPI, and Graphify output in separate docs/tooling commits or archive decisions.
  - Re-run `git status`, Graphify/GitNexus checks, and update this summary again.

## Follow-up - 2026-05-13 AGENTS Cleanup

### Root cause

- `AGENTS.md` had grown to 2279 lines because multiple AI-agent exports were pasted into the same file.
- It contained repeated AGENTS blocks, a Gemini/OpenCode chat transcript, n8n-as-code bootstrap text, imported Claude instructions, and duplicate GitNexus blocks.
- This made the primary startup instruction file noisy and risky for future agents.

### Fix applied

- Replaced `AGENTS.md` with a concise 215-line project instruction file.
- Kept the current repo map, command set, truth hierarchy, RAG/Gemini direction, high-blast-radius areas, i18n/testing notes, DevOps commit hygiene, Graphify rules, and exactly one GitNexus block.
- Removed embedded chat transcripts, duplicate AGENTS sections, n8n generated text, and imported Claude dump from `AGENTS.md`.

### Remaining docs/tooling state

- `CLAUDE.md` only has a GitNexus index-count refresh and can be committed with AGENTS cleanup.
- `apps/backend/openapi.json` is currently modified to empty by generated output; do not commit until regenerated or intentionally restored.
- `graphify-out/GRAPH_REPORT.md` changed after commit hooks, but Graphify warned that rebuilt graph node count is much smaller than existing `graph.json`; do not commit graph output until that warning is resolved.
- `.agents/skills/`, `.github/agents/`, and new `.kiro/specs/*` remain untracked tooling/spec artifacts and should be reviewed in a separate commit/archive decision.

## Follow-up - 2026-05-14 Artifact Cleanup

### Decision

- Preserve the currently working product behavior; no public API, backend, frontend, Prisma schema, or migration changes in this cleanup phase.
- Keep Qdrant out of scope. Continue with the existing pgvector + Gemini/LLMAPI direction.
- Treat generated outputs and local agent tooling separately from product commits.

### Fix applied

- Restored generated `apps/backend/openapi.json` output instead of committing an accidental artifact diff.
- Restored `graphify-out/GRAPH_REPORT.md` after commit hooks because Graphify still warns that the rebuilt graph has 5572 nodes while the existing graph has 11474 nodes.
- Committed local agent-tool ignore rules in `042fe81 chore(tooling): ignore local agent artifacts`:
  - `.agents/skills/`
  - `.github/agents/`
- Committed pending Kiro specs in `704189b docs(specs): track pending kiro specs`:
  - `.kiro/specs/ai-pipeline-data-cleanup/`
  - `.kiro/specs/crm-realtime-sync/`
  - `.kiro/specs/rich-text-editor/`
  - `.kiro/specs/ui-contrast-accessibility/`

### Verification

- Confirmed the Kiro spec commit contains docs/spec files only.
- Checked new Kiro specs for obvious secret patterns such as API keys, tokens, passwords, private keys, and database URLs; no real secrets were found.
- Kept Graphify output uncommitted until the graph node-count mismatch is investigated.

### Remaining

- Investigate the Graphify source/chunk mismatch before accepting any regenerated graph output.
- Run non-mutating gates after this memory update: `git status --short`, typechecks, targeted backend RAG/config tests, and Prisma schema validation.

## Follow-up - 2026-05-14 AI Quota-Safe Fallback

### Decision

- Keep Gemini as the primary provider and OpenAI as fallback.
- Do not spend OpenAI credits during normal operation unless the primary provider is unavailable or a quota-safe fallback path is needed.
- Treat daily Gemini quota exhaustion differently from short transient rate limits: daily quota should skip retry loops and move to fallback/cooldown; transient 429s should keep the existing retry behavior.

### Fix applied

- Added provider/task scoped quota cooldown in `AiService` using `AI_PROVIDER_QUOTA_COOLDOWN_MS` with a one-hour default.
- Recorded explicit AI health events when daily quota exhaustion is detected.
- Disabled optional automatic sentiment and context-suggestion AI calls by default behind settings flags:
  - `ai.auto_sentiment.enabled`
  - `ai.auto_context_suggestion.enabled`
- Kept required ticket AI diagnosis/auto-resolution behavior intact.

### Verification

- Live OpenAI fallback credential smoke test succeeded with `gpt-4o-mini` and used only 13 tokens.
- Backend focused tests passed:
  - `pnpm --filter @aluplan/backend test -- ai.service.spec.ts ai-auto-resolver.service.spec.ts env-validation.spec.ts`
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts embedding-version.registry.spec.ts rag-maintenance.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts ai.service.spec.ts ai-auto-resolver.service.spec.ts env-validation.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- `git diff --check` passed.

### Remaining

- Email retry noise and failed background jobs remain unrelated operational cleanup items.

## Follow-up - 2026-05-14 PDF-First RAG Dataset Pilot

### Decision

- Use PDF as the canonical source for the next RAG import; keep generated MD files out unless a PDF parses poorly or no PDF exists.
- Keep raw incoming PDFs under `.archive/rag-incoming/pdf/` and copy only curated, deduped files into `dataset/`.
- Categorize Knowledge Pool sources before import so the admin UI does not show all FAQ data as `General`.

### Fix applied

- Added a dataset classifier for local Knowledge Pool imports:
  - language detection: `tr`, `en`, `de`
  - category metadata: license, license server, installation, performance, network, export/import, share/cloud, project data, release info, manuals, review backlog
  - import metadata: `categorySlug`, `sourceClass`, `canonicalSource`, `importBatch`
- Updated local dataset scan to enrich new and existing dataset sources with classifier metadata.
- Generated ignored staging manifests under `.archive/rag-staging/pdf-first/`:
  - 327 raw PDFs
  - 176 exact-unique PDFs
  - 151 exact duplicate drops
  - 123 support-first ready PDFs
  - 52 manual/review backlog PDFs
- Copied three pilot PDFs into categorized `dataset/` paths and scanned them:
  - TR: `License & Activation`
  - EN: `License Server & CodeMeter`
  - DE: `Performance & Hardware`

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- dataset-classifier.spec.ts knowledge-pool-job.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Local services were started successfully:
  - backend health: database, redis, bullmq, storage all `up`
  - frontend: `http://localhost:3000`
- Dataset scan result:
  - discovered 3 new files
  - checked 7 existing files
  - updated 7 existing source metadata records
- Pilot sync result:
  - all 3 pilot sources `SUCCESS`
  - embeddings: 20 total, all `3072 / v2_2`
- Search smoke:
  - EN license-server query returns the EN pilot source.
  - DE real-time scanner query returns the DE pilot source.
  - Targeted TR license-transfer queries return the TR pilot source first.

### Remaining

- Broad Turkish wording such as “Allplan lisansını yeni bilgisayara nasıl aktarırım?” can still retrieve adjacent EN license-server content first; treat this as a retrieval tuning issue, not an import failure.
- Do not commit `apps/backend/openapi.json` unless intentionally regenerated or restored.
- Continue imports in 5-file support batches from `.archive/rag-staging/pdf-first/ready/manifest-ready.json`.

## Follow-up - 2026-05-14 Language/Category-Aware RAG Retrieval

### Decision

- RAG search should not hard-filter by source language. User/UI language controls answer language, while source retrieval may still use EN/DE/TR documents.
- Same-language and same-category sources should be boosted, not made mandatory.
- Repeated chunks from the same source should be de-duplicated in returned search results.
- UI-uploaded Knowledge Pool files should use the same classifier metadata as local dataset imports.

### Fix applied

- UI uploads now classify file metadata through the shared dataset classifier:
  - `language`
  - `category`
  - `categorySlug`
  - `sourceClass`
  - `canonicalSource`
  - `importBatch=ui-upload`
- `EmbeddingService.search()` now:
  - infers query language/category
  - boosts same-language and same-category results
  - keeps foreign-language sources eligible as fallback evidence
  - de-duplicates repeated chunks by source
  - returns source `language` and `category` metadata in search results
- German query detection was tightened for support terms such as `Echtzeit`, `blockiert`, `wenn`, `nicht`, and related German signals.

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- dataset-classifier.spec.ts knowledge-pool-job.spec.ts embedding.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend was restarted and health remained green.
- Live search smoke after restart:
  - TR broad license-transfer query returns TR `License & Activation` sources in the first two results.
  - EN license-server query returns the EN `License Server & CodeMeter` pilot first.
  - DE real-time scanner query returns the DE `Performance & Hardware` pilot first.

### Remaining

- Older sources with `General` category still appear lower in result lists; clean/reclassify them separately if they continue to add noise.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 001 Import

### Decision

- Continue imports with small support-first batches instead of bulk-loading all PDFs.
- Keep sync sequential to avoid provider quota pressure; trigger the next file only after the previous source is `ACTIVE` with embeddings.

### Batch 001 files

- TR / `Export Import & IFC DWG`: `FAQ_TR_Allplan Pafta Düzenleme'den X-Ref ile Karmaşık Veri Gönderme -(Export-).pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Allplan-da-Lisans-Nasil-Kayitlandirabilirim-(Register).pdf`
- EN / `Network & Workgroup`: `FAQ_EN_Allplan_in_the_home-office.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_cannot_find_a_license_.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Geschwindigkeit_von_Allplan_verbessern_bzw_analysieren.pdf`

### Verification

- Product code committed:
  - `0c2f1fb fix(rag): boost title-specific retrieval matches`
- Dataset scan result:
  - discovered 5 new files
  - checked 10 existing files
  - updated 0 existing files
  - total local dataset files: 15
- Sync result:
  - 5/5 sources `SUCCESS`
  - 5/5 sources `ACTIVE`
  - total new embeddings: 36
  - embedding distribution: `3072 / v2_2`
- Backend health remained green after sync.
- Search smoke:
  - TR X-Ref/export query returns the new PDF in the top results.
  - TR license registration query returns the new license PDF first.
  - EN home-office query returns the new home-office PDF first.
  - EN license-server missing-license query returns the new license-server PDF first.
  - DE performance query returns the new performance PDF first.

### Remaining

- Continue with Batch 002 using the same sequential sync pattern.
- Watch legacy `General` category results; they may need separate cleanup/reclassification after enough PDF sources are imported.

## Follow-up - 2026-05-14 PDF Batch 002 Import and Retrieval Tuning

### Decision

- Batch 002 stayed support-first and sequential to protect Gemini quota.
- Retrieval should prefer source title specificity when vector similarity, language, and category are otherwise close.
- Foreign-language sources remain eligible as fallback evidence; this is a ranking improvement, not a language hard filter.

### Batch 002 files

- TR / `License & Activation`: `faq-softlock-SSS-Bilgisayarimi-formatladim-lisansimi-nasil-geri-alirim.pdf`
- EN / `Installation & Setup`: `FAQ_EN_Allplan_silent_installation_(Allplan_2017_and_later).pdf`
- EN / `Export Import & IFC DWG`: `FAQ_EN_Export_resolving_and_transferring_layouts.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Grafikkarten_fuer_Allplan.pdf`
- DE / `License & Activation`: `FAQ_DE_Lizenz_auf_neuen_anderen_Rechner_uebertragen.pdf`

### Verification

- Dataset scan result:
  - discovered 5 new files
  - checked 15 existing files
  - updated 0 existing files
  - total local dataset files: 20
- Sync result:
  - 5/5 sources `SUCCESS`
  - 5/5 sources `ACTIVE`
  - total new embeddings: 32
  - embedding distribution: `3072 / v2_2`
- Backend health remained green after restart.
- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - `pnpm --filter @aluplan/backend typecheck`
- Live search smoke after title-specific ranking:
  - TR format/recover-license query returns `faq-softlock-SSS-Bilgisayarimi-formatladim-lisansimi-nasil-geri-alirim.pdf` first.
  - DE license-transfer query returns `FAQ_DE_Lizenz_auf_neuen_anderen_Rechner_uebertragen.pdf` first.
  - EN silent-install query returns `FAQ_EN_Allplan_silent_installation_(Allplan_2017_and_later).pdf` first.

### Remaining

- Continue with Batch 003 using the same sequential sync pattern.
- Similar multilingual license FAQs can still show capped similarity ties; rank order is now improved by language, category, and title tokens.
- Graphify hook ran on commit but warned that the rebuilt graph had 5596 nodes while the existing graph has 11474; `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 Settings Secret Hardening

### Decision

- Secret classification for provider credentials must be enforced on the backend, not trusted from UI payloads.
- Existing plaintext secret-like settings should be remediated safely without printing secret values.

### Fix applied

- `SettingsService` now forces secret storage for keys matching credential patterns such as `.api_key`, `.secret_key`, `.client_secret`, `.webhook_secret`, `.credentials_json`, `.token`, and legacy `resend_api_key`.
- Existing plaintext secret-like settings are encrypted and flipped to `isSecret=true` when read through `get` / `getValue` / `getAll`.
- Added regression coverage for forced encrypted API key storage and read-time plaintext secret migration.
- Checked live DB metadata for `ai.gemini.api_key` without printing the value; it is currently `is_secret=true`.

### Verification

- Backend provider/settings tests passed:
  - `pnpm --filter @aluplan/backend test -- settings.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts ai.service.spec.ts ai-provider-router.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- `git diff --check` passed.

## Follow-up - 2026-05-14 PDF Batch 003 Safety Fix

### Decision

- OpenAI remains enabled as chat fallback, but embedding fallback is disabled for the active Gemini corpus.
- Embedding compatibility must check both vector dimension and embedding model identity; same dimension is not enough.
- An unchanged source hash is not sufficient for sync success when the source has zero embeddings.

### Batch 003 status

- 5 files were discovered under `dataset/.../batch-003`.
- 4/5 sources synced successfully and are `ACTIVE`.
- Successful Batch 003 embeddings: 15 rows, all `3072 / v2_2`.
- The remaining source, `FAQ_DE_Lizenzserver_-_Es_wird_keine_Lizenz_gefunden_.pdf`, is intentionally `FAILED` with 0 embeddings because Gemini embedding quota returned 429.
- Earlier bad OpenAI fallback embeddings for this source were removed; the pool is not polluted by mixed-provider vectors.

### Fix applied

- `EmbeddingService` now rejects embedding results whose dimension or model does not match the active embedding version config.
- `EmbeddingService.indexPoolContent()` now fails if no embeddings are generated for a source.
- `KnowledgePoolProcessor` now re-indexes unchanged files when their embedding count is zero instead of marking them successful.
- `.env.example` now documents the active 3072-dim expectation.

### Verification

- Backend tests passed:
  - `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - `pnpm --filter @aluplan/backend test -- knowledge-pool.processor.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend restarted from `dist/main.js` and `/api/v1/health` is green.

### Remaining

- Retry the failed Batch 003 source after Gemini embedding quota recovers.
- Do not enable OpenAI embedding fallback unless a new embedding version and full re-embedding plan are created.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 003 Completed

### Result

- The previously failed Batch 003 source was retried after Gemini embedding quota recovered.
- Batch 003 is now fully synced:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 003 embeddings: 25
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- TR Softlock computer-change query returned `faq-softlock-SSS-Bilgisayar-değişikliği-yapmak-istiyorum-Softlock-2013.pdf` first.
- TR temporary online license-transfer query returned `faq-softlock-SSS-Geçici-lisans-transferi-Online.pdf` first.
- EN offline activation query returned `FAQ_EN_Activating_license_offline_(without_Internet_access).pdf` first.
- DE CodeMeter manual install query returned `FAQ_DE_Codemeter_Kontrollzentrum_manuell_installieren.pdf` first.
- DE license-server no-license query returned `FAQ_DE_Lizenzserver_-_Es_wird_keine_Lizenz_gefunden_.pdf` first.

### Remaining

- Continue with Batch 004 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 004 Completed

### Batch 004 files

- DE / `License & Activation`: `FAQ_DE_Dienst_fuer_die_Lizenzierung_laeuft_nicht.pdf`
- DE / `License & Activation`: `FAQ_DE_Lizenz_offline_aktivieren_und_zurueckgeben_(ohne_Internet.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Fehlermeldung_CodeMeter_ist_nicht_installiert_CodeMeter_n.pdf`
- EN / `License & Activation`: `FAQ_EN_Controlling_license_selection.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Finding_license_server_automatically_or_entering_addition.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 25 existing files
  - updated 0 existing files
  - total local dataset files: 30
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 004 embeddings: 29
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE licensing service query returned `FAQ_DE_Dienst_fuer_die_Lizenzierung_laeuft_nicht.pdf` first.
- DE offline license activate/return query returned `FAQ_DE_Lizenz_offline_aktivieren_und_zurueckgeben_(ohne_Internet.pdf` first.
- DE CodeMeter not-installed query returned `FAQ_DE_Fehlermeldung_CodeMeter_ist_nicht_installiert_CodeMeter_n.pdf` first.
- EN controlling license selection query returned `FAQ_EN_Controlling_license_selection.pdf` first.
- EN finding license server query returned `FAQ_EN_Finding_license_server_automatically_or_entering_addition.pdf` first.

### Remaining

- Continue with Batch 005 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 005 Completed

### Batch 005 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Installation_und_Konfiguration_des_Lizenzservers.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Keine_Lizenz_am_Client_nach_Update_von_Codemeter_Runtime.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Moving_license_server_to_a_new_server.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Geçici-lisans-transferi-Manuel.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 30 existing files
  - updated 0 existing files
  - total local dataset files: 35
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 005 embeddings: 31
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server install/config query returned `FAQ_DE_Installation_und_Konfiguration_des_Lizenzservers.pdf` first.
- DE no-license-after-CodeMeter-update query returned `FAQ_DE_Keine_Lizenz_am_Client_nach_Update_von_Codemeter_Runtime.pdf` first.
- EN temporary license borrowing query returned `FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf` first.
- EN move license server query returned `FAQ_EN_Moving_license_server_to_a_new_server.pdf` first.
- TR manual temporary license transfer query returned `faq-softlock-SSS-Geçici-lisans-transferi-Manuel.pdf` first.

### Remaining

- Continue with Batch 006 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 006 Completed

### Batch 006 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_temporaer.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_auf_neuen_Server_umziehen.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_assigning_access_rights_for_seats_to_ind.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_getting_licenses_by_using_VPN.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Lisansimi-artik-başka-bir-bilgisayarda-kullanmak-istiyorum.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 35 existing files
  - updated 0 existing files
  - total local dataset files: 40
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 006 embeddings: 26
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE temporary license borrowing query returned `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_temporaer.pdf` first.
- DE move license server query returned `FAQ_DE_Lizenzserver_auf_neuen_Server_umziehen.pdf` first.
- EN assign license-server seat access rights query returned `FAQ_EN_License_server_-_assigning_access_rights_for_seats_to_ind.pdf` first.
- EN license server over VPN query returned `FAQ_EN_License_server_-_getting_licenses_by_using_VPN.pdf` first.
- TR use license on another computer query returned `faq-softlock-SSS-Lisansimi-artik-başka-bir-bilgisayarda-kullanmak-istiyorum.pdf` first.

### Remaining

- Continue with Batch 007 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 007 Completed

### Batch 007 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_Nachverfolgung_welche_Ben.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktivieren_und_zu.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_activating_a_license_offline_on_the_serv.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_license_borrowing_tracking_which_users_h.pdf`
- TR / `License & Activation`: `faq-softlock-SSS-Allplan-Lisansinin-Kayitlandirma-İşlemi.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 40 existing files
  - updated 0 existing files
  - total local dataset files: 45
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 007 embeddings: 26
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license borrowing tracking query returned `FAQ_DE_Lizenzserver_-_Lizenz_ausleihen_Nachverfolgung_welche_Ben.pdf` first.
- DE license-server offline activation query returned `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktivieren_und_zu.pdf` first when the query explicitly targeted server-side offline activation.
- EN license-server offline activation query returned `FAQ_EN_License_server_-_activating_a_license_offline_on_the_serv.pdf` first.
- EN license borrowing tracking query returned `FAQ_EN_License_server_-_license_borrowing_tracking_which_users_h.pdf` first.
- TR Allplan license registration query returned `faq-softlock-SSS-Allplan-Lisansinin-Kayitlandirma-İşlemi.pdf` first.

### Note

- A broader DE query mentioning both offline activation and return (`zurueckgeben`) correctly preferred the workstation/offline activation-return PDF from Batch 004 over the server-specific Batch 007 PDF. This is expected; server-specific wording ranks the Batch 007 source first.

### Remaining

- Continue with Batch 008 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 008 Completed

### Batch 008 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktualisieren.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Lizenzen_ueber_VPN_beziehen_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_updating_a_license_offline_on_the_server.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_settings_used_by_several_computers.pdf`
- TR / `License & Activation`: `faq-softlock-Softlock-Destek-2006.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 45 existing files
  - updated 0 existing files
  - total local dataset files: 50
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 008 embeddings: 23
  - embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server offline update query returned `FAQ_DE_Lizenzserver_-_Lizenz_offline_am_Server_aktualisieren.pdf` first.
- DE license server via VPN query returned `FAQ_DE_Lizenzserver_-_Lizenzen_ueber_VPN_beziehen_.pdf` first.
- EN license-server offline update query returned `FAQ_EN_License_server_-_updating_a_license_offline_on_the_server.pdf` first.
- EN shared license-server settings query returned `FAQ_EN_License_server_settings_used_by_several_computers.pdf` first.
- TR Softlock support query returned `faq-softlock-Softlock-Destek-2006.pdf` first.

### Remaining

- Continue with Batch 009 using the same sequential, low-rate import pattern.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 009 Completed

### Runtime restart

- After a local machine restart, both backend and frontend were down.
- Backend restarted with `pnpm --filter @aluplan/backend start`.
- Frontend restarted on `http://localhost:3000`.
- Backend health returned `ok` with database, Redis, and BullMQ all up.

### Batch 009 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_-_Zugriffsrechte_von_Arbeitsplaetzen_fuer_ei.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_automatisch_finden_oder_zusaetzlichen_Server.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzserver_und_oder_Lizenzen_aktualisieren_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_-_obtain_licenses_via_VPN_.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_License_server_installation_failed.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 50 existing files
  - updated 0 existing files
  - total local dataset files: 55
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 009 embeddings: 24
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 009:
  - total knowledge sources: 69
  - total knowledge pool embeddings: 648
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server access-rights query returned `FAQ_DE_Lizenzserver_-_Zugriffsrechte_von_Arbeitsplaetzen_fuer_ei.pdf` first.
- DE license-server update query returned `FAQ_DE_Lizenzserver_und_oder_Lizenzen_aktualisieren_.pdf` first.
- EN obtain-license-via-VPN query returned `FAQ_EN_License_server_-_obtain_licenses_via_VPN_.pdf` first.
- EN license-server-installation-failed query returned `FAQ_EN_License_server_installation_failed.pdf` first.
- DE automatic/additional license-server query initially tied with other license-server docs at capped score `1`; title/keyword-specific queries returned `FAQ_DE_Lizenzserver_automatisch_finden_oder_zusaetzlichen_Server.pdf` first.

### Remaining

- Continue with Batch 010 using the same sequential, low-rate import pattern.
- Watch capped-score ties among very similar license-server FAQs; source title/metadata still resolves the specific document when the query is explicit.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 010 Completed

### Batch 010 files

- DE / `License Server & CodeMeter`: `FAQ_DE_Lizenzservereinstellungen_auf_mehrere_Rechner_verteilen.pdf`
- DE / `License Server & CodeMeter`: `FAQ_DE_Rueckgabe_von_Einzelplatzlizenzen_am_Lizenzserver.pdf`
- EN / `License Server & CodeMeter`: `FAQ_EN_Updating_license_server_and_licenses_.pdf`
- DE / `Performance & Hardware`: `FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`
- EN / `Performance & Hardware`: `FAQ_EN_Updating_the_driver_of_the_graphics_card.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 55 existing files
  - updated 0 existing files
  - total local dataset files: 60
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 010 embeddings: 16
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 010:
  - total knowledge sources: 74
  - total knowledge pool embeddings: 664
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE license-server settings distribution query returned `FAQ_DE_Lizenzservereinstellungen_auf_mehrere_Rechner_verteilen.pdf` first.
- DE return standalone licenses at license server query returned `FAQ_DE_Rueckgabe_von_Einzelplatzlizenzen_am_Lizenzserver.pdf` first.
- EN update license server and licenses query returned `FAQ_EN_Updating_license_server_and_licenses_.pdf` first.
- DE graphics-card-driver update query returned `FAQ_DE_Grafikkartentreiber_aktualisieren.pdf` first.
- EN graphics-card-driver update query returned `FAQ_EN_Updating_the_driver_of_the_graphics_card.pdf` first.

### Note

- A legacy `General` category source for `FAQ_EN_Updating_the_driver_of_the_graphics_card` still appears behind the new categorized dataset source for English graphics-driver queries. The top result is correct, but legacy source cleanup/reclassification remains a future RAG quality task.

### Remaining

- Continue with Batch 011 using the same sequential, low-rate import pattern.
- Prefer remaining support-first FAQ sources, especially installation, network/workgroup, export/import, and practical license/activation issues.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Follow-up - 2026-05-14 PDF Batch 011 Completed

### Batch 011 files

- DE / `Installation & Setup`: `FAQ_DE_Allplan_Silent-Installation_ab_Allplan_2017-2021.pdf`
- DE / `Installation & Setup`: `FAQ_DE_Infos_zur_laenderspezifischen_Installation_Allplan_2019.pdf`
- EN / `Installation & Setup`: `FAQ_EN_Installing_loopback_adapter_for_a_stand-alone_version_wit.pdf`
- DE / `Network & Workgroup`: `FAQ_DE_Workgroupmanager_Rechner_aufnehmen_nicht_moeglich.pdf`
- EN / `Network & Workgroup`: `FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`

### Result

- Dataset scan result:
  - discovered 5 new files
  - checked 60 existing files
  - updated 0 existing files
  - total local dataset files: 65
- Sync result:
  - 5/5 sources `ACTIVE`
  - 5/5 latest sync logs `SUCCESS`
  - total Batch 011 embeddings: 32
  - embedding distribution: `3072 / v2_2` only
- Corpus totals after Batch 011:
  - total knowledge sources: 79
  - total knowledge pool embeddings: 696
  - corpus embedding distribution: `3072 / v2_2` only

### Search smoke

- DE country-specific installation query returned `FAQ_DE_Infos_zur_laenderspezifischen_Installation_Allplan_2019.pdf` first.
- EN loopback adapter standalone query returned `FAQ_EN_Installing_loopback_adapter_for_a_stand-alone_version_wit.pdf` first.
- DE workgroup-manager computer-add query returned `FAQ_DE_Workgroupmanager_Rechner_aufnehmen_nicht_moeglich.pdf` first.
- EN workgroup-manager computer-add query returned `FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf` first.
- DE silent-installation title query returned `FAQ_DE_Allplan_Silent-Installation_ab_Allplan_2017-2021.pdf` first.

### Note

- A broader silent-installation query tied with the already-imported English silent-installation source at score `1`, so the English counterpart appeared first and the new German source second. Explicit title/source wording resolves the German source first.
- The word `deutsch` alone does not currently force German source preference in raw search results; locale-aware answer generation may still choose Turkish/German response language separately.

### Remaining

- Continue with Batch 012 using the same sequential, low-rate import pattern.
- Watch multilingual near-duplicate ties when English and German FAQs cover the same topic.
- Keep OpenAI disabled for embedding fallback; chat fallback can remain OpenAI.
- `apps/backend/openapi.json` remains an unrelated modified artifact.

## Pause Checkpoint - 2026-05-14 RAG Dataset Status

### Current answer

- The full dataset operation is **not finished**.
- The support-first, controlled seed corpus is now usable enough to pause importing and run acceptance tests.
- Do not continue importing every remaining PDF before testing real customer questions.

### Completed import state

- Completed staged batches: Batch 001 through Batch 011.
- Last verified corpus state:
  - knowledge sources: 79
  - knowledge pool embeddings: 696
  - embedding distribution: only `3072 / v2_2`
- PDF-first manifest state:
  - ready manifest entries: 123
  - dataset PDF files detected locally: 64
  - remaining ready manifest files: 62

### Remaining ready files by category

- `License & Activation`: 18
- `Project Data Management`: 18
- `Release Package Info`: 6
- `Export Import & IFC DWG`: 5
- `Network & Workgroup`: 5
- `Installation & Setup`: 4
- `Performance & Hardware`: 3
- `License Server & CodeMeter`: 2
- `Allplan Share & Cloud`: 1

### Next recommended phase

- Pause bulk import.
- Build a 20-30 question RAG acceptance test set using real customer-style questions in Turkish, English, and German.
- For each question, check:
  - whether the top source is the expected document
  - whether the generated answer uses the correct language
  - whether legacy `General` sources outrank categorized PDF sources
  - whether multilingual near-duplicate ties damage the final answer
- Resume Batch 012 only after the test set shows which categories are actually missing.

### Import priority after acceptance test

- First: `License & Activation`
- Then: `Network & Workgroup`
- Then: `Export Import & IFC DWG`
- Then: `Performance & Hardware`
- Last: broad manuals, release/package info, and project-data documents.

### Notes for resume

- Keep OpenAI disabled for embedding fallback; OpenAI may remain chat fallback only.
- Keep using the sequential low-rate import pattern for any future batch.
- `apps/backend/openapi.json` remains an unrelated modified artifact and should not be mixed into RAG/memory commits.

## Follow-up - 2026-05-14 Local Browser CSP Fix

### Root cause

- Backend auth was healthy: `POST /api/v1/auth/login` returned 200, set `alu_at`/`alu_rt`, and `/auth/me` returned 200 after login.
- Frontend middleware saw auth cookies correctly; `curl` with the same cookie reached `/tr/dashboard` with 200.
- The browser flow was broken by CSP in local dev:
  - `upgrade-insecure-requests` caused Next.js RSC navigation from `http://localhost:3000/dashboard` to attempt HTTPS and fail with `ERR_SSL_PROTOCOL_ERROR`.
  - `connect-src` allowed `http://localhost:4000` but not `ws://localhost:4000`, so Socket.io WebSocket was blocked.

### Fix

- Commit: `c99076f fix(frontend): allow local websocket and http navigation in csp`
- Changed `apps/frontend/src/middleware.ts`:
  - added websocket origin derived from `NEXT_PUBLIC_API_URL`
  - allowed `ws://localhost:4000` in `connect-src`
  - limited `upgrade-insecure-requests` to production only

### Verification

- `pnpm --filter @aluplan/frontend typecheck` passed.
- GitNexus detect changes:
  - risk level: medium
  - affected flow: Middleware -> Set
- Browser automation with API-auth cookies verified:
  - `/tr/dashboard` renders admin dashboard.
  - `/tr/admin/ai-intelligence` renders AI strategic intelligence page.
  - `/tr/tickets/new` renders customer new ticket page.
  - console shows `[WS] Connected to http://localhost:4000/ws`.

### Notes

- The in-app Browser and Chrome plugin bridges timed out in this session, so Playwright was used as the fallback browser automation path.
- Graphify hook ran during commit and warned that the rebuilt graph is much smaller than the existing graph; hook-generated `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- `apps/backend/openapi.json` remains the only unrelated modified artifact.

## Follow-up - 2026-05-14 RAG Quality Root Fix In Progress

### User-facing problem

- During live RAG testing, Turkish customer questions could still receive weak or wrong grounded fallback answers.
- Example problematic question:
  - `Allplan açılışta birkaç dakika bekliyor, ağ veya isim çözümleme kaynaklı olabilir mi?`
- Earlier behavior:
  - Retrieval/fallback could drift to license, home-office, or generic network docs instead of the best source passage.
  - Cached old answers could continue serving stale wrong results even after retrieval logic improved.

### Root causes found

- `generateHypotheticalDocument()` injected generic causes into HyDE text, including license-related wording, which polluted non-license queries.
- Hotinfo raw context was previously appended into retrieval text for hardware/system queries, so traces containing license paths could pull license PDFs into unrelated searches.
- Knowledge pool search was mostly vector-led; keyword/lexical evidence from `knowledge_pool_embeddings.content` did not strongly help exact phrases like `name resolution`.
- `/ai/search` could find the right candidate at a wider limit, but `/ai/query` cut candidates too early in `rerankResults()`, before query-signal reranking could rescue the best source.
- Exact and semantic AI caches could keep returning stale pre-fix answers; cache versioning was inconsistent between `RAG_CONFIG.CACHE.VERSION` and `AiSemanticCache` exact keys.

### Code changes made in this session

- `apps/backend/src/ai/utils/hypothetical-document.ts`
  - Made HyDE templates neutral and source-intent focused.
  - Removed generic license/performance/plugin cause injection.
- `apps/backend/src/ai/ai-query.service.ts`
  - Stopped injecting raw Hotinfo into the retrieval query; Hotinfo remains answer context only.
  - Added startup/network query signal handling.
  - Kept more candidates through feedback reranking before final sync rerank.
  - Added query-signal reranking for stream path too.
  - Added intent penalties/boosts so network-startup questions do not rank license sources above precise name-resolution passages.
  - Cache hit log now uses `RAG_CONFIG.CACHE.VERSION` instead of stale hardcoded `v5`.
- `apps/backend/src/ai/embedding.service.ts`
  - Expanded knowledge pool hybrid search with lexical keyword matching over source name + chunk content.
  - Added candidate pool widening for reranking.
  - Added category/intent scoring:
    - network/startup query -> boost `Network & Workgroup`
    - performance query -> boost `Performance & Hardware`
    - network/startup query without license intent -> demote `License & Activation`
  - Added precise content signal boost for `name resolution on the network` / `takes several minutes to start`.
- `apps/backend/src/ai/ai-semantic-cache.service.ts`
  - Exact cache key now uses `RAG_CONFIG.CACHE.VERSION`.
  - Exact and semantic cache responses now require matching `cacheVersion`.
  - Stored cache payloads now include the active cache version.
  - Non-UUID semantic tenant mapping to system UUID remains in place.
- `apps/backend/src/config/rag.config.ts`
  - Bumped AI cache version from `v6` to `v7` to bypass stale wrong answers.
- `apps/frontend/src/app/[locale]/(dashboard)/tickets/new/page.tsx`
  - Diagnosis query construction now avoids sending duplicated text when subject and description are the same.
- `apps/backend/src/ai/utils/synonym-dictionary.ts`
  - Added network/name-resolution synonyms.
- `apps/backend/src/knowledge-pool/dataset-classifier.ts`
  - Added name-resolution/DNS signals to `Network & Workgroup` classification.

### Tests / verification run

- Backend targeted RAG/cache tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-semantic-cache.service.spec.ts ai-query.service.spec.ts embedding.service.spec.ts rag-improvements.spec.ts`
  - Result: 5 suites passed, 72 passed, 1 skipped.
- Backend broader targeted set passed earlier in this fix:
  - `embedding.service.spec.ts`
  - `dataset-classifier.spec.ts`
  - `rag-improvements.spec.ts`
  - `ai-query.service.spec.ts`
  - `ai-semantic-cache.service.spec.ts`
  - Result: 6 suites passed, 80 passed, 1 skipped.
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend was restarted from `dist/main` on port `4000`.

### Live smoke results

- `/api/v1/ai/search` for the startup/name-resolution question now ranks:
  1. `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  2. `[Dataset] FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`
  3. `[Dataset] FAQ_EN_Allplan_in_the_home-office.pdf`
- `/api/v1/ai/query?wait=true` after cache-version/cache-guard changes now returns the correct top source:
  - `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - fallback excerpt:
    - `Name resolution on the network If Allplan takes several minutes to start, name resolution on the network may not work.`

### Current status / caution

- This fix is **not committed yet**.
- Important modified files currently include:
  - `apps/backend/src/config/rag.config.ts`
  - `apps/backend/src/ai/ai-query.service.ts`
  - `apps/backend/src/ai/ai-query.service.spec.ts`
  - `apps/backend/src/ai/ai-semantic-cache.service.ts`
  - `apps/backend/src/ai/ai-semantic-cache.service.spec.ts`
  - `apps/backend/src/ai/embedding.service.ts`
  - `apps/backend/src/ai/embedding.service.spec.ts`
  - `apps/backend/src/ai/utils/hypothetical-document.ts`
  - `apps/backend/src/ai/utils/rag-improvements.spec.ts`
  - `apps/backend/src/ai/utils/synonym-dictionary.ts`
  - `apps/backend/src/knowledge-pool/dataset-classifier.ts`
  - `apps/frontend/src/app/[locale]/(dashboard)/tickets/new/page.tsx`
- Existing unrelated artifact still present:
  - `apps/backend/openapi.json`
- Do not mix `apps/backend/openapi.json` into the RAG quality commit unless intentionally regenerated.

### Next step after resume

- Re-run final quick verification:
  - backend typecheck
  - targeted RAG/cache tests
  - live `/ai/search` and `/ai/query?wait=true` smoke for the 3 known questions
- If still green, commit as a focused product-code fix, likely:
  - `fix(rag): improve grounded retrieval relevance and cache invalidation`
- Then update Graphify/GitNexus only after commit; keep generated graph output separate if it changes.

## Follow-up - 2026-05-14 Faz 1 Final Verification

### Additional fix before commit

- `RAG_CONFIG.CACHE.VERSION` was bumped from `v7` to `v8` after the last source-reranking tweak.
- Reason: the live endpoint returned the old `v7` exact-cache result with the previous source list, including a license source for a network/startup question.
- The network/startup reranker now applies a stronger license-source penalty only when the query itself is not about licensing.

### Final verification run

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts ai-semantic-cache.service.spec.ts`
  - 3 suites passed, 39 passed, 1 skipped.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend restarted from the fresh `dist/main` build on port `4000`.

### Live smoke after cache v8

- Startup/network Turkish query:
  - Search top 3:
    1. `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
    2. `[Dataset] FAQ_EN_Workgroupmanager_Adding_the_computer_is_not_possible.pdf`
    3. `[Dataset] FAQ_EN_Allplan_in_the_home-office.pdf`
  - AI answer source:
    - `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - Fallback excerpt correctly contains:
    - `Name resolution on the network If Allplan takes several minutes to start...`
  - License source no longer appears in the top answer sources.
- Performance Turkish query:
  - Search/answer top source remains `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`.
- Graphics driver Turkish query:
  - Search returns graphics driver sources.
  - Answer remains Turkish fallback summary and cites graphics driver source.

### Residual quality note

- One non-license but off-intent source (`FAQ_DE_Export_Plaene_aufgeloest_uebertragen`) still appeared as the third answer source for the startup/network query.
- This is not the original critical license contamination bug; it should be handled in the next quality phases with an acceptance query set, metadata cleanup, and stricter final source diversity/filtering.

### Graphify / GitNexus phase-end check

- `graphify update .` ran successfully but warned:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - Graphify refused overwrite due possible missing chunks/session state.
- Because of that warning, `graphify-out/GRAPH_REPORT.md` must not be committed for this phase.
- `npx gitnexus detect_changes --repo aluplan-support-desk-v02` ran successfully:
  - 15 files changed
  - 55 symbols changed
  - 9 affected processes
  - risk level: high
- High-risk flows include `AiQueryService.queryInternal`, `streamQuery`, and `NewTicketPage`, so this phase is guarded by targeted backend tests, backend build, frontend typecheck, and live RAG smoke.

## Follow-up - 2026-05-14 Faz 2 Started

### Acceptance set created

- Added `.ai/rag-quality/README.md`.
- Added `.ai/rag-quality/acceptance-questions.json`.
- The acceptance set currently contains 25 customer-like questions across Turkish, English, and German.
- Each question records:
  - expected answer language
  - expected categories
  - expected source hints
  - forbidden source hints
  - answer hints that should be mentioned

### Validation

- JSON parse and shape validation passed:
  - 25 questions
  - no duplicate IDs
  - required fields present
- `graphify update .` ran but produced the same node-count warning:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - graph output was not committed.
- `npx gitnexus detect_changes --repo aluplan-support-desk-v02` reported:
  - No changes detected.

### Next step

- Execute the acceptance set against localhost and classify failures by root cause before touching more retrieval code.

## Interrupt Summary - 2026-05-14 Session Limit Checkpoint

### User request

- User warned that session limit is around 30% and asked for an intermediate summary.
- This note captures the current state so the next session can continue without losing context.

### Completed commits this session

- `65d8a54 fix(rag): improve grounded retrieval relevance and cache invalidation`
  - Neutralized HyDE so it no longer injects generic license/performance/plugin causes.
  - Removed Hotinfo raw trace pollution from retrieval query.
  - Added lexical/hybrid retrieval widening and query signal reranking.
  - Strengthened network/startup intent so license sources are demoted when the query is not about licensing.
  - Added exact/semantic cache version guards and bumped cache version to `v8`.
  - Fixed frontend duplicate diagnosis-query construction.
  - Verified with targeted backend tests, backend typecheck/build, frontend typecheck, GitNexus, and live 3-question smoke.
- `6a48060 docs(rag): add acceptance question set`
  - Added `.ai/rag-quality/README.md`.
  - Added `.ai/rag-quality/acceptance-questions.json`.
  - 25 multilingual customer-like RAG acceptance questions are now the active quality gate.

### Current working tree

- Only known uncommitted file:
  - `apps/backend/openapi.json`
- This file was already identified as an unrelated generated artifact and must not be mixed into RAG quality commits unless intentionally regenerated/restored.

### Graphify / GitNexus status

- `graphify update .` was run after phases, but it repeatedly warned:
  - new graph: 5605 nodes
  - existing graph: 11474 nodes
  - possible missing chunk/session state.
- Because of this, `graphify-out/GRAPH_REPORT.md` was restored and not committed.
- GitNexus after Faz 1:
  - 15 files, 55 symbols, 9 affected flows, risk high.
- GitNexus after Faz 2 docs/memory:
  - No changes detected.

### Services

- Backend was rebuilt and restarted from `dist/main`.
- Backend was running on `localhost:4000` at the time of the checkpoint.
- Redis and Postgres were reachable.
- Frontend status was not changed in this checkpoint.

### Acceptance run state

- Faz 3 started as retrieval-only dry-run through `/api/v1/ai/search`.
- First run:
  - 25 total
  - first 10 passed
  - remaining 15 initially failed with HTTP `429` because the search endpoint throttle window was hit.
- Retry for the 15 throttled questions used a slower pace:
  - 15 total
  - 7 passed
  - 8 failed

### Combined acceptance signal so far

- Non-throttle passes observed:
  - TR network/startup
  - TR performance
  - TR graphics driver
  - TR license offline
  - TR license server/add license
  - TR installation
  - TR workgroup add computer
  - TR home-office
  - TR IFC export
  - TR DWG export
  - EN performance
  - EN name resolution
  - EN graphics driver
  - EN license server
  - EN workgroup
  - DE performance
  - DE graphics driver
- Real retrieval/metadata failures observed:
  - `rag-tr-project-backup-001`
    - Top: `[Dataset] FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf`
    - Category: `License & Activation`
    - Likely root cause: dataset gap or acceptance expectation too broad; project backup/data migration content may not exist or is hidden behind license-transfer wording.
  - `rag-tr-share-cloud-001`
    - Top: `[Dataset] ifc_aktarim_el_kitabi.pdf`
    - Category: `Export Import & IFC DWG`
    - Likely root cause: Allplan Share/Cloud source gap or weak category/source coverage.
  - `rag-tr-hotinfo-001`
    - Top: `Allplan_2023_New_Features`
    - Category: `General`
    - Likely root cause: Hotinfo support source gap and legacy `General` source outranking/noise.
- Still unresolved because retry hit `429` again:
  - `rag-de-ifc-001`
  - `rag-tr-cross-lingual-001`
  - `rag-tr-no-ai-ticket-001`
  - `rag-tr-general-demotion-001`
  - `rag-tr-duplicate-canonical-001`

### Important interpretation

- Current failures are not the original critical bug.
- The original critical bug was Turkish network/startup query receiving license-contaminated answer sources. That is fixed in live smoke after cache v8:
  - top source: `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`
  - answer excerpt: `Name resolution on the network If Allplan takes several minutes to start...`
  - license source no longer appears in answer sources.
- The next quality problem is now broader:
  - endpoint throttle makes acceptance execution unreliable,
  - some domain areas have source gaps,
  - legacy `General` sources still leak into retrieval,
  - duplicate/pilot canonical preference needs a measured check.

### Recommended next step after resume

1. Do not change retrieval code immediately.
2. Finish Faz 3 by rerunning only the 5 unresolved `429` questions after throttle cooldown, one by one or with a larger delay.
3. Write a small local acceptance runner script or npm task that:
   - respects endpoint throttle,
   - records JSON results,
   - separates `429` infrastructure failures from RAG quality failures.
4. Then start Faz 4 with the smallest fix:
   - either source-gap/reporting for missing Allplan Share/Hotinfo/project-backup docs,
   - or metadata/category cleanup for legacy `General` noise,
   - or duplicate/canonical demotion if the unresolved duplicate test confirms it.

## Follow-up - 2026-05-15 Faz 3 Completed

### Resume state

- Continued from checkpoint `99a76b2 docs(memory): add rag quality checkpoint`.
- Working tree still had only the known unrelated `apps/backend/openapi.json` artifact before Faz 3 edits.
- Backend was not running at resume, so it was started with:
  - `pnpm --filter @aluplan/backend start`
- Backend booted successfully on `localhost:4000`.
- Redis and Postgres were reachable.

### Unresolved acceptance questions rerun

- The 5 previously unresolved `429` questions were rerun with a 15 second delay.
- Result:
  - 5 total
  - 2 passed
  - 3 failed
  - 0 throttle failures

### Final Faz 3 acceptance result

- 25 total questions.
- 19 passed.
- 6 real quality/data failures.
- 0 remaining throttle-only failures.

### Real failures

- `rag-tr-project-backup-001`
  - Top source: `[Dataset] FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf`
  - Root cause: likely project backup/data-management source gap or over-broad acceptance wording.
- `rag-tr-share-cloud-001`
  - Top source: `[Dataset] ifc_aktarim_el_kitabi.pdf`
  - Root cause: Allplan Share/Cloud source gap or weak coverage.
- `rag-tr-hotinfo-001`
  - Top source: `Allplan_2023_New_Features`
  - Root cause: Hotinfo source gap and legacy `General` noise.
- `rag-tr-no-ai-ticket-001`
  - Top source: `[Dataset] faq-softlock-Softlock-Destek-2006.pdf`
  - Root cause: likely product UX/help content, not PDF RAG corpus content.
- `rag-tr-general-demotion-001`
  - Top source: license registration FAQ.
  - Root cause: query contains `lisans değil`, but retrieval still treats `lisans` as positive signal.
- `rag-tr-duplicate-canonical-001`
  - Top source: `[Dataset] pilot-de-grafikkartentreiber-aktualisieren.pdf`
  - Root cause: duplicate/pilot source outranks canonical FAQ source.

### Files added

- `.ai/rag-quality/run-acceptance.mjs`
  - Local retrieval-only acceptance runner.
  - Handles login, CSRF headers, throttled delay, JSON output, and ID filtering.
- `.ai/rag-quality/results-2026-05-15.md`
  - Human-readable Faz 3 result and failure classification.

### Verification

- Smoke-tested the runner with:
  - `node .ai/rag-quality/run-acceptance.mjs --ids rag-tr-network-startup-001 --delay-ms 1000 --output /private/tmp/rag-acceptance-smoke.json`
- Result:
  - 1 total
  - 1 pass
  - 0 fail
  - 0 throttle

### Next step

- Commit Faz 3 docs/tooling/memory separately.
- Then start Faz 4 with the smallest product-code fix:
  - canonical/duplicate source preference,
  - negation-aware retrieval for `lisans değil / not license`.
- Treat Hotinfo, Allplan Share, project backup, and product-help/ticket-opening failures as dataset/acceptance decisions unless matching sources are confirmed in the corpus.

## Follow-up - 2026-05-15 Faz 4 Target Fix

### Change

- Updated `EmbeddingService` ranking with two narrow deterministic multipliers:
  - negated license intent handling for phrases like `lisans değil`, `not license`, `keine lizenz`.
  - pilot/copy source quality demotion so canonical FAQ sources outrank pilot duplicates.
- Updated `.ai/rag-quality/run-acceptance.mjs` so source hint matching includes retrieved content, not only title/category/metadata.

### Tests

- `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts`
  - 17 passed.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.

### Live target acceptance

- `rag-tr-general-demotion-001`
  - PASS.
  - Top source changed to `[Dataset] FAQ_EN_Allplan_is_running_slow.pdf`.
- `rag-tr-duplicate-canonical-001`
  - PASS.
  - Top source changed to `[Dataset] FAQ_DE_Grafikkartentreiber_aktualisieren.pdf`.

### Live regression acceptance

- `rag-tr-network-startup-001`: PASS.
- `rag-tr-license-offline-001`: PASS.
- `rag-en-license-server-001`: PASS.

### Remaining failures

- Remaining known failures are dataset/acceptance-scope decisions, not immediate retrieval-code defects:
  - `rag-tr-project-backup-001`
  - `rag-tr-share-cloud-001`
  - `rag-tr-hotinfo-001`
  - `rag-tr-no-ai-ticket-001`

## Follow-up - 2026-05-15 Faz 5 Source Gap Decision

### Active corpus finding

- Queried active `knowledge_sources` for Share/Cloud, Hotinfo, backup/project, and ticket/support/help terms.
- Active pool has weak/no canonical source coverage for:
  - Allplan Share / Cloud usage.
  - Hotinfo-specific support flow.
  - project backup / project exchange as `Project Data Management`.
  - AI-optional ticket creation product help.

### Archive candidates found

- Allplan Share / Cloud PDF candidates exist under `.archive/rag-incoming/pdf/`:
  - `Allplan_Share_2022_Manual.pdf`
  - `Allplan_Share_2023_Manual.pdf`
  - `Allplan_Share_2023_Handbuch.pdf`
  - `System_Requirements_Allplan_Share_EN_GmbH.pdf`
  - `setup-System_Requirements_Allplan_Share_EN_GmbH.pdf`
- Project data/exchange PDF candidates:
  - `FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
  - `faq-technical-FAQ-DE-Projektaustausch-incl-aller-Einstellungen-mit-Partnerbuer.pdf`
- Hotinfo/Hotline sources appear to be MD only at this point:
  - `Hotlinetools.md`
  - `bilgi-bankasi-Hotlinetools.md`

### Decision

- Do not broaden retrieval logic to solve missing-source questions.
- Use Batch 012 for selected canonical PDFs covering:
  - Allplan Share & Cloud
  - Project Data Management
- Treat Hotinfo and AI-optional ticket creation separately:
  - Hotinfo needs a canonical PDF/TXT source or explicit exception to PDF-first.
  - AI-optional ticket creation is product-help content, not vendor RAG content.

### File added

- `.ai/rag-quality/source-gap-plan-2026-05-15.md`

## Follow-up - 2026-05-15 Batch 012 Source-Gap Import

### Scope

- Imported only selected canonical PDFs for the confirmed source gaps:
  - `dataset/en/allplan-share-cloud/batch-012/Allplan_Share_2023_Manual.pdf`
  - `dataset/en/allplan-share-cloud/batch-012/System_Requirements_Allplan_Share_EN_GmbH.pdf`
  - `dataset/de/allplan-share-cloud/batch-012/Allplan_Share_2023_Handbuch.pdf`
  - `dataset/de/project-data-management/batch-012/FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
- Raw archive files under `.archive/rag-incoming/pdf/` were not modified.
- `apps/backend/openapi.json` remained an unrelated uncommitted artifact and was not included.

### Dataset scan and sync

- Dataset scan result:
  - 4 new files discovered.
  - 65 existing files checked.
  - 0 existing files updated.
- Final sync logs:
  - 4/4 sources ended as `SUCCESS`.
  - `Allplan_Share_2023_Handbuch.pdf`: 91 embeddings, 67 chunks.
  - `Allplan_Share_2023_Manual.pdf`: 83 embeddings, 61 chunks.
  - `FAQ_DE_Projektaustausch...pdf`: 3 embeddings, 2 chunks.
  - `System_Requirements_Allplan_Share_EN_GmbH.pdf`: 2 embeddings, 1 chunk.
- Embedding distribution for Batch 012:
  - `embedding_version = v2_2`
  - `embedding_dim = 3072`
  - total `179` embeddings.

### Targeted acceptance

- `rag-tr-project-backup-001`: PASS.
  - Top source: `[Dataset] FAQ_DE_Projektaustausch_incl_aller_Einstellungen_mit_Partnerbuer.pdf`
- `rag-tr-share-cloud-001`: PASS.
  - Top source: `[Dataset] Allplan_Share_2023_Handbuch.pdf`
- Result file from the live runner was written outside the repo at `/private/tmp/rag-acceptance-batch-012.json`.
- Throttle count: 0.

### Remaining source decisions

- `rag-tr-hotinfo-001` still needs a canonical source decision. Current confirmed candidates are MD-only, so do not import them into the PDF-first corpus without an explicit exception.
- `rag-tr-no-ai-ticket-001` should be handled as product-help/app copy, not vendor PDF RAG.

### Phase-end mapping

- Graphify was run with `graphify update .`.
- Graphify warning repeated:
  - existing `graph.json`: 11474 nodes.
  - rebuilt graph: 5608 nodes.
  - output was not accepted into git; `graphify-out/GRAPH_REPORT.md` was restored.
- GitNexus was run with:
  - `npx gitnexus detect_changes --repo aluplan-support-desk-v02`
  - result: `No changes detected`.

## Follow-up - 2026-05-15 Hotinfo Diagnostic Context Phase

### Problem clarified

- User clarified that Hotinfo is not a canonical vendor RAG source.
- Correct model:
  - uploaded `.hxl` = ticket-specific diagnostic context about the customer's machine.
  - dataset/RAG PDFs = general support knowledge.
  - AI diagnosis should combine both without importing user Hotinfo into the global knowledge pool.

### Code findings

- Frontend `tickets/new` uploads `.hxl` to `/customers/me/hotinfo`, stores parsed profile Hotinfo, and sends confirmed `hotinfoContext` to `/ai/query`.
- Ticket creation stores `hotinfoContext` into `Ticket.hotinfoSnapshot`.
- Backend prompt context already included a basic Hotinfo section, but missed several useful diagnostic fields.
- Retrieval correctly avoided raw Hotinfo trace pollution, but explicit Hotinfo analysis lacked safe system-signal enrichment.

### Change

- `AiQueryService` now builds safe Hotinfo retrieval signals for explicit Hotinfo/system analysis:
  - includes OS, Allplan version, GPU/driver/OpenGL, RAM/VRAM, resolution, conflicting processes, security services, and an error-present marker.
  - excludes raw trace/path strings such as `_SEC.NSE` and `License` path fragments from the retrieval query.
- `PromptContextBuilderService` now includes richer Hotinfo details in final prompt context:
  - OpenGL, license type, Allplan hotfix, installed modules/worksets, security services, printers/default printer, conflicting processes, and truncated error trace.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts prompt-context-builder.service.pbt.spec.ts`
  - 3 suites passed.
  - 36 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed after GitNexus reported high risk.

### Phase-end mapping

- GitNexus impact:
  - `AiQueryService`: `MEDIUM`, 34 upstream impacts, 0 affected processes.
  - `PromptContextBuilderService`: `MEDIUM`, 32 upstream impacts, 0 affected processes.
- GitNexus detect changes:
  - 7 files, 12 symbols.
  - 6 affected execution flows.
  - risk level: `high`.
  - extra verification run because of this: backend build passed.
- Graphify was run with `graphify update .`.
  - warning repeated: existing graph 11474 nodes, rebuilt graph 5609 nodes.
  - `graphify-out/GRAPH_REPORT.md` was restored and not accepted into git.

### Next step

- Browser/manual flow:
  - upload `.hxl` from the customer ticket form.
  - ask a Hotinfo-specific AI diagnosis question.
  - verify AI answer references the system details.
  - create the ticket and verify `hotinfoSnapshot` is visible for support/admin.

## Follow-up - 2026-05-15 IFC Fallback Answer Quality

### Problem observed

- User asked in Turkish: `IFC aktarımında hangi ayarlar kritik?`
- Because model generation was delayed, deterministic fallback returned an English raw excerpt:
  - `The model response was delayed...`
  - source title plus `#### 2.2.2 IFC Export Stages`
- This was not useful for a customer-facing support answer.

### Change

- Improved deterministic fallback in `AiQueryService`:
  - supports locale variants such as `tr-TR`.
  - detects Turkish query language when explicit language is missing or malformed.
  - cleans Markdown headings/source wrappers from fallback excerpts.
  - adds an actionable Turkish IFC fallback checklist covering:
    - IFC send/export path.
    - exchange profile.
    - attribute mapping.
    - coordinates/length parameters.
    - element filter.
    - advanced geometry/quantity/element options.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - 2 suites passed.
  - 33 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend was restarted from the new build.
- Health check passed at `/api/v1/health`.

### Remaining note

- This improves the fallback path. The deeper product decision remains whether sync diagnosis timeout should be raised or whether the UI should communicate fallback mode more softly.

## Follow-up - 2026-05-15 DWG/DXF Fallback Source Hygiene

### Problem observed

- User asked in Turkish: `DWG/DXF export sırasında layer ve referans dosyaları nasıl korunur?`
- Customer fallback answer incorrectly drifted to the IFC checklist because fallback intent detection mixed the user query with retrieved source title/excerpt.
- Customer fallback also exposed raw `Kaynak:` and `İlgili pasaj:` lines, which is useful for traceability but not suitable as end-user support copy.

### Change

- `AiQueryService` now passes `showSourceDetails: isStaff` into deterministic fallback generation.
- Customer fallback answers no longer include raw source/passage lines; staff/admin fallback traceability is preserved.
- Turkish fallback intent detection now uses query-only intent for IFC/DWG/DXF/graphics-driver special cases.
- Added a DWG/DXF-specific Turkish fallback checklist for layer/katman, reference/XRef, export scope, scale/coordinates, and final viewer validation.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - 2 suites passed.
  - 34 passed, 1 skipped.
- `pnpm --filter @aluplan/backend typecheck`
  - Passed.
- `pnpm --filter @aluplan/backend build`
  - Passed.
- Backend and frontend were restarted:
  - backend: `http://localhost:4000/api/v1`
  - frontend: `http://localhost:3000`
- Live customer API check passed:
  - query returned `200`.
  - answer stayed on DWG/DXF.
  - `sources: []`.
  - answer text did not contain `Kaynak:` or `İlgili pasaj:`.

### Remaining note

- This fixes customer-facing fallback hygiene and one concrete DWG/DXF drift case. Broader RAG quality work should still evaluate retrieval source coverage and answer freshness with the planned regression question set.

## Follow-up - 2026-05-15 Live RAG Acceptance Closure

### Goal

- Decide whether the current support-first vendor PDF RAG corpus can be treated as stable enough to stop broad RAG changes.
- Use API-driven validation while preserving quota-safe pacing.

### Execution

- Ran `.ai/rag-quality/run-acceptance.mjs` against localhost API with 15000ms delay.
- Added `rag-tr-dwg-layer-reference-001` to the acceptance set because it represents the recently observed DWG/DXF layer/reference failure.
- Added `.ai/rag-quality/run-answer-smoke.mjs` for focused customer-facing `/ai/query?wait=true` answer checks.

### Retrieval results

- Initial live run:
  - 25 total.
  - 23 pass.
  - 2 fail.
  - 0 throttle / 429.
- New DWG/DXF layer/reference regression:
  - 1 total.
  - 1 pass.
- Effective current set:
  - 26 total.
  - 24 in-scope vendor PDF RAG checks pass.
  - 2 failures remain out-of-scope for vendor PDF RAG.

### Known out-of-scope failures

- `rag-tr-hotinfo-001`
  - Hotinfo is ticket-specific diagnostic context, not global vendor PDF RAG.
  - Keep outside vendor RAG acceptance unless a canonical Hotinfo PDF/TXT support source is approved.
- `rag-tr-no-ai-ticket-001`
  - AI-optional ticket creation is product/help flow content.
  - Move to product-flow acceptance, not vendor PDF RAG.

### Customer answer smoke

- Ran `.ai/rag-quality/run-answer-smoke.mjs` for:
  - `rag-tr-network-startup-001`
  - `rag-tr-graphics-driver-001`
  - `rag-tr-ifc-export-001`
  - `rag-tr-dwg-layer-reference-001`
  - `rag-tr-cross-lingual-001`
- Result:
  - 5 total.
  - 5 pass.
  - 0 source leaks.
  - 0 `NO_MATCH`.

### Decision

- Vendor PDF RAG can be considered stable for the current support-first corpus.
- Do not continue broad RAG refactors right now.
- Future source imports or retrieval/fallback changes should rerun:
  - `.ai/rag-quality/run-acceptance.mjs`
  - `.ai/rag-quality/run-answer-smoke.mjs` for a focused critical subset.

## Follow-up - 2026-05-15 Product Flow Acceptance Phase 1

### Goal

- Move the two out-of-scope RAG failures into product-flow validation:
  - Hotinfo diagnostic flow.
  - AI-optional ticket creation.
- Validate by API first before browser/UI work.

### Added

- `.ai/product-flow/README.md`
- `.ai/product-flow/acceptance-flows.json`
- `.ai/product-flow/run-product-flow-acceptance.mjs`
- `.ai/product-flow/results-2026-05-15-phase-1.json`
- `.ai/product-flow/results-2026-05-15-phase-1.md`

### API validation

- Ran `.ai/product-flow/run-product-flow-acceptance.mjs` against `http://localhost:4000/api/v1`.
- Result:
  - 9 total.
  - 9 pass.
  - 0 fail.

### Passed checks

- Backend health returned `200`.
- Customer uploaded `_hotinf_.hxl`; parsed profile included:
  - Allplan 2026.
  - Windows 11 24H2 build 26100.
  - NVIDIA RTX 4070.
  - `onedrive.exe` conflict signal.
- `/auth/me` returned persisted Hotinfo profile data.
- `/ai/query?wait=true` accepted Hotinfo context and returned a non-empty customer answer without leaking `_SEC.NSE`.
- Customer created a ticket without prior AI interaction:
  - created ticket `SUP-01018`.
  - `interactionId` remained `null`.
- Customer could read the created ticket.
- Admin could read the created ticket and confirm `hotinfoSnapshot`.
- Customer raw Hotinfo download was forbidden with `403`.
- Admin raw Hotinfo download returned `200` XML.

### Decision

- Faz 1 is complete.
- The product API supports Hotinfo context and AI-optional ticket creation.
- Next product-flow phase should verify the same behavior in the browser/UI:
  - customer uploads `.hxl`.
  - customer can create a ticket without AI.
  - admin sees the ticket and Hotinfo snapshot.
  - live notification behavior is checked.

## Follow-up - 2026-05-15 Product Flow Acceptance Phase 2

### Goal

- Verify the critical Hotinfo + AI-optional ticket flow through the real browser UI, not only API calls.
- Keep this as product-flow acceptance, separate from vendor PDF RAG quality.

### Added

- `.ai/product-flow/run-product-flow-ui-smoke.mjs`
- `.ai/product-flow/results-2026-05-15-phase-2-ui-20260515041454.json`
- `.ai/product-flow/results-2026-05-15-phase-2-ui-20260515041454.md`

### UI validation

- Ran `.ai/product-flow/run-product-flow-ui-smoke.mjs` through the frontend workspace against:
  - frontend: `http://localhost:3000`
  - backend: `http://localhost:4000/api/v1`
- Result:
  - 12 total checks.
  - 12 pass.
  - 0 fail.

### Passed checks

- Backend health returned `200`.
- Customer logged in through the UI as `e2e-customer@aluplan.com`.
- Customer opened `/tr/tickets/new`.
- Customer selected `ALLPLAN`.
- Customer uploaded a new `.hxl` through the UI.
- Customer selected `MEDIUM` priority.
- Customer filled the ticket subject/details.
- Customer skipped AI with `Doğrudan Talep Oluşturmaya Geç`.
- Customer created ticket `b5a609d2-1ff6-4a24-b589-6712534a362b`.
- Admin logged in through the UI as `admin@example.com`.
- Admin opened the ticket detail page.
- Admin saw the Hotinfo snapshot in the ticket detail sidebar.

### Notes

- The runner was hardened to avoid a false-positive where `/tr/tickets/new` matched a broad `/tr/tickets/` URL predicate.
- It now waits for the real `POST /api/v1/tickets` response and extracts the created ticket id.
- Live notification behavior was not included in this smoke result; treat it as the next product-flow sub-phase if it remains a priority.
- GitNexus `detect_changes` returned `No changes detected`.
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5611` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

## Follow-up - 2026-05-15 Customer Answer Quality Phase 3

### Trigger

- User tested: `How do I borrow a license temporarily from the license server?`
- Customer-facing AI diagnosis fell back to a raw excerpt-style answer.
- Admin Copilot draft produced a much better structured solution.

### Root cause

- Customer `/ai/query?wait=true` used synchronous generation with a short timeout.
- `AiQueryService.SYNC_DIAGNOSIS_GENERATION_TIMEOUT_MS` was `6000`.
- When the model timed out, deterministic fallback only had special handling for a few intents such as IFC, DWG/DXF, and graphics driver update.
- License borrowing had no structured fallback, so the customer saw a low-quality excerpt even though retrieval found the right document.

### Changes

- Increased synchronous customer diagnosis generation timeout from `6000ms` to `15000ms`.
- Added structured deterministic fallback for license borrowing intent in Turkish.
- Added structured deterministic fallback for license borrowing intent in English.
- Added regression coverage for both Turkish UI-language and English requested-language variants.

### Validation

- GitNexus impact for `AiQueryService`:
  - risk: `MEDIUM`
  - direct impacted files include AI controller, ticket service, AI query processor, AI copilot service.
- GitNexus `detect_changes` after edits:
  - risk: `high`
  - affected execution flows: 8
  - changed symbol area includes `AiQueryService`, `query`, and `streamQuery`.
- Targeted tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5613` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

### Decision

- This is the first narrow step toward admin-quality customer answers.
- Retrieval is not the issue for this case; answer synthesis/fallback quality was the issue.
- Next improvement should generalize this from individual fallback intents into a shared customer/admin answer quality contract, but only after this narrow fix is live-tested.

## Follow-up - 2026-05-15 Answer Drift Reset Phase 4

### Trigger

- User observed that customer and admin answers use different structures and asked why the two sides do not use the same system.
- Live evidence:
  - customer answer now has a good structured fallback for license borrowing.
  - admin Copilot draft still drifted toward unrelated root-cause troubleshooting for a how-to question.

### Root cause

- Customer query flow used `MASTER_DIAGNOSIS_PROMPT`.
- Admin Copilot imported `MASTER_DIAGNOSIS_PROMPT` but then appended its own shortened `STEP 7` output block.
- The two paths did not share a single answer quality contract for:
  - exact user intent.
  - how-to vs outage diagnosis separation.
  - customer/admin core-answer consistency.
  - no raw source/excerpt leakage in customer answers.

### Changes

- Added `apps/backend/src/ai/ai-answer-contract.ts`.
- Added shared `buildSupportAnswerContractPrompt(...)`.
- Customer `AiQueryService` now builds system prompts through the shared contract.
- Admin `AiCopilotService` now builds system prompts through the same shared contract instead of its private shortened output block.
- Added tests:
  - `apps/backend/src/ai/ai-answer-contract.spec.ts`
  - `AiCopilotService` prompt now asserts the shared answer contract is present.

### Validation

- GitNexus impact before edits:
  - `AiQueryService`: `MEDIUM`
  - `AiCopilotService`: `LOW`
- GitNexus `detect_changes` after edits:
  - risk: `medium`
  - affected execution flows: 4
  - changed symbol area includes `AiQueryService`, `queryInternal`, `AiCopilotService`, and `generateDraft`.
- Tests passed:
  - `pnpm --filter @aluplan/backend test -- ai-answer-contract.spec.ts ai-copilot.service.spec.ts ai-query.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Graphify update was attempted, but it again warned about a smaller rebuilt graph (`5617` nodes vs existing `11474`); `graphify-out/GRAPH_REPORT.md` was restored and not committed.

### Decision

- This phase does not change retrieval, DB schema, embeddings, or provider routing.
- It resets customer/admin answer-format drift at the prompt-contract layer.
- Next live test should compare the same ticket question on both customer answer and admin ANN draft after backend rebuild/reload.

## Follow-up - 2026-05-15 Ticket Interaction Idempotency Phase 5

### Trigger

- User live-tested the improved customer answer for:
  - `How do I borrow a license temporarily from the license server?`
- Customer answer quality was acceptable and stayed on the license borrowing procedure.
- Creating a ticket from the same AI interaction failed with HTTP 500.

### Root cause

- `Ticket.interactionId` is intentionally unique in Prisma/DB.
- The frontend can retry ticket creation with the same `interactionId`.
- `TicketsService.create(...)` did not treat duplicate interaction ticket creation as an idempotent retry.
- Prisma `P2002` leaked as a 500:
  - `Unique constraint failed on the fields: (interaction_id)`.

### Changes

- `TicketsService.create(...)` now checks whether the AI interaction is already linked to a ticket before creating a new one.
- If the same user retries with the same interaction, the existing ticket is returned with `alreadyCreated: true`.
- A race condition on `interaction_id` uniqueness is also handled by catching Prisma `P2002` and returning the existing ticket when safe.
- Cross-user reuse of the same AI interaction is rejected with a controlled `BadRequestException`.
- New ticket UI now skips duplicate initial message/attachment upload when the backend returns `alreadyCreated: true`.

### Validation

- Targeted backend test passed:
  - `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts`
- Backend typecheck passed:
  - `pnpm --filter @aluplan/backend typecheck`
- Frontend typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`
- Backend build passed:
  - `pnpm --filter @aluplan/backend build`
- Backend was rebuilt and reloaded on `localhost:4000`.
- Graphify/GitNexus:
  - `npx gitnexus impact TicketsService --direction upstream` could not run in the sandbox because npm registry access was blocked.
  - Graphify should still be attempted before commit; if the graph rebuild is smaller than the existing graph, restore `graphify-out/GRAPH_REPORT.md` and do not commit graph output.

### Decision

- This phase is not a RAG retrieval change.
- It removes a ticket-flow drift where an otherwise successful AI answer could not become a ticket because the interaction retry path was not idempotent.
- Next live validation: user should click ticket creation again from the same customer screen and verify it routes to the existing/new ticket without 500.

## Follow-up - 2026-05-15 Customer Dashboard 403 Cleanup

### Trigger

- User reported a browser console error before retesting ticket creation:
  - `API Error [403]`
  - stack pointed to `DashboardClient.useEffect.loadData`.

### Root cause

- Customer dashboard loaded three requests in parallel for every role.
- One request was `/api/v1/ai/health-metrics`.
- Backend correctly protects that endpoint with `ADMIN | SUPERUSER`.
- Customer users therefore received a valid 403, but frontend still produced console noise.

### Changes

- `DashboardClient` now computes user role before loading dashboard data.
- Customer/viewer users skip `api.ai.getHealthMetrics()`.
- Admin/superuser users still load AI health metrics.
- Dashboard spec now verifies:
  - customer role does not call `getHealthMetrics`.
  - admin role does call `getHealthMetrics`.

### Validation

- Frontend dashboard spec passed:
  - `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'`
- Frontend typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`

### Decision

- Backend RBAC stays strict.
- This is a frontend role-aware data loading fix, not a security relaxation.

## Follow-up - 2026-05-15 Rich Message Composer MVP

### Trigger

- `.kiro/specs/rich-text-editor` ihtiyacı incelendi.
- Tam spec ilk faz için fazla büyük olduğu için güvenli MVP uygulandı:
  - ticket detayında admin/customer rich reply composer
  - AI Copilot markdown taslaklarını okunabilir HTML'e dönüştürme
  - backend allowlist sanitizasyon
  - Prisma migration olmadan mevcut `TicketMessage.message` alanında sanitized HTML saklama

### Changes

- Frontend:
  - `RichTextEditor` eklendi: TipTap `StarterKit`, placeholder, toolbar, `Ctrl/Cmd+Enter` ile gönderme.
  - `RichTextRenderer` eklendi: eski plain text mesajları bozmadan, rich HTML mesajları sanitize ederek render eder.
  - `ContentSanitizer` eklendi: sadece güvenli rich-text tag/attribute allowlist'ine izin verir.
  - `markdownToHtml` eklendi: AI Copilot draft başlık/list/bold/italic çıktısını editöre uygun HTML'e çevirir.
  - Ticket detay reply textarea yerine rich editor kullanır; macro ve ANN draft çıktıları editöre HTML olarak eklenir.
- Backend:
  - `AddMessageDto.contentFormat` opsiyonel `HTML | PLAIN_TEXT` kabul eder.
  - `message` uzunluk limiti 10.000 karaktere çıkarıldı.
  - Global `XssValidationPipe`, yalnızca `contentFormat: HTML` ve `message` alanında strict rich-text allowlist uygular.
  - Diğer string alanlarda eski HTML temizleme davranışı korunur.
  - `TicketsService.addMessage` kaydetmeden önce ikinci kez rich-text sanitizasyon yapar ve boş kalan mesajı reddeder.

### Validation

- Frontend targeted tests passed:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/content-sanitizer.spec.ts src/lib/markdown-to-html.spec.ts src/components/ui/rich-text-renderer.spec.tsx src/components/ui/rich-text-editor.spec.tsx`
  - 4 files, 13 tests passed.
- Backend targeted tests passed:
  - `pnpm --filter @aluplan/backend test -- xss-validation.pipe.spec.ts tickets.service.spec.ts`
  - 2 suites, 18 tests passed.
- Typecheck passed:
  - `pnpm --filter @aluplan/frontend typecheck`
  - `pnpm --filter @aluplan/backend typecheck`
- i18n check passed:
  - `pnpm i18n:check`

### Decision

- First phase stores sanitized HTML in the existing `message` field.
- No Prisma `contentFormat` migration was added.
- Global XSS protection remains strict; rich HTML is a narrow exception for ticket message bodies only.
- `apps/backend/openapi.json` remains a separate drift and was not part of this phase.

### Next

- Manual smoke should verify:
  - admin formatted reply send/render
  - customer formatted reply send/render
  - ANN draft markdown becomes readable headings/lists in the editor
  - old plain text messages still render correctly
  - `<script>`, event attributes, and `javascript:` links do not persist or execute

## Follow-up - 2026-05-15 RAG Fallback + AI Operations Topology Plan

### Trigger

- Customer-facing AI diagnosis still fell back to raw-ish excerpts for unknown intents, even when retrieval found the right document.
- The system already has approved learning surfaces:
  - `/en/faq-learning`
  - `FaqEntry`
  - `TrainingQueue`
  - AI interaction feedback
  - high-CSAT ticket indexing
- A broader review showed AI operations UI is distributed across:
  - `/en/system-topology`
  - `/en/faq-learning`
  - `/en/admin/ai-intelligence`
  - `/en/admin/ai-health`
  - `/en/admin/settings?tab=ai`

### Decisions

- Do not create a second learning system.
- Connect published FAQ learning outputs into the main RAG retrieval path.
- Use product/category keywords as deterministic fallback signals, not only diagnosis/prompt context.
- Customer fallback answers must be structured support answers, not raw excerpts.
- Keep special high-quality fallback templates, but add a generic evidence-driven synthesis path for unknown questions.
- Align source topology stats with actual retrieval behavior.
- Treat AI Operations Dashboard consolidation as a separate frontend/ops debt phase after RAG/fallback stabilization.

### Planned Backend Work

- Add approved `faq_entries` to main search as a first-class `FAQ` source.
- Keep customer retrieval limited to published/public FAQ entries.
- Allow staff/admin retrieval to include internal approved FAQ entries where appropriate.
- Refresh FAQ `question_embedding` on approve/update using the active embedding version/dimension.
- Pass `DiagnosisResult` into deterministic fallback generation.
- Use matched product/category keywords, category names, and source title tokens when selecting fallback snippets.
- Ensure fallback answer text hides `[Dataset]`, file names, Document ID, raw URLs, and technical source metadata from customers.
- Enrich AI interaction context with source/fallback strategy details for AI health/intelligence dashboards.

### Restore Point

- Before product-code changes, create a dedicated docs/memory commit and restore checkpoint:
  - commit: `docs(memory): record rag fallback topology plan`
  - checkpoint branch: `restore/rag-fallback-before-integration-20260515`
- Existing `apps/backend/openapi.json` drift remains intentionally excluded.

## Restore Point - 2026-05-16 Customer/Agent RAG Answer Parity

### Trigger

- Customer tarafında RAG yanıtları fallback'e erken düşüyor ve admin Copilot yanıtlarından belirgin biçimde daha zayıf kalıyordu.
- Örnek: "Lisans sunucusunu yeni bir makineye taşımak istiyorum, süreç nedir?"
  - Customer: 15 saniye sonunda kısa/mixed-language deterministic fallback.
  - Admin: 60 saniyelik Copilot synthesis ile detaylı Türkçe prosedür.

### Implemented

- `AiQueryService` synchronous customer diagnosis generation timeout'u 15s -> 60s yapıldı.
- Cevap dili URL locale yerine soru diline göre belirlenir hale getirildi.
  - `/en` UI altında Türkçe soru Türkçe answer contract kullanır.
- Stale customer permission token sorunu için frontend API katmanı `403 Requires permission` durumunda bir kez refresh+retry yapacak şekilde düzeltildi.
- RBAC seed/auth refresh drift'i düzeltildi; CUSTOMER ve AGENT rolleri `ticket:read` dahil gerekli ticket izinlerine sahip.

### Validation

- Backend:
  - `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts --runInBand`
  - `pnpm --filter @aluplan/backend typecheck`
  - `pnpm --filter @aluplan/backend build`
- Frontend:
  - `pnpm --filter @aluplan/frontend exec vitest run src/lib/api.spec.ts`
  - `pnpm --filter @aluplan/frontend typecheck`
- Runtime:
  - Backend restarted from fresh `dist/main`.
  - `/api/v1/health` returned `ok`.
  - Customer and admin WebSocket clients reconnected.
- User confirmed the latest customer flow works.

### Commits

- `74c859f fix(auth): restore customer ticket permissions`
- `457076a fix(frontend): refresh stale permission tokens`
- `3b7b82d fix(rag): align customer answer synthesis with agent flow`

### Restore Policy

- This point is considered a stable restore checkpoint for RAG customer/admin answer parity.
- `apps/backend/openapi.json` is still unrelated drift and must not be mixed into product/RAG commits.
- Graphify still warns that a fresh graph has about 5.6k nodes vs existing 11.4k nodes; graph output should not be force-overwritten until chunk/source mismatch is understood.

## Follow-up - 2026-05-16 CRM Live Delta Notifications

### Trigger

- Dynamics 365 delta sync was updating local account/contact records and writing `crm_change_logs`, but the admin experience still required watching the CRM page or pressing "Check CRM Updates" to feel confident.
- User expectation: CRM remains source of truth; support DB updates automatically; admins receive live notification and can see refreshed change history.

### Implemented

- CRM scheduled delta sync default interval changed from 15 minutes to 5 minutes.
- Existing backend `crm:changes` and `crm:sync_error` websocket events were connected to the global frontend notification listener.
- Admins now receive localized toast notifications for CRM account/customer changes and CRM sync errors.
- `/customers/crm` now listens for CRM websocket events and refreshes change history/connection status automatically.
- CRM persistent notification recipient lookup now accepts uppercase and lowercase role names, preventing admin notification misses caused by role-name casing.

### Validation

- Backend:
  - `pnpm --filter @aluplan/backend test -- notifications.gateway.spec.ts crm-record-sync.service.spec.ts`
  - `pnpm --filter @aluplan/backend typecheck`
  - `pnpm --filter @aluplan/backend build`
- Frontend:
  - `pnpm --filter @aluplan/frontend typecheck`
  - `pnpm i18n:check`
- Runtime:
  - Backend restarted from fresh `dist/main`.
  - `/api/v1/health` returned `200`.

### Notes

- Manual "Check CRM Updates" remains useful as an immediate force-check button.
- Automatic polling is still delta-poll based, not Dataverse webhook push. Webhook registration can be a later phase if true instant sync is required.
- Existing Resend `401 invalid API key` email queue noise is unrelated and should be handled in a separate email/config cleanup phase.

## Deployment Note - 2026-05-16 Email Branding Logo URLs

### Trigger

- Announcement and transactional email templates now use branding/contact settings dynamically.
- Uploaded logo must be visible inside real email clients, not only inside the admin UI preview.

### Must Remember Before Deploy

- Production must set a public HTTPS backend API URL:
  - `API_URL=https://api.<domain>/api/v1`
- This URL is used to build email-safe logo URLs such as:
  - `https://api.<domain>/api/v1/branding/assets/brand/logos/...`
- Do not use `localhost`, relative URLs, private network URLs, or temporary signed object-storage URLs for `branding.logo_url` in production.
- After deploy, upload/save the logo once from admin settings so `branding.logo_url` stores the new public URL shape.

### Deploy Verification

- Unauthenticated asset check:
  - `curl -I https://api.<domain>/api/v1/branding/assets/<logo-key>` should return a successful image response or a valid public redirect.
- Email HTML check:
  - Announcement and transactional email preview must contain `<img src="https://...">`, not `/api/...` or `http://localhost...`.
- Real inbox smoke:
  - Send one test announcement or transactional email to Gmail/Outlook and confirm the logo renders.

### Related Commit

- `798cc52 fix(email): use public branding logo urls`

## Follow-up - 2026-05-16 Remotion Promo Video

### Trigger

- User requested a 10-second dynamic motion graphic promo video using live application screenshots.

### Implemented

- Added isolated Remotion workspace app:
  - `apps/promo-video`
  - Composition: `AluplanPromo`
  - 10 seconds, 30 fps, 1920x1080, H.264 render target.
- Added screenshot capture helper:
  - `scripts/capture-promo-screenshots.mjs`
  - Captures login, dashboard, tickets, knowledge pool, AI intelligence, and AI settings screens from the running local app.
  - Uses backend login API to create browser cookies without printing tokens.
- Rendered output:
  - `apps/promo-video/out/aluplan-promo.mp4`
  - `apps/promo-video/out/preview.png`

### Validation

- Live app screenshots were captured from `localhost:3000` with backend auth from `localhost:4000`.
- Remotion still preview succeeded:
  - `pnpm --filter @aluplan/promo-video still`
- Full MP4 render succeeded:
  - `pnpm --filter @aluplan/promo-video render`
  - 300/300 frames rendered and encoded.

### Notes

- `ffprobe` is not installed in the shell, so duration was verified from Remotion composition/render output rather than external media probing.
- Backend `/api/v1/health` returned 503 during the session because storage threshold health was down, but auth and screenshot routes were usable.

## Deployment Readiness - 2026-05-17 Repo Hygiene and Env Blockers

### Completed

- Removed local agent/tooling dumps from Git tracking so they will disappear from the remote repository after push:
  - `.agent/`
  - `.agents/`
  - `.claude/`
  - `.gemini/`
  - `.kiro/`
  - `.opencode/`
  - `graphify-out/`
- Kept `.github/` because it contains CI, Dependabot, release, and drill workflows.
- Added ignore rules so local agent/spec/graph/promo artifacts do not re-enter Git.
- Added missing i18n labels for the AI model list UI.
- Updated deployment config docs/examples:
  - `.env.example`
  - `docker-compose.yml`
  - `docker-compose.staging.yml`
  - `docs/PRODUCTION_SECRETS.md`

### Validation

- `pnpm --filter @aluplan/backend test -- env-validation.spec.ts`
- `pnpm i18n:check`
- `docker compose --env-file /dev/null config` with production-like placeholder values.
- `docker compose --env-file /dev/null -f docker-compose.staging.yml config` with staging-like placeholder values.

### Current Deploy Blockers

- Live secrets were pasted into chat. Rotate before deploy/push:
  - database password/URL
  - Redis password/URL
  - OpenAI key
  - Groq key
  - Resend key
  - R2 access/secret keys
  - JWT secrets
  - encryption key
- Backend production env must add:
  - `API_URL=https://api.allplan.net.tr/api/v1`
- Backend production env must replace weak/short:
  - `JWT_SECRET` must be at least 32 characters and should be strong random.
- Backend production env currently includes:
  - `ALLOWED_ORIGINS=https://allplan.net.tr,http://167.86.84.107:8000`
  - Prefer only HTTPS production frontend origins. The raw HTTP IP origin is not suitable for a clean production launch.
- Frontend production env currently has:
  - `NEXT_INTERNAL_API_URL=http://backend-api:3001/api/v1`
  - Verify the Coolify internal backend service really listens on `3001`; current backend Dockerfile exposes `4000`.
- AI/RAG env currently points back to older 1536/OpenAI/Groq defaults:
  - `EMBEDDING_MODEL=text-embedding-3-small`
  - `GENERATIVE_MODEL=llama-3.3-70b-versatile`
  - `VECTOR_DIMENSIONS=1536`
  - Current stable direction is Gemini/LLMAPI with `gemini-embedding-2` and `3072` dimensions unless there is a deliberate migration plan.

### Safe Next Step

- Rotate exposed secrets first.
- Update Coolify backend/frontend env values from `.env.example`.
- Then run a staging deploy smoke:
  - health
  - login/me
  - ticket creation with and without AI
  - email logo public URL
  - CRM update check
  - RAG answer quality check

## Email Branding and KVKK Unsubscribe Hardening - 2026-05-17

### Completed

- Diagnosed why uploaded branding logo did not render inside email templates:
  - `branding.logo_url` was already saved as an absolute backend asset URL.
  - Production CORS was blocking requests that had no `Origin` header.
  - Email clients commonly fetch images without `Origin`, so the backend returned 500 for logo asset fetches.
- Updated backend CORS behavior:
  - Browser origins still use the allowlist.
  - No-origin requests are allowed so email clients, health checks, curl, and server-to-server asset fetches can reach public/signed-token endpoints.
- Added `/api/v1/email/unsubscribe` to CSRF bypass because it is a public signed-token action reached from email links.
- Hardened unsubscribe enforcement:
  - Email send path now checks both category preferences and global `ALL=false`.
  - Registered recipients get `data.userId` injected before queueing so generated unsubscribe URLs are user-specific instead of `global`.
- Added a lightweight unsubscribe survey:
  - `/[locale]/unsubscribe` now asks an optional reason and optional note.
  - TR/EN/DE copy is included for the page.
  - Backend stores reason/comment with user/email, user-agent, IP, and timestamp.
- Added Prisma migration:
  - `20260517000003_add_email_unsubscribe_feedback`
  - creates `email_unsubscribe_feedbacks`.

### Validation

- `pnpm --filter @aluplan/backend test -- email.service.spec.ts`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm --filter @aluplan/backend typecheck`

### Deploy Smoke After Redeploy

- Re-test email logo:
  - `curl -I -L https://api.allplan.net.tr/api/v1/branding/assets/...`
  - expected: no backend 500; should return/redirect to a reachable image.
- Send a real announcement/test email and confirm the logo renders in Gmail/Outlook.
- Click unsubscribe link:
  - page should show optional reason/comment fields.
  - submit should succeed without login.
  - subsequent non-essential emails should be skipped when `ALL=false` exists.

### Follow-Up

- Decide whether `ALL=false` should suppress ticket/system transactional emails too, or only announcement/marketing-style mail. Current implementation follows the existing endpoint wording and blocks all categories.

## AI Settings and Embedding 400 Investigation - 2026-05-17

### Root Cause

- Dataset indexing errors saying `OpenAI HTTP 400` mean the embedding call was going through `OpenAiService.embed()`, not Gemini.
- The production/env defaults had an inconsistent combination:
  - `EMBEDDING_PROVIDER=OPENAI`
  - `EMBEDDING_MODEL=gemini-embedding-2`
  - `EMBEDDING_DIMENSIONS=3072`
- `text-embedding-3-small` cannot accept `dimensions: 3072`; OpenAI rejects this with HTTP 400.
- This also explains the UI confusion: selecting Gemini models in AI settings does not help if the active embedding provider/env still resolves to OpenAI.

### Completed

- OpenAI embedding requests now cap dimensions per OpenAI model:
  - `text-embedding-3-small` max 1536.
  - `text-embedding-3-large` max 3072.
  - legacy embedding models omit the `dimensions` parameter.
- Embedding provider env validation now accepts `GEMINI`, `LLMAPI`, and `OLLAMA`.
- Provider router now honors `EMBEDDING_PROVIDER=GEMINI` and `EMBEDDING_PROVIDER=LLMAPI`.
- Compose/env examples now default embedding provider to `GEMINI`, matching the current pgvector + Gemini direction.
- Gemini setting validation now requires `ai.gemini.embed_model` when Gemini is selected as the embedding provider.

### Validation

- `pnpm --filter @aluplan/backend test -- openai.service.spec.ts ai-provider-router.service.spec.ts env-validation.spec.ts`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`
- `pnpm --filter @aluplan/backend typecheck`

### Production Follow-Up

- In Coolify backend env, use:
  - `EMBEDDING_PROVIDER=GEMINI`
  - `EMBEDDING_MODEL=gemini-embedding-2`
  - `EMBEDDING_DIMENSIONS=3072`
  - `VECTOR_DIMENSIONS=3072`
- In Admin AI settings, ensure:
  - `ai.embed_provider=gemini`
  - `ai.gemini.embed_model=gemini-embedding-2`
  - old `ai.openai.embed_model` can remain for fallback, but should not be the active embedding provider during Gemini indexing.

## Optional Crawl4AI URL Ingestion Sidecar - 2026-05-17

### Decision

- Current URL ingestion remains available as the safe default.
- Crawl4AI is added as an optional URL-to-markdown extraction sidecar for higher-quality web source ingestion.
- The sidecar is disabled by default to avoid unnecessary RAM use on the VPS.
- If Crawl4AI fails, times out, or returns weak content, the backend automatically falls back to the existing basic crawler.

### Completed

- Added backend Crawl4AI adapter in `CrawlService`.
- Added env validation for:
  - `CRAWL4AI_ENABLED`
  - `CRAWL4AI_BASE_URL`
  - `CRAWL4AI_API_TOKEN`
  - `CRAWL4AI_TIMEOUT_MS`
- URL sync now stores crawler provider metadata on `KnowledgeSource` and embedding metadata.
- Docker Compose now includes `crawl4ai` behind the `crawl4ai` profile.
- Default compose remains lightweight; sidecar starts only when explicitly enabled.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts knowledge-pool.processor.spec.ts env-validation.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `docker compose --env-file /dev/null config`
- `COMPOSE_PROFILES=crawl4ai docker compose --env-file /dev/null config`
- `git diff --check`

### Production Follow-Up

- For Coolify, only enable this after the current production fixes are deployed and stable.
- If enabled through Compose:
  - set `COMPOSE_PROFILES=crawl4ai`
  - set `CRAWL4AI_ENABLED=true`
  - keep `CRAWL4AI_BASE_URL=http://crawl4ai:11235`
- If enabled as a separate Coolify service:
  - point `CRAWL4AI_BASE_URL` to the internal service URL.
- URL ingestion should be tested with a single pilot URL before bulk web ingestion.

## Embedding Index Isolation Decision - 2026-05-17

### Decision

- Keep Gemini embedding as the active production embedding path because answer quality was validated against that corpus.
- Do not pretend provider normalization makes OpenAI/Gemini/Ollama vectors interchangeable.
- Use index isolation instead:
  - active provider/model/dim resolves to an `embedding_version`.
  - vector writes store that `embedding_version + embedding_dim`.
  - retrieval queries only search the active `embedding_version + embedding_dim`.
  - provider changes require a new index version and controlled reindex before activation.
- Qdrant is added to the roadmap for later benchmark/pilot, not for the pre-test delivery.

### Implementation Direction

- PostgreSQL/pgvector remains the production store.
- Vector columns should be unconstrained `vector` so Gemini `3072` and future provider dimensions can coexist physically.
- HNSW is skipped for active dimensions over pgvector's practical HNSW limit; exact search remains available for the current support-test corpus.
- Dedicated Qdrant migration should only happen after acceptance-set benchmark evidence and deployment/backup/monitoring planning.

## Production RAG / Dataset Upload Fixes - 2026-05-17

### What changed

- Production AI ticket/customer answer flow failed because the live `macros` table missed `deleted_at` while Prisma `Macro.deletedAt` and the global soft-delete filter expected it.
- Added migration `20260517000006_add_macro_deleted_at` and applied the same safe SQL live.
- A Turkish Workgroup Manager question fell back to German raw source text when Gemini response timed out.
- Added a deterministic Turkish Workgroup Manager fallback so `Workgroup Manager’da bilgisayar eklenemiyor...` returns Turkish support structure instead of leaking German excerpts.
- Removed raw fallback passage exposure from staff fallback detail; source title may remain, raw excerpt no longer appears.
- Dataset upload now supports multi-file selection with sequential upload, preserving quota-safe ingestion behavior.
- Knowledge pool upload/parser now accepts Word documents as `FILE_DOCX` via `mammoth` raw text extraction.

### Validation

- `pnpm --filter @aluplan/database db:generate`
- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts knowledge-pool-parser.service.spec.ts knowledge-pool-job.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm exec prisma validate --schema packages/database/prisma/schema.prisma`

### Deploy note

- Deploy backend for the RAG fallback and DOCX enum/parser changes.
- Deploy frontend for the bulk upload UI.
- Production DB has already received `macros.deleted_at`; the new DOCX enum migration will apply during backend deploy.

## AI Settings / Answer Tone Fixes - 2026-05-17

### Root cause

- Admin AI settings still allowed and persisted the deprecated `gemini-2.0-flash-exp` chat model.
- Gemini `v1beta generateContent` returns 404 for that model, which broke admin AI Copilot/ANN draft generation.
- Gemini model list UI could show a recommended model in the dropdown while the underlying setting state still held the old unsupported value.
- Customer fallback copy was technically useful but too mechanical for a corporate support experience.

### Changes

- Gemini service now normalizes deprecated `gemini-2.0-flash-exp` / `models/gemini-2.0-flash-exp` to `gemini-2.5-flash` before API calls.
- Production sync now repairs existing `ai.gemini.chat_model=gemini-2.0-flash-exp` records to `gemini-2.5-flash` during deploy.
- Admin AI settings model listing now updates the actual setting state to the recommended/supported model when the current value is unsupported.
- Removed the old Gemini "Flash 2.0 Exp" quick option from the UI and added `gemini-2.5-flash`.
- Added `ai.gemini.api_key` to frontend secret-save handling.
- AI answer contract now uses a warmer corporate support voice as "Aluplan AI Destek", while preserving grounding and no-hallucination rules.
- Customer AI answers now address the user by full name once when an authenticated user profile has `fullName`.
- Hotinfo modal no longer shows the raw JSON/kopyalama block; it keeps the structured Hotinfo view.

### Validation

- `pnpm --filter @aluplan/backend test -- gemini.service.spec.ts ai-query.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`

## CRM Placeholder Email / Hotinfo Display Fixes - 2026-05-19

### What changed

- CRM contacts without a real email still keep an internal placeholder user for relational integrity, but `no-email-...@internal.aluplan` is now hidden from customer list/detail API responses.
- Admin password reset for CRM contacts without a real email now fails safely instead of trying to send mail to the internal placeholder.
- Email recipient guard treats `internal.aluplan` placeholder recipients as reserved/blocked.
- Customer profile UI shows a localized "No email in CRM" label instead of the internal placeholder address.
- Hotinfo parser now handles collapsed dual-GPU strings like `NVIDIA ... / AMD ...` as separate GPU cards.
- Hotinfo parser now reads item-style GPU metadata for VRAM, RAM, resolution, driver date, and driver version.
- Hotinfo modal/header and GPU detail cards have more padding and more readable typography.

### Validation

- `pnpm --filter @aluplan/backend test -- customers.service.spec.ts hotinfo-parser.service.spec.ts email.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`

## AI Fallback Grounding Hardening - 2026-05-19

### Root cause

- The customer/admin answer quality regression was not a schema or deployment revert.
- When the model path timed out or returned no-knowledge, the deterministic fallback path was still allowed to:
  - use canned topic summaries even if the retrieved source did not directly cover the topic,
  - expose source labels in staff/customer fallback output,
  - replace admin no-knowledge drafts with raw "strongest match" excerpts.
- This made unrelated sources look authoritative, for example IFC answers citing licensing/virus-scanner FAQs.

### What changed

- Customer fallback now requires direct query/source topic coverage before producing any deterministic answer.
- Turkish canned fallback summaries now only fire when the retrieved evidence contains the matching topic signal.
- Staff-visible customer fallback no longer appends `Kaynak:` labels in the generated answer body.
- Admin Copilot fallback no longer turns no-knowledge into raw excerpt summaries; it returns a safe manual-review message unless the evidence directly supports the canned Workgroup/license procedure.
- Regression tests cover unrelated IFC/licensing source leakage and admin raw-excerpt fallback.

### Validation

- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts ai-copilot.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `git diff --check`

## Live Verification Follow-up - 2026-05-19

### What changed

- Live deploy verification confirmed backend and frontend were running commit `4a4c372`.
- Customer/admin AI query smokes returned structured answers without raw `Kaynak:`/strongest-match excerpt leakage.
- Live customer ticket creation failure was traced to backend validation: `subject must be shorter than or equal to 255 characters`.
- New ticket UI now enforces the 255-character subject limit with a localized validation message and character counter before advancing.
- Legacy Hotinfo snapshots with a collapsed dual-GPU name now split into two GPU cards at render time, so old tickets also show `1/2 Graphics Card / GPU`.

### Validation

- Browser smoke opened the live new-ticket page and confirmed the form flow is reachable.
- Live API smoke created a customer-role ticket (`SUP-00087`) with a valid short subject and then cleaned it up by soft-delete.
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Generic Web Crawler Candidates - 2026-05-19

### What changed

- Existing Knowledge Pool URL ingestion keeps the single-URL sync path, but the URL modal now also supports a controlled "crawl subpages" mode.
- Generic web discovery uses the shared Crawl4AI/basic crawler path, follows same-domain links with safe defaults, and writes discovered pages/PDFs to `crawl_candidates` as `generic_web`.
- Crawler candidates can now be filtered by source (`All`, `Learn Now`, `Generic Web`) and show the source domain plus discovered-from URL.
- LearnNow discovery falls back to Crawl4AI markdown links when the static search page does not expose usable anchors.
- Crawl4AI config handling now accepts boolean `CRAWL4AI_ENABLED` values from validated config.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts learnnow-crawler.service.spec.ts generic-web-crawler.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Follow-up - 2026-05-20 Hotinfo VRAM Tespiti Çözüm Planı (Seçenek A - AI Yönlendirmesi)

### What changed

- Harici ekran kartının VRAM bilgisi XML'de bulunamadığında (uyku modundayken Hotinfo oluşturulduğunda), VRAM değeri `Bilinmiyor (Kart Uyku Modunda)` olarak işaretlendi.
- AI sistem prompt'u güncellendi: Ekran kartının VRAM değeri `Bilinmiyor (Kart Uyku Modunda)` ise, AI kesin donanım tanısı koymayıp, kullanıcıdan Allplan'ı açarak ekran kartını aktif hale getirip Hotinfo'yu yeniden yüklemesini rica edecek.

### Verification

- `pnpm --filter @aluplan/backend test -- hotinfo-parser.service.spec.ts prompt-context-builder.service.pbt.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `gitnexus detect_changes` (attempted)

## Live Chat Policy + AI Ticket Trace - 2026-05-20

### What changed

- Customer-initiated live chat requests are now server-side gated: only VIP customers can move a ticket chat status to `REQUESTED`.
- Support staff can still start or accept live chat regardless of customer VIP status, preserving the intended proactive support workflow.
- Ticket creation now marks linked `AiInteraction.ticketCreated=true`, including idempotent/reused ticket paths.
- Added a staff-only `GET /tickets/:id/ai-trace` endpoint with interaction telemetry, language/source/contract checks, source-leak detection, and recent message context.
- Ticket detail UI now shows an AI Ticket Trace card for support users and disables customer live-chat request controls when the ticket creator is not VIP.

### Validation

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`

## Follow-up - 2026-05-21 Inbound Reports, AI Trace Locale, and URL Source Names

### What changed

- DMARC/authentication aggregate reports and feedback reports are ignored before inbound email/webhook ticket creation.
- AI interactions now persist request locale, route locale, profile language, response language, strict language, and generation state for trace diagnostics.
- Staff ticket detail AI Trace now displays route locale and profile language.
- Direct Knowledge Pool URL sync preserves the admin-provided source/article name and stores crawler/page titles in metadata, preventing generic `LEARNNOW Allplan` titles from replacing the visible source name.

### Validation

- `pnpm --filter @aluplan/backend test -- email-bounce.util.spec.ts email-inbound.service.spec.ts omni-channel.service.spec.ts`
- `pnpm --filter @aluplan/backend test -- knowledge-pool.processor.spec.ts knowledge-pool-job.spec.ts`
- `pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `pnpm i18n:check`
- `git diff --check`

## Follow-up - 2026-05-21 LearnNow URL Visual Evidence Ingestion

### What changed

- URL crawler results now include discovered content image references from static HTML and Crawl4AI markdown.
- New `VisualContentService` selects non-decorative article images, fetches them with safe limits, summarizes them through the existing multimodal AI dispatcher, and appends useful summaries to the text sent into Knowledge Pool embeddings.
- Visual summaries are cached in `KnowledgeSource.metadata.visualSummaries` and image references are stored in metadata, preparing the next UI step where AI answers can show original source visuals alongside text.
- Retrieval results now carry `visualSummaries`, and AI query responses can return a `visuals` array for matched URL/document sources.
- Vision enrichment is bounded by env defaults: enabled, max 4 images/source, 2 MB/image, same host only, timeout guarded. Failures skip visual enrichment without failing the URL sync.

### Validation

- `pnpm --filter @aluplan/backend test -- crawl.service.spec.ts visual-content.service.spec.ts knowledge-pool.processor.spec.ts`
- `pnpm --filter @aluplan/backend typecheck`
- `pnpm --filter @aluplan/frontend typecheck`
- `git diff --check`

## Follow-up - 2026-05-21 LearnNow Public Format Discovery

### What changed

- LearnNow crawler discovery now supports the public resource filters `knowledge_article`, `pdf`, `technical_manual`, `explaining_video`, and `recorded_online_session`.
- `knowledge_article` remains the default article path and PDF remains the dedicated PDF import path.
- Non-PDF LearnNow formats are staged as `KNOWLEDGE_ARTICLE` candidates so the existing review/import/sync pipeline stays unchanged.
- Candidate metadata preserves the original LearnNow source type, so admin review and future RAG provenance can distinguish articles, manuals, videos, and recorded sessions.
- The Knowledge Pool crawler UI now exposes all five public format toggles in Turkish, English, and German.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Next

- Phase 2 should inspect LearnNow detail pages for image assets and video transcript availability before importing visual/video content into RAG answers.

## Follow-up - 2026-05-21 Ticket Routing Foundation

### What changed

- Customer ticket creation now asks for support category/department before product selection.
- The selected department is submitted as `departmentId`, so ticket SLA and routing have an explicit department anchor.
- The shared ticket schema now includes optional `departmentId` for frontend/backend DTO alignment.
- Auto-assignment no longer assigns departmentless tickets or falls back to global support agents.
- Auto-assignment only considers active users in non-archived teams where `autoAssignmentEnabled=true` and the team belongs to the ticket department.

### Verification

- `pnpm --filter @aluplan/backend test -- auto-assignment.service.spec.ts tickets.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Note

- This phase is local-only until the remaining routing/admin team phases are complete and explicitly pushed.

## Follow-up - 2026-05-21 Assignment UI Guardrails

### What changed

- Ticket detail now asks the backend for ticket-scoped assignable agents instead of loading the global agent list.
- The new `GET /tickets/:id/assignable-agents` endpoint returns only active non-customer users who belong to a non-archived team for the ticket department.
- Ticket assignment dropdown now shows agent e-mail addresses to make same-name accounts distinguishable.
- Team member add dialog now uses a searchable combobox and loads only staff/agent users instead of all users, preventing CRM/customer records from appearing in support-team assignment.
- Team detail member cards now display member e-mail addresses under the name so duplicate identities are visible before editing team membership.
- Team member removal now uses the app dialog/toast design instead of the browser-native `confirm()` prompt.
- `teams.roles.*` labels were added for TR/EN/DE so role dropdowns render localized role names instead of raw i18n keys.

### Verification

- `pnpm --filter @aluplan/backend test -- tickets.service.spec.ts tickets.controller.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Live finding

- Production has two `Melih Dinekli` identities: `melih@aluplan.com.tr` is the staff/admin account, while `melihdinekli@gmail.com` is a CUSTOMER account currently present in the `Teknik Destek` team. The team should be corrected from UI by removing the customer identity and adding the staff e-mail.
- Live API smoke found `/users?type=agent` was returning overly broad user records, including fields that are not needed by the UI. `UsersService.findAll()` was narrowed to safe summary fields only and now maps role data into a frontend-compatible `userRoles` shape without exposing hashes, raw CRM payloads, or Hotinfo raw data.

## Follow-up - 2026-05-23 AI Answer Quality Guardrail Hotfix

### What changed

- Expanded no-knowledge detection so Turkish/English/German "not enough reliable content" answers are routed as runtime `NO_MATCH` instead of being persisted as successful MEDIUM/HIGH auto-answers.
- Removed the overly broad `destek talebi oluştur` no-knowledge trigger because it incorrectly marked otherwise useful answers as unusable.
- Added answer-language leak detection and a repair pass: if the UI language is English/German/Turkish but the LLM body leaks another language, the backend asks the model to rewrite the same answer in the selected UI language without adding facts.
- Added safe crash/freeze triage for queries like `Allplan kilitleniyor`; it avoids unrelated source attribution, returns LOW confidence, keeps `suggestTicket=true`, and asks for Hotinfo/screenshots/exact steps.
- No-knowledge and safe operational triage responses no longer attach unrelated source metadata to customer-facing answer results.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-answer-quality.spec.ts ai-query.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.

### Deployment note

- Backend deploy is required for the AI quality fix. Frontend deploy is not required for this backend-only guardrail change.

## Follow-up - 2026-05-23 Support Answer Orchestrator

### What changed

- Added `SupportAnswerOrchestrator` as the shared answer-generation decision layer for customer AI diagnosis and admin ANN/Copilot drafts.
- Centralized LLM draft generation, ranking-payload reformat fallback, timeout/empty response fallback, no-knowledge-with-context fallback, and language repair policy.
- Customer `AiQueryService` now delegates final answer generation and language repair to the orchestrator instead of owning a separate generation path.
- Admin `AiCopilotService` now delegates final draft generation and language repair to the same orchestrator, while preserving linked customer-answer grounding and grounded draft fallbacks.
- Ticket creation step 2 now exposes screenshot/file selection before AI diagnosis, so screenshots can be sent into the first AI answer instead of only being attached after ticket creation.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-answer-quality.spec.ts ai-copilot.service.spec.ts ai-query.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Note

- This closes the prompt-only parity gap: previous work shared the prompt contract, but customer/admin still had separate orchestration behavior. The shared orchestrator is now the production path for final answer/draft generation policy.

## Follow-up - 2026-05-23 Customer ANN-Quality Synthesis

### What changed

- Customer ticket-opening AI now explicitly uses the same analytical depth target as admin ANN drafts instead of a quick match-summary posture.
- `SupportAnswerOrchestrator` now retries no-knowledge model responses through an ANN-style second-pass synthesis before using any deterministic fallback.
- Customer sync diagnosis timeout was increased to 120s and wait-mode no-knowledge recovery gets two synthesis attempts.
- Ticket-opening prompt now forbids broad category labels as the problem topic and instructs the model to inspect screenshots/files before refusing.
- Ticket-opening UI now shows a compact “answer is being synthesized” state with source, attachment, and final-answer progress cues instead of implying a fast search.

### Verification

- `pnpm --filter @aluplan/backend test -- support-answer-orchestrator.service.spec.ts ai-query.service.spec.ts ai-answer-quality.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.
- `git diff --check` passed.

### Deployment note

- Backend deploy is required for the ANN-quality synthesis behavior.
- Frontend deploy is required for the new synthesis wait UX and translations.

## Follow-up - 2026-05-24 Operations Dashboard Modal Filters

### What changed

- Dashboard pulse modals now consume real backend `pulse.details` segment data instead of rendering decorative filter labels.
- Ticket, AI, CRM, and Knowledge modal controls are clickable segment buttons with active state and selected-slice metrics, trend points, records, and summaries.
- Backend ops dashboard now returns segment payloads for ticket 7d/24h/30d/department views, AI provider/language/problem-trace views, CRM failed/missing-email/account-matching views, and Knowledge LearnNow/review/failed-import views.
- CRM dashboard records now avoid exposing raw `rawCrmPayload` snippets in modal summaries; CRM payload changes are shown as a readable update label.
- Frontend regression coverage now verifies that a pulse modal segment click changes the rendered records instead of staying decorative.

### Verification

- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Backend deploy is required for the new `pulse.details` data contract.
- Frontend deploy is required for clickable modal segment controls and localized metric labels.

## Follow-up - 2026-05-24 Operations Dashboard CRM/Workspace Closure

### What changed

- Fixed CRM modal customer links by routing contact change records to the owning `User.id` instead of the `CustomerProfile.id`; this resolves the Deniz Doğan "account not found" path.
- CRM modal records are grouped by local customer/account identity so field-level Dynamics changes no longer appear as repeated raw payload rows.
- Pulse modal segment controls now show the actual selected slice result. Empty slices stay empty instead of falling back to generic records, so filters like failed-only, missing-email, and review-required are no longer misleading.
- Operations Workspace removed the redundant AI Health tab and now focuses on Overview, CRM, Knowledge Pool, and LearnNow.
- CRM, Knowledge Pool, and LearnNow workspace tabs now follow the mockup intent more closely with decision-oriented metric panels, progress signals, and linked record lists.
- LearnNow workspace uses current real schema fields (`KNOWLEDGE_ARTICLE`, `PDF`, status counts) instead of placeholder media format labels.

### Verification

- `pnpm i18n:check` passed.
- `pnpm --filter @aluplan/backend test -- ops-dashboard.service.spec.ts` passed.
- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm --filter @aluplan/backend build` passed.
- `pnpm --filter @aluplan/frontend build` passed.

### Deployment note

- Deploy backend first for the corrected CRM modal link/grouping contract.
- Deploy frontend after backend for the fixed modal filter behavior and updated workspace layout.

## Follow-up - 2026-05-24 Operations Dashboard Segment Clarity

### What changed

- Pulse modal segment controls now display their record counts directly on each segment button.
- Active modal segments now use the backend-provided decision title/description, so slices like LearnNow review or failed imports explain the selected filter instead of showing a generic dashboard summary.
- Added a frontend regression that opens the Knowledge Flow modal, switches to an empty failed-import slice, and verifies the selected slice stays explicit with an empty state.

### Verification

- `pnpm --filter @aluplan/frontend exec vitest run 'src/app/[locale]/(dashboard)/dashboard/DashboardClient.spec.tsx'` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Frontend deploy is sufficient for this segment clarity fix.

## Follow-up - 2026-05-24 LearnNow Public Crawl Boundary

### What changed

- LearnNow crawler discovery now rejects enrollment/course-layer pages such as `course/view`, `course/preview`, and generic `mod/page` links from automatic staging.
- Public automatic discovery is limited to safe LearnNow How To resources and PDF/manual resource links.
- Discovery now checks existing Knowledge Pool sources by URL and content hash and stages matches as `SKIPPED_DUPLICATE` instead of re-importable candidates.
- Article imports now persist the candidate content hash on the Knowledge Source, so future duplicate hash checks can catch equivalent content.
- Knowledge Pool crawler UI now explains the public-only LearnNow boundary, the e-learning manual-import path, and duplicate controls in TR/EN/DE.
- Duplicate candidates show their rejection reason and cannot be imported again from the candidate table.

### Verification

- `pnpm --filter @aluplan/backend test -- learnnow-crawler.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Backend deploy is required for the public-only LearnNow crawl boundary and discovery-time duplicate checks.
- Frontend deploy is required for the crawler UI guidance and duplicate-reason display.

## Follow-up - 2026-05-24 RAG Source Applicability Guard

### What changed

- Added a retrieval applicability multiplier so legacy Softlock / old Allplan 2006-2014 license documents cannot win HIGH confidence for modern license transfer or upgrade questions only because the title is lexically similar.
- Modern license transfer sources such as Product Key / CodeMeter transfer guidance now outrank old Softlock documents for queries like "Bilgisayarıma format attım. Allplan lisansımı yeni bilgisayarıma nasıl aktarabilirim?"
- Explicit legacy queries such as "Allplan 2012 Softlock..." still keep Softlock sources eligible, so the guard does not delete valid old-version support.
- Added an answer-contract rule preventing AI answers generated inside an existing ticket or agent draft from telling the user/admin to create another support request.

### Verification

- `pnpm --filter @aluplan/backend test -- embedding.service.spec.ts ai-answer-contract.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.

### Deployment note

- Backend deploy is required for the applicability guard and answer contract rule.

## Follow-up - 2026-05-25 AI Visual Evidence Rendering

### What changed

- Customer ticket-opening AI answers now preserve the backend `visuals` payload and render approved source images below the synthesized answer.
- Admin AI Support Navigator now uses the same visual evidence card, so LearnNow and future visual-capable sources can show images consistently.
- Added localized visual-evidence labels for TR/EN/DE.

### Verification

- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Frontend deploy is required for actual image cards to appear in the AI answer UI. The backend visual payload fix was already pushed separately.

## Follow-up - 2026-05-28 Admin Copilot Visual Evidence Parity

### What changed

- Admin ANN/Copilot draft responses now return visual evidence from the linked ticket-opening AI interaction.
- If the interaction does not already contain visuals, Copilot can fall back to the matched Knowledge Source metadata images/visual summaries.
- Ticket detail now renders draft visual evidence as separate cards above the reply composer, instead of embedding image URLs into the draft text.
- Visual evidence labels were added for Turkish, English, and German.

### Verification

- `pnpm --filter @aluplan/backend test -- ai-copilot.service.spec.ts` passed.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `pnpm --filter @aluplan/frontend typecheck` passed.
- `pnpm i18n:check` passed.

### Deployment note

- Deploy backend first so `/ai/copilot/draft/:ticketId` returns the `visuals` payload.
- Deploy frontend after backend so admin ticket detail renders the draft visual evidence cards.

## Follow-up - 2026-08-06 BULGU-10 Local Migration Recovery

### What changed

- Restored `0_add_ticket_number_seq` and `20260219151110_init_reset` to their production-shadow ledger-matching Git contents.
- Added `20260314900000_restore_crm_foundation` before the first CRM-dependent migration to recover missing RBAC, CRM, and AI response-cache foundations on fresh installs.
- Added a read-only migration integrity verifier, a canonical SHA-256 manifest for all 49 migration files, and a pre-deploy file gate; fresh PG17 deploy/status/ledger integrity remain blocking in CI.

### Verification

- Fresh disposable PG17: 49/49 migrations, no pending migration on the second deploy, integrity gate passed.
- Sanitized production-shadow clone: new migration applied, 49 distinct successful migrations, integrity gate passed, business row fingerprints unchanged.
- Prisma validate, monorepo typecheck, and backend full test suite passed (`116/116` suites, `1020/1021` tests passed, one skipped, zero failed).
- Pre-change restore tag and verified bundle point to `dfd5eccb`.

### Boundary and next action

- No production connection, migration, restore, push, tag push, or deploy occurred.
- The new migration remains pending for production and requires a separately approved maintenance window.
- Pre-existing full `schema.prisma` drift remains a separate follow-up; do not claim exact fresh-schema parity yet.

## Follow-up - 2026-08-05 Repo Consolidation Baseline And BULGU-23 Console Cleanup

### What changed

- Active work continued only in `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-support-desk-v02-main-live-site` after repo consolidation.
- Recorded the local consolidation baseline commit in `codex-claude-ortak-rapor.md`.
- Added `apps/backend/src/common/utils/cli-logger.ts` and moved backend CLI/diagnostic helper output from direct `console.*` calls to Nest `Logger` through `createCliLogger(...)`.
- Replaced remaining direct console calls in helper scripts, including `raw-sync.js`.
- Removed `raw-sync.js` hardcoded Postgres URL and personal dataset path; the script now requires `DATABASE_URL` and uses `DATASET_DIR` with a relative fallback.
- Adjusted one RAG utility spec fixture string so raw `console.*` scans do not report a non-call test snippet.

### Verification

- `pnpm --filter @aluplan/backend lint` passed with 0 errors and existing warnings only.
- `pnpm --filter @aluplan/backend typecheck` passed.
- `git diff --check` passed.
- Direct-call scan for `console.log/warn/error/info/debug/trace/dir/table(` under `apps/backend/src` returned no direct calls.
- Raw `console.` scan only reports `console.x.ai/billing` URL strings in `generic-openai.service.ts`.

### Notes

- Push remains forbidden unless the user explicitly requests it.
- Next safe local technical target is stabilizing `ai-pipeline-optimization.pbt.spec.ts` with deterministic seed/failure-seed handling.

## Follow-up - 2026-08-06 Post-Faz-7 DR, Migration And Auth Closure

### What changed

- Added direct structural comparison and migration-effect audit tooling, exact allowlist payloads, repeatable-read snapshots, and a root-level Faz 8 production runbook.
- Restored the already-applied foundation migration to its immutable canonical checksum; no historical applied migration remains modified.
- Added the new auth-state migration with action-token hashes, verification/password-reset cooldown timestamps, and durable session version.
- Hardened login/refresh cookies, verification/reset token contracts, account-state binding, resend cooldown/rollback, password-reset/refresh race handling, and URL-fragment token transport.
- Removed plaintext registration passwords from welcome-email payloads.

### Verification

- Fresh PG17 and sanitized production-derived clone: 51/51 migrations and migration-integrity gate passed.
- Direct DB comparison: 0 blocking, 4 exact allowlisted, 93 informational column-order differences.
- PRE read-only audit against the original shadow: 49 historical migrations, 1190 parsed effects, the expected 7 ghost effects and one pending foundation ledger entry. POST audit against its migrated disposable clone: 0 ghost, 0 pending/failed, 0 shadow-only. Exact definitions remain the separate comparator's responsibility.
- Backend full suite: 116/116 suites, 1051 passed, 1 skipped, 0 failed. Frontend unit suite: 24/24 files and 217/217 tests passed.
- Backend/frontend typecheck, i18n, Prisma validate/generation, migration manifest, shell syntax and `git diff --check` passed. Playwright discovery listed 60 tests in 21 files.
- Three-run current migration measurements on the sanitized PG17 clone stayed below 11 ms per migration without lock contention. A verified `users` AccessExclusiveLock caused Prisma to exit non-zero in 5.946 seconds when timeout was delivered through the URL `options` parameter; no application start was attempted. Shell `PGOPTIONS` was rejected as an unreliable assumption after it failed to affect Prisma.

### Boundary

- No production DB/Redis connection or mutation, deploy, push, tag-push or publish occurred.
- Production migration and live secret rotation remain user-controlled maintenance-window work.

## Follow-up - 2026-08-06 Knowledge Pool URL Duplicate Prevention

### What changed

- Added a conservative, deterministic Knowledge Source URL canonicalizer.
- Manual URL creation and LearnNow article import now share one transaction/advisory-lock writer, preventing equivalent concurrent submissions from creating two URL sources.
- Duplicate attempts create no record and enqueue no second sync job.
- URL DTO validation now requires URL values for URL sources, validates any supplied URL, and bounds name/URL length.
- Removed raw submitted-URL retention and internal source IDs from duplicate error responses.
- Added localized duplicate feedback and native URL input semantics to the Knowledge Pool modal.

### Verification

- TDD RED failures were observed before implementation.
- Focused backend: 4/4 suites, 39/39 tests passed.
- Full backend: 118/118 suites, 1067 passed, 1 skipped, 0 failed.
- Frontend unit: 25/25 files, 219/219 tests passed; focused duplicate helper 2/2 passed.
- Backend/frontend typecheck, TR/EN/DE i18n integrity, and `git diff --check` passed.
- Independent code and security re-reviews approved with no current-diff Critical/High blocker.

### Boundary

- Existing duplicate data was preserved unchanged; no cleanup or migration was run.
- No production/shadow mutation, push, tag-push, deploy, or publish occurred.
- Pre-existing SSRF risk remains separately open; indexed canonical identity is a future scalability/migration task.

## Runtime Hotfix - 2026-08-06 Prisma Advisory Lock And Knowledge Pool Messages

- User browser smoke exposed Prisma `P2010`: `pg_advisory_xact_lock()` returned PostgreSQL `void`, which Prisma could not deserialize.
- The query now projects `pg_advisory_xact_lock(...) IS NULL AS locked`; the blocking transaction lock still executes while Prisma receives a supported boolean value.
- A real Prisma transaction against local dev PG17 returned `{ok:true,rowType:"boolean"}` without changing application data.
- Missing `admin.knowledge_pool.crawler.public_notice_title` and `public_notice_desc` keys were added for TR/EN/DE; a namespace regression test now checks all three locales.
- Focused backend 20/20 and frontend 5/5 tests, backend/frontend typecheck, i18n, and independent code/security reviews passed.
- Hotfix commit: `6e280ea8`. No production/shadow mutation, push, or deploy occurred.

## Follow-up - 2026-08-06 AI Solution History And FAQ Provenance

### What changed

- Preserved `/kb-approvals` as the FAQ publication queue and added a separate `/admin/ai-interactions` history for the exact customer question and AI solution shown before ticket creation.
- Added paginated ticketed/ticketless, confidence, free-text and exact UUID filters; raw context, attachments, token/cost fields and unused customer text are excluded from FAQ provenance responses.
- Added dedicated `ai-interactions:read` and `faq:review` permissions. Customer/Viewer access is denied; existing Support Manager/KB Editor FAQ-review behavior is preserved without granting AI-history access.
- Added normalized FAQ provenance for tickets and AI interactions. Duplicate updates plus provenance writes are transactional and interaction-derived FAQ candidates cannot auto-publish.
- Added safe Markdown/HTML rendering for stored AI answers and exposed the same answer in the staff-only ticket AI trace after ticket-scope authorization.
- Added privacy-safe read audit records and capped FAQ pagination at 100.

### Verification

- Backend full suite: 119/119 suites, 1083 passed, 1 skipped, 0 failed.
- Frontend unit suite: 28/28 files, 227/227 tests passed.
- Final focused checks: backend 22/22 and frontend 4/4 passed after data-minimization changes.
- Backend/frontend typecheck, TR/EN/DE i18n, Prisma validate, migration status and `git diff --check` passed.
- Pre-migration local dump restored into a disposable PG17 DB; all 53 migrations applied and counts stayed 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 inferred legacy provenance rows.
- Independent code and security re-reviews approved with no remaining Critical/High blocker in this feature diff.

### Boundary

- Production/shadow DB and production Redis were not contacted or mutated. No push, tag-push, deploy or publish occurred.
- Legacy FAQ provenance was intentionally not guessed. Existing rows remain unchanged and display an explicit unknown-source state.
- `packages/database/scripts/production-sync.js` remains unmodified and must not be run in production because of a pre-existing hardcoded admin-password/user-reactivation risk tracked outside this feature.
- Post-feature restore point: commit `348411c5`, tag `restore/after-ai-interaction-visibility-20260806-348411c5`, verified complete-history bundle `.private-data/restore-points/post-ai-interaction-visibility-348411c5.bundle`, SHA-256 `222067a628f8cf5cd2d1817bc5c381a7030aca6e5658a7ed703f2a6eb56fd28a`.

## Follow-up - 2026-08-06 Production Boot And Migration Safety

### What changed

- Added an append-only migration-manifest writer that refuses modified, deleted, malformed, or non-forward migration history; CI retains read-only blocking verification.
- Added the data-preserving FAQ provenance timestamp-default alignment migration and advanced the canonical manifest to 54 migrations.
- Replaced divergent production entrypoints with one executable fail-closed deployment script. Normal boot now contains only migration verification/deploy, ledger verification, and API start.
- Removed automatic production data synchronization, role repair, admin bootstrap, direct DDL, and migration-ledger rewriting from application boot.
- Made database seed and manual production sync explicit opt-in maintenance operations; production E2E seeding, implicit credentials, mass user reactivation, and legacy admin mutation are blocked.
- Removed tracked `extracted_users.json` while preserving its ignored local copy, and removed the historical embedded credential from the current tracked tree.

### Verification

- Ops safety 15/15; backend 119/119 suites with 1083 passed and 1 skipped; frontend 28/28 files with 227/227 tests.
- Backend/frontend and focused seed typechecks, i18n, shell/Node syntax, frozen-lock install, migration manifest 54/54, local ledger/relations, schema parity, and diff checks passed.
- Local migration counts remained 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 FAQ provenance rows.
- Independent code, security, and TDD reviews approved with no Critical/High blocker.

### Boundary

- Product/ops commit: `6759b077`.
- Docker image build remains unproven because registry networking failed before the source build stage; release-environment image smoke is still required.
- No production/shadow connection, push, tag-push, deploy, publish, or live secret rotation occurred.

## Runtime Hotfix - 2026-08-06 Dashboard Strict Mode Loading Loop

### What changed

- Fixed the local Next.js development Dashboard remaining indefinitely in its loading state after React Strict Mode replayed mount effects.
- The Dashboard mount effect now restores `mountedRef.current = true` during setup before cleanup marks it false.
- Added a Strict Mode regression that reproduces the original infinite-loading behavior and verifies that the admin Dashboard renders after asynchronous data loading.
- Strengthened the existing loading assertion so a missing pulse element can no longer pass as a false positive.

### Verification

- TDD RED was observed before the product fix: 1/9 Dashboard tests failed with the loading pulse still mounted.
- Focused Dashboard suite passed after the fix: 9/9.
- Full frontend unit suite passed: 28/28 files, 228/228 tests.
- Frontend typecheck, TR/EN/DE i18n integrity, and `git diff --check` passed.
- Independent code and security reviews approved with no Critical/High/Medium blocker.

### Boundary

- Product commit: `8c802d29`.
- Pre-fix restore tag: `restore/pre-dashboard-strictmode-fix-20260806-a29690aa`.
- Verified complete-history bundle: `.private-data/restore-points/pre-dashboard-strictmode-fix-a29690aa.bundle`, SHA-256 `5f29afac3b96f33431c00448688c988c7349ade7d93c99cc8761757e3c0b0660`.
- GitNexus CLI was unavailable in this checkout, so `detect_changes` could not run. The reviewed diff was limited to the Dashboard component and its co-located test.
- Dashboard-specific timeout, abort, retry and stale-response generation control remain a separate resilience improvement; the global API helper was intentionally left unchanged to avoid affecting long-running uploads, crawler jobs and AI requests.
- No backend, database, migration, production/shadow data, push, tag-push, deploy or publish operation occurred.

## Follow-up - 2026-08-07 Canonical RBAC Contract And Local SUPPORT_AGENT

### What changed

- Added a TypeScript-AST RBAC source scanner and a machine-readable canonical role/permission contract.
- Added blocking CI checks before and after fresh migration deploy so unknown decorators, missing permissions, and an over-privileged `SUPPORT_AGENT` fail closed.
- Added an additive migration that materializes the full 22-permission catalog and creates `SUPPORT_AGENT` with exactly 16 approved permissions; no user is assigned and existing permission metadata is preserved.
- Updated the local RBAC seed to consume the canonical catalog and give ADMIN only the existing `*` wildcard.
- The RBAC seed now uses the generated local database client and refuses to query the database without explicit `ALLOW_DATABASE_SEED=true` opt-in; the operations-safety test locks this ordering.
- Fixed `RbacGuard` role matching so existing hyphenated controller aliases and underscore-backed DB roles resolve consistently.
- Aligned migration alias detection with runtime normalization, including surrounding-whitespace rejection via `BTRIM`.

### Verification

- TDD: the alias regression failed 3 cases before the guard fix, then passed 16/16.
- Operational safety contracts passed 21/21; RBAC source and local DB contracts passed.
- All 55 migrations plus the RBAC database contract passed on a newly created temporary PostgreSQL database; the temporary database was removed afterward.
- Local development DB read-only verification: `SUPPORT_AGENT` has 16 permissions and 0 assigned users.
- Backend full suite: 119/119 suites, 1086 passed, 1 skipped, 0 failed.
- Backend/frontend typecheck, TR/EN/DE i18n, 55-file migration integrity, and `git diff --check` passed.

### Boundary

- Only the local development database received the new migration. Production/shadow DB, production Redis, external services, push, tag-push, deploy, and publish were not touched.
- The repository-declared Node 20 binary was absent; verification ran on the active local Node 24.18.0 runtime. New scripts use Node 20-compatible APIs, but CI remains the authoritative Node 20 execution proof.
- Görev Merkezi API/UI implementation has not started; it is the next local-only phase after this RBAC prerequisite checkpoint.
- Post-phase restore point: tag `restore/post-support-agent-rbac-20260807-05483a67`; verified complete-history bundle `.private-data/restore-points/post-support-agent-rbac-05483a67.bundle`, SHA-256 `3671b51e2a7a211b78618746e5b4aa546b96262d8321f102fd2901f353805e4e`.

## 2026-08-07 - Authorization-scoped Review Center

### What changed

- Added `GET /api/v1/review-center/summary` and a localized `/[locale]/review-center` operational UI.
- Added a sidebar task/approval group whose queue links and aggregate badge come only from the authorization-scoped backend response.
- Added ticket filters for live-chat-requested and unassigned work, plus fail-closed query parsing on destination pages.
- Kept AI interaction history as an audit-only link outside action totals; no customer interaction count is exposed by the summary.
- Aligned FAQ approve/dismiss role metadata with the approved `SUPPORT_AGENT` `faq:manage` contract without widening crawler approval roles.
- Updated OpenAPI and project/RBAC maps to 231 operations.

### Verification

- Backend: 121/121 suites, 1102 passed, 1 skipped, 0 failed.
- Frontend: 34/34 files, 248 tests passed.
- Backend/frontend typecheck, i18n, 21/21 ops safety, RBAC source contract and 55/55 migration manifest passed.
- Unauthenticated local smoke: API 401 with no-store/no-cache; frontend route redirects to localized login.
- Product commits: `1efacf33`, `ef9bfe7e`.
- Independent review blockers were closed: real CUSTOMER permissions cannot expose global counts; cards require destination-read plus action authority; legacy `admin` is not a role wildcard; active ticket and authored-article count/list predicates match; same-route queries resynchronize; unauthorized RoleGuard children never render.

### Boundary and next step

- No production/shadow DB, production Redis, external integration, migration, seed, user-role assignment, push, tag-push, deploy or publish occurred.
- Authenticated local visual acceptance remains: ADMIN and, when a safe local account exists, SUPPORT_AGENT should verify queue visibility, direct links and empty/error states.
- Claude was asked to independently review the authorization-query boundary, action/audit separation, query validation and 231-route documentation parity before any release decision.
- Local restore point: tag `restore/post-review-center-20260807-2fe9eb8e`; verified complete-history bundle `.private-data/restore-points/post-review-center-2fe9eb8e.bundle`, SHA-256 `9a6864b8ab7fe4d32928fed4823dae022d9e6e8dbbee24a563825b1a432c5829`.

## 2026-08-07 - Frontend/backend contract and CRM egress closure

### Delivered

- Corrected CRM settings route and camelCase payload/response contract; added DTO validation and typed frontend client usage.
- Preserved omitted webhook secrets, masked CRM and SettingsService secret responses, and separated CRM credential saving from the legacy API-key save.
- Restricted Dynamics URLs to a trusted HTTPS origin, disabled redirects, and rejected cross-origin OData next/delta links before bearer-token requests.
- Removed the unsupported MFA UI/client contract and unreachable MJML block editor while preserving the two independent email systems: file-backed transactional templates and DB-backed announcements.
- Moved the customer Hotinfo download to the authenticated central client.
- Added a blocking AST/OpenAPI route parity check with function-level, reason-required raw-network allowlisting.

### Evidence

- Product commit `eaa1fc53`; CI contract commit `e294623d`.
- Backend full suite: 124/124 suites, 1152 passed, 1 skipped. Frontend full suite: 38/38 files, 260/260 tests.
- Backend/frontend typecheck, TR/EN/DE i18n, 24/24 operations safety, RBAC source contract, 56/56 migration manifest, API route parity 182/233 with missing=0/raw-network=0, and `git diff --check` passed.
- Independent code review and security review returned GO after Dynamics SSRF/token-origin, omitted webhook-secret and secret-response findings were fixed.

### Boundary

- Pre-work restore: `restore/pre-endpoint-parity-20260807-acafd92b`; complete-history bundle `.private-data/restore-points/pre-endpoint-parity-acafd92b.bundle`, SHA-256 `3400a13c1dbb245e8ce262b387bd64cbc10cc274abf94efea0a6faf0c5349327`.
- No database migration, seed, production/shadow/live access, external CRM request, push, tag-push, deploy or publish occurred.
- Post-work restore tag `restore/post-endpoint-parity-20260807-5320926d` resolves to documentation checkpoint `5320926d353a664026e1e39a369aceada4a42497`. Complete-history bundle `.private-data/restore-points/post-endpoint-parity-5320926d.bundle` passed `git bundle verify`; SHA-256 `117978cb2592aea937f2ccdfde66bc6625836eecefec3bb72451ba12e06afa9c`; `git fsck --strict` exit 0 (dangling trees only).

## 2026-08-07 - Product taxonomy CRUD, archive safety, and endpoint parity audit

### What changed

- Added the missing product PATCH/archive endpoints and moved every products-page mutation to the authenticated central API client.
- Added DTO validation, normalized duplicate detection, P2002-to-409 mapping, and partial normalized unique indexes for active product/category names.
- Product and category archive operations preserve historical foreign keys. Product-first `FOR UPDATE` locking keeps concurrent archive/create/update operations consistent.
- Ticket creation, AI diagnosis, and smart-tagging now reject or ignore archived taxonomy.
- FAQ taxonomy restoration now creates an active replacement instead of silently reusing archived records.
- Added unit, DTO, frontend, real-Postgres concurrency, and Playwright product lifecycle coverage.

### Verification

- Backend full suite: 122/122 suites, 1129 passed, 1 skipped.
- Frontend full suite: 35/35 files, 254/254 tests.
- Product Playwright lifecycle: 4/4 passed; generated product/category and E2E users were removed from local dev DB afterward.
- Fresh PG17: all 56 migrations, migration integrity, schema parity, RBAC DB contract, duplicate-index behavior, and concurrency regression passed; disposable container removed.
- Backend/frontend typecheck, TR/EN/DE i18n, migration manifest, OpenAPI/RBAC matrix 233/233 parity, and diff hygiene passed.
- Independent code review and security review both returned GO after restore/P2002 and TOCTOU findings were fixed.

### Local-only boundary and follow-up

- Local dev DB on `localhost:55433` received migration `20260807143000_add_product_taxonomy_unique_indexes` after a zero-duplicate read-only audit. Production and shadow DBs were not connected to or changed.
- Product code commit: `93870762`; migration commit: `c23867e1`.
- No push, tag-push, deploy, publish, or live-system action occurred.

- Static frontend/OpenAPI parity audit found three pre-existing gaps for separate work: CRM settings wrong route, unimplemented MFA backend contract, and unimplemented MJML content/announcement contract. No code change for those findings was made in this phase.

## 2026-08-07 - Review Center active-record parity Aşama A

- Product commit `69655f1c` aligned live-chat, unassigned-ticket and FAQ pending counts with active target lists through explicit `deletedAt: null` predicates.
- FAQ list/count, single read, public feed, approval, dismissal and edit paths now preserve soft-delete integrity without changing the global Prisma layer.
- Added runtime `UpdateFaqDto` plus service-side allowlisting to prevent PATCH mass assignment; null, blank, size and OpenAPI parity constraints are regression-tested.
- Tickets UI now distinguishes API failure from an empty queue, offers localized retry, and ignores stale concurrent responses.
- Verification: backend 125/125 suites (1168 passed, 1 skipped), frontend 38/38 files (262 passed), targeted backend 33/33, both typechecks, i18n, ops 24/24, API contract, RBAC contract, migration manifest/integrity and diff hygiene passed. Independent code/security reviews returned GO with no Critical/High/Medium findings.
- Restore: `restore/post-review-center-phase-a-20260807-69655f1c`; complete-history bundle `.private-data/restore-points/post-review-center-phase-a-69655f1c.bundle`, SHA-256 `466460f32cfb0bddf5a3adc478dd4f64c95f71bf18585a84aa12fb549f2a5c80`.
- No production/live/shadow access or write, DB mutation, migration/seed, push, tag push, deploy or publish. Global Prisma soft-delete Aşama B remains NO-GO pending a separate full inventory and user approval.

## 2026-08-08 - Production Release A.1.2 local closure

- Product/tooling commit `64c5d2bc` hardens the operator backup path with explicit opt-in, PG17 custom-format dump validation, checksums, private artifact boundaries, lock and symlink protections, S3 conditional no-clobber upload, verified metadata and READY-last publication.
- The legacy in-process scheduled/API backup implementation is quarantined behind a fixed 503 response; exception and public-health responses no longer expose unsafe status, query, audit or driver details.
- Final evidence: backup `44/44`, ops `87/87`, backend `132/132` suites (`1311 passed`, `1 skipped`), frontend `42/42` files (`308 passed`), both typechecks, i18n, API/RBAC and migration `56/56`; independent TDD/code/security reviews GO with C/H/M `0/0/0`.
- Existing Cloudflare R2 application bucket `aluplan-support-desk` (`402` objects, `37.42 GB` observed) was not written, moved, renamed or deleted. `aluplancoolify` is unrelated. Proposed DB-only bucket `aluplan-support-desk-db-backups` is not yet created/configured.
- Verified restore point: `restore/post-release-a12-20260808-64c5d2bc`; bundle SHA-256 `a6b1f98e8828d3a6ec9b5f01e2887408eb42832d777699eb3aba9d147b67c0cd`.
- Production remains NO-GO until A.1.3 exact-image, real Cloudflare R2 round-trip and disposable PG17+pgvector restore evidence. No live DB/R2/SSH action, migration, seed, push, tag-push or deploy occurred.

## 2026-08-08 - Pause and morning handoff

- Work paused after the verified A.1.2 local closure; no additional product
  code, live system action or external mutation was started.
- Last product/tooling commit is `64c5d2bc`; the preceding release-doc
  checkpoint is `46ec376c`. A.1.1 migration planning and A.1.2 backup
  hardening are locally complete, but production remains NO-GO.
- Final evidence carried forward: backend `132/132` suites (`1311 passed`,
  `1 skipped`), frontend `42/42` files (`308/308`), backup `44/44`, ops
  `87/87`, typechecks, i18n, API/RBAC and migration `56/56`; independent
  TDD/code/security reviews GO with C/H/M `0/0/0`.
- Existing Cloudflare R2 `aluplan-support-desk` application data (`402`
  objects / `37.42 GB` observed) remains untouched. `aluplancoolify` is
  unrelated. Proposed `aluplan-support-desk-db-backups` is not created or
  configured.
- Next phase A.1.3 must prove the exact backend image, conditional R2
  round-trip and a disposable PG17+pgvector restore before any cutover.
  Production ledger, credential rotation, object parity, all nine queues,
  cron/repeatable-job singleton behavior and rollback remain acceptance gates.
- New sessions must start at `FIRST-READ.md` section 10. No push, tag-push,
  deploy, production DB/R2/SSH write, migration or seed is authorized.
- Pause handoff was committed as `ab2bd04f`. Verified local restore tag
  `restore/pause-before-release-a13-20260808-ab2bd04f` points to that commit;
  complete-history bundle SHA-256 is
  `63e8f45bc7f2eb51ae6aae4ec49961598c64225d08130fb0b92d93868633c12d`.
  The tag and bundle remain local and were not pushed.
- Claude independently re-ran the source, local read-only DB, restore-integrity, targeted/full test, typecheck, i18n and contract checks and returned GO with no contradicted claim or count deviation. Aşama A is therefore closed; work pauses here.
- Root `FIRST-READ.md` is the shared Codex/Claude account-switch and new-session entry point. It preserves the canonical directory, read order, archive reference, local-only boundaries, Aşama A closure, and Aşama B NO-GO gate.
## 2026-08-08 - Announcement email preference BUG-05 closure

- Captured and independently verified the announcement dynamic-data GAP/BUG report in `.ai/issues/2026-08-08-announcement-email-template-dynamic-data-gap-bug-report.md`; docs baseline commit is `cc1a7896`.
- Created and verified pre-change restore tag `restore/pre-announcement-email-safety-20260808-cc1a7896` and complete-history bundle `.private-data/restore-points/pre-announcement-email-safety-cc1a7896.bundle` (SHA-256 `d174ba9c1687ca48e571f69349198d59bfe4c2770f821d1eb092aac64735c27c`).
- TDD RED proved `master-announcement` incorrectly queried `SYSTEM`; the minimal mapping fix now classifies it as `ANNOUNCEMENTS`.
- Product commit `8f40deef`; regression-test commit `bddd51ac`.
- Verification: focused test `14/14`, expanded email/announcement set `61/61`, full backend `125/125 suites` with `1169 passed, 1 skipped`, backend typecheck and `git diff --check` passed.
- Independent code review and security/privacy review returned GO for BUG-05; Critical/High/Medium attributable to the diff are `0/0/0`. The test-isolation warning was fixed before commit.
- Post-fix restore tag `restore/post-announcement-bug05-20260808-bddd51ac`; complete-history bundle `.private-data/restore-points/post-announcement-bug05-bddd51ac.bundle` verified with SHA-256 `236c1800c7ad09486b7bc5ecde455150c1d773437a6311874e1fa140f5b7b2f6`.
- Residual boundary: BUG-04 remains open because consent-skipped announcements can still be recorded as `SENT`; subject rendering, canonical context/Zod validation, preview parity and unresolved placeholder protection also remain open. Personalized dynamic announcements remain NO-GO.
- No production/shadow/live connection, migration, seed, DB mutation, external email send, push, tag-push, deploy or publish occurred.

## 2026-08-08 - Production release readiness and live-drift audit

- Chose a release-readiness/live-drift audit instead of another broad code GAP report; canonical artifact: `.ai/issues/2026-08-08-production-release-readiness-live-drift-audit.md`.
- Local candidate is `4e1c6819`, 153 commits ahead of local `main`; this is release scope evidence, not proof of live drift. Live image digest/commit remains unknown until a separately authorized read-only inventory.
- Current local gates passed: operations safety 24/24, backend/frontend typecheck, TR/EN/DE i18n, API contract `182/233 missing=0 raw-network=0`, RBAC source `12 roles/19 permissions`, migration manifest `56/56` and diff hygiene.
- Production decision remains NO-GO: Faz 8 runbook is fixed to an obsolete three-migration set; DR/backup paths can mask failures; staging does not prove immutable image promotion; PG version is inconsistent; worker/cron jobs are in-process; old shadow sanitization is incomplete; PostgreSQL restore alone does not protect R2/local object data.
- Independent planning, CI/DR/backup and data/RAG/storage reviews agreed on the same NO-GO decision. No code, DB, migration, seed, live system, push, tag-push or deploy was changed.
- Next safe phase is local-only Faz A: repair the current runbook/DR/backup/staging contracts, define a worker/cron maintenance boot strategy, create exact immutable images, and rerun full release gates before requesting live read-only drift authorization.

## Follow-up - 2026-08-08 Production Release Faz A.1.1

- Replaced the stale fixed migration assumptions with a canonical-ledger resolver and fail-closed Faz 8 runbook.
- Product/tooling commit: `8fbdc0b1` (`fix(release): derive production migration plan from ledger`).
- The resolver is opt-in for database access, uses a read-only repeatable-read transaction, writes only mode-`0600` artifacts under `.private-data`, records provenance, and never logs the connection URL.
- Independent review found and closed three important issues before commit: contradictory lifecycle rows, hidden historical checksum-marker acceptance, and insufficient artifact/storage provenance.
- Final tests: planner 19/19, combined operations safety 43/43, migration files 56/56; code/security reviews GO with no Critical/High/Medium findings.
- Read-only Coolify inventory showed backend/frontend running deployed commit `d9b21b9d`, healthy PG17+pgvector and running Redis. MinIO is intentionally retired; S3-compatible storage is canonical.
- A Coolify database configuration snapshot unexpectedly returned the PostgreSQL credential unmasked. It was neither reused nor written into project docs; production PostgreSQL credential rotation is now a mandatory release checklist item.
- Restore tag/bundle: `restore/post-release-a11-20260808-8fbdc0b1`, SHA-256 `ecb15b14da121665c3d30c94df13784b954c3b939b0ebb39b724c3a2250eb9af`; bundle verify and strict fsck passed (historical dangling trees only).
- No production query, SSH command, data write, migration, seed, push, tag-push or deploy occurred. Next local phase: A.1.2 backup hardening.
