# Akıllı Mimari Elemanlar: Parametrik duvar, döşeme, kapı, pencere, çatı, merdiven ve çok katmanlı yap

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T23:01:46.699699
> **Orijinal ID:** nlm-973cb970

---

Destek Makalesi: Akıllı Mimari Elemanlar ve Çok Katmanlı Yapı Bileşenleri
Sorun Tanımı: Geleneksel 2B çizim yöntemlerinde mimari elemanların (duvar, kapı, pencere vb.) birbirinden bağımsız olması, tasarımda yapılan tek bir değişikliğin plan, kesit ve görünüşlere manuel olarak işlenmesini gerektirir. Bu durum hem zaman kaybına hem de metrajların hatalı hesaplanmasına yol açar.
Temel Çözüm Adımları:
Araç Seçimi ve Tanımlama: Aksiyon Çubuğundaki (Actionbar) "Mimari" rolünden Duvar, Döşeme, Merdiven veya Çatı gibi araçları seçin
1
. Özellikler Paletini kullanarak elemanın kalınlık, kot ve malzeme gibi temel parametrelerini tanımlayın
2
.
Çok Katmanlı Bileşenler Oluşturma: Yalıtımlı dış duvarlar veya katmanlı döşemeler oluştururken her bir yapı katmanı için (sıva, yalıtım, taşıyıcı vb.) ayrı kalınlık, yükseklik ve malzeme tanımlaması yapın
3
4
.
Akıllı Boşluklar ve SmartParts: Duvarlara yerleştirdiğiniz kapı ve pencere boşluklarına "SmartPart" (Akıllı Nesne) adı verilen parametrik elemanları ekleyin
5
6
. SmartPart'lar, yerleştirildikleri duvar boşluğunun ebatlarına otomatik olarak adapte olur
5
7
. Pervaz, kasa ve kanat detaylarını yine Özellikler Paleti üzerinden anında değiştirebilirsiniz
2
.
Dikkat Edilecek Noktalar:
Öncelik (Priority) Hiyerarşisi: Farklı yapı elemanları veya çok katmanlı duvarlar kesiştiğinde, sistem "Öncelik" değerine bakar. Düşük öncelik değerine sahip eleman (örneğin sıva), yüksek önceliğe sahip eleman (örneğin betonarme duvar) tarafından otomatik olarak kesilir
8
9
. Bu sayede kesişim noktalarında metrajların mükerrer (çift) hesaplanması engellenir
9
.
Dinamik Yükseklik (Default Planes): Duvar ve kolon gibi dikey elemanların yüksekliklerini doğrudan metre cinsinden sabit girmek yerine, alt ve üst sınırlarını "Varsayılan Düzlemlere" (Default Planes) bağlayın
5
10
. Böylece projenizin kat yüksekliği sonradan değiştiğinde, tüm mimari bileşenler bu yeni yüksekliğe otomatik olarak esneyip kendini günceller
11
.
En İyi Uygulamalar (Best Practices):
Veriyi Baştan Girin: Çizime başlarken bileşenlerin "Hesaplama Modu" (m², m³ vb.) ve "Yapı Ticareti/İşçilik" (Trade) gibi niteliklerini hemen doldurun
9
12
. Modelleme bittiğinde maliyet ve metraj raporlarınız otomatik olarak hatasız hazır olacaktır
12
.
Favori (Favorite) Kullanımı: Özelleştirdiğiniz çok katmanlı karmaşık duvarları veya kendi tasarladığınız parametrik SmartPart kapı/pencereleri kütüphaneye "Favori" olarak kaydedin
2
13
. Bu sayede her projede sıfırdan ayar yapmak yerine, ofis standartlarınızı tek tıkla çağırabilirsiniz
2
.
Mimari modellemenin temel taşı olan bu akıllı elemanların mantığını da netleştirmiş olduk. Dilerseniz bu parametrik elemanların (özellikle kapı, pencere, panjur) beyni olan SmartParts sisteminin detaylarına inelim mi? Yoksa taşıyıcı sistemlerin modellendiği İnşaat Mühendisliği ve Statik araçlarına mı geçmek istersiniz?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
