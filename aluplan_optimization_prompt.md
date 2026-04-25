# Aluplan AI Support — RAG Optimization Prompt
# Claude Code / Cursor / Copilot için hazır prompt

---

## ⚠️ PHASE 0 — RESTORE POINT (İlk ve zorunlu adım)

Aşağıdaki adımları sırayla uygula. Hiçbir dosyaya dokunmadan önce bu phase tamamlanmalı.

```bash
git status
git add -A
git commit -m "restore-point: pre-optimization — RAG pipeline stable before Parser/ProblemShift/BullMQ"
```

Commit hash'i terminale yazdır ve bana göster.
**Bu adım tamamlanmadan PHASE 1'e geçme.**

---

## SİSTEM BAĞLAMI

### Stack
- Backend: NestJS + PostgreSQL + Redis (mevcut)
- Frontend: Next.js
- LLM: OpenAI GPT-4o
- Durum: Production öncesi, test aşaması

### Mevcut AI Pipeline (7 Adım)

```
[INPUTS]
User Query
Product Selection      ──► QueryExpansion (Step 1)
Hotinfo / Specs        ──►     │
Attachments/Logs ──► DocumentParserService ──►

[PROCESSING]
Step 1: Query Expansion
  - Hotinfo merge (performance/crash sorularında OS/GPU eklenir)
  - File parsing (PDF/log → text)
  - Synonym expansion

Step 2: Adaptive Confidence Analysis
  - Technicity check
  - Similarity floor:
    - Technical/Known Product → 0.45–0.48 (Trusting)
    - Unknown/Generic Product → 0.60 (Strict)

Step 3: AiDiagnosisService (The Filter)
  - Query → Product ID mapping
  - Query → Category mapping (Installation, Licensing, FEM…)
  - Keyword identification

Step 4: Semantic Retrieval (RAG) — 4 Pillar
  - Articles (high-level solutions)
  - Documents (technical manuals)
  - Web URLs (external help pages)
  - Tickets (historical resolutions)
  → Vector DB → Top-20 chunks

Step 5: LLM Re-ranking
  - Fast LLM pass
  - Practical usefulness sorting

Step 6: Context Synthesis → PromptContextBuilder
  - [KNOWLEDGE BASE] retrieved & re-ranked
  - [HOTINFO] user system specs
  - [DIAGNOSIS] category/keyword analysis
  - [HISTORY] last 10 messages ← BU SATIR SORUNLU

Step 7: Master LLM Generation
  - 📌 Sorun Yorumu
  - 🎯 En Olası Neden
  - 🛠️ Çözüm Adımları
  - ✅ Doğrulama
  → Success: AI Diagnostic Report → Telemetry DB
  → Fail: Fallback to Human Agent
```

### Mevcut Servisler
```
AiController
  → AiQueryService → AiService.reformat() [SENKRON/BLOKLAYICI]
  → AiCopilotService.generateDraft() [HER ZAMAN TÜM HISTORY GÖNDERİYOR]

DocumentParserService [SADECE image/* İŞLİYOR — PDF/DOCX/XLSX EKSİK]
AiDiagnosisService [ÇALIŞIYOR]
PromptContextBuilder [ÇALIŞIYOR]
```

---

## PHASE 1 — DOCUMENT PARSER

### Problem
`DocumentParserService` şu an yalnızca `image/*` tipini işliyor.
Kullanıcı `.pdf`, `.docx`, `.xlsx` yüklediğinde içerik okunmuyor.
Bu Step 1 (Query Expansion) içinde kör nokta yaratıyor.

### Hedef
`DocumentParserService`'e PDF, DOCX ve XLSX desteği ekle.
Parse edilen metin Step 1'deki "Technical Context Bundle"a eklensin.

### Kurulacak Paketler
```bash
npm install pdf-parse mammoth xlsx
npm install --save-dev @types/pdf-parse
```

### Yapılacaklar

**1. `DocumentParserService` içine şu metodları ekle:**

```typescript
// Dosya: src/ai/services/document-parser.service.ts

async parsePdf(buffer: Buffer): Promise<string>
// pdf-parse kullan
// Hata olursa '' döndür, pipeline durmasın

async parseDocx(buffer: Buffer): Promise<string>
// mammoth.extractRawText() kullan
// Hata olursa '' döndür

async parseXlsx(buffer: Buffer): Promise<string>
// xlsx.read() ile tüm sheet'leri oku
// Her satırı " | " ile birleştir, string döndür
// Hata olursa '' döndür

async parseAttachment(file: Express.Multer.File): Promise<string>
// mimetype veya uzantıya göre yukarıdakileri çağır
// Sonucu 2000 karaktere kırp (context window koruması)
// Log: hangi dosya, hangi tip, kaç karakter çıktı
```

**2. Kırpma kuralı:**
```typescript
const MAX_CHARS = 2000
const text = rawText.slice(0, MAX_CHARS)
// 2000'i aşıyorsa sona şunu ekle:
// "\n[İçerik 2000 karakter ile sınırlandırıldı]"
```

