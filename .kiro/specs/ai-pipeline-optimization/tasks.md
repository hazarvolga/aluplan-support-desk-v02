# Implementation Plan: AI Pipeline Optimization

## Overview

Bu plan, AI pipeline'ındaki altı kritik eksikliği giderir. Görevler bağımsızlık sırasına göre düzenlenmiştir: önce izole değişiklikler (VertexAI kaldırma, LangfuseService), ardından bağımlı değişiklikler (Prisma migration, queryInternal bloğu). Her görev kendi commit'iyle tamamlanır ve mevcut çalışan kod kırılmaz.

## Tasks

- [x] 1. VertexAI Provider Kaldırma
  - [x] 1.1 `ai.service.ts` dosyasından VertexAI referanslarını kaldır
    - `VertexAiService` constructor injection'ını sil
    - `import { VertexAiService }` satırını sil
    - `getProviderByName()` içindeki `if (providerName === 'vertex') return this.vertex;` satırını kaldır; yerine `openai` fallback + `logger.warn` bloğu ekle
    - `testProvider()` switch'inden `case 'vertex'` bloğunu kaldır
    - `getActiveModelName()` içindeki `|| providerName === 'vertex'` koşulunu kaldır
    - `getHealthStatus()` providers listesinin `vertex` içermediğini doğrula (zaten yok, değişiklik gerekmez)
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [x] 1.2 `ai.module.ts` dosyasından VertexAI referanslarını kaldır
    - `import { VertexAiService }` satırını sil
    - `providers` listesinden `VertexAiService` kaldır
    - `exports` listesinden `VertexAiService` kaldır
    - _Requirements: 1.3, 1.6_
  - [x] 1.3 `vertex-ai.service.ts` dosyasını sil
    - Dosyayı tamamen kaldır; başka hiçbir dosya bu dosyayı import etmediğini doğrula
    - _Requirements: 1.6_
  - [x] 1.4 VertexAI kaldırma için unit testler yaz
    - `AiService.getProviderByName('vertex')` → openai provider döner + warn log tetiklenir
    - `AiService.getHealthStatus()` → dönen objede `vertex` key'i bulunmaz
    - NestJS test module `VertexAiService` olmadan başarıyla compile olur
    - _Requirements: 1.2, 1.4, 1.5_
  - **Commit:** `feat(ai): remove VertexAI provider, add openai fallback`

- [x] 2. LangfuseService — `addEvent()` Metodu Ekleme
  - [x] 2.1 `langfuse.service.ts` dosyasına `addEvent()` metodunu ekle
    - Mevcut `trace()` metodunu değiştirmeden yeni `addEvent(traceId: string, eventName: string, payload: Record<string, unknown>): Promise<void>` metodunu ekle
    - `this.langfuse` null/undefined ise sessizce return et
    - `trace.event({ name: eventName, input: payload })` çağrısını yap
    - `await this.langfuse.flushAsync()` ile flush et
    - Hata durumunda `logger.error` yaz, exception fırlatma
    - _Requirements: 6.5_
  - [x] 2.2 `addEvent()` için unit testler yaz
    - `langfuse` null iken çağrıldığında sessizce return eder
    - `flushAsync` throws → `logger.error` çağrılır, exception propagate olmaz
    - Başarılı çağrıda `trace.event` doğru argümanlarla çağrılır
    - _Requirements: 6.3, 6.5_
  - **Commit:** `feat(langfuse): add addEvent() method for observability events`

- [x] 3. Prisma Schema ve Migration — `AiShiftDetection` Modeli
  - [x] 3.1 `schema.prisma` dosyasına `AiShiftDetection` modelini ekle
    - `AiShiftDetection` modelini tanımla: `id` (UUID), `interactionId` (nullable FK), `userId` (nullable String), `detectedAt` (DateTime default now), `previousKeywords` (String[]), `newKeywords` (String[]), `historyLength` (Int), `confirmed` (Boolean default false)
    - `@@map("ai_shift_detections")` table mapping ekle
    - `AiInteraction` modeline `shiftDetections AiShiftDetection[]` relation ekle
    - _Requirements: 2.1, 2.5, 7.5, 7.6_
  - [x] 3.2 Migration oluştur ve uygula
    - `prisma migrate dev --name add_ai_shift_detections` komutunu çalıştır
    - Migration dosyasının yalnızca yeni tablo oluşturduğunu, mevcut tabloları değiştirmediğini doğrula
    - `prisma generate` ile Prisma client'ı yenile; `PrismaService.aiShiftDetection` erişilebilir olmalı
    - _Requirements: 2.1, 2.5, 7.5, 7.6_
  - **Commit:** `feat(prisma): add AiShiftDetection model and migration`

