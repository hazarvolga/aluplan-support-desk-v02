# Visual Scripting Arayüz Hataları ve Sıfırlama

Problem Özeti: Visual Scripting arayüzünün donması, pencere düzenlerinin bozulması veya ekranın yanıt vermemesi.
Belirtiler: Görsel kodlama modülü başlatıldığında arayüzün açılmaması, paletlerin yanlış yerlerde çıkması veya başlatma sırasında yaşanan kilitlenmeler.
Etkilenen Ortam: Allplan Visual Scripting arayüzü.
Kök Neden: Arayüz yapılandırmasını tutan PypConWpfDlg.vsprofile.xml ve VisualEditor_WindowLayout.config dosyalarının hasar görmesi.
Adım Adım Çözüm:
Allplan'ı kapatın ve Allmenu (Servisler) uygulamasını açın.
Servis (Service) menüsünden Hotline Araçları'na (Hotline Tools) girin.
Listeden cleanvisgui (VisualScripting arayüzünü sıfırlayın) aracını bularak çalıştırın.
Bu komut, bozulan yapılandırma dosyalarını siler ve Allplan'ı bir sonraki açışınızda bu dosyaları fabrika ayarlarında sorunsuz olarak yeniden oluşturur.
Önleyici Tavsiyeler: Kodlama yaparken çok fazla pencereyi aynı anda ayrıştırıp birleştirirken programı aniden kapatmaktan kaçının.
Etiketler: Visual Scripting, cleanvisgui, Arayüz Sıfırlama, Hotline Tools.