**3. Step 1 Query Expansion içinde çağır:**
```typescript
// Mevcut file parsing bloğunu bul, parseAttachment() ile genişlet
// image/* mantığına DOKUNMA, sadece else-if dalları ekle
```

**4. Unit testler:**
```
- parsePdf: geçerli buffer → metin döner
- parsePdf: bozuk buffer → '' döner, hata fırlatmaz
- parseDocx: geçerli buffer → metin döner
- parseDocx: bozuk buffer → '' döner
- parseXlsx: geçerli buffer → pipe-separated metin döner
- parseAttachment: .pdf → parsePdf çağrılır
- parseAttachment: .docx → parseDocx çağrılır
- parseAttachment: .xlsx → parseXlsx çağrılır
- parseAttachment: .png → mevcut image mantığı çalışır
- 2000 karakter kırpma kuralı çalışıyor
```

**5. Phase bittikten sonra:**
```bash
git commit -m "feat: phase-1 — document parser PDF/DOCX/XLSX support"
```

Bana şunu göster:
- Değişen/eklenen dosyalar
- Test sonuçları (tümü green)

---

## PHASE 2 — PROBLEM SHIFT DETECTION

### Problem
Step 6 (Context Synthesis) içinde `[HISTORY]` her zaman son 10 mesajı
LLM'e gönderiyor. Kullanıcı aynı bilette konu değiştirdiğinde:
- Eski bağlam hallüsinasyona yol açıyor
- %40–60 ekstra token maliyeti oluşuyor

### Örnek Senaryo
```
Mesaj 1–5: "Şifre sıfırlama çalışmıyor"
Mesaj 6:   "Tamam çözdüm. Şimdi lisans aktivasyonu yapamıyorum"

Şu an olan:  AI şifre + lisans bilgilerini birbirine karıştırıyor
Hedef:       Mesaj 6 gelince bağlam temizleniyor, AI sadece lisansa odaklanıyor
```

### Yapılacaklar

**1. `ProblemShiftService` oluştur:**
```
Dosya: src/ai/services/problem-shift.service.ts
```

```typescript
async detectShift(messages: Message[]): Promise<{
  shifted: boolean
  confidence: number
}> {
  // Son 3 mesajı al (daha fazlası gereksiz)
  // GPT-4o-mini'ye gönder (düşük maliyet, hızlı)
  // System prompt:
  // "Aşağıdaki destek konuşmasının son 3 mesajında kullanıcı teknik konuyu
  //  değiştirdi mi? Yalnızca JSON döndür, başka hiçbir şey yazma:
  //  { \"shifted\": true/false, \"confidence\": 0.0-1.0 }
  //  Konu değişimi örnekleri: şifre sorunundan network sorununa geçmek,
  //  kurulum hatasından lisans hatasına geçmek."
  // confidence >= 0.75 ise shifted = true kabul et
}
```

**2. Context temizleme kuralı:**
```typescript
if (shifted) {
  // Sadece son 1 mesajı tut
  // HotInfo'yu KORU (sistem bilgisi hâlâ geçerli)
  // Diagnosis'ı KORU (product mapping hâlâ geçerli)
  messages = [messages[messages.length - 1]]
}
```

**3. Shift detection logunu PostgreSQL'e yaz:**
```sql
-- Migration oluştur:
CREATE TABLE ai_shift_detections (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),
  confidence  FLOAT NOT NULL,
  was_shifted BOOLEAN NOT NULL,
  message_count_before INTEGER,
  message_count_after  INTEGER
);
```
Bu tablo ileride "shift detection ne kadar doğru çalışıyor?" sorusunu
gerçek veriyle cevaplamanı sağlar.

**4. AiCopilotService.generateDraft() içine ekle:**
```typescript
// generateDraft() başında:
const { shifted } = await this.problemShiftService.detectShift(messages)
if (shifted) {
  messages = [messages[messages.length - 1]]
}
// Sonrasında mevcut akış devam eder, hiçbir şey değişmez
```

**5. Unit testler:**
```
- Son 3 mesaj aynı konuda → shifted: false
- Mesaj 3'te konu değişiyor → shifted: true, confidence > 0.75
- detectShift: GPT yanıtı JSON parse başarısız → shifted: false döner, hata fırlatmaz
- generateDraft: shift tespit edilince messages[1] olur
- generateDraft: shift yok ise messages değişmez
- PostgreSQL log yazılıyor
```

**6. Phase bittikten sonra:**
```bash
git commit -m "feat: phase-2 — problem shift detection in AiCopilotService"
```

Bana şunu göster:
- Değişen/eklenen dosyalar
- Migration SQL
- Test sonuçları

---

## PHASE 3 — BULLMQ ASYNC ENTEGRASYONU

### Problem
`AiController → AiQueryService → AI çağrısı` direkt `await` ediliyor.
- LLM 40 sn cevap verirse HTTP bağlantısı timeout alır (502/504)
- 10 kullanıcı aynı anda bilet açarsa OpenAI rate limit kesin aşılır
- Hata olursa job kaybolur, retry mekanizması yok

