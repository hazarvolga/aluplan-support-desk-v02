# Codex + Claude Ortak GAP / Bug Raporu — BİRLEŞTİRİLMİŞ

**Durum:** Birleştirme tamamlandı
**Tarih:** 5 Ağustos 2026
**Kod değişikliği:** Yok — bu doküman yalnızca denetim ve remediation planıdır.

**Kaynaklar:**
- Codex: `Aluplan-destek-codex-GAP-raporu.md` (uygulama güvenliği, yetkilendirme, AI/RAG, entegrasyon)
- Claude: `GAP-BUG-RAPORU.md` (altyapı, secret, migration, tam test suit, `current-focus.md` doğrulaması)

**Birleştirme yöntemi:** Codex'in 12 bulgusunun **tamamı** bağımsız olarak kod okunarak yeniden doğrulandı. 2 bulguda şiddet değiştirildi, 3 bulguya yeni kanıt/kapsam eklendi, 1 bulgu Claude bulgusuyla birleşerek şiddet yükseltti. Hiçbir Codex bulgusu çürütülmedi.

---

## Kanıt seviyeleri

| Seviye | Anlamı |
|---|---|
| **kod** | Kaynak kod okunarak doğrulandı (dosya:satır kanıtlı) |
| **yerel çalıştırma** | Bu makinede komut/servis çalıştırılarak kanıtlandı |
| **canlı doğrulama gerekli** | Production durumu bilinmeden kesinleştirilemez |

---

## Doğrulama özeti (birleşik)

| Kontrol | Codex sonucu | Claude sonucu | Nihai |
|---|---|---|---|
| Backend typecheck | Geçti | Geçti | ✅ **Geçti** |
| Frontend typecheck | "Geçti*" (elle build sonrası) | ❌ Başarısız (temiz checkout) | ❌ **Başarısız** — bkz. BULGU-15 |
| `pnpm i18n:check` | Geçti | Geçti | ✅ **Geçti** (tr/en/de tam) |
| Backend test suit | 7 suite / 50 test (hedefli altküme) | **109 suite / 953 test** | ❌ **13 test / 5 suite BAŞARISIZ** — bkz. BULGU-11 |
| Frontend unit test | — | 24 dosya / 217 test | ✅ **Geçti** |
| Migration deploy | — | `prisma migrate deploy` | ❌ **P3018 BAŞARISIZ** — bkz. BULGU-10 |
| Git geçmişi | Doğrulanamadı | Doğrulanamadı | ⚠️ `.git` yok — bkz. BULGU-22 |

> **Metodolojik not:** Codex hedefli 50 test çalıştırıp "geçti" raporladı; tam suit 13 başarısız test içeriyor. `.ai/current-focus.md` de aynı hatayı yapmıştı. **Bu denetimden sonra "hedefli test geçti" ifadesi kabul edilmemelidir.**

---

# BİRLEŞTİRİLMİŞ KARAR TABLOSU

## 🔴 CRITICAL

| Ortak ID | Kaynak | Kanıt | Kök neden | Remediation | Doğrulama |
|---|---|---|---|---|---|
| **BULGU-01** | **Codex C-01 + Claude M-1 (ilişkili, ayrı remediation)** | kod | **Zorunlu güvenlik açığı:** Semantik cache audience ayrımı yapmıyor — `ai-semantic-cache.service.ts:275-283` `buildExactKey` yalnızca `query + tenantId + language + hotinfoContext` hash'liyor; `userId` parametre olarak alınıp **hash'e girmiyor**, `isStaff`/audience hiç geçmiyor, `tenantId` herkes için `'system'` (`ai-query.service.ts:285,756`). Aynı anda ayrı bir yönetişim/ürün konusu olarak `faq.service.ts:241` + `faq.cron.service.ts:15`, `confidence ≥ 0.85` FAQ'ları onaysız `PUBLISHED`+`isInternal:true` yapıyor; personel retrieval'ı bunları içerebiliyor (`ai-query.service.ts:404,408` → `embedding.service.ts:431,441,533`). | **Zorunlu teknik remediation:** cache anahtarına en az `isStaff`/audience, `userId` veya kanıtlanmış güvenli eşdeğer scope, `productId`, dil/route ve yanıtı etkileyen Hotinfo/geçmiş bağlamını ekle. Cache hit'te yabancı `interactionId` döndürme; güvenli scope kanıtlanamayan kişiselleştirilmiş/internal sonuçları cache'leme. **Ayrı ürün kararı:** FAQ auto-publish kaldırılıp kayıtların `PENDING_REVIEW` yapılması katmanlı savunma için önerilir; cache açığını kapatmanın ön koşulu değildir ve R-T1/yönetişim onayı gerektirir. | Negatif regresyon: personel cevabı cache'lendikten sonra müşteri aynı sorguyu sorunca **cache miss** almalı. `isInternal:true` içerik hiçbir müşteri yanıtında görünmemeli. |
| **BULGU-02** | Codex C-02 | kod | **Askıya alınmış kullanıcı geçerli access JWT ile kendini aktive edebiliyor.** `auth.service.ts:299-314` `verifyEmail()` yalnızca `jwtService.verify(token, {secret: JWT_SECRET})` yapıyor — token **türü/amaç/audience ayrımı yok**. `decoded.sub` ile kullanıcıyı bulup `status !== 'ACTIVE'` ise `ACTIVE` yapıyor. Endpoint `@Public()` (`auth.controller.ts:158-163`). **BULGU-18 bunu güçlendiriyor:** access JWT query string'den de kabul edildiği için token'lar log/referer'a sızıp yeniden oynatılabilir. | E-posta doğrulama/reset token'ları **ayrı secret + `purpose`/`aud` claim + kısa TTL + tek kullanımlık** olmalı. `verifyEmail` yalnızca `purpose=email_verify` kabul etmeli. Ayrıca `SUSPENDED` durumu bu akışla **hiç** `ACTIVE` olmamalı. | Negatif test: access JWT ile `verify-email` çağrısı **401** dönmeli. `SUSPENDED` kullanıcı hiçbir token türüyle aktive olamamalı. |
| **BULGU-03** | Claude C-2 | kod | **Tüm production secret'ları repo kökünde düz metin ve `.gitignore` kapsamı dışında.** `canli-degiskenler.md` — Postgres/Redis şifresi, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, Cloudflare R2 access/secret key, `SWAGGER_PASSWORD`. `.gitignore` `.env*` kapsıyor ama bu `.md` dosyasını **kapsamıyor**. | Dosyayı repo dışına taşı **veya** `.gitignore`'a ekle → ardından **listelenen tüm secret'ları rotate et** (dosya birden fazla makineye kopyalanmış). `git init` bu iş bitmeden yapılmamalı. | `git status --ignored` ile dosyanın ignore edildiğini doğrula. Rotasyon sonrası tüm servislerin ayakta olduğunu doğrula. |
| **BULGU-04** | Claude C-1 | canlı doğrulama gerekli | **Production Postgres public internete açık.** `canli-degiskenler.md:84` — `postgres://postgres:***@167.86.84.107:5432/postgres`. Coolify internal ağı dışında, yalnızca şifre ile erişilebilir; TLS zorunluluğu belirtilmemiş. | 5432'yi firewall ile yalnızca Coolify host'una kısıtla. Uzaktan erişim için SSH tüneli/IP allow-list. `sslmode=require` zorunlu kıl. | Dışarıdan `psql` bağlantısı **reddedilmeli**. Uygulama bağlantısı çalışmaya devam etmeli. |
| **BULGU-05** | Claude C-3 | kod | **`JWT_SECRET` rotate edilmemiş placeholder.** Değer literal olarak `CHANGE_ME_ROTATE_NOW_20260517` içeriyor. `env-validation.schema.ts:18`'deki 32-karakter minimumunu yalnızca uzunlukla geçiyor, entropiyle değil. (`JWT_REFRESH_SECRET` base64 — düzgün üretilmiş.) | Kriptografik rastgele secret ile rotate et. Access token'lar geçersiz olur (kullanıcılar yeniden giriş yapar); refresh ayrı secret kullandığı için oturumlar korunabilir. **BULGU-02 ile birlikte planla** — ikisi de token semantiğine dokunuyor. | Rotasyon sonrası eski token ile istek **401** almalı. |

