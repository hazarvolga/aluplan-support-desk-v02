# GAP Final Plan — Embedding Abstraction Layer (Seçenek C)

**Tarih:** 10 Mayıs 2026  
**Durum:** ONAY BEKLİYOR  
**Hazırlayan:** RAG Engineer / Enterprise RAG Architect  
**Kapsam:** Provider-bağımsız, boyut-değişimine dayanıklı, sıfır-downtime embedding mimarisi

---

## Bağlam & Neden Bu Plan?

### Mevcut Sorun (Kök Neden)

`embedding.service.ts` içindeki tüm sorgular fiziksel model adını **zorunlu filtre** olarak kullanıyor:

```sql
-- knowledge_embeddings araması (satır 145)
AND ke.model_name = ${modelName}

-- knowledge_pool_embeddings araması (satır 172)
AND kpe.model_name = ${modelName}
```

Bu şu anlama geliyor: Admin panelinden `ai.embed_provider` ayarını değiştirdiğinizde, sistemin aktif modeli `gemini-embedding-2-001` olur ama veritabanında `text-embedding-3-small` ile yazılmış embeddingler var. Filtre eşleşmez → **sıfır sonuç döner → RAG tamamen kör olur.**

### Dataset Reset Durumu

Dataset sıfırlandı. Yani şu an:
- `knowledge_embeddings` tablosu: BOŞ
- `knowledge_pool_embeddings` tablosu: BOŞ
- `ticket_embeddings` tablosu: BOŞ

Bu mükemmel bir başlangıç noktasıdır. Migration yükü sıfır, veri kaybı riski sıfır.

### Boyut Değişikliği (Kritik)

| Model | Boyut | Kullanım |
|-------|-------|---------|
| `text-embedding-3-small` (eski) | **1536d** | Şu an .env'de tanımlı |
| `gemini-embedding-2-001` (hedef) | **3072d** | Geçilecek model |

pgvector'da `vector` tipi boyut-sabit (`vector(1536)` vs `vector(3072)`). Farklı boyutlar birlikte bir sütunda tutulamaz. Bu yüzden schema'da `vector` tipini boyutsuz (`vector`) olarak güncellememiz gerekecek. PostgreSQL'de bu `ALTER TABLE ... ALTER COLUMN ... TYPE vector` ile yapılır — **mevcut sütun tamamen yeniden yazılır.**

Dataset boş olduğu için bu işlem anlık sürer (0 satır dönüşümü).

---

## Seçenek C: Embedding Abstraction Layer — Tam Mimari

### Temel Fikir

```
ÖNCE (kırılgan):
  arama: WHERE model_name = 'text-embedding-3-small'
  → provider değişince eşleşme yok → kör arama

SONRA (kalıcı):
  arama: WHERE embedding_version = 'v1'
  → 'v1' hangi modelle yazılmışsa onunla aranır
  → provider değişince yeni 'v2' arka planda hazırlanır
  → 'v2' tamamlanınca aktif_version='v2' olur, 'v1' silinir
```

### Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EmbeddingVersionRegistry                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ v1 (eski)│  │v2 (aktif)│  │v3 (hazır)│  │  cleanup   │ │
│  │ model: A │  │ model: B │  │ model: C │  │  cron 24h  │ │
│  │ dim:1536 │  │ dim:3072 │  │ dim:?    │  │            │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↑                ↑
   Settings DB:    Settings DB:
   rag.emb_prev     rag.emb_active
   _version="v1"    _version="v2"