### Hedef Akış
```
[Mevcut — Senkron]
POST /ai/query
  → AiQueryService.process() [40 sn bekler]
  → response (ya da timeout)

[Hedef — Asenkron]
POST /ai/query/async
  → job kuyruğa girer (ai-response-queue)
  → { jobId, status: 'queued' } anında döner (< 50ms)

GET /ai/status/:jobId
  → { status: 'queued' | 'processing' | 'completed' | 'failed', result? }

GET /ai/stream/:jobId  [SSE — opsiyonel]
  → Gerçek zamanlı güncelleme
```

### Yapılacaklar

**1. Paketleri kur:**
```bash
npm install @nestjs/bullmq bullmq
```

**2. `AiQueueModule` oluştur:**
```
Dosya: src/ai/queues/ai-queue.module.ts
```
```typescript
BullModule.registerQueue({
  name: 'ai-response-queue',
  defaultJobOptions: {
    attempts: 3,                    // 3 deneme
    backoff: { type: 'exponential', delay: 2000 },  // 2s, 4s, 8s
    removeOnComplete: 100,          // Son 100 başarılı job'u tut
    removeOnFail: 50,               // Son 50 başarısız job'u tut
  },
  limiter: {
    max: 50,                        // Dakikada max 50 job
    duration: 60000,                // (OpenAI rate limit koruması)
  },
})
```

**3. `AiResponseProcessor` oluştur:**
```
Dosya: src/ai/processors/ai-response.processor.ts
```
```typescript
@Processor('ai-response-queue', { concurrency: 5 })
export class AiResponseProcessor {
  // Mevcut AiQueryService.process() mantığını buraya taşı
  // Her adımı (diagnosis, retrieval, generation) ayrı try/catch ile sar
  // Job tamamlandığında sonucu PostgreSQL'e yaz
  // Job progress update et: 'diagnosing' | 'retrieving' | 'generating'
}
```

**4. `AiController`'a yeni endpoint ekle:**
```typescript
// MEVCUT /ai/query endpoint'ine DOKUNMA — sil değil, koru
// Yeni endpoint ekle:

POST /ai/query/async
  → job kuyruğa girer
  → { jobId: string, status: 'queued', estimatedWait: number } döner

GET /ai/status/:jobId
  → Bull queue'dan job'u sorgula
  → { status, progress, result?, error? } döner

GET /ai/stream/:jobId  [SSE]
  → EventEmitter ile job event'lerini stream et
  → data: { status: 'processing', step: 'retrieving' }
  → data: { status: 'completed', result: {...} }
```

**5. Job payload formatı:**
```typescript
interface AiJobPayload {
  ticketId: number
  userId: number
  query: string
  hotinfo?: object
  attachmentTexts?: string[]   // Phase 1'den gelen parse edilmiş metinler
  messages?: Message[]         // Phase 2'den gelen temizlenmiş history
  productId?: number
  timestamp: string
}
```

**6. Geçiş stratejisi:**
```
Eski endpoint (/ai/query)       → Senkron, dokunulmaz, hâlâ çalışır
Yeni endpoint (/ai/query/async) → Asenkron, yeni bilet akışı buraya geçer

Frontend geçişi:
1. Önce /ai/query/async'i entegre et
2. Polling ile test et (GET /ai/status/:jobId her 2 saniyede)
3. Stabil olduktan sonra SSE'ye geç
4. Her ikisi stabil olduktan sonra eski endpoint'i deprecated işaretle
```

**7. Integration testler:**
```
- POST /ai/query/async → jobId döner (< 100ms)
- GET /ai/status/:jobId → 'queued' döner
- Job işlenir → status 'completed' olur
- Job başarısız → 3 retry sonra 'failed' olur
- 10 paralel job → concurrency 5 korunur (6. job bekler)
- Rate limit testi: 51. job dakika dolana kadar bekler
```

**8. Phase bittikten sonra:**
```bash
git commit -m "feat: phase-3 — BullMQ async AI processing with SSE"
```

Bana şunu göster:
- Değişen/eklenen dosyalar
- Yeni .env değişkenleri
- Test sonuçları

---

## GENEL KURALLAR (Tüm phase'ler için)

```
1. Her phase bitmeden bir sonrakine geçme
2. Mevcut çalışan testleri kırma — tüm testler her phase sonunda green olmalı
3. Yeni her servis NestJS module'üne inject edilmeli
4. Yeni environment variable için .env.example'a örnek ekle
5. TypeScript strict mode — any kullanma
6. Her kritik işlemi try/catch ile sar, pipeline asla durmamalı
7. Her phase sonunda git commit at (format: feat: phase-X — açıklama)
```

---

## PHASE TAMAMLANMA KRİTERLERİ

Her phase sonunda bana şunları göster:

| Kontrol | Beklenen |
|---|---|
| Değişen dosyalar | Liste |
| Yeni npm paketleri | Varsa |
| Yeni .env değişkenleri | Varsa |
| Migration SQL | Varsa |
| Test sonuçları | Tümü green |
| Git commit hash | Göster |

---

**PHASE 0 ile başla. Git commit hash'ini aldıktan sonra PHASE 1'e geç.**
