# Aluplan Support Desk — Tam Proje Haritası

**Oluşturan:** Claude · **Tarih:** 2026-08-06
**Yöntem:** Kaynak kod, `openapi.json`, Prisma şeması ve production-derived dev DB (salt-okunur) üzerinden çıkarıldı. Tahmin yok; her sayı sayılarak elde edildi.
**Amaç:** Parça bilgiyle konuşmayı bitirmek. Bu belge, sistemin tamamının tek referansıdır.

> **Doğrulama notu:** Route envanteri önce regex ile çıkarıldı ve **3 yanlış pozitif** üretti (`/auth/me`, `/auth/test-email-config`, `GET /customers` yanlışlıkla "public" göründü — `@Public()` komşu route'tan sızmıştı). Bu yüzden nihai sayılar uygulamanın kendi ürettiği `openapi.json` ile doğrulandı. **Regex tabanlı yetki analizine tek başına güvenilmemelidir.**

---

## 1. Ürün ne yapıyor?

Aluplan Türkiye'nin Allplan (BIM/mimari yazılım) müşterileri için **AI destekli destek zekâsı platformu**. Chatbot değil.

**Çekirdek değer zinciri:**

```
Müşteri sorunu
  → AI teşhis (RAG: 7745 embedding + hibrit arama + rerank)
  → Yeterliyse: müşteri ticket açmadan çözüm alır (deflection)
  → Yetersizse: ticket açılır, AI cevabı bağlam olarak taşınır
  → Personel AI Copilot ile yanıtlar
  → Kapanan ticket → clustering → FAQ adayı → admin onayı → bilgi havuzu
```

**Ayırt edici özellikler:**
1. **Hotinfo entegrasyonu** — müşteri `.hxl` sistem raporu yükler; Allplan sürümü, GPU, lisans telemetrisi teşhise dahil olur. Ticket'a özel bağlam, global RAG korpusuna karıştırılmaz.
2. **CRM-farkında akıl yürütme** — Dynamics 365'ten 807 hesap senkron; müşteri lisans/sözleşme bağlamı AI'ya beslenir.
3. **Guardrail'li AI** — güven skorlaması, kaynak atıfı, R-kuralları (onaysız FAQ yayını yasak, müşteriye yalnız `audience=customer` içerik).
4. **Öğrenme döngüsü** — kapanan ticket'lardan otomatik bilgi üretimi, ama insan onayı kapısıyla.

**Ölçek (production-derived, 2026-08-06):** 1282 kullanıcı · 162 ticket · 476 mesaj · 259 AI etkileşimi · 29 FAQ · 807 CRM hesabı · 7745 knowledge-pool embedding · 241 bilgi kaynağı.

---

## 2. Sistem mimarisi

```
┌──────────────────────────────────────────────────────────┐
│ Next.js 15 App Router · :3000 · 44 sayfa · tr/en/de       │
│ Server Components + Zustand + Socket.io (TanStack yok)     │
└────────────────────────┬─────────────────────────────────┘
                         │ REST /api/v1  +  WebSocket
┌────────────────────────┴─────────────────────────────────┐
│ NestJS 11 · :4000 · 38 modül · 33 controller · 230 route  │
│ Global: JwtAuthGuard · RbacGuard · Throttler(120/dk)      │
│         helmet · csurf · XssValidationPipe · SsrfGuard    │
│         AuditLogInterceptor · MetricsInterceptor          │
└──┬──────────┬───────────┬──────────┬─────────────────────┘
   │          │           │          │
┌──┴───┐ ┌────┴────┐ ┌────┴────┐ ┌───┴──────────────────┐
│ PG17 │ │  Redis  │ │ BullMQ  │ │ Dış servisler        │
│pgvec │ │ cache   │ │ 8 kuyruk│ │ Dynamics365 · Gemini │
│62 tbl│ │ session │ │         │ │ OpenAI · Resend · R2 │
└──────┘ └─────────┘ └─────────┘ │ Gmail · Langfuse     │
                                  └──────────────────────┘
```

---

## 3. Backend — 230 route, modül bazında

| Modül (OpenAPI tag) | Route | Sorumluluk |
|---|---|---|
| **AI Engine** | 27 | RAG sorgu, teşhis, copilot, sağlık, telemetri, provider yönetimi |
| **Tickets** | 18 | Yaşam döngüsü, mesaj, atama, SLA, toplu işlem, AI trace |
| **Knowledge Base** | 17 | Makale CRUD, versiyon, onay, geri bildirim, arama |
| **Knowledge Pool** | 16 | Kaynak (URL/dosya/dataset), crawler, aday, embedding sync |
| **Email** | 14 | Provider (SMTP/Gmail/Resend), şablon, takip, inbound, OAuth |
| **Teams** | 14 | Departman, takım, üyelik, yetenek, vardiya, ajan yönetimi |
| **Auth** | 12 | Login, refresh, kayıt, doğrulama, reset, oturum iptali |
| **CRM** | 12 | Dynamics bağlantı, tam/delta sync, webhook, değişiklik log |
| **Announcements** | 12 | Duyuru CRUD, hedefleme, gönderim, log |
| **Customers** | 9 | Profil, Hotinfo, CRM eşleme, import |
| **FAQ** | 8 | Aday listesi, onay/red, yayın, provenance |
| **Proactive Chat** | 8 | Oturum, mesaj, kabul/red, ticket'a dönüştürme |
| **Users / Products** | 7+7 | Kullanıcı yönetimi · ürün-kategori |
| **Settings / Macros** | 6+6 | Ayar key-value · hazır cevaplar |
| **Webhooks / Templates** | 5+5 | Dış webhook · duyuru şablonları |
| **SLA Policies** | 4 | Politika CRUD |
| Diğer (12 modül) | ~20 | Notifications, Health, Attachments, WhatsApp, Reports, Branding, EmailValidator, Prometheus, AI History, Storage, CrmWebhook, OmniChannel, Ops Dashboard |

### Public route'lar (17 — kimlik doğrulaması yok)

| Route | Koruma |
|---|---|
| `POST /auth/login`, `/refresh`, `/lookup`, `/forgot-password`, `/resend-verification`, `/reset-password`, `/verify-email` | Rate limit + (yeni) purpose-claim token |
| `GET /auth/system-requirements` | Statik içerik |
| `POST /customers/register` | Kayıt akışı |
| `GET /branding/assets/*`, `GET /storage/*` | Dosya sunumu |
| `GET /email/track/:logId`, `POST /email/unsubscribe`, `POST /email/webhook/resend` | E-posta pixel/webhook |
| `GET /email/gmail/callback` | OAuth (state doğrulamalı) |
| `POST /kb/articles/:id/view` | Anonim görüntüleme sayacı |
| `GET /health` | Health probe |
| `POST /whatsapp/webhook`, `POST /omni-channel/webhook/email`, `POST /crm/webhooks/dynamics365` | **İmza guard'ı ile korunuyor** |

---

## 4. Frontend — 44 sayfa

```
(auth)/          register · reset-password · verify-email
login · help · unsubscribe · [locale] (landing)

(dashboard)/
├── dashboard                    Operasyon merkezi (rol-farkında)
├── tickets · tickets/[id] · tickets/new · my-tickets
├── knowledge-base (+[id], /edit, /new, /analytics)
├── knowledge-pool (+/upload)
├── faq · faq-learning · kb-approvals        ← 3 ekran, aynı FAQ kuyruğu
├── customers (+[id], /accounts/[id], /crm, /import)
├── teams (+/agents/[id], /departments/[id], /team-detail/[id])
├── products · users · profile · settings · system-topology · ai
└── admin/
    ├── ai-health · ai-intelligence · ai-interactions
    ├── announcements · email-validation · emails · settings
```

**Konvansiyonlar:** `next-intl` routing (tr varsayılan, en, de) · Zustand · Radix+Tailwind · `sonner` toast · Socket.io (SSE değil) · CSP nonce middleware · **API route handler yok** (0 adet) — tüm veri backend'den.

---

## 5. Veri modeli — 62 Prisma modeli

| Alan | Modeller |
|---|---|
| **Kimlik & Yetki** | User · Role · Permission · RolePermission |
| **Organizasyon** | Department · Team · TeamMember · Skill · AgentSkill · Shift · AvailabilityOverride |
| **Ticket** | Ticket · TicketMessage · Attachment · TicketEscalation · TicketRule · TicketEmbedding · Macro |
| **SLA** | SlaPolicy · BusinessHours · Holiday |
| **AI/RAG** | AiInteraction · AiShiftDetection · AiResponseCache · InteractionFeedback · TrainingQueue · PromptTemplate · EvalDataset · AiHealthEvent |
| **Bilgi** | KnowledgeArticle · KnowledgeArticleVersion · ArticleFeedback · KnowledgeEmbedding · KnowledgeSource · KnowledgeSourceSyncLog · KnowledgePoolEmbedding · CrawlCandidate · Category |
| **FAQ** | FaqEntry · **FaqEntrySource** (yeni — provenance) |
| **CRM** | CrmAccount · CrmConnection · CrmSyncLog · CrmDeltaSyncState · CrmChangeLog · CustomerProfile |
| **E-posta** | EmailLog · EmailEvent · EmailPreference · EmailUnsubscribeFeedback · InboundEmailLog |
| **Duyuru** | Announcement · AnnouncementLog · AnnouncementTemplate |
| **Chat** | ProactiveChatSession · ProactiveChatMessage |
| **Diğer** | Product · ProductCategory · Setting · AuditLog · Webhook · Notification |

**Konvansiyonlar:** UUID PK · snake_case kolon + camelCase alan · evrensel soft-delete (`deletedAt`) · `createdAt`/`updatedAt` · pgvector `Unsupported("vector")` · `embedding_version + embedding_dim` izolasyonu (ADR-007).

---

## 6. Asenkron işleme

**8 BullMQ kuyruğu:** `ai-query-processing` · `crm-sync` · `knowledge-sync` · `email` · `sla-processing` · `document-parsing` · `embedding-migration` · `kb-summarizer`

**9 zamanlanmış görev:**

| Zaman | İş | Servis |
|---|---|---|
| Her dakika | Inbound e-posta kontrolü | `email-inbound.service` |
| Her dakika | Hayalet kullanıcı temizliği | `notifications.gateway` |
| 5 dakikada bir | AI bütçe kontrolü | `ai-budget-monitor` |
| 5 dakikada bir | CRM delta sync | `crm-delta-sync` |
| Saatlik | RAG metrik toplama | `rag-observability` |
| 02:00 | Ticket clustering → FAQ adayı | `ticket-clustering` |
| 02:00 | Veritabanı yedeği | `database-backup` |
| 03:00 | Gecelik FAQ pipeline | `faq.cron` |
| 03:00 | AI sağlık olay temizliği | `ai-health-event` |
| Pazartesi 09:00 | Haftalık sağlık raporu | `ai-reporting` |

**WebSocket olayları:** `ticket:join/leave/typing/message_read` · `proactive_chat:join/leave/typing` · `heartbeat`

---

## 7. AI/RAG katmanı — 30 servis

**Pipeline:** sorgu → teşhis → adaptif eşik → hibrit arama (semantik+keyword) → rerank (kaynak güven hiyerarşisi) → bağlam derleme → `buildSupportAnswerContractPrompt` → LLM → güven skoru → cache

**Kritik servisler:** `AiQueryService` (RAG giriş) · `SupportAnswerOrchestrator` (müşteri/admin parity, ADR-009) · `EmbeddingService` · `PromptContextBuilderService` · `AiSemanticCache` · `AiProviderRouter` (circuit breaker) · `RagMaintenanceService` · `TicketClusteringService` · `AiCopilotService` · `LangfuseService`

**Provider:** Gemini birincil (chat + embedding `v2_2/3072`) · OpenAI/Groq **yalnız chat fallback** (ADR-006: embedding fallback yasak) · Ollama local

---

## 8. Yetkilendirme — mevcut gerçek durum

> Bu bölüm sistemin **en tutarsız** alanıdır. Değişiklik yapmadan önce dikkatle okunmalı.

**Üç paralel rol kaynağı, birbirine bağlı değil:**

| Kaynak | İçerik | Yetki üretir mi? |
|---|---|---|
| `users.roleId → roles` | `ADMIN` (5), `CUSTOMER` (1277) | ✅ **Evet** — `rbac.guard.ts:43` bunu okur |
| `team_members.roleOverride` (`SystemRole` enum) | `DEPARTMENT_MANAGER`, `AGENT` | ❌ Hayır — yalnız atama/yönlendirme |
| `@Roles()` dekoratörleri | 9 farklı isim | ⚠️ Çoğu hiçbir kaynakta yok → sessizce eşleşmez |

**16 tanımlı izin:** `*` · `ai-interactions:read` · `faq:manage/read/review` · `kb:read/write` · `reports:read` · `settings:read/write` · `ticket:assign/create/escalate/read/update` · `users:manage`

**Organizasyon yapısı (gerçek):** 6 departman · 9 takım · 18 üyelik · **2 personel** (Meli, Meriç — ikisi de global `ADMIN` + `*` wildcard)

**Bilinen sorunlar:**
1. Destek personeli tam admin yetkisine sahip (least-privilege ihlali)
2. `admin@example.com` seed hesabı üretimde ACTIVE, sıfır aktivite
3. Route'ların çoğunda rol/izin kontrolü yok — yalnız JWT (çoğu için doğru, ama denetlenmemiş)
4. Yalnız 8 route izin-tabanlı; 40 route rol-tabanlı

---

## 9. Gözlemlenebilirlik & operasyon

`nestjs-pino` (PII redaction) · Sentry · OpenTelemetry · **Langfuse** (52 referans — her LLM çağrısı izleniyor) · Prometheus · Bull-Board `/admin/queues` · opsiyonel Loki

**Deploy:** Coolify · `start:prod = prisma migrate deploy && node dist/main` (**migration önce, uygulama sonra** — kritik sıra)

**CI kapıları:** `test:ops-safety` · `db:verify:migration-files` · `db:verify:migrations` · typecheck · i18n · tam test suite

---

## 10. Kalite durumu (2026-08-06)

| Ölçüt | Durum |
|---|---|
| Backend test | 1083 geçti / 1 skip / **0 fail** |
| Frontend unit | 227-228 test geçti |
| Migration | 54 dosya / 54 manifest ✅ |
| Typecheck | 4/4 ✅ |
| i18n (tr/en/de) | Tam ✅ |
| Migration zinciri (fresh install) | P3018'siz ✅ |

---

## 11. Bilinen açık konular

| Konu | Durum |
|---|---|
| Faz 8 — production migration | Kullanıcı onayı + bakım penceresi bekliyor |
| 14 canlı API anahtarı + admin parolası | **Kullanıcı rotasyonu bekliyor** |
| RBAC tutarsızlığı | Öneri hazır, uygulanmadı |
| `admin@example.com` seed hesabı | Kapatılmalı |
| TrainingQueue | Model var (26 kayıt), iş akışı yok |
| Shadow DB read-only zorlaması | Yalnız operasyonel sözleşme |
| `/faq`, `/faq-learning`, `/kb-approvals` | Aynı kuyruk 3 ekranda |
| Sidebar onay rozeti | Yanlış kuyruğu sayıyor |

---

## 12. Bu haritayı kullanırken

- **Sayılar tarih damgalıdır.** Kod değiştikçe yeniden sayın; bu belgeyi kaynak değil, başlangıç noktası olarak kullanın.
- **Yetki analizinde regex'e güvenmeyin** — bu haritayı çıkarırken 3 yanlış pozitif üretti. Kaynak koddan doğrulayın.
- **Truth hierarchy:** kod > testler > şema/migration > git geçmişi > `.ai` belgeleri > kök Markdown.
- Değişiklik yapmadan önce yüksek blast-radius sembolleri kontrol edin (CLAUDE.md §4).
