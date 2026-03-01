# PythonParts SDK ve Geliştirme Hataları (Allplan 2026)

## Sorun Özeti
Allplan Python API üzerinden geliştirme yaparken karşılaşılan SDK yükleme hataları, script yenileme (reloader) sorunları ve eksik modül hataları.

## Yaygın Hatalar ve Çözümler

### 1. "No module named 'TestHelper.Mock'" Hatası
**Neden:** Allplan güncellemeleri sonrası PythonParts framework dosyalarının senkronizasyonunun bozulması.
**Çözüm:** `ETC\PythonPartsFramework` klasöründeki SDK dosyalarını orijinal setup dosyaları ile yenileyin veya Allplan Repair yapın.

### 2. Kod Değişikliklerinin Yansıması (Reloader)
**Durum:** Allplan 2024 ve sonrası sürümlerde performans sebebiyle "Reloader" varsayılan olarak kapalıdır.
**Çözüm:** 
- Geliştiriciler için **Allplan PythonParts SDK**'yı resmi kanaldan indirin.
- Python SDK içindeki "Enable Reloader" seçeneğini aktif edin.
- Not: NumPy kullanan scriptlerde reloader çakışma yaratabilir, bu durumda Allplan restart gereklidir.

### 3. Python Sürüm Uyumsuzluğu
**Allplan 2026:** Python 3.13.9 kullanır. 
**Öneri:** Eski Python sürümüyle yazılmış (örn: 3.8) kütüphanelerin bu sürümle uyumlu olduğundan (Pip install upgrade) emin olun.

## Geliştirici İpuçları
- **Trace Window:** `Ctrl + F3` kombinasyonuyla "Trace Window"u açarak Python çalışma zamanı hatalarını gerçek zamanlı izleyin.
- **GitHub:** `NemetschekAllplan/PythonPartsExamples` deposundaki güncel 2026 örneklerini inceleyin.

## Etiketler
#PythonParts #SDK #AllplanAPI #YazılımGeliştirme #HataGiderme
