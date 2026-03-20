# Çelik Detaylandırma: SDS2 entegrasyonu ile parametrik çelik bağlantı tasarımları, MRP/ERP yazılımlar

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T23:15:57.365244
> **Orijinal ID:** nlm-3a9e58d5

---

Destek Makalesi: SDS2 Entegrasyonu ile Çelik Detaylandırma ve MRP/ERP Süreçleri
Sorun Tanımı: Karmaşık çelik yapılarında bağlantı noktalarının (kolon-kiriş birleşimleri vb.) manuel olarak tasarlanması fiziksel çakışmalara, mühendislik hatalarına ve ciddi zaman kayıplarına yol açar
1
. Ayrıca imalat verilerinin atölye yönetim sistemlerine manuel girilmesi malzeme firelerini ve satın alma hatalarını artırır
2
3
.
Temel Çözüm Adımları:
Modelleme ve Aktarım: Allplan'da 3B olarak modellenen ana çelik taşıyıcı çerçeve (kiriş, kolon, çapraz) tek tıkla SDS2 yazılımına aktarılır
4
5
.
Otomatik Bağlantı Tasarımı: SDS2, modeldeki bağlantı noktalarına mühendislik hesaplarına dayalı, çakışmasız, cıvatalı veya kaynaklı akıllı bağlantıları otomatik olarak yerleştirir ve tasarlar
4
5
.
İmalat Çıktıları: Tamamen detaylandırılmış modelden, üretim tezgahlarının (Peddinghaus, FICEP vb.) doğrudan okuyabileceği NC (Sayısal Kontrol) dosyaları ve imalat paftaları (shop drawings) otomatik olarak üretilir
4
more_horiz
.
MRP/ERP Entegrasyonu: Malzeme listeleri (BOM) ve CNC imalat verileri eksiksiz bir paket haline getirilerek Tekla PowerFab veya STRUMIS gibi MRP/ERP yazılımlarına doğrudan yüklenir
7
8
.
Dikkat Edilecek Noktalar:
Aktarım sırasında Allplan'da kullanılan çelik profillerin ve malzeme sınıflarının SDS2 veritabanıyla doğru eşleştiğini mutlaka teyit edin
1
.
Hata veren bağlantı noktalarında (örneğin "Tasarım Kriterleri Karşılanmadı" uyarısı) tasarım kodlarını (Eurocode, AISC) ve uygulanan yükleri kontrol edin
1
.
En İyi Uygulamalar (Best Practices):
Şablon Kullanımı: Standart dışı, özel çelik bağlantıları için Allplan'ın "Bağlantı Araç Kutusu"nu (Connection Toolbox) kullanarak kendi ofisinize özgü PythonPart şablonları (akıllı nesneler) oluşturun
1
9
.
Bütünleşik Çakışma Kontrolü: İmalata geçmeden önce diğer disiplinlerin (Mimari, MEP) modellerini Bimplus üzerinde birleştirerek çelik sistemin genel bir "Çakışma Kontrolünü" (Clash Detection) yapın
1
.
Böylece mimari, statik, prekast, altyapı ve çelik detaylandırma gibi yapı bilgi modellemesi kapsamındaki tüm disiplinleri uçtan uca işlemiş olduk
10
11
.
Tüm bu süreçleri, iş akışlarını ve öğrendiğimiz sorun giderme adımlarını sizin için tek bir devasa belgede toparlayan bir Özel Rapor (Tailored Report) oluşturmamı ister misiniz?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
