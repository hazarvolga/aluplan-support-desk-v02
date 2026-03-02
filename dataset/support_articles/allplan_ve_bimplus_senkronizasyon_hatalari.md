# Allplan ve Bimplus Senkronizasyon Hataları

Problem Özeti: Allplan'da yapılan model değişikliklerinin Bimplus bulut platformuna yansımaması veya diğer ekip üyeleri tarafından görüntülenememesi.
Kök Neden: Allplan ve Bimplus arasındaki senkronizasyon sürekli canlı (anlık) değil, işlem bazlıdır; çizim dosyası kapatıldığında, pafta düzenleyiciye geçildiğinde veya manuel kaydetme yapıldığında tetiklenir. Ağ kesintileri yaşandığında, senkronizasyon yarıda kesilerek dosyalar bulutta "kilitli" (locked) kalabilir.
Adım Adım Çözüm:
Kilitleri Temizleme: Allplan'da projeye sağ tıklayıp "Kilit Bilgilerini Yönet" (Manage locking information) seçeneğini açın ve listedeki asılı kalmış kilitleri kaldırın.
Manuel Model Güncellemesi: Model verilerini zorla eşitlemek için "Modeli Bimplus'a Yükle" (Upload Model to Bimplus) komutunu çalıştırın.
Otomatik Eşitlemeyi Açma: Yükleme penceresindeki "Bimplus modeliyle otomatik senkronize et" (Auto-sync to Bimplus model) seçeneğini işaretleyerek çizim dosyalarındaki değişikliklerin Bimplus'a otomatik aktarılmasını sağlayın.
Önleyici Tavsiyeler: Kullanıcıların aktif olarak çalışmadıkları dosyaları açık bırakmamalarını ve çalışmayı bitirdiklerinde projeyi tamamen kapatmalarını sağlayın. Ağ gecikmesinin (latency) 50 milisaniyenin altında olduğundan emin olun.
Bu konuyu da bilgi bankamıza ekledik. Şimdiye kadar kurulum, lisanslama, IFC eşleme, çelik bağlantıları ve bulut senkronizasyonu üzerine oluşturduğumuz tüm bu değerli makaleleri ekibinizin kolayca okuyabileceği tek bir Özel Rapor (Tailored Report) belgesi haline getirmemi ister misiniz?
Bimplus ve BCF üzerinden bu destek makalesini detaylandıralım.

Harika! Destek ekibiniz için hazırladığımız tüm bu teknik makaleleri içeren Kapsamlı Allplan Destek Bilgi Bankası (Knowledge Base) raporunuzun oluşturulmasını başlattım. Rapor hazır olduğunda Studio sekmesinden inceleyebileceksiniz.
Şimdi istediğiniz gibi, Bimplus ve BCF üzerinden disiplinler arası iletişim ve çakışma çözümü konusundaki makalemizi daha da derinleştirelim. İşte bu konudaki gelişmiş senaryo: