# Requirements Document

## Introduction

Bu spec, mevcut RAG & Self-Learning FAQ sisteminde tespit edilen 5 mimari sorunu gidermek için gereksinimleri tanımlar.
Sorunlar; KB içeriğinin prompt'a dahil edilmemesi, semantik FAQ deduplication eksikliği, `streamQuery()` metodunda
güvenlik eşiği kontrolünün bulunmaması, KnowledgePool aramasında parent-child retrieval pattern'inin uygulanmaması
ve `ticket.kb_summarize` event'ine iki ayrı handler'ın subscribe olmasından kaynaklanan duplicate FAQ üretimi riskini kapsar.

## Glossary

- **PromptContextBuilder**: `PromptContextBuilderService` — LLM'e gönderilecek context prompt'unu oluşturan servis.
- **kbContent**: Knowledge Base'den gelen, kullanıcı sorgusuna en yakın içerik parçası (top search result).
- **EmbeddingService**: Vektör tabanlı semantik arama ve indexleme işlemlerini yürüten servis.
- **AiQueryService**: Kullanıcı sorgularını işleyen, LLM çağrısını yöneten ana AI servis.
- **FaqService**: FAQ entry'lerini yöneten, ticket ve interaction'lardan FAQ çıkaran servis.
- **AiAutoResolverService**: Ticket event'lerini dinleyerek otomatik yanıt ve KB öğrenme işlemlerini yürüten servis.
- **LOW_CONFIDENCE_THRESHOLD**: LLM çağrısının yapılıp yapılmayacağını belirleyen minimum benzerlik skoru eşiği (varsayılan: 0.72).
- **KnowledgePool**: `knowledge_pool_embeddings` tablosunda saklanan, PDF/URL/TXT kaynaklı embedding'ler.
- **Parent Chunk**: Hierarchical chunking'de LLM'e context olarak sunulan büyük metin parçası.
- **Child Chunk**: Hierarchical chunking'de vektör araması için kullanılan küçük metin parçası.
- **ticket.kb_summarize**: Yüksek memnuniyet skorlu ticket'ların KB'ye eklenmesi için yayımlanan event.
- **FaqEntry**: `faq_entries` tablosunda saklanan soru-cevap kaydı.
- **Semantic Deduplication**: Embedding benzerliğine dayalı duplicate tespiti.

## Requirements

### Requirement 1: KB İçeriğinin PromptContextBuilder'a Dahil Edilmesi

**User Story:** Bir destek mühendisi olarak, LLM'in KB içeriğini context builder üzerinden almasını istiyorum; böylece prompt oluşturma mimarisi tutarlı ve merkezi bir yapıda olsun.

#### Acceptance Criteria

1. THE PromptContextBuilder SHALL `kbContent` parametresini `buildContext()` metodunda `_kbContent` olarak ignore etmek yerine context string'ine dahil etmelidir.
2. WHEN `buildContext()` çağrıldığında ve `kbContent` boş olmadığında, THE PromptContextBuilder SHALL `kbContent` değerini `[APPROVED KNOWLEDGE SOURCE]` başlığı altında context'e eklemeli ve bu bölümü diğer context bölümlerinden önce konumlandırmalıdır.
3. WHEN `AiQueryService.query()` metodu LLM çağrısı yaptığında, THE AiQueryService SHALL `ai.reformat()` çağrısına `topResult.content`'i doğrudan geçirmek yerine `promptContextBuilder.buildContext()` çıktısını kullanmalıdır.
4. WHEN `AiQueryService.streamQuery()` metodu LLM çağrısı yaptığında, THE AiQueryService SHALL `ai.streamReformat()` çağrısında da aynı context builder çıktısını kullanmalıdır.
5. THE PromptContextBuilder SHALL `kbContent` içerdiğinde, context'teki `[APPROVED KNOWLEDGE SOURCE]` bölümünün boş olmadığını garanti etmelidir.

