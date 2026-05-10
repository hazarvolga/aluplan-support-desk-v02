# GAP Analizi Raporu — Aluplan Support Desk V02

> Analiz tarihi: 2026-05-09 | Kaynak: `apps/backend/src/` (313 ts), `apps/frontend/src/` (185 tsx/ts), `packages/`, `.kiro/specs/`

---

## KRİTİK ÖNCELİK

---

### GAP-01 — Güvenlik: Canlı API anahtarları kaynak kodunda hardcoded

- **Alan**: Güvenlik
- **Sorun**: `apps/backend/src/deploy-prep.ts` dosyasında OpenAI, Resend, xAI, Cloudflare R2 API anahtarları ve secret'ları düz metin olarak kaynak koduna yazılmış. Bu dosya git geçmişinde de mevcut.
  ```
  { key: 'email.resend.api_key', value: 're_fupJu99g_BM3sewTw2Jtn...' }
  { key: 'ai.xai.api_key', value: 'gsk_TOkGgf6qW9ltkaN...' }
  { key: 'ai.openai.api_key', value: 'sk-proj-thgH52aPIH...' }
  { key: 'storage.r2.secret_access_key', value: '4f6d2d4e398...' }
  { key: 'storage.r2.token', value: 'cfat_vivAwu0aBtZUfp...' }
  ```
- **Etki**: **Kritik** — Repo'yu gören herkes bu anahtarlarla API çağrısı yapabilir, depolama verilerine erişebilir. Gitleaks CI adımı bu dosyada zaten bypass yapılmış olabilir.
- **Dosya/Konum**: `apps/backend/src/deploy-prep.ts:56-77`
- **Öneri**: Tüm API anahtarlarını bu dosyadan derhal kaldırın. `deploy-prep.ts` yalnızca `process.env.RESEND_API_KEY` gibi ortam değişkenlerini okuyarak veritabanına kayıt etmeli. Geçmiş commit'leri `git filter-repo` ile temizleyin ve tüm sızdırılmış anahtarları rotasyona alın.

---

### GAP-02 — Güvenlik: Belirli bir kişinin e-posta adresi kaynak koduna hardcoded (4 ayrı yerde)

- **Alan**: Güvenlik / Mimari
- **Sorun**: `hazarvolga@gmail.com` adresi `prisma.service.ts`, `dynamics365.adapter.ts`, `crm-email-validator.service.ts` ve `crm.service.ts` dosyalarına doğrudan kod içine yazılmış. Sistem her başlangıçta bu adrese ADMIN rolünü "tamir" edecek şekilde çalışıyor. `ADMIN_BYPASS_EMAILS` env var tanımsızsa hardcoded adres devreye giriyor.
  ```ts
  // prisma.service.ts:82
  const mainUser = await this.user.findUnique({ where: { email: 'hazarvolga@gmail.com' } });
  // dynamics365.adapter.ts:210
  if (email === 'hazarvolga@gmail.com') { /* admin role repair */ }
  // crm-email-validator.service.ts:121
  this.adminBypassEmails = ['hazarvolga@gmail.com']; // fallback
  ```
- **Etki**: **Kritik** — Başka bir ortamda veya başka bir kullanıcıyla çalıştırıldığında bypass mantığı anlamsızlaşır. Startup repair hook'u her deploy'da çalışıyor.
- **Dosya/Konum**: `apps/backend/src/prisma/prisma.service.ts:78-88`, `apps/backend/src/crm/adapters/dynamics365.adapter.ts:210-218`, `apps/backend/src/crm/crm-email-validator.service.ts:121`, `apps/backend/src/crm/crm.service.ts:582`
- **Öneri**: Tüm hardcoded e-posta referanslarını kaldırın. `ADMIN_BYPASS_EMAILS` env var'ı Zod schema'sında zorunlu hale getirin. Startup repair hook'unu `prisma.service.ts`'ten tamamen çıkarın — admin rol yönetimi seed script'e taşınmalı.

---

### GAP-03 — Güvenlik: `StorageController` path traversal açığı

