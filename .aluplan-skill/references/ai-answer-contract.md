# AI Answer Contract

Read this whenever generating, modifying, or validating an AI answer in the platform — customer self-service responses, admin Copilot drafts, prompt builders, validators, or telemetry consumers.

The canonical contract lives in `apps/backend/src/ai/ai-answer-contract.ts` (89 lines). This document describes it; the code is the truth.

## 1. The contract is a prompt builder, not a JSON schema

The platform does **not** use a Zod/JSON schema for AI output. Instead, it uses:

1. A **shared prompt builder** (`buildSupportAnswerContractPrompt`) that wraps a base prompt with no-drift contract rules.
2. A **required markdown section shape** (5 sections, language-localized) that the LLM must produce.
3. A **no-knowledge-answer detector** (`isNoKnowledgeAnswer`) that recognizes refusal-style outputs across languages.

Persistence happens in `AiInteraction` (Prisma model), where telemetry fields are inline columns — there is no separate `support_answer` or `ai_telemetry` table.

## 2. The shared prompt builder

```typescript
// apps/backend/src/ai/ai-answer-contract.ts
export type AnswerAudience = 'customer' | 'agent';

export interface SupportAnswerContractOptions {
    basePrompt: string;
    product?: string | null;
    categories?: string[];
    keywords?: string[];
    language?: string | null;
    audience: AnswerAudience;
}

export function buildSupportAnswerContractPrompt(options: SupportAnswerContractOptions): string;
export function resolveAnswerLanguage(language?: string | null): string;
```

Both `AiQueryService` (customer-facing) and `AiCopilotService` (admin-facing) call this builder so that customer and agent outputs share the same core solution. Drift between the two surfaces — admin Copilot disagreeing with the customer answer — was an actual production bug (Answer Drift Reset Phase 4, `.ai/current-focus.md`), and this shared builder is the fix.

### 2.1 Inputs

- `basePrompt` — the caller's base prompt, with `{{PRODUCT}}`, `{{CATEGORIES}}`, `{{KEYWORDS}}`, `{{LANGUAGE}}` placeholders that the builder substitutes.
- `product` — Allplan product name, or `'General'` if absent.
- `categories`, `keywords` — joined with `, ` or `'N/A'` if absent.
- `language` — locale string (`'tr'`, `'tr-TR'`, `'en'`, `'de'`, etc.). Defaults to `'tr'`.
- `audience` — `'customer'` (self-service) or `'agent'` (Copilot draft).

### 2.2 Language resolution

```typescript
export function resolveAnswerLanguage(language?: string | null): string {
    const normalized = (language || 'tr').toLowerCase();
    if (normalized.startsWith('tr')) return 'Turkish';
    if (normalized.startsWith('de')) return 'German';
    return 'English';
}
```

Three supported answer languages: **Turkish (default)**, **German**, **English**. `tr-TR`, `en-US`, `de-DE` all resolve correctly.

## 3. The required output shape

The LLM must produce 5 sections **in this order**, with the exact emoji'd headings, localized to the answer language:

| Order | Turkish (default) | English | German |
|---|---|---|---|
| 1 | `## 📌 Sorun Yorumu` | `## 📌 Issue Summary` | `## 📌 Problemzusammenfassung` |
| 2 | `## 🎯 En Olası Neden` | `## 🎯 Most Probable Cause` | `## 🎯 Wahrscheinlichste Ursache` |
| 3 | `## ⚠️ Kritik Kontroller` | `## ⚠️ Critical Checks` | `## ⚠️ Kritische Prüfungen` |
| 4 | `## 🛠️ Çözüm Adımları` | `## 🛠️ Solution Steps` | `## 🛠️ Lösungsschritte` |
| 5 | `## ✅ Doğrulama` | `## ✅ Verification` | `## ✅ Überprüfung` |

The Critical Checks section is **mandatory** when the retrieved context contains prerequisites, permissions, compatibility checks, network/proxy checks, security-software checks, or verification conditions. For pure how-to questions, the probable-cause section may briefly state that this is a procedure request, not an error diagnosis.