### Requirement 2: Semantik FAQ Deduplication

**User Story:** Bir sistem yöneticisi olarak, aynı sorunun farklı yazılmış versiyonlarının birden fazla FAQ entry'si oluşturmamasını istiyorum; böylece FAQ veritabanı temiz ve tekrarsız kalsın.

#### Acceptance Criteria

1. WHEN `FaqService.processPatterns()` yeni bir FAQ adayını işlediğinde, THE FaqService SHALL yalnızca `question` alanında exact string match aramak yerine embedding tabanlı semantik benzerlik kontrolü de yapmalıdır.
2. WHEN semantik benzerlik kontrolü yapıldığında, THE FaqService SHALL mevcut `faq_entries` tablosundaki tüm PUBLISHED ve PENDING_REVIEW kayıtların embedding'leriyle karşılaştırma yapmalıdır.
3. IF yeni FAQ adayının sorusu ile mevcut herhangi bir FAQ entry'sinin sorusu arasındaki kosinüs benzerliği 0.90 veya üzerindeyse, THEN THE FaqService SHALL yeni entry oluşturmak yerine mevcut entry'nin `frequency` sayacını artırmalıdır.
4. THE FaqService SHALL `faq_entries` tablosundaki `question` alanı için embedding'leri `EmbeddingService` aracılığıyla üretmeli ve karşılaştırma yapmalıdır.
5. WHEN `extractFromTickets()` çalıştığında, THE FaqService SHALL yalnızca `ticket.subject` ile exact match kontrolü yapmak yerine semantik deduplication pipeline'ını kullanmalıdır.
6. THE FaqService SHALL semantik deduplication eşiğini `FAQ_SEMANTIC_DEDUP_THRESHOLD` environment variable'ından okumalı; değer tanımlı değilse varsayılan olarak 0.90 kullanmalıdır.

### Requirement 3: streamQuery() Metodunda LOW_CONFIDENCE_THRESHOLD Kontrolü

**User Story:** Bir güvenlik mühendisi olarak, stream endpoint'inin de query endpoint'iyle aynı güvenlik eşiği kontrolüne tabi olmasını istiyorum; böylece düşük güvenilirlikli sorgular LLM'e iletilmesin.

#### Acceptance Criteria

1. WHEN `AiQueryService.streamQuery()` çağrıldığında ve `searchResponse.diagnostics.topScore` değeri `LOW_CONFIDENCE_THRESHOLD`'un altındaysa, THE AiQueryService SHALL LLM'e çağrı yapmadan `{ chunk: 'No reliable source found...' }` ve ardından `{ done: true, suggestTicket: true }` yield etmelidir.
2. WHEN `streamQuery()` LOW_CONFIDENCE_THRESHOLD kontrolü uyguladığında, THE AiQueryService SHALL `query()` metodundaki ile aynı `LOW_CONFIDENCE_THRESHOLD` değerini (`process.env.LOW_CONFIDENCE_THRESHOLD || '0.72'`) kullanmalıdır.
3. WHEN `streamQuery()` düşük güven nedeniyle erken sonlandığında, THE AiQueryService SHALL `aiInteraction` kaydını `autoAnswered: false` ve `confidenceBand: null` ile oluşturmalıdır.
4. THE AiQueryService SHALL `streamQuery()` içindeki LOW_CONFIDENCE_THRESHOLD kontrolünü, re-ranking uygulanmadan önce `searchResponse.diagnostics.topScore` üzerinden yapmalıdır; bu davranış `query()` metoduyla tutarlı olmalıdır.
5. WHEN `streamQuery()` sonuçları boş olduğunda (`results.length === 0`), THE AiQueryService SHALL LOW_CONFIDENCE_THRESHOLD kontrolüyle aynı erken sonlandırma davranışını uygulamalıdır.

### Requirement 4: KnowledgePool Aramasında Parent-Child Retrieval Pattern'i

