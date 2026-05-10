# 📋 RAG İyileştirme Uygulama Planı — 10 Mayıs 2026

RAG GAP Analiz Raporu'ndaki bulguları temel alarak, sistemin RAG performansını ve Hotinfo (HXL) veri etki oranını artırmak için aşağıdaki adımlar izlenecektir.

---

## 🚀 Planlanan Aşamalar

### 1. Aşama: Hotinfo Etki Oranını (Impact Rate) Artırma (GAP-RAG-01)
*   **Analiz:** `AiQueryService` içinde Hotinfo verisinin neden sadece donanım sorgularıyla sınırlı kaldığını inceleyeceğiz.
*   **Eylem:** Hotinfo versiyon bilgisini (Allplan 2024, 2026 vb.) tüm RAG aramalarında bir **Metadata Filter** olarak ekleyeceğiz. 
*   **Hedef:** Versiyona duyarlı döküman araması sağlayarak "HXL IMPACT RATE" değerini yükseltmek.

### 2. Aşama: Product & Keyword Filtreleme (GAP-RAG-03)
*   **Analiz:** Vektör sorgularında `productId` bazlı kısıtlamaların (Metadata Filtering) mevcut durumunu kontrol edeceğiz.
*   **Eylem:** Prisma vektör sorgusuna (pgvector), seçili ürün dışındaki içerikleri eleyen kesin bir `where` koşulu ekleyeceğiz.
*   **Hedef:** Ürünler arası "bilgi sızıntısını" (context leakage) önlemek.

### 3. Aşama: Hotinfo Trace Ön İşleme (GAP-RAG-04)
*   **Analiz:** `HotinfoParserService`'in ham `errorTrace` verisini nasıl parse ettiğini ve boyutu nasıl yönettiğini inceleyeceğiz.
*   **Eylem:** Çok uzun log verilerini LLM'e göndermeden önce özetleyen veya sadece kritik hata satırlarını ayıklayan bir ara katman (Pre-processor) ekleyeceğiz.
*   **Hedef:** Token tasarrufu sağlamak ve LLM'in odak noktasını netleştirmek.

### 4. Aşama: Prompt Context Builder Güncellemesi
*   **Eylem:** `PromptContextBuilder` içindeki "Hotinfo" talimatlarını "Opsiyonel Bilgi"den "Katı Kural/Constraint" seviyesine yükselteceğiz.
*   **Hedef:** AI'nın sistem bilgilerine daha sadık kalmasını sağlamak.

---

## ✅ Onay Bekleniyor
Bu plan, sistemin kalbindeki RAG yapısını stabilize edecek ve daha doğru yanıtlar üretmesini sağlayacaktır. 

**Onay vermeniz durumunda 1. Aşama (Hotinfo Entegrasyonu) ile başlayacağım.**
