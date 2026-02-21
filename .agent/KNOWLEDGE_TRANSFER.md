# Knowledge Transfer: Hybrid AI Ticket Tagging (Session v02-AI)
Date: 2026-02-20

## Overview
This session focused on implementing a Hybrid AI system for ticket categorization. The system combines static admin logic with RAG (Retrieval-Augmented Generation) based on high-quality historical tickets.

## Architecture Snapshot
- **Engine:** Ollama (Local/Self-hosted)
- **Chat Model:** `llama3.2:3b`
- **Embedding Model:** `mxbai-embed-large`
- **Vector Storage:** PostgreSQL with `pgvector` extension.

## Core Files & Services
1. **`apps/backend/src/ai/ollama.service.ts`**: Low-level API wrapper for Ollama.
2. **`apps/backend/src/ai/embedding.service.ts`**: Manages vector indexing for Knowledge Base and high-rated Ticket embeddings.
3. **`apps/backend/src/ai/ai-query.service.ts`**: High-level logic for `smartTagTicket`.
4. **`apps/backend/src/tickets/tickets.service.ts`**: Updated `create` method to trigger async tagging.
5. **`apps/frontend/src/app/(dashboard)/products/page.tsx`**: New Admin UI for categorizations.
6. **`apps/frontend/src/app/(dashboard)/tickets/new/page.tsx`**: Refactored Customer UI with card-based product selector.

## Current State & Handoff
- [x] Database Schema updated and migrated.
- [x] Backend AI services implemented and tested.
- [x] Admin dashboard for products/categories functional.
- [x] Customer ticket form refactored to product selection cards.
- [x] Admin "System Guide" integrated into sidebar (`/help`).
- [x] Stability: Confirmed through `next build` and local testing.

## How to Resume
1. The system is marked with tag `bcc-stable-v02-ai-ready`.
2. Start the dev environment with `pnpm run dev`.
3. Check AI status via `/ai` dashboard or the new `/help` guide.
4. Future Work: Implement specialized "Triage Rules" engine and potentially fine-tune prompts based on `suggestedCategories` feedback loop.

## Key Logic Node (RAG)
The background listener in `AiAutoResolverService` watches for tickets with `satisfactionScore >= 4`. It automatically triggers an embedding task to index these tickets as "Golden Examples" for future triage.
