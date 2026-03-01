# Allplan Destek Zekası Dönüşüm Raporu

Allplan 2026 öncelikli destek bilgi mühendisliği süreci tamamlanmıştır. Ham veriler analiz edilerek özel destek platformuna uygun, yapılandırılmış ve AI-optimize edilmiş bir veri setine dönüştürülmüştür.

## Yapılan Çalışmalar

### 1. Yapılandırılmış Bilgi Havuzu
Aşağıdaki ana kategorilerde detaylı destek makaleleri oluşturulmuştur:
- **Allplan 2026 PBC (Öncelik Tabanlı Bağlantılar)**: Yeni nesne etkileşim mekanizması ve hata giderme.
- **IFC Attribute Mapping**: Veri kaybını önleyen teknik haritalama rehberi.
- **Abonelik ve Lisans Yönetimi**: Yeni lisans modelleri ve bulut servis geçişleri.

[Makale Klasörü](file:///Users/hazarekiz/.gemini/antigravity/brain/52d5cb69-d7bf-460f-aba0-e65fe002bd2b/support_articles)

### 2. AI & Chatbot Veri Setleri
- **Q&A Veri Seti**: Chatbotlar için normalize edilmiş soru-cevap çiftleri içeren [allplan_qa_dataset.json](file:///Users/hazarekiz/.gemini/antigravity/brain/52d5cb69-d7bf-460f-aba0-e65fe002bd2b/allplan_qa_dataset.json).
- **Niyet Sınıflandırması**: Model eğitimi için 10+ niyet ve örnek kullanıcı ifadeleri içeren [allplan_intent_classification.csv](file:///Users/hazarekiz/.gemini/antigravity/brain/52d5cb69-d7bf-460f-aba0-e65fe002bd2b/allplan_intent_classification.csv).

### 3. Teknik Standartlaştırma
- **Terminoloji Sözlüğü**: Allplan terimlerinin Türkçe standartları ve hata mesajı haritalama tablosu oluşturuldu. [İncele](file:///Users/hazarekiz/.gemini/antigravity/brain/52d5cb69-d7bf-460f-aba0-e65fe002bd2b/terminology_and_errors.md)

## Doğrulama Sonuçları
- **Allplan 2026 Uyumu**: Tüm 2026 yenilikleri (PBC, IDS, Kaplama Modelleri) veri setine öncelikli olarak dahil edildi.
- **Dil**: Tüm içerik profesyonel destek tonunda ve tamamen **Türkçe** olarak hazırlandı.
- **Format**: Çıktılar özel portalınıza kolayca import edilebilir (Markdown/JSON/CSV) yapıdadır.

> [!TIP]
> Makalelerin platformunuza aktarımı için `support_articles` klasöründeki Markdown dosyalarını toplu olarak upload edebilirsiniz. AI asistanınız için `allplan_qa_dataset.json` dosyasını RAG (Retrieval-Augmented Generation) kaynağı olarak kullanmanızı öneririm.
