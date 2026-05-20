# RAG & Retrieval Rules

Read this before designing, modifying, or debugging anything in `knowledge-base/`, `knowledge-pool/`, or the retrieval / reranking / context-assembly parts of `ai/`. The canonical implementations live in:

- `apps/backend/src/config/rag.config.ts` (single source of truth for parameters)
- `apps/backend/src/ai/embedding.service.ts` (vector writes + search)
- `apps/backend/src/ai/prompt-context-builder.service.ts` (priority-based context assembly)
- `apps/backend/src/ai/ai-query.service.ts` (retrieval orchestration)
- `apps/backend/src/ai/rag-maintenance.service.ts` (index + dimension maintenance)
- `apps/backend/src/ai/embedding-version.registry.ts` (active version + dim resolution)

## 1. `rag.config.ts` is the single source of truth

```typescript
// apps/backend/src/config/rag.config.ts
export const RAG_CONFIG = {
    SIMILARITY: { THRESHOLD: 0.25, EXACT: 0.95, HIGH: 0.85, MEDIUM: 0.70, LOW: 0.62, FLOOR: 0.45 },
    CHUNKING:   { PARENT_MAX_TOKENS: 1000, CHILD_MAX_TOKENS: 500, OVERLAP_TOKENS: 200, MIN_CHUNK_SIZE: 100 },
    CONTEXT:    { MAX_CONTEXT_CHARS: 12000, MAX_CONTEXT_TOKENS: 4096, RESPONSE_RESERVE_CHARS: 3000, ... },
    CACHE:      { DEFAULT_TTL: 3600, VERSION: 'v9' },
    RERANK:     { FACTORS: { ARTICLE: 1.30, FAQ: 1.35, DOCUMENT: 1.15, URL: 0.60, TICKET: 0.50 }, WEIGHTS: { SEMANTIC: 0.70, RECENCY: 0.15, RATING: 0.15 }, RECENCY_DECAY_DAYS: 30 },
    SEARCH:     { DEFAULT_LIMIT: 5, PRE_RERANK_LIMIT: 20 },
    EMBEDDING:  { DEFAULT_VERSION: 'v1', CLEANUP_DELAY_MS: 24*60*60*1000, MIGRATION_BATCH_SIZE: 50, GEMINI_DIM: 3072, OPENAI_DIM: 1536, OLLAMA_DIM: 768 },
} as const;
```

**Do not hardcode** thresholds, chunk sizes, cache TTLs, or rerank factors anywhere else. Always `import { RAG_CONFIG } from '../config/rag.config'`.

Many values are env-overridable (`SIMILARITY.THRESHOLD`, `SIMILARITY.LOW`, all `CHUNKING.*`, `CACHE.DEFAULT_TTL`). When changing operational behavior, prefer env overrides over code edits.

**Stale documentation alert:** `CLAUDE.md` §4.3 lists confidence bands as `> 0.85 high, 0.60–0.85 medium, 0.40–0.60 low, < 0.40 no_match`. The canonical values are in `rag.config.ts` (`HIGH: 0.85, MEDIUM: 0.70, LOW: 0.62 env-overridable`). Surface this discrepancy when relevant.

## 2. Embedding version isolation (ADR-007)

```prisma
model KnowledgeEmbedding {
    embedding        Unsupported("vector")              // NO dimension constraint
    embeddingVersion String  @default("v1") @db.VarChar(10)
    embeddingDim     Int     @default(1536)
    migratedAt       DateTime?
}
```

**Hard rules:**
1. The pgvector column has **no dimension constraint** (`Unsupported("vector")`, not `vector(N)`). This is deliberate — provider changes don't require column ALTER.
2. Every write tags `embeddingVersion + embeddingDim`. Every search filters by the **active** version + dim.
3. Mixing providers within one `embeddingVersion` is **forbidden** (ADR-006). When Gemini quota is exhausted, ingestion pauses — never falls back to OpenAI embeddings inside an active Gemini version.
4. HNSW indexes are in `scripts/migrate-hnsw-indexes.sql`, not the Prisma schema. Re-run after large migrations.
5. Active production index: **Gemini `v2_2 / 3072`** (current-focus). `RAG_CONFIG.EMBEDDING.DEFAULT_VERSION` is `'v1'` in code, but the **Settings DB override** sets it to `v2_2`.

When activating a new embedding version, the lifecycle is:
1. Add the new version to `EmbeddingVersionRegistry`.
2. Ingest into the new version alongside the old (dual-write).
3. Validate retrieval quality on the new version.
4. Flip the Settings DB active version.
5. Wait `RAG_CONFIG.EMBEDDING.CLEANUP_DELAY_MS` (24h) before deleting old embeddings — gives rollback window.

