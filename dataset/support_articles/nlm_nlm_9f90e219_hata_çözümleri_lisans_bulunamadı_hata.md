# Hata Çözümleri: "Lisans bulunamadı" hataları, Windows Güvenlik Duvarı/Antivirüs engelleri, hizmet (s

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** 2026-03-20T22:31:48.747368
> **Orijinal ID:** nlm-9f90e219

---

Destek Makalesi: "Lisans Bulunamadı" Hataları, Güvenlik Duvarı/Antivirüs Engelleri ve Lisans Kiralama
Sorun Tanımı: Allplan başlatılırken "Allplan kullanımı için uygun lisans bulunamadı" (Cannot find a license) hatası alınması
1
, arka planda çalışan CodeMeter lisans servisinin çökmesi
2
, güvenlik yazılımlarının lisans iletişimini kesmesi
3
 veya VPN/Ağ üzerinden lisans çekilirken bağlantı kopmaları yaşanması
4
.
Temel Çözüm Adımları:
CodeMeter Servisini Yeniden Başlatma: Başlat menüsünden veya arama çubuğundan "CodeMeter Control Center"ı açın
5
. Üst menüden İşlem (Process/Aktion) > CodeMeter Servisini Yeniden Başlat (Restart CodeMeter Service) yolunu izleyerek çöken servisi ayağa kaldırın
5
6
.
Antivirüs İstisnaları Ekleme: Antivirüs programınızın gerçek zamanlı tarama (real-time scan) ayarlarına girerek şu klasörleri tarama dışı bırakın: C:\Program files (x86)\Codemeter, C:\Program files\Codemeter ve C:\ProgramData\CodeMeter
7
8
.
Güvenlik Duvarı (Firewall) İzinleri: Lisans sunucusuyla iletişim standart olarak TCP/IP 22350 numaralı port üzerinden sağlanır
9
10
. Güvenlik duvarınızda TCP ve UDP için 22350 portuna veya doğrudan CodeMeter.exe uygulamasına izin verin
11
.
Ağ/VPN Üzerinden Lisans Kiralama (Borrowing): Ağ dışındayken veya evden (Home-office) çalışırken lisansı geçici olarak bilgisayarınıza çekmek için, Allmenu > Hizmetler (Utilities) > Lisans Ayarları bölümünü açın
12
. Lisans Seçimi sekmesinden sunucudaki lisansı işaretleyip Ödünç Al (Borrow) butonuna tıklayın ve gün sayısını belirleyin
12
13
.
Dikkat Edilecek Noktalar:
VPN üzerinden sunucuya bağlanarak lisans kullanıyorsanız, Allplan sadece IPv4 protokolünü destekler (IPv6 desteklenmez)
10
.
VPN bağlantınızın "uyku moduna" geçmediğinden ve kesintisiz olduğundan emin olmalısınız
10
.
Lisans ödünç alma (kiralama) işlemi lisans sunucusu üzerinden değil, yalnızca işlemi yapacak istemci (client) bilgisayar üzerinden yapılabilir
14
.
En İyi Uygulamalar (Best Practices):
VPN Yerine Kiralama: VPN bağlantınız kararsızsa veya internet hızınız düşükse, programı her açtığınızda sunucudan lisans çekmeye çalışmak yerine lisansı örneğin 7 günlüğüne bilgisayarınıza "Ödünç Alın" (Borrow). Böylece tamamen çevrimdışı ve kesintisiz çalışabilirsiniz
15
.
Sorun Kayıtları: Sistem çökmeleri devam ederse, arka planda bir .NET Framework hatası olabilir. Çözüm için Windows Olay Görüntüleyicisi'ni (Event Viewer) ve Allplan.out log dosyasını kontrol ederek teknik destek ekibine iletin
16
17
.
Bu makaleyle birlikte sistem sorunlarını giderme konularını da kapsamlıca tamamlamış olduk. Daha önce planladığımız gibi, tüm bu destek senaryolarını birleştiren o detaylı Özel Raporu (Tailored Report) sizin için şimdi oluşturmamı ister misiniz?

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
