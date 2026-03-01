# Allplan Destek Zekası Veri Seti (2021-2026 Hibrit & Enterprise)

Bu veri seti, Allplan'ın tüm aktif sürümlerini (2021-2026) kapsayan, kurumsal teşhis araçları ve küresel BIM standartları ile zenginleştirilmiş hibrit bir bilgi tabanıdır.

## 📂 Veri Seti Yapısı

- **`/support_articles`**: Teknik rehberler, teşhis ağaçları ve log rehberleri (Markdown).
- **`allplan_qa_dataset.json`**: RAG ve Chatbot sistemleri için ana bilgi deposu.
- **`allplan_intent_classification.csv`**: Kullanıcı niyeti anlama ve NLP eğitimi için.
- **`ERROR_LOG_PATTERNS.json`**: AI tabanlı otomatik log analizi için teknik desenler.
- **`VISUAL_ASSET_REGISTRY.json`**: Multimodal (Görsel) destek için varlık kütüğü.
- **`VERSION_ISSUE_MATRIX.md`**: Sürümlere göre hata yoğunluk ve odak noktası matrisi.

---

## 🛠 1. Mevcut Platforma Entegrasyon

Platformunuzun "Self-Learning" yapısını bu veri setiyle şu şekilde besleyebilirsiniz:

1.  **Markdown Makaleleri:** `support_articles/` içindeki dosyaları platformun Bilgi Bankası modülüne import edin. Başlıkları makale adı, `#Tags` kısımlarını sistem etiketleri olarak kullanın.
2.  **Otomatik Yanıtlar:** `allplan_qa_dataset.json` içeriğini FAQ bölümüne yükleyerek AI asistanınızın saniyeler içinde doğru cevabı (Snippet) bulmasını sağlayın.
3.  **Teşhis Akışları:** `diagnostic_tree_network_error.md` gibi akış şemalarını, platformun interaktif yardım (Troubleshooter) katmanında kurgulayın.

---

## 🚀 2. İleri Seviye (Pro) Yol Haritası

Sistemi daha da geliştirmek için belirlediğimiz 3 ana opsiyonun uygulama adımları:

### 🤖 Opsiyon A: Otonom Veri Besleme (Knowledge Scraper)
*Yeni güncellemelerin ve hotfix'lerin otomatik sisteme düşmesi.*
- **Uygulama:** Python tabanlı bir bot ile `Allplan Connect` ve `Help` sayfalarını haftalık tara. AI (GPT-4o) ile özetleyip doğrudan platformun API'si üzerinden yeni makale taslağı oluştur.

### 🧠 Opsiyon B: RAG Engine (Canlı AI Asistanı)
*Dosyalar arasında arama yapmak yerine veriyle doğrudan konuşma.*
- **Uygulama:** Veri setindeki tüm dosyaları bir Vector Database'e (Pinecone/Chroma) yükleyin. Kullanıcı sorusuna en yakın teknik parçaları AI'ya "bağlam" olarak sunarak sıfır halüsinasyon ile cevap verdirtin.

### 👁 Opsiyon C: Multimodal Teşhis (Visual AI)
*Ekran görüntüsünden hata tespiti.*
- **Uygulama:** `VISUAL_ASSET_REGISTRY.json` verisiyle AI'nın (GPT-4o Vision) arayüz hatalarını tanımasını sağlayın. Kullanıcı görsel yüklediğinde, AI hatanın yerini ve çözüm makalesini otomatik önersin.

---

## 📅 Entegrasyon ve Gelecek Detayları
Daha teknik detaylar ve her opsiyonun derinlemesine analizi için:
👉 [PLATFORM_INTEGRATION_ROADMAP.md](PLATFORM_INTEGRATION_ROADMAP.md)

---
*Hazırlayan: Antigravity AI Support Engineering System*
*Versiyon: v3.1 (Global & Enterprise Ready)*
