# Design Document: RAG & FAQ İyileştirmeleri

## Overview

Bu tasarım, mevcut RAG (Retrieval-Augmented Generation) ve Self-Learning FAQ sisteminde tespit edilen 5 mimari sorunu gidermek için teknik çözümleri tanımlar.

**Sorunlar ve Çözümler:**

1. `PromptContextBuilderService.buildContext()` metodunda `kbContent` parametresi `_kbContent` olarak ignore edilmektedir — context'e dahil edilecek.
2. `FaqService.processPatterns()` yalnızca exact string match ile duplicate kontrolü yapmaktadır — embedding tabanlı semantik deduplication eklenecek.
3. `AiQueryService.streamQuery()` metodunda `LOW_CONFIDENCE_THRESHOLD` kontrolü yoktur — `query()` metoduyla tutarlı hale getirilecek.
4. `EmbeddingService.search()` KnowledgePool aramasında yalnızca parent chunk'ları aramaktadır — child → parent retrieval pattern'i uygulanacak.
5. `ticket.kb_summarize` event'ine hem `AiAutoResolverService` hem `FaqService` subscribe olmakta ve her ikisi de FAQ oluşturabilmektedir — sorumluluklar netleştirilecek.

**Teknoloji Yığını:**
- NestJS (TypeScript) — backend framework
- Prisma ORM + PostgreSQL + pgvector — veritabanı ve vektör arama
- BullMQ — asenkron queue işleme
- OpenAI / Gemini embedding API — vektör üretimi

---

## Architecture

### Mevcut Mimari (Sorunlu Noktalar)

```mermaid
graph TD
    A[User Query] --> B[AiQueryService.query()]
    B --> C[EmbeddingService.search()]
    C --> D{KnowledgePool Search}
    D -->|parent filter only| E[Parent Chunks Only]
    B --> F[PromptContextBuilderService]
    F -->|kbContent ignored| G[Incomplete Context]
    G --> H[LLM]

    I[ticket.kb_summarize] --> J[AiAutoResolverService]
    I --> K[FaqService]
    J -->|creates FAQ| L[(faq_entries)]
    K -->|also creates FAQ| L
    L -->|duplicate risk| M[Duplicate FAQs]

    N[streamQuery()] -->|no threshold check| O[LLM called always]
```

### Hedef Mimari

```mermaid
graph TD
    A[User Query] --> B[AiQueryService.query() / streamQuery()]
    B --> C[EmbeddingService.search()]
    C --> D{KnowledgePool Search}
    D -->|child search + parent fetch| E[Parent Context Returned]
    B -->|topScore check| F{LOW_CONFIDENCE_THRESHOLD}
    F -->|below threshold| G[Early Return: suggestTicket]
    F -->|above threshold| H[PromptContextBuilderService]
    H -->|kbContent included| I[Full Context with KB]
    I --> J[LLM]

    K[ticket.kb_summarize] --> L[AiAutoResolverService]
    K --> M[FaqService]
    L -->|only indexTicket + knowledgeBaseAdded| N[(ticket_embeddings)]
    M -->|queue + dedup check| O[kb-summarizer Queue]
    O -->|semantic dedup| P{Duplicate?}
    P -->|yes| Q[increment frequency]
    P -->|no| R[(faq_entries)]
```

---

## Components and Interfaces

### 1. PromptContextBuilderService

**Değişiklik:** `buildContext()` metodunda `kbContent` artık context'e `[APPROVED KNOWLEDGE SOURCE]` başlığı altında dahil edilecek ve diğer bölümlerden önce konumlandırılacak.

```typescript
// Mevcut (sorunlu)
const { userId, userQuery, kbContent: _kbContent } = options; // ignored

// Hedef
async buildContext(options: ContextOptions): Promise<string> {
    const { userId, userQuery, kbContent } = options;
    let context = '';

    // KB içeriği EN BAŞA eklenir (LLM için en kritik bölüm)
    if (kbContent && kbContent.trim()) {
        context += `[APPROVED KNOWLEDGE SOURCE]\n${kbContent}\n\n`;
    }
    // ... diğer bölümler
}
```

**Interface değişikliği yok** — `ContextOptions.kbContent` zaten tanımlı, sadece kullanımı düzeltilecek.

### 2. AiQueryService

**streamQuery() değişikliği:** `query()` metodundaki `LOW_CONFIDENCE_THRESHOLD` kontrolü `streamQuery()`'ye de eklenecek.

