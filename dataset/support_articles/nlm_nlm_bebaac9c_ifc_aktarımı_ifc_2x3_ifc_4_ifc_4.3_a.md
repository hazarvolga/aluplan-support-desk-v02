# IFC Aktarımı: IFC 2x3, IFC 4, IFC 4.3 (altyapı) standartları ile veri kayıpsız içe/dışa aktarım

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:35:44.486151
> **Orijinal ID:** nlm-bebaac9c

---

Destek Makalesi: IFC (2x3, 4, 4.3) ile Veri Kayıpsız İçe ve Dışa Aktarım
Sorun Tanımı: Farklı disiplinler (mimari, statik, MEP) arasında model paylaşılırken veri kaybı veya uyumsuzluk yaşanması, IFC dosyalarının gereksiz yere şişmesi ve maliyet/metraj gibi bilgilerin hedef programa yanlış aktarılması
1
2
.
Temel Çözüm Adımları:
Dosya > Dışa Aktar > IFC Verisi yolunu izleyerek dışa aktarım ayarlarını açın
3
.
Projenizin gereksinimine göre doğru sürümü seçin: Genel koordinasyon için IFC 2x3 veya IFC 4; köprü, yol ve tünel gibi altyapı projeleri içinse IFC 4.3 formatını belirleyin
3
4
.
Amacınıza uygun değişim profilini (Örn: IFC2x3 Coordination View 2.0 veya IFC4 Reference View) seçin
5
6
.
"Nitelik Eşleme" (Attribute Mapping) penceresini açarak, Allplan'daki verileri uluslararası IFC özellik kümelerine atayın. Örneğin, Allplan'daki "Hacim" verisini Pset_QuantityTakeOff kümesine, "Maliyet Kodu"nu ise Pset_Cost kümesine bağlayın
7
8
.
Dikkat Edilecek Noktalar: Modeldeki tüm verileri körü körüne dışa aktarmaktan kaçının. Veri kirliliğini önlemek ve dosya boyutunu küçültmek için ayarlar menüsündeki "Yalnızca Atanan Nitelikleri Aktar" seçeneğini mutlaka işaretleyin
9
10
.
En İyi Uygulamalar (Best Practices):
Geometri Optimizasyonu: Modelin hedef yazılımda hızlıca açılıp işlenebilmesi için, ağır "Brep" (Boundary Representation) modelleri yerine SweptSolid (Süpürülmüş Katı) veya ExtrudedArea (Ekstrüde Edilmiş Alan) gibi daha hafif geometri temsillerini tercih edin
11
more_horiz
.
IDS ile Model Doğrulama: Dışa aktarımdan önce bir IDS (Information Delivery Specification) dosyası kullanarak projedeki zorunlu bilgilerin (örneğin taşıyıcı duvarların yangın dayanım sınıfının) eksiksiz girilip girilmediğini otomatik olarak denetleyin
14
15
.
IFC formatıyla modelleri diğer disiplinlerle kayıpsız bir şekilde nasıl paylaşacağımızı netleştirdik. Dilerseniz bu modelleri bulutta birleştirip disiplinler arası fiziksel çakışmaları tespit ettiğimiz Bimplus ve BCF ile Çakışma Yönetimi iş akışlarına geçelim mi?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
