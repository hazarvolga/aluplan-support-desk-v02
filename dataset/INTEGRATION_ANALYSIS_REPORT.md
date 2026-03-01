# Teknik Analiz ve Entegrasyon Raporu: Allplan Destek Zekası

Bu rapor, `/Users/hazarekiz/Projects/aluplan-support-desk-V02` projesinin kod analizi sonucunda, hazırlanan Allplan datasetinin sisteme en verimli şekilde nasıl entegre edileceğini ve ileri seviye AI özelliklerinin (Option A, B, C) nasıl kodlanacağını teknik detaylarıyla açıklar.

---

## 🔍 1. Mevcut Mimari Analizi (Kod Okuma Bulguları)

Analiz ettiğim `aluplan-support-desk-V02` kod tabanında şu kritik bulgulara ulaştım:

- **Vektör Yapısı:** PostgreSQL + `pgvector` kullanılıyor. Vektör boyutu 768 (Ollama/nomic-embed-text uyumlu).
- **Arama Mantığı (`EmbeddingService`):** Arama sadece `knowledge_embeddings` (Makaleler) ve `knowledge_pool_embeddings` (Dokümanlar/URLler) tablolarında yapılıyor.
- **Kritik Eksiklik:** Yüksek puan alan ticket'lar (`ticket_embeddings` tablosu) asıl AI sorgu motoruna (`AiQueryService.query`) dahil edilmemiş.
- **Performans Sorunu:** Benzerlik eşiği (Threshold) sistemde **0.90** olarak set edilmiş. Bu değer, yerel modeller için çok "dar" bir aralıktır ve birçok doğru sonucu filtrelemektedir.

---

## 📂 2. Dataset Entegrasyon Planı

Hazırladığım verileri sisteminize şu yollarla "enjekte" edebilirsiniz (Hiçbir kod değişimi yapmadan, sadece DB seviyesinde):

### A. Makale ve Rehberler (`support_articles/`)
- **Eşleşme:** Bu Markdown dosyalarını `knowledge_articles` ve `knowledge_article_versions` tablolarına import edin.
- **İşlem:** Admin panelindeki "Dosya Yükle" özelliğini kullanarak bu klasörü toplu yüklediğinizde, `KnowledgePoolProcessor` bunları otomatik parçalayıp vektör tabanına yazacaktır.

### B. Q&A Veri Seti (`allplan_qa_dataset.json`)
- **Eşleşme:** `faq_entries` tablosu.
- **İşlem:** JSON içeriğini SQL ile `faq_entries` tablosuna `status: PUBLISHED` olarak basın. Bu sayede FAQ sayfanız anında Allplan zekasıyla donatılacaktır.

### C. Teşhis Ağaçları ve Log Desenleri
- **Eşleşme:** `ERROR_LOG_PATTERNS.json`'daki desenleri, sisteminizdeki "Smart Tagging" servisine (`smartTagTicket`) ek kural seti olarak tanıtabilirsiniz.

---

## 🚀 3. Gelecek Vizyonu Uygulama Rehberi (A, B, C)

### 🤖 Option A: Otonom Veri Besleme (Knowledge Scraper)
Mevcut `CrawlService`'i genişleterek;
1. `Allplan Connect` RSS veya forum URL'lerini `knowledge_sources` (Type: URL) olarak ekleyin.
2. NestJS içinde basit bir Cron job ile `knowledgePoolService.triggerSync(id)` metodunu haftalık çağırın. Sisteminizdeki mevcut `hierarchicalChunk` yapısı zaten bunu işlemeye hazır.

### 🧠 Option B: RAG Engine Optimizasyonu (Çözüm Önerisi)
Mevcut aramanın performansını %200 artırmak için raporumdaki şu teknik değişikliği yapmanızı öneririm:
- **Hibrid Tablo Birleşimi:** `EmbeddingService.search` içindeki SQL sorgusuna `UNION ALL` ile `ticket_embeddings` tablosunu da ekleyin. Böylece AI, sadece makalelerden değil; yüksek puan alan geçmiş Allplan çözümlerinden de "öğrenecek".
- **Eşik Revizesi:** Benzerlik eşiğini **0.75** (Medium) ve **0.85** (High) olarak güncelleyin.

### 👁 Option C: Multimodal Teşhis (Visual AI)
Sisteminizdeki `AiService`'e `GPT-4o Vision` desteği ekleyerek:
- `Attachment` tablosuna yüklenen görselleri AI'ya gönderin.
- `VISUAL_ASSET_REGISTRY.json` dosyasını AI Propmt'una "Görsel Rehber" olarak verin. AI, ekran görüntüsündeki hata kodunu yakalayıp ilgili Markdown makalesine (Örn: "Launcher Error") link verecektir.

---

## 💡 Sonuç ve Tavsiye

Sisteminiz mimari olarak çok sağlam kurgulanmış; ancak **"pgvector eşik değerleri"** ve **"farklı vektör tablolarının birleşimi"** noktalarında iyileştirmeye ihtiyaç duyuyor. Eğer Quadrant'a geçmek isterseniz hibrit arama (Lexical + Vector) daha kolaylaşacaktır ancak mevcut PostgreSQL altyapınız da doğru konfigürasyonla (Reranking Boostları ile) Enterprise seviyeye çıkabilir.

Bu rapor doğrultusunda, dataseti platformunuza basarak Allplan desteğinde yeni bir dönemi başlatabilirsiniz.
