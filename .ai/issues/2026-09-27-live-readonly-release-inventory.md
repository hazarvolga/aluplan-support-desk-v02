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

## 2026-09-27 yerel backup yürütme ön kontrolü

Genel `devam edelim` yanıtı repo `AGENTS.md` uyarınca yeni production erişimi/yazma yetkisi sayılmadı; bu aşamada canlıya bağlanılmadı. Yerel `scripts/backup-db.sh` ve restore sözleşmesi incelendi. Backup güvenlik testleri `44/44` geçti. Mac veri diski kontrolünde yaklaşık 1,2 TiB boş alan görüldü; yerel `pg_dump` kurulu değil, PG17 aracı izole Docker imajından kullanılabilir. Bu kontroller güncel canlı veritabanının sığacağını veya restore'un başarılı olacağını önceden kanıtlamaz.

Mevcut backup betiği normal modda önceden hazırlanmış ayrı S3 backup bucket'ı ister; canlıda böyle bir hedefin hazır olduğu doğrulanmadı. Bu nedenle üretimde betiği tahmini env ile çalıştırma. Yerel `fdesetup status` kontrolü **FileVault is Off** döndürdü: yalnız `0700` dizin/`0600` dosya izinleri ham müşteri verisinin disk-at-rest gizliliğini sağlamaz. Önceki şifresiz Mac hedefi önerisi geçersizdir. İlk dar operasyon ancak ayrı açık onay ve önceden test edilmiş şifreli hedef/anahtar saklama yöntemiyle mümkün: canlı PG17 veritabanını sunucuda kalıcı yeni dosya oluşturmadan tek yönlü SSH stream ile şifreli hedefe al, hash/katalog doğrula ve izole PG17 restore testi yap. Ham arşivi şifresiz Mac dosya sistemine geçici olarak bile yazma. Retention ve erişim yetkisi netleştirilmeli. Bu DB adımı R2 dosyalarını, Redis/mail state'ini veya production GO'yu tek başına kanıtlamaz. Ayrı production backup onayı olmadan çalıştırma.

Kullanıcının paylaştığı 2026-09-27 Cloudflare R2 ekranı uygulama bucket'ı için `477 / 62,9 GB` sayısını bağımsız UI'da doğruluyor. `aluplan-support-desk-db-backups-dev` yalnız 1 küçük test nesnesi (184 B), `aluplancoolify` 0 nesne gösteriyor. Bunların hiçbiri doğrulanmış production PostgreSQL backup'ı değildir; DEV bucket'ı canlı veriyle karıştırılmamalı. Ekran görüntüsünden herhangi bir bucket/token değişikliği yapılmadı.

## 2026-09-27 onaylı PostgreSQL yedek ve izole geri yükleme kanıtı

Bu bölüm, yukarıdaki salt-okunur envanterden **sonra** verilen ayrı ve dar kapsamlı kullanıcı onayıyla yürütülen işlemi kaydeder. Canlıda deploy, restart, migration, firewall, DB yazma veya R2 değişikliği yapılmadı. Canlı PG17 `aluplan_support` veritabanı `pg_dump -Fc --no-owner --no-privileges` ile SSH üzerinden doğrudan Mac'teki AES-256 şifreli APFS sparsebundle içine aktarıldı; sunucuda yeni kalıcı dump ve Mac'in şifresiz dosya sisteminde ham ara kopya oluşturulmadı. Canlı servis ve PostgreSQL işlem öncesi sağlıklıydı; VPS'de 159 GB boş alan vardı.

- Kanonik yerel hedef: Git tarafından dışlanan `.private-data/production-backup-20260927/aluplan-production-v2.sparsebundle`. İlk oluşturulan ayrı imajın parolası bulut belgesinde/görüntüde açığa çıktığı için **hiçbir canlı veri için kullanılmadı**; yalnız `v2` imajı kullanıldı. Hiçbir parola veya anahtar bu belgeye/Git'e yazılmadı.
- `hdiutil isencrypted`: `encrypted: YES`; APFS imaj 3,8 GiB, dump tamamlandıktan ve restore testinden sonra normal yolla ayrıldı. Docker Desktop yalnız yerel dosya tutamaçlarını serbest bırakmak için kısa süreliğine durdurulup yeniden başlatıldı; çalışan yerel konteyner yoktu ve canlı sunucu etkilenmedi.
- Custom dump: `144758018` bayt, dosya modu `0600`. SHA-256: `213523ac7a760d1b89606509e8b286ba9d1fa108826cb483a432bab72c48a8bc`. SSH/`pg_dump` çıkış kodu `0`; `pg_restore --list` başarılı. Hash, tam restore sonrasında tekrar aynı çıktı.
- İzole restore: yerel PG17.10 / pgvector imajı, `--network none`, yayınlanmış port yok, Docker log sürücüsü `none`, production env yok; Docker imajının varsayılan `VOLUME` hedefi doğrudan şifreli imaja bind edildi, anonim/şifresiz veri volume'ü yok. `pg_restore --exit-on-error --single-transaction --no-owner --no-privileges` çıkış kodu `0`, hata dosyası boş. Restore veritabanında 62 public tablo ve yaklaşık 349 MB veri var.
- Restore sayımları ve hemen sonrasındaki canlı salt-okunur sayımlar eşleşti: **182 bilet / 578 mesaj / 114 ek kaydı / 1289 kullanıcı**. Canlı yazımlar sürdüğü için bu eşleşme yalnız karşılaştırma anı içindir; dump sonrasındaki müşteri işlemleri bu snapshot'ta bulunmaz.

**Sınır:** Bu, PostgreSQL dump'ının açılıp geri yüklenebildiğini kanıtlar; uygulama iş akışlarının tümünü, R2 nesne gövdelerini/5 tarihsel failed-upload kaydını, Redis/mail işlerini veya offsite kurtarmayı kanıtlamaz. Yerel imaj tek başına bağımsız/offsite yedek değildir. Parola saklama ve retention politikası ayrıca netleştirilmeli; ilk boş imaj tekrar kullanılmamalı. Production deploy hâlâ **NO-GO**; R2 kurtarma, kesin yayın/rollback hedefi ve son uygulama/parite kapıları ayrı kanıt ve açık `deploy et` onayı gerektirir.
