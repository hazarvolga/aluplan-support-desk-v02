# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Turborepo + pnpm workspace. Two apps and two shared packages:

- `apps/backend` — NestJS 11 API (`@aluplan/backend`), port **4000**. Swagger at `/api/docs`.
- `apps/frontend` — Next.js 15 App Router (`@aluplan/frontend`), port **3000**.
- `packages/database` — Prisma 7 schema, migrations, and seed scripts (`@aluplan/database`). The Prisma client is generated to `packages/database/client/` (not into `node_modules`); always run `pnpm db:generate` after pulling schema changes.
- `packages/shared-schemas` — Zod schemas shared between frontend and backend (`@aluplan/shared-schemas`).

The root `package.json` proxies most tasks through `turbo`. Use `pnpm --filter <pkg> ...` to scope a command to one workspace.

## Common Commands

```bash
# install + bootstrap infra (Postgres + Redis via docker-compose) + run dev
pnpm install
pnpm start:full           # bash scripts/start.sh — kills zombie 3000/4000, brings up Docker, then `pnpm dev`
pnpm dev                  # turbo dev (backend + frontend in parallel) without the pre-flight

# build / typecheck / lint everything
pnpm build
pnpm typecheck
pnpm lint

# database (runs in packages/database)
pnpm db:generate          # regenerate Prisma client → packages/database/client
pnpm db:migrate           # prisma migrate dev
# production: cd packages/database && pnpm db:migrate:prod  (deploy)
# seed: cd packages/database && pnpm db:seed
```

### Backend (NestJS, Jest)

```bash
pnpm --filter @aluplan/backend dev               # nest start --watch
pnpm --filter @aluplan/backend test              # jest, *.spec.ts (excludes test/integration/)
pnpm --filter @aluplan/backend test:e2e          # ts-jest, *.e2e-spec.ts and test/integration/**/*.spec.ts
pnpm --filter @aluplan/backend test:cov          # with coverage (thresholds: 35% lines/statements)

# single file
pnpm --filter @aluplan/backend exec jest src/ai/ai-query.service.spec.ts
# single test name
pnpm --filter @aluplan/backend exec jest -t "should fall back when provider fails"
```

Backend Jest uses `@swc/jest` for unit tests; the e2e config (`test/jest-e2e.json`) uses `ts-jest` and aliases `@aluplan/database` → `packages/database`.

### Frontend (Next.js, Vitest, Playwright)

```bash
pnpm --filter @aluplan/frontend dev              # next dev --port 3000
pnpm --filter @aluplan/frontend test:unit        # vitest (jsdom)
pnpm --filter @aluplan/frontend test:unit:watch
pnpm --filter @aluplan/frontend test:e2e         # playwright; auto-spawns backend + frontend
pnpm --filter @aluplan/frontend test:e2e:ui
pnpm --filter @aluplan/frontend i18n:check       # node scripts/check-i18n.js — verifies tr/en/de parity
pnpm --filter @aluplan/frontend analyze          # ANALYZE=true next build (bundle analyzer)

# single vitest file
pnpm --filter @aluplan/frontend exec vitest run src/app/[locale]/.../TicketsPage.spec.tsx
# single playwright test
pnpm --filter @aluplan/frontend exec playwright test e2e/auth.spec.ts -g "login"
```

Vitest covers `src/**`, excludes `e2e/**`, coverage threshold 45% across the board. Playwright config (`apps/frontend/playwright.config.ts`) starts both backend and frontend via `webServer` — set `reuseExistingServer: true` is in effect, so a manual `pnpm dev` will be reused. Tests retry 2× and run with 2 workers to avoid Next compilation thrashing.

## Architecture

### Backend — feature modules under `apps/backend/src`

The app composes ~30 feature modules in `app.module.ts`. The non-obvious cross-cutting wiring:

- **Logging**: `nestjs-pino` with PII redaction (auth headers, password fields, `clientSecret`, `webhookSecret`). In production with `LOKI_HOST` set, logs ship to Loki via `pino-loki`; otherwise pretty-printed.
- **Queues**: `BullModule.forRootAsync` shares one Redis connection across all queue producers. Default job options: 3 attempts, exponential backoff (5s base), keep last 100 completed and **last 500 failed jobs as a DLQ**. The `queue-dashboard` module mounts Bull-Board.
- **Throttling**: `ThrottlerGuard` is a global `APP_GUARD` backed by Redis (`@nest-lab/throttler-storage-redis`) — 120 req/min per IP by default.
- **Global interceptors**: `AuditLogInterceptor` and `MetricsInterceptor` registered as `APP_INTERCEPTOR` — every request flows through both.
- **Sentry + OpenTelemetry**: `instrument.ts` and `otel.ts` are imported before `AppModule`; Sentry uses `@sentry/nestjs/setup`'s `SentryModule.forRoot()`.
- **Boot pre-check** (`main.ts`): TCP-probes Redis and DB hosts before `NestFactory.create`, logs reachability. `app.enableShutdownHooks()` is on so SIGTERM drains BullMQ jobs.

### AI pipeline — `apps/backend/src/ai`

This is the system's core. Read these together:

