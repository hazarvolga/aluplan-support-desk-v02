# IFC Dışa Aktarımında Veri Kaybı ve Nitelik Eşleme (Attribute Mapping) Sorunları

## Sorun Özeti
Farklı BIM yazılımları (Revit, Tekla, ArchiCAD vb.) arasında veri transferi yaparken Allplan'daki niteliklerin (malzeme, maliyet kodu, yangın dayanımı) IFC dosyasında görünmemesi veya yanlış isimle çıkması.

## Belirtiler
- IFC dosyasını açtığınızda Property Setlerin (Pset) boş görünmesi.
- Miktar (Quantity) verilerinin (GrossVolume, GrossArea) hedef yazılımda eşleşmemesi.
- Özel (user-defined) niteliklerin tamamen kaybolması.

## Etkilenen Ortam
- **Yazılım:** Tüm Allplan sürümleri (Allplan 2026'da gelişmiş IFC4 desteği mevcuttur).
- **Format:** IFC 2x3, IFC 4, IFC 4.3.

## Kök Neden
- `.cfg` (Attribute Mapping) dosyasının yanlış yapılandırılması veya hiç seçilmemesi.
- "Yalnızca Atanan Nitelikleri Aktar" (Export Only Assigned Attributes) kutusunun yanlış kullanımı.

## Adım Adım Çözüm
1. **Dışa Aktarım Penceresini Açın:** `Dosya > Dışa Aktar > IFC Verisi`.
2. **Gelişmiş Ayarlar:** `Advanced Settings` sekmesine geçin.
3. **Haritalama Dosyası (.cfg):** `Attribute Mapping` alanında `New...` diyerek yeni bir dosya oluşturun veya mevcut uzman profilinizi seçin.
4. **Pset Tanımlama:** `Edit` butonuna tıklayarak Allplan niteliklerini standart IFC Psetleri ile eşleştirin. 
   - *Örnek:* Allplan `Volume` -> `Pset_QuantityTakeOff` > `GrossVolume`.
5. **Kontrol:** IFC'yi ücretsiz bir izleyici (Solibri Anywhere, BIMvision) ile açıp niteliklerin "Property Sets" sekmesinde olduğunu doğrulayın.

## Önleyici Öneriler
- Ofis genelinde tek bir standart `.cfg` dosyası kullanın.
- Allplan 2026 kullanıyorsanız, nitelik doğruluğu için **IDS (Information Delivery Specification)** kontrolünü iş akışına dahil edin.

## Etiketler
#BIM #IFC #AttributeMapping #VeriTransferi #OpenBIM
