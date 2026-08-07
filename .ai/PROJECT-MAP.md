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
│ Next.js 15 App Router · :3000 · 45 sayfa · tr/en/de       │
│ Server Components + Zustand + Socket.io (TanStack yok)     │
└────────────────────────┬─────────────────────────────────┘
                         │ REST /api/v1  +  WebSocket
┌────────────────────────┴─────────────────────────────────┐
│ NestJS 11 · :4000 · 37 modül · 34+1 controller · 231 op   │
│ Global: JwtAuthGuard · RbacGuard · Throttler(120/dk)      │
│         helmet · csurf · XssValidationPipe · SsrfGuard    │
│         AuditLogInterceptor · MetricsInterceptor          │
└──┬──────────┬───────────┬──────────┬─────────────────────┘
   │          │           │          │
┌──┴───┐ ┌────┴────┐ ┌────┴────┐ ┌───┴──────────────────┐
│ PG17 │ │  Redis  │ │ BullMQ  │ │ Dış servisler        │
│pgvec │ │ cache   │ │ 9 kuyruk│ │ Dynamics365 · Gemini │
│62 tbl│ │ session │ │         │ │ OpenAI · Resend · R2 │
└──────┘ └─────────┘ └─────────┘ │ Gmail · Langfuse     │
                                  └──────────────────────┘
