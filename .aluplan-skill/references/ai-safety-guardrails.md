# AI Safety & Guardrails

Read this before designing, modifying, or extending any AI generation, validation, or routing logic in `apps/backend/src/ai/`. The platform serves real support agents resolving real customer tickets — wrong answers cost real engineering time and customer trust.

## 1. Core principle

The platform prefers **clear escalation + ticket creation** over **confident invention**. Every guardrail below enforces that preference.

ADR-003 makes this explicit: **AI diagnosis is optional**. Ticket creation must work even when the AI is unavailable, degraded, or unsure. The frontend always exposes a direct ticket path. When AI confidence is low, the customer flow routes to ticket creation — it does not retry harder or hedge.

## 2. Confidence-driven routing

Bands come from `RAG_CONFIG.SIMILARITY` (see `rag-retrieval-rules.md`):

| Band | Threshold | Routing |
|---|---|---|
| `HIGH` | `≥ 0.85` | Present as suggested answer (customer + agent Copilot) |
| `MEDIUM` | `≥ 0.70` | Present with caveats; review encouraged |
| `LOW` | `≥ 0.62` (env-overridable via `LOW_CONFIDENCE_THRESHOLD`) | Present cautiously; `suggestTicket: true` |
| `NO_MATCH` | `< LOW threshold` or `isNoKnowledgeAnswer` matched | Do **not** present; frontend routes to ticket creation |

Thresholds belong in `rag.config.ts`. **No magic literals in business code.** Quarterly review against labeled outcomes is the canonical tuning cadence.

The runtime type is 4-level (`HIGH | MEDIUM | LOW | NO_MATCH`); the Prisma `ConfidenceBand` enum is 3-level. The asymmetry is intentional — see `ai-answer-contract.md` §6.

## 3. The validator — `isNoKnowledgeAnswer`

```typescript
// apps/backend/src/ai/ai-answer-quality.ts
const NO_KNOWLEDGE_PATTERNS = [
    /mevcut bilgi kayna[gğ][iı]nda yer alm[ıi]yor/i,
    /bilgi kayna[gğ][iı]mda yeterli d[oö]k[uü]man bulunmuyor/i,
    /yeterli d[oö]k[uü]man bulunmuyor/i,
    /destek talebi olu[sş]tur/i,
    /no specific knowledge/i,
    /not enough information/i,
    /does not contain specific technical information/i,
];
```

When the LLM admits its own uncertainty, the routing layer treats the response as `NO_MATCH` regardless of the raw similarity score. The LLM's self-flag wins over numeric confidence.

When adding new no-knowledge phrasings (in any of the three supported languages), add the regex here, write a unit test, and verify the routing change downstream.

This is **not** a general-purpose claim-grounding validator. The platform relies on:
- The prompt contract (`ai-answer-contract.ts`) instructing the LLM to ground in `[CONTEXT]`.
- The retrieval pipeline filtering to authoritative sources (rerank factors in §5 of `rag-retrieval-rules.md`).
- Source attribution recorded on `AiInteraction.matchedArticleId` / `matchedVersionId`.

A heavier post-hoc claim-to-source NLI validator does **not** exist in the current codebase. Do not assume its presence.

## 4. The shared answer contract

Both `AiQueryService` (customer-facing) and `AiCopilotService` (admin-facing) call `buildSupportAnswerContractPrompt(...)` from `apps/backend/src/ai/ai-answer-contract.ts`. This guarantees:

- Same core solution for customer and agent (the "Answer Drift Reset Phase 4" fix).
- Required markdown section shape, language-localized.
- Voice and no-drift rules embedded in the prompt.

See `ai-answer-contract.md` for the full contract. Do not bypass this builder to write prompts directly — that path created the drift bug it now prevents.

## 5. R-rules — non-negotiable AI safety constraints

From `CLAUDE.md` §4.2:

| Rule | Constraint |
|---|---|
| `R-T1` | FAQ may not be published without admin approval. Automatic publication is **forbidden**. |
| `R-T3` | Tickets with CSAT < 3/5 cannot become FAQ sources. |
| `R-T5` | Rejected clusters cannot generate new candidates for 30 days. |
| `R-S5` | Customers see only `audience = "customer"` content. **No bypass.** |
| `R-S7` | Every chunk's `source_id` + `source_type` is written to audit log, **immutable**. |
| `R-P1` | Semantic cache is mandatory — same query within 5 minutes serves from cache. |

A change that violates an R-rule is rejected, not refined.