This is **never a hot swap.**

## 3. Provider dimensions

| Provider | Dim | Use |
|---|---|---|
| Gemini | `3072` | **Active embedding production** (`v2_2 / 3072`) |
| OpenAI | `1536` | **Chat fallback only** (ADR-006 forbids embedding fallback) |
| Ollama | `768` | Local fallback |

pgvector HNSW supports up to ~2000 dim, so the Gemini path uses **exact search** when dim exceeds HNSW compatibility (ADR-004). `RagMaintenanceService` handles index recreation when the active dim changes.

## 4. Retrieval orchestration

The canonical retrieval flow inside `AiQueryService`:

```
User query
  ↓
Detect query language       (apps/backend/src/ai/utils/hypothetical-document.ts)
  ↓
Rewrite with conversation history (if multi-turn)
  ↓
Expand with synonyms        (apps/backend/src/ai/utils/synonym-dictionary.ts)
  ↓
Generate hypothetical doc (HyDE)
  ↓
Embed query  →  EmbeddingService.search(...)
  ↓
Hybrid: semantic (vector)  +  keyword (PostgreSQL FTS)
  ↓
Re-rank with RAG_CONFIG.RERANK.{FACTORS, WEIGHTS}
  ↓
Apply title-specific boosting (preserves specificity over generic FAQ rank)
  ↓
Build context via PromptContextBuilderService
  ↓
Send to LLM with MASTER_DIAGNOSIS_PROMPT + buildSupportAnswerContractPrompt
  ↓
Self-check confidence (apps/backend/src/ai/utils/answer-self-check.ts)
  ↓
Persist to AiInteraction + emit via WebSocket (if async)
```

Every stage logs to `retrieval_log` via `RagObservabilityService`. **Without this log, retrieval regressions are unfixable** — treat it as a first-class artifact.

## 5. Source confidence hierarchy

From `RAG_CONFIG.RERANK.FACTORS` (multipliers applied to base similarity):

| Source type | Factor |
|---|---|
| `ARTICLE` (admin-curated KB) | `1.30` |
| `FAQ` (approved AI FAQ) | `1.35` |
| `DOCUMENT` (official PDF/document) | `1.15` |
| `URL` (whitelisted URL) | `0.60` (penalty — less trusted) |
| `TICKET` (resolved-ticket-derived) | `0.50` (penalty — least authoritative) |

The blend weights:

| Weight | Value |
|---|---|
| `SEMANTIC` | `0.70` |
| `RECENCY` | `0.15` |
| `RATING` | `0.15` |

Recency decay: `30` days (configurable). Within decay, recency contributes; beyond, it's flat.

When proposing a rerank change, change `RAG_CONFIG.RERANK` — not service code that re-implements the calculation.

## 6. Confidence bands — single source

From `rag.config.ts`:

| Band | Threshold | Routing |
|---|---|---|
| `HIGH` | `≥ 0.85` | Present as suggested answer |
| `MEDIUM` | `≥ 0.70` | Present with caveats |
| `LOW` | `≥ 0.62` (env-overridable via `LOW_CONFIDENCE_THRESHOLD`) | Present cautiously; `suggestTicket: true` |
| `NO_MATCH` | `< LOW threshold` or `isNoKnowledgeAnswer` matched | Do not present; ticket creation flow |

`NO_MATCH` is a **runtime-only** band — see `ai-answer-contract.md` for the 3-vs-4-level type asymmetry.

## 7. Priority-based context assembly

`PromptContextBuilderService.buildContext({ userId, userQuery, kbContent, hotinfoSnapshot, messages, diagnosis })` assembles the LLM context by **priority**, not by raw retrieval order:

| Section | Priority | Notes |
|---|---|---|
| `APPROVED_KNOWLEDGE_SOURCE` | 10 | KB content — **most critical, placed first for LLM attention** |
| `USER_QUERY` | 9 | The active query |
| `HOTINFO_DATA` | 8 | Customer's Allplan diagnostic snapshot (when present) |
| `RECENT_TICKETS` | 5 | Open tickets for this customer (top 3) |
| `USER_PROFILE` | 4 | Name, email, company, industry |
| `SYSTEM_RULES` | 3 | Platform-level rules |
| `MACROS` | 1 | Prepared response templates |

The builder fits sections into `RAG_CONFIG.CONTEXT.MAX_CONTEXT_CHARS` (default 12000), reserving `RESPONSE_RESERVE_CHARS` (3000) for the LLM's output.