- **Alan**: Güvenlik
- **Sorun**: `GET /storage/*` endpoint'i `@Public()` (auth gerektirmez) ve kullanıcıdan gelen `fullPath` parametresi, herhangi bir normalizasyon veya kısıtlama olmaksızın doğrudan `path.join(process.cwd(), this.localPath, fullPath)` ile birleştiriliyor. `../../../etc/passwd` gibi bir path ile sunucu üzerindeki herhangi bir dosyaya erişilebilir.
- **Etki**: **Kritik** — Kimlik doğrulaması olmayan bir endpoint üzerinden path traversal ile sunucu dosya sistemi okunabilir.
- **Dosya/Konum**: `apps/backend/src/common/controllers/storage.controller.ts:24`
- **Öneri**:
  ```ts
  const resolved = path.resolve(path.join(process.cwd(), this.localPath, fullPath));
  const base = path.resolve(path.join(process.cwd(), this.localPath));
  if (!resolved.startsWith(base + path.sep)) throw new ForbiddenException();
  ```
  Alternatif olarak storage endpoint'ini tamamen auth arkasına alın.

---

### GAP-04 — Güvenlik: `knowledge-pool/sync-force-unlocked` endpoint'i auth gerektirmiyor

- **Alan**: Güvenlik
- **Sorun**: `@Public()` decorator ile işaretlenmiş `GET /knowledge-pool/sync-force-unlocked` endpoint'i, class-level `@UseGuards(JwtAuthGuard, RbacGuard)` guard'ını bypass ederek kimlik doğrulaması olmaksızın yerel dataset senkronizasyonunu tetikliyor.
- **Etki**: **Kritik** — Kimliksiz herkes knowledge pool sync'i tetikleyebilir (kaynak tükenmesi / veri manipülasyonu riski).
- **Dosya/Konum**: `apps/backend/src/knowledge-pool/knowledge-pool.controller.ts:29-32`
- **Öneri**: `@Public()` decorator'ını kaldırın. En az `ADMIN` rolü gerektiren guard ekleyin veya endpoint'i tamamen kaldırın.

---

### GAP-05 — Güvenlik: Resend webhook HMAC doğrulaması yok

- **Alan**: Güvenlik
- **Sorun**: `POST /email/webhook/resend` endpoint'i `@Public()` ile açık ve kod içinde `// Basic Resend webhook signature validation goes here (HMAC)` yorumu var — gerçek HMAC doğrulaması hiç implementasyonu yapılmamış. Payload tipi `any`. Herkes bu endpoint'e istediği payload'ı gönderebilir.
- **Etki**: **Kritik** — Sahte webhook'larla email event'leri manipüle edilebilir (bounce/unsubscribe injection).
- **Dosya/Konum**: `apps/backend/src/email/email.controller.ts:63-97`
- **Öneri**: Resend'in `svix-signature` header'ını `crypto.timingSafeEqual` ile doğrulayın. Doğrulama başarısız olursa `401` döndürün.

---

## YÜKSEK ÖNCELİK

---

### GAP-06 — Güvenlik: E-mail unsubscribe token doğrulaması yok

- **Alan**: Güvenlik
- **Sorun**: `POST /email/unsubscribe` endpoint'i `body.token` değerini doğrudan `userId` olarak kullanıyor: `const userId = body.token;`. Yorum satırında "In a production app, the token would be a signed JWT" yazıyor ama implementasyon proof-of-concept seviyesinde bırakılmış.
- **Etki**: **Yüksek** — Herhangi bir userId bilerek girildiğinde başka kullanıcıların e-posta tercihleri manipüle edilebilir.
- **Dosya/Konum**: `apps/backend/src/email/email.controller.ts:134-137`
- **Öneri**: Signed JWT veya HMAC-imzalı token ile doğrulama yapın. Brute-force'a karşı rate limiting ekleyin.

---

### GAP-07 — Mimari: `prisma.service.ts` içinde runtime schema patching anti-pattern