Headings, emojis, and order are validated by `expect(prompt).toContain(...)` assertions in `ai-answer-contract.spec.ts`. Changing them is a **breaking change** to the contract and requires updating the tests in the same PR.

## 4. No-drift rules embedded in the contract

The builder appends these rules to every prompt (excerpted from the actual code):

- **Voice:** "Aluplan AI Destek." Calm, professional, human support language. No marketing language or unsupported promises.
- **User addressing:** If `[USER_PROFILE]` or `[Kullanıcı Profili]` provides a full name, address the user by that full name **once in the opening sentence**. Do not repeat the name in every section.
- **Exact intent:** Answer the user's exact intent. If the user asks "how do I do X", provide the procedure for X — **do not convert it into an outage/root-cause diagnosis** unless the user reports a failure.
- **Customer/agent parity:** Keep the same core solution for customer and agent outputs. Agent drafts may add agent-only follow-up checks, but must not contradict the customer-safe answer.
- **Grounding:** Use the evidence in `[CONTEXT]` only. Do not invent causes, services, settings, or failure modes that aren't in the retrieved context.
- **Language hygiene:** Output language must be `${language}`. Translate procedural wording, UI labels, menu names, file names, and section names into `${language}` where a clear equivalent exists. Do not mix German or English source-language labels into a Turkish answer as the primary wording. If an original UI label is necessary for recognition, show the translated label first and put the original in parentheses **once**. Do not repeat foreign-language labels after the first mention.
- **Procedure preference:** If the retrieved context supports a procedural answer, prefer concrete steps over generic troubleshooting.
- **No raw leak:** Do not show raw excerpts, document chunk titles, source filenames, or citation/debug details in the customer-facing answer.
- **Insufficient info:** If information is insufficient, say what is missing and ask for the next useful detail — do not fill gaps with assumptions.

These rules are enforced in two places:
1. **Inside the prompt** (the LLM is instructed to follow them).
2. **In the test suite** (`ai-answer-contract.spec.ts` asserts the prompt contains the rule text).

When modifying the contract, update both — and run the test before declaring done.

## 5. Audience-specific behavior

| Behavior | `customer` | `agent` |
|---|---|---|
| Prompt declaration | "Audience: customer self-service answer" | "Audience: support agent draft" |
| Raw excerpts in output | Forbidden | Forbidden (still no raw chunk titles or filenames) |
| Agent-only checks | Not included | Allowed, but additive — must not contradict customer-safe core |
| Tone | Reassuring, end-user friendly | Same core, slightly more diagnostic latitude |

Agent drafts are not a different answer. They are the same answer with optional follow-up checks appended.

## 6. Confidence routing

Confidence bands come from `RAG_CONFIG.SIMILARITY` (see `rag-retrieval-rules.md` for thresholds), and the runtime band type lives in `apps/backend/src/ai/ai-query.service.ts`:

```typescript
export type LocalConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';
```

The Prisma `ConfidenceBand` enum is 3-level (`HIGH | MEDIUM | LOW`); `NO_MATCH` is **runtime-only** by design. When persisting, `NO_MATCH` is either collapsed to `LOW` or the answer is not persisted as a successful interaction. Do **not** propose adding `NO_MATCH` to the Prisma enum without an explicit user request — the asymmetry is intentional.

Routing per band (canonical):

| Band | Action | Where the answer goes |
|---|---|---|
| `HIGH` (≥ 0.85) | Present as suggested answer | Customer UI / agent Copilot |
| `MEDIUM` (≥ 0.70) | Present with caveats; agent review encouraged | Customer UI / agent Copilot |
| `LOW` (≥ 0.62 env-overridable) | Present cautiously; encourage ticket creation | Customer UI with `suggestTicket: true` |
| `NO_MATCH` (< LOW threshold or `isNoKnowledgeAnswer` matched) | Do **not** present as the answer; route to ticket creation flow | Frontend shows ticket-creation path |