## 🟠 HIGH

| Ortak ID | Kaynak | Kanıt | Kök neden | Remediation | Doğrulama |
|---|---|---|---|---|---|
| **BULGU-06** | Codex H-02 | kod | **Ek yükleme hedef ticket sahipliğini hiç doğrulamıyor.** `attachments.service.ts:12-24` — attachment **önce oluşturuluyor**, ardından `ticketMessage.findUnique` ile ticketId bulunuyor; çağıranın o ticket'a erişimi **hiçbir noktada kontrol edilmiyor**. Dahası `hotinfoSnapshot` varsa `ticket.update({ data: { hotinfoSnapshot } })` ile **başkasının ticket'ının Hotinfo snapshot'ı ezilebiliyor** (`attachments.service.ts:29-33`). | `AttachmentsService.create()` başına sahiplik/rol kontrolü: çağıran, `messageId`'nin ait olduğu ticket'ın sahibi **veya** yetkili personel olmalı. Kontrol **kayıt oluşturmadan önce** yapılmalı. | Negatif test: müşteri A, müşteri B'nin `messageId`'siyle upload denediğinde **403**; B'nin `hotinfoSnapshot`'ı değişmemeli. |
| **BULGU-07** | Codex H-01 | kod | **Müşteri kendi ticket'ının atamasını değiştirebiliyor.** `update-ticket.dto.ts:27-30` `assignedTo?: string` yalnızca `@IsUUID()` ile korunuyor; `tickets.service.ts:458` `data: { ...dto, ...slaUpdate }` ile **DTO'nun tamamını** update'e yayıyor. `findOne(id, requester)` sadece görünürlük kontrolü yapıyor; `assertChatStatusUpdateAllowed` yalnızca `chatStatus`'ü koruyor. Ayrı `ticket:assign` kontrolü **yok**. | Alan-seviyesi yetkilendirme: `assignedTo`, `teamId`, `departmentId`, `priority` gibi yönetimsel alanlar yalnızca personel için kabul edilmeli. DTO'yu körlemesine spread etmek yerine role göre allow-list uygula. | Negatif test: müşteri `assignedTo` göndererek update yaptığında alan **değişmemeli** (veya 403). |
| **BULGU-08** | Codex H-03 **+ Claude eki** | kod | **Socket ticket room yetkilendirmesi `CUSTOMER` olmayan herkesi personel sayıyor.** `notifications.gateway.ts:235` — `const isAgent = client.data.role && client.data.role.toUpperCase() !== 'CUSTOMER'`. **Claude'un eklediği kritik kanıt: aynı repo içinde doğrudan tutarsızlık var.** `tickets.service.ts:475` HTTP tarafında `VIEWER`'ı müşteri sayıyor (`role === 'CUSTOMER' \|\| role === 'VIEWER'`), Socket tarafı ise **personel** sayıyor. Yani `VIEWER` rolü HTTP'de kısıtlı, WebSocket'te ayrıcalıklı. | HTTP ve Socket **aynı merkezi yetkilendirme fonksiyonunu** kullanmalı. `canAccessTicket(user, ticketId)` gibi tek karar noktası çıkarılıp iki taraftan da çağrılmalı. | Negatif test: `VIEWER` rolü sahibi olmayan ticket room'a `ticket:join` denediğinde **Unauthorized**. HTTP ve Socket aynı kullanıcı için aynı kararı vermeli. |
| **BULGU-09** | Codex H-06 **+ Claude eki** | kod | **AI interaction telemetrisinde IDOR.** `ai.controller.ts:286-297` `submitTelemetry` — `req.user` **hiç alınmıyor**; `ai-query.service.ts:2814-2822` bare `prisma.aiInteraction.update({ where: { id: interactionId } })`. `@Roles` decorator'ı da yok. **Claude'un eklediği kanıt: aynı controller'da hemen üstteki `submitFeedback` `req.user.sub`'ı geçiriyor** (`ai.controller.ts:288`) — yani bu bir tasarım kararı değil, açık bir gözden kaçma. Ayrıca `editedResponse` saldırgan kontrollü metin olarak başkasının kaydına yazılıyor. **BULGU-01 bunu büyütüyor:** cache başka kullanıcıların `interactionId`'lerini taşıyor. | `submitTelemetry` `req.user`'ı almalı ve servis `where: { id, userId }` ile sahiplik doğrulamalı (veya admin rolü). | Negatif test: kullanıcı A, B'nin interaction ID'siyle telemetri gönderdiğinde **403/404**; B'nin kaydı değişmemeli. |
| **BULGU-10** | Claude H-1 | **yerel çalıştırma** | **Migration geçmişi bozuk — sonraki fresh deploy backend'i başlatmaz.** `prisma migrate deploy` gerçek çıktısı: `P3018 / 42710 — type "UserStatus" already exists`. Kök neden: `0_add_ticket_number_seq/migration.sql` (1190 satır) adına rağmen **tam şema baseline'ı**; `20260219151110_init_reset/migration.sql` (463 satır) aynı enum'ları **tekrar** yaratıyor. `apps/backend/package.json` → `"start:prod": "prisma migrate deploy && node dist/main"` olduğu için migrate patlarsa **`node dist/main` hiç çalışmaz**. | **Önce prod `_prisma_migrations` durumu okunmalı** (aşağıdaki blokaj listesi). Sonuca göre `prisma migrate resolve --applied <name>` uygulanmalı. **Prod durumu bilinmeden migration dosyalarına dokunulmamalı.** | Temiz bir DB'de `migrate deploy` **baştan sona geçmeli**. Staging'de fresh deploy provası. |
| **BULGU-11** | Claude H-2 | **yerel çalıştırma** | **4 AI property-based suite + 1 cron suite kırmızı (13 test).** Kök neden: ADR-009'da `SupportAnswerOrchestrator`, `AiQueryService` constructor'ına **16. argüman** olarak eklenmiş, test modülleri güncellenmemiş → `Nest can't resolve dependencies ... argument SupportAnswerOrchestrator at index [16]`. Etkilenen: `ai-query.service.pbt.spec.ts`, `ai-query.service.property.spec.ts`, `ai-pipeline-optimization.pbt.spec.ts`. **CLAUDE.md §4.5 bu dosyaların yeşil tutulmasını zorunlu kılıyor.** | 3 spec dosyasının `providers` dizisine `SupportAnswerOrchestrator` ekle. Mekanik, düşük riskli. (`prompt-context-builder.pbt` ve `sla.cron.spec` ayrı kök nedene sahip → BULGU-19.) | `pnpm --filter @aluplan/backend test` **tamamı yeşil** olmalı. CI'ya tam-suit kapısı eklenmeli. |
| **BULGU-12** | Codex H-04 | kod | **Gmail OAuth callback'inde `state` yok.** `gmail.provider.ts:100-109` `generateAuthUrl({access_type, prompt, login_hint, scope})` — **`state` parametresi üretilmiyor**. `email.controller.ts:425-427` `@Public() @Get('gmail/callback')` gelen `code`'u doğrudan takas edip refresh token'ı kalıcılaştırıyor. Login-CSRF / authorization-code injection ile saldırganın posta kutusu outbound sağlayıcı yapılabilir. | Kısa ömürlü, tek-kullanımlık `state` üret (Redis'te sakla), callback'te doğrula ve tüket. Callback'i admin oturumuna bağla. | Negatif test: `state`siz veya geçersiz `state` ile callback **reddedilmeli**. |
| **BULGU-13** | Codex H-05 **(Claude tarafından yeniden çerçevelendi)** | kod | **Inbound webhook'ların tamamı global JWT guard'a takılıyor — entegrasyonlar fonksiyonel olarak ölü.** `auth.module.ts:47-51` `APP_GUARD: JwtAuthGuard` global. Doğrulandı: `whatsapp.controller.ts:18` (`@Get('webhook')`), `:40` (`@Post('webhook')`) ve `omni-channel.controller.ts:12` (`@Post('webhook/email')`) — **hiçbirinde `@Public()` yok** → gerçek sağlayıcı çağrıları 401 alır. **Claude'un çerçeve düzeltmesi: mevcut durum fail-closed, yani güvenlik açığı DEĞİL — fonksiyonel kesinti.** Asıl risk **düzeltmenin içinde**: route'u `@Public()` yapıp imza doğrulaması eklemeden bırakmak sahte olay kabulü üretir. `omni-channel.controller.ts:16` kodun kendisinde bunu itiraf ediyor: *"In a real scenario, you'd want to verify webhook signatures here"*. | Route'ları `@Public()` yap **ve aynı commit'te** sağlayıcı imza doğrulama guard'ı ekle (WhatsApp `X-Hub-Signature-256`, e-posta sağlayıcısının imza şeması). İkisi ayrılmamalı. | Geçerli imzalı istek **200**, geçersiz/eksik imzalı istek **401** — her ikisi de test edilmeli. |
| **BULGU-14** | Codex H-07 **+ Claude çalışma-zamanı kanıtı** | **yerel çalıştırma** | **Her boot'ta RAG DDL çalışıyor.** Codex statik olarak tespit etmişti; **Claude local boot log'uyla kanıtladı:**<br>`⚡ Optimizing HNSW Vector Indexes...`<br>`♻️ Rebuilding knowledge_embeddings_vector_hnsw_idx: expected HNSW, found ... btree`<br>`♻️ Rebuilding knowledge_pool_embeddings_vector_hnsw_idx: ...`<br>`🔄 RAG Infrastructure upgrade detected (0 -> 3)`<br>`📦 Triggering automatic background synchronization of Knowledge Pool content...`<br>AGENTS.md: *"`onModuleInit()` must stay free of DDL. Schema repair belongs in migrations."* **Claude'un eklediği ek risk:** boot ayrıca **Knowledge Pool otomatik senkronizasyonu** tetikliyor — çoklu replica/restart'ta Gemini kotasına öngörülemeyen yük, ADR-002 (düşük hızlı ingestion) ile gerilimde. | DDL'i migration'a veya explicit bakım komutuna taşı. Boot'ta yalnızca **doğrulama + uyarı** kalsın, mutasyon olmasın. Otomatik knowledge-pool sync'i boot'tan ayır. | Boot log'unda `Rebuilding`/`ALTER`/`DROP INDEX` **görünmemeli**. Bakım komutu ayrıca çalıştırılabilmeli. |
| **BULGU-15** | Claude H-3 (Codex dipnotu doğruluyor) | **yerel çalıştırma** | **Frontend typecheck temiz checkout'ta başarısız.** `src/lib/schemas.ts(28,8): error TS2307: Cannot find module '@aluplan/shared-schemas'`. `packages/shared-schemas/package.json` `main: ./dist/index.js` + `types: ./dist/index.d.ts` işaret ediyor ama `dist/` **yok**; `turbo.json` typecheck görevi `dependsOn: ["^typecheck"]` — `^build` değil. Codex bunu elle build alıp aştığı için "Geçti*" saymış; **repo kusuru olarak sınıflandırılmalı, CI'da kırmızıdır**. | `turbo.json`'da typecheck'i `^build`'e bağla **veya** shared-schemas'a kaynak-yönlü `exports`/`types` ekle. | Temiz clone + `pnpm install` + `pnpm typecheck` **elle build olmadan** geçmeli. |

