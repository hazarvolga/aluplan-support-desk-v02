# Kalite Kontrol ve Standartlar: IDS (Information Delivery Specification) ile zorunlu veri kontrolü, M

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:41:30.285551
> **Orijinal ID:** nlm-ce600175

---

Destek Makalesi: IDS ve MVD ile BIM Veri Kalitesi ve Standart Yönetimi
Sorun Tanımı: BIM projelerinde farklı disiplinler arasında model paylaşılırken eksik, hatalı veya standart dışı bilgi girilmesi; modelin işverenin bilgi gereksinimlerini karşılayamaması ve gereksiz verilerle şişerek koordinasyon süreçlerini yavaşlatması
1
more_horiz
.
Temel Çözüm Adımları:
MVD (Model Görünüm Tanımı) Seçimi: Dışa aktarım yaparken modelin kullanım amacına uygun MVD şablonunu belirleyin. Genel mimari, statik ve MEP koordinasyonu için IFC2x3 Coordination View 2.0 MVD'sini; Birleşik Krallık standartlarındaki gibi tesis yönetimi ve işletme devir süreçleri için ise COBie (Construction Operations Building Information Exchange) MVD'sini seçin
4
5
. Bu sayede yalnızca o iş akışı için gerekli veri setleri dışa aktarılır.
IDS (Bilgi Teslim Şartnamesi) Entegrasyonu: buildingSMART standardı olan IDS dosyalarını (.json formatında) projenin başında Allplan'a yükleyerek işverenin zorunlu bilgi kurallarını sisteme tanıtın
6
7
.
Otomatik Veri Denetimi: Allplan, tüm BIM modelini bu IDS dosyasına göre tarar. Modeldeki bileşenlerin zorunlu niteliklere (örneğin, taşıyıcı duvarların yangın dayanım sınıfına) sahip olup olmadığını ve girilen bu bilgilerin kabul edilebilir değer aralıklarında (örneğin malzemenin sadece "Beton" veya "Çelik" olması) olup olmadığını otomatik olarak denetler
1
more_horiz
. Hatalı veya eksik bırakılan veriler anında raporlanır
7
.
Dikkat Edilecek Noktalar:
Sistemin doğru çalışabilmesi ve uluslararası standart veri alanlarının (PSet'ler) aktif olabilmesi için, elemanlara modelleme aşamasında doğru IFC Sınıflandırmasının (örneğin, bir duvar için IfcWall) atanmış olması zorunludur
9
10
. Aksi takdirde, IDS kontrolleri elemanı doğru yorumlayamaz.
En İyi Uygulamalar (Best Practices):
Proje Başı Standardizasyon: Herkesin aynı nitelik formatında veri girmesini zorunlu kılmak için projenin en başında "Nitelik Şablonları" (Attribute Templates) oluşturun
11
.
Aktarım Öncesi Kalite Kontrolü: Modelinizi diğer disiplinlerle paylaşmadan veya dışa aktarmadan önce mutlaka IDS denetiminden geçirin. Bu, hatalı verileri düzeltmek için harcanan zamanı azaltır ve paydaşlara standartlara tam uyumlu modeller teslim etmenizi garanti eder
2
12
.
Veri doğruluğunu IDS ve MVD standartlarıyla da güvence altına aldık. Tüm bu kalite kontrol süreçlerini bir adım öteye taşıyıp modelin geometrik ve mimari kurallara uygunluğunu gerçek zamanlı denetleyen Solibri Entegrasyonu özelliklerine geçelim mi? Yoksa şimdiye kadar oluşturduğumuz makalelerden genel raporumuzu mu hazırlayalım?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
