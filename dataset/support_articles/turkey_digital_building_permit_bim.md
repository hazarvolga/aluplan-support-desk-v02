# Dijital Yapı Ruhsatı ve BIM: 2027 Hedefli Allplan Standartları

Bakanlığın 1 Ocak 2027 tarihinde tam kapasiteyle geçmeyi hedeflediği "BIM Standartlarına Uygun Dijital Ruhsat" süreci için Allplan modellerinin hazırlık rehberidir.

## 1. Sayısal Proje Onay Esasları
Mart 2024'te yürürlüğe giren düzenleme ile ruhsat eki olan tüm projeler (mimari, statik vb.) artık kağıtsız, veri altyapısı üzerinden kontrol edilecektir.
- **Allplan Formats:** Projeler .pdf (imzalı) olmanın ötesinde, yapılandırılmış BIM verisi (IFC 4.0/4.3) olarak talep edilecektir.
- **Metadata Zorunluluğu:** Her elemanın ID'si, koordinat verisi ve malzeme nitelikleri 'Common Data Environment' (CDE) standartlarında (Bimplus) eksiksiz olmalıdır.

## 2. BIM Model Kontrol Kriterleri
Belediye denetçilerinin Allplan modellerini dijital ortamda otomatik denetlerken (Smart Check) bakacağı hususlar:
- **Geometrik Doğruluk:** Elemanların boşluksuz (Clash-free) birleşimi.
- **Information Delivery (LOD/LOI):** Ruhsat aşamasında LOD 300-350 seviyesinde detay beklenmektedir.
- **Nitelik Eşleşmesi:** Bağımsız bölüm listelerinin Allplan 'Attributes' ile yapı ruhsatı beyannamesindeki veriler arasında %100 örtüşmesi.

## 3. E-Ruhsat ve E-İmza Entegrasyonu
- **Süreç:** Allplan'da üretilen tüm dokümantasyon (Metraj, Rapor, Plan) e-imza ile damgalanarak 'Universe' veya 'Netcad' tabanlı belediye portallarına 'Upload' edilmelidir.
- **Bimplus Onay Mekanizması:** Belediye, müellif ve denetçi arasındaki revizyon akışı Bimplus 'Issue Manager' üzerinden BCF formatında yürütülmekte, bu da ozalit israfını sıfırlamaktadır.

## 4. Teknik Şartname Uyumu
Bakanlık, Türkiye'nin kendine özgü yapı uygulamaları (örneğin İstanbul Metro Hattı deneyimi) doğrultusunda kendi BIM teknik şartnamesini tanımlamıştır. Allplan projelerinde bu şartnamedeki 'Parameter Naming Convention' (Parametre Adlandırma Kuralı) harfiyen uygulanmalıdır.
