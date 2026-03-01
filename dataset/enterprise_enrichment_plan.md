# PLAN: Enterprise Seviye Destek Zekası Zenginleştirme

"Pro" bir destek ekosistemi için sadece soru-cevap değil, **kendini iyileştiren ve rehberlik eden** bir yapı gereklidir. İşte bir sonraki aşama için önerdiğim stratejik adımlar:

## 1. Etkileşimli Teşhis Ağaçları (Decision Trees)
Flat makaleler yerine, kullanıcının "Evet/Hayır" diyerek ilerleyeceği akış şemaları oluşturulması.
- **Hedef:** "Allplan Açılmıyor" sorusunu 5 saniyede spesifik bir hata koduna (Örn: SQL Lock) indirgemek.
- **Eylem:** `support_articles` içine süreç şemaları eklenmesi.

## 2. Log ve Telemetri Mühendisliği
Enterprise sistemler, kullanıcının gönderdiği log dosyalarını (AllplanTrace.txt, Setup.log) otomatik analiz edebilmeli.
- **Hedef:** AI'nın hata loglarını okuyup doğrudan çözüm önermesi.
- **Eylem:** Yaygın hata satırı kalıplarının (Pattern matching) veri setine eklenmesi.

## 3. Multimodal (Görsel) Bilgi Katmanı
Metin tabanlı yanıtları ekran görüntüleri, teknik çizimler ve kısa GIF'ler ile zenginleştirmek.
- **Eylem:** Kritik iş akışları (Örn: Nitelik Eşleme) için görsel referans kütüphanesi oluşturulması.

## 4. Persona Bazlı İçerikler
Aynı soruyu soran bir "Öğrenci" ile bir "BIM Manager" farklı derinlikte yanıt bekler.
- **Draftsman:** "Nereye tıklayacağımı göster."
- **BIM Manager:** "Bu işlemin IFC şemasına ve proje performansına etkisi nedir?"

## 5. Dinamik Sürüm Senkronizasyonu
Veri setinin Allplan'ın her yeni service pack'i ile otomatik güncelleneceği bir "Scraper & Summarizer" botu kurgusu.

---
**Öneri:** Eğer istersen, ilk adım olarak **"Interaktif Teşhis Rehberi"** formatında ilk Pro makalemizi (Örn: Ağ Hatası Teşhis Ağacı) oluşturarak başlayabiliriz.
