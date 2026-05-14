# Condensed Project Memory

## Project Purpose

Aluplan Support Desk is an AI-assisted ticket system for Allplan/BIM support workflows. It combines a NestJS backend, Next.js frontend, PostgreSQL/Prisma database, pgvector retrieval, knowledge pool imports, and customer-facing ticket flows.

## Architecture Snapshot

- Backend: NestJS API on port 4000 with AI, tickets, knowledge pool, auth, notifications, CRM, email, and settings modules.
- Frontend: Next.js App Router on port 3000 with localized dashboard flows.
- Database: PostgreSQL + Prisma client generated into `packages/database/client/`.
- RAG: knowledge articles, knowledge pool embeddings, ticket embeddings, prompt context building, provider dispatch, and bounded fallback behavior.
- Intelligence tools: Graphify and GitNexus are preferred over raw Markdown reports for architecture discovery.

## Critical Services

- `AiService`: provider dispatch, retries, fallback, and provider routing.
- `AiQueryService`: customer diagnosis, retrieval, reranking, answer generation, and sync/async behavior.
- `EmbeddingService`: article, ticket, and knowledge-pool embeddings.
- `RagMaintenanceService`: vector extension, dimensions, and index maintenance.
- `NotificationsGateway`: Socket.io connection and real-time notification hub.

## Last Stable Direction

- Backend startup was stabilized by disabling Nest asset watchers during build.
- AI diagnosis is optional for ticket creation.
- Sync diagnosis avoids quota-heavy model reranking and uses bounded fallback behavior.
- Turkish fallback summaries were added to avoid raw English customer-facing output when Gemini is delayed.
- The project should stay on pgvector for now and measure the real bottlenecks before considering Qdrant.
- PDF-first RAG import is paused after controlled support-first batches 001-011; the corpus is usable enough for acceptance testing before importing more files.
- Last verified RAG import state: 79 knowledge sources, 696 knowledge-pool embeddings, all `3072 / v2_2`.
- The ready manifest still has remaining files, but the next phase is a 20-30 question TR/EN/DE RAG acceptance test, not blind bulk import.

## Current Risks

- Gemini free-tier quota can cause 429 responses and long retry windows.
- 3072-dimensional Gemini embeddings need explicit database/vector dimension handling.
- Old RAG data can pollute new retrieval if not cleaned before re-import.
- Root Markdown, imported agent blocks, and duplicated AGENTS/CLAUDE content may be stale.
- Uncommitted changes currently mix product RAG edits with tooling/spec/agent noise.
- Legacy `General` knowledge sources can still appear behind new categorized PDF sources and should be watched during acceptance testing.

## Do Not Assume

- Do not assume indexed-looking documents are actually embedded and searchable; verify DB rows and retrieval results.
- Do not assume root-level reports reflect current code.
- Do not assume AI must answer before a customer can create a ticket.
- Do not change high-blast-radius AI symbols without Graphify/GitNexus context when available.
- Do not commit `.agents`, `.kiro`, or generated tool context together with product-code fixes unless explicitly requested.