**Do not bypass `PromptContextBuilderService`** by assembling prompts in business code. The priorities encode the source confidence hierarchy and the operational lessons from real production debugging.

## 8. Hotinfo — ticket-scoped, not global RAG

Hotinfo is the customer's Allplan diagnostic snapshot (system info, GPU, drivers, modules, error traces). It is **ticket-scoped, not global RAG corpus** (`.ai/current-focus.md`):

- **Raw Hotinfo traces stay out of retrieval queries** — they would pollute embedding similarity with unrelated system identifiers.
- **Safe Hotinfo system signals** (Allplan version, OS, GPU) can enrich retrieval **when the user explicitly asks for Hotinfo/system analysis**.
- **Full Hotinfo fields are injected into the prompt context** by `PromptContextBuilderService` via the `HOTINFO_DATA` section, with structured Turkish labels (`[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]`).
- Error traces are **truncated at 1200 chars** before injection.

Persistence: `Ticket.hotinfoSnapshot Json?` with GIN index. Customer profile may also hold a Hotinfo snapshot in `CustomerProfile.hotinfoData`.

When proposing changes to retrieval, **do not silently include Hotinfo in the global query**. It belongs in the per-ticket context, not the embedding-space query.

## 9. Chunking

```typescript
CHUNKING: {
    PARENT_MAX_TOKENS: 1000,    // parent chunks — for LLM context
    CHILD_MAX_TOKENS:  500,     // child chunks — for vector search
    OVERLAP_TOKENS:    200,     // prevents information loss at boundaries
    MIN_CHUNK_SIZE:    100,     // absolute floor — no fragments
}
```

**Hierarchical chunking pattern:** small children for precise vector match, larger parents fed to the LLM. The retrieval matches on child chunks; the LLM receives the parent for sufficient context.

Sequencing is preserved via `KnowledgeEmbedding.sequence` so the LLM can reassemble adjacent chunks in order when relevant.

## 10. Semantic cache (R-P1)

```prisma
model AiResponseCache {
    queryHash        String   @unique
    queryEmbedding   Unsupported("vector")?
    embeddingVersion String?
    embeddingDim     Int      @default(1536)
    response         Json
    tenantId         String   // multi-tenant residue — single-tenant in practice
    confidence       String
    createdAt        DateTime @default(now())
    expiresAt        DateTime
}
```

- TTL: `RAG_CONFIG.CACHE.DEFAULT_TTL` (3600s = 1h, env-overridable).
- Cache key version: `RAG_CONFIG.CACHE.VERSION` (currently `'v9'`). **Bump the version → global invalidation.**
- Semantic similarity: lookups use the query embedding to find near-identical queries within 5 minutes (R-P1).
- **R-P1 is mandatory** — same query within 5 minutes must serve from cache.

`tenantId` is **residue from abandoned multi-tenancy**. Do not extend it; treat new cache writes as single-tenant.

## 11. The retrieval improvement playbook

When asked to "improve retrieval," ask before proposing:

1. **What's the failure mode?**
   - Missing relevant docs (recall)
   - Wrong docs ranked high (precision)
   - Correct docs but hallucinated answer (grounding)
2. **What does the retrieval log say?** Pick 10 recent failures, look at `RagObservabilityService` output.
3. **Are filters applied correctly?** (Product, language, source type.)
4. **Is the rerank pool large enough?** (`SEARCH.PRE_RERANK_LIMIT = 20` is the default; rerank from ≥ 3× `topK`.)
5. **Is the active embedding version stale?** Check `EmbeddingVersionRegistry`.
6. **Last:** consider new models, new indexes, new pipelines.

Reaching for a new model before checking the log is the leading anti-pattern.

The active acceptance set is `.ai/rag-quality/acceptance-questions.json`. Run `.ai/rag-quality/run-acceptance.mjs` before declaring a retrieval change done — quota-aware delay is built in.

## 12. ADR-002 — low-rate ingestion (Gemini free tier)

Knowledge pool sync and bulk import are **throttled by design**:

```typescript
KNOWLEDGE_SYNC_RATE_MAX           // requests per window
KNOWLEDGE_SYNC_RATE_DURATION_MS   // window duration
KNOWLEDGE_SYNC_QUEUE_CONCURRENCY  // worker concurrency cap
KNOWLEDGE_SYNC_BULK_DELAY_MS      // pacing between bulk operations (default 15000)
KNOWLEDGE_SYNC_EMBED_DELAY_MS     // pacing between embedding calls (default 6000)
```