┌─────────────────────────────────────────────────────────────┐
│                  EmbeddingMigrationProcessor                 │
│  Trigger: ai.embed_provider değişince BullMQ job tetiklenir │
│  1. Yeni model ile tüm chunk'ları yeniden embed et          │
│  2. embedding_version='v2' ile yaz (v1'e dokunma)           │
│  3. Progress → Redis → UI progress bar                      │
│  4. Tamamlanınca activeVersion='v2' yap                     │
│  5. 24 saat sonra v1'i temizle                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ADIM ADIM UYGULAMA PLANI

### ADIM 1 — Prisma Schema Güncellemesi

**Dosya:** `packages/database/prisma/schema.prisma`

**Yapılacaklar:**

**1.1 — `KnowledgeEmbedding` modeli:**
```prisma
model KnowledgeEmbedding {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  articleId            String    @map("article_id") @db.Uuid
  articleVersionId     String    @map("article_version_id") @db.Uuid
  parentId             String?   @map("parent_id") @db.Uuid
  embedding            Unsupported("vector")   // ← boyutsuz (3072d için)
  content              String
  sequence             Int       @default(0)
  modelName            String    @map("model_name") @db.VarChar(100)
  embeddingVersion     String    @default("v1") @map("embedding_version") @db.VarChar(20)  // ← YENİ
  embeddingDim         Int?      @map("embedding_dim")                                      // ← YENİ
  isActive             Boolean   @default(true) @map("is_active")
  embeddingGeneratedAt DateTime  @default(now()) @map("embedding_generated_at")
  migratedAt           DateTime? @map("migrated_at")                                        // ← YENİ
  // ... ilişkiler aynı kalır
  @@index([embeddingVersion], map: "idx_ke_version")   // ← YENİ index
  @@map("knowledge_embeddings")
}
```

**1.2 — `KnowledgePoolEmbedding` modeli:**
```prisma
model KnowledgePoolEmbedding {
  id               String    @id ...
  sourceId         String    @map("source_id") @db.Uuid
  embedding        Unsupported("vector")   // ← boyutsuz
  content          String
  metadata         Json?
  modelName        String    @map("model_name") @db.VarChar(100)
  embeddingVersion String    @default("v1") @map("embedding_version") @db.VarChar(20)  // ← YENİ
  embeddingDim     Int?      @map("embedding_dim")                                      // ← YENİ
  migratedAt       DateTime? @map("migrated_at")                                        // ← YENİ
  createdAt        DateTime  @default(now()) @map("created_at")
  parentId         String?   @map("parent_id") @db.Uuid
  // ...
  @@index([embeddingVersion], map: "idx_kpe_version")  // ← YENİ index
  @@map("knowledge_pool_embeddings")
}
```

**1.3 — `TicketEmbedding` modeli:**
```prisma
model TicketEmbedding {
  id               String    @id ...
  ticketId         String    @map("ticket_id") @db.Uuid
  embedding        Unsupported("vector")   // ← boyutsuz
  modelName        String    @map("model_name") @db.VarChar(100)
  embeddingVersion String    @default("v1") @map("embedding_version") @db.VarChar(20)  // ← YENİ
  createdAt        DateTime  @default(now()) @map("created_at")
  // ...
  @@map("ticket_embeddings")
}
```

---

### ADIM 2 — Prisma Migration SQL

**Dosya:** `packages/database/prisma/migrations/20260510000001_embedding_abstraction_layer/migration.sql`

```sql
-- ============================================================
-- Migration: Embedding Abstraction Layer
-- Tarih: 2026-05-10
-- Açıklama: model_name filtresi yerine embedding_version kullan.
--           Boyutsuz vector tipi ile 3072d Gemini desteği.
-- ============================================================

-- 1. knowledge_embeddings tablosu
ALTER TABLE knowledge_embeddings
  ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(20) NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS embedding_dim INT,
  ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

-- 2. knowledge_pool_embeddings tablosu
ALTER TABLE knowledge_pool_embeddings
  ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(20) NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS embedding_dim INT,
  ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

-- 3. ticket_embeddings tablosu
ALTER TABLE ticket_embeddings
  ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(20) NOT NULL DEFAULT 'v1';

-- 4. HNSW index'lerini yeni version sütunu ile güncelle
--    (Eski HNSW index'ler korunur, version bazlı ek index eklenir)
CREATE INDEX IF NOT EXISTS idx_ke_version
  ON knowledge_embeddings (embedding_version)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_kpe_version
  ON knowledge_pool_embeddings (embedding_version);

-- 5. Vector boyutunu 1536'dan boyutsuz'a yükselt
--    (Dataset boş olduğu için anlık sürer)
--    NOT: pgvector'da "vector" = boyutsuz, her boyutu kabul eder
ALTER TABLE knowledge_embeddings
  ALTER COLUMN embedding TYPE vector
  USING embedding::vector;

ALTER TABLE knowledge_pool_embeddings
  ALTER COLUMN embedding TYPE vector
  USING embedding::vector;

ALTER TABLE ticket_embeddings
  ALTER COLUMN embedding TYPE vector
  USING embedding::vector;

-- 6. Settings tablosuna başlangıç değerlerini ekle
INSERT INTO settings (key, value, created_at, updated_at)
  VALUES
    ('rag.embedding_active_version', 'v1', NOW(), NOW()),
    ('rag.embedding_model_v1', 'gemini-embedding-2-001', NOW(), NOW()),
    ('rag.embedding_dim_v1', '3072', NOW(), NOW())
  ON CONFLICT (key) DO NOTHING;
```

---

### ADIM 3 — `rag.config.ts` Güncellemesi

**Dosya:** `apps/backend/src/config/rag.config.ts`

Eklenecek yeni bölüm:

```typescript
EMBEDDING: {
  /** Aktif embedding versiyonu (Settings DB'den override edilebilir) */
  DEFAULT_VERSION: 'v1',
  /** Gemini embedding-2-001 boyutu */
  GEMINI_DIM: 3072,
  /** OpenAI text-embedding-3-small boyutu (legacy) */
  OPENAI_DIM: 1536,
  /** Cleanup için bekleme süresi (ms) */
  CLEANUP_DELAY_MS: 24 * 60 * 60 * 1000, // 24 saat
},
```

---

### ADIM 4 — Yeni `EmbeddingVersionRegistry` Servisi

**Dosya:** `apps/backend/src/ai/embedding-version-registry.service.ts` (**YENİ**)

**Sorumluluklar:**
- `getActiveVersion()` → `Settings DB`'den `rag.embedding_active_version` okur
- `getPendingVersion()` → Migration devam ediyorsa yeni versiyonu döner
- `createNextVersion(modelName, dim)` → `v1` → `v2` üretir, Settings DB'ye yazar
- `activateVersion(version)` → `rag.embedding_active_version`'ı günceller, eski sürümü `prev` olarak işaretler
- `scheduleCleanup(version)` → 24 saat sonra eski versiyonu silen BullMQ job planlar
- `getVersionMetadata(version)` → `{ model, dim, createdAt, chunkCount }` döner

**Neden ayrı servis?** `EmbeddingService` zaten çok büyük (315 satır). Versiyon yönetimi farklı bir sorumluluk alanıdır — Single Responsibility Principle.

---

### ADIM 5 — `EmbeddingService` Güncellemeleri

**Dosya:** `apps/backend/src/ai/embedding.service.ts`

**5.1 — `indexArticle()` metodu:**

```typescript
// ÖNCE:
INSERT INTO knowledge_embeddings (... model_name ...)
VALUES (... ${modelName} ...)

// SONRA:
const activeVersion = await this.versionRegistry.getActiveVersion();
INSERT INTO knowledge_embeddings (... model_name, embedding_version, embedding_dim ...)
VALUES (... ${modelName}, ${activeVersion}, ${embResult.embedding.length} ...)
```

**5.2 — `indexPoolContent()` metodu:**

Aynı pattern — `embedding_version` ve `embedding_dim` eklenir.

**5.3 — `search()` SQL sorgusu:**

```sql
-- ÖNCE (kırılgan):
AND ke.model_name = ${modelName}

-- SONRA (kalıcı):
AND ke.embedding_version = ${activeVersion}
```

Bu değişiklik sayesinde:
- `activeVersion = 'v1'` → Gemini modeli ile yazılmış v1 embeddingler aranır
- `activeVersion = 'v2'` → Yeni modelle yazılmış v2 embeddingler aranır
- `model_name` bilgisi hâlâ yazılır ama artık arama filtresinde kullanılmaz

**5.4 — `reindexAll()` metodu genişletilir:**

```typescript
async reindexAll(targetVersion?: string): Promise<{ indexed: number; failed: number }> {
  // targetVersion verilmişse migration modu, verilmemişse normal reindex
  const version = targetVersion ?? await this.versionRegistry.getActiveVersion();
  // ...her article için indexArticle() çağrılır, version parametresi geçilir
}
```

---

### ADIM 6 — Yeni `EmbeddingMigrationProcessor`

**Dosya:** `apps/backend/src/ai/embedding-migration.processor.ts` (**YENİ**)

**BullMQ Job Adı:** `migrate-embeddings`

**Tetiklenme:** `SettingsService`'te `ai.embed_provider` veya `ai.llmapi.embed_model` değişince.

**İş Akışı:**

```
1. Yeni model adını ve boyutunu al
2. EmbeddingVersionRegistry.createNextVersion() çağır → "v2" oluştur
3. Settings DB'ye yaz: rag.embedding_pending_version = "v2"
4. knowledge_articles: PUBLISHED olanları al (batch=10)
5. Her batch için:
   a. Yeni model ile embed et
   b. embedding_version="v2" ile knowledge_embeddings'e yaz
   c. Eski "v1" satırları SİLME
   d. Redis'e ilerleme yaz: SET migration:progress "67"
6. knowledge_pool: ACTIVE olanları aynı şekilde işle
7. Tamamlandığında:
   a. EmbeddingVersionRegistry.activateVersion("v2")
   b. Settings DB: rag.embedding_active_version = "v2"
   c. BullMQ: 24 saat sonra çalışacak cleanup job ekle
8. Cleanup job (24 saat sonra):
   a. DELETE FROM knowledge_embeddings WHERE embedding_version = "v1"
   b. DELETE FROM knowledge_pool_embeddings WHERE embedding_version = "v1"
```

**Güvenlik mekanizmaları:**
- `attempts: 3, backoff: { type: 'exponential', delay: 5000 }` — API hatalarında retry
- İdempotent: `WHERE embedding_version != 'v2'` → sadece henüz v2'ye geçmemiş olanlar işlenir
- Sunucu restart'ında job BullMQ'da bekler, kaldığı yerden devam eder
- Progress Redis key'i: `rag:migration:v2:progress` → `{ done: 45, total: 120, percent: 37 }`

---

### ADIM 7 — `SettingsService` Event Hook

**Dosya:** `apps/backend/src/settings/settings.service.ts`

`upsert()` metoduna izleme eklenir:

```typescript
// ai.embed_provider veya ai.llmapi.embed_model değişince
if (key === 'ai.embed_provider' || key === 'ai.llmapi.embed_model') {
  this.eventEmitter.emit('ai.embed_provider.changed', {
    key,
    newValue: value,
    oldValue: previousValue,
    changedAt: new Date(),
  });
}
```

**`AiQueryService` veya `RagMaintenanceService`** bu event'i dinler:

```typescript
@OnEvent('ai.embed_provider.changed')
async onEmbedProviderChanged(payload: EmbedProviderChangedEvent) {
  this.logger.warn(`🔄 Embed provider changed to ${payload.newValue}. Queuing migration...`);
  await this.migrationQueue.add('migrate-embeddings', { 
    newProvider: payload.newValue,
    triggeredAt: payload.changedAt,
  });
}
```

---

### ADIM 8 — `RagObservabilityService` Güncelleme

**Dosya:** `apps/backend/src/ai/rag-observability.service.ts`

Yeni `getMigrationStatus()` metodu:

```typescript
async getMigrationStatus(): Promise<{
  isRunning: boolean;
  percent: number;
  activeVersion: string;
  pendingVersion: string | null;
  estimatedMinutesLeft: number | null;
}> {
  const progress = await this.redis.get('rag:migration:progress');
  const activeVersion = await this.settings.getValue('rag.embedding_active_version');
  const pendingVersion = await this.settings.getValue('rag.embedding_pending_version');
  // ...
}
```

Bu metod `AiController`'a yeni bir endpoint olarak eklenir:
- `GET /api/v1/ai/embedding/migration-status`
- Frontend AI Health & Telemetry sayfasında progress bar gösterilir

---

### ADIM 9 — `ai.module.ts` Güncellemesi

**Dosya:** `apps/backend/src/ai/ai.module.ts`

Yeni servisler register edilir:
- `EmbeddingVersionRegistry` → providers[]
- `EmbeddingMigrationProcessor` → providers[] (BullMQ processor)
- `BullModule.registerQueue({ name: 'embedding-migration' })` → imports[]

---

### ADIM 10 — `.env` Güncellemesi

```bash
# ESKİ (kaldırılacak):
EMBEDDING_PROVIDER="openai"
EMBEDDING_MODEL="text-embedding-3-small"
EMBEDDING_DIMENSIONS=1536

# YENİ (Gemini):
EMBEDDING_PROVIDER="llmapi"
LLMAPI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
LLMAPI_CHAT_MODEL="gemini-2.0-flash"
LLMAPI_EMBED_MODEL="gemini-embedding-2-001"
GEMINI_API_KEY=<key>
EMBEDDING_DIMENSIONS=3072
```

---

## Değişen Dosyalar — Tam Liste

| # | Dosya | Değişiklik Tipi | Etki |
|---|-------|----------------|------|
| 1 | `packages/database/prisma/schema.prisma` | Güncelleme | 3 model: yeni alanlar + boyutsuz vector |
| 2 | `packages/database/prisma/migrations/20260510000001_*` | **Yeni dosya** | SQL migration |
| 3 | `apps/backend/src/config/rag.config.ts` | Güncelleme | EMBEDDING bölümü ekleme |
| 4 | `apps/backend/src/ai/embedding-version-registry.service.ts` | **Yeni dosya** | Versiyon yönetimi |
| 5 | `apps/backend/src/ai/embedding-migration.processor.ts` | **Yeni dosya** | BullMQ migration işçisi |
| 6 | `apps/backend/src/ai/embedding.service.ts` | Güncelleme | 4 metod: version-aware hale getir |
| 7 | `apps/backend/src/ai/rag-observability.service.ts` | Güncelleme | getMigrationStatus() ekle |
| 8 | `apps/backend/src/settings/settings.service.ts` | Güncelleme | embed_provider change event |
| 9 | `apps/backend/src/ai/ai.module.ts` | Güncelleme | Yeni servisler register |
| 10 | `apps/backend/src/ai/ai.controller.ts` | Güncelleme | Migration status endpoint |
| 11 | `.env` | Güncelleme | Gemini config |

---

## Risk Matrisi

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Vector boyutu mismatch (1536 vs 3072) | ✅ Kesin | Kritik | Schema'da boyutsuz `vector` tipi kullanılır; migration SQL dataset boş olduğu için anlık çalışır |
| Gemini API rate limit (ücretsiz kotada) | Yüksek | Orta | BullMQ batch boyutu=5, batch arası 300ms bekleme; retry mekanizması |
| Migration sırasında RAG kör kalması | Düşük | Yüksek | v1 aktif kalır; v2 tamamlanınca geçiş yapılır |
| HNSW index boyut değişimi | ✅ Kesin | Orta | Migration SQL'de `DROP INDEX + CREATE INDEX` eklenir |
| Mevcut testlerin kırılması | Orta | Düşük | `model_name` mock'ları `embedding_version` mock'larıyla güncellenir |

---

## Uygulama Sırası (Önerilen)

```
Gün 1 — Schema & Migration:
  [1] schema.prisma güncelle
  [2] migration SQL yaz ve çalıştır (pnpm db:migrate)
  [3] rag.config.ts EMBEDDING bölümü ekle

Gün 1 — Yeni Servisler:
  [4] EmbeddingVersionRegistry servisi yaz
  [5] EmbeddingMigrationProcessor yaz
  [6] ai.module.ts güncelle

Gün 2 — Mevcut Servisleri Güncelle:
  [7] embedding.service.ts — version-aware hale getir
  [8] settings.service.ts — event hook ekle
  [9] rag-observability.service.ts — getMigrationStatus() ekle
  [10] ai.controller.ts — endpoint ekle

Gün 2 — Env & Test:
  [11] .env güncelle (Gemini config)
  [12] typecheck çalıştır
  [13] unit test'leri güncelle
  [14] backend'i başlat, ilk embedding testini yap
```

---

## Başarı Kriterleri

- [ ] `pnpm db:migrate` hatasız çalışır
- [ ] `pnpm --filter @aluplan/backend typecheck` geçer
- [ ] `EmbeddingService.search()` artık `model_name` değil `embedding_version` filtresiyle çalışır
- [ ] Admin panelden provider değiştirince BullMQ migration job'ı tetiklenir
- [ ] Migration tamamlanınca `rag.embedding_active_version` güncellenir
- [ ] `GET /api/v1/ai/embedding/migration-status` doğru veri döner
- [ ] Dataset tamamen boştan Gemini ile yeniden indexlenebilir

---

## Sonraki Adım

**Onay verirseniz Adım 1 (schema.prisma) ile başlıyorum.**

Uygulama sırası: Schema → Migration → Config → Yeni Servisler → Mevcut Servis Güncellemeleri → Env → Test