```

> **2026-08-06 düzeltme (Codex bağımsız incelemesiyle):** Bu bölümdeki modül/route/kuyruk sayıları, ilk sürümdeki hatalı sayım yöntemleri düzeltilerek güncellendi. Ayrıntılar ve kanıtlar `codex-claude-ortak-rapor.md`'de "Codex'in düzeltme talebi — bağımsız doğrulama" başlığı altında.

---

## 3. Backend — 231 operation, modül bazında

230 operation, proje içindeki 34 controller'dan; `GET /metrics` ise paket-kaynaklı `PrometheusController` sınıfından gelir.

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
| **Review Center** | 1 | Yetkiye göre süzülen görev/onay özeti; mutasyon içermez |
| Diğer (12 modül) | ~20 | Notifications, Health, Attachments, WhatsApp, Reports, Branding, EmailValidator, Prometheus, AI History, Storage, CrmWebhook, OmniChannel, Ops Dashboard |

### Public operation'lar (22 — `@Public()` dekoratörü, JWT muaf)

> **2026-08-06 düzeltme:** İlk sayım (17) satır-aralığı hatası yüzünden 5 operation'ı kaçırmıştı (`GET /products`, `GET /whatsapp/webhook`, ve auth/email'deki bazı POST'lar dekoratör bloğu yanlış ilişkilendirilmişti). 22 sayısı, her dekoratör bloğu kaynak koddan tek tek okunarak doğrulandı. Tam liste, guard/rate-limit/inline-doğrulama ayrımıyla: `.ai/RBAC-MATRIX.md`.

`@Public()` yalnız **global JWT guard muafiyetini** ifade eder — "korumasız" ile eş anlamlı değildir. Beş alt kategori var:

| Kategori | Adet | Örnek | Gerçek koruma |
|---|---|---|---|
| Rate-limited auth akışı | 5 | `POST /auth/login` (20/dk), `/forgot-password` (10/dk), `/resend-verification` (5/dk), `/reset-password` (10/dk), `/verify-email` (10/dk) | `@Throttle` + (BULGU-02 sonrası) `purpose` claim doğrulaması |
| Guard'lı public | 4 | `POST /auth/refresh` (`RefreshGuard`) · `POST /crm/webhooks/dynamics365` (`CrmWebhookGuard`) · `POST /omni-channel/webhook/email` (`InboundEmailWebhookSignatureGuard`) · `POST /whatsapp/webhook` (`WhatsAppWebhookSignatureGuard`) | Dekoratör tabanlı guard |
| Inline doğrulamalı | 3 | `GET /email/gmail/callback` (state tüketimi) · `POST /email/webhook/resend` (Svix HMAC imza) · `POST /email/unsubscribe` (HMAC-imzalı token — **`JWT_SECRET` yoksa `'fallback-secret'`'e düşüyor, ayrı not edildi**) | Guard değil, method içinde manuel kontrol |
| Path-traversal korumalı dosya sunumu | 2 | `GET /storage/*path` (basePath `startsWith` kontrolü) · `GET /branding/assets/*path` | Inline path normalize |
| Gerçekten korumasız (tasarım gereği düşük risk) | 8 | `GET /products` (katalog), `GET /health`, `GET /auth/system-requirements`, `POST /customers/register`, `POST /kb/articles/:id/view` (anonim sayaç), `GET /email/track/:logId` (pixel), `GET /whatsapp/webhook` (Meta doğrulama), `POST /auth/lookup` (e-posta domain lookup — **rate limit yok, düşük öncelikli inceleme adayı**) | Yok — tasarım gereği açık |

**En düşük önceliğe rağmen not edilmesi gereken 2 nokta:** (1) `POST /auth/lookup`'ta rate limit yok; (2) `POST /email/unsubscribe`'ın HMAC fallback secret'ı üretimde `JWT_SECRET` her zaman set olduğu için pratikte tetiklenmez, ama kod olarak kırılgan bir varsayılan.

---

## 4. Frontend — 45 sayfa

```
(auth)/          register · reset-password · verify-email
login · help · unsubscribe · [locale] (landing)

(dashboard)/
├── dashboard                    Operasyon merkezi (rol-farkında)
├── tickets · tickets/[id] · tickets/new · my-tickets
├── knowledge-base (+[id], /edit, /new, /analytics)
├── knowledge-pool (+/upload)
├── faq · faq-learning · kb-approvals        ← 3 ekran, aynı FAQ kuyruğu
├── review-center                            Yetki-kapsamlı görev ve onay yönlendirme merkezi
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

> **2026-08-06 düzeltme:** İlk sayım `proactive-chat` kuyruğunu kaçırmıştı (8→9) ve CRM delta-sync'i cron sanmıştı; gerçekte BullMQ repeatable job'dur (9 cron ayrı sayılır).

**9 benzersiz BullMQ kuyruğu — producer/consumer eşlemesi:**

| Kuyruk | Processor (consumer) | Producer (`.add()` çağıran) |
|---|---|---|
| `ai-query-processing` | `AiQueryProcessor` | `ai-query.service.ts`, `ai.controller.ts` |
| `crm-sync` | `CrmProcessor` | `crm.service.ts`, `crm-delta-sync.service.ts` |
| `knowledge-sync` | `KnowledgePoolProcessor` | `knowledge-pool.service.ts` |
| `email` | `EmailProcessor` | `email.service.ts` |
| `sla-processing` | `SlaProcessor` | `sla.cron.ts` |
| `document-parsing` | `DocumentParsingProcessor` | `document-ai.service.ts` |
| `kb-summarizer` | `KbSummarizerProcessor` | `faq.service.ts` |
| `proactive-chat` | `ProactiveChatTimeoutProcessor` | `proactive-chat.service.ts`, `notifications.gateway.ts` |
| `embedding-migration` | `EmbeddingMigrationProcessor` | `SettingsService` `ai.embedding.provider_changed` event'ini yayınlar → `EmbeddingMigrationProcessor.handleProviderChange()` cache'i temizler ve `migrationQueue.add('migrate-vectors', ...)` çağırır |

Ayrıca `queue-dashboard` modülü (`ai-query-processing`, `document-parsing`, `crm-sync`, `email`) izleme/stalled-job-recovery amacıyla bu kuyrukları **tüketmeden** enjekte eder — yukarıdaki tabloya dahil edilmedi.

**Zamanlama — iki farklı yaşam döngüsü, karıştırılmamalı:**

**9 Nest `@Cron` işi:**

| Zaman | İş | Servis |
|---|---|---|
| Her dakika | Inbound e-posta kontrolü | `email-inbound.service` |
| Her dakika | Hayalet kullanıcı temizliği | `notifications.gateway` |
| 5 dakikada bir | AI bütçe kontrolü | `ai-budget-monitor` |
| Saatlik | RAG metrik toplama | `rag-observability` |
| 02:00 | Ticket clustering → FAQ adayı | `ticket-clustering` |
| 02:00 | Veritabanı yedeği | `database-backup` |
| 03:00 | Gecelik FAQ pipeline | `faq.cron` |
| 03:00 | AI sağlık olay temizliği | `ai-health-event` |
| Pazartesi 09:00 | Haftalık sağlık raporu | `ai-reporting` |

**1 BullMQ repeatable job (cron değil):**

| Zaman | İş | Servis |
|---|---|---|
| 5 dakikada bir | CRM delta sync | `crm-delta-sync.service.ts` — `jobId: 'crm-delta-sync-repeatable'`, `crm-sync` kuyruğuna kayıtlı |

**Fark neden önemli:** Cron ve BullMQ repeatable job aynı retry/observability/deploy-restart davranışına sahip değil. Cron işi Nest scheduler'a bağlı (tekil process içinde); repeatable job Redis'te kalıcı, restart'ta duplicate registration riski taşıyabilir (`jobId` ile korunuyor, ama bu ayrım gözden kaçarsa yanlış varsayımla iş kaybı/duplikasyon debug'ı zorlaşır).

**WebSocket olayları:** `ticket:join/leave/typing/message_read` · `proactive_chat:join/leave/typing` · `heartbeat`

---

## 7. AI/RAG katmanı — 30 servis

**Pipeline:** sorgu → teşhis → adaptif eşik → hibrit arama (semantik+keyword) → rerank (kaynak güven hiyerarşisi) → bağlam derleme → `buildSupportAnswerContractPrompt` → LLM → güven skoru → cache

**Kritik servisler:** `AiQueryService` (RAG giriş) · `SupportAnswerOrchestrator` (müşteri/admin parity, ADR-009) · `EmbeddingService` · `PromptContextBuilderService` · `AiSemanticCache` · `AiProviderRouter` (circuit breaker) · `RagMaintenanceService` · `TicketClusteringService` · `AiCopilotService` · `LangfuseService`

**Provider:** Gemini birincil (chat + embedding `v2_2/3072`) · OpenAI/Groq **yalnız chat fallback** (ADR-006: embedding fallback yasak) · Ollama local

---

## 8. Yetkilendirme — mevcut gerçek durum

> Bu bölüm sistemin **en tutarsız** alanıdır. Değişiklik yapmadan önce dikkatle okunmalı.
> **2026-08-06 düzeltme (Codex talebiyle):** `8 izin-tabanlı / 40 rol-tabanlı` rakamları güncel değildi. Doğrulanmış sayılar ve tam operation-bazlı sınıflandırma aşağıda; ham liste `.ai/RBAC-MATRIX.md`.

**Üç paralel rol kaynağı, birbirine bağlı değil:**

| Kaynak | İçerik | Yetki üretir mi? |
|---|---|---|
| `users.roleId → roles` | `ADMIN` (5), `CUSTOMER` (1277) | ✅ **Evet** — `rbac.guard.ts:43` bunu okur |
| `team_members.roleOverride` (`SystemRole` enum) | `DEPARTMENT_MANAGER`, `AGENT` | ❌ Hayır — yalnız atama/yönlendirme |
| `@Roles()` dekoratörleri | 9 farklı isim | ⚠️ Çoğu hiçbir kaynakta yok → sessizce eşleşmez |

**Organizasyon yapısı (gerçek):** 6 departman · 9 takım · 18 üyelik · **2 personel** (Meli, Meriç — ikisi de global `ADMIN` + `*` wildcard)

### 231 operation'ın yetkilendirme sınıfı dağılımı (kaynak kod + OpenAPI ile doğrulandı)

| Sınıf | Adet | Anlamı |
|---|---:|---|
| `ROLE` | 132 | `@Roles(...)` ile sınırlı (class-level dahil, tekil dekoratör sayısı 113) |
| `PERMISSION` | 49 | `@RequirePermissions(...)` ile sınırlı — dekoratör sayısıyla birebir |
| `JWT_ONLY` | 28 | Kimlik doğrulanmış **her** kullanıcı erişir (CUSTOMER dahil) — rol/izin kontrolü yok; paket-kaynaklı `GET /metrics` ve yetkiye göre boş/sınırlı yanıt üreten `GET /review-center/summary` dahil |
| `PUBLIC` | 18 | JWT muaf, ek koruma yok/düşük risk; `POST /kb/articles/:id/view` dahil |
| `PUBLIC+GUARD` | 4 | JWT muaf ama özel guard'lı |

> `GET /metrics`, proje içi controller dosyasından değil `@willsoto/nestjs-prometheus` paketinin `PrometheusController` sınıfından gelir. `@Public()` veya route-level guard taşımadığı için uygulamanın global `JwtAuthGuard` korumasıyla `JWT_ONLY` sınıfındadır. Matrisin `Guard` sütunu aksi açıkça belirtilmedikçe controller/class/method üzerinde tanımlı explicit guard'ları gösterir; global `APP_GUARD` kayıtlarını her satırda tekrar etmez.

### 🔴 Kritik RBAC drift'i — DB izin kataloğu endpoint taleplerini karşılamıyor

Controller'ların `@RequirePermissions` ile istediği **7 izin, `permissions` tablosunda yok**:

| İstenen izin | Kullanan endpoint(ler) | Bugünkü gerçek erişim |
|---|---|---|
| `admin:settings` | `PATCH/GET/POST/DELETE /tickets/sla/policies` (4 endpoint) | **Yalnız ADMIN** (`*` wildcard) |
| `ticket:close` | `PATCH /tickets/:id/close` | **Yalnız ADMIN** |
| `kb:create` | Makale oluşturma/dosya-tabanlı oluşturma (3 endpoint) | **Yalnız ADMIN** |
| `kb:update` | Makale güncelleme | **Yalnız ADMIN** |
| `kb:delete` | Makale silme (2 endpoint) | **Yalnız ADMIN** |
| `kb:approve` | `POST /kb/:id/review` — **makale onay/red** | **Yalnız ADMIN** |
| `kb:submit_review` | `POST /kb/:id/submit` — incelemeye gönderme | **Yalnız ADMIN** |

**Kanıt:** `rbac.guard.ts:53-58` — permission kontrolünde `*` ve legacy `admin` string'i genel bypass kabul edilir; aksi durumda istenen permission'ın kullanıcı permission listesinde birebir bulunması gerekir. Yerel dev DB kataloğunda legacy `admin` permission'ı bulunmadığından bugünkü yerel veri durumunda bu 7 izin için pratik geçiş yolu ADMIN'in `*` wildcard'ıdır. Güvenlik sözleşmesi bu nedenle “yalnız `*`” değil, “`*` veya legacy `admin`; mevcut katalogda yalnız `*` üretilebilir” şeklinde okunmalıdır.

**Görev ve Onay Merkezi'ne doğrudan etkisi:** "Makale Onayları" kartının arkasındaki `kb:approve` bugün **kimsede yok** (ADMIN wildcard hariç). Bu izin DB kataloğuna eklenmeden hiçbir `SUPPORT_AGENT` makale onaylayamaz.

### Üç kaynaklı permission sözlüğü farkı

| Kaynak | Toplam | İçerik |
|---|---|---|
| **Controller talebi** (`@RequirePermissions`) | 19 benzersiz | `admin:settings, ai-interactions:read, faq:manage, faq:review, kb:approve, kb:create, kb:delete, kb:read, kb:submit_review, kb:update, reports:read, settings:read, settings:write, ticket:assign, ticket:close, ticket:create, ticket:escalate, ticket:read, ticket:update` |
| **`seed-rbac.ts`** | 14 | `ticket:read/create/update/delete, kb:read, article:write, kb:approve, faq:read/review/manage, ai-interactions:read, settings:read/write, users:manage` |
| **Yerel dev DB (gerçek)** | 16 | `*, ai-interactions:read, faq:manage/read/review, kb:read/write, reports:read, settings:read/write, ticket:assign/create/escalate/read/update, users:manage` |

**Üçü de birbirinden farklı.** Örnek: `seed-rbac.ts`'de olup DB'de olmayan: `ticket:delete`, `article:write`, `kb:approve`. DB'de olup seed'de olmayan: `*`, `kb:write`, `reports:read`, `ticket:assign`, `ticket:escalate`. **`seed-rbac.ts` çalıştırılsa bile bugünkü DB durumunu üretmez** — DB katalogu başka bir yoldan (muhtemelen manuel SQL veya farklı bir script) oluşmuş.

### Önerilen kanonik permission sözlüğü + `SUPPORT_AGENT` matrisi

> Bu bir **öneridir**, henüz uygulanmadı. Kullanıcı onayı: "SUPPORT_AGENT makale ve FAQ yazabilmeli/onaylayabilmeli ve `ai-interactions:read` almalı; ancak `settings:write`, `users:manage` ve `*` almamalı."

| Kanonik izin | ADMIN | SUPPORT_AGENT | CUSTOMER | Not |
|---|:---:|:---:|:---:|---|
| `ticket:read/create/update/assign/escalate` | ✅ | ✅ | kısmi (kendi ticket'ı) | Zaten DB'de var |
| `ticket:close` | ✅ | ✅ | ❌ | **DB'ye eklenmeli** |
| `kb:read` | ✅ | ✅ | ✅ | Zaten DB'de var |
| `kb:create`, `kb:update` | ✅ | ✅ | ❌ | **DB'ye eklenmeli** |
| `kb:submit_review` | ✅ | ✅ | ❌ | **DB'ye eklenmeli** |
| `kb:approve` | ✅ | ✅ (kullanıcı onayı) | ❌ | **DB'ye eklenmeli** — Görev Merkezi'nin ön koşulu |
| `kb:delete` | ✅ | ❌ (kullanıcı: "yüksek riskli, ayrıca onaylanmadan eklenmesin") | ❌ | **DB'ye eklenmeli**, SUPPORT_AGENT'a atanmaz |
| `faq:read/review` | ✅ | ✅ | `faq:read` | Zaten DB'de var |
| `faq:manage` | ✅ | ✅ (kullanıcı onayı) | ❌ | FAQ yazma/yönetme; role-only kalıcı silme yetkisini kapsamaz |
| `ai-interactions:read` | ✅ | ✅ (kullanıcı onayı) | ❌ | Zaten DB'de var |
| `reports:read` | ✅ | ✅ | ❌ | Zaten DB'de var |
| `admin:settings` | ✅ | ❌ | ❌ | **DB'ye eklenmeli**, SLA politika yönetimi ADMIN'de kalır |
| `settings:read/write` | ✅ | ❌/❌ | ❌ | Değişmez |
| `users:manage`, `*` | ✅ | ❌ | ❌ | Değişmez |

**Uygulama öncesi zorunlu ön koşul:** `kb:create/update/delete/approve/submit_review`, `ticket:close`, `admin:settings` — 7 izin DB kataloğuna eklenmeden `SUPPORT_AGENT` rolü **işlevsiz** olur (kb:approve/submit_review olmadan Görev Merkezi'nin editoryal kartları hiç çalışmaz).

### CI sözleşme testi planı (tasarım — uygulanmadı)

Kullanıcı talebi: "bilinmeyen role/permission kullanımını durduracak CI test planı." Önerilen yaklaşım:

1. **Statik sözleşme testi** (`scripts/verify-rbac-contract.mjs`, `db:verify:migration-files` deseniyle tutarlı): tüm `@Roles(...)` ve `@RequirePermissions(...)` dekoratörlerini tara, her string'in (a) `SystemRole`/kanonik rol listesinde veya (b) kanonik izin sözlüğünde olduğunu doğrula. Bilinmeyen isim → CI fail.
2. **Ledger dosyası:** `packages/database/prisma/rbac-canonical.json` — kanonik rol + izin listesi, migration-checksums.json deseniyle versiyonlu.
3. **Entegrasyon testi:** `RbacGuard` gerçek Prisma bağlantısıyla (disposable DB), her kanonik izin için en az bir rolün sahip olduğunu doğrula — "yetim izin" (hiçbir rolde olmayan) tespiti.
4. **CI kapısı:** `ci.yml`'e `pnpm rbac:verify-contract` eklenir, `db:verify:migration-files` ile aynı bloklayıcı konumda (migration uygulanmadan önce).

Bu plan **tasarımdır** — Codex'in isteği doğrultusunda bu turda kod/script yazılmadı.

**Bilinen sorunlar:**
1. Destek personeli tam admin yetkisine sahip (least-privilege ihlali)
2. `admin@example.com` seed hesabı üretimde ACTIVE, sıfır aktivite
3. Route'ların çoğunda rol/izin kontrolü yok — yalnız JWT (çoğu için doğru, ama denetlenmemiş)
4. Permission ve rol korumasının operation-bazlı güncel dağılımı yukarıdaki tabloda ve `.ai/RBAC-MATRIX.md` içinde tutulur; eski dekoratör-sayımı temelli `8/40` özeti kaldırılmıştır.

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
- **Yetki analizinde regex'e güvenmeyin** — bu haritayı çıkarırken toplam **iki ayrı turda** yanlış pozitif/negatif üretti: (1) ilk sürümde 3 route yanlış "public" sayıldı, (2) düzeltme turunda 5 `@Public()` operation kaçırıldı ve bir controller'ın DTO sınıfı gerçek controller sınıfı sanılıp `/ai` route'ları prefix'siz kaldı — ikisi de Codex'in bağımsız incelemesiyle yakalandı. **Otomatik tarama sonuçları her zaman kaynak kod okunarak veya `openapi.json` gibi otoritatif bir çıktıyla çapraz doğrulanmalı; tek başına kanıt sayılmamalı.**
- **Truth hierarchy:** kod > testler > şema/migration > git geçmişi > `.ai` belgeleri > kök Markdown.
- Değişiklik yapmadan önce yüksek blast-radius sembolleri kontrol edin (CLAUDE.md §4).
- **RBAC detayı için:** `.ai/RBAC-MATRIX.md` (231 operation, tam sınıflandırma) — bu dosyayla birlikte okunmalı, tek başına yeterli değil.
