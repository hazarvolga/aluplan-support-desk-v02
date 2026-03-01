# Allplan 2026: Hotfix ve Güncelleme Notları (Kritik Çözümler)

## Özet
Allplan 2026 sürümü için yayınlanan son hotfix'ler (2026-0-3 ve 2026-0-4), performans, stabilite ve veri değişimi konularında önemli düzeltmeler içermektedir.

## Kritik Hotfix Detayları

### Hotfix 2026-0-4 (18 Şubat 2026)
- **Allplan Share:** Takım çalışması projelerinde grafiksel geçersiz kılma (graphical override) hataları düzeltildi.
- **GeoPackage:** Veri dışa/içe aktarımında yaşanan kararlılık sorunları giderildi.
- **Donatı:** Dairesel donatı kancalarının IFC'ye hatalı aktarılması sorunu çözüldü.
- **UI:** Koyu Mod (Dark Mode) için görsel iyileştirmeler ve nesne kopyalama sırasında yaşanan çökmelerin önüne geçildi.

### Hotfix 2026-0-3 (22 Ocak 2026)
- **AutoCAD DWG:** Dışa aktarım hızı önemli ölçüde artırıldı.
- **IFC Export:** Jeoreferans ayarlarında modelin rotasyonlu (dönmüş) çıkması sorunu düzeltildi.
- **Python:** Gömülü Python sürümü **3.13.9** sürümüne güncellendi.
- **Visual Scripting:** Bazı .vss dosyalarının açılmaması sorunu giderildi.

## Önerilen Teşhis ve Çözüm
1. **Sürüm Kontrolü:** `Help > About Allplan` adımlarını izleyerek hangi hotfix sürümünde olduğunuzu kontrol edin.
2. **Otomatik Güncelleme:** Allplan Update aracını kullanarak en az 2026-0-4 sürümüne yükseltme yapın.
3. **PythonParts Hataları:** Eğer bu güncelleme sonrası PythonParts scripts çalışmıyorsa, Python 3.13.9 uyumluluğunu kontrol edin.

## Etiketler
#Allplan2026 #Hotfix #Güncelleme #HataGiderme #BIM