- [x] 4. AiQueryService — Shift Detection Bloğu (`queryInternal()`)
  - [x] 4.1 `ai-query.service.ts` içinde shift detection bloğunu ekle
    - `diagnosisForThreshold` hesaplandıktan sonra, `promptContextBuilder.buildContext()` çağrısından önce bloğu yerleştir
    - **DB log (try/catch):** `prisma.aiShiftDetection.create()` ile kayıt oluştur; hata durumunda `logger.error` yaz, pipeline devam eder
    - **History temizleme:** `options.history && options.history.length > 0` guard'ı ile `options.history = []` ata; `logger.warn('🔄 Problem shift detected — history cleared for clean context')` yaz
    - **Langfuse event (try/catch):** `langfuse.addEvent(traceId, 'problem-shift', payload)` çağır; payload `previousKeywords`, `newKeywords`, `historyLength`, `userId` içermeli; hata durumunda `logger.error` yaz, pipeline devam eder
    - Tüm blok `if (diagnosisForThreshold.isProblemShift)` koşuluna bağlı
    - `any` tipi kullanma; `(error as Error).message` pattern'ini kullan
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 7.1_
  - [x] 4.2 Property testi yaz — Property 2: Shift Detection DB Persistence
    - **Property 2: Shift Detection DB Persistence**
    - **Validates: Requirements 2.2**
    - `fc.record({ userQuery: fc.string({ minLength: 5 }), history: fc.array(..., { minLength: 1 }) })` ile 100 iterasyon
    - `diagnosisService` mock'u `isProblemShift=true` döndürecek şekilde ayarla
    - `prisma.aiShiftDetection.create` tam olarak bir kez çağrıldığını ve `newKeywords` + `historyLength` alanlarının doğru olduğunu assert et
  - [x] 4.3 Property testi yaz — Property 3: History Mutation iff isProblemShift
    - **Property 3: History Mutation iff isProblemShift**
    - **Validates: Requirements 3.1, 3.3**
    - `fc.array(fc.record({ role: fc.constantFrom('user', 'assistant'), content: fc.string() }), { minLength: 1 })` ve `fc.boolean()` ile 100 iterasyon
    - `isProblemShift=true` → `buildContext`'e iletilen history `[]` olmalı
    - `isProblemShift=false` → history değişmeden korunmalı
  - [x] 4.4 Property testi yaz — Property 5: Langfuse Payload Completeness
    - **Property 5: Shift Event Langfuse Payload Completeness**
    - **Validates: Requirements 6.1, 6.2**
    - `fc.record({ userQuery, history, userId: fc.option(fc.string(), { nil: null }) })` ile 100 iterasyon
    - `addEvent` çağrısının `"problem-shift"` event adıyla ve `previousKeywords`, `newKeywords`, `historyLength`, `userId` alanlarının tamamını içeren payload ile yapıldığını assert et
  - [x] 4.5 Property testi yaz — Property 6: Pipeline Resilience
    - **Property 6: Pipeline Resilience — Optional Steps Don't Block Result**
    - **Validates: Requirements 2.3, 6.3, 7.1**
    - `fc.record({ dbFails: fc.boolean(), langfuseFails: fc.boolean() })` ile 100 iterasyon
    - DB create throws ve/veya `addEvent` throws durumunda `queryInternal()` yine geçerli `AiQueryResult` döndürmeli
    - `result.query`, `result.confidence`, `result.interactionId` alanlarının tanımlı olduğunu assert et
  - [x] 4.6 Unit testler yaz
    - DB write throws → `AiQueryResult` yine döner
    - Langfuse throws → `AiQueryResult` yine döner
    - `isProblemShift=false` → `prisma.aiShiftDetection.create` çağrılmaz
    - `options.history` undefined → history temizleme adımı atlanır
    - _Requirements: 2.3, 3.3, 3.4, 6.3, 7.1_
  - **Commit:** `feat(ai-query): add shift detection block — DB log, history clear, Langfuse event`

- [x] 5. AiCopilotService — Shift Sonrası Messages Kırpma
  - [x] 5.1 `ai-copilot.service.ts` içinde `generateDraft()` metoduna messages kırpma ekle
    - `messages` array oluşturulduktan sonra, `diagnosis.isProblemShift && messages.length > 1` koşulunu kontrol et
    - Koşul sağlanırsa `messages.splice(0, messages.length - 1)` ile son mesaj dışındakileri kaldır
    - `logger.warn('🔄 Copilot: Problem shift detected — messages trimmed to last message only')` yaz
    - _Requirements: 3.5_
  - [x] 5.2 Unit testler yaz
    - `isProblemShift=true` ve `messages.length > 1` → messages yalnızca son mesajı içerir
    - `isProblemShift=false` → messages değişmez
    - `messages.length === 1` → splice çağrılmaz
    - _Requirements: 3.5_
  - **Commit:** `feat(ai-copilot): trim messages on problem shift detection`