- **Alan**: Mimari & Kod Kalitesi
- **Sorun**: `onModuleInit()` içinde 15+ adet `$executeRawUnsafe(ALTER TABLE ...)` çağrısı yapılıyor. Schema ile Prisma migration'ları arasındaki drift'i "ghost column repair" ile kapatmaya çalışılıyor. Yüksek trafik altında `ALTER TABLE` bir tablo lock alır ve schema ile kod arasındaki gerçek durumu izlemek imkansızlaşır.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/prisma/prisma.service.ts:31-67`
- **Öneri**: Tüm ghost column repair'leri formal Prisma migration'larına taşıyın. `onModuleInit()`'i yalnızca bağlantı ve metrik başlatma için kullanın. CI pipeline'ına `prisma migrate status` kontrolü ekleyin.

---

### GAP-08 — Güvenlik / Observability: Sentry `tracesSampleRate: 1.0` production'da

- **Alan**: Performans / Observability
- **Sorun**: `instrument.ts`'te hem `tracesSampleRate: 1.0` hem de `profilesSampleRate: 1.0` sabit olarak ayarlanmış. Yüksek trafikte tüm request'lerin trace'lenmesi ciddi performans yükü ve Sentry maliyet artışı yaratır.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/instrument.ts:20-23`
- **Öneri**: Production için `tracesSampleRate: 0.1`, `profilesSampleRate: 0.1` olarak ayarlayın. `NODE_ENV` değerine göre conditional yapın.

---

### GAP-09 — Mimari: 7+ env var Zod schema'ya dahil edilmemiş, `process.env` direkt okunuyor

- **Alan**: Mimari / Tip Güvenliği
- **Sorun**: `ai.service.ts` içinde `EMBEDDING_PROVIDER`, `ADMIN_BYPASS_EMAILS`, `FAQ_SEMANTIC_DEDUP_THRESHOLD`, `AI_GLOBAL_DAILY_CAP`, `SLACK_WEBHOOK_URL`, `RERANK_URL_HARD_FLOOR`, `AI_QUEUE_RATE_MAX` direkt `process.env.*` ile okunuyor ve `ConfigService` bypass ediliyor. Bu değişkenler `env-validation.schema.ts`'te tanımlı değil — eksik env var'lar runtime'da sessizce `undefined` kullanılıyor.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/ai/ai.service.ts:59,133-168`, `apps/backend/src/config/env-validation.schema.ts`
- **Öneri**: Tüm bu değişkenleri Zod schema'ya ekleyin. `ai.service.ts`'te `process.env` yerine `configService.get()` kullanın.

---

### GAP-10 — Tip Güvenliği: Backend'de 76 adet `as any`, frontend'de 284 adet

- **Alan**: Tip Güvenliği
- **Sorun**: Özellikle kritik olanlar: `rbac.guard.ts:28` (`user.role as any` — RBAC atlatma riski), `rule-engine.service.ts:38-39` (kural koşulları `as any`), `crm.processor.ts:41` (`this.crmService as any`). Frontend'de 284 adet `as any` veya `: any` kullanımı var.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/rbac/rbac.guard.ts:28`, `apps/backend/src/tickets/rule-engine.service.ts:38-39`, `apps/backend/src/crm/crm.processor.ts:41`
- **Öneri**: `rbac.guard.ts`'teki `user.role` tipi için arayüz tanımlayın. `rule-engine.service.ts`'teki JSON alanları için Zod şeması kullanın. `pnpm typecheck` çıktısını sıfıra indirmeye hedefleyin.

---

### GAP-11 — Test Coverage: Backend kritik servisler test yok