When designing a new ingest path:
1. Respect these env limits — read them via `ConfigService` or the validated env schema.
2. Bulk operations bounded by `KNOWLEDGE_SYNC_BULK_DELAY_MS`.
3. Partial embedding writes are **cleaned up on failure** — do not leave half-embedded sources marked as healthy.
4. An unchanged source with **zero embeddings** must re-index or fail clearly. Never mark "unchanged hash + zero vectors" as success (`.ai/current-focus.md` known risk).

## 13. Cost governance

```typescript
KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD: true    // default
KNOWLEDGE_SYNC_DAILY_EMBED_USD_CAP         // hard daily cap
KNOWLEDGE_SYNC_EMBED_USD_PER_MILLION_TOKENS
KNOWLEDGE_SYNC_EMBED_COST_MULTIPLIER       // default 1.5 (safety factor)
AI_GLOBAL_DAILY_CAP                        // global cap
AI_USER_DAILY_QUOTA                        // per-user cap
```

`AiBudgetMonitorService` consults these. When budget exceeded:
- Embedding ingestion **stops** (with clear log line, not silent skip).
- Chat fallback chain degrades to cheaper providers.
- Confidence threshold raises (fewer auto-suggestions, more escalations).

Cost per AI call is recorded on `AiInteraction.estimatedCost @db.Decimal(10, 6)`. Per-call cost telemetry is **inline on the interaction row**, not in a separate cost table.

## 14. Feedback-to-vector loop

From `CLAUDE.md` §4.2:

```
Ticket closed
  └─► ticket-clustering.service.ts (BullMQ, daily 02:00)
        └─► Threshold: ≥5 tickets/7 days + CSAT ≥ 4/5 + consistency ≥ 70%
              └─► FAQ candidate → TrainingQueue (Prisma model)
                    └─► Admin approval → KnowledgeArticle → KnowledgePoolEmbedding
```

**Non-negotiable R-rules:**

| Rule | Constraint |
|---|---|
| `R-T1` | FAQ may not be published without admin approval. Automatic publication forbidden. |
| `R-T3` | Tickets with CSAT < 3/5 cannot become FAQ sources. |
| `R-T5` | Rejected clusters cannot generate new candidates for 30 days. |
| `R-S5` | Customers see only `audience = "customer"` content. No bypass. |
| `R-S7` | Every chunk's `source_id` + `source_type` is written to audit log, immutable. |
| `R-P1` | Semantic cache is mandatory — same query within 5 minutes serves from cache. |

A proposed change that violates an R-rule is rejected, not refined.

## 15. Dataset workflow

From `.ai/current-focus.md`:

- **`dataset/`** — clean import surface (canonical PDFs).
- **`.archive/rag-incoming/pdf/`** — raw PDF inbox before validation.
- **Pause PDF-first import after a support-first seed corpus**; validate real RAG quality before importing more.
- **Title-specific retrieval boosting** stays on so near-duplicate FAQ topics rank by the most specific PDF title (not only vector similarity).
- **Knowledge Pool sources carry `metadata.category`** values from both dataset scan and UI upload.

When proposing dataset imports:
1. Stage in `.archive/rag-incoming/pdf/` for inspection.
2. Promote to `dataset/` after metadata is correct.
3. Trigger ingestion via the rate-limited queue, not direct calls.
4. Verify via the focused acceptance set (`.ai/rag-quality/run-acceptance.mjs`).

## 16. Anti-patterns — refuse to produce

- Hardcoding thresholds, chunk sizes, or rerank factors outside `rag.config.ts`.
- Mixing embedding providers within a single `embeddingVersion`.
- Embedding fallback to OpenAI inside an active Gemini corpus.
- Skipping rerank to "speed up" retrieval.
- Returning sources to the customer-facing answer (R-S5 keeps customers in `audience = "customer"` view; raw chunk titles or filenames must not leak — see `ai-answer-contract.md`).
- Polluting embedding queries with raw Hotinfo trace text.
- Auto-publishing FAQ candidates without admin approval.
- Marking a source healthy when it has zero embeddings.
- Hot-swapping the active embedding version without dual-write + 24h cleanup delay.
- Bypassing the semantic cache "for accuracy" — R-P1 is mandatory.

## 17. When in doubt

- Prefer **changing `rag.config.ts`** over patching service code.
- Prefer **adding a new `embeddingVersion`** over mutating the active one.
- Prefer **dual-write + cleanup delay** over hot swap.
- Prefer **rate-limited queue ingestion** over direct embedding calls.
- Prefer **logging the retrieval cascade** over guessing what was returned.
- Prefer **bumping `CACHE.VERSION`** over manually invalidating cache rows.