```typescript
async *streamQuery(userQuery: string, userId?: string | null): AsyncGenerator<any, void, unknown> {
    // ...
    const searchResponse = await this.embeddingService.search(userQuery, 5, null, isStaff);
    const results = searchResponse.results;

    // YENİ: LOW_CONFIDENCE_THRESHOLD kontrolü
    const LOW_CONFIDENCE_THRESHOLD = parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD || '0.72');
    if (searchResponse.diagnostics.topScore < LOW_CONFIDENCE_THRESHOLD || results.length === 0) {
        yield { chunk: 'No reliable source found. Please create a support ticket.' };
        // interaction kaydı: autoAnswered: false, confidenceBand: null
        yield { done: true, suggestTicket: true };
        return;
    }
    // ...
}
```

### 3. EmbeddingService

**indexPoolContent() değişikliği:** Tek chunk yerine hierarchical chunking kullanacak, `parent_id` ilişkisi kurulacak.

**search() değişikliği:** KnowledgePool sorgusunda `metadata->>'type' = 'parent'` filtresi kaldırılacak, child → parent JOIN eklenecek.

```typescript
// Hedef SQL pattern (KnowledgePool bölümü)
SELECT 
    ks.id AS article_id,
    ...
    COALESCE(parent_kpe.content, kpe.content) AS content,  -- parent context
    1 - (kpe.embedding <=> ${vectorStr}::vector) AS similarity,
    ...
FROM knowledge_pool_embeddings kpe
JOIN knowledge_sources ks ON kpe.source_id = ks.id
LEFT JOIN knowledge_pool_embeddings parent_kpe ON kpe.parent_id = parent_kpe.id
WHERE ks.status = 'ACTIVE'
  AND kpe.parent_id IS NOT NULL  -- child chunk'lar üzerinde ara
  AND 1 - (kpe.embedding <=> ${vectorStr}::vector) > ${this.SIMILARITY_THRESHOLD}
```

### 4. FaqService

**processPatterns() değişikliği:** Exact match yerine semantik deduplication pipeline.

```typescript
// Yeni interface
interface SemanticDedupResult {
    isDuplicate: boolean;
    existingId?: string;
}

// processPatterns() içinde
private async checkSemanticDuplicate(question: string): Promise<SemanticDedupResult> {
    const threshold = parseFloat(process.env.FAQ_SEMANTIC_DEDUP_THRESHOLD || '0.90');
    const embedding = await this.embeddingService.embedText(question);
    // pgvector ile mevcut faq_entries karşılaştırması
    // ...
}
```

**handleTicketKbSummarize() değişikliği:** `ticket.knowledgeBaseAdded` kontrolü eklenecek.

### 5. AiAutoResolverService

**handleTicketSummarize() değişikliği:** `faqEntry.create()` kaldırılacak, yalnızca `indexTicket()` ve `knowledgeBaseAdded` güncellemesi kalacak.

---

## Data Models

### Schema Değişiklikleri

#### 1. `knowledge_pool_embeddings` — `parent_id` kolonu eklenmesi

Mevcut `KnowledgePoolEmbedding` modeli `parent_id` alanına sahip değil. Hierarchical chunking için bu alan gerekli.

```prisma
model KnowledgePoolEmbedding {
  id        String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sourceId  String                @map("source_id") @db.Uuid
  parentId  String?               @map("parent_id") @db.Uuid          // YENİ
  embedding Unsupported("vector")
  content   String
  metadata  Json?
  modelName String                @map("model_name") @db.VarChar(100)
  createdAt DateTime              @default(now()) @map("created_at")
  source    KnowledgeSource       @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  parent    KnowledgePoolEmbedding?  @relation("PoolEmbeddingHierarchy", fields: [parentId], references: [id])  // YENİ
  children  KnowledgePoolEmbedding[] @relation("PoolEmbeddingHierarchy")  // YENİ

  @@index([sourceId], map: "idx_kpe_source")
  @@index([parentId], map: "idx_kpe_parent")  // YENİ
  @@map("knowledge_pool_embeddings")
}
```

**Migration:** `ALTER TABLE knowledge_pool_embeddings ADD COLUMN parent_id UUID REFERENCES knowledge_pool_embeddings(id);`

#### 2. `faq_entries` — `embedding` kolonu eklenmesi

Semantik deduplication için FAQ sorularının embedding'lerinin saklanması gerekiyor.

```prisma
model FaqEntry {
  // ... mevcut alanlar ...
  questionEmbedding Unsupported("vector")?  @map("question_embedding")  // YENİ
}
```

