# hemen şunu sormak istiyorum ben maliyetlerden biraz kaçınmak ve birazda dışa bağlımlı olmamak adına ollamayı defalut olarak kullandım ama ;rojedi admin istersen diğer aı providerları da kullanıbilir bu projede sence hangigi aı provider en iyi sonuçu verir senin biraz önce veriğin düzeltmeleri yaptıktan sonra önerin nedir

21:01

Değerlendirdi maliyet, bağımsızlık ve kalite dengesini
Değerlendirdi maliyet, bağımsızlık ve kalite dengesini


Çok yerinde bir soru. Önce durumu net koymak lazım, sonra öneri:

Mevcut Durumun Gerçeği
Projende iki ayrı AI görevi var ve bunlar farklı şeyler:

Görev	Mevcut	Sorun
Embedding (vektörleştirme)	nomic-embed-text (Ollama)	Türkçe zayıf → asıl sorun buradan
LLM (yanıt üretimi)	Llama 3.2 3B (Ollama)	Küçük model + büyük context → timeout
Bunları birbirinden bağımsız değiştirebilirsin. Ollama'da kalmak için bir neden varsa LLM tarafında kalabilirsin, ama embedding tarafında Ollama'da kalmak artık savunulamaz — Türkçe kalitesi için mutlaka değişmeli.

Embedding Tarafı — Net Öneri
multilingual-e5-large modelini Ollama'ya yükle.

bash
ollama pull jeffh/intfloat-multilingual-e5-large-instruct
Neden bu:

Ollama'da çalışır, dışa bağımlılık yok
100+ dil, Türkçe performansı nomic-embed-text'ten çok daha iyi
Ücretsiz, self-hosted
1024 boyutlu vektör — pgvector için ideal
Eğer bir gün bütçe açılırsa text-embedding-3-large (OpenAI) ile kıyasla — fark göreceksin ama şimdilik bu yeterli.

LLM Tarafı — Seçenekler
Burada dürüst olmak gerekiyor. Proje yapısın admin'in provider seçebildiğini söylüyor, bu iyi. Şu anki gerçeklik şu:

Seçenek 1: Ollama'da Kal ama Modeli Değiştir
Llama 3.2 3B çok küçük. En az 8B gerekiyor, tercihen Mistral 7B veya Llama 3.1 8B.

bash
ollama pull mistral        # 7B — Türkçe makul, hızlı
ollama pull llama3.1:8b    # 8B — daha iyi reasoning
Avantaj: Sıfır maliyet, tam kontrol
Dezavantaj: Hâlâ timeout riski var, donanıma bağlı. Ve 8B model bile karmaşık teknik sorularda yetersiz kalabilir.

Seçenek 2: Groq (Önerim)
Groq, açık kaynak modelleri (Llama, Mistral) bulutta inanılmaz hızlı çalıştırıyor. Ollama API'sine çok benzer interface — kod değişikliği minimal.

typescript
// Neredeyse aynı kod
baseURL: "https://api.groq.com/openai/v1"
model: "llama-3.3-70b-versatile"  // 70B ama Ollama hızında
Avantaj: Ücretsiz tier oldukça cömert (günde 14.400 istek), Llama 3.3 70B kalitesi, sıfır timeout
Dezavantaj: Yine de dışa bağımlı, ücretsiz tier rate-limit var

Seçenek 3: Claude API (Anthropic)
Support desk için en iyi LLM kalitesi. Uzun teknik context'leri en iyi o anlıyor, Türkçe output kalitesi en yüksek.

typescript
model: "claude-haiku-4-5"  // Hız + maliyet dengesi için
// veya
model: "claude-sonnet-4-6" // Kalite öncelikli için
```

Avantaj: Timeout yok, kalite fark edilir biçimde yüksek, Türkçe mükemmel  
Dezavantaj: Ücretli — ama Haiku çok ucuz (1M token ~$0.80)

---

### Seçenek 4: OpenAI
Güçlü ama en pahalı seçenek. Support desk için Claude veya Groq'tan belirgin üstünlüğü yok.

---

## Net Öneri

Bütçe kısıtın ve "dışa bağımlı olmama" önceliğin göz önünde alınınca şu stratejiyi öneririm:
```
Embedding  →  multilingual-e5-large (Ollama, ücretsiz, yerel)
LLM        →  Groq / Llama 3.3 70B (ücretsiz tier ile başla)
             + Admin panelinde Claude Haiku'yu opsiyonel tut
               (sadece VIP müşteriler veya kompleks ticketlar için)