- [x] 6. AiController — `GET /ai/status/:jobId` Endpoint
  - [x] 6.1 `ai.controller.ts` içinde `getJobStatus()` metodunu güncelle
    - Mevcut `@Public()` decorator'ı kaldır
    - `@UseGuards(JwtAuthGuard)` ekle
    - `NotFoundException` import'unu `@nestjs/common`'dan ekle (yoksa)
    - `job` null ise `throw new NotFoundException({ message: 'Job not found' })` fırlat
    - `statusMap` ile BullMQ state → `PENDING/PROCESSING/COMPLETED/FAILED` dönüşümünü uygula
    - `status === 'COMPLETED'` → `result: job.returnvalue` ekle
    - `status === 'FAILED'` → `error: job.failedReason` ekle
    - `@InjectQueue('ai-query-processing')` inject'in mevcut olduğunu doğrula; yoksa ekle
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 6.2 Property testi yaz — Property 4: Job State → Status Enum Mapping
    - **Property 4: Job State → Status Enum Mapping**
    - **Validates: Requirements 4.2, 4.3**
    - `fc.constantFrom('waiting', 'delayed', 'active', 'completed', 'failed')` ile 100 iterasyon
    - Her BullMQ state için `getJobStatus()` yanıtının `status` alanının `{PENDING, PROCESSING, COMPLETED, FAILED}` kümesinde olduğunu assert et
    - Hiçbir state için hata fırlatılmadığını doğrula
  - [x] 6.3 Unit testler yaz
    - `getJob` null döner → HTTP 404 `NotFoundException`
    - `completed` job → `result` alanı `job.returnvalue` ile dolu
    - `failed` job → `error` alanı `job.failedReason` ile dolu
    - `waiting` job → `status: 'PENDING'`
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_
  - **Commit:** `feat(ai-controller): secure GET /ai/status/:jobId with JWT, standardize response`

- [x] 7. AiModule — BullMQ Rate Limiter Konfigürasyonu
  - [x] 7.1 `ai.module.ts` içinde `ai-query-processing` kuyruğuna rate limiter ekle
    - `BullModule.registerQueue()` çağrısında `ai-query-processing` kuyruğuna `limiter` objesi ekle
    - `limiter.max`: `parseInt(process.env.AI_QUEUE_RATE_MAX ?? '10', 10)`
    - `limiter.duration`: `parseInt(process.env.AI_QUEUE_RATE_DURATION_MS ?? '1000', 10)`
    - Mevcut `attempts: 3` (veya `attempts: 2`) retry konfigürasyonunun korunduğunu doğrula
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  - [x] 7.2 Unit testler yaz
    - `AI_QUEUE_RATE_MAX` tanımsız → `limiter.max` değeri `10` olur
    - `AI_QUEUE_RATE_DURATION_MS` tanımsız → `limiter.duration` değeri `1000` olur
    - Mevcut retry konfigürasyonu korunur
    - _Requirements: 5.2, 5.3, 5.6_
  - **Commit:** `feat(ai-module): add BullMQ rate limiter for OpenAI 429 protection`

- [x] 8. `.env.example` Güncelleme
  - [x] 8.1 `.env.example` dosyasına BullMQ rate limiter değişkenlerini ekle
    - `AI_QUEUE_RATE_MAX=10` satırını ekle
    - `AI_QUEUE_RATE_DURATION_MS=1000` satırını ekle
    - Değişkenlerin üstüne `# BullMQ AI Queue Rate Limiter` açıklama satırı ekle
    - _Requirements: 5.2, 5.3_
  - **Commit:** `chore(env): add AI_QUEUE_RATE_MAX and AI_QUEUE_RATE_DURATION_MS to .env.example`

- [x] 9. Checkpoint — Tüm Testler ve TypeScript Doğrulama
  - Tüm unit ve property-based testlerin geçtiğini doğrula
  - `tsc --strict` ile sıfır TypeScript hatası olduğunu kontrol et
  - `prisma generate` sonrası `PrismaService.aiShiftDetection` erişilebilir olduğunu doğrula
  - `LangfuseService.addEvent` export edilmiş, `trace()` imzası değişmemiş olduğunu kontrol et
  - NestJS uygulamasının `VertexAiService` olmadan başarıyla başladığını doğrula
  - Kullanıcıya soru varsa sor.

## Notes

- `*` ile işaretli sub-task'lar opsiyoneldir; MVP için atlanabilir
- Her task kendi commit'iyle tamamlanır (commit mesajı task altında belirtilmiştir)
- Task 1–2 tamamen bağımsızdır; paralel uygulanabilir
- Task 3 (Prisma migration) Task 4'ten önce tamamlanmalıdır
- Task 4 (queryInternal bloğu) Task 2 (LangfuseService) ve Task 3'e bağımlıdır
- Property-based testler fast-check kütüphanesi ile yazılır; her test minimum 100 iterasyon çalıştırır
- `any` tipi kullanılmaz; `unknown` + type guard veya `(error as Error).message` pattern'i kullanılır
