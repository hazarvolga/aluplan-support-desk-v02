# Requirements Document

## Introduction

Bu spec, **aluplan-support-desk-V02** projesinin AI pipeline'ında Graphify analizi ile tespit edilen altı kritik eksikliği giderir. Hedef: maliyet optimizasyonu (VertexAI kaldırma), gözlemlenebilirlik (shift detection loglama + Langfuse entegrasyonu), async iş akışı tamamlama (BullMQ status endpoint) ve OpenAI rate limit koruması. Mevcut çalışan kod kırılmayacak; her değişiklik izole, geriye dönük uyumlu ve TypeScript strict-mode uyumlu olacaktır.

---

## Glossary

- **AI_Pipeline**: `AiQueryService.queryInternal()` → `AiDiagnosisService.analyze()` → `AiService.reformat()` zincirinin tamamı.
- **AiQueryService**: RAG tabanlı soru-cevap akışını yöneten NestJS servisi (`apps/backend/src/ai/ai-query.service.ts`).
- **AiDiagnosisService**: Keyword heuristiği ile problem sınıflandırması ve shift tespiti yapan servis (`apps/backend/src/ai/ai-diagnosis.service.ts`).
- **AiService**: Multi-provider dispatcher; circuit breaker ve fallback mantığını barındırır (`apps/backend/src/ai/ai.service.ts`).
- **VertexAiService**: Google Vertex AI entegrasyonu; 22 edge'li god node, maliyet nedeniyle kaldırılacak.
- **GenericOpenAiService**: OpenAI-uyumlu herhangi bir endpoint'i destekleyen generic provider.
- **OpenAiService**: Birincil OpenAI provider.
- **AiShiftDetection**: `ai_shift_detections` Prisma tablosu — problem shift olaylarının kalıcı kaydı.
- **BullMQ_Queue**: `ai-query-processing` adlı BullMQ kuyruğu; async AI job'larını işler.
- **AiQueryProcessor**: BullMQ job'larını tüketen NestJS processor (`apps/backend/src/ai/ai-query.processor.ts`).
- **LangfuseService**: Observability ve trace servisi (`apps/backend/src/ai/langfuse.service.ts`).
- **AiSemanticCache**: Semantik sorgu önbelleği.
- **EmbeddingNormalizer**: Embedding vektörlerini normalize eden yardımcı sınıf.
- **Problem_Shift**: Bir konuşma geçmişinde kullanıcının önceki teknik konudan bağımsız yeni bir konu açması durumu.
- **Rate_Limiter**: OpenAI API'ye gönderilen istek sayısını ve token hacmini sınırlayan BullMQ limiter konfigürasyonu.
- **Prisma_Migration**: Veritabanı şema değişikliklerini yöneten Prisma migrate aracı.

---

## Requirements

### Requirement 1: VertexAI Provider Kaldırma

**User Story:** Bir platform yöneticisi olarak, VertexAI entegrasyonunun tamamen devre dışı bırakılmasını istiyorum; böylece gereksiz bulut maliyetleri ortadan kalksın ve provider yönetimi sadeleşsin.

#### Acceptance Criteria

1. THE `AiService` SHALL `VertexAiService`'i constructor injection listesinden ve `getProviderByName()` / `testProvider()` switch bloklarından kaldırmalıdır.
2. WHEN `AiService.getActiveChatProvider()` çağrıldığında, THE `AiService` SHALL yalnızca `openai`, `custom` (GenericOpenAiService), `llmapi` ve `ollama` provider'larını değerlendirmelidir.
3. THE `AiModule` SHALL `VertexAiService`'i providers listesinden çıkarmalı ve ilgili import'u silmelidir.
4. IF `ai.active_provider` veya `ai.chat_provider` ayarı `"vertex"` değerini içeriyorsa, THEN THE `AiService` SHALL bu değeri `"openai"` olarak yorumlamalı ve bir uyarı log'u yazmalıdır.
5. THE `AiService.getHealthStatus()` SHALL `vertex` provider'ını health check listesinden çıkarmalıdır.
6. WHILE `VertexAiService` dosyası (`vertex-ai.service.ts`) kod tabanında mevcutsa, THE `AiModule` SHALL bu servisi inject etmemelidir.

---

### Requirement 2: `ai_shift_detections` Tablosu ve Migration

**User Story:** Bir destek ekibi yöneticisi olarak, AI'ın problem shift tespitlerinin veritabanında loglanmasını istiyorum; böylece "shift detection ne kadar doğru çalışıyor?" sorusunu geçmişe dönük analiz ederek cevaplayabileyim.

#### Acceptance Criteria

