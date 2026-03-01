# Allplan 2026: Öncelik Tabanlı Bağlantılar (PBC) Etkileşim Sorunları

## Sorun Özeti
Allplan 2026 ile gelen **Priority-Based Connections (PBC)** özelliği, özel modellenmiş bileşenler ile yerel yapı elemanları (duvar, kolon, döşeme) arasındaki otomatik etkileşimi yönetir. Bazı durumlarda bu etkileşim (kesişim/birleşme) beklenmedik sonuçlar verebilir veya hiç çalışmayabilir.

## Belirtiler
- Özel bileşenin duvarı veya döşemeyi otomatik olarak kesmemesi.
- Birleşme noktalarında geometrik bozulmalar (overlap/z-fighting).
- "Priority" (Öncelik) değerlerinin dikkate alınmaması.

## Etkilenen Ortam
- **Yazılım:** Allplan 2026 ve sonrası.
- **Bileşen Türü:** Custom Components (Özel Bileşenler) ve Yerel BIM Elemanları.

## Kök Neden
- Elemanlara atanan **Priority (Öncelik)** değerlerinin hatalı veya çakışan olması.
- Allplan 2026 öncesi modellenmiş eski bileşenlerin PBC desteğine sahip olmaması.

## Adım Adım Çözüm
1. **Öncelik Değerlerini Kontrol Edin:** Hem özel bileşenin hem de etkileşime girdiği duvarın özellikler (Properties) paletindeki "Priority" değerini inceleyin. Yüksek değere sahip eleman, düşük değerli elemanı "keser".
2. **PBC Modunu Aktif Edin:** Özel bileşenin ayarlarında "Priority-Based Connection" seçeneğinin işaretli olduğundan emin olun.
3. **Katman (Layer) Kontrolü:** Elemanların etkileşime girmesi için aynı veya uyumlu katmanlarda olması gerekebilir.
4. **Yeniden Hesaplama:** `F5` tuşu veya `Rebuild Model` komutu ile modeli güncelleyin.

## Önleyici Öneriler
- Ofis standartlarınızda her eleman tipi için (Örn: Betonarme Duvar = 300, Alçıpan Pano = 100) standart öncelik değerleri belirleyin.
- Karmaşık şekiller için PBC yerine gerekirse Manuel Boolean işlemlerini yedek olarak kullanın.

## İlgili Konular
- Allplan 2026 Özel Bileşen Geliştirmeleri
- Boşluk (Void) Performans Sorunları

## Etiketler
#Allplan2026 #PBC #BIM #Modelleme #HataGiderme