## 7. `AiQueryResult` — the runtime shape

The result of an AI query (returned from `AiQueryService` and emitted via WebSocket to async clients):

```typescript
// apps/backend/src/ai/ai-query.service.ts
export interface AiQueryResult {
    query: string;
    answer: string | null;
    answerMode?: 'LLM' | 'FALLBACK';
    confidence: LocalConfidenceBand;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
    translations?: Record<string, string>;
    diagnosis?: DiagnosisResult;
    cacheVersion?: string;
    languageMismatch?: boolean;
}
```

Key fields:
- `answer` — the rendered markdown (5 sections). Can be `null` when no answer was produced.
- `answerMode` — `'LLM'` (model-generated) or `'FALLBACK'` (deterministic structured fallback when LLM unavailable).
- `sources` — minimal attribution shape: article id, title, similarity score. **Source filenames and raw chunks are not exposed to the customer.**
- `interactionId` — UUID, links to the persisted `AiInteraction` row, used downstream for feedback, ticket creation, and admin review.
- `suggestTicket` — `true` when confidence is low or the answer is a no-knowledge response. Frontend shows ticket-creation path.
- `cacheVersion` — `RAG_CONFIG.CACHE.VERSION` (currently `'v9'`); bumping the version globally invalidates the semantic cache.
- `languageMismatch` — `true` when the answer language couldn't fully match the query language; surfaces a UI hint.

## 8. Persistence — `AiInteraction`

Every AI query writes one row to `AiInteraction`. Telemetry is **inline columns** on this model, not a separate telemetry table:

```prisma
model AiInteraction {
    id                String                   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    sessionId         String?                  @map("session_id") @db.Uuid
    userId            String?                  @map("user_id") @db.Uuid
    userQuery         String                   @map("user_query")
    matchedArticleId  String?                  @map("matched_article_id") @db.Uuid
    matchedVersionId  String?                  @map("matched_version_id") @db.Uuid
    similarityScore   Decimal?                 @map("similarity_score") @db.Decimal(5, 4)
    confidenceBand    ConfidenceBand?          @map("confidence_band")
    responseGenerated String?                  @map("response_generated")
    autoAnswered      Boolean                  @default(false) @map("auto_answered")
    ticketCreated     Boolean                  @default(false) @map("ticket_created")
    productId         String?                  @map("product_id") @db.Uuid
    userContext       Json?                    @map("user_context")
    isAccepted        Boolean?                 @map("is_accepted")
    editedResponse    String?                  @map("edited_response")
    provider          String?                  @db.VarChar(50)
    model             String?                  @db.VarChar(100)
    inputTokens       Int?                     @map("input_tokens")
    outputTokens      Int?                     @map("output_tokens")
    totalTokens       Int?                     @map("total_tokens")
    estimatedCost     Decimal?                 @map("estimated_cost") @db.Decimal(10, 6)
    createdAt         DateTime                 @default(now()) @map("created_at")
    channel           CommunicationChannel     @default(WEB)
    // ... relations
}
```

| Field group | Purpose |
|---|---|
| `userQuery`, `userContext`, `productId`, `channel` | Input context |
| `matchedArticleId`, `matchedVersionId`, `similarityScore` | Source attribution + match strength |
| `confidenceBand`, `responseGenerated` | Output |
| `autoAnswered`, `ticketCreated` | Outcome flags |
| `isAccepted`, `editedResponse` | Agent/customer feedback signal (when applicable) |
| `provider`, `model`, `inputTokens`, `outputTokens`, `totalTokens`, `estimatedCost` | Inline telemetry |

**Money/score precision:** `Decimal(5,4)` for similarity, `Decimal(10,6)` for cost. Not `Float`.

## 9. Ticket idempotency through `interactionId`

When a customer triggers ticket creation from an AI interaction (ADR-003: AI is optional, ticket creation must work even without successful AI answer), the contract is:

```prisma
model Ticket {
    interactionId  String?  @unique @map("interaction_id") @db.Uuid
    // ...
}
```

