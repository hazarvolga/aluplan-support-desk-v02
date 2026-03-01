# Allplan Destek Zekası Dönüşüm Planı

Bu plan, eldeki karmaşık ve ham verileri (dokümanlar, FAQ'lar, teknik kılavuzlar) Allplan 2026 öncelikli olacak şekilde yapılandırılmış bir destek zekası sistemine dönüştürmeyi amaçlar. Dönüşüm tamamen **Türkçe** dilinde gerçekleştirilecektir.

## Önerilen Değişiklikler

### 1. Taksonomi Yapısı (Taxonomy)
Veriler aşağıdaki hiyerarşik yapıya göre sınıflandırılacaktır:

- **Kurulum ve Lisanslama:** Kurulum hataları, lisans aktivasyonu, abonelik yönetimi.
- **Kullanıcı Arayüzü & Genel:** Menü navigasyonu, çalışma alanları, proje yönetimi.
- **Mimari Modelleme:** Duvarlar, döşemeler, Allplan 2026 gelişmiş kaplama (finish) iş akışları.
- **Yapısal Mühendislik:** Donatı modelleme, çelik detaylandırma, analiz yazılımlarıyla entegrasyon.
- **BIM & Veri Değişimi:** IFC (Attribute Mapping), Bimplus koordinasyonu, BCF iş akışları, IDS.
- **Performans & Teknik:** Sistem gereksinimleri, hata kodları, donanım optimizasyonu.

### 2. Çıktı Formatı ve Organizasyonu
Özel platformunuza kolayca entegre edilebilmesi için veriler şu yapıda sunulacaktır:

- **`allplan_support_articles/`**: Problem özeti, belirtiler, ortam, kök neden, çözüm adımları ve etiketleri içeren detaylı Markdown makaleleri.
- **`allplan_qa_dataset.json`**: Chatbot ve RAG sistemleri için normalize edilmiş soru-cevap çiftleri.
- **`allplan_intent_classification.csv`**: Niyet sınıfları ve her niyet için 5-15 arası örnek kullanıcı ifadesi.
- **`error_intelligence_layer.json`**: Hata kodları ve karşılık gelen teşhis adımları.

### 3. Allplan 2026 Önceliği
Taksonomide şu özellikler "Kritik/Yüksek Öncelikli" olarak işaretlenecektir:
- Multi-layered vertical finishes (Çok katmanlı dikey kaplamalar).
- Priority-Based Connections (PBC - Öncelik tabanlı bağlantılar).
- Gelişmiş IFC4 import yetenekleri.
- IDS (Information Delivery Specification) uygulamaları.

## Doğrulama Planı

### Otomatik Kontroller
- Oluşturulan JSON dosyalarının şema doğruluğunun kontrol edilmesi.
- Markdown dosyalarındaki bağlantıların ve başlık hiyerarşisinin kontrolü.
- Sorun etiketlerinin (tags) tutarlılığının script ile denetlenmesi.

### Manuel Doğrulama
- Verilerin teknik doğruluğunun (özellikle Allplan 2026 yenilikleri) kullanıcı kılavuzları ile çapraz kontrolü.
- Üretilen niyet (intent) ifadelerinin doğal dil akıcılığının kontrolü.
- Resolution (çözüm) adımlarının uygulanabilirliğinin mantıksal denetimi.
