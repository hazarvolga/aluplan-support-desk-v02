# Allplan Share Senkronizasyon ve Dosya Kilidi Yönetimi

Problem Özeti: Allplan Share ile bulut üzerinden ortak çalışırken çizim dosyalarının (drawing files) diğer kullanıcılara kilitli kalması, değişikliklerin buluta senkronize olmaması veya erişim yavaşlıkları yaşanması.
Belirtiler: Ekip üyelerinin bir dosyayı yalnızca referans modunda (salt okunur) açabilmesi, projedeki değişikliklerin anında diğer kullanıcılara yansımaması, ağ üzerinde yavaşlama bildirimleri.
Etkilenen Ortam: Allplan Share, Bimplus Bulut Depolama, Yerel Önbellek (Local File Storage).
Kök Neden: İnternet bağlantısındaki kesintiler veya projenin düzgün kapatılmaması nedeniyle "kilit" (lock) bilgilerinin bulutta asılı kalması. Ayrıca, yerel önbellek klasörünün (local file storage) hatalı şekilde bir ağ sürücüsünde (network drive) tutulması veya birden fazla kullanıcı tarafından paylaşılması.
Adım Adım Çözüm:
Kilitli Dosyaları Açma: Allplan başlangıç ekranında (veya Services uygulamasında) ilgili projeye sağ tıklayın ve "Kilit Bilgilerini Yönet" (Manage locking information) seçeneğini açın.
Listeden asılı kalmış dosyaları bularak "Kilit bilgisini kaldır" (Remove locking information) komutunu çalıştırıp dosyayı diğer kullanıcıların erişimine açın.
Yerel Önbellek Kontrolü: Kullanıcının bilgisayarında yerel dosya depolama yolunun (...\Nemetschek\Share) ağ üzerinde değil, mutlaka kullanıcının kendi yerel SSD diskinde bulunduğunu teyit edin.
Ağ Testi: Allplan Diagnostics aracını kullanarak internet gecikmesini (latency) kontrol edin. Sorunsuz bir senkronizasyon için gecikmenin 50 milisaniyenin altında olması gerekir.
Önleyici Tavsiyeler: Allplan Share anlık değil, işlem bazlı senkronizasyon yapar. Kullanıcıların verileri buluta aktarmak için düzenli olarak çizim dosyasını kapatması, Pafta (Layout) düzenleyicisine geçmesi veya manuel olarak "Kaydet" (Save) yapması gerektiğini hatırlatın. Çalışma bitince proje tamamen kapatılmalıdır.
Etiketler: Allplan Share, Senkronizasyon, Dosya Kilidi (Lock Information), Bimplus, Yerel Önbellek (Local Cache).