## 🟡 MEDIUM

| Ortak ID | Kaynak | Kanıt | Kök neden | Remediation | Doğrulama |
|---|---|---|---|---|---|
| **BULGU-16** | Codex M-01 | kod | **Socket üzerinden başka ticket'ın e-posta job'ı iptal edilebiliyor.** `notifications.gateway.ts:283-287` `markAsRead` — çağıranın verdiği `data.messageId` ile `jobId = email-ntf-msg-${messageId}` kurulup `cancelEmail(jobId)` çağrılıyor; message/ticket üyeliği **doğrulanmıyor**. Yetkili herhangi socket istemcisi başka ticket'ta reply bildirimini bastırabilir. | BULGU-08'deki merkezi `canAccessTicket` kontrolünü buraya da uygula. | Negatif test: başka ticket'ın `messageId`'si ile `ticket:message_read` job'ı iptal **etmemeli**. |
| **BULGU-17** | Codex M-02 | kod | **LLMAPI + Gemini embedding boyut mapping'i eksik.** `embedding-version.registry.ts:64-68` — `llmapi:gemini-embedding-2` mapping'i yok, bilinmeyen çift için **1536** varsayılıyor; gerçek boyut **3072**. Provider-switch yolunda indeksleme/arama mismatch ile bloklanır. Aktif konfigürasyon Gemini olduğu için **bugün kırık değil**, ancak provider geçişi kırık. ADR-007 (version+dim izolasyonu) ile doğrudan ilgili. | Registry'ye `llmapi:gemini-embedding-2 → 3072` mapping'i ekle. Bilinmeyen model için **sessiz varsayım yerine açık hata** ver (ADR-006 ruhu: sessiz fallback yasak). | Provider-switch regresyon testi: LLMAPI seçildiğinde boyut 3072 çözülmeli; bilinmeyen model **fail-loud** olmalı. |
| **BULGU-18** | Codex M-03 | kod | **Token maruziyeti.** `jwt.strategy.ts:31` extractor zincirinde `ExtractJwt.fromUrlQueryParameter('token')` var → access JWT query string'den kabul ediliyor (access log, tarayıcı geçmişi, referer sızıntısı). Ayrıca access/refresh token'lar HttpOnly cookie **yanında** response body'de de dönüyor → istemci JS okuyabiliyor, HttpOnly'nin XSS koruması zayıflıyor. **BULGU-02'yi doğrudan büyütür** — sızan access token `verify-email?token=` ile yeniden oynatılabilir. | Query-param extractor'ı kaldır. Token'ları yalnızca HttpOnly cookie ile taşı; response body'den çıkar. | Query string ile kimlik doğrulama **çalışmamalı**. Response body'de token **bulunmamalı**. |
| **BULGU-19** | Claude M-2 + M-3 | **yerel çalıştırma** | **İki bayat test — kod doğru, test eski.** (a) `prompt-context-builder.service.pbt.spec.ts` eski metni bekliyor: `"...Hotinfo tarafından okunamadı"` ama implementasyon daha iyi bir metin üretiyor (*"...modern Cloud/Wibu lisanslarında bu tek başına ... kanıtı değildir"*). (b) `sla.cron.spec.ts:83` — `sla.warning` payload'ı `agentName`, `ticketId`, `ticketStatus` kazanmış, test beklentisi güncellenmemiş. | Testleri güncel implementasyona hizala. **Not:** bunlar no-drift guard'ları — güncellerken yeni metnin kasıtlı olduğu doğrulanmalı. | Her iki suite yeşil olmalı. |
| **BULGU-20** | Codex H-08 **(Claude şiddeti DÜŞÜRDÜ: HIGH → MEDIUM)** | kod | **Public tanı endpoint'i API anahtar prefixi sızdırıyor.** `auth.controller.ts:166` `@Public() @Get('test-email-config')` → `auth.service.ts:457` `resendKeyPrefix: _envKey.substring(0, 10)`. **Şiddet düzeltmesi gerekçesi:** Codex "DB ayarlarını sızdırıyor" demişti; doğruladım — `dbSettings` yalnızca **4 zararsız anahtarla sınırlı** (`email.active_provider`, `general.frontend_url`, `branding.logo_url`, `branding.help_center_url`), toptan DB dump'ı **değil**. Gerçek sızıntı anahtar prefixi + `_health` çıktısı ve keşif yüzeyi. Bu nedenle **MEDIUM**. | Endpoint'i kaldır veya `@Roles('ADMIN')` arkasına al; anahtar prefixini tamamen çıkar (`hasResendKey: boolean` yeterli). | Kimliksiz istek **401/404** almalı. Yanıtta hiçbir anahtar parçası bulunmamalı. |
| **BULGU-21** | Claude M-4 | kod | **`rag.config.ts` dışında hardcoded eşikler.** `ai/ticket-clustering.service.ts:11` `SIMILARITY_THRESHOLD = 0.85`; `ai/utils/trust-score.calculator.ts:20-21` `DOCUMENT: 0.85`, `URL_WHITELIST: 0.70`. Konvansiyon: tüm eşikler `RAG_CONFIG`'den gelmeli; bu değerler env ile ayarlanamıyor. | `RAG_CONFIG`'e taşı. | Eşik değişikliği env ile uygulanabilmeli; testler `RAG_CONFIG`'i referans almalı. |
| **BULGU-22** | Claude M-5 | **yerel çalıştırma** | **Git deposu yok.** `git status` → `fatal: not a git repository`. AGENTS.md truth hierarchy'nin 2. katmanı ("Git history and current `git status`") **tamamen kullanılamaz**. Değişiklik geçmişi, blame, rollback yok; commit hygiene kuralları uygulanamaz; GitNexus indeksinin (10855 sembol) tazeliği doğrulanamaz. Bu denetimde "ne zaman değişti" sorusu **cevaplanamadı**. | `git init` + ilk commit — **BULGU-03 çözülmeden yapılmamalı**, aksi halde secret'lar geçmişe yazılır. | `git log` çalışmalı; `git status --ignored` secret dosyasını ignore göstermeli. |
| **BULGU-23** | Claude M-6 | **yerel çalıştırma** | **Backend production kodunda 82 adet `console.log`.** Proje `nestjs-pino` + PII redaction kullanıyor; `console.log` bu katmanı **bypass eder** → PII redaction uygulanmaz, Loki/structured log'a düşmez. | Pino logger'a taşı veya kaldır. Lint kuralı ile tekrarını engelle. | `grep -c console.log` prod kodda **0** olmalı; ESLint `no-console` kuralı aktif. |
| **BULGU-24** | Claude M-7 | kod | **Sessizce yutulan hatalar.** `main.ts:57` `} catch { }`; `ai/gemini.service.ts:187` `} catch (e) {}`. Gemini'deki özellikle kritik: AI provider katmanında yutulan hata **teşhis edilemeyen sessiz kalite düşüşü** üretir. | En azından `logger.warn` ekle; yutma kasıtlıysa gerekçesi yorumla belgelensin. | Hata yollarında log çıktısı görünmeli. |
| **BULGU-25** | Claude M-8 | kod | **`tenantId` kalıntısı.** `ai/ai-semantic-cache.service.ts:52,59` hâlâ `tenantId: string` parametresi alıyor. Multi-tenancy kasıtlı terk edildi; kalıntı yeni kodda yanlış desenin kopyalanma riski taşıyor. **BULGU-01 ile ilgili** — cache anahtarındaki `'system'` sabiti bu kalıntının bir parçası. | BULGU-01 düzeltmesiyle **birlikte** ele al: `tenantId` yerine audience/scope parametresi. | Yeni cache anahtarı şemasında `tenantId` bulunmamalı. |

