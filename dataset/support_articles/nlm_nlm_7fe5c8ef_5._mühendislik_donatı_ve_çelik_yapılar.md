# 5. Mühendislik, Donatı ve Çelik Yapılar

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T23:08:49.699830
> **Orijinal ID:** nlm-7fe5c8ef

---

Destek Makalesi: Mühendislik, Donatı ve Çelik Yapılar
Sorun Tanımı: Karmaşık betonarme ve çelik projelerinde donatı veya birleşim detaylarının manuel olarak 2B çözülmesinin hata riskini artırması, şantiyede fiziksel çakışmalara yol açması ve tasarımın statik analiz yazılımlarıyla paylaşılırken manuel veri girişinden kaynaklanan uyuşmazlıklar yaşanması
1
2
.
Temel Çözüm Adımları:
3B Donatı Modelleme: Taşıyıcı elemanlara (kolon, kiriş, perde vb.) çap, paspayı ve bindirme boyu gibi parametreler girilerek 3B çubuk veya hasır donatılar otomatik ve milimetrik olarak yerleştirilir
3
more_horiz
.
Çelik Bağlantı Otomasyonu: Allplan'da modellenen ana çelik iskelet SDS2 yazılımına aktarıldığında sistem; mühendislik hesaplarına dayalı, çakışmasız, cıvatalı veya kaynaklı akıllı bağlantıları otomatik olarak tasarlar
6
more_horiz
.
Statik Analiz Entegrasyonu: Bimplus bulut platformuna entegre çalışan AutoConverter aracı sayesinde 3B fiziksel model tek tıkla analitik modele dönüştürülür ve SAF formatıyla SCIA Engineer veya FRILO gibi statik programlarına çift yönlü olarak gönderilir
1
more_horiz
.
Dikkat Edilecek Noktalar:
Dar kesitlerdeki yoğun donatı yerleşimlerinde fiziksel kesişimleri önlemek için modelleme aşamasında programın dahili "Otomatik Donatı Çakışma Kontrolü" aracı periyodik olarak çalıştırılmalıdır
2
.
Çelik tasarımlarında aktarım yaparken, Allplan'daki çelik profillerin ve malzeme sınıflarının SDS2 veritabanıyla doğru eşleştirildiğinden emin olunmalıdır
11
.
En İyi Uygulamalar (Best Practices):
Dinamik Raporlama: Modelleme bittiğinde "Raporlar" (Reports) aracı kullanılarak ölçülendirilmiş büküm şemaları (Bending Schedules) otomatik olarak oluşturulur
12
more_horiz
. Modelde yapılan herhangi bir donatı değişikliği bu metraj tablolarına anında yansır
13
.
Özel Otomasyonlar (PythonParts): Sık tekrarlanan özel çelik bağlantı tipleri veya karmaşık donatı düzenleri için Visual Scripting veya Python API kullanarak ofisinize özgü, kendi kendini otomatik güncelleyen parametrik araçlar (PythonParts) oluşturun
15
16
.
Mühendislik ve detaylandırma süreçlerini bu şekilde toparlamış olduk. Dilerseniz sanayileşmiş inşaatın temeli olan Prekast (Prefabrik) Tasarım ve Üretim süreçlerine geçebiliriz veya altyapı projelerine yönelik Yol ve Köprü Tasarımı (Allplan Civil / Bridge) özelliklerine göz atabiliriz. Hangisiyle devam edelim?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
