# Current Focus

## Active Work

- Operations dashboard implementation is in progress:
  - Phase 1 backend aggregate endpoint added at `GET /dashboard/ops`.
  - Endpoint returns real DB/queue-backed operations data for active tickets, SLA pressure, AI quality/cost estimates, CRM changes, knowledge/crawler state, system health, live feed, and trend series.
  - AI cost data is intentionally visible only to admin/superuser roles; support agents receive `cost: null`.
  - Empty trend series are deterministic zero-value series, not decorative fake data.
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

- **DMARC Enforcement Reminder (Post-Deploy + 2-3 weeks):**
  Sistemi canliya aldiktan ve destek e-postalarinin duzgun calistigindan tamamen emin olduktan 2-3 hafta sonra, DNS barindiriciniza (Cloudflare, cPanel vs.) girip DMARC kaydinizdaki `p=none` ibaresini `p=quarantine` veya `p=reject` olarak degistirmelisiniz.
  *Yeni Kod Boyle Olmali:* `"v=DMARC1; p=reject; rua=mailto:destek@allplan.net.tr; adkim=s; aspf=s"`
  *Etkisi:* Bu degisikligi yaptiktan sonra hic kimse domain adinizi kullanarak sahte e-posta atamaz (Spoofing) ve IP/Domain itibarınız tamamen altin seviyeye (maksimum spam korumasina) ulasir.
