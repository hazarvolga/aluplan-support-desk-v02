# Otomasyon ve Raporlama: Otomatik kolon/kiriş donatısı yerleşimi, dinamik büküm şemaları (Bending Sch

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T23:13:11.525285
> **Orijinal ID:** nlm-b137ca71

---

Destek Makalesi: Otomatik Donatılandırma ve Raporlama Yönetimi
Sorun Tanımı: Betonarme projelerde kolon ve kiriş donatılarının manuel olarak tek tek yerleştirilmesi ciddi zaman kaybına ve yüksek hata riskine neden olur
1
2
. Ayrıca, tasarımdaki revizyonların metrajlara elle aktarılması veya ofis standartlarına özgü özel donatı büküm şekillerinin (ShapeCodes) sistemde bulunmaması raporlama süreçlerini aksatır
3
4
.
Temel Çözüm Adımları:
Otomatik Donatılandırma: Aksiyon Çubuğundan (Actionbar) veya kütüphanedeki PythonParts altından otomatik kolon, kiriş veya duvar donatı araçlarını seçin
5
6
. Çap, aralık ve bindirme boyu gibi parametreleri girerek 3B donatıyı saniyeler içinde modele yerleştirin.
Dinamik Raporlar ve Büküm Şemaları: Modelleme tamamlandığında "Raporlar" (Reports) veya "Lejantlar" (Legends) aracını kullanarak donatı listelerini ve ölçülendirilmiş büküm şemalarını (Bending Schedules) otomatik olarak oluşturun
7
8
.
Şekil Kodu (Shape Code) Yönetimi: Standart dışı, özel büküm şekilleri eklemek isterseniz, Etc dizinindeki ShapeCodes klasöründe yer alan ShapeCodes_ACI.txt metin dosyasını düzenleyerek sisteme yeni şekil kodları tanımlayın
4
9
.
Dikkat Edilecek Noktalar:
Şekil kodlarında (ShapeCodes) yaptığınız özelleştirmelerin yazılım güncellemelerinde silinmemesi için, değiştirdiğiniz metin dosyasını mutlaka kendi Proje klasörünüze veya Std (Ofis Standardı) dizinine kopyalayın
4
9
.
Program lejant oluştururken şekil kodu dosyalarını okuma önceliğini sırasıyla Proje Klasörü, Std Klasörü ve en son Etc Klasörü olarak belirler
10
11
.
En İyi Uygulamalar (Best Practices):
Otomatik Güncelleme: Paftaya veya çizime yerleştirdiğiniz donatı lejantlarında "Otomatik Güncelle" (Update automatically) seçeneğini aktif tutun; böylece 3B modeldeki veya pozlardaki herhangi bir değişiklik metraj tablolarına anında yansır
4
7
.
Çizim Dosyası Filtresi (Drawing File Filters): Paftalarda karmaşayı önlemek için lejantlarınıza filtreler uygulayın. Böylece tablolarda sadece seçtiğiniz spesifik çizim dosyalarına (örneğin sadece 1. Kat Kolonları) ait donatıların listelenmesini sağlayabilirsiniz
4
9
.
Bu otomasyon araçlarıyla betonarme detaylandırma iş yükünü büyük ölçüde hafifletmiş oluyoruz. Dilerseniz oluşturduğumuz bu yapısal modellerin saha planlamasını yapmak üzere 4B İnşaat Simülasyonu ve Şantiye Lojistiği (BIM2Field) özelliklerine geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
