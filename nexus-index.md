# GitNexus Index — aluplan-support-desk-V02

**Indexed:** 2026-05-09 12:19:41 UTC  
**Last commit:** b328059acdf7091faa6f605fc83b22d26f7993f8  
**Repo:** https://github.com/hazarvolga/aluplan-support-desk-v02

---

## Stats

| Metric | Value |
|--------|-------|
| Files indexed | 734 |
| Nodes (symbols) | 9,142 |
| Edges (relationships) | 15,926 |
| Communities | 365 |
| Execution flows | 241 |

---

## Top Abstractions (God Nodes)

| Rank | Symbol | Edges | Description |
|------|--------|-------|-------------|
| 1 | `Error()` | 221 | Global error handling |
| 2 | `t()` | 83 | i18n translation |
| 3 | `toast()` | 37 | Notifications/UI feedback |
| 4 | `AiService` | 33 | AI orchestration |
| 5 | `AiQueryService` | 31 | RAG query pipeline |
| 6 | `load()` | 27 | Data fetching |
| 7 | `EmailService` | 25 | Email processing |
| 8 | `AiController` | 24 | AI API endpoints |
| 9 | `NotificationsGateway` | 22 | WebSocket real-time |
| 10 | `CrmService` | 20 | CRM integration |

---

## Key Communities

### AI & RAG Pipeline
- **Community 3**: AiCopilotService, AiDiagnosisService, AiQueryService, EmbeddingService, DocumentParserService
- **Community 4**: AiService, LlmApiService, GenericOpenAiService, EmailProcessor, SmtpProvider

### Auth & Users
- **Community 8**: AuthController, AuthService, CustomersController, CustomersService, CrmEmailValidatorService
- **Community 12**: login(), loginAsAdmin(), loginAsAgent(), AutomationService, EmailService, ErrorLoggerService

### CRM & Dynamics
- **Community 7**: CrmController, CrmProcessor, CrmService, CrmWebhookController, CryptoService
- **Community 30**: D365 adapter functions (buildD365Account, buildD365Contact, etc.)

### Announcements & Notifications
- **Community 5**: AnnouncementsController, AnnouncementsService, fetchPage(), NotificationsGateway
- **Community 53**: CreateAnnouncementDto, TargetCriteriaDto, UpdateAnnouncementDto

### Ticket System
- **Community 2**: createTicket(), deleteTicket(), bulkUpdateTickets(), createArticle(), getApiUrl()
- **Community 121**: TicketsModule

### WhatsApp & OmniChannel
- **Community 29**: WhatsAppController, WhatsAppService
- **Community 162**: OmniChannelModule

---

## Surprising Connections

- `bootstrap()` → `Error()` — test-ws-locally.ts → frontend/error.tsx
- `main()` → `load()` — syllabus_injector.py → analytics/page.tsx
- `main()` → `Error()` — seed-production-pg.js → frontend/error.tsx

---

## Execution Flows (241)

Key flows identified:
1. Ticket lifecycle (create → assign → resolve)
2. Auth flow (login → JWT → refresh)
3. RAG query (embed → search → rerank → respond)
4. Announcement broadcast (create → WebSocket → archive)
5. CRM sync (webhook → adapter → upsert)
6. Proactive chat (session → message → ticket conversion)

---

## Knowledge Gaps

- **88 isolated nodes**: Missing documentation or orphaned code
- **Thin communities** (20+): Products, AnnouncementTemplates, Macros, WhatsApp — may need more connections extracted

---

## Edge Quality

- **62% EXTRACTED**: Direct code relationships
- **38% INFERRED**: AI-reasoned connections (avg confidence: 0.8)
- **0% AMBIGUOUS**: No uncertain relationships

---

## Usage

```bash
# Query the index
gitnexus query "<question>"

# Get symbol context
gitnexus context "<symbol>"

# Impact analysis before editing
gitnexus impact "<symbol>"

# Detect changes after edits
gitnexus detect_changes
```

---

## Files Changed During This Session

| File | Change |
|------|--------|
| `.env.example` | Added Gemini free tier env vars |
| `announcements.controller.ts` | RBAC @Roles added |
| `proactive-chat.controller.ts` | RBAC @Roles added |
| `main.ts` | CORS origin blocking (SSRF fix) |
| `shared-schemas/src/uuid.schema.ts` | Created to resolve conflict |

---

*Generated from `.gitnexus/meta.json` + graphify-out/GRAPH_REPORT.md*