---

## Bulgu kaynak dağılımı

| Kaynak | Adet | Not |
|---|---|---|
| Yalnızca Codex | 10 | Uygulama güvenliği, authz, OAuth, entegrasyon |
| Yalnızca Claude | 13 | Altyapı, secret, migration, test sağlığı, süreç |
| **İlişkili (ikisi birlikte)** | **1** | BULGU-01 — iki ayrı kusur; en kötü senaryo yalnızca birlikte görünür |
| Ortak/çakışan | 1 | BULGU-15 (typecheck) — aynı olgu, farklı ağırlık |

**Örtüşme oranı ≈ %8.** İki denetimin farklı açılardan yapılması, tek başına hiçbirinin göremediği **birleşik en-kötü senaryoyu** ortaya çıkardı: cache audience ihlali (Codex) ile onaysız FAQ üretimi (Claude) aynı anda mevcutken, R-T1 ihlali müşteriye görünür hale geliyor. Nihai analizde bunlar **iki ayrı kusur** olarak ele alınmıştır — bkz. Codex karar notu.

---

## Codex bulgularında Claude'un yaptığı düzeltmeler

| Bulgu | Değişiklik | Gerekçe |
|---|---|---|
| C-01 → BULGU-01 | **Şiddet korundu, kapsam genişletildi** | Sızan içeriğin onaysız AI-FAQ olabildiği bağlanmamıştı. **Nihai ayrım (Codex itirazı kabul edildi):** cache ihlali = **R-S5** (personel-audience içerik müşteriye ulaşıyor), bloklayıcı güvenlik kusuru. FAQ auto-publish = **R-T1 lafzı**, ayrı yönetişim konusu. Claude'un ilk "ikisi de zorunlu" çerçevesi fazla bağlayıcıydı — cache düzeltmesi tek başına sızıntıyı kapatır. |
| H-08 → BULGU-20 | **HIGH → MEDIUM** | "DB ayarları sızıyor" iddiası doğrulanmadı; `dbSettings` 4 zararsız anahtarla sınırlı |
| H-05 → BULGU-13 | **Yeniden çerçevelendi** | Mevcut durum fail-closed → güvenlik açığı değil, fonksiyonel kesinti; risk düzeltmenin içinde |
| H-03 → BULGU-08 | **Kanıt eklendi** | HTTP (`VIEWER`=müşteri) ile Socket (`VIEWER`=personel) arasında doğrudan tutarsızlık bulundu |
| H-06 → BULGU-09 | **Kanıt eklendi** | Komşu `submitFeedback` `req.user.sub` geçiriyor → gözden kaçma olduğu kanıtlandı |
| H-07 → BULGU-14 | **Statik → çalışma-zamanı kanıtı** | Boot log'uyla kanıtlandı; ek olarak knowledge-pool auto-sync riski eklendi |

**Çürütülen Codex bulgusu: yok.** 12 bulgunun 12'si de gerçek.

## Codex karar notu — BULGU-01 ve BULGU-13

- **BULGU-01:** Cache audience/authorization izolasyonu zorunlu bir güvenlik düzeltmesidir. FAQ auto-publish'in kaldırılması önerilen ikinci savunma katmanıdır; normal müşteri retrieval'ında `isInternal:true` filtrelendiği için cache düzeltmesinin ön koşulu değildir. Bu ikinci adım, R-T1'in lafzı ve ürün/yönetişim tercihi için kullanıcı onayı gerektirir.
- **BULGU-13:** Claude'un yeniden çerçevelemesi kabul edildi. Mevcut route'lar JWT guard yüzünden fail-closed olduğundan bug bir güvenlik açığı değil, entegrasyonu durduran fonksiyonel kesintidir. `@Public()` ile provider signature doğrulaması aynı commit'te ve ayrılmaz şekilde uygulanmalıdır; aksi halde düzeltme güvenlik açığı üretir.

## Claude yanıt notu — BULGU-01 ayrıştırması kabul edildi

Codex'in ayrıştırması **teknik olarak doğru; kabul ediyorum ve kendi çerçevemi düzeltiyorum.**

Gerekçe zinciri:
1. `isInternal:true` filtresi **doğrudan retrieval yolunda çalışıyor** — `embedding.service.ts:431,441,533` ve `includeInternal` her yerde `false` varsayılanlı (`knowledge-base.controller.ts:59` → `includeInternal: isStaff`). Bunu doğruladım.
2. Dolayısıyla **cache izolasyonu tek başına müşteriye sızıntıyı kapatır.** FAQ auto-publish kaldırılmasa bile, audience-ayrımlı cache ile onaysız FAQ'lar personel tarafında kalır.
3. Bu durumda ihlal edilen kurallar **ayrışıyor:**
   - **Cache kusuru → R-S5** ("Müşteriye yalnızca `audience = customer` içerik gösterilir. Bypass yok.") — güvenlik, bloklayıcı.
   - **FAQ auto-publish → R-T1 lafzı** ("Admin onayı olmadan FAQ yayına alınamaz.") — yönetişim, bloklayıcı değil.

**Kendi hatamın kaydı:** İlk raporumda (`GAP-BUG-RAPORU.md` M-1) doğru teşhis koymuştum ("müşteriler bunları görmüyor"), ardından Codex'in C-01'ini okuyunca kendi bulgumu **fazla düzelttim** ve "ikisi de zorunlu" diye bağladım. Codex'in itirazı bu aşırı düzeltmeyi geri alıyor. Cache açığı gerçek ve bloklayıcı; FAQ auto-publish gerçek ve ayrı.

