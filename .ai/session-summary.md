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