Yani hybrid: rutin sorular Groq'ta ücretsiz çözülür, sistem "LOW confidence" döndürdüğünde veya premium müşteri varsa Claude'a eskalasyon. Bu hem maliyet hem kalite dengesini optimize eder.





# şimdi RAG ve AI yanıt yapımızı geliştirmeni istiyorum biradan vereceğim komutları şuna dikkat ederek ele almalısın: Yapısını kısaca özetleyeyim:# 
7 ayrı değişiklik bloğu var, her biri // BEFORE → // AFTER kod örnekleriyle net şekilde anlatılmış. Cursor veya Claude Code'a ilgili kaynak dosyalarıyla birlikte verdiğinde hangi satırı nasıl değiştireceğini tam olarak anlayacak.
# Kritik noktalar şunlar:
CHANGE 1 
embedding modelini değiştiriyor ve bunu env variable'a bağlıyor. 
 CHANGE 6 
bunun zorunlu sonucu olan re-index script — eski model vektörleri yeni modelle karışırsa sistem tamamen bozulur, bu adım atlanmamalı. CHANGE 5 ise en önemli güvenlik katmanı: düşük güven skorunda LLM hiç çağrılmıyor, ticket direkt human agent'a gidiyor.

"What Must NOT Change" bölümü de önemli — auto-learning flow ve API contract'ların bozulmaması gerektiğini net söylüyor ki refactor sırasında istemeden bir şeyi kırmasın.

# RAG Architecture Refactor Prompt

> Use this prompt with your AI coding assistant (Cursor, Copilot, Claude Code, etc.)
> Provide relevant source files alongside this prompt for best results.

---

## Prompt

You are a senior backend engineer specializing in RAG (Retrieval-Augmented Generation) systems. I need you to refactor my existing support desk AI architecture to fix critical issues causing irrelevant, hallucinated, and low-quality responses — especially for Turkish-language queries.

Below is a full description of the current architecture, the identified problems, and the exact changes required. Apply all changes carefully without breaking existing interfaces.

---

### Current Architecture Overview

The system uses a **Parent-Child Hierarchical Chunking** strategy:
- Child chunks (1-2 sentences) are used for vector similarity search
- Parent chunks (full paragraph/section) are retrieved and sent to the LLM as context
- Embeddings are stored in PostgreSQL with the `pgvector` extension across 3 tables:
  - `knowledge_embeddings` — official articles
  - `knowledge_pool_embeddings` — imported PDFs, markdown files, URLs
  - `ticket_embeddings` — resolved support tickets used for continuous learning

Key files:
- `smart-chunker.ts` — chunking logic
- `embedding.service.ts` — vector search and similarity filtering
- `ai-query.service.ts` — re-ranking and confidence scoring
- `ollama.service.ts` — LLM and embedding model configuration
- `prompt-context-builder.service.ts` — final prompt assembly
- `knowledge-pool.processor.ts` — async ingestion via BullMQ

---

### Root Cause Analysis

There are 4 compounding issues causing irrelevant responses:

1. **Wrong embedding model:** `nomic-embed-text` is English-dominant and produces poor vector representations for Turkish text, causing semantically unrelated documents to score above the similarity threshold.

2. **Similarity threshold too low:** The current `cosine_distance > 0.65` threshold allows documents that are 35% dissimilar to pass through, polluting the context window with irrelevant content.

3. **Insufficient URL source penalty:** The re-ranking multiplier for URL-sourced chunks (`0.8`) is not punitive enough. URL chunks still win over articles/documents when the knowledge base is sparse.

