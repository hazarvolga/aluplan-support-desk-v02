# Nitelik Eşleme (Attribute Mapping): Allplan verilerinin Pset_QuantityTakeOff, Pset_Cost gibi uluslar

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:38:38.739798
> **Orijinal ID:** nlm-f94433eb

---

Destek Makalesi: IFC Dışa Aktarımında Nitelik Eşleme (Attribute Mapping) ve Özel Pset Tanımları
Sorun Tanımı Farklı disiplinler ve BIM yazılımları (örneğin Allplan'dan maliyetlendirme veya tesis yönetimi yazılımlarına) arasında model paylaşılırken metraj, maliyet, performans veya malzeme gibi verilerin kaybolması, yanlış yorumlanması veya aktarılan IFC dosyasının gereksiz verilerle şişmesi
1
2
.
Temel Çözüm Adımları
Dışa Aktarım Ayarları: Dosya > Dışa Aktar > IFC Verisi yolunu izleyip Gelişmiş Ayarlar (Advanced) sekmesine geçin
3
4
.
Profil Oluşturma: Nitelik Eşleme alanında mevcut bir profili seçin veya Yeni... butonuna tıklayarak amaca özel yeni bir eşleme dosyası (.cfg dosyası) oluşturun
4
5
.
Eşleme Kurallarını Tanımlama: Düzenle butonuna tıklayarak "Allplan'dan IFC'ye Dönüşüm Yönü" penceresini açın
4
5
. Burada Allplan niteliklerini IFC standartlarına (Property Sets - Pset) bağlarsınız.
Metraj ve Maliyet (Standart Pset) Eşlemeleri:
Allplan'daki "Hacim" ve "Alan" niteliklerini, IFC standardı olan Pset_QuantityTakeOff kümesindeki GrossVolume ve GrossArea değerlerine eşleyin
6
7
.
Kullanıcı tanımlı "Maliyet Kodu" ve "Birim Fiyat" gibi bilgileri, Pset_Cost altındaki CostCode ve UnitCost alanlarına yönlendirin
7
8
.
Özel Pset (Custom Pset) Tanımları: Tesis yönetimi (FM) gibi projeye veya firmaya özgü spesifik veri talepleri varsa, standartların dışına çıkarak tamamen kendi isimlendirdiğiniz özel Pset'ler (örneğin Pset_MYPROJECT_Wall) oluşturabilir ve verilerinizi sıfır kayıpla aktarabilirsiniz
9
more_horiz
.
Dikkat Edilecek Noktalar
Dosya boyutunu küçültmek ve alıcı yazılımda veri kirliliği (Over-Modeling) yaratmamak için Yalnızca Atanan Nitelikleri Aktar seçeneğini mutlaka işaretleyin
2
more_horiz
.
Nitelik atamalarında öncelik hiyerarşisi vardır: Allplan dışa aktarım ayarlarında yaptığınız özel atamalar, ofis standartlarındaki (...\STD) varsayılan eşleme dosyalarından her zaman daha yüksek önceliğe sahiptir
13
.
En İyi Uygulamalar (Best Practices)
Amaca Yönelik Filtreleme: Modeli "Tam Aktarım" ile dışarı aktarmak yerine, hedef yazılımın (örneğin sadece 5D maliyet hesabı yazılımı) ihtiyacına uygun olacak şekilde filtreleyin
9
10
. Dışa aktarılacak çizim dosyalarından peyzaj veya mobilya gibi gereksiz detayları çıkarın
14
15
.
IFC Sınıfı (Class) Doğrulaması: Pset eşlemelerinin çalışabilmesi için, modelleme esnasında elemanların doğru IFC sınıfına (örneğin genel bir proxy yerine IfcWall veya IfcSlab olarak) atanmış olduğundan emin olun
2
16
.
Nitelik Şablonları: Farklı disiplinlerin aynı nesne için farklı isimlendirmeler kullanmasını önlemek adına, proje başında ortak "Nitelik Şablonları" oluşturarak herkesin aynı nitelik formatında veri girmesini zorunlu kılın
17
.
Modelinizin içerdiği bu değerli bilgilerin eksiksiz girildiğini dışa aktarım öncesinde otomatik olarak denetleyen IDS (Information Delivery Specification) standardı kullanımına geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