**Migration:** `ALTER TABLE faq_entries ADD COLUMN question_embedding vector;`

#### 3. Mevcut modeller — değişiklik yok

- `knowledge_embeddings` — zaten `parent_id` var
- `ticket_embeddings` — değişiklik yok
- `ai_interactions` — değişiklik yok

### Veri Akışı

```
indexPoolContent(sourceId, content):
  hierarchicalChunk(content) → [{parent, children[]}]
  for each hierarchy:
    INSERT parent → knowledge_pool_embeddings (parent_id = NULL)
    for each child:
      INSERT child → knowledge_pool_embeddings (parent_id = parent.id)

search(query):
  embed(query) → vector
  SELECT child chunks WHERE similarity > threshold
  JOIN parent ON child.parent_id = parent.id
  RETURN parent.content (or child.content if no parent)
```

---

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: kbContent Context Dahil Edilmesi

*For any* non-empty `kbContent` string, `buildContext()` çıktısı hem `[APPROVED KNOWLEDGE SOURCE]` başlığını hem de `kbContent` değerini içermeli; bu bölüm context string'inin başında yer almalıdır.

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: Semantik Deduplication Pipeline

*For any* yeni FAQ adayı sorusu ve mevcut `faq_entries` kümesi için, eğer yeni sorunun herhangi bir mevcut PUBLISHED veya PENDING_REVIEW entry'siyle kosinüs benzerliği `FAQ_SEMANTIC_DEDUP_THRESHOLD` (varsayılan 0.90) değerine eşit veya üzerindeyse, yeni bir `faq_entries` kaydı oluşturulmamalıdır.

**Validates: Requirements 2.1, 2.2, 2.5, 5.6**

### Property 3: Duplicate Tespitinde Frequency Artışı

*For any* semantik duplicate olarak tespit edilen FAQ adayı için, mevcut entry'nin `frequency` sayacı 1 artırılmalı ve toplam `faq_entries` sayısı değişmemelidir.

**Validates: Requirements 2.3**

### Property 4: Deduplication Threshold Konfigürasyonu

*For any* `FAQ_SEMANTIC_DEDUP_THRESHOLD` environment variable değeri için, `processPatterns()` bu değeri eşik olarak kullanmalıdır; değer tanımlı değilse 0.90 kullanılmalıdır.

**Validates: Requirements 2.6**

### Property 5: streamQuery Erken Sonlandırma

*For any* `topScore < LOW_CONFIDENCE_THRESHOLD` (0.72) veya boş sonuç durumunda, `streamQuery()` LLM'e çağrı yapmadan `{ chunk: '...' }` ve `{ done: true, suggestTicket: true }` yield etmeli; oluşturulan `aiInteraction` kaydında `autoAnswered: false` ve `confidenceBand: null` olmalıdır.

**Validates: Requirements 3.1, 3.3, 3.4, 3.5**

### Property 6: query() ve streamQuery() Threshold Tutarlılığı

*For any* `topScore` değeri için, `query()` ve `streamQuery()` metodları aynı `LOW_CONFIDENCE_THRESHOLD` değerini kullanarak aynı erken sonlandırma kararını vermelidir.

**Validates: Requirements 3.2**

### Property 7: KnowledgePool Child → Parent Retrieval

*For any* arama sorgusu için, `EmbeddingService.search()` KnowledgePool sonuçlarında child chunk'ın eşleştiği parent chunk'ın `content` değerini döndürmelidir; parent_id NULL ise child'ın kendi content'i döndürülmelidir.

**Validates: Requirements 4.1, 4.2, 4.4, 4.5**

### Property 8: indexPoolContent Hierarchical Chunking

*For any* içerik string'i için, `indexPoolContent()` çağrısı sonrasında `knowledge_pool_embeddings` tablosunda hem `parent_id = NULL` olan parent kayıtlar hem de `parent_id` dolu child kayıtlar oluşturulmalıdır; her child'ın `parent_id`'si geçerli bir parent kaydına işaret etmelidir.

**Validates: Requirements 4.3**

### Property 9: AiAutoResolverService FAQ Oluşturmamalı

*For any* `ticket.kb_summarize` event'i için, `AiAutoResolverService.handleTicketSummarize()` yalnızca `EmbeddingService.indexTicket()` ve `ticket.knowledgeBaseAdded = true` güncellemesini yapmalı; `faqEntry.create()` çağrısı içermemelidir.

**Validates: Requirements 5.1, 5.3**

### Property 10: KB Summarize Idempotency