- **Alan**: Test Coverage
- **Sorun**: `business-hours.service.ts`, `auto-assignment.service.ts`, `sla-cron.service.ts`, `macros.service.ts`, `announcements.service.ts`, `rag-maintenance.service.ts`, `pii-masking.service.ts`, `storage.service.ts` dahil 50+ servis/controller dosyası için test yok. Backend coverage threshold %35 — endüstri standardının çok altında.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/tickets/business-hours.service.ts`, `apps/backend/src/tickets/auto-assignment.service.ts`
- **Öneri**: En az `business-hours.service.ts` ve `auto-assignment.service.ts` için edge case içeren birim testleri yazın. Coverage threshold'u %50'ye yükseltin.

---

### GAP-12 — i18n: Almanca locale 302 anahtar eksik

- **Alan**: i18n / Lokalizasyon
- **Sorun**: `de.json` dosyasında `en.json`'a kıyasla 302 anahtar eksik. Özellikle yeni `help.docs.*` namespace'i (~280 anahtar) ve `customers.externalAccountId`, `admin.knowledge_base.meta.*` gibi kritik UI anahtarları Almanca'ya çevrilmemiş.
- **Etki**: **Yüksek** — Alman kullanıcılar için help sayfası ve müşteri listesi kırık key'ler gösterir.
- **Dosya/Konum**: `apps/frontend/messages/de.json`
- **Öneri**: `pnpm --filter @aluplan/frontend i18n:check` çalıştırın ve tüm eksik anahtarları doldurun.

---

### GAP-13 — Mimari: `automation.service.ts` `ConfigService` yerine `process.env` direkt kullanıyor

- **Alan**: Mimari / Dependency
- **Sorun**: `automation.service.ts`'te 7 ayrı yerde `process.env.FRONTEND_URL` direkt okunuyor. `notifications.gateway.ts`, `email.controller.ts`, `queue-monitor.service.ts`'te de aynı sorun var. Test ortamında `FRONTEND_URL` mock'lanamaz.
- **Etki**: **Yüksek**
- **Dosya/Konum**: `apps/backend/src/automation/automation.service.ts:47,58,67,98,124,155,174`
- **Öneri**: `ConfigService`'i inject edin, `this.configService.get<string>('FRONTEND_URL')` kullanın.

---

### GAP-14 — Mimari: `applySoftDeleteExtension()` çalışmıyor (Prisma extension bug)

- **Alan**: Mimari & Kod Kalitesi
- **Sorun**: `prisma.service.ts`'teki `applySoftDeleteExtension()` metodu `(this as any).$extends({...})` çağırıyor — ancak `$extends` dönüş değerini kullanmıyor. Prisma extension'lar mutable değil, yeni bir istemci döndürür. Dolayısıyla filtre hiçbir zaman aktif olmuyor. Kanıtı: `tickets.service.ts:209,239`, `products.service.ts:14-22`'de `deletedAt: null` filtreleri manuel tekrar ekleniyor.
- **Etki**: **Yüksek** — Soft-delete edilen kayıtlar sorgu sonuçlarında görünüyor olabilir. Data leak riski.
- **Dosya/Konum**: `apps/backend/src/prisma/prisma.service.ts:113-140`
- **Öneri**:
  ```ts
  const extended = (this as any).$extends({...});
  Object.assign(this, extended);
  ```
  Veya extension yerine middleware kullanın: `this.$use(...)`.

---

## ORTA ÖNCELİK

---

### GAP-15 — Test Coverage: Frontend'de yalnızca 12 birim test dosyası, 151 bileşen için

- **Alan**: Test Coverage
- **Sorun**: 151 `.tsx` bileşenine karşılık yalnızca 12 birim test dosyası var. Yeni eklenen help bileşenlerinin hiçbiri test edilmemiş (`HelpDocsContent`, `HelpDocsSidebar`, `DocBreadcrumb` — spec görev 8.1-8.6 tamamlanmamış).
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/frontend/src/components/help/`, `.kiro/specs/help-docs-redesign/tasks.md` (Görev 8: `[~]`)
- **Öneri**: `HelpDocsSidebar`, `DocBreadcrumb` ve `doc-tree.ts` için birim testleri yazın.

---

### GAP-16 — Observability: `[DEBUG-TICKET]` ve `[DEBUG ENTRY]` console.log'ları production'da aktif

- **Alan**: Observability
- **Sorun**: `tickets.service.ts:207`'de `console.log('[DEBUG-TICKET] findOne ...')` ve `main.ts:87`'de `[DEBUG ENTRY]` tüm non-GET isteklerini loglayan bir middleware var. Her ikisi de production'da aktif ve `nestjs-pino` yerine `console.log` kullanıyor.
- **Etki**: **Orta** — Log gürültüsü, PII sızıntısı riski, performans etkisi.
- **Dosya/Konum**: `apps/backend/src/tickets/tickets.service.ts:207`, `apps/backend/src/main.ts:87`
- **Öneri**: `console.log` yerine `this.logger.debug(...)` kullanın. `main.ts`'teki debug middleware'i kaldırın veya `NODE_ENV !== 'production'` koşuluna alın.

---

### GAP-17 — Mimari: `kb-summarizer.processor.ts`'te dil hardcoded `'tr'`