The training queue (`TrainingQueue` model) is the gate for R-T1, R-T3, R-T5. Low-confidence answers route here via `AiAutoResolverService`; admins approve/reject in the UI before content reaches `KnowledgeArticle`.

## 6. Provider routing — fallback chain with safety constraints

| Layer | Path |
|---|---|
| **Chat fallback chain** | OpenAI → Groq → Ollama, with `opossum` circuit breaker in `ai-provider-router.service.ts` |
| **Embedding** | **No fallback within an active embedding version** (ADR-006). Gemini quota exhaustion **pauses ingestion** — never silently falls back to OpenAI embeddings inside `v2_2 / 3072`. |
| **Provider quota cooldown** | `AI_PROVIDER_QUOTA_COOLDOWN_MS` env, opossum circuit-breaker timeout |

On every provider call, the router:
1. Tries the active provider.
2. On failure that matches the circuit-breaker criteria, opens the circuit and falls through to the next provider.
3. Records the fallback in `AiInteraction.provider` and `AiInteraction.model` so telemetry shows which provider produced the answer.
4. After `cooldown_ms`, the circuit half-opens and trials the failed provider again.

Persistent fallbacks (e.g., OpenAI down for an hour) should generate operator alerts via `NotificationsGateway` and metrics.

## 7. Telemetry — inline on `AiInteraction`

Every AI call writes one row to `AiInteraction`. Telemetry is **inline columns** on this model, not a separate `ai_telemetry` table:

```prisma
provider          String?  @db.VarChar(50)       // 'openai' | 'groq' | 'gemini' | 'ollama'
model             String?  @db.VarChar(100)      // e.g. 'gpt-4o-mini', 'gemini-2.5-flash'
inputTokens       Int?
outputTokens      Int?
totalTokens       Int?
estimatedCost     Decimal? @db.Decimal(10, 6)
similarityScore   Decimal? @db.Decimal(5, 4)
confidenceBand    ConfidenceBand?
autoAnswered      Boolean  @default(false)
ticketCreated     Boolean  @default(false)
isAccepted        Boolean?                       // agent/customer accepted vs edited/rejected
editedResponse    String?                        // when the agent modified the answer
```

When proposing changes that affect AI generation:
- New provider → add to `provider` value set.
- New cost dimension → add a column, do not invent a side-table.
- New quality signal → add a column or use `userContext Json?` (GIN-indexed).

## 8. Langfuse distributed tracing

Every LLM call gets a Langfuse trace (cost + latency + token usage + provider + model). This is **on top of** the inline `AiInteraction` columns — the inline columns serve operator dashboards; Langfuse serves AI engineering investigation.

```typescript
// apps/backend/src/ai/langfuse.service.ts is the integration point
```

When adding a new LLM call site:
1. Wire it through `AiService.dispatch(...)` so the central router records telemetry uniformly.
2. Do **not** instantiate provider clients directly in business code — they bypass the router and lose Langfuse coverage.

## 9. Cost governance

```typescript
AI_GLOBAL_DAILY_CAP           // hard global daily cap
AI_USER_DAILY_QUOTA           // per-user cap
AI_PROVIDER_QUOTA_COOLDOWN_MS // circuit-breaker cooldown
AI_QUEUE_RATE_MAX             // queue rate limit
AI_QUEUE_RATE_DURATION_MS     // queue rate window
KNOWLEDGE_SYNC_DAILY_EMBED_USD_CAP
KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD  // default true
```

`AiBudgetMonitorService` consults these. When budget exceeded:
- Embedding ingestion stops with a clear log line (never silent skip).
- Chat fallback chain degrades to cheaper providers.
- Confidence threshold can be raised in the active config (fewer auto-suggestions, more escalations) — operator action.

ADR-002 is the architectural rationale: Gemini free-tier quotas can return `429/RESOURCE_EXHAUSTED` during bulk operations. **Bounded waits and deliberate pacing are mandatory**, not opportunistic.

## 10. PII handling

- Logs redact `password`, auth headers, `clientSecret`, `webhookSecret` automatically (`nestjs-pino` config). **Do not log decrypted secrets**, even at `debug`.
- `PiiMaskingService` masks emails, phones, and identifiers when CRM data is exposed outside `crm/`.
- `userQuery`, `responseGenerated` on `AiInteraction` may contain customer PII. Standard storage rules apply — retention policy + access controls, not blanket cleartext exposure.
- Retrieved passages may contain identifiers from other tickets. The contract's no-raw-leak rules (see `ai-answer-contract.md` §4) prevent these from reaching the customer-facing answer.