*For any* ticket için, `ticket.kb_summarize` event'i birden fazla kez yayımlansa bile `FaqService` yalnızca bir kez queue'ya ekleme yapmalı (`ticket.knowledgeBaseAdded` kontrolü) ve queue processor aynı `sourceId` için yalnızca bir `faq_entries` kaydı oluşturmalıdır.

**Validates: Requirements 5.4, 5.5**

---

## Error Handling

### 1. PromptContextBuilderService

- `kbContent` boş string veya whitespace-only ise `[APPROVED KNOWLEDGE SOURCE]` bölümü context'e eklenmez — LLM gereksiz boş bölüm görmez.
- `userId` bulunamazsa kullanıcı profili bölümü atlanır, diğer bölümler oluşturulmaya devam eder.

### 2. AiQueryService.streamQuery()

- `embeddingService.search()` hata fırlatırsa generator `{ chunk: 'Service temporarily unavailable.' }` ve `{ done: true, suggestTicket: true }` yield eder.
- `LOW_CONFIDENCE_THRESHOLD` parse hatası durumunda varsayılan 0.72 kullanılır.
- Erken sonlandırma durumunda `aiInteraction` kaydı oluşturulur (audit trail korunur).

### 3. EmbeddingService.indexPoolContent()

- `hierarchicalChunk()` boş array döndürürse (boş içerik) indexleme atlanır, hata fırlatılmaz.
- Embedding API hatası durumunda o chunk atlanır, diğer chunk'lar işlenmeye devam eder (mevcut `indexArticle()` davranışıyla tutarlı).
- `parent_id` referansı geçersizse (race condition) child kaydı `parent_id = NULL` ile oluşturulur.

### 4. FaqService Semantik Deduplication

- `EmbeddingService.embedText()` hata fırlatırsa semantik kontrol atlanır ve exact match fallback'e düşülür — duplicate oluşma riski kabul edilir, pipeline durdurulamaz.
- `FAQ_SEMANTIC_DEDUP_THRESHOLD` geçersiz değer içeriyorsa (NaN) varsayılan 0.90 kullanılır.
- pgvector sorgusu hata fırlatırsa `isDuplicate: false` döndürülür (güvenli taraf: duplicate oluşabilir ama pipeline durmuyor).

### 5. AiAutoResolverService

- `handleTicketSummarize()` içinde `indexTicket()` hata fırlatırsa `knowledgeBaseAdded` güncellenmez — event yeniden işlenebilir.
- `faqEntry.create()` kodu kaldırıldıktan sonra bu handler'da FAQ oluşturma hatası riski ortadan kalkar.

### 6. FaqService Queue Processor

- `ticket.knowledgeBaseAdded = true` olan ticket'lar için queue'ya ekleme yapılmaz — idempotency sağlanır.
- Queue processor `sourceId` kontrolü başarısız olursa (DB hatası) job retry mekanizması devreye girer (BullMQ `attempts: 3`).

---

## Testing Strategy

### Dual Testing Approach

Her gereksinim hem unit/example testleri hem de property-based testlerle doğrulanır.

**Unit testler:** Spesifik örnekler, edge case'ler ve entegrasyon noktaları.
**Property testler:** Tüm geçerli girdiler üzerinde evrensel özelliklerin doğrulanması.

### Property-Based Testing Kütüphanesi

TypeScript/NestJS için **fast-check** kullanılacak.

```bash
npm install --save-dev fast-check
```

Her property testi minimum **100 iterasyon** çalıştırılacak şekilde konfigüre edilecek.

### Property Test Etiket Formatı

```typescript
// Feature: rag-faq-improvements, Property {N}: {property_text}
```

### Property Testleri

**Property 1 — kbContent Context Dahil Edilmesi**
```typescript
// Feature: rag-faq-improvements, Property 1: kbContent context dahil edilmesi
it('buildContext kbContent içerdiğinde [APPROVED KNOWLEDGE SOURCE] başlığını context başına ekler', async () => {
    await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        async (kbContent) => {
            const result = await service.buildContext({ userQuery: 'test', kbContent });
            expect(result.startsWith('[APPROVED KNOWLEDGE SOURCE]')).toBe(true);
            expect(result).toContain(kbContent);
        }
    ), { numRuns: 100 });
});
```

