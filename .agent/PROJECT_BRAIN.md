# 🧠 PROJECT BRAIN - Aluplan Support Desk (v02)

> **MANDATORY READ FOR EVERY AGENT AT SESSION START.**  
> This document tracks the "Soul" of the project, feature status, and critical paths that must NOT be broken.

---

## 🎯 Project Mission
Elite, AI-powered customer support platform integrating modern web (Next.js), real-time chat, and automated ticketing with robust RAG-based intelligence. The goal is to provide a "Liquid Glass" (high-fidelity/high-performance) experience for both users and admins.

---

## 🏗️ Technical Architecture
- **Backend:** NestJS, Prisma, BullMQ (Queueing), Redis.
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide icons.
- **Database:** PostgreSQL with `pgvector` for AI similarity search.
- **AI Stack:** Ollama (local) / OpenAI / Gemini providers via a unified `AiService` dispatcher.

---

## 📊 Feature Inventory

| Feature | Status | Quality | Notes |
| :--- | :--- | :--- | :--- |
| **Trilingual RAG Intelligence** | [x] BİTTİ | HIGH | Optimized for TR/EN/DE with OpenAI embeddings. |
| **AI Settings Panel** | [x] BİTTİ | HIGH | Validates keys, stores provider configs. |
| **AI Configuration Validation**| [x] BİTTİ | ELITE | Prevents saving incomplete config. Cross-stack validation. |
| **AI Telemetry Dashboard** | [x] BİTTİ | HIGH | Token usage, cost estimation, channel grouping. |
| **Announcement Templates** | [x] BİTTİ | HIGH | Seeder conflict fixed. Ready for use. |
| **Ticketing System** | [x] BİTTİ | HIGH | Multi-channel state management. |
| **Trilingual Support** | [x] BİTTİ | HIGH | TR/EN/DE support across Gateway, App & RAG. |
| **SLA Policies UI** | [x] BİTTİ | HIGH | i18n nesting issue resolved. Fully stable. |
| **Backend Code Stability** | [x] BİTTİ | ELITE | Zero-error lint baseline. Modernized syntax. |
| **Enterprise Email System** | [x] BİTTİ | ELITE | Robust MJML pathing, BullMQ hardening, branding sync. |
| **Admin Language Switcher** | [x] BİTTİ | ELITE | Trilingual (TR, EN, DE), persistent user preference, button-based UI. |

---

## 🛠 Project Status & Brain Focus (Liquid Glass Era)

---

## 🛡️ Protected Features (RED ZONE)
*Do NOT modify these without running full regression tests:*
1. **`AiQueryService.ts`**: Core retrieval and LLM logic. Very sensitive to schema changes.
2. **`SettingsService.ts`**: Centralized config with now integrated AI validation.
3. **`schema.prisma`**: The heart of the data layer.
4. **`tickets.service.ts`**: Complex state transitions and multi-channel handling.
5. **`trigger-sync.ts`**: Standalone script context (ES2015 module syntax mandated).
6. **`email.templates.ts`**: Robust pathing and MJML compilation logic.

---

- **Recent Progress:** 
  - Optimized Transactional Email System for Enterprise-grade reliability (attempts=5, backoff=2s).
  - Implemented trilingual RAG System with unified PDF/MSG ingestion.
  - Migrated to OpenAI `text-embedding-3-small` (1536 dims) for cross-lingual support.
  - Achieved ZERO ERROR baseline in Backend Terminal (Lint/Build/Logic).
  - **RESOLVED:** Fixed Announcement Management Preview bug (Double path lookup in `TemplateService`).
  - **RESOLVED:** Fixed Registration Email delivery failure (MJML validation bypass for dynamic Handlebars styles).
- **Active Blockers:** None.
- **Next Step:** Verify production readiness and continue performance tuning.


---

## 📜 Global Business Rules
- **Aesthetics First:** UI must always look premium ("WOW factor"). No standard templates.
- **Reliability:** Never allow AI to answer without confidence (ConfidenceBand logic).
- **Validation:** Always validate interdependent AI settings (e.g., Key <-> Model).
- **Security:** Secrets must never be exposed. Use ENCRYPTION_KEY where applicable.