One AI interaction → at most one ticket. Repeated ticket creation from the same `interactionId` returns the existing ticket with `alreadyCreated: true` instead of throwing a Prisma unique-constraint violation as HTTP 500 (Ticket Interaction Idempotency Phase 5).

## 10. No-knowledge answer detection

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

export const isNoKnowledgeAnswer = (answer: string | null | undefined): boolean => {
    if (!answer) return false;
    return NO_KNOWLEDGE_PATTERNS.some(pattern => pattern.test(answer));
};
```

The patterns are multilingual (Turkish + English) and recognize **the answer's own admission** that it lacks knowledge. When `isNoKnowledgeAnswer(answer)` returns `true`, the routing layer treats the response as `NO_MATCH` regardless of the raw similarity score — the LLM has flagged its own uncertainty.

When adding new no-knowledge phrasings the LLM might emit (in any of the three supported languages), add the regex here, write a unit test, and verify the routing change.

## 11. The MASTER_DIAGNOSIS_PROMPT

Lives **inline** in `apps/backend/src/ai/ai-query.service.ts` as `export const MASTER_DIAGNOSIS_PROMPT = \`...\`;`. It defines a **7-STEP DIAGNOSIS STRATEGY** the LLM follows (context analysis, problem-shift detection, retrieval grounding, hypothesis ranking, structured output, etc.).

**This is intentionally inline, not extracted to a `prompts/` folder.** The reasoning:
- Prompt versioning happens through Git diffs on this file.
- Service co-location keeps prompt + dispatch logic reviewable together.
- A separate prompts directory would add coordination overhead without a clear operational benefit.

When the user asks to "extract prompts to a folder," push back unless they give an explicit operational reason (e.g., runtime prompt swapping, A/B testing infrastructure).

## 12. R-rules — non-negotiable AI safety rules

From `CLAUDE.md` §4.2:

| Rule | Constraint |
|---|---|
| `R-T1` | FAQ may not be published without admin approval. Automatic publication is **forbidden**. |
| `R-T3` | Tickets with CSAT < 3/5 cannot become FAQ sources. |
| `R-T5` | Rejected clusters cannot generate new candidates for 30 days. |
| `R-S5` | Customers see only `audience = "customer"` content. No bypass. |
| `R-S7` | Every chunk's `source_id` + `source_type` is written to audit log, **immutable**. |
| `R-P1` | Semantic cache is mandatory — same query within 5 minutes serves from cache. |

These rules constrain what the skill is allowed to propose. A proposal that violates an R-rule should be rejected, not refined.

## 13. Source confidence hierarchy (rerank baseline)

From `CLAUDE.md` §4.4, encoded as multipliers in `RAG_CONFIG.RERANK.FACTORS`:

| Rank | Source | Multiplier |
|---|---|---|
| 1 | Admin Article | `1.30` (FAQ rated higher at `1.35`) |
| 2 | Official Document | `1.15` |
| 3 | AI FAQ (approved) | `1.35` |
| 4 | URL Whitelist | `0.60` (penalty — less trusted) |
| 5 | Ticket-derived | `0.50` (penalty — least authoritative) |

These multipliers are applied during rerank to bias the result list toward more authoritative sources. The contract assumes this bias is in effect; an answer drawing primarily from low-trust sources is itself a signal that confidence should be downgraded.

## 14. When to update the contract

A new optional field on the result, or a new no-knowledge phrasing → minor change, no coordination needed.

Any of these requires a coordinated PR across `ai-answer-contract.ts`, `ai-query.service.ts`, `ai-copilot.service.ts`, the test files, and any frontend consumer:

- Renaming, adding, or removing a section heading.
- Changing the audience model (e.g., adding a third audience).
- Changing the language resolution rules.
- Changing the no-drift rules.
- Adding a new R-rule.

The `expect(prompt).toContain(...)` tests are the canary — if they fail, the contract has drifted, and the fix is to update the contract intentionally, not to weaken the test.
