# AGENTS.md - aluplan-support-desk-v02

## Repo At A Glance

Turborepo monorepo for an AI-supported Allplan ticket/support system.

| Path | Package | Role |
|------|---------|------|
| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |
| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |
| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |

Prisma client is generated into `packages/database/client/`. Never edit generated client files.

## Truth Hierarchy

Root-level Markdown files can be stale because several agents generated planning and status documents during development. For project truth, prefer this order:

1. Code, tests, Prisma schema, migrations, and runtime config.
2. Git history and current `git status`.
3. GitNexus and Graphify outputs.
4. `.ai` memory files.
5. Root-level Markdown only when it is explicitly current or cross-checked against code.

Read before starting meaningful work:

- `AGENTS.md`
- `.ai/bootstrap.txt`
- `.ai/current-focus.md`
- `.ai/session-summary.md`
- `.ai/architecture-decisions.md`
- `graphify-out/GRAPH_REPORT.md`

Write after significant work:

- `.ai/session-summary.md`
- `.ai/current-focus.md` when the active objective changes
- `.ai/architecture-decisions.md` when a durable technical decision changes

## Commands

```bash
# Install
pnpm install

# Dev
pnpm dev

# Type-check
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck

# Backend tests
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:cov

# Frontend tests
pnpm --filter @aluplan/frontend test:unit
pnpm --filter @aluplan/frontend test:e2e

# Targeted frontend tests
pnpm --filter @aluplan/frontend exec vitest run <files...>

# i18n
pnpm i18n:check

# Database
pnpm db:migrate
pnpm db:generate
pnpm exec prisma validate --schema packages/database/prisma/schema.prisma
```

Migrations live in `packages/database/prisma/migrations/`.
Schema lives at `packages/database/prisma/schema.prisma`.

## Core Architecture Rules

