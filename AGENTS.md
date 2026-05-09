# AGENTS.md — aluplan-support-desk-v02

## Repo at a glance

Turborepo monorepo. Three packages:

| Path | Package | Role |
|------|---------|------|
| `apps/backend` | `@aluplan/backend` | NestJS API, port 4000 |
| `apps/frontend` | `@aluplan/frontend` | Next.js 15 App Router, port 3000 |
| `packages/database` | `@aluplan/database` | Prisma 7 schema + migrations |

Prisma client is generated into `packages/database/client/` — never edit that directory.

---

## Commands

```bash
# Install
pnpm install               # requires pnpm >=9, node >=20

# Dev
pnpm dev                   # starts both apps via turbo

# Type-check (run before committing)
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck

# Backend tests (unit)
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:cov

# Frontend tests
pnpm --filter @aluplan/frontend test:unit       # vitest
pnpm --filter @aluplan/frontend test:e2e        # playwright

# i18n gap check
pnpm i18n:check            # alias: pnpm --filter @aluplan/frontend i18n:check

# Database
pnpm db:migrate            # prisma migrate deploy (via turbo)
pnpm db:generate           # prisma generate

# Migrations live in packages/database/prisma/migrations/
# Schema: packages/database/prisma/schema.prisma
```

---

## Before editing any symbol

1. Run `gitnexus impact "<SymbolName>"` — mandatory for services, guards, DTOs, processors.
2. If impact is HIGH or CRITICAL: warn the user, list affected flows, do not proceed silently.
3. After significant changes: `gitnexus detect_changes`

Graph data lives in `graphify-out/` — read `graphify-out/GRAPH_REPORT.md` before deep exploration.

---

## Architecture quirks agents miss

**Prisma client is extended with a global soft-delete filter** (`prisma.service.ts`).
`findMany/findFirst/findUnique/count` automatically add `deletedAt: null`.
If you need to query deleted records, bypass the filter explicitly.

**Prisma client output** is `packages/database/client/` not the default location.
Import from `@aluplan/database`, never from `@prisma/client` directly.

**`onModuleInit()` in `PrismaService`** must stay clean — no DDL.
Ghost column repairs were migrated to `20260509000001_gap07_ghost_column_repair`.

**AiService is a dispatcher**, not a direct LLM caller. Provider resolution order:
1. Settings DB (`ai.chat_provider`)
2. Env: `OPENAI_API_KEY` → openai, `GEMINI_API_KEY` → llmapi
3. Fallback: ollama

**Gemini free tier** is the target AI provider:
```
GEMINI_API_KEY=AIza...
LLMAPI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
LLMAPI_CHAT_MODEL=gemini-2.5-flash-preview-06-05
LLMAPI_EMBED_MODEL=gemini-embedding-2-001
```

**RBAC guard** reads `user.role` as `string | { name: string }` — use `getRoleName()` helper, not direct cast.

**Bcrypt rounds** are centralised in `apps/backend/src/auth/security.constants.ts` (`BCRYPT_ROUNDS = 12`).
Import from there; never hardcode `10`.

**KB default language** is now read from settings (`kb.default_language`), not hardcoded `'tr'`.

---

## Env validation

All env vars must go through `apps/backend/src/config/env-validation.schema.ts` (Zod).
Missing vars that bypass Zod and use `process.env` directly are a known GAP — add new vars to schema first.

Required at boot: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.

---

## i18n

Frontend uses `next-intl`. Translation files: `apps/frontend/messages/{tr,en,de}.json`.
`de.json` has 302 missing keys (GAP-12 — open). Run `pnpm i18n:check` to see current state.
Never hardcode user-facing strings in components — always use `t('key')`.

---

## Testing quirks

- Backend uses **Jest + @swc/jest** (fast transform — no ts-jest).
- Frontend unit tests use **Vitest**; E2E uses **Playwright**.
- Integration tests need Postgres + Redis running (`docker-compose up -d`).
- Property-based tests use **fast-check** — files named `*.pbt.spec.ts`.
- E2E auth uses storageState — seed dedicated test users before running Playwright.

---

## God nodes — high blast radius

| Symbol | Edges | Risk |
|--------|-------|------|
| `AiService` | 33 | Dispatcher for all AI — changes cascade |
| `NotificationsGateway` | 22 | WebSocket hub |
| `CrmService` | 20 | Dynamics 365 sync |
| `EmailService` | 25 | All email flows |
| `toast()` | 37 | Frontend notification hook |

---

## CI pipeline

`.github/workflows/ci.yml` gates: `spec-verify → security → typecheck-and-build → testing + e2e + docker-build → deploy-staging`.
Staging deploys only on `main` via Coolify webhook.
CI requires pnpm 9 (fixed from 8 in GAP-28).

---

## Open GAPs (as of 2026-05-09)

Check `verdent-GAP-status.md` for current status. Remaining high-priority:

| GAP | File | Issue |
|-----|------|-------|
| GAP-11 | various | 50+ services have no tests |
| GAP-12 | `messages/de.json` | 302 missing German keys |
| GAP-19 | faq/announcements/macros services | Hard-delete instead of soft-delete |

---

## Session persistence

Read before starting work:
- `AGENTS.md` (this file)
- `.ai/session-summary.md`
- `verdent-GAP-status.md`

Write after significant work: `.ai/session-summary.md`

Graph index: `.gitnexus/meta.json` — 9,142 nodes, 15,926 edges, 241 flows.
Re-index when stale: `npx gitnexus analyze`
