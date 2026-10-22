# 22 Ekim 2026 — Ticket okunabilirliği, oturum ve Node release handoff

## Kapsam ve yerel kaynak

- Çalışma ağacı: `aluplan-ticket-readability-20261022`, dal `fix/ticket-detail-readability-20261022`.
- Ardışık yerel commitler: `9fbcd097` (ticket metin kontrastı ve Türkçe ek dosya adları), `aed2bba0` (WebSocket oturum yenileme), `e16c7808d34efb8eddda72302b20c3a3073a8daf` (Node 22.23.4 üretim/CI sabitlemesi), `b38caf97` (ilk handoff), `618b6ff3` (pnpm ve bağımsız npm kilit dosyası yamaları), `266451bb` (bağımlılık regresyon testleri), `f5582e25` (güvenlik handoff'u).
- Bu commitler yereldir. Bu kayıt remote Git veya canlı Coolify sürümünü doğrulamaz. Push, deploy, migration, üretim veri/queue/mail değişikliği yapılmadı.

## Oturum sorununun kanıtlanan mekanizması

Backend WebSocket bağlantı anındaki erişim JWT'sini alıp bağlantıda tutuyor ve sonrasında oturum durumunu yeniden doğruluyor. HTTP istemcisi HttpOnly cookie'yi refresh ile yenilese bile mevcut WebSocket'in JWT'si değişmiyor; eski JWT nedeniyle sunucu kopardığında istemci bunu oturum sonu sayabiliyordu. Önceki HttpOnly cookie'yi JavaScript ile okuma yaklaşımına geri dönülmedi.

Yeni akış sunucunun kopardığı socket sonrası mevcut HTTP oturumunu bir kez `auth.me()` ile doğruluyor. HTTP oturumu geçerliyse güncel cookie ile tekrar bağlanıyor; `SESSION_EXPIRED` kesinleşirse mevcut taslağı koruyan uyarı gösteriliyor. Ağ arızası tek başına çıkış sayılmıyor. Backend yalnız JWT, canlı oturum ve bildirim odalarına katılım tamamlandıktan sonra `session:ready` yayımlıyor; istemci yeniden deneme korumasını ve uyarıyı ancak bu onayla sıfırlıyor. Böylece transport `connect` olayını erken başarı kabul etme ve hızlı ret döngüsü engelleniyor.

Bu mekanizma kullanıcıdaki belirtinin kuvvetli açıklamasıdır; canlı 15+ dakika oturum testi henüz yapılmadı. Çok sekmeli refresh-token rotasyon yarışı ayrı, kanıtlanmamış olasılıktır; bu dilim onun çözüldüğünü iddia etmez.

## Güvenlik güncellemesi ve yerel doğrulama

- Node.js resmî 21 Ekim güvenlik sürümü `22.23.4`; backend/frontend Docker base ve runner imajları resmî çoklu-mimari digest `sha256:6abbcf5dd6b231da109bcde1181db1d92bf78015ae1a9514d9807c1f857869db` ile sabit. Beş CI işi de 22.23.4 kullanıyor.
- WebSocket frontend testleri 9/9; bildirim gateway testleri 49/49; ilgili frontend oturum testleri 32/32; backend/frontend TypeScript kontrolü geçti.
- Ticket okunabilirliği/ek dosya adı frontend testleri 44/44, backend ek dosya testleri 18/18 geçti. Bağımlılık güvenlik/regresyon paketi yamalar sonrası 264/264; Node ve frontend build sözleşmeleri 16/16 geçti. `git diff --check` temiz.
- `pnpm` üretim bağımlılıklarında `follow-redirects` 1.16.1 ve Prisma dev yolundaki `hono` 4.13.11 sabitlendi; `pnpm audit --prod --audit-level=moderate` artık sıfır bilinen bulgu döndürüyor. **Bu, tüm depoda sıfır açık demek değildir:** geliştirme araçlarının tam `pnpm audit` sonucunda 10 bulgu vardır.
- Ayrı npm alt projesi `scripts/notebooklm-extractor` pnpm workspace dışında. Bağımsız `npm audit fix --package-lock-only` ile Axios 1.20.0, `follow-redirects` 1.16.1 ve `form-data` 4.0.6 kilitlendi; yüksek bulgu kalmadı. `gaxios` 6.7.1 → `uuid` 9.0.1 zincirinde 2 orta bulgu sürer. Alt proje üretim runner imajlarında yer almaz; ayrı güncelleme/uyumluluk testi gerekir.
- Kod ve güvenlik incelemelerinde engelleyici bulgu kalmadı.
- Son yamaları içeren `f5582e2597f83ed5418cb50bb017d44aaa81442b` Git arşivi (17 MB) ile Docker imajları **sırasıyla** `linux/amd64` derlendi. Backend yerel image ID `sha256:217988e174527121511df23b60dc1e7e47e3b969497fc18c903593387c7af7b4`; frontend `sha256:dda3d42ea38a987849dc0f97bbb3a07b109525aab990c827af7db99e7b410c26`. İkisinin OCI revision etiketi tam `f5582e2597f83ed5418cb50bb017d44aaa81442b` değeridir. Bunlar registry digest'i veya canlı image değildir; bu handoff'un sonraki docs-only commit'i imaj içeriğinde yoktur.
- Ağsız frontend konteynerinde UID 1001, Node v22.23.4 ve `/tr/login` HTTP 200; ağsız backend konteynerinde UID 1000, Node v22.23.4, `pg_dump` 17.11 ve derlenmiş uygulama dosyaları görüldü. Backend gerçek DB/Redis ile bu dilimde başlatılmadı.

## Yayın kapısı ve sıra

1. Bu dalın remote hedefi ile mevcut Coolify backend/frontend branch, çalışan commit ve image digest'lerini **salt-okunur** olarak karşılaştır. Mevcut health/login ve geri dönüş image çiftini kaydet. Secret değerlerini açığa çıkarma.
2. Repo kuralı gereği remote push için ayrıca açık `push et`, deploy için ayrıca açık `deploy et` onayı al. Genel `devam` veya bu yerel handoff yayın kanıtı değildir. Üretim erişimi/değişikliği ayrıca kapsamlandırılmalıdır.
3. Onaylı yayında backend ve frontend build/deploy'larını aynı anda çalıştırma: backend tamamlanıp health, log ve bildirim gateway kabulü doğrulanınca frontend'e geç. Socket `session:ready` frontend için backend önkoşuludur.
4. Yayın sonrası farklı tarayıcı/sekme ile login, 15+ dakika bekleme, HTTP refresh, WebSocket yeniden bağlanma, bilet ayrıntısı kontrastı ve Türkçe ek dosya adı gözlemi yap. Kullanıcı taslağı korunmalı; gerçek müşteri verisi üzerinde test bileti/mail/queue işi tetikleme.
5. Herhangi bir regresyonda eski çalışan image **çiftine** dön; PostgreSQL, Redis, R2 veya kullanıcı oturumlarını temizleme. Canlıda geri dönüş ve health sonucu ayrıca kaydedilmeli.

## Sınırlar

- İlk Docker provası çalışma ağacından yapıldığında `.dockerignore` iç içe `apps/frontend/.next` önbelleğini dışlamadığı için build context yaklaşık 1.9 GB idi. Son ve geçerli imaj provası temiz `git archive` bağlamından yapıldı (17 MB arşiv, yaklaşık 15 MB Docker aktarımı). Yine de bu, remote CI veya Coolify build logunun yerine geçmez.
- Gerçek backend DB/Redis/auth E2E, Chrome'da uzun süreli kullanıcı oturumu, canlı image SHA/health ve production rollback provası bu dilimde yapılmadı.
