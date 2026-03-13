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
## Knowledge Transfer: Self-Learning FAQ & Technical Service (Session v02-SL)
Date: 2026-03-13

### Highlights
- **Self-Learning System:** Implemented `FaqService` for automated Q&A extraction from resolved tickets and AI interaction logs.
- **Background Summary:** Integrated `kb-summarizer.processor.ts` for AI-driven summarization of knowledge candidates.
- **Technical Context:** Refined the `Hotinfo` integration within `CustomerProfile` for deep technical CAD/BIM support.
- **Database Alignment:** Synchronized `Product` and `Category` seeding with the AEC industry requirements (Allplan, AX3000, CDS).

### Current Status
- [x] FAQ Pipeline fully functional (Manual & Cron triggers).
- [x] BullMQ worker configured for knowledge summarization.
- [x] Product taxonomy updated to 2026 standards.
- [x] AI confidence bands tuned (85%+ for auto-publish).

### Resumption Guide
1. Review `FaqService.ts` for extraction logic.
2. Check `docs/FAQ_Self_Learing_mimarisi.MD` for the theoretical foundation.
3. Test extraction via `POST /faq/pipeline/run` (Admin role required).