4. **Parent chunk size too large:** `maxTokens: 2000` for parent chunks sends oversized context to the LLM. When irrelevant content slips through, the LLM ignores the actual user question and summarizes the large irrelevant document instead.

---

### Required Changes

#### CHANGE 1 — Embedding Model Migration (`ollama.service.ts`)

Replace the current embedding model with a multilingual model that has strong Turkish language support.

```typescript
// BEFORE
const EMBEDDING_MODEL = "nomic-embed-text";

// AFTER — Option A: OpenAI (recommended for production)
const EMBEDDING_MODEL = "text-embedding-3-large";
// dimensions: 3072 — update pgvector column size accordingly

// AFTER — Option B: Local/Ollama (if staying self-hosted)
const EMBEDDING_MODEL = "multilingual-e5-large";
// dimensions: 1024
```

Rules:
- Add an environment variable `EMBEDDING_MODEL` so it can be switched without code changes: `process.env.EMBEDDING_MODEL ?? "text-embedding-3-large"`
- Add an `EMBEDDING_DIMENSIONS` env var as well, used wherever the vector column size is defined
- If switching to OpenAI embeddings, route embedding calls through the OpenAI client, not Ollama
- **Do not mix vectors from different models in the same table.** After the model change, all 3 embedding tables (`knowledge_embeddings`, `knowledge_pool_embeddings`, `ticket_embeddings`) must be cleared and re-indexed from scratch. Add a migration script that truncates embeddings and triggers re-ingestion.

---

#### CHANGE 2 — Similarity Threshold (`embedding.service.ts`)

Raise the cosine similarity threshold to reduce false positives.

```typescript
// BEFORE
WHERE 1 - (embedding <=> $1) > 0.65

// AFTER
WHERE 1 - (embedding <=> $1) > 0.78
```

Additional rules:
- Make this threshold configurable via environment variable: `SIMILARITY_THRESHOLD=0.78`
- Add a secondary "hard floor" check: if the **top result** across all sources scores below `0.72`, do not send any context to the LLM. Instead, return a structured response indicating no reliable match was found, so the system can route the ticket to a human agent rather than hallucinate.
- Log the top similarity score and the number of results that passed the threshold for every query. This is critical for monitoring.

```typescript
// Add to search() return value
{
  results: ChunkResult[],
  diagnostics: {
    topScore: number,
    passedThreshold: number,
    queryEmbeddingModel: string,
  }
}
```

---

#### CHANGE 3 — Re-ranking Multipliers (`ai-query.service.ts`)

Adjust source-type confidence multipliers to more aggressively favor curated content.

```typescript
// BEFORE
const SOURCE_MULTIPLIERS = {
  ARTICLE:  1.25,
  DOCUMENT: 1.10,
  URL:      0.80,
};

// AFTER
const SOURCE_MULTIPLIERS = {
  ARTICLE:  1.30,
  DOCUMENT: 1.15,
  URL:      0.60,
  FAQ:      1.20,  // add this if not already present
  TICKET:   1.05,
};
```

Additional rules:
- After applying multipliers, add a **hard exclusion rule**: if a chunk's source type is `URL` and its final re-ranked score is below `0.75`, exclude it from the context entirely — do not send it to the LLM.
- Add a `sourceBreakdown` field to the query diagnostics showing which sources contributed to the final context and with what scores. This helps admins understand why a particular answer was generated.

---

#### CHANGE 4 — Parent Chunk Size (`smart-chunker.ts`)

Reduce the maximum parent chunk token size to keep LLM context focused.

```typescript
// BEFORE
const CHUNK_CONFIG = {
  parentMaxTokens: 2000,
  childMaxTokens:  150,
  childOverlap:    20,
};

// AFTER
const CHUNK_CONFIG = {
  parentMaxTokens: 800,   // reduced from 2000
  childMaxTokens:  120,   // slightly reduced
  childOverlap:    15,
};
```

Additional rules:
- Make these values configurable via environment variables:
  - `CHUNK_PARENT_MAX_TOKENS=800`
  - `CHUNK_CHILD_MAX_TOKENS=120`
