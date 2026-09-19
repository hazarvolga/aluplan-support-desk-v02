# Current Focus

## Non-root backend source prepared — 2026-09-19

Final combined regression68/68 passes; independent review approves source-only checkpoint. Prior fixture formatting is retained in a separate style commit. Next exact-image build/runtime acceptance, not production deployment.

Minimal Dockerfile USER node/HOME change with narrow writable uploads/OpenAPI/template screens only; conditional template bases preserve fallback.5/5 source contract tests pass; exact image/runtime NOT yet proved. No migration/boot changes. Existing uploads mounts/custom paths, backup operator directory, Prisma/Chromium and persistence need isolated artifact checks. Prior fixture whitespace diff remains untouched. See source-consolidation report; no live/push/deploy authority.

## Stabilization scope frozen — 2026-09-19

Wire-level local client acceptance completed:10/10 opt-in tests pass with real SMTP/IMAP libraries, valid/invalid certificates and no plaintext AUTH; TypeScript0 diagnostics. This is local Node24/macOS loopback evidence, not production Node20/Linux DMS acceptance. See mail transport report. Next bounded step: backend non-root runtime and exact-image isolated rehearsal; do not start live TLS changes on this evidence alone.

Owner deferred customer feature requests. Only demonstrated release-blocking security, compatibility and data-preservation work belongs in this candidate. Fresh local checks:56/56 migration manifest integrity and63/63 A13 safety contracts pass (fake Docker, not restore proof). Docker accessible with no running containers; cached hardened backend is arm64 without a revision label, not the current candidate. Exact backend Dockerfile still defaults to root and boot still applies migrations. See source-consolidation report's updated gate matrix. No production or database access authorized/performed; no containers started or removed. Next complete wire-level TLS acceptance, then bounded non-root/exact-image and isolated data-preserving runtime rehearsal.

## Local strict mail-client patch — 2026-09-19

Final verification: four focused suites /29 tests pass; backend plus new tests TypeScript no-emit0 diagnostics through isolated dependency resolution. Independent code/security review approved local patch only. No full-release build, real TLS handshake or production acceptance claimed.

SMTP now requires TLS and valid certificates; IMAP requires direct TLS, rejects disabled TLS before credentials/network, and reports errors through existing public contracts.13 mocked transport tests pass after RED proof; actual release source tested with isolated existing dependencies and network denied. No live changes, migration, new env or provider switch. See existing mail transport report for evidence and compatibility warning: current documented live TLS-off endpoints cannot accept this candidate. Next isolated wire-level TLS acceptance and separately scoped certificate/image/renewal inventory; no push/deploy authority.

## Local mail TLS maintenance plan prepared — 2026-09-19

See the top plan section in `issues/2026-09-19-mail-transport-observation.md`. Local SMTP/IMAP both bypass certificate validation; SMTP does not require STARTTLS. No source fix or live change performed this turn. Plan preserves SMTP587, moves IMAP to993 only in coordinated approved maintenance, retains image/volumes, and requires certificate renewal, private off-host recovery, TLS and controlled delivery acceptance. Next: isolated client regression/patch and separately approved read-only certificate/image/renewal inventory. No certificate issuance, DNS edit, restart, settings write, push or deploy authorization.

## Mail file-backup gate completed — 2026-09-19

Owner-approved root-only on-host backup `/var/backups/aluplan-mail-20260919-wvS1G5/mail-backup.tgz` includes mail-data/state/config plusCompose/env. gzip/archivecompare/SHA256 and separate extracted persistentfile comparison passed;31transientsockets excluded. Livecopy notatomic, nooffhostcopy or service-restoreproof. Runtime unchanged; noTLS/restart/deploy/DBwrites. EffectiveSMTP/IMAP TLSoff independently confirmed. Existingmailtransport report holds evidence and limits. Next localTLSmaintenance plan, not livechanges; newauthority required for remediation.

## Mail target correlated, transport prerequisite confirmed — 2026-09-19

Owner screenshot:SMTP587directTLSoff/IMAP143TLSoff atmail.allplan.net.tr. FreshDNS A matchesVPS,MXpoints there; IMAP143CAPABILITY lacksSTARTTLS and advertisesPLAIN/LOGIN. Noauth/messages/datachanges. Browser in owneruse; effectiveTLS/cert and mailbackup checks incomplete. See existing mailtransport report. Next management read-only certificate/backup readiness, then separatelyapproved mailTLSmaintenance; do not deploy strictclientTLS first.

## Mail endpoint compatibility gate — 2026-09-19

Read-only Firefox Coolify inspection confirms Docker Mailserver service; external587 advertisesAUTH withoutSTARTTLS,993refused. App actualtarget not yet correlated, so no plaintext-app claim. Do not deploy strictTLS until actual mailtarget/certificate compatibility verified. See issues/2026-09-19-mail-transport-observation.md. No livechanges/credentials/mail sent/restart/deploy. Next narrowly inspect nonsecret app mail host/port/TLS settings and service runtime; any server remediation needs separate change approval.

## Canonical-history source consolidated — 2026-09-19

Active next-release worktree is `aluplan-release-candidate-20260919` on `security/release-candidate-20260919`. See `issues/2026-09-19-source-consolidation.md`. All885candidate source bytes match,279canonical-only entries preserved. Fresh source-equivalent isolated backend149/1728+frontend47/327 and both typechecks passed; new-worktree/runtime-image acceptance remains untested. Original dirty checkout unchanged. Next bounded runtime/mail TLS hardening, verified mail ingress and isolated data-preserving acceptance. No live/push/deploy authority.

## Active Work

- 2026-08-08 production release readiness preparation is active and **NO-GO**:
  - Canonical audit: `.ai/issues/2026-08-08-production-release-readiness-live-drift-audit.md`.
  - This is not another general code GAP pass; it separates exact local release evidence from live read-only drift, backup/restore, R2, Redis/BullMQ, RAG and rollback acceptance.
  - Audit start baseline was clean at local HEAD `4e1c6819`; ops-safety 24/24, both typechecks, TR/EN/DE i18n, API contract `182/233 missing=0 raw-network=0`, RBAC `12/19` and migration manifest `56/56` passed without package downloads.
  - Release blockers: stale three-migration Faz 8 runbook, fail-open/false-positive DR and backup paths, PG16/PG17 drift, missing exact-image staging/rollback proof, in-process worker/cron overlap risk, unsafe old shadow snapshot, and missing DB↔R2/local-object parity.
  - First authorized work is local-only Faz A: update the runbook and fail-closed release/DR/backup/staging/worker controls. Production/shadow access, migration/seed, push, tag-push and deploy remain forbidden until separately approved.

- 2026-08-08 help-center i18n fix `313e5b47` received independent Codex **GO**:
  - Scope is limited to `messages/{tr,en,de}.json` plus the real-catalog render regression test; no backend, DB, migration, queue or production code changed.
  - All 11 affected admin help components render against all three real catalogs without leaking raw `help.docs.admin.*` keys: 33/33 focused; full frontend 40/40 files and 299/299 tests; frontend typecheck and i18n integrity passed.
  - Independent leaf-key accounting corrects the historical report from 188 to **193 newly added keys per locale**. All 193 are used; the 11 components call 218 unique keys in total and 25 already existed.
  - Pre/post restore bundles and reported SHA-256 values were independently verified. Local frontend/backend dev servers are running on ports 3000/4000; no push, deploy or live access occurred.

