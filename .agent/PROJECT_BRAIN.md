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
| **Landing Page V2** | [x] BİTTİ | ELITE | Industrial-Sharp design, ALLPLAN focus, trilingual. |
| **Backend Code Stability** | [x] BİTTİ | ELITE | Zero-error lint baseline. Modernized syntax. |
| **Enterprise Email System** | [x] BİTTİ | ELITE | Robust MJML pathing, BullMQ hardening, branding sync. |
| **Admin Language Switcher** | [x] BİTTİ | ELITE | Trilingual (TR, EN, DE), persistent user preference, button-based UI. |
| **Proactive Monitoring System** | [x] BİTTİ | HIGH | Bash-based health checks (B/F/DB) with JSON status and logs. |

---

## 🛠 Project Status & Brain Focus (Liquid Glass Era)
- **Design System:** Transitioned to "Industrial-Sharp" aesthetic (0-radius, grid scanlines, wireframe corners).
- **Domain Focus:** ALLPLAN Architecture & Engineering Support expertise prioritization.

---

## 🛡️ Protected Features (RED ZONE)
*Do NOT modify these without running full regression tests:*
1. **`AiQueryService.ts`**: Core retrieval and LLM logic. Very sensitive to schema changes.
2. **`SettingsService.ts`**: Centralized config with now integrated AI validation.
3. **`schema.prisma`**: The heart of the data layer.
4. **`tickets.service.ts`**: Complex state transitions and multi-channel handling.
5. **`trigger-sync.ts`**: Standalone script context (ES2015 module syntax mandated).
6. **`email.templates.ts`**: Robust pathing and MJML compilation logic.
7. **`watch_services.sh`**: Core monitoring logic for production health.
8. **`LandingHub.tsx`**: Critical UI entrance with 100% i18n and industrial design system.

---

- **Recent Progress:** 
  - **REFACTOR:** Completed ALLPLAN Content Pivot, refocusing features/FAQs on BIM, Library, and Engineering hakediş.
  - **i18n:** Achieved 100% strict localization compliance for TR/EN/DE. Synchronized translation keys in `tr.json`, `en.json`, and `de.json` with the modular `LandingHub.tsx` sections.
  - **DESIGN:** Implemented "Industrial-Sharp" aesthetic with 0-radius consistency, `industrial-grid` backgrounds, and `scanline-overlay` micro-textures.
  - **STABILITY:** Verified trilingual rendering and resolved JSX nesting issues.
- **Active Blockers:** None.
- **Next Step:** Email Inbound implementation & Monitoring system expansion.
---

## 📜 Global Business Rules
- **Aesthetics First:** UI must always look premium ("WOW factor"). No standard templates.
- **Reliability:** Never allow AI to answer without confidence (ConfidenceBand logic).
- **Validation:** Always validate interdependent AI settings (e.g., Key <-> Model).
- **Security:** Secrets must never be exposed. Use ENCRYPTION_KEY where applicable.
