# Testing & Quality Gates

Read this when writing tests, configuring CI, or deciding what to test before declaring a change done. The canonical patterns come from real test files in the codebase.

## 1. Test tooling

| Layer | Tool | Config |
|---|---|---|
| Backend unit | Jest + `@swc/jest` | `apps/backend/jest.config.ts` |
| Backend integration | ts-jest, `@aluplan/database` alias | Real Postgres + Redis required |
| Frontend unit | Vitest (jsdom) | `apps/frontend/vitest.config.ts` |
| Frontend E2E | Playwright | Backend + frontend auto-started |
| Property-based | `fast-check` | Co-located as `*.pbt.spec.ts` |

## 2. Coverage thresholds

| Target | Threshold | Notes |
|---|---|---|
| Backend line/statement | **35%** | Enforced in CI |
| Frontend line/statement | **45%** | Enforced in CI |

These are minimums, not goals. Critical paths (AI, CRM sync, ticket lifecycle) should be significantly higher.

## 3. File naming

- Unit tests: `<file>.spec.ts` — co-located in the same directory as the source.
- Property-based tests: `<file>.pbt.spec.ts` — co-located.
- Integration tests: `apps/backend/test/` directory.
- E2E tests: `apps/frontend/e2e/` directory.

## 4. Backend test module setup

The canonical pattern for NestJS unit tests:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';

describe('AiQueryService', () => {
    let service: AiQueryService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: ConfigService, useValue: mockConfig },
                // ... other dependencies
                { provide: getQueueToken('ai-query-processing'), useValue: {} },
            ],
        }).compile();
        service = module.get(AiQueryService);
    });
});
```

Conventions:
- `Test.createTestingModule({ providers: [{ provide: X, useValue: mockX }] })`.
- Mock Prisma shape mirrors the client: `mockPrisma.aiInteraction.create.mockResolvedValue({ id: 'test-id' })`.
- Mock queues via `getQueueToken('queue-name')` with an empty object or a mock with `add`.
- `jest.clearAllMocks()` in `beforeEach`.
- Each test file sets up its own module — no shared test-app fixture.

## 5. Property-based tests (PBT)

From `apps/backend/src/ai/ai-query.service.pbt.spec.ts`:

```typescript
/**
 * Property-Based Tests: AiQueryService.streamQuery()
 * Feature: rag-faq-improvements
 * Property 5: streamQuery erken sonlandırma
 * Property 6: query() ve streamQuery() threshold tutarlılığı
 */
import * as fc from 'fast-check';

describe('AiQueryService.streamQuery() — Property-Based Tests', () => {
    it('Property 5: streamQuery erken sonlandırma', () => {
        fc.assert(
            fc.property(
                fc.float({ min: 0, max: 1 }),
                fc.string({ minLength: 1 }),
                (confidence, query) => {
                    // ... property assertion
                }
            )
        );
    });
});
```

Conventions:
- File extension: `*.pbt.spec.ts`.
- Feature + property documented in file header.
- `fc.assert(fc.property(...))` for assertions.
- Properties test invariants: "confidence threshold is consistent across query methods", "answer length is bounded", "no-knowledge detection is deterministic for given input".

## 6. AI no-drift tests

The contract spec (`apps/backend/src/ai/ai-answer-contract.spec.ts`) guards prompt regressions:

```typescript
describe('buildSupportAnswerContractPrompt', () => {
    it('should contain the voice directive', () => {
        const prompt = buildSupportAnswerContractPrompt({ ... });
        expect(prompt).toContain('Aluplan AI Destek');
    });

    it('should contain all 5 section headings for Turkish', () => {
        const prompt = buildSupportAnswerContractPrompt({ language: 'tr', ... });
        expect(prompt).toContain('## 📌 Sorun Yorumu');
        expect(prompt).toContain('## 🎯 En Olası Neden');
        expect(prompt).toContain('## ⚠️ Kritik Kontroller');
        expect(prompt).toContain('## 🛠️ Çözüm Adımları');
        expect(prompt).toContain('## ✅ Doğrulama');
    });
});
```

**When modifying the AI answer contract:** update these tests in the same PR. If they fail, the contract has drifted — fix intentionally, never weaken the test.

## 7. Must-pass test sets

### 7.1 RAG/AI changes (AGENTS.md)

```bash
pnpm --filter @aluplan/backend test -- \
    ai-query.service.spec.ts \
    embedding.service.spec.ts \
    embedding-version.registry.spec.ts \
    rag-maintenance.service.spec.ts \
    gemini.service.spec.ts \
    llm-api.service.spec.ts
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck
```

### 7.2 CRM changes

```bash
pnpm --filter @aluplan/backend test -- \
    crm-record-sync.service.spec.ts \
    crm.service.spec.ts \
    crm.processor.spec.ts \
    dynamics365.adapter.spec.ts
