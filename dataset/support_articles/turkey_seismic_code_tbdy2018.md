# TBDY 2018 ve Allplan: Deprem Güvenliği Detaylandırma Rehberi

Türkiye Bina Deprem Yönetmeliği (2018) kurallarının Allplan Engineering modülünde hatasız uygulanması için gerekli teknik dökümantasyondur.

## 1. Enine Donatı (Etriye) Sıklaştırma Bölgeleri
TBDY 2018, kolon ve kiriş uç bölgelerinde (sarılma bölgeleri) etriye sıklaştırmasını zorunlu kılar.
- **Kolon Sarılma Bölgesi:** Kolonun alt ve üst uçlarında, `ln/6`, kolon büyük boyutu veya `50cm` değerlerinden en büyüğü kadar olan bölgede sıklaştırma yapılır.
- **Allplan Uygulaması:** 'Reinforcement Specification' ekranında `Spacing` (Aralık) değerini sarılma bölgesinde `s = min(b_min/3, 10cm, 15cm)` kuralına göre (genelde 10cm) kurgulayın. Orta bölgede bu aralık `s = min(b_min/2, 20cm)` (genelde 20cm) olarak güncellenmelidir.
- **Etriye Çapı:** TBDY 2018 gereği kolonlarda min. `Ø8` etriye kullanılmalıdır.

## 2. Kolon-Kiriş Birleşim Bölgeleri (Kesme Güvenliği)
Yönetmeliğin en kritik noktalarından biri 'Güçlü Kolon-Zayıf Kiriş' prensibi ve birleşim bölgesi kesme güvenliğidir.
- **Kuşatılmış Birleşim:** Kiriş genişliği kolon genişliğinin en az 3/4'ü ise.
- **Allplan Check:** Birleşim bölgesindeki yatay etriyelerin devamlılığını 'Section' (Kesit) araçlarıyla kontrol edin. Kuşatılmamış birleşimlerde kolon sarılma bölgesi etriyelerinin tamamı birleşim boyunca devam ettirilmelidir.

## 3. Donatı Kenetlenme (Kanca) Boyları
Deprem anında donatının betondan sıyrılmaması için kanca detayları hayati önem taşır.
- **Standart Kanca:** TBDY 2018'e göre 135 derecelik kancalar zorunludur.
- **Allplan Ayarı:** 'Bending Shape' (Büküm Şekli) kütüphanesinde kanca açılarını 135 dereceye sabitleyin ve kanca boyunun `min(10Ø, 10cm)` kuralına uyduğunu parametrik olarak denetleyin.

## 4. Süneklik Düzeyi Yüksek Sistemler
- **Donatı Sınıfı:** TBDY 2018 uyarınca sadece `B420C` veya `B500C` nervürlü çelik sınıfları kullanılmalıdır. Allplan 'Material Catalog'da bu sınıflar haricindeki çeliklerin kullanımını kısıtlayın.
- **Bindirmeli Ekler:** Donatı eklerinin sarılma bölgeleri dışında yapılmasını sağlayın. Ek boyunu `1.5 * lb` (lb: kenetlenme boyu) olarak Allplan hesap tablolarına enjekte edin.

## 5. Sismik İzolatör Modelleme (Opsiyonel)
- **Allplan 3D:** Sismik izolatörleri 'Custom Object' olarak modelleyin ve Bimplus üzerinde bu elemanlara üretici verilerini (Sönümleme katsayısı, Yer değiştirme kapasitesi) nitelik olarak atayın.
