# Allplan Workgroup Manager: SQL ve Ağ Bağlantı Hataları

## Sorun Özeti
Ağ üzerinde birden fazla kullanıcı ile çalışırken (Workgroup Manager) SQL veritabanına bağlanamama, proje kilitlenmeleri veya performans düşüklüğü.

## Teknik Nedenler ve Çözümler

### 1. SQL Servis Hataları
**Belirti:** "Veritabanına bağlanılamadı" uyarısı.
**Çözüm:** 
- Sunucuda `SQL Server Configuration Manager`'ı açın.
- SQL Server servislerinin (özellikle Allplan örneği) "Running" durumda olduğunu kontrol edin.

### 2. Ağ ve VPN Engelleri
**Durum:** Uzaktan çalışma sırasında bağlantı kopmaları.
**Çözüm:** 
- Güvenlik duvarında (Firewall) SQL portunu (varsayılan: 1433) TCP/IP üzerinden açın.
- VPN kullanıyorsanız, yüksek ping değerleri Workgroup Manager'da "Network Error 59" hatasına neden olabilir. Bu durumda **Allplan Share** modeline geçiş önerilir.

### 3. Kayıt Defteri ve Dosya Bozulmaları
**Kritik İpucu:** Eğer sadece bir bilgisayar bağlanamıyorsa, `netmanager.xml` dosyasını yedekleyip silerek Allplan'ı yeniden başlatmak genellikle bağlantı ayarlarını sıfırlayarak sorunu çözer.

## Önerilen İş Akışı
- Veritabanı bakımlarını (Maintenance Plans) mesai saatleri dışında yapın.
- Antivirüs programınızda Allplan Proje dizinini (PRJ) "Dışlananlar" listesine ekleyin.

## Etiketler
#SQL #Network #WorkgroupManager #AllplanShare #HataGiderme
