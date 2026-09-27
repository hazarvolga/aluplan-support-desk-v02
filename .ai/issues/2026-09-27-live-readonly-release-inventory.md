# 2026-09-27 canlı salt-okunur yayın envanteri

## Yetki ve sınır

Kullanıcı yalnız canlı servis, veritabanı ve ek depolama envanterinin salt-okunur incelenmesini onayladı. SSH üzerinden Docker metadata, PostgreSQL `SELECT` ve Cloudflare R2 `ListObjectsV2` kullanıldı. Backup oluşturma, nesne içeriği indirme, DB/Redis/R2 yazma, restart, migration, push ve deploy yapılmadı. Üretim kimlik bilgileri veya ham ek anahtarları çıktılanmadı/kaydedilmedi.

## Gözlem

- VPS disk: 194 GB toplam, 36 GB kullanım, 159 GB boş (%19 kullanım). Disk doluluğu mevcut yayın engeli değil.
- Frontend sağlıklı, PostgreSQL sağlıklı; backend, Redis ve mail servisi çalışır görünüyor. Bu, müşteri akışlarının uçtan uca başarılı olduğunu tek başına kanıtlamaz.
- Uygulama veritabanı `aluplan_support`; anlık sayımlar: 182 bilet, 578 mesaj, 114 ek kaydı, 1289 kullanıcı. Bunlar canlı trafikle değişebilir. Varsayılan `postgres` veritabanı uygulama veritabanı değildir.
- PostgreSQL ve mail için kalıcı Docker volume'leri mevcut. Backend ve frontend konteynerlerinde mount yok. Etkin depolama türü S3; uygulama ekleri R2 bucket'ına bağlı.
- R2 salt-okunur listeleme: 477 nesne, yaklaşık 62,9 GB. Bu toplamın tamamı bilet eki değildir. Veritabanı ayarları ortam değişkenlerini geçersiz kıldığı için envanter uygulamanın etkin DB ayarlarını kullandı; ilk yalnız-env yetkisi 401 döndü. Gizli değerler yalnız işlem belleğinde kullanıldı.
- 114 etkin ek kaydının 109 gerçek nesne anahtarı R2 listesinde tam anahtar ve kayıtlı boyut açısından eşleşti; gerçek nesne anahtarı olup R2'de eksik kalan kayıt: 0; boyut farkı: 0.
- Kalan 5 etkin kayıt eski `FAILED_STORAGE_UPLOAD_...` işaretleri. Bunlar R2 nesnesi değildir, yaklaşık 4,4 MB ek metadata'sına karşılık gelir ve kullanıcı açısından erişilebilir dosya baytları kanıtlanmamıştır. Tüm etkin eklerin paritesi **başarısız**; işaretsiz anahtarların liste/boyut paritesi **başarılı**. İşaretleri silmek veya sessizce başarılı saymak yasaktır.

## Karar ve açık kapılar

**Production GO verilmedi.** Listeleme, nesne gövdelerinin okunabildiğini veya byte bütünlüğünü kanıtlamaz; canlı yazılar nedeniyle bu yalnız anlık gözlemdir. Ayrıca taze, geri yükleme ile doğrulanmış DB yedeği; R2 eklerinin kurtarma kanıtı; mevcut Redis/mail işlerinin ve rollback hedefinin doğrulanması bu turda yapılmadı. Beş tarihsel işaretin hangi biletleri etkilediği ve orijinal dosyaların e-postadan/başka kaynaktan kurtarılabilirliği ayrıca, mahremiyeti koruyarak değerlendirilmeli. Marker kayıtları değişmeden kalacaksa yayın kararında açık ve onaylı istisna olmalı.

Sıradaki asgari kapı: taze DB yedeği + izole restore/checksum kanıtı, etkin R2 nesnelerinin geri alınabilirliği, kesin backend/frontend imaj ve rollback planı, son düşük-trafik sayım/marker karşılaştırması ve ayrı açık deploy onayı. Geçici bakım SSH anahtarı ve credential rotasyonu ayrıca açık güvenlik borcudur. Bu belge deploy yetkisi vermez.