**User Story:** Bir AI mühendisi olarak, KnowledgePool aramasının da article aramasıyla aynı parent-child retrieval pattern'ini kullanmasını istiyorum; böylece LLM'e daha geniş ve anlamlı context sunulsun.

#### Acceptance Criteria

1. WHEN `EmbeddingService.search()` KnowledgePool üzerinde arama yaptığında, THE EmbeddingService SHALL `kpe.metadata->>'type' = 'parent'` filtresiyle yalnızca parent chunk'ları aramak yerine child chunk'lar üzerinde arama yapıp ilgili parent chunk'ı döndürmelidir.
2. THE EmbeddingService SHALL `knowledge_pool_embeddings` tablosunda `parent_id` ilişkisini kullanarak child → parent retrieval yapmalıdır.
3. WHEN `indexPoolContent()` çağrıldığında, THE EmbeddingService SHALL `hierarchicalChunk()` kullanarak hem parent hem child embedding'leri `knowledge_pool_embeddings` tablosuna kaydetmeli ve child kayıtlarında `parent_id` alanını doldurmalıdır.
4. THE EmbeddingService SHALL pool aramasında döndürülen içeriğin, child'ın eşleştiği parent chunk'ın `content` alanı olduğunu garanti etmelidir; bu davranış article aramasındaki `COALESCE(parent.content, ke.content)` pattern'iyle tutarlı olmalıdır.
5. WHEN `knowledge_pool_embeddings` tablosunda bir child kaydının `parent_id`'si NULL ise, THE EmbeddingService SHALL fallback olarak child'ın kendi `content`'ini döndürmelidir.
6. THE EmbeddingService SHALL `indexPoolContent()` metodunu, `indexArticle()` metodundaki hierarchical chunking mantığıyla paralel bir yapıda refactor etmelidir.

### Requirement 5: ticket.kb_summarize Event Handler Sorumluluklarının Netleştirilmesi

**User Story:** Bir backend mühendisi olarak, `ticket.kb_summarize` event'ine subscribe olan iki handler'ın sorumluluklarının net olarak ayrılmasını istiyorum; böylece aynı ticket için duplicate FAQ entry'leri oluşturulmasın.

#### Acceptance Criteria

1. THE AiAutoResolverService SHALL `ticket.kb_summarize` event'ini dinlemeye devam etmeli ancak `faq_entries` tablosuna doğrudan kayıt oluşturmamalıdır; FAQ oluşturma sorumluluğu yalnızca `FaqService`'e ait olmalıdır.
2. THE FaqService SHALL `ticket.kb_summarize` event'ini aldığında ticket'ı `kb-summarizer` queue'ya eklemeli; queue processor hem embedding indexleme hem de FAQ entry oluşturma işlemlerini tek bir transaction içinde yürütmelidir.
3. WHEN `AiAutoResolverService.handleTicketSummarize()` çalıştığında, THE AiAutoResolverService SHALL yalnızca `EmbeddingService.indexTicket()` çağrısını ve `ticket.knowledgeBaseAdded = true` güncellemesini yapmalıdır; `faqEntry.create()` çağrısını içermemelidir.
4. IF aynı ticket için `ticket.kb_summarize` event'i birden fazla kez yayımlanırsa, THEN THE FaqService SHALL `ticket.knowledgeBaseAdded` alanını kontrol ederek zaten işlenmiş ticket'lar için queue'ya ekleme yapmamalıdır.
5. THE FaqService'in `kb-summarizer` queue processor'ı SHALL bir ticket için FAQ entry oluşturmadan önce aynı `sourceId` ile mevcut bir `faq_entries` kaydı olup olmadığını kontrol etmeli; varsa yeni kayıt oluşturmamalıdır.
6. WHEN `FaqService` FAQ entry oluşturduğunda, THE FaqService SHALL Requirement 2'de tanımlanan semantik deduplication kontrolünü de uygulamalıdır.