1. THE `Prisma_Migration` SHALL `ai_shift_detections` adında yeni bir tablo oluşturmalıdır; tablo en az şu alanları içermelidir: `id` (UUID), `interactionId` (AiInteraction FK), `userId` (nullable string), `detectedAt` (DateTime), `previousKeywords` (string[]), `newKeywords` (string[]), `historyLength` (Int), `confirmed` (Boolean, default false).
2. WHEN `AiDiagnosisService.analyze()` `isProblemShift = true` döndürdüğünde, THE `AiQueryService` SHALL `ai_shift_detections` tablosuna bir kayıt oluşturmalıdır.
3. THE `AiQueryService` SHALL shift detection kaydını `try/catch` bloğu içinde oluşturmalı; kayıt başarısız olsa bile ana pipeline akışı durmamalıdır.
4. WHEN bir shift detection kaydı oluşturulduğunda, THE `AiQueryService` SHALL `messages` (konuşma geçmişi) dizisini temizlemeli ve yalnızca mevcut kullanıcı mesajını içeren tek elemanlı bir dizi olarak `queryInternal()`'a iletmelidir.
5. THE `Prisma_Migration` SHALL mevcut `AiInteraction` tablosunu değiştirmemeli; yalnızca yeni tablo eklenmelidir.

---

### Requirement 3: History Temizleme (Shift Sonrası)

**User Story:** Bir son kullanıcı olarak, konuyu değiştirdiğimde AI'ın önceki konuşma bağlamını sıfırlamasını istiyorum; böylece alakasız geçmiş mesajlar yeni soruya yanlış yanıt üretmesine yol açmasın.

#### Acceptance Criteria

1. WHEN `AiDiagnosisService.analyze()` `isProblemShift = true` döndürdüğünde, THE `AiQueryService` SHALL `options.history` dizisini `[]` (boş dizi) olarak sıfırlamalıdır; bu işlem `queryInternal()` içinde, `promptContextBuilder.buildContext()` çağrısından önce gerçekleşmelidir.
2. WHEN history temizlendiğinde, THE `AiQueryService` SHALL `"🔄 Problem shift detected — history cleared for clean context"` seviyesinde bir `warn` log'u yazmalıdır.
3. THE `AiQueryService` SHALL history temizleme işlemini yalnızca `isProblemShift === true` koşulunda uygulamalıdır; `isProblemShift === false` durumunda mevcut history korunmalıdır.
4. IF `options.history` tanımsız veya boş ise, THEN THE `AiQueryService` SHALL history temizleme adımını atlamalı ve pipeline'a devam etmelidir.
5. THE `AiCopilotService.generateDraft()` SHALL aynı shift tespiti mantığını kullanmalı; shift tespit edildiğinde `messages` dizisini yalnızca son mesajı içerecek şekilde kırpmalıdır.

---

### Requirement 4: `GET /ai/status/:jobId` Endpoint

**User Story:** Bir frontend geliştiricisi olarak, BullMQ'ya gönderilen async AI job'larının durumunu sorgulayabilmek istiyorum; böylece kullanıcıya "işleminiz devam ediyor" veya "sonuç hazır" bilgisini gösterebileyim.

#### Acceptance Criteria

1. THE `AiController` SHALL `GET /ai/status/:jobId` rotasını sunmalıdır; bu rota JWT auth guard ile korunmalıdır.
2. WHEN `GET /ai/status/:jobId` çağrıldığında, THE `AiController` SHALL BullMQ `ai-query-processing` kuyruğundan ilgili job'ı sorgulamalı ve `{ jobId, status, result?, error? }` formatında yanıt dönmelidir.
3. THE `status` alanı SHALL şu değerlerden birini içermelidir: `"PENDING"`, `"PROCESSING"`, `"COMPLETED"`, `"FAILED"`.
4. WHEN job `"COMPLETED"` durumundaysa, THE endpoint SHALL `result` alanında `AiQueryResult` nesnesini dönmelidir.
5. WHEN job `"FAILED"` durumundaysa, THE endpoint SHALL `error` alanında hata mesajını dönmelidir.
6. IF belirtilen `jobId` kuyrukta bulunamazsa, THEN THE `AiController` SHALL HTTP 404 ile `{ message: "Job not found" }` dönmelidir.
7. THE endpoint SHALL `@InjectQueue('ai-query-processing')` ile inject edilen BullMQ `Queue` nesnesini kullanmalıdır; yeni bir servis bağımlılığı eklenmemelidir.

---

### Requirement 5: BullMQ Rate Limiter Konfigürasyonu