- Import Prisma client types from `@aluplan/database`, never directly from `@prisma/client`.
- `PrismaService` has a global soft-delete filter for read methods. If deleted records are needed, bypass intentionally and document why.
- `PrismaService.onModuleInit()` must stay free of DDL. Schema repair belongs in migrations.
- Env vars must go through `apps/backend/src/config/env-validation.schema.ts`.
- Required boot secrets include `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, and `ADMIN_BYPASS_EMAILS`.
- In production, `ALLOWED_ORIGINS` must be explicit and safe.

## AI / RAG Direction

Qdrant is currently out of scope. Keep the existing pgvector + Gemini/LLMAPI path unless the user explicitly reopens vector database migration.

Current provider direction:

```bash
GEMINI_API_KEY=...
LLMAPI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLMAPI_CHAT_MODEL=gemini-2.5-flash
LLMAPI_EMBED_MODEL=gemini-embedding-2
GEMINI_CHAT_MODEL=gemini-2.5-flash
GEMINI_EMBED_MODEL=gemini-embedding-2
```

Embedding versioning source of truth is `embedding_version + embedding_dim`, not `model_name`.

Gemini embedding models can be 3072-dimensional. pgvector HNSW over `vector` supports up to 2000 dimensions, so exact search fallback and explicit observability are expected when using 3072-dim embeddings.

Knowledge pool ingestion should remain quota-safe:

- Bulk uploads use low-rate ingestion pacing.
- Partial embedding writes are cleaned up on failure.
- Dataset/RAG cleanup must be dry-run/backup-first when destructive.
- Customer ticket creation must not require AI diagnosis.

## High Blast Radius Areas

Run impact analysis before editing services, guards, DTOs, processors, or shared frontend primitives.

| Symbol | Risk |
|--------|------|
| `AiService` | Dispatcher for all AI provider calls |
| `AiQueryService` | Customer diagnosis and RAG answer flow |
| `EmbeddingService` | Article, ticket, and knowledge pool vector writes |
| `RagMaintenanceService` | Vector index and embedding dimension maintenance |
| `NotificationsGateway` | WebSocket hub |
| `CrmService` | Dynamics 365 sync |
| `EmailService` | Email flows |
| `toast()` | Frontend notification hook |

## Frontend / i18n Rules

- Frontend uses `next-intl`.
- Translation files live in `apps/frontend/messages/{tr,en,de}.json`.
- Do not hardcode user-facing strings in components.
- German translations are known to have gaps; run `pnpm i18n:check` before touching broad UI text.
- The Turkish UI should receive Turkish AI fallback/copy whenever the locale or query is Turkish.

## Testing Notes

- Backend uses Jest + `@swc/jest`.
- Frontend unit tests use Vitest; E2E uses Playwright.
- Integration tests need Postgres + Redis.
- Property-based tests use `fast-check` and are usually named `*.pbt.spec.ts`.
- E2E auth uses storage state and seeded test users.

Must-pass sets for RAG/AI changes usually include:

```bash
pnpm --filter @aluplan/backend test -- ai-query.service.spec.ts embedding.service.spec.ts embedding-version.registry.spec.ts rag-maintenance.service.spec.ts gemini.service.spec.ts llm-api.service.spec.ts
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck
```

## DevOps / Commit Hygiene

### Owner-approved delivery policy — 2026-09-17

- Goal: promote existing local improvements safely and promptly while preserving live customer data and working workflows. Prefer the smallest compatible change; do not redesign the platform to reach theoretical perfection.
- Challenge over-engineering even when the owner requests it. Be direct, evidence-based and respectful: state the concrete problem, release delay, maintenance cost and risk, then propose a smaller safe alternative before expanding scope. Apply the same skepticism to your own proposals.
- Classify work as release-blocking security/data/compatibility fixes, small relevant improvements, or deferred work. Judge vulnerability reachability and impact, not advisory counts alone. Never defer a demonstrated unacceptable risk merely to ship faster.
- Freeze each release scope. No speculative abstractions, new infrastructure, broad refactors or mass dependency upgrades without a demonstrated need and explicit scope decision. Preserve intentional existing architecture and security controls.
- Use targeted regression tests first, broaden by affected risk, and retain required quality gates. Do not weaken tests, suppress findings, or claim absolute security/zero data loss. Deferred work needs a reason and a review trigger in the existing backlog; avoid duplicate planning systems.
- Follow Git/GitHub discipline: small topic branches where appropriate, explicit file staging, Conventional Commits and local checkpoints after verification. Keep unrelated work intact. When publication is authorized, use a focused PR with scope, test evidence, data/migration impact and rollback notes; required CI/review must pass before merge.
- Local commits/tags are not remote backups, published PRs or release approval. Require explicit "push et" before remote push/tag/publication and explicit "deploy et" for deployment. General "continue" approval does not authorize production access or changes.
- Never copy a local development database over production. Prove backup restoration and compatible rollback that preserves newly accepted customer writes and attachment bytes before release. Any production access/change needs separately scoped approval.

- Keep docs/memory, regression tests, product code, DB/config, generated graph output, and agent/spec/tooling files in separate commits.
- Before committing, run `git diff --name-only` and a focused test set.
- Before product commits, run GitNexus detect changes when available.
- Graphify hooks may update `graphify-out/GRAPH_REPORT.md`; do not mix graph output into product-code commits.
- Do not commit generated `packages/database/client/` changes unless Prisma generation intentionally changed tracked output.

## graphify - Knowledge Graph

Graph data lives in `graphify-out/`.

For architecture questions, read `graphify-out/GRAPH_REPORT.md` first. If `graphify-out/wiki/index.md` exists, navigate from there before raw file spelunking.

```bash
graphify query "<question>"
graphify path "<A>" "<B>"
graphify explain "<concept>"
graphify update .
```

Notes:

- `packages/database/client/runtime/` and `node_modules/` are excluded from graph context.
- Edges are labelled as `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`.
- If Graphify warns that a rebuilt graph is much smaller than the existing graph, do not force overwrite without investigating missing chunks/session state.

<!-- gitnexus:start -->
# GitNexus - Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (10855 symbols, 18166 relationships, 255 execution flows). Use GitNexus to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- Run impact analysis before editing a function, class, method, service, guard, DTO, processor, or shared frontend primitive.
- If impact is HIGH or CRITICAL, warn the user and list affected flows before proceeding.
- Run `gitnexus detect_changes` before committing product code when available.
- Use GitNexus query/context for unfamiliar flows before broad grep-driven edits.

## Never Do

- Never rename symbols with find-and-replace; use graph-aware rename tooling when available.
- Never ignore HIGH or CRITICAL impact warnings.
- Never commit product-code changes without checking affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview and index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | Functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | Execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step process trace |

## CLI

```bash
npx gitnexus query "<concept>"
npx gitnexus impact "<SymbolName>" --direction upstream
npx gitnexus detect_changes --repo aluplan-support-desk-v02
npx gitnexus analyze
```

<!-- gitnexus:end -->