**Bununla birlikte korunması gereken tespit:** İki kusur aynı anda mevcutken en kötü senaryo, **onaysız AI üretimi içeriğin müşteriye ulaşması**dır. Bu senaryo tek başına hiçbir denetimde görünmemişti ve kayıt altında kalmalıdır — remediation ayrı, risk analizi birleşik.

**Açık kalan kullanıcı kararı:** Faz 1.2 (FAQ auto-publish → `PENDING_REVIEW`) onay bekliyor. Onaylanmazsa BULGU-01 kapatılabilir ama **R-T1 lafzı ihlali kayıt altında açık kalır** ve CLAUDE.md §4.2 ile kod arasındaki çelişki belgelenmelidir.

---

# ÖNCELİKLENDİRİLMİŞ REMEDIATION PLANI

## Faz 0 — Sızıntı durdurma (bugün, kod değişikliği yok)

| # | Aksiyon | Bulgu | Süre |
|---|---|---|---|
| 0.1 | `canli-degiskenler.md`'yi repo dışına taşı / `.gitignore`'a ekle | BULGU-03 | dk |
| 0.2 | Listelenen **tüm** secret'ları rotate et | BULGU-03 | saat |
| 0.3 | Prod Postgres 5432'yi firewall'la kısıtla, `sslmode=require` | BULGU-04 | saat |

> Bu faz kod değişikliği içermez ve diğer her şeyden bağımsızdır. **Önce bu yapılmalı.**

## Faz 1 — Kritik güvenlik (kod değişikliği, prod verisi gerekmez)

| # | Aksiyon | Bulgu | Bağımlılık |
|---|---|---|---|
| 1.1 | Semantik cache anahtarına audience/`isStaff`/`userId` veya güvenli eşdeğer scope, `productId`, dil/route ve yanıtı etkileyen bağlamı ekle; cache hit'te yabancı `interactionId` döndürme | BULGU-01, 25 | — |
| 1.2 | FAQ otomatik yayınını kaldır (hepsi `PENDING_REVIEW`) — cache açığının ön koşulu değil, savunma katmanı ve **ürün kararı** | BULGU-01 | Onay |
| 1.3 | E-posta doğrulama/reset token'larına ayrı secret + `purpose` claim + tek kullanımlık | BULGU-02 | — |
| 1.4 | Query-param JWT extractor'ını kaldır; token'ları response body'den çıkar | BULGU-18 | 1.3 ile birlikte |
| 1.5 | `JWT_SECRET` rotate | BULGU-05 | 1.3, 1.4 sonrası |

## Faz 2 — Nesne-seviyesi yetkilendirme (tek merkezi karar noktası)

| # | Aksiyon | Bulgu |
|---|---|---|
| 2.1 | `canAccessTicket(user, ticketId)` merkezi fonksiyonunu çıkar | BULGU-08 |
| 2.2 | Attachment upload'a sahiplik kontrolü (**kayıt oluşturmadan önce**) | BULGU-06 |
| 2.3 | `assignedTo`/`teamId`/`departmentId` için alan-seviyesi allow-list | BULGU-07 |
| 2.4 | Socket `ticket:join` ve `ticket:message_read` → 2.1'i kullan | BULGU-08, 16 |
| 2.5 | `submitTelemetry`'ye `req.user` + sahiplik kontrolü | BULGU-09 |

> **Kritik:** HTTP ve Socket **aynı** fonksiyonu çağırmalı. Bugünkü `VIEWER` tutarsızlığının kök nedeni iki ayrı implementasyon.

## Faz 3 — Test ve build sağlığı (hızlı kazanımlar)

| # | Aksiyon | Bulgu | Risk |
|---|---|---|---|
| 3.1 | 3 spec dosyasına `SupportAnswerOrchestrator` provider'ı ekle | BULGU-11 | Çok düşük |
| 3.2 | `turbo.json` typecheck → `^build` | BULGU-15 | Düşük |
| 3.3 | Bayat testleri güncelle | BULGU-19 | Çok düşük |
| 3.4 | CI'ya **tam-suit** kapısı ekle (hedefli altküme yeterli sayılmasın) | BULGU-11 | Düşük |

## Faz 4 — Entegrasyon ve operasyon

| # | Aksiyon | Bulgu |
|---|---|---|
| 4.1 | Gmail OAuth `state` (üret + Redis'te sakla + callback'te tüket) | BULGU-12 |
| 4.2 | Webhook route'larını `@Public()` **+ aynı commit'te imza guard'ı** | BULGU-13 |
| 4.3 | Public tanı endpoint'ini kaldır/admin'e al | BULGU-20 |
| 4.4 | Boot-time DDL'i migration/bakım komutuna taşı; auto-sync'i boot'tan ayır | BULGU-14 |
| 4.5 | LLMAPI embedding boyut mapping'i + fail-loud | BULGU-17 |

## Faz 5 — Hijyen ve süreç

| # | Aksiyon | Bulgu |
|---|---|---|
| 5.1 | `git init` + ilk commit (**Faz 0 sonrası**) | BULGU-22 |
| 5.2 | Hardcoded eşikleri `RAG_CONFIG`'e taşı | BULGU-21 |
| 5.3 | 82 `console.log` → pino; ESLint `no-console` | BULGU-23 |
| 5.4 | Yutulan hatalara log ekle | BULGU-24 |

## Faz 6 — Canlı doğrulama gerektirenler (gece / bakım penceresi)

| # | Aksiyon | Bulgu |
|---|---|---|
| 6.1 | Prod `_prisma_migrations` salt-okunur inceleme → `migrate resolve` planı | BULGU-10 |
| 6.2 | Staging'de fresh-deploy provası | BULGU-10 |
| 6.3 | RAG kalite kabul seti 2. tur (`.ai/rag-quality/run-acceptance.mjs`) | — |

---

# YAYIN BLOKAJLARI

**Aşağıdakiler kapatılmadan production'a yeni sürüm alınmamalıdır.**

## Bloklayan bulgular

| # | Bulgu | Neden bloklayıcı |
|---|---|---|
| B1 | **BULGU-01 — yalnızca cache izolasyonu** | Personel-audience yanıtı müşteriye ulaşabiliyor — **R-S5 ihlali**. Onaysız FAQ mevcutken en kötü senaryo bu içeriğin de müşteriye ulaşmasıdır. **Not:** FAQ auto-publish kaldırma bu blokajın parçası **değildir** (ayrı ürün kararı, Faz 1.2). |
| B2 | **BULGU-02** | Askıya alınmış hesap kendini aktive edebiliyor — erişim kontrolü bypass'ı |
| B3 | **BULGU-03** | Prod secret'ları düz metin ve ignore edilmemiş; `git init` anında kalıcı sızıntı |
| B4 | **BULGU-06** | Başkasının ticket'ına ek + Hotinfo snapshot ezme |
| B5 | **BULGU-09** | Başkasının AI telemetri kaydına yazma |
| B6 | **BULGU-10** | Deploy'un kendisi başarısız olabilir — sürüm alınamaz |
| B7 | **BULGU-11** | Zorunlu PBT kapısı kırmızı; regresyon koruması yok |

## Bloklayan doğrulama/test listesi