- **Alan**: i18n / Mimari
- **Sorun**: `kb-summarizer.processor.ts:82`'de FAQ entry'si oluştururken `language: 'tr'` ve `confidenceScore: 0.90` hardcoded. Sisteme İngilizce veya Almanca ticket girildiğinde de tüm KB entry'leri Türkçe olarak işaretleniyor.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/faq/kb-summarizer.processor.ts:82-83`
- **Öneri**: `ticket.language` alanından okuyun. `confidenceScore` CSAT verisi veya dinamik hesaplama ile belirlenmelidir.

---

### GAP-18 — Güvenlik: Bcrypt rounds hardcoded `10` (5 farklı yerde)

- **Alan**: Güvenlik
- **Sorun**: `customers.service.ts:43,168,422` ve `users.service.ts:12,121`'de bcrypt `10` rounds hardcoded. Merkezi bir sabit yok, tutarsız kullanım var.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/customers/customers.service.ts:43`, `apps/backend/src/users/users.service.ts:12`
- **Öneri**: `BCRYPT_ROUNDS=12` env var veya merkezi sabit (`const BCRYPT_ROUNDS = 12`) tanımlayın ve tüm yerlerden kullanın.

---

### GAP-19 — Mimari: Soft-delete tutarsızlığı — bazı modeller hard-delete kullanıyor

- **Alan**: Mimari & Kod Kalitesi
- **Sorun**: `settings.service.ts`, `faq.service.ts`, `announcements.service.ts`, `macros.service.ts`, `sla.controller.ts`, `announcement-templates.service.ts` Prisma `delete()` kullanıyor. Soft-delete felsefesi tutarsız uygulanıyor. Silinen FAQ entry'leri, duyurular, makrolar geri alınamaz.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/faq/faq.service.ts:325`, `apps/backend/src/announcements/announcements.service.ts:82`, `apps/backend/src/macros/macros.service.ts:60`
- **Öneri**: Hangi modellerin soft-delete kullanacağını dokümante edin; önemli varlıklar (FAQ, Announcements, Macros) için soft-delete'e geçin.

---

### GAP-20 — Performans: Database connection pool `max: 100` aşırı yüksek

- **Alan**: Performans
- **Sorun**: `prisma.service.ts:16`'da `max: 100` ile pg Pool oluşturuluyor. PostgreSQL varsayılan `max_connections=100` olduğunda tek bir NestJS instance bu limiti tek başına tüketebilir. Multi-instance deployment'ta bağlantı tükenmesi kaçınılmaz.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/prisma/prisma.service.ts:16`
- **Öneri**: `max: 20-30` olarak düşürün ve `PgBouncer` kullanın. Alternatif: `DATABASE_POOL_MAX` env var ile yapılandırılabilir yapın.

---

### GAP-21 — Mimari: `AiService` god node (33 edge)

- **Alan**: Mimari & Kod Kalitesi
- **Sorun**: Graph raporuna göre `AiService` 33 edge ile en bağlı node'lardan biri. Embedding provider seçimi, chat provider seçimi, fallback logic ve ayar okuma tek bir sınıfta. `AiProviderRouter` ve `AiProviderRegistry` servisler ayrı olmasına rağmen `AiService` düşük seviye kararlar almaya devam ediyor.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/ai/ai.service.ts`
- **Öneri**: Provider seçim mantığını tamamen `AiProviderRouter`'a devredin. `AiService`'i yalnızca iş mantığı için kullanın.

---

### GAP-22 — i18n: `help-docs-redesign` spec görev 7.5 ve 8 tamamlanmamış

- **Alan**: i18n / Spec Takibi
- **Sorun**: `.kiro/specs/help-docs-redesign/tasks.md` görev 7.5 `[-]` (kısmen tamamlanmış). `tr.json`'a tüm yeni `help.docs.*` key'lerinin Türkçe karşılıkları eklenmemiş olabilir. Görev 8 (testler) tamamlanmamış: `[~]`.
- **Etki**: **Orta**
- **Dosya/Konum**: `.kiro/specs/help-docs-redesign/tasks.md:7.5, 8.1-8.6`
- **Öneri**: `pnpm i18n:check` çalıştırın ve eksikleri doldurun. Spec görev 8'deki birim testleri yazın.

---

### GAP-23 — Test Coverage: `customer-list-missing-columns` spec tamamlanmamış görevler