- `ai-provider-router.service.ts` + `ai-provider-registry.service.ts` — multi-provider fallback chain (OpenAI → Groq → Ollama) with circuit breakers (`opossum`).
- `ai-query.service.ts` + `ai-query.processor.ts` — RAG entry point. Processor consumes a BullMQ queue rate-limited by `AI_QUEUE_RATE_MAX` / `AI_QUEUE_RATE_DURATION_MS`.
- `embedding.service.ts` + `embedding-normalizer.service.ts` — OpenAI (`text-embedding-3-small`, 1536-dim) or Ollama (BGE-M3, 1024-dim) per `EMBEDDING_PROVIDER`. The normalizer makes them comparable.
- `prompt-context-builder.service.ts` — hybrid retrieval (semantic + keyword) with re-ranking multipliers per source type (`RERANK_MULTIPLIER_*` env vars).
- `langfuse.service.ts` — distributed tracing of every LLM call (cost + latency).
- `ai-semantic-cache.service.ts` — semantic cache keyed by embedding similarity, not exact text match.
- The "feedback-to-vector loop" lives in `knowledge-pool/`, `faq/`, and `tickets/` — low-confidence answers populate `TrainingQueue` (Prisma model), admin approval promotes them to `KnowledgeArticle`.

There are **property-based tests** (`*.pbt.spec.ts`) for the AI pipeline using `fast-check` — keep them green when changing provider logic.

### Database — `packages/database/prisma/schema.prisma`

- PostgreSQL 16 with `vector` (pgvector) and `uuid-ossp` extensions enabled in the schema.
- HNSW indexes on embedding columns are managed via raw SQL (`scripts/migrate-hnsw-indexes.sql`); they are **not** in the Prisma schema. After major migrations, re-run that script.
- Prisma uses `driverAdapters` preview feature with `@prisma/adapter-pg`.
- Generator output is `../client` relative to the schema → `packages/database/client/`. Importers use `@aluplan/database` (re-exports from `packages/database/index.ts`).
- `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` — the second is for the Coolify/Alpine container build.

### Frontend — `apps/frontend/src`

- **Routing**: `app/[locale]/` with `next-intl`. Locales: `tr` (default), `en`, `de`. Route groups: `(auth)` (register/reset-password/verify-email) and `(dashboard)` (everything authenticated). Use the `next-intl/navigation` wrappers from `src/i18n/routing.ts` — never import `next/link` directly for internal links.
- **Middleware** (`src/middleware.ts`): combines `next-intl` middleware with a strict per-request CSP (`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`). The nonce is set on `x-nonce` header for downstream consumers. Auth gating for dashboard routes also lives here.
- **State**: Zustand stores in `src/stores/`. No TanStack Query in deps despite the README mention — server data is fetched via Server Components / route handlers.
- **UI**: shadcn-style components on Radix primitives + Tailwind. Toaster is `sonner` (`toast()` is a god-node per the graph report — many call sites).
- **Server Actions**: top-level `(dashboard)/actions.ts` aggregates server actions used by the dashboard tree.
- **i18n keys**: every user-facing string must exist in all three of `messages/tr.json`, `messages/en.json`, `messages/de.json`. Run `pnpm i18n:check` before declaring frontend work done.

### Real-time

`socket.io` server is configured with `@socket.io/redis-adapter` so multiple backend instances share rooms. Clients use `socket.io-client`. Streaming AI responses go over WebSocket events, not HTTP SSE.

### Infrastructure

- `docker-compose.yml` (root) — Postgres (pgvector/pg16, with `pg_stat_statements` enabled and `log_min_duration_statement=500`), Redis (AOF + LRU 256MB), and optional Ollama. **Always run `docker compose up -d` before backend dev** unless using `pnpm start:full`.
- `docker-compose.override.yml` and `docker-compose.staging.yml` exist; the override is auto-applied by Docker Compose for local dev.
- `Dockerfile`s exist per app and target Coolify deployment.
- CI: `.github/workflows/` has separate `backend-test.yml`, `frontend-test.yml`, `ci.yml`, `ai-eval.yml`, `dr-drill.yml`, and `semantic-release.yml`.

## Working Conventions

- **Always use `pnpm`** (enforced by `engines.pnpm: ">=9.0.0"` and `packageManager` field). `npm install` will produce a broken `node_modules`.
- **After pulling**, run `pnpm install && pnpm db:generate` — schema changes break TypeScript otherwise because the generated client is a local file.
- **Imports across workspaces**: `@aluplan/database`, `@aluplan/shared-schemas`. Both Jest configs alias these; Vitest aliases `@/` to `apps/frontend/src/`.
- **Don't commit** `apps/frontend/test-results/` or `apps/backend/coverage/` — both are in `.gitignore`. Playwright leaves a lot of artifacts under `test-results/` after failed runs.
- **Knowledge graph**: `graphify-out/GRAPH_REPORT.md` indexes the codebase with EXTRACTED/INFERRED edges. For cross-module "how does X relate to Y" questions, `graphify query "<question>"` is faster than grepping. See `AGENTS.md` for the full graphify workflow.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (9341 symbols, 16137 relationships, 241 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, check index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
