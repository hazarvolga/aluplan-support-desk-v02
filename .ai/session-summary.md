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
