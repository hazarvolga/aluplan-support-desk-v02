# Condensed Project Memory

## Current release checkpoint — 2026-09-23 (supersedes historical status below)

- WebSocket patch source2e9c7ebf is now in exact Linux/amd64 image76432eed. Static smoke passed; actual-image15tests RED7pass/8fail onold6ae3→GREEN15/15 onnew. CompiledCSRF/log and nonroot/app-write boundary unchanged. No app bootstrap/currentcustomerdata.
- Same Trivy0.72.0/frozenDB:2C128H183M23L→2C123H182M23L, exactly6removed/0added. Independent identity/report/test evidence reviewPASS; privateevidencevuln-ws-20260922-amWugP retained and ownedcontainers removed. TwoCriticals remain globalnpm/pnpm tar; not production-ready.
- Next mailparser/nodemailer compatibility/advisory review and synthetic tests; no realmailbox. Remaining document/tooling/crawler, exactartifact browser/DB/mail, attachmentbytes/newwrite forwardrecovery and separately approved host/credential/freshbackup gates remain. Local-only; no push/deploy or live action authorized by "continue".

## Current release checkpoint — 2026-09-22 (supersedes historical status below)

- Latest gate: exact candidate6ae3 and previousLOCALb112 scanned offline with same freshSeptember22DB/Trivy0.72.0. Identical2Critical/128High/183Medium/23Low;336occurrences,90uniqueHighCriticalIDs. Criticals are tar6.2.1 under npm+pnpm. Source/deps unchanged; no production access/appboot. Private evidencevuln-6ae3-20260922-GNSnSY, full OCIindex→manifest→config identity verified, scanner containers absent.
- Next smallest patch: engine.io/socket.io-parser/ws with gateway/auth regressions and bounded malformed-input tests; mail/parser and retained tooling separate. Crawler has privileged URL intake but no wiredSSRFguard and no browser sandbox; requires containment decision. Full advisory triage and independent security review incomplete (agents hit usage limit). No scan-clean/readiness claim; productionNO-GO. Prior bullet stating scan pending is now historical.

- Latest artifact supersedes the old3403/b112 limitation below: clean source6a0be372 → Linux/amd64 image6ae3a638; build/static smoke and compiled two-warning CSRF redaction verified. Run cde676d3cece passed all12 real-browser auth/reset checks and durable fixture verification, unexpected0/proxyErrors0. Original reference unchanged; exact owned resources absent after cleanup. No tracked product change in this step.
- Next: exact-image vulnerability assessment with scanner/advisory DB provenance. OS packages re-resolved during build despite unchanged Dockerfile/lock; older advisory counts do not apply. No new-image scan yet. Historical180/563/114 counts are not live or full content/byte parity. Browser remains localdev53f55fae, not production frontend/TLS/dashboard/automatic refresh proof. Mail/bytes/forward-recovery/approved-host/fresh-backup gates remain; production NO-GO. The remaining bullets describe the preceding checkpoint.

- Canonical working checkout: `aluplan-release-candidate-20260919`, branch `security/release-candidate-20260919`; latest tooling checkpoint `1b625c45`. Existing architecture and release scope retained; no production/push/deploy authority from "continue".
- Actual-backend browser run `46931334e73b` passed all12 auth/reset assertions plus durable fixture verification, unexpected0/proxyErrors0. Test-only graceful close on known403 denials resolved the observed idle-connection teardown failure in two bounded synthetic repeats; no counter suppression. Combined44 focused tests passed.
- Evidence applies to older backend3403ae61/imageb112 and local dev frontend/browser53f55fae, NOT final release artifacts. Backend source-only CSRF log fix0dc5aac0 still needs exact Linux/amd64 build/rehearsal. Browser uses a bounded dev redirect adapter and scoped local certificate exception; dashboard/publicTLS/automatic frontend refresh remain outside this gate.
- Historical sanitized September17 reference unchanged. Pre/post clone counts180tickets/563messages/114attachment records; users1285→1286 is one test identity. Owned test resources removed and absence verified. No live access or customer-data overwrite; no whole-dataset/attachment-byte preservation claim from counts alone.
- Next: existing exact-image build and final-artifact verification. Remaining release gates include mail transport, attachment bytes, new-write/byte forward recovery under ADR-022, vulnerability decisions and separately approved host/credential/fresh backup checks. Production NO-GO. Use current-focus/session-summary/source-consolidation for evidence; the older RAG/status notes below are historical, not current validation.

