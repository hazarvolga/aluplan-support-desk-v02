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
| **Backend Code Stability** | [x] BİTTİ | ELITE | Zero-error lint baseline. Modernized syntax. **SECURITY FIXED**: Sanitized hardcoded secrets in `.github/workflows`. |
| **E2E TESTLERİ** | [x] BİTTİ | HIGH | Playwright tests synchronized. Fixed root path credentials and redirected `/login` paths. |
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
  - **REFACTOR:** Completed ALLPLAN Content Pivot, refocusing features/FAQs on BIM, Architecture, and Engineering (Hakediş).
  - **i18n:** Restored and synchronized 100% of translation keys across `tr.json`, `en.json`, and `de.json`. Fixed missing sections in English and Turkish files (Dashboard, Sidebar, Tickets, AI, Customers, Settings, Admin).
  - **DATABASE:** Successfully diagnosed and resolved the admin login issue (`hazarvolga@gmail.com`). The user was missing from the database; seeded the correct admin user and verified credential integrity.
- **STABILITY:** Achieved zero-error lint baseline across the entire backend. Hardened all catch-blocks and resolved unused variable warnings for production readiness.
  - **SECURITY:** Removed hardcoded database secrets from `.github/workflows` to prevent credential exposure.
  - **E2E:** Synchronized admin credentials between `seed.ts` and Playwright tests. Fixed login pathing to ensure consistent authentication verification.
  - **AUDIT:** Passed core security, lint, and functional verification via `checklist.py`.
  - **DESIGN:** Implemented interactive "Türkiye'ye Özel Çözümler" sections with industrial hover effects and external link icons. Implemented Industrial-Sharp design system (0-radius, grid scanlines).
- **Next Step:** Email Inbound (threading & processing) & Production Monitoring system expansion.
---

## 📜 Global Business Rules
- **Aesthetics First:** UI must always look premium ("WOW factor"). No standard templates.
- **Reliability:** Never allow AI to answer without confidence (ConfidenceBand logic).
- **Validation:** Always validate interdependent AI settings (e.g., Key <-> Model).
- **Security:** Secrets must never be exposed. Use ENCRYPTION_KEY where applicable.