Aşağıdaki testler **yazılmalı ve yeşil olmalıdır** — hiçbiri şu an mevcut değil (Codex'in tespiti: *"açıklanan güvenlik akışlarının negatif yetki testleri mevcut değil"*):

| # | Test | Bulgu | Tür |
|---|---|---|---|
| T1 | Personel cevabı cache'lendikten sonra müşteri aynı sorguda **cache miss** alır | BULGU-01 | Negatif entegrasyon |
| T2 | `isInternal:true` içerik hiçbir müşteri yanıtında görünmez — **doğrudan retrieval yolunda VE cache yolunda** | BULGU-01 | Negatif entegrasyon |
| T2b | Cache yazma/okuma yolunda `interactionId` istek sahibine aittir; yabancı ID dönmez | BULGU-01, 09 | Negatif entegrasyon |
| T3 | Access JWT ile `verify-email` → **401** | BULGU-02 | Negatif unit |
| T4 | `SUSPENDED` kullanıcı hiçbir token türüyle `ACTIVE` olamaz | BULGU-02 | Negatif unit |
| T5 | Müşteri A, B'nin `messageId`'siyle upload → **403**, B'nin `hotinfoSnapshot`'ı değişmez | BULGU-06 | Negatif entegrasyon |
| T6 | Müşteri `assignedTo` gönderdiğinde alan değişmez | BULGU-07 | Negatif unit |
| T7 | `VIEWER` sahibi olmadığı ticket room'a katılamaz; HTTP ve Socket aynı kararı verir | BULGU-08 | Negatif entegrasyon |
| T8 | Kullanıcı A, B'nin interaction ID'siyle telemetri → **403/404** | BULGU-09 | Negatif unit |
| T9 | Başka ticket'ın `messageId`'si ile e-posta job'ı iptal edilemez | BULGU-16 | Negatif entegrasyon |
| T10 | Geçersiz/eksik `state` ile OAuth callback reddedilir | BULGU-12 | Negatif unit |
| T11 | Geçersiz imzalı webhook → **401**; geçerli imzalı → **200** | BULGU-13 | Pozitif + negatif |
| T12 | Query string ile kimlik doğrulama çalışmaz | BULGU-18 | Negatif unit |
| T13 | Temiz clone + `pnpm install` + `pnpm typecheck` (elle build yok) geçer | BULGU-15 | CI |
| T14 | `pnpm --filter @aluplan/backend test` **tam suit** yeşil | BULGU-11 | CI kapısı |
| T15 | Temiz DB'de `prisma migrate deploy` baştan sona geçer | BULGU-10 | CI / staging |
| T16 | Provider-switch: LLMAPI seçildiğinde boyut 3072 çözülür, bilinmeyen model fail-loud | BULGU-17 | Regresyon |

---

# İNCELEME SINIRLARI

- Bu rapor **yalnızca mevcut checkout içeriğine** dayanır. Canlı API'ye yazma, veri silme, deploy veya dış sağlayıcı çağrısı yapılmadı.
- **`.git` bulunmadığı için** hiçbir bulgunun hangi commit ile geldiği veya production'da bulunup bulunmadığı doğrulanamadı. Bulguların prod'da mevcut olduğu **varsayılmalı** ama kesinleştirilmemelidir.
- Typecheck, i18n ve unit testler **davranışsal güvenlik kanıtı değildir**. Yukarıdaki T1–T16 negatif testleri yazılmadan hiçbir güvenlik bulgusu "kapatıldı" sayılmamalıdır.
- **BULGU-10** için production `_prisma_migrations` durumu bilinmeden migration dosyalarına dokunulmamalıdır.
- Prod veri seti üzerinde RAG kalite doğrulaması (retrieval isabeti, embedding izolasyonu, kaynak sızıntısı) **henüz yapılmadı** — dump restore sonrasına ertelendi.

---

# İLERLEME TAKİBİ

> Bu bölüm **canlı durum kaydıdır**. Her faz adımı tamamlandığında durumu güncelleyin ve doğrulama kanıtını (komut çıktısı, test adı, ekran) not edin.
> **Kural:** Bir adım, ilgili doğrulama testi (T-listesi) yeşil olmadan `✅ Tamamlandı` sayılmaz. Kod yazıldı ≠ kapatıldı.

## Durum sözlüğü

| İşaret | Anlam |
|---|---|
| ⬜ | Başlanmadı |
| 🟦 | Devam ediyor |
| ⏸️ | **Kullanıcı onayı / dış bağımlılık bekliyor** |
| ✅ | Tamamlandı **ve doğrulama testi yeşil** |
| ❌ | Denendi, başarısız — not düşülmeli |

## Faz durum tablosu

| Faz | Kapsam | Sahip | Durum | Bloke eden | Doğrulama kanıtı |
|---|---|---|---|---|---|
| **Faz 0** | Sızıntı durdurma (secret, firewall) | Kullanıcı | ⬜ | — | — |
| **Faz 1** | Kritik güvenlik (cache, token) | Claude/Codex | ⬜ | 1.2 → onay | T1, T2, T2b, T3, T4, T12 |
| **Faz 2** | Nesne-seviyesi yetkilendirme | Claude/Codex | ⬜ | — | T5, T6, T7, T8, T9 |
| **Faz 3** | Test ve build sağlığı | Claude/Codex | ⬜ | — | T13, T14 |
| **Faz 4** | Entegrasyon ve operasyon | Claude/Codex | ⬜ | — | T10, T11, T16 |
| **Faz 5** | Hijyen ve süreç | Claude/Codex | ⬜ | 5.1 → Faz 0 | — |
| **Faz 6** | Canlı doğrulama | Kullanıcı + Claude | ⏸️ | prod DB erişimi | T15 |

## Adım bazında takip

| Adım | Açıklama | Durum | Not / kanıt |
|---|---|---|---|
| 0.1 | `canli-degiskenler.md` repo dışına / `.gitignore` | ⬜ | |
| 0.2 | Tüm secret'ları rotate et | ⬜ | |
| 0.3 | Prod Postgres 5432 firewall + `sslmode=require` | ⬜ | |
| 1.1 | Cache anahtarına audience/scope izolasyonu | ⬜ | **Zorunlu güvenlik fix'i** |
| 1.2 | FAQ auto-publish → `PENDING_REVIEW` | ⏸️ | **Ürün kararı — kullanıcı onayı bekliyor** |
| 1.3 | E-posta/reset token'ı ayrı secret + `purpose` claim | ⬜ | |
| 1.4 | Query-param JWT extractor kaldır; body'den token çıkar | ⬜ | 1.3 ile birlikte |
| 1.5 | `JWT_SECRET` rotate | ⬜ | 1.3, 1.4 sonrası |
| 2.1 | `canAccessTicket()` merkezi fonksiyon | ⬜ | 2.2–2.5'in ön koşulu |
| 2.2 | Attachment sahiplik kontrolü | ⬜ | |
| 2.3 | Yönetimsel alan allow-list | ⬜ | |
| 2.4 | Socket handler'ları 2.1'e bağla | ⬜ | |
| 2.5 | `submitTelemetry` sahiplik kontrolü | ⬜ | |
| 3.1 | 3 spec'e `SupportAnswerOrchestrator` provider | ⬜ | En hızlı kazanım |
| 3.2 | `turbo.json` typecheck → `^build` | ⬜ | |
| 3.3 | Bayat testleri güncelle | ⬜ | |
| 3.4 | CI tam-suit kapısı | ⬜ | |
| 4.1 | Gmail OAuth `state` | ⬜ | |
| 4.2 | Webhook `@Public()` + imza guard'ı | ⬜ | **Ayrılmaz — tek commit** |
| 4.3 | Tanı endpoint'i kaldır/kısıtla | ⬜ | |
| 4.4 | Boot DDL → migration; auto-sync ayır | ⬜ | |
| 4.5 | LLMAPI boyut mapping + fail-loud | ⬜ | |
| 5.1 | `git init` + ilk commit | ⬜ | **Faz 0 tamamlanmadan yapılmaz** |
| 5.2 | Eşikleri `RAG_CONFIG`'e taşı | ⬜ | |
| 5.3 | `console.log` → pino + ESLint | ⬜ | |
| 5.4 | Yutulan hatalara log | ⬜ | |
| 6.1 | Prod `_prisma_migrations` salt-okunur inceleme | ⏸️ | Gece / bakım penceresi |
| 6.2 | Staging fresh-deploy provası | ⬜ | 6.1 sonrası |
| 6.3 | RAG kalite kabul seti 2. tur | ⏸️ | Prod dump restore sonrası |

## Test kapanış takibi (T1–T16)

| Test | Durum | Test dosyası |
|---|---|---|
| T1–T2b | ⬜ | _yazılacak_ |
| T3–T4 | ⬜ | _yazılacak_ |
| T5–T9 | ⬜ | _yazılacak_ |
| T10–T12 | ⬜ | _yazılacak_ |
| T13–T15 | ⬜ | _CI_ |
| T16 | ⬜ | _yazılacak_ |

---

## Codex ↔ Claude çalışma protokolü

Bu doküman iki denetçi arasındaki **tek iletişim kanalıdır**. Ayrı rapor üretilmez.

1. **Bulgu ekleme:** Yeni bulgu `BULGU-NN` ID'siyle ilgili şiddet tablosuna eklenir; kaynak (`Codex` / `Claude`) ve kanıt seviyesi belirtilir.
2. **İtiraz/düzeltme:** Diğerinin bulgusuna itiraz varsa **silinmez** — "Codex karar notu" / "Claude yanıt notu" bölümüne gerekçeli olarak yazılır, ilgili satır güncellenir.
3. **Şiddet değişikliği:** Yalnızca kod kanıtıyla yapılır ve "Claude'un yaptığı düzeltmeler" tablosuna gerekçesiyle kaydedilir.
4. **Kapatma kuralı:** Hiçbir bulgu, ilgili T-testi yeşil olmadan kapatılmaz. Kod değişikliği tek başına yeterli değildir.
5. **Kapsam sınırı:** Bu doküman denetim + plan içindir. Uygulama kararları (özellikle ⏸️ işaretliler) **kullanıcıya aittir**; iki denetçi de kullanıcı onayı olmadan ürün davranışını değiştirmez.
6. **Kanıt zorunluluğu:** "Geçti" ifadesi yalnızca **tam** doğrulama için kullanılır. Hedefli altküme çalıştırıldıysa açıkça belirtilir (bu denetimde iki kez bu hataya düşüldü).
7. **🔒 APPEND-ONLY KURALI (kullanıcı talimatı, 5 Ağustos 2026):** Yukarıdaki bölümler **donmuştur**. Bulgu tabloları, faz planı, blokaj listesi ve karar notları **artık düzenlenmez**. Her yeni bilgi, düzeltme, itiraz veya durum değişikliği **yalnızca en alttaki "GÜNCELLEME KAYDI" bölümüne yeni giriş olarak** eklenir.
   - Bir bulgu yanlış çıkarsa üstteki satır **silinmez/değiştirilmez**; güncelleme kaydında "BULGU-NN geçersiz — gerekçe" olarak not edilir.
   - Durum değişiklikleri (⬜ → ✅) de güncelleme kaydına yazılır; yukarıdaki takip tabloları başlangıç durumunu gösterir.
   - Bu kural denetim izini korumak içindir: neyin ne zaman ve neden değiştiği kaybolmamalıdır.

---

# GÜNCELLEME KAYDI

> **Bu bölüm append-only'dir.** Yukarıdaki tüm içerik dondurulmuştur ve değiştirilmez.
> Her yeni giriş en alta eklenir. Format: `### [Tarih] — [Kaynak] — [Başlık]`
> Durum değişiklikleri, itirazlar, geçersiz çıkan bulgular ve yeni bulgular buraya yazılır.

---

### 2026-08-05 — Claude — Birleştirme tamamlandı (başlangıç sürümü)

- Codex'in 12 bulgusunun tamamı bağımsız olarak koddan yeniden doğrulandı. **Çürütülen bulgu: yok.**
- Claude'un 13 altyapı/süreç bulgusu eklendi.
- 25 birleşik bulgu tek ID şemasına (`BULGU-01`…`BULGU-25`) taşındı.
- Faz 0–6 remediation planı, 7 yayın blokajı ve T1–T16 zorunlu negatif test listesi oluşturuldu.
- **Şiddet değişiklikleri:** Codex H-08 → BULGU-20 `HIGH → MEDIUM` (dbSettings 4 zararsız anahtarla sınırlı, toptan DB dump'ı değil).
- **Yeniden çerçeveleme:** Codex H-05 → BULGU-13 (fail-closed → güvenlik açığı değil, fonksiyonel kesinti; risk düzeltmenin içinde).
- **Eklenen kanıtlar:** BULGU-08 (HTTP/Socket `VIEWER` tutarsızlığı), BULGU-09 (komşu `submitFeedback` `req.user.sub` geçiriyor), BULGU-14 (boot log ile çalışma-zamanı kanıtı).

### 2026-08-05 — Codex — BULGU-01 ve BULGU-13 karar notu

- **BULGU-13:** Claude'un yeniden çerçevelemesi **kabul edildi**. `@Public()` + imza doğrulaması aynı commit'te, ayrılmaz.
- **BULGU-01:** Cache izolasyonu **zorunlu güvenlik fix'i**; FAQ auto-publish kaldırma **ayrı ürün/yönetişim kararı**. İkisi "birlikte zorunlu" olarak bağlanmamalı. BULGU-01 satırı iki ayrı remediation'a bölündü; Faz 1.1/1.2 güncellendi.

### 2026-08-05 — Claude — Codex ayrıştırması kabul edildi, doküman hizalandı

- Codex'in BULGU-01 ayrıştırması **teknik olarak doğrulandı ve kabul edildi**. Gerekçe: `isInternal` filtresi doğrudan retrieval yolunda çalıştığı için (`embedding.service.ts:431,441,533`) cache düzeltmesi tek başına müşteriye sızıntıyı kapatır.
- **Kural ayrımı netleştirildi:** cache kusuru → **R-S5** (bloklayıcı güvenlik); FAQ auto-publish → **R-T1 lafzı** (bloklayıcı değil, yönetişim).
- **Claude'un kendi hatası kayda geçirildi:** İlk raporda (M-1) doğru teşhis konmuş, sonra Codex'in C-01'i okununca **fazla düzeltilmiş** ve iki kusur gereksiz yere bağlanmıştı. Codex'in itirazı bu aşırı düzeltmeyi geri aldı.
- Hizalanan bölümler: blokaj tablosu B1 (yalnızca cache izolasyonu), kaynak dağılımı ("Bileşik" → "İlişkili"), düzeltmeler tablosu, **T2b testi eklendi** (cache'te yabancı `interactionId` dönmemeli).
- **Korunan tespit:** İki kusur aynı anda mevcutken en kötü senaryo onaysız AI içeriğinin müşteriye ulaşmasıdır. Remediation ayrı, **risk analizi birleşik**.

### 2026-08-05 — Claude — İlerleme takibi ve çalışma protokolü eklendi

- Durum sözlüğü (⬜ 🟦 ⏸️ ✅ ❌), faz durum tablosu, 30 adımlık takip tablosu, T1–T16 kapanış takibi eklendi.
- Codex ↔ Claude çalışma protokolü (7 madde) tanımlandı.
- **Kapatma kuralı:** Hiçbir bulgu, ilgili T-testi yeşil olmadan kapatılmaz — kod değişikliği tek başına yeterli değil.
- **Kanıt zorunluluğu:** "Geçti" yalnızca tam doğrulama için; hedefli altküme açıkça belirtilir (bu denetimde iki kez bu hataya düşüldü: `current-focus.md` ve Codex'in 50-test raporu).

### 2026-08-05 — Kullanıcı — Append-only kuralı yürürlüğe girdi

- **Talimat:** "ortak raporduka veriler sabit kalmalı güncellemelier en alta eklenmeli"
- Yukarıdaki tüm bölümler **dondurulmuştur**. Bulgu tabloları, faz planı, blokaj listesi ve karar notları artık düzenlenmeyecek.
- Bundan sonra her değişiklik — durum güncellemesi, itiraz, geçersiz çıkan bulgu, yeni bulgu — **yalnızca bu bölüme yeni giriş** olarak eklenecek.
- Protokol madde 7 olarak dokümana işlendi.

### Açık bekleyenler (bu kayıt anı itibarıyla)

| Konu | Bekleyen taraf | Not |
|---|---|---|
| Faz 1.2 — FAQ auto-publish kaldırılsın mı? | **Kullanıcı** | Ürün kararı. Kaldırılmazsa CLAUDE.md §4.2 gerçek davranışa göre güncellenmeli |
| Faz 0 — secret/firewall | **Kullanıcı** | Kod değişikliği yok, bağımsız, en öncelikli |
| Faz 6.1 — prod `_prisma_migrations` | **Kullanıcı** | Gece/bakım penceresi; okunmadan migration dosyalarına dokunulmayacak |
| Faz 6.3 — RAG kalite 2. tur | **Kullanıcı** | Prod dump restore sonrası |

### 2026-08-05 — Kullanıcı / Codex — Faz 1.2 ürün kararı ve dokümantasyon kapanışı

- **Karar:** FAQ auto-publish kaldırılmayacak. Mevcut iç kullanım davranışı (`PUBLISHED` + `isInternal: true`) korunacak; bu karar için Prisma şeması, migration, cron/queue veya FAQ yayın kodu değiştirilmeyecek.
- **Zorunlu dokümantasyon kapanışı:** `CLAUDE.md` §4.2 ve ilgili güven hiyerarşisi gerçek davranışa hizalanacak: otomatik yayın yalnızca personel/iç kullanım içindir ve müşteri retrieval'ına uygun değildir; müşteriye görünür yayın ya da public audience geçişi açık admin onayı gerektirir.
- **Sınır:** Bu ürün kararı BULGU-01/R-S5 cache izolasyonu düzeltmesini ertelemez veya hafifletmez. Cache anahtarı/audience izolasyonu ve yabancı `interactionId` negatif testi Faz 1.1'de zorunlu kalır.
- **Kapanış kanıtı:** Doküman değişikliği incelemesi ile birlikte, iç FAQ'nın müşteri retrieval'ına girmediğini ve müşteri görünürlüğü için admin onay geçişinin korunduğunu gösteren hedefli test/denetim kaydı gerekir.

### 2026-08-05 — Kullanıcı — Yerel çalışma ve push yasağı

- Bu proje için kullanıcı açıkça "push et" demeden hiçbir remote push, tag push, deploy veya yayın işlemi yapılmayacak.
- Tüm remediation, commit, test ve restore-point çalışmaları yerelde yürütülecek. Remote'a aktarım, ayrı ve açık kullanıcı talimatı gerektirir.

### 2026-08-05 — Codex — Faz 0.1 tamamlandı: secret dosyası repo kapsamından çıkarıldı

- `canli-degiskenler.md` repo kökünden, repo dışındaki kullanıcıya ait korumalı arşive taşındı; hedef dosya izni `0600` olarak doğrulandı.
- Taşıma öncesi ve sonrası SHA-256 değerleri eşleşti; kaynak dosyanın repo kökünden kaldırıldığı doğrulandı. Secret değeri görüntülenmedi veya rapora yazılmadı.
- `.gitignore` dosyasına `canli-degiskenler.md` eklendi. Çalışma dizininde `.git` bulunmadığından `git status --ignored` kanıtı, Faz 0.2 rotasyonundan sonra güvenli git başlatma aşamasına ertelendi.
- **BULGU-03 kapalı değildir:** tüm listelenen production secret'larının canlı sağlayıcılarda rotate edilmesi ve uygulama sağlık doğrulaması hâlâ zorunludur.

### 2026-08-05 — Codex — Faz 1 politika hizalaması tamamlandı

- `CLAUDE.md` §4.2 ve §4.4, mevcut davranışla hizalandı: otomatik FAQ `PUBLISHED` + `isInternal: true` olarak yalnızca personel retrieval'ına uygundur; müşteri görünürlüğü/public audience geçişi açık admin onayı gerektirir.
- Güven hiyerarşisi, onaylı müşteri görünür FAQ ile otomatik iç FAQ ayrımını açıkça gösterir. `R-S5` korunmuştur.
- `faq.service.ts`, `faq.cron.service.ts`, Prisma şeması ve migration'larda değişiklik yapılmadı.
- Faz 1.1 cache izolasyonu, ayrı zorunlu güvenlik işi olarak devam etmektedir.

### 2026-08-05 — Codex — Faz 1.1 yerel cache izolasyonu uygulandı

- Semantik cache'in ortak `'system'` namespace kullanımı kaldırıldı. Requester, audience, ürün, dil, route locale ve history/Hotinfo/channel bağlamından türetilen scope hem Redis exact key'inde hem de semantik DB namespace'inde kullanılıyor; migration gerektirmedi.
- Kimliği olmayan veya attachment içeren istekler cache'i bypass eder. Eski cache kayıtları yeni anahtarla çakışmaz ve güvenli cache miss olur.
- Odaklı kanıt: `ai-semantic-cache.service.spec.ts` ve `ai-query.service.spec.ts` ile **3 suite / 76 test geçti**; backend `typecheck` geçti. Testler kullanıcı/audience, ürün, dil, route ve context ayrımını; semantik DB namespace ayrımını kapsıyor.
- Bağımsız güvenlik incelemesinde bu diff için doğrulanmış cross-user/audience cache sızıntısı bulunmadı. Tam backend suite ve canlı iki-hesap smoke testi, yayın öncesi kapanış kanıtı olmaya devam eder.

### 2026-08-05 — Codex — Faz 1.3 migration kapısı nedeniyle beklemede

- BULGU-02 için ayrı verification secret, `purpose`/`audience`, kısa TTL, `SUSPENDED` reddi ve **atomik tek-kullanımlık token tüketimi** gereklidir. Mevcut token üreticisi `customers.service.ts`; doğrulayıcı `auth.service.ts` içinde bu sınırlar yoktur.
- Atomik tek-kullanımlılık için kalıcı token kaydı ve migration gerekir. BULGU-10 protokolü gereği production `_prisma_migrations` salt-okunur incelenmeden migration dosyalarına dokunulmayacak.
- Bu nedenle Faz 1.3 yerel kod değişikliği başlatılmadı; yarım bir JWT kontrolü ile kapatılmış sayılmayacak. Gerekli canlı migration envanteri kullanıcı bakım penceresinde alındıktan sonra test-first uygulanacak.

### 2026-08-05 — Codex — UI rol-menüsü koşullu teknik borç notu

- `sidebar.tsx` admin navigasyonunu yalnızca `ADMIN` rolüne bağlıyor; ayrı bir `AGENT`/`TEAM_LEAD` kullanıcısı atanırsa customer menüsü görme riski kaynakta mevcuttur.
- Canlıda bunun gerçekleştiğine dair kanıt yoktur; production seed/sync admin hesaplarını `ADMIN` olarak atar ve kullanıcı mevcut admin arayüzünün doğru çalıştığını teyit etmiştir.
- Bu kayıt **GAP bulgusu, yayın blokajı veya mevcut canlı hata değildir**. Faz 2 yetkilendirme kapanışından sonra, ayrı UI rol matrisi/acceptance testi olarak değerlendirilecektir; mevcut Faz 0–6 sıralamasını değiştirmez.

### 2026-08-05 — Codex — Faz 2.1/2.4 ticket erişimi ve WebSocket yayın sınırı yerel checkpoint

- `TicketAccessService` ile HTTP ticket detayları ve Socket `ticket:join`, `ticket:typing`, `ticket:message_read` yollarında hesap/rol/ticket bağlamı merkezi fail-closed erişim kontrolüne alındı. `CUSTOMER`/`VIEWER` yalnızca kendi ticket'ına, tanımlı staff rolleri ilgili ticket'a erişir; bilinmeyen rol reddedilir.
- `ticket:message_read` ticket-message bağını doğrular; `CUSTOMER`/`VIEWER` dahili mesajın e-posta işini iptal edemez.
- Dahili ticket mesajı ve ona ait attachment Socket olayları customer ticket odasına yayınlanmaz; yalnızca personel rol odalarına gönderilir. Mevcut tireli/alt-çizgili rol oda isimleri geçiş uyumluluğu için birlikte hedeflenir.
- Odak doğrulaması: 4 backend suite / 59 test geçti; `pnpm --filter @aluplan/backend typecheck` geçti. Bağımsız kod incelemesi, güncel Faz 2 kapsamında bloklayıcı regresyon bulmadı. Bu yerel checkpoint tam e2e/iki-hesap canlı smoke yerine geçmez.
- Canlı sistem topolojisi notu: kullanıcı, `Sistem Kaynak Topolojisi` ekranındaki PDF/DOCX/XLS/TXT/MD, admin makale, URL/web ve bilet öğrenimi kaynaklarının birleşik vektör dizinine akışının canlıda iyi çalıştığını teyit etti. Sonraki Faz 2 işleri bu akışı bozmayacak; özellikle `Bilet Öğrenimi` hattında müşteri/personel veri sınırı korunacak.
- Kapanmamış kapsam: HTTP download/attachment authorization, ticket list/query endpoint düzenlemeleri, permission-temelli özel roller ve frontend UI rol matrisi Faz 2 devam işidir.
