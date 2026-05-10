# 🤖 Aluplan Support Desk — Kapsamlı RAG GAP Analiz Raporu

**Rapor Tarihi:** 10 Mayıs 2026  
**Analist:** Enterprise GAP Analysis Consultant  
**Kapsam:** Custom RAG, Hotinfo (HXL) Entegrasyonu & Self-Learning Mekanizması  
**Versiyon:** v1.0 (RAG-Optimized)

---

## 1. Yönetici Özeti (Executive Summary)

Aluplan Support Desk, standart RAG yapılarının ötesine geçerek **bağlamsal donanım ve versiyon verilerini (Hotinfo)** RAG pipeline'ına entegre etmiştir. Sistem, kullanıcının sorduğu soru ile kullandığı Allplan versiyonu ve sistem donanımı arasında çapraz referans kurabilmektedir. Ancak, mevcut yapıda "Hotinfo" verisinin kullanımı ağırlıklı olarak donanım/crash sorgularına indirgenmiş durumdadır. "Kendi Kendine Öğrenme" (Self-learning) altyapısı mevcuttur (Prisma modelleri hazır) fakat bu verinin vektör veritabanına geri beslenmesi (feedback loop) henüz tam otonom değildir.

---

## 2. Mevcut Durum (Current State)

*   **RAG Motoru:** `pgvector` tabanlı PostgreSQL vektör arama.
*   **Bilgi Kaynakları:** `KnowledgePool` (Crawled web), `KnowledgeBase` (Articles), `SeededContent`.
*   **Bağlam Enjeksiyonu:** `AiQueryService` sorgu genişletme (query expansion) yapıyor.
*   **Hotinfo Analizi:** `.hxl` dosyaları XML olarak parse edilip `HotinfoParserService` ile JSON'a dönüştürülüyor.
*   **HXL Impact:** `AiCopilotService` üzerinden donanım odaklı sorgularda bağlam olarak sunuluyor.

---

## 3. Kritik RAG GAP'leri

| ID | Sorun | Etki | Şiddet | Öneri |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-RAG-01** | **Kısıtlı Hotinfo Entegrasyonu:** Hotinfo verisi sadece "hardware" tipi sorgularda `expandedQuery`'ye ekleniyor. | Versiyon bazlı dökümantasyon aramasında (örn: Allplan 2024 vs 2026) yanlış sonuçlar dönebiliyor. | **Yüksek** | Hotinfo versiyon bilgisini tüm döküman aramalarında "Metadata Filter" olarak kullanın. |
| **GAP-RAG-02** | **Self-Learning Loop Kopukluğu:** `InteractionFeedback` verisi toplanıyor ancak bu veri RAG'in `top_k` sonuçlarını etkilemiyor. | Yanlış olduğu bildirilen yanıtlar tekrar üretilmeye devam ediyor. | **Yüksek** | Olumsuz feedback alan dokümanların ağırlığını (weight) dinamik olarak düşüren bir puanlama sistemi ekleyin. |
| **GAP-RAG-03** | **Product Keyword Çakışması:** Ürün bazlı anahtar kelimeler LLM'e metin olarak veriliyor, vektör bazlı filtrelenmiyor. | "Allplan" sorgusunda "BIMPLUS" içeriği gelerek "subject drift"e (konu sapması) yol açıyor. | **Orta** | Prisma sorgularına `productId` tabanlı vektör filtresi (metadata filtering) ekleyin. |
| **GAP-RAG-04** | **Hotinfo Trace Okuma:** HXL dosyasındaki `errorTrace` verisi ham olarak LLM'e gidiyor. | LLM, binlerce satırlık trace içinde boğulup token limitine takılabiliyor. | **Orta** | Trace verisini LLM'e göndermeden önce AI ile "ön-analiz" (pre-summary) yapıp sadece kritik hata kodlarını gönderin. |

---

## 4. Öncelikli Öneriler

### 🚀 Hızlı Kazanımlar (Quick Wins)
*   **Versiyon Bazlı Filtreleme:** `KnowledgeBase` makalelerine `minAllplanVersion` ve `maxAllplanVersion` alanları ekleyerek, kullanıcının Hotinfo'sundaki versiyona göre vektör aramasını daraltın.
*   **Hotinfo Prompt Injection:** `PromptContextBuilder`'da Hotinfo verisini LLM'e sadece "bilgi" olarak değil, "katı kural" (Constraint) olarak verin.

### 🛠️ Optimizasyon
*   **HXL Ön İşleme:** `HotinfoParserService` içine, ekran kartı sürücüsünün güncel olup olmadığını kontrol eden kural bazlı bir mantık ekleyin ve LLM'e "Sürücü eski" flag'ini gönderin.

---

## 5. RAG Yol Haritası (Roadmap)

*   **Faz 1 (Stabilizasyon - 0-15 Gün):** Metadata filtering (Product & Version) entegrasyonu. (GAP-RAG-01, GAP-RAG-03)
*   **Faz 2 (Gelişmiş Analiz - 15-45 Gün):** Hotinfo Trace Pre-processor ve HXL Impact Rate telemetrisinin AI yanıt kalitesiyle korelasyonu.
*   **Faz 3 (Self-Learning - 45+ Gün):** "Reinforcement Learning from User Feedback" (RLHF) döngüsünün vektör ağırlıklarına (reranking) bağlanması.

---

## 6. Stratejik Riskler

1.  **Token Cost Risk:** Hotinfo verileri çok büyük. Gereksiz verinin (örn: tüm sistem DLL'leri) LLM'e gönderilmesi maliyeti artırıyor.
2.  **Context Overload:** RAG sonuçları + Hotinfo + Chat History birleştiğinde LLM'in "akıl yürütme" penceresi daralıyor.
3.  **Knowledge Stale:** Dış kaynaklar (`KnowledgePool`) güncellenmezse, RAG eski Allplan versiyonu bilgilerini vermeye devam eder.

---

**Analist Notu:** Ekran görüntülerinize baktığımda, "HXL IMPACT RATE" değerinin %0 olduğunu görüyorum. Bu, sistemin Hotinfo dosyasını okuduğunu ancak AI yanıtını şekillendirmede henüz etkin (active) bir rol oynamadığını kanıtlıyor. Yukarıdaki **GAP-RAG-01** önerisi bu oranı yükseltecek anahtar adımdır.