- **Alan**: Test Coverage / Spec Takibi
- **Sorun**: `2.3`, `3.6`, `3.7`, `4.1`, `4.2`, `5.1`, `5.2` görevleri tamamlanmamış (`[ ]`). Özellikle i18n key kontrolü (`3.6`) ve property testler (`4.1`, `4.2`) eksik.
- **Etki**: **Orta**
- **Dosya/Konum**: `.kiro/specs/customer-list-missing-columns/tasks.md`
- **Öneri**: Deploy'dan önce en az `3.6` (i18n) ve `2.3` (backend test) görevlerini tamamlayın.

---

### GAP-24 — Observability: Çok sayıda `console.*` production servislerde

- **Alan**: Observability
- **Sorun**: `dynamics365.adapter.ts` (15+ console), `crm.service.ts`, `attachments.controller.ts`, `email.templates.ts` gibi dosyalarda `console.log/warn/error` yaygın. `nestjs-pino` structured logging sistemini bypass ediyor, JSON log formatı bozuluyor, PII içerebiliyor.
- **Etki**: **Orta**
- **Dosya/Konum**: `apps/backend/src/crm/adapters/dynamics365.adapter.ts:384-479`, `apps/backend/src/attachments/attachments.controller.ts:73-83`
- **Öneri**: Tüm `console.*` çağrılarını `this.logger.*` ile değiştirin. ESLint `no-console` kuralı ekleyin.

---

## DÜŞÜK ÖNCELİK

---

### GAP-25 — Mimari: `document-parsing.processor.ts`'te tamamlanmamış TODO

- **Alan**: Mimari / Kod Kalitesi
- **Sorun**: `apps/backend/src/ai/document-parsing.processor.ts:61`'de `// TODO: Integrate the extractLogicalChunks logic here after fetching from GCS.` yorumu var — GCS entegrasyonu eksik.
- **Etki**: **Düşük**
- **Dosya/Konum**: `apps/backend/src/ai/document-parsing.processor.ts:61`
- **Öneri**: TODO'yu bir GitHub issue'ya taşıyın ve spec'e ekleyin.

---

### GAP-26 — Performans: `ai-budget-monitor.service.ts` global cap'i 4 metodda tekrar okuyor

- **Alan**: Performans
- **Sorun**: `AI_GLOBAL_DAILY_CAP` env var 4 farklı metotta `parseFloat(process.env.AI_GLOBAL_DAILY_CAP || '200')` ile her çağrıda yeniden okunuyor.
- **Etki**: **Düşük**
- **Dosya/Konum**: `apps/backend/src/ai/ai-budget-monitor.service.ts:74,99,150,194`
- **Öneri**: `private readonly globalCap` sınıf değişkeni olarak constructor'da bir kez okuyun.

---

### GAP-27 — Observability: Backend'de sıfır e2e / integration test

- **Alan**: Test Coverage
- **Sorun**: `apps/backend/test/integration/` altında yalnızca 4 integration test dosyası var. 0 adet `.e2e-spec.ts` dosyası mevcut. Kritik akışlar (ticket oluşturma → AI auto-resolve → WebSocket bildirim) uçtan uca test edilmiyor.
- **Etki**: **Düşük** (izole) / **Yüksek** (entegrasyon hataları için)
- **Dosya/Konum**: `apps/backend/test/integration/`
- **Öneri**: En az ticket oluşturma + SLA tetikleme akışı için bir integration testi ekleyin.

---

### GAP-28 — Dependency: CI'da `pnpm` versiyonu 8, `package.json`'da `>=9.0.0` gerekli

- **Alan**: Dependency & Infra
- **Sorun**: `.github/workflows/ci.yml`'de `PNPM_VERSION: 8` ayarlı, ancak root `package.json`'da `"pnpm": ">=9.0.0"` kısıtı var. Lock file tutarsızlığı ve CI'da farklı davranışlara yol açabilir.
- **Etki**: **Düşük**
- **Dosya/Konum**: `.github/workflows/ci.yml`, `package.json:engines`
- **Öneri**: CI'daki `PNPM_VERSION` değerini `9` veya üzerine yükseltin.

---

### GAP-29 — i18n: Frontend'de hardcoded string kontrolü gerekli

