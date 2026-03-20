# 2. OpenBIM, IFC ve Veri Yönetimi

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:34:22.780030
> **Orijinal ID:** nlm-d51514bf

---

Destek Makalesi: OpenBIM, IFC Veri Yönetimi ve Nitelik Eşleme
Sorun Tanımı: Farklı yazılımlar kullanan disiplinler (mimari, statik, MEP) arasında model paylaşılırken veri kaybı yaşanması, IFC dosyalarının gereksiz yere şişmesi ve maliyet/metraj gibi bilgilerin hedef programa yanlış veya eksik aktarılması.
Temel Çözüm Adımları:
Doğru IFC Sürümünü Seçme: İhtiyaca göre IFC 2x3, IFC 4 veya köprü, yol gibi altyapı projeleri için özel olarak genişletilmiş IFC 4.3 standardını belirleyin
1
2
.
Nitelik Eşleme (Attribute Mapping): Dışa aktarım ayarlarında "Allplan'dan IFC'ye Dönüşüm Yönü" menüsünü kullanın
3
. Allplan'daki "Hacim" ve "Alan" verilerini Pset_QuantityTakeOff kümesine, "Maliyet Kodu" ve "Birim Fiyat" gibi bilgileri ise Pset_Cost kümesine bağlayarak standartlaştırın
4
more_horiz
.
IDS (Bilgi Teslim Şartnamesi) Denetimi: Dışa aktarımdan önce, buildingSMART'ın IDS standardını (.json dosyası) kullanarak modelinizi taratın
7
more_horiz
. Bu sayede, örneğin duvarların "yangın dayanım sınıfı" gibi zorunlu bilgileri içerip içermediğini otomatik olarak denetleyebilirsiniz
9
.
Dikkat Edilecek Noktalar:
Modeldeki her şeyi dışarı aktarmak yerine, menüden "Yalnızca Atanan Nitelikleri Aktar" seçeneğini işaretleyerek veri kirliliğini önleyin ve dosya boyutunu büyük oranda düşürün
3
10
.
En İyi Uygulamalar (Best Practices):
Hafif Geometri Optimizasyonu: Modelin hedef yazılımda daha hızlı açılması için, dışa aktarımda karmaşık ve ağır bir hesaplama olan B-rep (Boundary Representation) yerine, SweptSolid (Süpürülmüş Katı) veya ExtrudedArea (Ekstrüde Edilmiş Alan) gibi daha hafif geometri temsillerini tercih edin
4
10
.
Bu adımlar modelinizin veritabanı kalitesini garanti altına alır. Buradan OpenBIM iş akışlarının bir sonraki adımı olan, modelleri bulutta birleştirip hataları tespit ettiğimiz Bimplus ve BCF ile Çakışma Yönetimi konusuna geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
