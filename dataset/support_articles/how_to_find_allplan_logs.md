# Allplan Teknik Log Dosyaları Nasıl Bulunur?

Enterprise destek sistemimizin size en hızlı çözümü sunabilmesi için teknik log dosyalarına ihtiyacı vardır. İşte bu dosyaları bulma yolları:

## 1. Allplan Trace Dosyası (AllplanTrace.txt)
Programın çalışma sırasındaki tüm teknik arka plan işlemlerini kaydeder.
- **Yol:** `%LocalAppData%\Allplan\2026\Logs` (2026 yerine kendi sürümünüzü yazın)
- **Neyi Çözer:** Program içi çökmeler, donmalar, SQL bağlantı kesilmeleri.

## 2. Kurulum Logları (Setup.log)
Allplan yüklenirken veya güncellenirken oluşan hataları kaydeder.
- **Yol:** `%ProgramFiles%\Allplan\Allplan [Sürüm]\Setup.log`
- **Neyi Çözer:** Kurulumun yarıda kalması, eksik DLL hataları.

## 3. Lisans Logları (Wibu / CodeMeter)
Lisans aktivasyon ve dongle hataları için kritiktir.
- **Yol:** `C:\ProgramData\WIBU-SYSTEMS\Logs`
- **Neyi Çözer:** "Lisans bulunamadı" veya "Dongle tanınmadı" hataları.

## Önemli Not: AI Analizi
Bu dosyaları AI asistanımıza yüklediğinizde, asistanımız dosya içindeki binlerce satırı saniyeler içinde tarayarak **"ERROR"** veya **"WARNING"** etiketli satırları teşhis edebilir.

## Etiketler
#Logs #Troubleshooting #TechnicalSupport #AllplanTrace