```

Walk `apps/backend/src/crm/E2E_TEST_CHECKLIST.md` for webhook/operator UI changes.

### 7.3 Frontend changes

```bash
pnpm --filter @aluplan/frontend test:unit
pnpm i18n:check
pnpm --filter @aluplan/frontend typecheck
```

## 8. RAG acceptance set

`.ai/rag-quality/acceptance-questions.json` contains representative queries with expected outcomes. Run via `.ai/rag-quality/run-acceptance.mjs` — quota-aware delay is built in.

Before declaring a retrieval change done:
1. Run the acceptance set.
2. Verify no regression in HIGH/MEDIUM/LOW distribution.
3. Spot-check 3–5 answers manually for grounding quality.

## 9. CI pipelines

| Workflow | Purpose |
|---|---|
| `backend-test.yml` | Backend unit + integration tests |
| `frontend-test.yml` | Frontend unit + E2E |
| `ci.yml` | Combined gate |
| `ai-eval.yml` | RAG acceptance evaluation |
| `dr-drill.yml` | Disaster recovery drills |
| `semantic-release.yml` | Versioning + changelog |

## 10. Test data

- `packages/database/prisma/seed.ts` — canonical seed data.
- E2E uses seeded test users with Playwright storage state.
- **`extracted_users.json` (19782 lines) is SENSITIVE** — never opened, analyzed, or committed to public repos. It exists for migration/seed purposes only.
- Test fixtures should be minimal and focused. Do not import production data into test suites.

## 11. XSS smoke tests

`apps/backend/src/common/pipes/xss-validation.pipe.spec.ts` validates that the global XSS pipe blocks:
- `<script>` tags
- `onerror` handlers
- `javascript:` URLs

**Must remain green** after any change to `XssValidationPipe` or rich-text handling. The pipe is high-blast-radius (AGENTS.md).

## 12. What to test for each change type

| Change type | Required tests |
|---|---|
| New Prisma model | Migration runs clean; seed includes sample data; service CRUD tests |
| New service method | Unit test with mocked dependencies; edge cases for validation |
| New queue worker | Happy path; retry on transient error; idempotency on repeated payload |
| AI prompt change | No-drift assertions (`expect(prompt).toContain`); RAG acceptance set |
| New API endpoint | DTO validation; auth guard; response shape matches `{ success, data, error, meta }` |
| CRM field mapping | Config-override path + Dynamics-fallback path; integration test with mock payload |
| Frontend component | Vitest unit; i18n check; Playwright E2E for critical paths |
| Retrieval change | RAG acceptance set; `RagObservabilityService` still captures full cascade |

## 13. Anti-patterns

- Tests that import the full `AppModule` (use focused `TestingModule` with mocks).
- Tests that depend on external services (Dynamics, Gemini) without mocks.
- Hardcoded IDs that collide across test files (use UUID generators or unique prefixes).
- Skipping `jest.clearAllMocks()` in `beforeEach` (mock leaks between tests).
- Testing implementation details (mock internals) instead of observable behavior.
- Weakening an `expect(prompt).toContain(...)` assertion to make a failing test pass.
- `// @ts-ignore` or `// eslint-disable` in test files to suppress real type errors.

## 14. When in doubt

- Prefer **co-located `*.spec.ts`** over a separate `__tests__/` directory (match existing).
- Prefer **mock-per-dependency** via `Test.createTestingModule` over shared fixtures.
- Prefer **PBT (`fast-check`)** for invariant properties over exhaustive example lists.
- Prefer **running the focused test set** from AGENTS.md over full suite for fast feedback.
- Prefer **RAG acceptance set** for retrieval quality over manual spot-checks alone.
- Run `pnpm typecheck` for both backend and frontend before declaring done.
