# Implementation Tasks

## Tasks

- [x] 1. Schema Değişiklikleri ve Migration
  - [x] 1.1 KnowledgePoolEmbedding modeline parentId alanı ekle (schema.prisma)
  - [x] 1.2 FaqEntry modeline questionEmbedding alanı ekle (schema.prisma)
  - [x] 1.3 Manuel SQL migration uygula: knowledge_pool_embeddings tablosuna parent_id kolonu ekle
  - [x] 1.4 Manuel SQL migration uygula: faq_entries tablosuna question_embedding kolonu ekle
  - [x] 1.5 Prisma client'ı yeniden oluştur (prisma generate)

- [x] 2. PromptContextBuilderService Fix
  - [x] 2.1 buildContext() metodunda _kbContent → kbContent düzelt
  - [x] 2.2 kbContent'i [APPROVED KNOWLEDGE SOURCE] başlığı altında context'in başına ekle

- [x] 3. AiQueryService streamQuery() LOW_CONFIDENCE_THRESHOLD Kontrolü
  - [x] 3.1 streamQuery() metoduna LOW_CONFIDENCE_THRESHOLD kontrolü ekle
  - [x] 3.2 Erken sonlandırma durumunda aiInteraction kaydı oluştur (autoAnswered: false, confidenceBand: null)

- [x] 4. EmbeddingService indexPoolContent() Hierarchical Chunking
  - [x] 4.1 indexPoolContent() metodunu hierarchicalChunk() kullanacak şekilde refactor et
  - [x] 4.2 Parent ve child embedding'leri parent_id ilişkisiyle kaydet

- [x] 5. EmbeddingService search() KnowledgePool Child→Parent Retrieval
  - [x] 5.1 search() metodundaki KnowledgePool sorgusunu child→parent JOIN pattern'ine güncelle
  - [x] 5.2 metadata->>'type' = 'parent' filtresini kaldır, child chunk'lar üzerinde ara

- [x] 6. FaqService Semantik Deduplication
  - [x] 6.1 EmbeddingService'e embedText() metodu ekle (public)
  - [x] 6.2 FaqService'e EmbeddingService inject et
  - [x] 6.3 processPatterns() metoduna semantik deduplication pipeline ekle
  - [x] 6.4 handleTicketKbSummarize() metoduna knowledgeBaseAdded idempotency kontrolü ekle

- [x] 7. AiAutoResolverService FAQ Oluşturma Kaldırma
  - [x] 7.1 handleTicketSummarize() metodundan faqEntry.create() çağrısını kaldır
  - [x] 7.2 Yalnızca indexTicket() ve knowledgeBaseAdded güncelleme işlemlerini bırak

- [x] 8. FaqService Queue Processor Idempotency
  - [x] 8.1 kb-summarizer queue processor'ına sourceId duplicate kontrolü ekle

- [x] 9. Property-Based Testler
  - [x] 9.1 fast-check paketini yükle
  - [x] 9.2 PromptContextBuilderService property testleri yaz (Property 1)
  - [x] 9.3 FaqService semantik deduplication property testleri yaz (Property 2, 3, 4)
  - [x] 9.4 AiQueryService streamQuery property testleri yaz (Property 5, 6)
  - [x] 9.5 EmbeddingService indexPoolContent property testleri yaz (Property 8)
  - [x] 9.6 FaqService idempotency property testleri yaz (Property 10)