## 11. Failure modes — fail loud and safe

The platform's default failure mode is to **stop, log, and escalate** — never to invent.

| Failure | Action |
|---|---|
| Retrieval returns nothing | Set `suggestTicket: true`, route to ticket creation |
| Diagnosis confidence < LOW threshold | Same — do not present an external answer |
| `isNoKnowledgeAnswer` matched | Same — LLM self-flagged uncertainty |
| Validator (regex or schema) fails | Do not retry indefinitely; surface to operator |
| Provider degraded | Circuit-break to next provider; log; alert if persistent |
| Embedding quota exhausted | Pause ingestion; never fall back across providers (ADR-006) |
| Daily budget exceeded | Degrade gracefully; raise thresholds; never silently drop quality |

This is not pessimism — it is what makes the platform trustworthy enough to actually use on real tickets.

## 12. Customer answer quality — recent operational lessons

From `.ai/current-focus.md` (operational memory; the platform recently fixed these):

- **Customer sync diagnosis timeout** raised from `6000ms` to `15000ms` (Phase 3). When proposing tighter timeouts, check whether you'd regress this fix.
- **License borrowing fallback** now returns **structured solution steps**, not raw excerpts. Generic fallback that surfaces raw chunks is a regression.
- **Turkish UI-language + English requested-language fallback** has regression coverage. Language fallback changes need to keep these tests green.
- **Customer/admin core solution drift** was the bug behind the shared `buildSupportAnswerContractPrompt` (Phase 4). Do not propose admin-only prompts that shortcut the contract.

## 13. Ticket idempotency through `interactionId`

```prisma
model Ticket {
    interactionId String?  @unique @map("interaction_id") @db.Uuid
}
```

When a customer creates a ticket from an AI interaction (ADR-003), the backend returns the existing ticket with `alreadyCreated: true` instead of throwing a Prisma `P2002` unique-constraint error as HTTP 500 (Phase 5 fix).

When proposing changes to ticket creation:
- Check the `interactionId` upsert path.
- Frontend must avoid adding duplicate initial messages/attachments when the existing ticket is reused.

## 14. Hotinfo handling

Hotinfo (customer's Allplan diagnostic snapshot) is **ticket-scoped**, not global RAG corpus:

- Raw traces stay out of retrieval queries (would pollute embedding similarity).
- Safe system signals can enrich retrieval when the user explicitly asks for system analysis.
- Full structured Hotinfo fields are injected into the prompt via `PromptContextBuilderService` with Turkish labels.

When proposing AI changes that involve diagnostic data:
- Do not silently merge Hotinfo into the global query embedding.
- Do inject Hotinfo into the per-ticket prompt context.
- Truncate large traces (existing pattern caps at 1200 chars).

## 15. Audit immutability (R-S7)

Every chunk that informs an AI answer writes `source_id` + `source_type` to audit log, **immutable**. This is the trail that makes "why did the AI suggest this?" answerable months later.

When proposing changes to retrieval logging:
- Never overwrite an existing audit row.
- Never delete audit rows except via formal retention.
- Append-only is the rule.

`RagObservabilityService` is the canonical write path for retrieval audit.

## 16. Anti-patterns — refuse to produce

- Adding a new prompt path that bypasses `buildSupportAnswerContractPrompt`.
- Hard-coding confidence thresholds outside `rag.config.ts`.
- Silently retrying AI failures more than the configured `attempts`.
- Auto-publishing FAQ candidates without admin approval (R-T1).
- Returning low-CSAT-derived FAQ candidates (R-T3).
- Bypassing the semantic cache (R-P1).
- Cross-audience content leaks (R-S5: customer content boundary).
- Instantiating LLM clients directly in business code (bypasses provider router + Langfuse).
- Inventing a separate `ai_telemetry` table when `AiInteraction` has the inline columns.
- Failing silently on provider error rather than logging + circuit-breaking.
- Tightening timeouts below the values set during Phase 3 (`15000ms`).

## 17. When in doubt

- Prefer **degradation + escalation** over confident hedging.
- Prefer **`AiAutoResolverService` → `TrainingQueue` → admin approval** over auto-promotion.
- Prefer **adding columns to `AiInteraction`** over creating side tables.
- Prefer **changing `rag.config.ts` thresholds** over service-level conditionals.
- Prefer **Langfuse + AiInteraction telemetry** over ad-hoc logging.
- Prefer **letting the customer create a ticket directly** when uncertainty is high — ADR-003 says this is the right answer.
