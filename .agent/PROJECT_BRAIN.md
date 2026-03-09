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
| **RAG-based AI Responses** | [x] BİTTİ | HIGH | Highly optimized, handles WEB/MOBILE/EMAIL channels. |
| **AI Settings Panel** | [x] BİTTİ | HIGH | Validates keys, stores provider configs. |
| **AI Configuration Validation**| [x] BİTTİ | ELITE | Prevents saving incomplete config. Cross-stack validation. |
| **AI Telemetry Dashboard** | [x] BİTTİ | HIGH | Token usage, cost estimation, channel grouping. |
| **Announcement Templates** | [x] BİTTİ | HIGH | Seeder conflict fixed. Ready for use. |
| **Ticketing System** | [x] BİTTİ | HIGH | Multi-channel state management. |
| **Language Switcher** | [x] BİTTİ | HIGH | TR/EN support at gateway level. |
| **SLA Policies UI** | [x] BİTTİ | HIGH | i18n nesting issue resolved. Fully stable. |
| **Backend Code Stability** | [x] BİTTİ | ELITE | Zero-error lint baseline. Modernized syntax. |

---

## 🛡️ Protected Features (RED ZONE)
*Do NOT modify these without running full regression tests:*
1. **`AiQueryService.ts`**: Core retrieval and LLM logic. Very sensitive to schema changes.
2. **`SettingsService.ts`**: Centralized config with now integrated AI validation.
3. **`schema.prisma`**: The heart of the data layer.
4. **`tickets.service.ts`**: Complex state transitions and multi-channel handling.
5. **`trigger-sync.ts`**: Standalone script context (ES2015 module syntax mandated).

---

## 🛠️ Current Session State & Handoff
- **Recent Progress:** 
  - Implemented Cross-Stack AI Configuration Validation.
  - Resolved 2 hard lint errors and 73+ warnings in the Backend.
  - Modernized `trigger-sync.ts` (removed deprecated namespaces).
  - Cleaned up unused variables/imports across core services and DTOs.
  - Fixed Prisma Engine Error by correcting re-export logic in `@aluplan/database` and enabling `driverAdapters` support.
- **Active Blockers:** 
  - **Duyuru Yönetimi (Admin):** Preview (önizleme) butonu 400 Bad Request hatası veriyor. Eskiden çalışıyordu, muhtemelen DTO değişimi veya backend validation şeması uyumsuzluğu oluştu.
- **Next Step:** Fix Announcement Preview 400 error.

---

## 📜 Global Business Rules
- **Aesthetics First:** UI must always look premium ("WOW factor"). No standard templates.
- **Reliability:** Never allow AI to answer without confidence (ConfidenceBand logic).
- **Validation:** Always validate interdependent AI settings (e.g., Key <-> Model).
- **Security:** Secrets must never be exposed. Use ENCRYPTION_KEY where applicable.