- 2026-08-08 announcement email final local closure is complete at product commit `117526b1`:
  - §16's parameterless block, webhook-before-cron status mapping, and >200 starvation blockers are closed.
  - Additional code/security review findings for `@root/@data`, helper arity, partial/decorator AST bypass, and select/update TOCTOU were fixed in the same TDD phase.
  - Final local evidence: backend 130/130 suites (1305 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n/ops/API/RBAC/migration gates, code review and security review all GO.
  - Pre/post restore bundles are verified; product code, tests, and documentation are separated. Claude independent review of `117526b1` is the next requested action.
  - No push, tag-push, deploy, production/shadow access, migration/seed, or live announcement send is authorized.

- 2026-08-08 Claude Phase 4 (`edae3067`) independent Codex verification is complete with **general NO-GO**:
  - Retry-finalization and customer response field minimization are genuinely closed; direct unknown-variable/hash/subexpression and malformed-template guards also work.
  - Remaining HIGH: Handlebars `BlockStatement.path` is not inspected, so parameterless unknown helpers/paths pass and silently render empty.
  - Remaining HIGH: if the provider webhook changes EmailLog to DELIVERED/BOUNCED before reconciliation, a linked AnnouncementLog still in QUEUED is never transitioned.
  - Remaining MEDIUM: both `take:200` reconciliation scans lack cursor/progress or DB-side outcome filtering and can starve rows beyond the first unchanged batch.
  - Independent evidence: backend 130/130 suites (1264 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n/ops/API/RBAC/migration gates and restore hashes passed.
  - Next authorized implementation is a narrow TDD fix for block-path validation, complete QUEUED outcome mapping and starvation-safe batching. Personalized/dynamic announcements, push, deploy and live work remain NO-GO.

- 2026-08-08 announcement email phases §10-13 received an independent Codex review:
  - `d8f42c6d` BUG-02 customer-field parity is GO in its narrow scope; `e4c2ddc8` content-format exposure is additive and GO with non-blocking detector/API-documentation caveats.
  - `df724734` is NO-GO because the Handlebars visitor is not a complete fail-closed allowlist and `AnnouncementEmailSchema` is not enforced at runtime.
  - `f4668592` is NO-GO because reconciliation can terminalize a transient retry failure, misses DELIVERED/BOUNCED webhook outcomes, and exposes internal `emailLogId/error` fields through the customer announcement response.
  - Independent local gates passed: backend 129/129 suites (1230 passed, 1 skipped), frontend 39/39 files (266 passed), both typechecks, i18n, ops-safety 24/24, API/RBAC/migration contracts, restore bundle hashes/verification, and diff hygiene.
  - Personalized/dynamic announcement sending remains NO-GO. Next authorized implementation must be a separate TDD phase for a complete Handlebars grammar allowlist/runtime schema plus retry-aware delivery reconciliation and customer response DTO minimization. No push/deploy/live work.

- 2026-08-08 announcement email safety BUG-05 is closed locally:
  - Modern `master-announcement` messages now use the `ANNOUNCEMENTS` preference category instead of the `SYSTEM` fallback.
  - A behavioral regression test proves that a registered recipient with `ANNOUNCEMENTS=false` produces neither a BullMQ job nor an `EmailLog` row.
  - Product commit `8f40deef`; test commit `bddd51ac`; focused email/announcement tests `61/61`, full backend suite `125/125` with `1169 passed, 1 skipped`, backend typecheck and diff hygiene passed.
  - Independent code and security reviews returned GO for BUG-05. The separate BUG-04 status/log-linkage defect and the personalization/subject/context/placeholder gaps remain open, so personalized dynamic announcements remain NO-GO.
  - Post-fix restore tag `restore/post-announcement-bug05-20260808-bddd51ac`; verified complete-history bundle SHA-256 `236c1800c7ad09486b7bc5ecde455150c1d773437a6311874e1fa140f5b7b2f6`.
- 2026-08-07 Review Center active-record parity Aşama A is independently closed:
  - Product commit `69655f1c` and restore bundle SHA-256 `466460f32cfb0bddf5a3adc478dd4f64c95f71bf18585a84aa12fb549f2a5c80` received Codex code/security GO and a separate Claude GO.
  - Independent local DB checks confirmed live-chat card/list `0/0` and FAQ candidate card/list `20/20`; all reported test, typecheck, i18n, contract, migration-manifest, and restore-integrity evidence matched without deviation.
  - Aşama A is complete. Global Prisma Proxy/middleware Aşama B remains NO-GO and must not start without a separate inventory, plan, restore point, and explicit user approval.
  - 2026-08-08 user sequencing decision: do not start Aşama B immediately. First complete the next few approved local product improvements; then return to Aşama B as a separate read-only inventory/plan, followed by its own restore point and explicit GO before any implementation.
  - Work is intentionally paused after documentation closure. Push, tag-push, deploy, production/shadow access, migration/seed, and live-data changes remain forbidden.
- 2026-08-07 product taxonomy management is complete locally:
  - `/products` create/update/archive and category create/update/archive now use the authenticated central API client and report non-2xx responses without false success.
  - Backend mutations use validated DTOs, role guards, UUID parsing, normalized duplicate checks, partial unique indexes, and product-first row locking inside transactions.
  - Product/category removal is soft archive; existing ticket/AI/knowledge history is retained. New ticket and AI classification paths accept only active, nondeleted taxonomy.
  - Local PG17 fresh migration, local dev migration, unit/integration/E2E, typecheck, i18n, OpenAPI/RBAC parity, and independent code/security review passed. No production/shadow connection, push, or deploy occurred.
  - Follow-up endpoint-parity audit found three separate pre-existing frontend/backend contract gaps: CRM settings calls nonexistent `/crm/connections/upsert` instead of existing `POST /crm/connections`; profile MFA UI calls four nonexistent backend routes; MJML editor calls nonexistent content/announcement routes and also bypasses the central API client. These are documented only and require separate implementation decisions.
- 2026-08-07 local RBAC/Görev Merkezi prerequisite completed:
  - `packages/database/prisma/rbac-canonical.json` is the machine-readable catalog for controller roles, permissions, and the exact least-privilege `SUPPORT_AGENT` boundary.
  - Migration `20260807090000_add_support_agent_rbac_contract` additively materializes the full 22-permission catalog and creates `SUPPORT_AGENT` with exactly 16 approved permissions; it assigns no users and removes no existing permission metadata.
  - Source and database RBAC contract checks are blocking CI gates. A clean temporary PostgreSQL database passed all 55 migrations and the RBAC database contract.
  - `RbacGuard` now normalizes case plus hyphen/underscore role aliases, matching existing controller literals such as `support-manager` to canonical DB roles such as `SUPPORT_MANAGER`.
  - The local development database has `SUPPORT_AGENT` with 16 permissions and 0 assigned users. Do not assign real users or apply this migration to production without a separately approved rollout.
  - Next product phase is the local-only Görev Merkezi backend summary contract, followed by the sidebar/UI surface and local E2E verification.
- 2026-08-05 prod shadow data safety baseline:
  - Binding rule: all production-data work is one-way `prod -> local`, read-only from production. Never point local `DATABASE_URL` at production IP `167.86.84.107`; never run `prisma migrate deploy/reset/resolve` against production.
  - A read-only production PostgreSQL dump was taken from Coolify database container `lwk8ok04ocg4w4soog0c888g` (`pgvector/pgvector:pg17`), database `aluplan_support`.
  - Raw dump is local-only and git-ignored: `.private-data/prod-dumps/aluplan-support-prod-20260805-193338-pg17.dump`, size `132 MB`, SHA-256 `d12371d0b316fdab1e811fa658a0ca890968596c53d02d3b845cc709679d56da`.
  - Local shadow restore is complete in separate Docker container `aluplan_shadow_postgres_pg17` on `localhost:55432`; existing local `aluplan_postgres` was not overwritten.
  - Shadow env is local-only: `.private-data/shadow/shadow-postgres.env` with `SHADOW_DATABASE_URL`.
  - Shadow DB sanitization is **partial**: CRM connections are inactive, CRM/webhook secrets are removed, and user refresh-token hashes are removed. Faz 7 re-verification found 14 non-empty rows with `settings.is_secret=true` in the supposedly sanitized snapshot. Do not start the app against this shadow or treat it as secret-free until a clone-only sanitizer empties those values and a new dump is created. The existing dump/env remain local-only, mode `600`, and git-ignored.
  - Sanitized reusable snapshot exists locally: `.private-data/prod-dumps/aluplan-support-shadow-sanitized-20260805-194053-pg17.dump`, SHA-256 `2e5f7e09a7e4ffbf61787f978a4a401527be46eae4895a5d7ba26c39ef5d770b`.
  - Prisma read-only status against the shadow DB passed: `DATABASE_URL="$SHADOW_DATABASE_URL" pnpm exec prisma migrate status --config packages/database/prisma.config.js` -> `Database schema is up to date!`.
  - Redis was intentionally not copied from production. Keep local Redis empty/ephemeral to avoid replaying live BullMQ jobs, sessions, cache, OAuth state, or throttle counters.
  - Security cleanup still recommended: remove temporary SSH key line matching `aluplan-codex-dump-20260805` from `/root/.ssh/authorized_keys` on the VPS after no further backup access is needed.
  - Next safe GAP target remains local-only: use shadow DB for BULGU-02/BULGU-18 auth-token negative tests and BULGU-10 migration-history inspection. No live DB writes.
- 2026-08-06 Faz 7 schema parity is complete locally in technical commit `612706c1`:
  - Fresh PG17 and a restored production-shadow clone now converge on the same Prisma schema, with only the explicitly allowlisted externally managed partial FAQ embedding index remaining.
  - The additive parity migration contains no DROP/DML, has lock and statement timeouts, and preserves all 61 business-table/sequence fingerprints on the restored clone.
  - Full backend tests pass: 116/116 suites, 1020 passed, 1 skipped. Final code, database, and security reviews approve the local commit.
  - Production still has both the foundation and parity migrations pending. Faz 8 remains maintenance-window-only and requires explicit user approval; no production connection, migration, deploy, or push occurred.
- 2026-08-06 code-intelligence tooling boundary:
  - Graphify 0.9.30 was refreshed locally over 835 code files: 7,338 nodes, 14,249 edges, 614 communities. SQL structural coverage is incomplete because `tree_sitter_sql` is not installed.
  - GitNexus is not currently installed and no local `~/.gitnexus` index exists. Historical index counts in AGENTS.md are stale evidence only.
  - Do not install or run current GitNexus for this commercial product until a commercial-use license/right is confirmed; upstream package 1.6.9 is PolyForm Noncommercial 1.0.0.
- 2026-08-05 consolidation follow-up:
  - Active repo is now the git-tracked single working directory at `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-support-desk-v02-main-live-site`.
  - `b73ae3f7` recorded the local consolidation baseline; push remains forbidden without explicit user approval.
  - BULGU-23 backend direct-console cleanup is complete locally: CLI/diagnostic helper output uses Nest `Logger` via `createCliLogger(...)`, direct `console.*(` calls under `apps/backend/src` scan clean, backend lint/typecheck and `git diff --check` pass.
  - Next safe local technical target is BULGU-11/Faz 3.4 PBT flakiness stabilization for `ai-pipeline-optimization.pbt.spec.ts`.
- Ticket filter hardening completed locally:
  - tickets page filters now use explicit status chips plus scope and submit-based search instead of the previous status dropdown/fake metric cards.
  - backend list API supports `search` and `includeStatusCounts`; status counters respect scope/search while ignoring only the active status filter.
  - `DRAFT` is now included in the frontend status model and `tr/en/de` translations, closing the production `tickets.status.DRAFT` missing-message class.
  - frontend hides status counters when `statusCounts` is absent, avoiding misleading zeroes during backend/frontend deploy skew.
  - targeted backend/frontend tests, backend/frontend typecheck, i18n check, and `git diff --check` passed on 2026-06-30.
  - deploy order: backend first, then frontend; monitor ticket list API latency after deploy because relation-aware search is production-data dependent.
- SupportAnswerOrchestrator parity fix completed locally:
  - live SUP-00136 showed customer ticket-opening AI returning `NO_MATCH` before synthesis while admin ANN could draft a useful answer from the same intent.
  - the retrieval-context acceptance decision now lives in `SupportAnswerOrchestrator.shouldGenerateFromRetrievedContext(...)` instead of being a raw threshold `if` inside customer `AiQueryService`.
  - customer query and stream query both use the orchestrator decision, including effective threshold, result count, audience, and visual-evidence allowance.
  - regression coverage protects threshold-edge synthesis for the 3B grid/Axis Grid style case with `topScore=0.8034`.
  - `allplan-help/` is ignored locally so the raw official help mirror cannot be committed accidentally.
- Operations dashboard implementation is complete and local-only until the user chooses to deploy:
  - Phase 1 backend aggregate endpoint added at `GET /dashboard/ops`.
  - Endpoint returns real DB/queue-backed operations data for active tickets, SLA pressure, AI quality/cost estimates, CRM changes, knowledge/crawler state, system health, live feed, and trend series.
  - AI cost data is intentionally visible only to admin/superuser roles; support agents receive `cost: null`.
  - Empty trend series are deterministic zero-value series, not decorative fake data.
  - Phase 2 frontend shell now consumes the aggregate endpoint for admin/staff dashboards while preserving the customer dashboard path.
  - The new shell includes top live-cost/system drawers, KPI cards, operations pulse cards, active support desk, action queue, live feed, and tabbed operations workspace.
  - Dashboard i18n coverage is complete for Turkish, English, and German.
  - Layout is mobile-first: KPI and pulse cards stack on small screens, the live ops column drops below the header, and fixed-height panels use internal scroll instead of page overflow.
  - Phase 3 made pulse cards actionable: each pulse opens a responsive real-data modal with larger trend chart, linked records, and operational action links.
  - Live modal follow-up is in progress:
    - modal segment controls are no longer decorative; ticket, AI, CRM, and Knowledge pulse modals read real `pulse.details` segments from the backend.
    - empty modal filter slices now stay empty instead of falling back to unrelated generic records.
    - CRM modal records suppress raw CRM payload snippets, group field-level Dynamics changes by local customer/account, and link contacts through `User.id` so customer detail routes resolve.
    - frontend tests now cover that selecting a modal segment changes the displayed records.
    - Operations Workspace now keeps Overview, CRM, Knowledge Pool, and LearnNow only; the redundant AI Health tab was removed from that panel.
    - CRM, Knowledge Pool, and LearnNow workspace tabs use mockup-style decision panels plus linked record lists backed by real ops data.
    - modal segment controls now show per-segment record counts and use the backend-provided decision text for the selected slice, so empty filters such as failed imports are visibly empty rather than appearing inert.
  - Phase 4 added controlled refresh: manual refresh plus 60-second background polling for staff/admin dashboards, with visible last-updated state and no customer-side polling.
  - Phase 5 final verification passed backend tests/typecheck, frontend typecheck/build, dashboard unit tests, i18n check, and diff hygiene.
  - Deployment should include both services: backend first for the new endpoint, then frontend for the new UI.
- Live bug closure pass in progress:
  - AI answer quality hotfix now treats localized no-knowledge text as `NO_MATCH`, repairs mixed-language LLM answers, and gives crash/freeze queries a safe LOW-confidence triage instead of an unrelated source-backed no-answer.
  - static backend routes are guarded against dynamic `:id` shadowing for team skills/agents and ticket by-number/bulk endpoints.
  - user/customer/CRM email writes now normalize to lowercase and legacy mixed-case matches are resolved case-insensitively.
  - customer list search no longer hides backend CRM account-name matches with a second client-side global filter.
  - SLA stats now return priority buckets for the dashboard distribution cards.
  - deterministic AI fallback refuses BIMPLUS storage answers from unrelated license/home-office evidence.
- Customer ANN-quality synthesis now replaces the quick-answer posture:
  - ticket-opening answers target the same analytical depth as admin ANN drafts.
  - no-knowledge responses with retrieved context are retried through a second-pass synthesis before any deterministic fallback.
  - wait-mode customer diagnosis allows up to 120s and two no-knowledge recovery attempts.
  - ticket-opening UI tells the user a grounded answer is being synthesized and uses screenshots/files as first-class evidence.
  - desktop ticket-opening wait UX now shows a subtle sanitized semantic data-rain page background and fades out only after the AI response resolves; mobile skips this effect.
  - URL-only/navigation-only ticket-opening input is now stopped before RAG retrieval and returns a localized clarification instead of a random high-confidence match.
- Rich Message Composer MVP completed:
  - ticket detail now uses a TipTap rich reply composer for admin/customer replies.
  - message history and ticket descriptions render through a safe rich/plain renderer.
  - AI Copilot markdown drafts are converted into sanitized readable HTML before insertion.
  - backend accepts `contentFormat: HTML` only for ticket message bodies and applies strict allowlist sanitization.
  - no Prisma migration was added; sanitized HTML is stored in the existing message field for this MVP.
- Phase 1 RAG relevance/cache fix is committed. Continue with a measured RAG quality program, not ad-hoc browser questions.
- Use `.ai/rag-quality/acceptance-questions.json` as the active acceptance set before importing more files or changing retrieval logic.
- Faz 6 live API acceptance completed:
  - current set is 26 questions after adding `rag-tr-dwg-layer-reference-001`.
  - 24 in-scope vendor PDF RAG checks pass.
  - 2 remaining failures are out-of-scope for vendor PDF RAG: Hotinfo diagnostic flow and AI-optional ticket creation help.
  - 5 critical customer answer smoke checks pass with 0 source leaks.
- Faz 4 narrow retrieval fix committed: negated license intent and pilot/canonical preference target checks pass.
- Faz 5 source-gap decision is documented in `.ai/rag-quality/source-gap-plan-2026-05-15.md`.
- Batch 012 source-gap import completed for Allplan Share/Cloud and Project Data Management:
  - 4 PDFs registered from `dataset/**/batch-012`.
  - 4/4 sync logs ended as `SUCCESS`.
  - 179 embeddings written as `v2_2 / 3072`.
  - `rag-tr-share-cloud-001` and `rag-tr-project-backup-001` now pass retrieval acceptance.
- Hotinfo diagnostic flow is now treated as ticket-specific context, not global RAG corpus:
  - raw Hotinfo traces stay out of retrieval query to avoid source pollution.
  - safe Hotinfo system signals can enrich retrieval when the user explicitly asks for Hotinfo/system analysis.
  - prompt context includes richer Hotinfo fields for final diagnosis.
  - license/transfer/activation queries now also receive safe Hotinfo retrieval signals, because Allplan version/build materially affects source applicability.
  - unreadable legacy license-file traces are treated as low-trust legacy telemetry, not as proof of an invalid modern Cloud/Wibu license.
  - raw license numbers, `_SEC.NSE` paths, and raw Hotinfo traces stay out of retrieval/search prompts.
  - admin Copilot and customer AI query now use the same safe Hotinfo search-signal policy for version, build, license, and hardware context.
  - structured GPU card details, including secondary GPU VRAM/RAM/driver fields, are injected into prompt context for final diagnosis.
- Product-flow Phase 1 API acceptance completed:
  - `.ai/product-flow/run-product-flow-acceptance.mjs`
  - 9/9 pass.
  - verifies Hotinfo upload/profile persistence, AI context without raw trace leak, AI-optional ticket creation, ticket Hotinfo snapshot, and raw Hotinfo download RBAC.
- Product-flow Phase 2 UI acceptance completed:
  - `.ai/product-flow/run-product-flow-ui-smoke.mjs`
  - 12/12 pass.
  - verifies customer UI login, ALLPLAN selection, `.hxl` upload, AI skip, direct ticket creation, admin UI ticket visibility, and admin Hotinfo snapshot visibility.
- Hotinfo admin review revision completed:
  - parsed Hotinfo snapshots now expose up to two structured GPU cards.
  - admin ticket Hotinfo modal shows GPU 1/GPU 2 details with readable VRAM/RAM/resolution/driver date/driver version fields.
  - admin/support can download the customer's raw `.hxl` file from the ticket Hotinfo modal.
- CRM detail surface revision completed:
  - CRM account detail fields now persist beyond list columns and are shown in account profile detail.
  - Customer/contact profile detail now shows a CRM Contact Details card with Dynamics contact fields.
  - Added migration `20260519000001_add_crm_account_detail_fields`.
- Customer Answer Quality Phase 3 started:
  - customer sync diagnosis timeout increased from `6000ms` to `15000ms`.
  - license borrowing fallback now returns structured solution steps instead of raw excerpts.
  - Turkish UI-language and English requested-language fallback regressions are covered.
- Answer Drift Reset Phase 4 started:
  - customer `AiQueryService` and admin `AiCopilotService` now share `buildSupportAnswerContractPrompt(...)`.
  - admin Copilot no longer has its own shortened answer structure layered over the master diagnosis prompt.
  - shared contract enforces exact intent, no how-to-to-outage drift, same customer/admin core solution, and no raw excerpt/source leakage for customer answers.
  - ticket-opening UI language is now persisted on `AiInteraction.userContext.responseLanguage` and admin Copilot prioritizes that language over the creator profile language.
  - deterministic customer fallbacks no longer cache transient model timeouts or expose generic source-title/snippet summaries when no structured fallback exists.
- Ticket Interaction Idempotency Phase 5 started:
  - repeated ticket creation from the same AI interaction no longer leaks Prisma `interaction_id` uniqueness as HTTP 500.
  - backend returns the existing ticket for the same user with `alreadyCreated: true`.
  - frontend avoids adding duplicate initial messages/attachments when the existing ticket is reused.
- Live Chat Policy + AI Ticket Trace completed:
  - customer-initiated live chat requests are VIP-gated in `TicketsService`, not only in the frontend.
  - staff can still start proactive/live chat for any customer.
  - ticket creation marks linked AI interactions as `ticketCreated=true`.
  - support users can inspect ticket-level AI trace signals from the ticket detail UI.
- LearnNow crawler format discovery completed:
  - public `knowledge_article`, `pdf`, `technical_manual`, `explaining_video`, and `recorded_online_session` filters are available in the crawler UI.
  - non-PDF formats are staged as review candidates through the existing URL sync path while preserving original LearnNow source type metadata.
  - LearnNow howto detail extraction now uses the public Totara API to fetch real `salesforce_content` and image references instead of indexing the portal shell.
  - live read-only smoke confirmed `id=9093` returns article text plus one source image.
  - LearnNow explainer videos now extract Vimeo IDs, public Vimeo text tracks, and clean VTT transcript text when captions are available.
  - live read-only smoke confirmed `id=2740` returns `vimeoVideoId=880602266`, `transcriptStatus=AVAILABLE`, and German transcript text in the crawl content.
  - saved howto candidates now carry review-quality metadata: content length, image count, transcript status/language/length, source type, and ready-for-import flag.
  - Knowledge Pool crawler UI now shows these quality signals as compact badges before import.
  - public LearnNow format filters now match the real Totara UI values: Knowledge Article `knowledge_article`, Technical Manuals/PDF `pdf`, Explaining video `explainer_video`, and Recorded online session `recording`.
  - Technical Manuals are staged as PDF candidates; videos and recordings remain review-first Knowledge Article candidates until transcript/content quality is confirmed.
  - LearnNow review decisions now use one backend helper: article content must be long enough, media/recording formats require transcript text, and PDF/manual candidates are clearly marked as validated during import.
  - candidate quality badges now show localized reason codes such as transcript required, transcript ready, content too short, and PDF check on import.
  - LearnNow automatic crawl is now public-only: enrollment/course-layer pages are rejected from discovery and must be imported manually as approved files/transcripts.
  - LearnNow candidate discovery now checks existing Knowledge Pool URL/content hash before import and marks duplicates as `SKIPPED_DUPLICATE`.
  - Knowledge Pool crawler UI now explains the public-only crawl boundary and e-learning manual-import rule in Turkish, English, and German.
  - LearnNow `/course/` enrollment URLs are now hard-blocked in normal URL source creation, generic web crawler discovery, and LearnNow-specific candidate extraction; the UI also refuses these URLs before submission.
  - next LearnNow phase should run a small end-to-end pilot import smoke before broader imports.
- Ticket routing hardening started:
  - new ticket creation now collects support category/department before product selection.
  - ticket create payload includes `departmentId` so SLA and auto-assignment can route by department.
  - auto-assignment no longer falls back to global agents when department routing is missing or no auto-assignment team exists.
  - admin team detail now saves auto-assignment enablement and assignment strategy through the backend.
  - department/team admin views expose assignable agent counts so routing gaps are visible before live tickets arrive.
- Admin Copilot drift hardening completed:
  - admin ANN/Copilot drafts now receive the linked ticket-opening AI answer as primary grounding context when one exists.
  - if the admin model returns a no-knowledge response despite a usable ticket-opening answer, Copilot reuses the linked answer instead of contradicting it.
  - manual license server discovery questions have a structured fallback so the admin side does not regress to a generic no-knowledge draft.
  - admin ANN/Copilot draft API now returns visual evidence from the linked ticket-opening interaction or Knowledge Source metadata.
  - ticket detail renders those draft visuals as separate evidence cards above the composer, keeping image evidence out of the generated text body.
- Customer Dashboard 403 Cleanup completed:
  - customer/viewer dashboard no longer calls admin-only `/ai/health-metrics`.
  - admin/superuser dashboard still loads AI health metrics.
- Use `.ai/rag-quality/run-acceptance.mjs` for future localhost retrieval checks; default delay is intentionally throttle-safe.
- Use `.ai/rag-quality/run-answer-smoke.mjs` for focused customer-facing answer checks before declaring RAG-facing changes done.
- Pause the PDF-first import after the support-first seed corpus and validate real RAG quality before importing more files.
- Build the PDF-first RAG dataset import path without polluting the knowledge pool with generated MD duplicates.
- Keep `dataset/` as the clean import surface and `.archive/rag-incoming/pdf/` as the raw PDF inbox.
- Preserve Gemini/LLMAPI + pgvector and low-rate ingestion while importing in small validated batches.
- Ensure Knowledge Pool sources carry useful `metadata.category` values from both dataset scan and UI upload.
- Controlled 5-file PDF support batches 001 through 011 completed successfully.
- Keep title-specific retrieval boosting in place so near-duplicate FAQ topics rank by the most specific PDF title, not only vector similarity.
- Keep OpenAI as chat fallback only. Do not use OpenAI as embedding fallback while the active corpus is Gemini `3072/v2_2`.
- Embedding index isolation is the active production strategy:
  - Gemini `v2_2 / 3072` remains the active embedding index.
  - pgvector columns are unconstrained `vector`.
  - every vector write/search must isolate by `embedding_version + embedding_dim`.
  - Qdrant is roadmap/benchmark only, not a pre-delivery migration.
- Ensure unchanged dataset files with zero embeddings are re-indexed or fail clearly; never mark them as successful with an empty vector set.

## Avoid Breaking

- `AiService` provider dispatch, retry, and fallback behavior.
- `AiQueryService` sync diagnosis and async query flows.
- `EmbeddingService` knowledge pool, ticket, and article embedding writes.
- `RagMaintenanceService` vector dimension and index maintenance behavior.
- `NotificationsGateway` and WebSocket connection flows.
- Ticket lifecycle and AI-optional ticket creation.
- Global `XssValidationPipe` behavior for non-message strings.
- `AddMessageDto` and ticket message creation/rendering compatibility with old plain text content.

## Known Risks

- Gemini quota/rate limits can stall model-backed reranking or final answer generation if not bounded.
- Gemini 3072-dim embeddings affect pgvector column dimensions and HNSW index compatibility.
- Generated MD files from old PDF conversion flows can duplicate or distort canonical PDF sources.
- Legacy sources with `General` category can still appear after correctly categorized sources until old metadata is cleaned or reclassified.
- Similar multilingual FAQ topics can still tie at capped similarity `1.000`; inspect rank order and source metadata, not only displayed similarity.
- Legacy Softlock / old-version license sources are now demoted for modern license transfer or upgrade intents; keep this applicability guard in retrieval scoring rather than adding one-off answer templates.
- Mixing embedding providers in the same `embedding_version` can corrupt retrieval even when vector dimensions match; model-space compatibility matters as much as dimension.
- A source can have an unchanged content hash while still having zero embeddings from an earlier failed run; sync must verify embeddings before treating unchanged content as healthy.
- `graphify` CLI was previously unavailable in PATH, so graph updates may need environment repair.
- `apps/backend/openapi.json` is modified separately; do not mix it into RAG import commits unless intentionally regenerated.
- Customer answer quality should no longer diverge through the old quick-summary path, but can still fail when the LLM refuses after both synthesis attempts or when retrieved context is genuinely missing.
- Customer/admin answer parity now has a shared `SupportAnswerOrchestrator` generation policy; future answer-quality changes should go through this layer instead of patching `AiQueryService` and `AiCopilotService` separately.
- Ticket creation from AI diagnosis depends on `interactionId` idempotency; keep this path covered when changing ticket creation or AI query interaction persistence.
- Dashboard data loading must remain role-aware; do not call admin-only observability endpoints from customer pages.
- Rich message MVP stores sanitized HTML without a DB `contentFormat` column; renderer must continue detecting legacy plain text safely.
- Backend rich-text sanitizer is intentionally narrow; do not expand tags/attributes without XSS-focused tests.

## Next Recommended Step

Manual smoke-test Rich Message Composer before broadening the editor scope:

- Admin ticket detail: send bold/list/heading reply and verify render.
- Customer ticket detail: send formatted reply and verify render.
- ANN draft: verify markdown headings/lists appear as readable editor content.
- Legacy plain text: verify old messages still display cleanly.
- XSS smoke: `<script>`, `onerror`, and `javascript:` links must not persist or execute.

Keep Hotinfo and AI-optional ticket creation separate from vendor PDF RAG:

- Hotinfo needs canonical PDF/TXT source approval before import, because current confirmed candidates are MD-only.
- AI-optional ticket creation should be app-help/product copy, not vendor FAQ retrieval.
- Next RAG step: stop broad RAG changes unless a new acceptance failure appears; future source imports must rerun the focused acceptance set.
- Next answer-quality step: rebuild/reload backend, live-test the same license borrowing question through customer answer and admin ANN draft, and verify both stay on the same how-to procedure.
- Next orchestrator smoke: live-test one English, one Turkish, and one screenshot-assisted ticket-opening question; confirm customer answer and admin ANN draft share the same core answer and selected UI language.
- Next ticket-flow step: retry ticket creation from the same customer screen and verify it routes without 500; then compare admin ANN draft for the created/reused ticket.
- Next browser step: reload customer dashboard; the `/ai/health-metrics` 403 should disappear, then retry ticket creation.
- Next product-flow step: isolate live notification behavior as its own small acceptance phase, because Hotinfo upload and AI-optional ticket creation now pass in both API and UI flows.

## Operations & Infrastructure Backlog

## Active Focus - 2026-08-06 Post-Faz-7 Closure

- Local-only Faz 7 follow-up is implemented and verified; production PostgreSQL/Redis, deploy and remote push remain untouched.
- Auth action tokens use a dedicated secret, issuer/audience/purpose/JTI binding, 30-minute expiry and atomic one-time consumption.
- Password reset and admin force logout now increment durable `users.session_version`; access and refresh JWTs are rejected when their session version no longer matches the database. Redis markers are compatibility/optimization only.
- Email verification resend and forgot-password both have a two-minute durable cooldown and restore the prior challenge if email enqueue fails. Verification and reset links use URL fragments and remove the fragment from browser history after extraction.
- Registration welcome emails no longer contain the plaintext password.
- Canonical historical migration `20260314900000_restore_crm_foundation` remains immutable at SHA-256 `731839...`; timeout is supplied by the Faz 8 one-shot connection through the PostgreSQL URL `options` parameter. Shell `PGOPTIONS` is not relied upon because Prisma did not propagate it in the disposable lock test.
- Current 51-migration chain was rebuilt on fresh PG17 and on a sanitized production-derived clone. Both pass checksum/ledger integrity; direct comparison has 0 blocking differences and the post-migration audit has 0 ghost/pending/shadow-only effects. The separate read-only PRE audit records the original shadow's expected 7 ghost effects and one pending foundation ledger entry.
- Next action is Claude independent verification and, only after explicit user approval, a separately scheduled Faz 8 maintenance-window decision. Do not run production migrations now.

## Active Focus - 2026-08-06 BULGU-10 Migration Recovery

- Historical migration checksums were restored from Git versions proven against the sanitized production-shadow ledger; all 49 migration files are now pinned in a versioned checksum manifest and checked before CI deploy.
- A transaction-safe, idempotent `20260314900000_restore_crm_foundation` migration now restores the RBAC, CRM, and AI cache prerequisites missing from fresh installs.
- Fresh PG17 and a separate sanitized production-shadow clone both pass the blocking migration-integrity verifier.
- Production has not received this migration. Do not run `migrate deploy` against production without an explicit user-approved maintenance window.
- Full Prisma schema parity still has pre-existing drift beyond BULGU-10. Treat it as a separate local analysis phase; do not broaden the current migration automatically.
- Remote push, tag push, deploy, and publish remain forbidden until the user explicitly says `push et`.

- **DMARC Enforcement Reminder (Post-Deploy + 2-3 weeks):**
  Sistemi canliya aldiktan ve destek e-postalarinin duzgun calistigindan tamamen emin olduktan 2-3 hafta sonra, DNS barindiriciniza (Cloudflare, cPanel vs.) girip DMARC kaydinizdaki `p=none` ibaresini `p=quarantine` veya `p=reject` olarak degistirmelisiniz.
  *Yeni Kod Boyle Olmali:* `"v=DMARC1; p=reject; rua=mailto:destek@allplan.net.tr; adkim=s; aspf=s"`
  *Etkisi:* Bu degisikligi yaptiktan sonra hic kimse domain adinizi kullanarak sahte e-posta atamaz (Spoofing) ve IP/Domain itibarınız tamamen altin seviyeye (maksimum spam korumasina) ulasir.

## Active Focus - 2026-08-06 Knowledge Pool URL Duplicate Prevention

- New manual URL sources and approved LearnNow article imports now use the same canonical URL identity and transaction-scoped PostgreSQL advisory lock.
- URL identity strips fragments and known tracking parameters, normalizes host/default ports/query order, and preserves meaningful protocol/path/query differences.
- Duplicate submissions return the stable `KNOWLEDGE_SOURCE_URL_DUPLICATE` conflict and enqueue no second sync job; the TR/EN/DE UI keeps the modal input and shows an informational message.
- Existing production-derived duplicate rows were not merged, deleted, re-indexed, or modified. Legacy comparison is intentionally read-only and O(N) until an approved canonical identity/index migration is designed.
- Pre-existing SSRF hardening remains a separate high-priority security task: URL fetches need resolved-IP and redirect-chain validation before production release of further URL-ingestion changes.
- Product commit: `a960b73d`. No push, deploy, production connection, schema migration, or shadow write occurred.

## Active Focus - 2026-08-06 AI Solution Visibility And FAQ Provenance

- `/admin/ai-interactions` is now the dedicated admin surface for pre-ticket AI interactions; `/kb-approvals` remains the editorial FAQ review queue.
- AI history returns an explicit allowlist only, supports exact opaque interaction IDs, ticket/confidence/search filters and pagination, and records privacy-safe read audit events.
- FAQ candidates now retain normalized ticket/interaction provenance through `FaqEntrySource`; duplicate frequency updates and source attachment are transactional.
- Interaction-derived candidates use the stored customer-visible AI response and always remain `PENDING_REVIEW`; blank answers cannot be approved.
- Anonymous/customer FAQ reads no longer inherit staff visibility, FAQ list limits are capped, and ticket AI trace now checks actual ticket access before returning details.
- Local dev and a disposable dump-restored PG17 copy both applied all 53 migrations with business row counts unchanged. Production and shadow were not touched.
- Product commits: `d3d1a7b7`, `7bd9dda0`, `809fd245`, `0cbf617a`, `b5228c97`.
- Remaining acceptance step: authenticated local browser smoke of `/tr/admin/ai-interactions` and its exact source link from `/tr/kb-approvals`; this is UI acceptance, not a code/test blocker.
- Remote push, tag push, deploy and production migration remain forbidden until explicit user approval.

## Active Focus - 2026-08-06 Production Boot And Migration Safety Closure

- Claude's manifest and automatic production-sync findings are closed locally in commit `6759b077`.
- Canonical boot is fail-closed: verify migration files, run Prisma migration with URL-encoded lock/statement timeouts, verify ledger/relations, then start the API.
- Normal boot no longer runs user recovery, role repair, admin bootstrap, seed, direct DDL, or manual migration-ledger edits.
- Seed and manual production synchronization require explicit opt-ins; production E2E data is rejected before the first Prisma query and no current-tree hardcoded production credential remains.
- Migration manifest and local ledger are 54/54; schema parity passes with only the existing allowlisted partial FAQ embedding index.
- Local business counts remain 1282 users / 162 tickets / 259 AI interactions / 29 FAQs / 0 FAQ provenance rows.
- Remaining release evidence: build and smoke the Docker runner where registry access is available. Do not run manual production-sync without a disposable-PostgreSQL rollback/lock-duration acceptance test and separate user approval.
- No production/shadow connection, push, tag-push, deploy, publish, or live secret rotation occurred.

## Active Focus - 2026-08-07 Görev ve Onay Merkezi

- Yerel, yetki kapsamlı Görev ve Onay Merkezi backend summary endpoint'i, frontend sayfası ve sidebar merkezi tamamlandı (`1efacf33`).
- Merkezi yüzey canlı destek, atanmamış bilet, makale/FAQ/crawler onayı ve ayrı AI denetim bağlantısını bir araya getiriyor; hiçbir işlemi otomatik onaylamıyor.
- Yetkisiz kuyruklar sorgulanmıyor veya sayı olarak açıklanmıyor; CUSTOMER için summary isteği yapılmıyor.
- Backend 121/121 suite (1102 passed, 1 skipped), frontend 34/34 dosya (248 test), typecheck, i18n, ops ve RBAC kapıları geçti.
- Bağımsız incelemede bulunan müşteri global-count sızıntısı, kart/hedef yetki farkı, count/list parity, stale query geçişi ve RoleGuard render flash sorunları `ef9bfe7e` ile kapatıldı; ikinci kod ve güvenlik incelemeleri GO verdi.
- Kimliksiz smoke doğrulandı: API 401/no-store; frontend `/tr/review-center` login'e yönleniyor.
- Sıradaki kabul adımı: kullanıcı yerel olarak giriş yaptıktan sonra ADMIN ve mümkünse SUPPORT_AGENT ile görsel/işlevsel browser smoke. Claude bağımsız çapraz doğrulaması da bekleniyor.
- Canlı bağlantı/yazma, production migration, rol ataması, push, tag-push, deploy ve publish yasaktır.

## Active Focus - 2026-08-07 Frontend/Backend Contract Closure

- CRM ayarları gerçek `POST /crm/connections` camelCase DTO sözleşmesine taşındı; secret yanıtları maskeli, mevcut webhook secret alan gönderilmezse korunuyor.
- Dynamics outbound istekleri yalnız güvenilir HTTPS `*.dynamics.com` origin'ine gider; redirect kapalı ve OData next/delta linkleri aynı origin'e kilitli.
- CRM bağlantısı ile eski `dynamics_api_key` ayrı kaydediliyor; UI tüm settings secret'larını decrypt ederek istemiyor.
- Backend güvenlik modeli olmayan MFA kontrolleri ve karşılığı olmayan MJML block editor kaldırıldı. Transactional template `source/save/preview` ile DB-backed announcement yapısı ayrı kaldı.
- Blocking frontend API route contract kapısı 182 merkezi istemci operasyonunu 233 OpenAPI operasyonuyla karşılaştırıyor; missing=0 ve dashboard raw-network ihlali=0.
- Ürün commitleri: `eaa1fc53`, `e294623d`. Backend 124/124 suite (1152 passed, 1 skipped), frontend 38/38 dosya (260 test), typecheck, i18n, ops, RBAC ve 56/56 migration manifest geçti.
- Canlı/production/shadow erişimi, migration/seed, push, tag-push, deploy ve publish yapılmadı.

## Active Focus - 2026-08-07 Review Center Soft-Delete Parity Aşama A

- Dar Aşama A `69655f1c` ile tamamlandı: Review Center ticket/FAQ sayaçları ve FAQ hedef sorguları yalnız aktif kayıtlarla eşleşiyor.
- Ticket listesi backend hatasını boş kuyruktan ayırıyor, lokalize retry sunuyor ve eski eşzamanlı istek yanıtlarını request-id ile yok sayıyor.
- FAQ read/publish/approve/dismiss/update yolları soft-deleted kayıtları dışlıyor. `PATCH /faq/:id` gerçek whitelist DTO + service allowlist kullanıyor; mass-assignment, null/blank ve şema drift regresyonları kapalı.
- Son kanıt: backend 125/125 suite (1168 passed, 1 skipped), frontend 38/38 dosya (262 test), typecheck/i18n/ops/API/RBAC/migration kapıları temiz; code ve security review GO, C/H/M=0.
- Aşama B global Prisma Proxy/middleware düzeltmesi ayrı iş ve NO-GO: tam call-site envanteri ve ayrıca kullanıcı onayı gerektiriyor.
- Kalıcı sınır: production/canlı/shadow erişimi veya yazımı, migration/seed, push, tag-push, deploy ve publish yok.

## Active Focus - 2026-08-08 Production Release Faz A.1.1

- Ledger-driven, fail-closed production migration planner and current Faz 8 runbook are complete locally in `8fbdc0b1`.
- The planner derives pending migrations from canonical files/manifest versus `_prisma_migrations`; it rejects unknown, checksum-drifted, unresolved, contradictory-lifecycle and duplicate-success rows.
- The single ADR-011 historical marker is default-deny and only accepted with an exact explicit acknowledgement; the artifact preserves the real ledger marker and match mode.
- Artifacts are restricted to `.private-data`, mode `0600`, and include ledger digest/capture provenance without connection secrets. Online reading is one `REPEATABLE READ READ ONLY` transaction with a static SELECT and rollback.
- Coolify read-only UI evidence: backend and frontend are running the same deployed commit `d9b21b9d`; production PostgreSQL reports healthy on `pgvector/pgvector:pg17`; Redis is running. Local release HEAD is a descendant and must not be treated as live parity.
- MinIO is intentionally retired; the canonical storage target is S3-compatible object storage. The runbook now requires S3 parity plus versioning/immutable-backup restore canary. Local fallback is only a historical recovery inventory.
- Coolify's database General page unexpectedly exposed the PostgreSQL password in browser automation output. The value is not recorded or reused. PostgreSQL credential rotation and dependent connection updates are mandatory before release approval.
- Verification: focused planner tests 19/19, combined operations-safety 43/43, migration manifest 56/56, diff-check clean; independent code and security reviews GO with Critical/High/Medium = 0/0/0.
- Restore: `restore/post-release-a11-20260808-8fbdc0b1`; bundle `.private-data/restore-points/post-release-a11-20260808-8fbdc0b1.bundle`, SHA-256 `ecb15b14da121665c3d30c94df13784b954c3b939b0ebb39b724c3a2250eb9af`, complete history verified.
- Next safe phase is local-only A.1.2: fail-closed custom-format backup tooling and tests. No production DB query, SSH action, migration, seed, push, tag-push or deploy occurred in A.1.1.

## Active Focus - 2026-08-08 Production Release Faz A.1.2

- Yerel fail-closed backup sözleşmesi `64c5d2bc` ile tamamlandı: explicit opt-in, PG17 custom dump, archive doğrulaması, SHA-256, private path/lock/symlink/ownership kontrolleri, READY-last ve S3 no-clobber/owned-cleanup.
- Eski uygulama-içi cron/shell/plain-SQL backup yolu karantinaya alındı; ADMIN backup endpoint'i sabit 503 döndürüyor. Hata filtresi ve public health yanıtlarındaki hassas ayrıntı sızıntıları kapatıldı.
- Kanıt: backup `44/44`, ops `87/87`, backend `132/132` suite (`1311 passed`, `1 skipped`), frontend `42/42` dosya (`308 passed`), typecheck/i18n/API/RBAC/migration `56/56`; TDD/code/security review GO, C/H/M `0/0/0`.
- Mevcut R2 `aluplan-support-desk` uygulama bucket'ındaki `402` nesne / `37.42 GB` veri değişmedi. `aluplancoolify` kapsam dışı. Ayrı DB backup hedefi önerisi `aluplan-support-desk-db-backups`; henüz oluşturulmadı.
- Restore: `restore/post-release-a12-20260808-64c5d2bc`; bundle SHA-256 `a6b1f98e8828d3a6ec9b5f01e2887408eb42832d777699eb3aba9d147b67c0cd`.
- Production hâlâ NO-GO. Sıradaki güvenli faz A.1.3: exact image + gerçek Cloudflare R2 conditional round-trip + disposable PG17/pgvector restore drill. Canlı erişim/yazım, migration/seed, push/tag-push/deploy yok.

## Pause Checkpoint - 2026-08-08 gece / sabah devam

- Kullanıcı yorgun olduğu için çalışma güvenli checkpoint'te durduruldu. Yeni
  ürün geliştirmesi, production bağlantısı veya dış sistem mutasyonu başlatılmadı.
- Güncel yerel HEAD bu kayıt öncesinde `46ec376c`; son ürün/tooling commit'i
  `64c5d2bc`. A.1.1 ve A.1.2 yerel olarak kapalı, production genel GO değildir.
- Yerel güven: backend `132/132` suite (`1311 passed`, `1 skipped`), frontend
  `42/42` dosya (`308/308`), backup `44/44`, ops `87/87`, typecheck/i18n,
  API/RBAC ve migration `56/56`; TDD/code/security GO, C/H/M `0/0/0`.
- Mevcut `aluplan-support-desk` R2 uygulama bucket'ı (`402` nesne / `37.42 GB`)
  dokunulmadan korunuyor. `aluplancoolify` kapsam dışı. Önerilen
  `aluplan-support-desk-db-backups` henüz oluşturulmadı veya yapılandırılmadı.
- Sıradaki tek aktif release işi A.1.3'tür: exact image smoke, ayrı DB-only R2
  conditional round-trip ve disposable PG17+pgvector restore drill. Bunlar
  tamamlanmadan deploy/cutover yok.
- Release öncesi ayrıca production PostgreSQL credential rotasyonu, canlı
  ledger salt-okunur planı, object parity, dokuz queue/cron tekilliği ve
  rollback kanıtı gereklidir.
- Sabah `FIRST-READ.md` bölüm 10'dan başla. Push, tag-push, deploy, production
  DB/R2/SSH yazımı, migration ve seed yasakları aynen sürüyor.
- Pause restore point: commit `ab2bd04f`, tag
  `restore/pause-before-release-a13-20260808-ab2bd04f`, complete-history bundle
  `.private-data/restore-points/pause-before-release-a13-20260808-ab2bd04f.bundle`,
  SHA-256 `63e8f45bc7f2eb51ae6aae4ec49961598c64225d08130fb0b92d93868633c12d`.

## Active Focus - 2026-08-09 Production Release Faz A.1.3 Local Evidence

- A.1.3 exact backend image ve disposable PostgreSQL 17 + pgvector restore/migration tatbikatı yerelde tamamlandı; bu sonuç production GO değildir.
- Güncel kanonik yerel HEAD `ca26caa1` (`fix(release): serialize fingerprint queries`). Exact linux/amd64 backend image digest'i `sha256:74a4fac812a84082184c8d42a41473f08a235ed772cc615cfcfd316f7299f6ac` ve commit/revision bağı doğrulandı.
- Sanitized production-derived PG17 custom dump SHA-256 `544260dd42453b6510433e27de0ef19e03e3e08793923af8c699fb27a98f1ff7`, boyut `138028808`, mode `0600`; yalnız disposable kaynaklarda kullanıldı.
- Restore öncesi baseline/candidate digest'i aynıydı. İlk turda beklenen sekiz migration uygulandı; ikinci tur `No pending migrations to apply` verdi. Post-round-1 ve post-round-2 digest'i `dd63895628fa0961bd4602c3c662d5e24d67f0fb433bca69abe3cae85e071fae` olarak birebir aynı.
- Kanıt: `canonicalRbac=true`, `schemaParity=true`, `roundTwoNoOp=true`, invalid constraint/index `0/0`, cleanup `clean`, `LOCAL-A13` complete ve bütün artifactlerde `productionGo:false`.
- Disposable container/network/volume label filtresiyle tekrar sorgulandı; kalan kaynak yok. Mevcut yerel PostgreSQL/Redis containerları değiştirilmedi.
- Gerçek drill iki fail-closed uyumluluk borcu yakalayıp kapattı: Docker Desktop lowercase missing-object kanıtları ve Apple Silicon üzerinde amd64 backend job platform pin'i. Son olarak tek `pg.Client` üzerindeki eşzamanlı RBAC sorguları seri hale getirildi; stderr uyarısının JSON evidence'ı bozması engellendi.
- Son doğrulama: A.1.3 safety `52/52`, geniş operations-safety `151/151`; TDD/code/security review GO, Critical/High/Medium `0/0/0`.
- Güncel restore point: tag `restore/post-release-a13-fingerprint-20260809-ca26caa1`; bundle `.private-data/restore-points/post-release-a13-fingerprint-20260809-ca26caa1.bundle`, SHA-256 `dca8524a59d61525bf6f20b5fd4eeda739d5486c5d47356634699fb185280034`.
- Açık release kapıları: ayrı DB-only Cloudflare R2 hedefinde conditional round-trip/restore canary, production ledger salt-okunur planı, PostgreSQL credential rotasyonu, application-object parity, dokuz queue/cron tekilliği, maintenance/cutover ve rollback provası. Mevcut `aluplan-support-desk` application bucket'ına dokunma.
- Push, tag-push, deploy, production DB/R2/SSH erişimi veya yazımı, migration ve seed yapılmadı; yasaklar sürüyor.

## Active Focus - 2026-08-10 DEV Offsite Backup Acceptance

- Yalnız DEV kabulü için ayrı Cloudflare R2 bucket'ı `aluplan-support-desk-db-backups-dev` oluşturuldu. Mevcut canlı `aluplan-support-desk` application bucket'ı ve `aluplancoolify` değiştirilmedi.
- 30 gün süreli R2 kimliği yalnız yeni DEV bucket'ta Object Read & Write kapsamıyla oluşturuldu. Secret değerleri belgeye/Git'e yazılmadı; kimlik dosyası `.private-data/release-credentials/r2-dev-canary.env` altında mode `0600` tutuluyor.
- 106 byte sentetik canary `canary/2026-08-10/b3abc01c3aedfb84/canary.txt` anahtarına no-clobber koşuluyla yüklendi. HEAD metadata, geri indirme ve iki taraflı SHA-256 `b3abc01c3aedfb8438f02bba41625db33a21ba3ac232854bc3cabb0a0d0e1fbf` eşleşti; aynı anahtara ikinci koşullu yükleme beklendiği gibi reddedildi.
- R2 HEAD yanıtında `VersionId` yoktu. Bu nedenle versioning geri dönüş kanıtı sayılmıyor; benzersiz/no-overwrite anahtarlar ve bağımsız Microsoft kopyası zorunlu kalıyor.
- Microsoft SharePoint'te mevcut `ALUPLAN DESTEK PLATFORMU 2026` sitesine dokunulmadan, Microsoft 365 Group oluşturmayan ayrı `ALUPLAN Destek Yedek Kasası DEV` sitesi oluşturuldu: `/sites/aluplan-destek-backups-dev`, Türkçe, `(UTC+03:00) Istanbul`, 100 GB site kotası.
- Yeni DEV site dış paylaşımı `Only people in your organization` olarak doğrulandı. `Database Backups`, `Object Storage Snapshots` ve `Manifests` adlı üç boş document library oluşturuldu.
- SharePoint admin salt-okunur envanteri `293.15 GB used of 1.85 TB` gösterdi. Bu kapasite kanıtıdır; Microsoft'a production verisi veya canlı R2 nesnesi henüz kopyalanmadı.
- Sıradaki güvenli iş: client-side encryption ve key-custody sözleşmesini belirlemek; SharePoint'e yalnız sentetik şifreli canary yükleyip geri indirme/hash doğrulaması yapmak; ardından canlı R2 için yalnız salt-okunur object manifest ve maliyet/süre planı çıkarmak.
- Production hâlâ NO-GO. Canlı DB dump, canlı R2 kopyası, production credential rotasyonu, push, tag-push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 Encrypted SharePoint DEV Round-Trip

- Resmî `age v1.3.1` Apple Silicon paketi proje özel alanına indirildi; yayımlanmış arşiv SHA-256 değeri `01120ea2cbf0463d4c6bd767f99f3271bbed1cdc8a9aa718a76ba1fe4f01998b` ile birebir doğrulandı. Sistem geneline kurulum yapılmadı.
- Yalnız DEV canary için yeni age identity oluşturuldu. Özel anahtar `.private-data/release-credentials/sharepoint-dev-age-identity.txt` altında mode `0600`; Git'e, SharePoint'e, rapora veya terminal çıktısına yazılmadı.
- 288 byte sentetik plaintext SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95`; age ciphertext 488 byte ve SHA-256 `65f66f049c8b31315c27a7fd0f2456fe59c455e067cd08ac08861ef9c10aac25`.
- Ciphertext ve secretsız manifest yalnız yeni `/sites/aluplan-destek-backups-dev` sitesindeki `Manifests` kütüphanesine yüklendi. Ciphertext Microsoft Graph ile geri indirildi; byte count ve SHA-256 eşleşti, yerel private identity ile çözme başarılı oldu ve recovered plaintext SHA-256 kaynakla birebir eşleşti.
- SharePoint version history `1.0` / 488 byte olarak görüldü. Dosya izinlerinde anonymous sharing linki yok; site Owners/Members/Visitors grupları ve site owner dışında doğrudan grant görülmedi.
- Bu kanıt DEV şifreli offsite round-trip kapısını kapatır; production key custody/escrow, otomasyon kimliği, retention ve gerçek restore tatbikatı henüz kapalıdır. Production hâlâ NO-GO.
- Canlı PostgreSQL, canlı `aluplan-support-desk` R2 bucket'ı ve mevcut `ALUPLAN DESTEK PLATFORMU 2026` SharePoint sitesi okunmadı/değiştirilmedi. Push, tag-push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 DEV Object-Manifest Dry Run

- Yalnız `aluplan-support-desk-db-backups-dev` bucket'ı, mevcut bucket-scoped DEV credential ile salt-okunur listelendi. Sonuç tam olarak bir sentetik canary nesnesi / `106` byte; canlı application bucket'ına erişilmedi.
- Normalize DEV manifesti `.private-data/release-evidence/r2-manifest-dev/object-manifest.json` altında mode `0600`; SHA-256 `fc2041066e4bd4fa35fae0c0570ee13d51bc9a7166fcd68cff3215c1f7b51798`.
- Aynı nesnenin `HEAD` sonucu ile manifestteki size ve ETag birebir eşleşti. `GetBucketVersioning` çağrısı DEV credential kapsamında `AccessDenied` döndürdü; versioning durumu varsayılmadı ve recovery gate olarak kabul edilmedi.
- Object manifest age ile client-side şifrelendi; 689 byte ciphertext SHA-256 `113b4cd4a70e5548a0dce1352bf97553111247a0e9957486ddc5f524fd59064b`. Yalnız yeni SharePoint DEV `Manifests` kütüphanesine yüklendi.
- SharePoint'ten indirilen ciphertext hash'i eşleşti; decryption sonrası JSON kaynak manifestle byte-for-byte aynıydı. Bu DEV object-manifest + encrypted offsite round-trip provasıdır, production inventory/kopya değildir.
- Sıradaki güvenli kapı production key custody/escrow kararı ve canlı bucket için ayrı salt-okunur inventory yetkisinin kullanıcı onayıdır. Production hâlâ NO-GO; canlı veriye erişim/yazım yok.

## Active Focus - 2026-08-10 Dual-Recipient DEV Recovery Proof

- DEV anahtar saklama alanı olarak Git tarafından dışlanan `.private-data/release-credentials/age-dev-dual/` kullanıldı. Klasör mode `0700`, iki bağımsız identity dosyası mode `0600`; özel anahtar veya recipient değeri rapora, Git'e ya da SharePoint'e yazılmadı.
- Aynı sentetik 288 byte canary iki farklı age recipient için tek ciphertext olarak şifrelendi. Ciphertext `586` byte ve SHA-256 `90e7dc235d6b267b58727deaf361d720f8b857205852713468acfb0a8ee63d7f`.
- Yerelde her identity tek başına ciphertext'i çözdü; iki recovered plaintext de kaynak SHA-256 `1e38c0dbdbd1c4bcaef3f13335718048ce9997d8ad90d11b1182728cc452ad95` ile birebir eşleşti.
- Ciphertext yalnız yeni SharePoint DEV `Manifests` kütüphanesine yüklendi, Graph üzerinden geri indirildi ve kaynak ciphertext ile byte-for-byte eşleşti. SharePoint round-trip kopyası da her iki identity ile ayrı ayrı çözüldü ve aynı plaintext hash'ini üretti.
- Bu kanıt yerel Git-dışı saklamanın DEV için çalıştığını ve iki bağımsız kurtarma anahtarı sözleşmesini doğrular. Production için iki özel anahtarın aynı bilgisayarda tutulması yeterli değildir; en az birinin kurumsal kasa/secret manager ve diğerinin ayrı offline custody konumu belirlenmeden production key üretimi yapılmayacak.
- Canlı PostgreSQL, canlı application R2 bucket'ı ve mevcut production SharePoint sitesi okunmadı/değiştirilmedi. Production hâlâ NO-GO; push, deploy, migration ve seed yapılmadı.

## Active Focus - 2026-08-10 A.1.4 Production Inventory Offline Preparation

- A.1.4 yalnız yerel hazırlık kapısı tamamlandı; tooling/test commit'i `fdee46c8` (`feat(release): prepare readonly production inventory`). Bu faz hiçbir production bağlantısı kurmaz.
- `scripts/release-a14-inventory-contract.mjs` credential veya endpoint argümanı kabul etmez, database/cloud/Redis client'ı ve child-process import etmez, `--execute` çağrısını fail-closed reddeder ve yalnız açık `--prepare` onayıyla çalışır.
- Dokuz BullMQ queue, dokuz kaynak `@Cron` deklarasyonu, dört repeatable job, exact PostgreSQL statement allowlist'i ve R2/Redis salt-okunur eylem allowlistleri kodla kilitlendi. Runtime singleton henüz doğrulanmış sayılmaz.
- PostgreSQL sorgu sözleşmesi arbitrary `SELECT` çalıştırmaz; yalnız sabit allowlistteki statement'lar kabul edilir. DML/DDL, lock, sleep, `COPY`, multi-statement ve yan etkili fonksiyonlar reddedilir.
- Plan yalnız Git-dışı `.private-data` altında, mode `0600`, no-clobber ve symlink/ownership/mode kontrolleriyle yazılır. Plan daima `productionAccessPerformed=false`, `productionGo=false` ve ayrı kullanıcı onayı gerektiren sonraki kapıyı taşır.
- Doğrulama: A.1.4 hedefi `12/12`, geniş operations-safety `163/163`, syntax, JSON parse, Prettier, secret taraması ve `git diff --check` temiz. Manuel kod/güvenlik incelemesinde Critical/High/Medium `0/0/0`.
- Sıradaki güvenli kapı A.1.4-B için ayrı kullanıcı kararıdır: yalnız kısa ömürlü least-privilege credentiallarla salt-okunur production ledger/R2 metadata/Redis-BullMQ inventory collector. Bu onay verilmeden canlı credential oluşturulmayacak veya production erişimi yapılmayacak.
- Canlı PostgreSQL, `aluplan-support-desk` application bucket'ı, Redis, SSH ve mevcut production SharePoint sitesi okunmadı/değiştirilmedi. Push, tag-push, deploy, migration ve seed yapılmadı; production hâlâ NO-GO.
- Yerel hazırlık planı kanonik dokümantasyon commit'i `b07203e8260a34460e733b15074e2d1651c1c0bf` ile bağlıdır. Restore tag'i `restore/post-release-a14-preparation-20260810-b07203e8`; tam-geçmiş bundle `.private-data/restore-points/post-release-a14-preparation-20260810-b07203e8.bundle`, SHA-256 `762309f39a05496a9ba1637fdbfd304686f241b05609744492c3d784d5263486`; `git bundle verify` geçti.

## Active Focus - 2026-08-11 A.1.4 Independent Review Hardening Closure

- Claude'un append-only bağımsız doğrulaması `6a523cda` docs commit'iyle korundu. Doğrulama A.1.4 yerel GO kararını teyit etti ve `Critical 0 / High 0 / Medium 1 / Low 6` hardening açığı bildirdi.
- Pre-fix restore tag'i `restore/pre-release-a14-hardening-20260811-6a523cda`; bundle `.private-data/restore-points/pre-release-a14-hardening-20260811-6a523cda.bundle`, SHA-256 `5db0a831343bc566c7ba9fe622451c8a71e7e1317caab7446d2a115fe8a9d008`; verify geçti.
- Kod commit'i `9461d52a` bağımsız PostgreSQL statement sözleşmesi, katı UTC ISO-8601 timestamp ve yalnız `.private-data/release-evidence` çıktı sınırını ekledi. Test commit'i `c7c8c039` TypeScript AST tabanlı BullMQ queue drift/anchor keşfi, symlink/permissive-directory ve genişletilmiş network-capability regresyonlarını ekledi.
- M1 ve L1-L6 kapandı. R2/Redis allowlistleri bu fazda hâlâ yalnız A.1.4-B için bildirimsel sözleşmedir; canlı uygulanabilir kısıt veya production kanıtı değildir.
- RED: `16` testin `4` tanesi beklenen sözleşme açıklarında kırıldı. GREEN/final: A.1.4 `16/16`, geniş operations-safety `167/167`; syntax, Prettier, secret scan ve diff hygiene temiz. Manuel kapanış incelemesi `Critical/High/Medium 0/0/0`.
- Yeni private plan `.private-data/release-evidence/a14-production-inventory/preparation-plan-c7c8c039.json`, mode `0600`, commit `c7c8c03983755a08e9d59ae267e6c7f96bb84486` ile bağlı; `productionAccessPerformed=false`, `productionGo=false`.
- GitNexus detect-changes denendi ancak pnpm registry-signature doğrulaması fail-closed durdurdu; bypass uygulanmadı. Canlı PostgreSQL/R2/Redis/SSH/SharePoint erişimi, push, deploy, migration, seed veya queue mutation yapılmadı. Production NO-GO sürüyor.
- Post-fix restore tag'i `restore/post-release-a14-hardening-20260811-865090f3`; complete-history bundle `.private-data/restore-points/post-release-a14-hardening-20260811-865090f3.bundle`, SHA-256 `d05a3ca0a3d801e5062e05fe76fe22dbe0d7d7c974214c7cfe466e5af4aa6423`; `git bundle verify` geçti.

## Active Focus - 2026-08-11 A.1.4 H1-H5 Commit and Recovery Closure

- A.1.4 H1-H5 kapanışı üç ayrı yerel commit ile kaydedildi: sözleşme `5e77ffdc`, regresyon testleri `ff38340e`, append-only ortak rapor `021ae1c5`.
- Final hedef test `21/21`, dokuz dosyalık operations-safety paketi `172/172`; bağımsız code-review ve security-review sonucu GO, Critical/High/Medium `0/0/0`.
- Restore tag'i `restore/post-release-a14-h1-h5-20260811-021ae1c5`; doğrulanmış complete-history bundle `.private-data/restore-points/post-release-a14-h1-h5-20260811-021ae1c5.bundle`, mode `0600`, SHA-256 `2ae4e178ac3762a4fbb321d36a08bddbeb2f520828b322a736f1421a773c0cc3`.
- `StalledJobRecoveryService` envanter sözleşmesine alındı; gerçek multi-replica/çift-retry davranışının değiştirilmesi ayrı bir ürün/mimari fazıdır ve bu kapanışta yapılmadı.
- Sıradaki güvenli adım A.1.4-B'yi doğrudan çalıştırmak değil; least-privilege, kısa ömürlü credential, salt-okunur sorgu/eylem allowlisti, redaksiyon, evidence formatı ve abort koşulları için önce design-only collector sözleşmesidir. Ayrı kullanıcı onayı olmadan canlı collector geliştirilmeyecek veya çalıştırılmayacaktır.
- Push, tag-push, deploy, production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi, migration, seed veya veri mutasyonu yapılmadı. Production NO-GO sürüyor.

## Active Focus - 2026-08-12 A.1.4-B Design-Only Collector Contract

- Yeni kanonik design-only belge: `.ai/issues/2026-08-12-production-readonly-inventory-collector-design.md`. Collector geliştirilmedi veya çalıştırılmadı.
- Kaynak incelemesi beş zorunlu genişletme belirledi: key-level DB↔R2 parity, exact-known-key Redis envanteri, R2 action-scoped child credential, ayrı runtime/local-volume adapterları ve üç sistem için bounded moving-target semantiği.
- İlk bağımsız güvenlik turu Critical/High/Medium `0/2/3` buldu. Redis `SCAN` ACL varsayımı, DB↔R2 false-static parity, PostgreSQL efektif PUBLIC hakları, R2 parent secret sınırı, object-key persistence/retention ve local-volume kapsamı tasarımda düzeltildi.
- Final bağımsız security re-review: yalnız design-only kapanış için GO, Critical/High/Medium `0/0/0`. Bağımsız planner aynı eksikleri doğruladı ve sıradaki fazın canlı erişim değil offline contract/test/collector implementation olması gerektiğini belirtti.
- Sıradaki güvenli teknik faz A.1.4-B1 offline TDD'dir: exact SQL/SDK/Redis sözleşmesi, adapter interface'leri, evidence schema ve fake/disposable transport harness'leri. Credential provisioning ve production observation ayrıca onaylanmadan yapılmayacaktır.
- `StalledJobRecoveryService` multi-replica ürün davranışı bu faza dahil değildir. Production deploy ve A.1.4-B canlı observation NO-GO olarak kalır.

## Active Focus - 2026-08-12 A.1.4-B0 Offline Collector Core

- A.1.4-B0 yalnız yerel, import-safe ve network-capability içermeyen collector çekirdeği olarak tamamlandı. Concrete production transport, credential provisioning, CLI invocation ve canlı observation bu kapsamda yoktur.
- Modüler çekirdek PostgreSQL, R2 ve Redis adapter sözleşmelerini; çift gözlem penceresini; storage-reference sınıflandırmasını; kapalı evidence üretimini ve private/no-clobber/READY-last publisher sözleşmesini uygular.
- PostgreSQL adapterı dedicated read-only/repeatable-read session, exact migration ledger ve least-privilege kontrolleri uygular. R2 adapterı yalnız `ListObjectsV2` ve `HeadObject`; Redis adapterı yalnız dokuz kanonik queue için exact-known-key okumaları kabul eder. `SCAN`, `KEYS`, Lua ve yazma işlemleri yasaktır.
- Son odaklı doğrulama `21/21`; coverage line `%96.81`, branch `%82.53`, function `%96.47`. Geniş operations-safety paketi `193/193`; syntax, Prettier ve `git diff --check` temizdir.
- Bağımsız code-review ve security-review frozen snapshot üzerinde GO verdi; Critical/High/Medium `0/0/0`.
- Kod/test/tooling commit'i yalnız yerelde oluşturuldu: `f6982564` (`feat(release): add A14B offline collector core`). İlk kapanış docs commit'i `3c7c9fe1`, final addendum commit'i `1107b7fa`.
- Kanonik final restore tag'i `restore/post-release-a14b-offline-core-final-20260812-1107b7fa`; tag hedefi `1107b7fa633abce35b27d6ebd0754a7a990a9bea`. Complete-history bundle `.private-data/restore-points/post-release-a14b-offline-core-final-20260812-1107b7fa.bundle`, SHA-256 `7d2f17fd8556acd2ca3124cf32cadaf3477f6f6617ee9c77aa43d86a9c66e8eb`; `git bundle verify` geçti.
- Production PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi, credential okuma/oluşturma, migration, seed, queue/object/Redis mutation, push, tag-push veya deploy yapılmadı. B1 canlı adapter/observation ve production deploy **NO-GO** kalır.

## Active Focus - 2026-08-12 A.1.4-B0 Follow-up Hardening

- Claude'un A.1.4-B0 bağımsız doğrulamasındaki B0-2 recovery kayıt bulgusu ayrı docs commit'i `db8d53b9` ile kapatıldı; final `1107b7fa` tag/bundle/SHA kanıtı kanonik belgelere eklendi.
- B0-1 Medium için offline orchestrator artık moving-target ve DB-referenced-but-missing R2 durumlarında abort etmek yerine kapalı, `ready:false`, `productionGo:false` diagnostic bundle üretir. Publisher bu blocked diagnostic artifact'lerini yazar ancak `READY.json` üretmez.
- B0-4 kapandı: `manual-psql-fix` tarihsel migration marker'ı artık varsayılan olarak reddedilir; yalnız exact `acknowledgedHistoricalMarkers` parametresiyle kabul edilir ve `historicalLedgerMarkersAccepted` evidence alanında görünür kalır.
- B0-5/B0-6/B0-7 kapandı: publisher `fileURLToPath` kullanır, temp dosya adları pid+UUID içerir, ham storage-key kalıbı secret/raw-material taramasına dahil edilir ve var olan run dizini `Evidence run directory already exists` sabit mesajıyla redakte edilir.
- Doğrulama: A.1.4-B hedef seti `25/25`, geniş ops-safety paketi `197/197`; syntax, Prettier ve `git diff --check` temiz. Bu kontroller yalnız local fake/offline harness ile çalıştı.
- B0-3 kapandı: çalışma commit'i `219d1142` olarak kaydedildi ve yeni restore point annotated tag ile oluşturuldu: `restore/post-release-a14b-b0-hardening-20260812-219d1142`. Tag object `2d5ab23b383a4e9b50e833660344a7f0737c6047`, peeled hedef commit `219d11428a96da7fdb6737e076a1f9ba946fe79b`.
- Complete-history bundle `.private-data/restore-points/post-release-a14b-b0-hardening-20260812-219d1142.bundle`, mode `0600`, SHA-256 `bbbb9a9636208ca2b81dab0a9ddd1f02c884825d587bb2b8101ad0bdf191554e`; `git bundle verify` geçti ve tag type `tag` olarak doğrulandı.
- A.1.4-B0 B0-1 üzerinden B0-7 dahil local/offline hardening artık commit'lenmiş ve doğrulanmış restore point ile kapalıdır. Production/live observation, B1 concrete transports, credential provisioning ve deploy **NO-GO** kalır.

## Active Focus - 2026-08-12 A.1.4-B1 Live Observation Preflight

- B0 kapanışı sonrasındaki ilk güvenli adım olarak docs-only preflight belgesi eklendi: `.ai/issues/2026-08-12-a14b-b1-live-observation-preflight.md`.
- Bu belge canlıya bağlanma veya collector çalıştırma yetkisi vermez; yalnız B1 canlı salt-okunur observation öncesi credential, evidence, bounded observation, DB↔R2 parity, Redis/BullMQ exact-known-key ve NO-GO kapılarını kilitler.
- B1 için geçerli sınır: concrete transports, credential provisioning, live observation ve production deploy hâlâ **NO-GO**. Ayrı açık kullanıcı onayı olmadan PostgreSQL/R2/Redis/SSH/Coolify/SharePoint erişimi yapılmayacak.
- Canlı sistemde bilet ve dosya hareketi devam ettiği için exact parity iddiası ancak düşük trafik/bakım penceresinde, before/after snapshotlar stable olduğunda değerlendirilecektir. Moving-target veya DB-referenced-missing-R2 sonucu `ready:false`, `productionGo:false` diagnostic artifact olarak kalmalıdır.
- Bu turda kod, test, migration, seed, deploy, push, tag-push, credential, production connection veya object/Redis/DB mutation yapılmadı.
- Claude'un iki bağımsız doğrulama turunda bulduğu B1-1 üzerinden B1-5 dokümantasyon bulguları kapandı; yeni bulgu kalmadı. Docs commit'i `454f6693` (`docs(release): close A14B B1 live observation preflight plan`).
- B1 preflight restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-preflight-20260812-454f6693`. Tag object `d067d68fa4b405712d6a07c9cbdfc4d183ef561c`; peeled hedef commit `454f6693c37f312313f55d75cf070c05df83bfa7`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-preflight-20260812-454f6693.bundle`, mode `0600`, SHA-256 `c708dbeb8feefa56be3807504694ae24b126401e3c294a12ab7e3757db18aeee`; `git bundle verify` geçti.
- B1 concrete transports, credential provisioning, live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır. Canlı gözlem yapılacaksa düşük trafik/gece penceresi tercih edilmelidir.

## Active Focus - 2026-08-12 B1 Night Observation and Deploy Gates

- Bu gece için güvenli operasyon sırası docs-only olarak kilitlendi: `.ai/issues/2026-08-12-a14b-b1-night-observation-and-deploy-gates.md`.
- Plan deploy'u otomatik hedef yapmaz; sıralama credential hazırlık kararı → ayrı açık B1 live read-only observation onayı → observation GO/NO-GO → backup/restore/rollback hızlı kapısı → final deploy GO/NO-GO → ayrı açık `deploy et` onayıdır.
- Varsayılan ilk B1 temel gözlem PostgreSQL/R2/Redis metadata ile sınırlıdır. SSH/Coolify runtime-topology kapsam dışında tutulur; gerekiyorsa ayrı açık onay ve komut seti gerekir.
- B1 observation ve olası deploy düşük trafik/gece penceresine bırakılmalıdır; canlı bilet/upload hareketi DB↔R2 exact parity'yi moving target yapabilir.
- Bu turda canlı sistem erişimi, credential işlemi, migration, seed, queue/object/Redis/DB mutation, push, tag-push veya deploy yapılmadı.
- B1 gece planı commit'lendi: `869e1f38` — `docs(release): close A14B B1 night observation and deploy gates plan`.
- Restore evidence: annotated tag `restore/post-release-a14b-b1-night-gates-20260812-869e1f38`, tag object `04fb516cb097889c4c5ea41d9845c996d9ab03a5`, peeled commit `869e1f38a37033eb9b64f8c12b09b94f14880012`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-night-gates-20260812-869e1f38.bundle`, mode `0600`, SHA-256 `3bc8da35eab7792349b813ddcf11eaa7d374bc1965ab896b31fdaf6a2587495f`; `git bundle verify` geçti.
- Credential provisioning, B1 concrete transports, B1 live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır.

## Active Focus - 2026-08-16 B1 Credential Provisioning Plan

- Sıradaki güvenli kapı docs-only olarak başlatıldı: `.ai/issues/2026-08-16-a14b-b1-credential-provisioning-plan.md`.
- Plan, PostgreSQL/R2/Redis için ayrı ve kısa ömürlü credential modelini, secret-handling sınırlarını, R2 `GetObject` compensating-control şartını, Redis exact-known-key gerekliliğini ve revocation/cleanup beklentisini tanımlar.
- Bu belge credential oluşturma, canlı observation, SSH/Coolify erişimi veya deploy yetkisi vermez. Tüm canlı kapılar hâlâ **NO-GO**.
- Claude bağımsız doğrulaması GO verdi; Critical/High/Medium `0/0/0`, yalnız append-only disiplinine dair içerik-nötr bir Low notu vardı ve ileriye dönük kural olarak kaydedildi.
- Docs commit'i oluşturuldu: `508bb43f` (`docs(release): close A14B B1 credential provisioning plan`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-credential-plan-20260816-508bb43f`. Tag object `a5de08ba2165f43f5414b3ba0f082e2cd5e66109`, peeled hedef commit `508bb43f4aee1936322bb474f1a1c69c131ff4ab`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-credential-plan-20260816-508bb43f.bundle`, mode `0600`, SHA-256 `1df4de44c9aed670a399e30a6f795549d9617bcdcddc75810240569bac686444`; `git bundle verify` geçti.
- Kullanıcı `B1 credential provisioning yöntemini onaylıyorum` cümlesini verdi; bu yalnız yöntem onayı olarak işlendi. PostgreSQL/R2/Redis credential üretimi, concrete transports, B1 live observation, SSH/Coolify runtime-topology ve deploy hâlâ ayrı açık onay gerektiren **NO-GO** kapılardır.
- Secret'sız operatör checklist'i credential planına eklendi; credential değerleri oluşturulmadı, okunmadı veya yazılmadı.
- Deploy öncesi veri güvenliği için yeni docs-only backup/restore gate planı eklendi: `.ai/issues/2026-08-16-a14b-b1-predeploy-backup-restore-gate.md`.
- Bu plan PostgreSQL custom dump + SHA + restore drill, R2 manifest/backup stratejisi, Redis/BullMQ runtime snapshot ve Coolify rollback hedefini deploy öncesi GO kapısı olarak tanımlar. Backup execution hâlâ ayrı açık onay gerektiren **NO-GO** kapısıdır.
- Claude, B1 pre-deploy backup/restore gate planını bağımsız doğruladı: GO, Critical/High/Medium/Low `0/0/0/0`; append-only sapması tekrarlanmadı.
- Docs commit'i oluşturuldu: `aecbf6c2` (`docs(release): close A14B B1 backup and credential planning`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-backup-gate-20260816-aecbf6c2`. Tag object `82a66bb6ef33ee4bc9dcc0bb9d65f9b333812b63`, peeled hedef commit `aecbf6c264c58557eed1e8ebd551b03ce95a52ed`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-backup-gate-20260816-aecbf6c2.bundle`, mode `0600`, SHA-256 `be55dd9585f68eed35c230be6367bb550d3e905948d2ac874e9e5bbfa0a58a2f`; `git bundle verify` geçti.
- Production PostgreSQL, Redis, Cloudflare R2, SSH, Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya yazılmadı.
- Credential provisioning, B1 concrete transports, B1 live observation, runtime-topology/SSH/Coolify erişimi ve production deploy hâlâ ayrı açık kullanıcı onayı gerektiren **NO-GO** kapılardır.
- Kullanıcı `B1 PostgreSQL credential provisioning başlat` cümlesini verdi; bu yalnız PostgreSQL credential üretim rehberliğini başlatır. Production PostgreSQL'e bağlanılmadı ve rol/parola/connection string oluşturulmadı, okunmadı veya yazılmadı.
- Credential planına yeni §14 eklendi: kısa ömürlü `LOGIN` + `NOINHERIT` + `default_transaction_read_only=on` rol, yalnız dört tablo için `SELECT`, effective-scope probe, `PUBLIC` privilege sızıntısı halinde fail-closed duruş ve revoke/drop planı. `VALID UNTIL` yalnız parola geçerliliğini sınırlar; cleanup kanıtı hâlâ gereklidir.
- PostgreSQL credential'ın gerçek üretimi kullanıcı/operatör tarafındaki ayrı production write adımıdır. Scope probe PASS gelmeden ve kullanıcı ayrıca `B1 canlı salt-okunur gözleme başla` demeden canlı gözlem **NO-GO** kalır.
- PostgreSQL credential rehberi docs commit'i: `46fe0ad7` (`docs(release): close A14B B1 PostgreSQL credential guidance`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7`. Tag object `d21dcab7fc3ddb43e40bb9c07e318a83d9eec489`, peeled hedef commit `46fe0ad70fee888f10e72f55fe3a6ca75e750fce`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-credential-20260816-46fe0ad7.bundle`, mode `0600`, SHA-256 `fa40a3cbcdd3b5c44310f702bb371accecae1ec007b7aa8fbcbd40c16ec57e00`; `git bundle verify` geçti.
- Kullanıcı/operatör Coolify PostgreSQL terminalinde geçici rolü oluşturdu ve parolayı `\password` ile set etti; parola/connection string Codex'e yazılmadı veya rapora eklenmedi. Rol adı: `a14b_inventory_ro_20260816`; hedef DB doğrulaması: `postgres`.
- Effective-scope probe **NO-GO** verdi: rol `PUBLIC`/varsayılan privilege etkisiyle hedef dışı database erişimi gördü (`aluplan_support`, `template1`) ve `TEMPORARY=true` çıktı; ayrıca public/pgvector fonksiyon execute satırları gözlendi. Bu nedenle B1 live observation başlatılmadı.
- Cleanup yapıldı: `REVOKE ...`, `DROP ROLE a14b_inventory_ro_20260816`, `COMMIT`; doğrulama sonucu `role_exists = f`. Geçici rol production'da kalmadı. Production backup, live observation, deploy, migration/seed veya veri mutasyonu yapılmadı.
- Claude bağımsız doğrulaması GO verdi; Critical/High/Medium/Low `0/0/1/0`. Tek Medium, credential planı §14.7'nin deneme sonrası stale kalmasıydı. Bu docs-only düzeltmeyle §14.7 "rehber hazırlandığı andaki sonuç" olarak daraltıldı ve §14.8 "Gerçek deneme sonucu" eklendi.
- Credential denemesi ve Medium-01 kapanışı docs commit'i: `c76f3758` (`docs(release): record B1 PostgreSQL credential attempt outcome`).
- Restore point annotated tag olarak oluşturuldu: `restore/post-release-a14b-b1-postgres-attempt-20260816-c76f3758`. Tag object `b4981c4709e4873c0731eeebe239e8441371f48a`, peeled hedef commit `c76f37588bc3191004a97628d6aecd087df0eb75`; tag type `tag` olarak doğrulandı.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-attempt-20260816-c76f3758.bundle`, mode `0600`, SHA-256 `4b68a51eeaf7e7b3623cdb693ebe342cba8f6a69b61feb13477917201da71378`; `git bundle verify` geçti.
- Bu restore kapanışı sırasında yeni production connection, credential read/write, role create/alter/drop, backup execution, B1 live observation, migration, seed, queue/object/Redis/DB mutation, push, tag-push veya deploy yapılmadı. B1 live observation ve production deploy hâlâ ayrı açık onay gerektiren **NO-GO** kapılardır.
- PostgreSQL credential NO-GO sonrası docs-only strateji kararı eklendi: aynı şablonla ikinci canlı rol denemesi yapılmayacak; production-wide `PUBLIC`/`TEMPORARY`/function execute revocation mevcut kapsam dışında kalacak. Varsayılan güvenli yol, PostgreSQL ledger/object-reference kanıtını pre-deploy backup/restore gate içindeki izole disposable PG17 restore üzerinden almak; alternatif public-default-aware adapter sözleşmesi ise ayrı design/TDD/security-review fazı gerektirir.
- Claude, bu strateji kararını GO verdi fakat Medium-01 temporal-skew notu ve iki Low netlik notu bildirdi. Düzeltildi: dump zaman damgası ile R2 before/after manifest penceresi birlikte kayda geçirilecek; R2 dump'ı kuşatmıyorsa fark `moving-target` sayılacak; `pg_dump` yolunun daha düşük privilege değil tek seferlik/operatör kontrollü geniş okuma işlemi olduğu yazıldı; adapter redesign hedefi `postgres-adapter.mjs` forbidden-function yorumu ile `functionRows.length !== 0` kontrolü arasındaki çelişki olarak netleştirildi.
- Claude kapanış doğrulaması Critical/High/Medium/Low `0/0/0/0` ile GO verdi. Docs commit'i: `9f2b43bb` (`docs(release): close B1 PostgreSQL credential strategy findings`).
- Restore evidence: annotated tag `restore/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb`, tag object `79465f77e3b0e0a5c6b9a1849ea02f91b8e0e6e9`, peeled commit `9f2b43bb4106c1603c6e6a28cfb245594363b890`.
- Verified complete-history bundle: `.private-data/restore-points/post-release-a14b-b1-postgres-strategy-20260816-9f2b43bb.bundle`, mode `0600`, SHA-256 `98494cda53c27842e085d121731c82cfabcda8cea039619d50ea573df280a4b8`; `git bundle verify` geçti.
- Bu kapanış production erişimi, credential işlemi, backup execution, B1 live observation, push, tag-push veya deploy içermedi. Production deploy hâlâ **NO-GO**.
- Kullanıcının `B1 R2 offline credential minting aracını hazırla` onayıyla yalnız local/offline signer geliştirildi. Araç `aluplan-support-desk` + `ListObjectsV2`/`HeadObject` + 900 saniye sözleşmesini sabitler; parent secret yalnız hidden TTY'den gelir, metadata secretsızdır ve child dosyası `0600`/no-clobber yayınlanır.
- Minting kodu collector çekirdeğinden ayrı `scripts/a14b-minting/` sınırındadır ve collector entrypoint'inden export edilmez. Bu turda gerçek Cloudflare tokenı/credential'ı üretilmedi veya okunmadı; Cloudflare/production erişimi ve canary yapılmadı.
- R2 offline minting focused testleri final hardening sonrası `16/16`, A14B birleşik testleri `41/41`, geniş ops-safety paketi sıralı temiz koşuda `213/213` geçti. Focused coverage `%86.54` lines / `%83.44` branches / `%82.05` functions; syntax, Prettier ve `git diff --check` temiz. Metadata secret/unknown-field fail-open, post-write ve post-publish cleanup ile TTY EOF/error/close bulguları kapandı; bağımsız TDD/code/security re-review Critical/High/Medium/Low `0/0/0/0` ile GO verdi.
- Yerel kapanış commitleri: `3b2d5edb` (tool), `2ffe6d7b` (tests), `b90b6279` (docs). Annotated restore tag `restore/post-release-a14b-r2-offline-mint-20260820-b90b6279`; tag object `5a7c7d9dd2cb542fdbca466293eca72aa4ee7f98`, peeled commit `b90b6279832e2cc944d6028789fc52882d2d355b`. Complete-history bundle `.private-data/restore-points/post-release-a14b-r2-offline-mint-20260820-b90b6279.bundle`, mode `0600`, SHA-256 `9aaec3e369b69b4ebacbe63040add03ee93dd90c4afa417ec71486f6a7f1b479`; `git bundle verify` geçti.
- Gerçek parent token oluşturma, gerçek child mint, provider scope/canary, B1 live observation ve production deploy ayrı açık onay gerektiren **NO-GO** kapılarıdır.
