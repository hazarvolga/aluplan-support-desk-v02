# Current Focus

## Active Work

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