**Property 2 — Semantik Deduplication**
```typescript
// Feature: rag-faq-improvements, Property 2: semantik deduplication pipeline
it('benzerlik >= threshold olan sorular için yeni faq_entry oluşturulmaz', async () => {
    await fc.assert(fc.asyncProperty(
        fc.record({ question: fc.string({ minLength: 5 }), answer: fc.string({ minLength: 5 }) }),
        async (pattern) => {
            // Mock: embeddingService.embedText returns high similarity
            mockEmbeddingService.cosineSimilarity.mockReturnValue(0.95);
            const before = await prisma.faqEntry.count();
            await service.processPatterns([{ ...pattern, confidenceScore: 0.9, sourceType: 'ticket', sourceId: 'id', tags: [], language: 'tr' }]);
            const after = await prisma.faqEntry.count();
            expect(after).toBe(before); // no new entry
        }
    ), { numRuns: 100 });
});
```

**Property 5 — streamQuery Erken Sonlandırma**
```typescript
// Feature: rag-faq-improvements, Property 5: streamQuery erken sonlandırma
it('topScore < LOW_CONFIDENCE_THRESHOLD olduğunda LLM çağrısı yapılmaz', async () => {
    await fc.assert(fc.asyncProperty(
        fc.float({ min: 0, max: 0.719 }),
        async (topScore) => {
            mockEmbeddingService.search.mockResolvedValue({ results: [], diagnostics: { topScore } });
            const chunks = [];
            for await (const chunk of service.streamQuery('test query')) {
                chunks.push(chunk);
            }
            expect(mockAiService.streamReformat).not.toHaveBeenCalled();
            expect(chunks.some(c => c.done && c.suggestTicket)).toBe(true);
        }
    ), { numRuns: 100 });
});
```

**Property 8 — indexPoolContent Hierarchical Chunking**
```typescript
// Feature: rag-faq-improvements, Property 8: indexPoolContent hierarchical chunking
it('indexPoolContent sonrasında her child kaydının geçerli bir parent_id değeri vardır', async () => {
    await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 200 }),
        async (content) => {
            await service.indexPoolContent('source-id', content);
            const children = await prisma.$queryRaw`
                SELECT * FROM knowledge_pool_embeddings WHERE parent_id IS NOT NULL AND source_id = 'source-id'
            `;
            for (const child of children) {
                const parent = await prisma.$queryRaw`
                    SELECT id FROM knowledge_pool_embeddings WHERE id = ${child.parent_id}
                `;
                expect(parent.length).toBe(1);
            }
        }
    ), { numRuns: 100 });
});
```

**Property 10 — KB Summarize Idempotency**
```typescript
// Feature: rag-faq-improvements, Property 10: KB summarize idempotency
it('aynı ticket için event birden fazla kez geldiğinde yalnızca bir faq_entry oluşturulur', async () => {
    await fc.assert(fc.asyncProperty(
        fc.record({ id: fc.uuid(), ticketNumber: fc.string(), satisfactionScore: fc.integer({ min: 4, max: 5 }) }),
        async (ticket) => {
            await service.handleTicketKbSummarize(ticket);
            await service.handleTicketKbSummarize(ticket); // second time
            const count = await prisma.faqEntry.count({ where: { sourceTypes: { has: ticket.id } } });
            expect(count).toBeLessThanOrEqual(1);
        }
    ), { numRuns: 100 });
});
```

### Unit Testler

**PromptContextBuilderService:**
- `kbContent` boş string olduğunda `[APPROVED KNOWLEDGE SOURCE]` bölümü eklenmez
- `kbContent` whitespace-only olduğunda bölüm eklenmez
- `userId` null olduğunda kullanıcı profili bölümü atlanır

**AiQueryService:**
- `query()` metodunun `promptContextBuilder.buildContext()` çağırdığı doğrulanır (mock)
- `streamQuery()` metodunun `promptContextBuilder.buildContext()` çağırdığı doğrulanır (mock)
- `streamQuery()` `results.length === 0` durumunda erken sonlandırır

**EmbeddingService:**
- `indexPoolContent()` boş içerik için hiçbir kayıt oluşturmaz
- `search()` parent_id NULL olan child için child content döndürür (fallback)

**AiAutoResolverService:**
- `handleTicketSummarize()` içinde `prisma.faqEntry.create` çağrılmaz (mock doğrulaması)
- `handleTicketSummarize()` `knowledgeBaseAdded: true` olan ticket'lar için `indexTicket()` çağırmaz

**FaqService:**
- `handleTicketKbSummarize()` `knowledgeBaseAdded: true` olan ticket için queue'ya ekleme yapmaz
- Queue processor aynı `sourceId` için ikinci çalışmada yeni kayıt oluşturmaz