## Project Purpose

Aluplan Support Desk is an AI-assisted ticket system for Allplan/BIM support workflows. It combines a NestJS backend, Next.js frontend, PostgreSQL/Prisma database, pgvector retrieval, knowledge pool imports, and customer-facing ticket flows.

## Architecture Snapshot

- Backend: NestJS API on port 4000 with AI, tickets, knowledge pool, auth, notifications, CRM, email, and settings modules.
- Frontend: Next.js App Router on port 3000 with localized dashboard flows.
- Database: PostgreSQL + Prisma client generated into `packages/database/client/`.
- RAG: knowledge articles, knowledge pool embeddings, ticket embeddings, prompt context building, provider dispatch, and bounded fallback behavior.
- Intelligence tools: Graphify and GitNexus are preferred over raw Markdown reports for architecture discovery.

## Critical Services

- `AiService`: provider dispatch, retries, fallback, and provider routing.
- `AiQueryService`: customer diagnosis, retrieval, reranking, answer generation, and sync/async behavior.
- `EmbeddingService`: article, ticket, and knowledge-pool embeddings.
- `RagMaintenanceService`: vector extension, dimensions, and index maintenance.
- `NotificationsGateway`: Socket.io connection and real-time notification hub.

## Last Stable Direction

- Backend startup was stabilized by disabling Nest asset watchers during build.
- AI diagnosis is optional for ticket creation.
- Sync diagnosis avoids quota-heavy model reranking and uses bounded fallback behavior.
- Turkish fallback summaries were added to avoid raw English customer-facing output when Gemini is delayed.
- The project should stay on pgvector for now and measure the real bottlenecks before considering Qdrant.
- PDF-first RAG import is paused after controlled support-first batches 001-011; the corpus is usable enough for acceptance testing before importing more files.
- Last verified RAG import state: 79 knowledge sources, 696 knowledge-pool embeddings, all `3072 / v2_2`.
- The ready manifest still has remaining files, but the next phase is a 20-30 question TR/EN/DE RAG acceptance test, not blind bulk import.

## Current Risks

- Gemini free-tier quota can cause 429 responses and long retry windows.
- 3072-dimensional Gemini embeddings need explicit database/vector dimension handling.
- Old RAG data can pollute new retrieval if not cleaned before re-import.
- Root Markdown, imported agent blocks, and duplicated AGENTS/CLAUDE content may be stale.
- Uncommitted changes currently mix product RAG edits with tooling/spec/agent noise.
- Legacy `General` knowledge sources can still appear behind new categorized PDF sources and should be watched during acceptance testing.
- Production release remains NO-GO despite successful local A.1.3 restore evidence and DEV R2/SharePoint canaries. A.1.4 now has an offline, network-incapable inventory contract, but no live PostgreSQL/R2/Redis inventory has been authorized or collected.
- Production age key custody is unresolved: keeping both DEV recovery identities on one Mac is acceptable only for DEV evidence, not production disaster recovery.

## Do Not Assume

- Do not assume indexed-looking documents are actually embedded and searchable; verify DB rows and retrieval results.
- Do not assume root-level reports reflect current code.
- Do not assume AI must answer before a customer can create a ticket.
- Do not change high-blast-radius AI symbols without Graphify/GitNexus context when available.
- Do not commit `.agents`, `.kiro`, or generated tool context together with product-code fixes unless explicitly requested.
- Do not treat A.1.4 preparation artifacts or DEV backup canaries as live production evidence or deploy authorization. Live read-only inventory requires a separate user approval and least-privilege credentials.
