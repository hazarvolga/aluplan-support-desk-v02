# Allplan Türkiye Yerel Uygulama ve Teknik Rehber

Türkiye'deki inşaat ve mühendislik pratiklerine göre özelleştirilmiş, kamu projeleri (Bakanlık standartları) ve yerel kullanıcı alışkanlıklarına odaklanan teknik notlardır.

## 1. Kamu Projeleri ve Poz No Entegrasyonu
Türkiye'deki projelerde metraj çıkarırken kamu birim fiyat (Poz No) yapısına uyum kritiktir.
- **Çözüm:** Allplan'daki `Object Manager` (Nesne Yöneticisi) üzerinden her elemana `Poz_No` adında özel bir 'Attribute' (Nitelik) tanımlayın. Visual Scripting kullanarak bu Poz numaralarını tek tıkla Excel metraj listesine aktarabilirsiniz.
- **İpucu:** Bakanlık projeleri için `DIN 276` rapor şablonlarını, yerel `ÖY` (Özel Yollar) ve `Y` (Yapı) poz kodlarına göre maskeleyen bir `.rdlc` (Report Design) dosyası oluşturun.

## 2. Türkçe Karakter ve PDF Karakter Sorunları
Allplan'dan PDF alırken 'ç, ğ, ş, İ' gibi harflerin bozuk çıkması kronik bir yerel problemdir.
- **Kök Neden:** Yazı tipi (Font) tablosunun PDF motoruna gömülmemesi.
- **Düzeltme:** Yazı tipi ayarlarında 'Embed Fonts' (Fontları Göm) seçeneğini işaretleyin. Ayrıca, arayüzde 'Smarter font' yerine 'Allplan Font 1' (Vector font) kullanmak, çıktıdaki tutarlılığı artırır.

## 3. Yerel Beton ve Çelik Sınıfları (TS EN Uyumu)
Global Allplan kütüphanelerinde bazen Türkiye'ye özel malzeme isimleri eksik olabilir.
- **Yapılandırma:** 'Engineering' paletindeki malzeme listesini `C25/30`, `C30/37` ve `B420C` (S420) standartlarına göre güncelleyin. 
- **Expert Note:** TS EN 206-1 standardına uygun beton sınıflarını 'Catalogue' modülü üzerinden bir kez tanımlayıp ana şablon (Project Template) olarak kaydedin.

## 4. Allplan-Revit-Bimplus Yerel Veri Akışı
Türkiye'deki çok disiplinli projelerde veri kaybını önleme stratejisi:
- **IFC Ayarı:** Türkiye'deki mimari ofislerin genelde Revit kullandığı göz önüne alındığında, Allplan'dan veri gönderirken `IFC 2x3 Coordination View 2.0` yerine `IFC4 Design Transfer View` kullanılması, parametrelerin (Hacim, Alan) Revit tarafında 'editable' (düzenlenebilir) kalmasını sağlar.