- **Alan**: i18n / Lokalizasyon
- **Sorun**: Yeni help bileşenlerindeki içeriklerin i18n key'lerle mi yoksa hardcoded mi sunulduğu kontrol edilmeli. Özellikle `apps/frontend/src/components/help/sections/` altındaki İngilizce içerikler.
- **Etki**: **Düşük**
- **Dosya/Konum**: `apps/frontend/src/components/help/sections/`
- **Öneri**: `pnpm i18n:check` ve linter ile hardcoded string taraması yapın.

---

### GAP-30 — Mimari: KB processor sorumluluk örtüşmesi

- **Alan**: Mimari
- **Sorun**: `kb-summarizer.processor.ts`'te hem `faqEntry.create()` hem de dolaylı knowledge base güncelleme yapılıyor. `rag-faq-improvements` spec'i görev 7.1'de `AiAutoResolverService`'ten `faqEntry.create()` kaldırılmış; ama `kb-summarizer.processor.ts`'te aynı çağrı hala duruyor. Duplicate KB entry riski (idempotency kontrolü kısmi).
- **Etki**: **Düşük**
- **Dosya/Konum**: `apps/backend/src/faq/kb-summarizer.processor.ts:71-81`
- **Öneri**: FAQ oluşturma sorumluluğunu `FaqService.processPatterns()` üzerinden tek noktadan yönetin. Processor yalnızca özet çıkarıp event yaymalı.

---

## Özet Tablo

| # | Alan | Sorun | Etki |
|---|------|-------|------|
| GAP-01 | Güvenlik | Canlı API anahtarları kaynak kodunda | **Kritik** |
| GAP-02 | Güvenlik | Kişisel e-posta 4 yerde hardcoded | **Kritik** |
| GAP-03 | Güvenlik | StorageController path traversal | **Kritik** |
| GAP-04 | Güvenlik | `sync-force-unlocked` auth yok | **Kritik** |
| GAP-05 | Güvenlik | Webhook HMAC doğrulaması yok | **Kritik** |
| GAP-06 | Güvenlik | Unsubscribe token doğrulaması yok | **Yüksek** |
| GAP-07 | Mimari | Runtime ALTER TABLE anti-pattern | **Yüksek** |
| GAP-08 | Observability | Sentry sample rate %100 | **Yüksek** |
| GAP-09 | Mimari | 7+ env var schema'da eksik | **Yüksek** |
| GAP-10 | Tip Güvenliği | 76 `as any` (backend), 284 (frontend) | **Yüksek** |
| GAP-11 | Test | 50+ kritik servis test yok | **Yüksek** |
| GAP-12 | i18n | `de.json` 302 anahtar eksik | **Yüksek** |
| GAP-13 | Mimari | `automation.service` ConfigService bypass | **Yüksek** |
| GAP-14 | Mimari | Soft-delete extension çalışmıyor | **Yüksek** |
| GAP-15 | Test | Frontend 151 bileşen, 12 test | **Orta** |
| GAP-16 | Observability | Debug console.log production'da | **Orta** |
| GAP-17 | i18n | KB entry dili hardcoded `'tr'` | **Orta** |
| GAP-18 | Güvenlik | bcrypt rounds tutarsız (10, 5 yerde) | **Orta** |
| GAP-19 | Mimari | Soft-delete tutarsız uygulama | **Orta** |
| GAP-20 | Performans | DB pool max:100 aşırı | **Orta** |
| GAP-21 | Mimari | AiService god node | **Orta** |
| GAP-22 | i18n | Help-docs spec görev 7.5, 8 eksik | **Orta** |
| GAP-23 | Test | Customer-list spec görevler eksik | **Orta** |
| GAP-24 | Observability | Yaygın console.* kullanımı | **Orta** |
| GAP-25 | Mimari | document-parsing TODO eksik | **Düşük** |
| GAP-26 | Performans | Budget cap tekrar okuma | **Düşük** |
| GAP-27 | Test | Backend e2e/integration test yok | **Düşük** |
| GAP-28 | Dependency | CI pnpm v8, package.json v9+ istiyor | **Düşük** |
| GAP-29 | i18n | Hardcoded string kontrolü gerekli | **Düşük** |
| GAP-30 | Mimari | KB processor sorumluluk örtüşmesi | **Düşük** |