**User Story:** Bir sistem yöneticisi olarak, AI kuyruğunun OpenAI rate limit sınırlarını aşmamasını istiyorum; böylece `429 Too Many Requests` hataları nedeniyle job'ların başarısız olması engellensin.

#### Acceptance Criteria

1. THE `AiModule` (veya `BullModule.registerQueue()` çağrısı) SHALL `ai-query-processing` kuyruğu için bir `limiter` konfigürasyonu tanımlamalıdır; bu konfigürasyon `max` (maksimum job sayısı) ve `duration` (milisaniye cinsinden pencere) alanlarını içermelidir.
2. THE `limiter.max` değeri SHALL `AI_QUEUE_RATE_MAX` ortam değişkeninden okunmalıdır; değer tanımsızsa varsayılan olarak `10` kullanılmalıdır.
3. THE `limiter.duration` değeri SHALL `AI_QUEUE_RATE_DURATION_MS` ortam değişkeninden okunmalıdır; değer tanımsızsa varsayılan olarak `1000` (1 saniye) kullanılmalıdır.
4. WHEN bir job rate limit penceresini aşarsa, THE `BullMQ_Queue` SHALL job'ı otomatik olarak geciktirmeli; job başarısız olarak işaretlenmemelidir.
5. THE `AiQueryProcessor` SHALL rate limit kaynaklı gecikmeler için `Logger.warn()` ile bilgilendirici log yazmalıdır.
6. THE rate limiter konfigürasyonu SHALL mevcut `attempts: 2` retry konfigürasyonuyla birlikte çalışmalıdır; ikisi birbirini ezmemelidir.

---

### Requirement 6: Langfuse'a Shift Event Yazma

**User Story:** Bir AI mühendisi olarak, problem shift olaylarının Langfuse trace'lerine yazılmasını istiyorum; böylece shift detection kalitesini ve model davranışını observability dashboard'undan izleyebileyim.

#### Acceptance Criteria

1. WHEN `AiDiagnosisService.analyze()` `isProblemShift = true` döndürdüğünde, THE `AiQueryService` SHALL `LangfuseService` üzerinden bir `"problem-shift"` event'i trace'e eklemelidir.
2. THE shift event payload'u SHALL en az şu alanları içermelidir: `previousKeywords` (string[]), `newKeywords` (string[]), `historyLength` (number), `userId` (string | null).
3. THE `AiQueryService` SHALL Langfuse event yazma işlemini `try/catch` bloğu içinde gerçekleştirmelidir; Langfuse erişilemez olsa bile pipeline durmamalıdır.
4. WHEN `AiSemanticCache` bir cache hit döndürdüğünde, THE `LangfuseService` SHALL `"cache-hit"` event'ini mevcut trace'e eklemelidir; bu event `cacheKey` ve `interactionId` alanlarını içermelidir.
5. THE `LangfuseService` SHALL shift event'lerini mevcut `trace()` metodunun yanına `addEvent(traceId, eventName, payload)` imzasıyla yeni bir metot olarak sunmalıdır; mevcut `trace()` metodu değiştirilmemelidir.

---

### Requirement 7: Genel Pipeline Dayanıklılığı

**User Story:** Bir DevOps mühendisi olarak, yukarıdaki tüm değişikliklerin mevcut çalışan pipeline'ı kırmadığından emin olmak istiyorum; böylece production'da kesinti yaşanmasın.

#### Acceptance Criteria

1. THE `AiQueryService.queryInternal()` SHALL her yeni eklenen adımı (shift log, history temizleme, Langfuse event) ayrı `try/catch` blokları içinde sarmalıdır; herhangi bir adımın başarısız olması `AiQueryResult` dönüşünü engellememelidir.
2. THE `AiService` SHALL `VertexAiService` kaldırıldıktan sonra `getHealthStatus()` metodunu hatasız çalıştırmalıdır; `vertex` anahtarı health sonuçlarında yer almamalıdır.
3. WHEN `AiModule` yeniden derlendikten sonra, THE NestJS uygulaması SHALL başlangıçta `VertexAiService` ile ilgili herhangi bir dependency injection hatası üretmemelidir.
4. THE TypeScript derleyicisi SHALL tüm değiştirilmiş dosyalarda `strict: true` modunda sıfır hata üretmelidir; `any` tipi kullanılmamalıdır.
5. THE `Prisma_Migration` SHALL `prisma migrate deploy` komutuyla hatasız uygulanabilmelidir; mevcut tablolarda veri kaybı yaşanmamalıdır.
6. WHEN herhangi bir yeni Prisma modeli eklendikten sonra, THE `PrismaService` SHALL yeni modeli tip-güvenli şekilde erişilebilir kılmalıdır.