- When re-chunking existing documents after this change, do **not** delete the old chunks immediately. Mark them `status: REINDEXING`, insert the new chunks, then mark old ones `status: ARCHIVED`. This prevents a gap where documents are temporarily unsearchable.
- For XLS/spreadsheet sources, parent chunk size should be capped at `400` tokens regardless of the global config, because tabular data becomes incoherent at larger sizes.

---

#### CHANGE 5 — No-Match Handling (`prompt-context-builder.service.ts`)

Currently, when no reliable context is found, the LLM still generates a response using only its parametric knowledge. This is a hallucination risk. Fix this.

```typescript
// Add this logic before building the final prompt
if (retrievalResult.diagnostics.topScore < LOW_THRESHOLD || 
    retrievalResult.results.length === 0) {
  return {
    shouldRespond: false,
    reason: "NO_RELIABLE_CONTEXT",
    suggestedAction: "ROUTE_TO_HUMAN",
  };
}
```

Rules:
- When `shouldRespond: false`, the system must **not** call the LLM at all. Return the structured no-match response to the caller.
- The caller (ticket handler) should then escalate the ticket to a human agent queue and add a system note: `"AI could not find a reliable answer. Routed to human agent."`
- Add a `LOW_CONFIDENCE_THRESHOLD` env var (default `0.72`) separate from `SIMILARITY_THRESHOLD`.

---

#### CHANGE 6 — Re-index Migration Script

Create a migration script `scripts/reindex-embeddings.ts` that:

1. Connects to the database
2. Fetches all source documents from `knowledge_articles`, `knowledge_pool`, and resolved tickets
3. Clears all rows from `knowledge_embeddings`, `knowledge_pool_embeddings`, `ticket_embeddings`
4. Re-runs the ingestion pipeline for each document using the new embedding model
5. Logs progress: `[REINDEX] Processing {n}/{total}: {document_title}`
6. On failure of any single document, logs the error and continues (does not abort the whole reindex)
7. Outputs a summary report at the end: total processed, succeeded, failed, duration

The script must be idempotent — running it twice should not create duplicate embeddings.

---

#### CHANGE 7 — Environment Variable Consolidation

Create or update `.env.example` with all new variables:

```env
# Embedding
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIMENSIONS=3072

# Retrieval thresholds
SIMILARITY_THRESHOLD=0.78
LOW_CONFIDENCE_THRESHOLD=0.72

# Chunking
CHUNK_PARENT_MAX_TOKENS=800
CHUNK_CHILD_MAX_TOKENS=120

# Re-ranking
RERANK_MULTIPLIER_ARTICLE=1.30
RERANK_MULTIPLIER_DOCUMENT=1.15
RERANK_MULTIPLIER_URL=0.60
RERANK_URL_HARD_FLOOR=0.75
```

---

### What Must NOT Change

- The BullMQ async processing pipeline structure in `knowledge-pool.processor.ts`
- The `ticket.kb_summarize` auto-learning flow in `ai-auto-resolver.service.ts` (only its embedding call should be updated to use the new model)
- The 3-table database schema structure (only the vector column dimensions may change)
- The existing admin-facing API contracts — all request/response shapes must remain identical
- The `SYSTEM_PROMPT_SUPPORT` dynamic prompt loading from the database

---

### Testing Requirements

After completing all changes, verify the following:

1. A Turkish-language query ("format attım lisansımı aktif edemiyorum") returns a relevant result with similarity score above `0.78`
2. A query with no matching content returns `shouldRespond: false` and does not call the LLM
3. URL-sourced chunks with score below `0.75` after re-ranking are excluded from context
4. The re-index script completes without crash and produces a summary report
5. All 3 embedding tables are populated with vectors of the correct new dimension size
6. No existing API endpoint returns a different response shape than before

---

### Deliverables

- Updated source files for all 7 changes above
- `scripts/reindex-embeddings.ts`
- Updated `.env.example`
- A short `REFACTOR_NOTES.md` explaining what was changed in each file and why, for the team's reference