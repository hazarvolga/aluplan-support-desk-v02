# Allplan 2021-2025: Kronik Hatalar ve Çözüm Arşivi

## Özet
Allplan'ın son 5 yılındaki farklı sürümlerde kullanıcıların en çok karşılaştığı kronik sorunlar ve hotfix dışı çözümler.

## Versiyon Bazlı Kritik Sorunlar

### Allplan 2025: Hyper Slab (Döşeme) Güncelleme Hatası
**Sorun:** Eski projeleri 2025'e yükseltirken döşemelerin referanslarını kaybetmesi.
**Geçici Çözüm:** Hyper Slab nesnesine manuel olarak bir nitelik (Attribute) atamak veya verinin kendini "iyileştirmesi" için Allplan 2025-0-3 Hotfix ve sonrasını yüklemek.

### Allplan 2023: Başlatma (Launch) Failures
**Sorun:** Güncelleme sonrası programın hiç açılmaması.
**Çözüm:** Allplan Setup dosyası üzerinden "Repair" yapmak yerine tam bir yeniden kurulum (Full Download) yapılması önerilir. Bazı durumlarda yönetici haklarıyla manuel kurulum gereklidir.

### Allplan 2022: Vulkan Modu ve Sunum Çökmeleri
**Sorun:** Render veya animasyon modunda programın kapanması.
**Çözüm:** Ayarlardan ekran kartı modunu "GDI" veya uyumluluğa geri çekmek.

## Genel Hata Kodları

| Kod / Durum | Çözüm |
| :--- | :--- |
| **Drawing File Locked** | Workgroup sunucusunda `lock.lok` dosyalarını temizleyin. |
| **Layers Disappeared** | Proje ayarlarından "Path Settings"in "Project" olarak seçili olduğundan emin olun. |
| **XRef Loading Error** | Referans dosya yolunun kısalığını ve Türkçe karakter içermediğini kontrol edin. |

## Etiketler
#LegacySupport #Allplan2023 #Allplan2025 #HataKütüphanesi #BIM
