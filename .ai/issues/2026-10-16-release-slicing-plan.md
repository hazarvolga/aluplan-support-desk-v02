# 16 Ekim 2026 — Yerel Release Dilimleme ve Kabul Kartı

## Durum

`EXECUTING` — Bu kart yalnız yerel hazırlık ve kabul kanıtı içindir. Remote push, Coolify ayar değişikliği, build, deploy, migration veya canlı veri/queue/mail işlemi yetkilendirilmemiştir. 17 Ekim'de verilen onayla yalnız yerel Docker imajları ve geçici, izole runtime provası çalıştırılmıştır.

## Referanslar ve sınır

- Mevcut yerel aday: `bf39e48ccc3ea7215a731898354934892457e137`.
- Remote başlangıç noktası: `origin/main` = `2040d59818d0d974dc79525a8adb27e637eee96d`.
- Fark: 20 commit, 312 dosya, yaklaşık 21.105 ekleme ve 6.427 silme. Bu nedenle aday tek seferlik kör yayın olarak kabul edilmez.
- Prisma şeması veya migration değişikliği yoktur; yalnız `packages/database/prisma/seed.ts` değişmiştir. Geri dönüşte şema migration rollback'i gerekmemelidir. Bunun gerçek ortamda da geçerli olduğu, yayın öncesi diff ile tekrar kontrol edilecektir.
- Bu kart, korunan `aluplan-release-candidate-20260919` checkout'ını kapsamaz. Kullanıcı WIP'i olan `.ai/current-focus.md`, `.ai/session-summary.md`, `apps/backend/openapi.json` ve `scripts/generate_allplan_license_report.py` bu kartın dışında kalır.

## Aday release dilimleri

Bu gruplar **mantıksal kabul dilimleridir**. Her biri, ayrı aday branch/image olarak yeniden kurulup test edilmeden deploy edilemez. Commit'ler arası bağımlılık bulunduğu için mevcut `main` dalında bunları sırayla canlıya alma yetkisi yoktur.

| Dilim | Commit aralığı | İçerik | Zorunlu önkoşul | Yerel kanıt | Canlı kabul / rollback |
| --- | --- | --- | --- | --- | --- |
| R0 — platform ve CI uyumu | `4fc562c4` → `ac6a60bd` | pnpm 11/lockfile, Docker build tabanı, CI güvenlik ve E2E test koşulları, request/email sınırları | Her iki imajın aynı lockfile ile ayrı yerel build'i; CI'nin branch üzerinde yeşil sonucu | Tam test/build mevcut adayda geçti; dilim bazlı imaj build'i henüz yok | Coolify build logu + backend/frontend health; sorun olursa önceki image digest'ine dön, DB migration çalıştırma |
| R1 — AI sağlayıcı ve outbound sınırları | `62383a8d` → `bec795a1` | Ollama'nın kaldırılması, desteklenen sağlayıcı sözleşmeleri, dış HTTP ve crawler/storage URL güvenliği | Canlı ayarlarda Ollama bağımlılığı olmadığının salt-okunur doğrulaması; aktif sağlayıcı/env envanteri | Birim/regresyon testleri ve tam backend turu geçti | Bir sağlayıcı yapılandırması eksikse deploy etme; önceki backend image'e dön, queue retry/reindex başlatma |
| R2 — storage/settings/AI-admin sertleştirmesi | `7f76817b` → `a2909211` | Next/pnpm uyumu, storage endpoint doğrulaması, legacy secret saklama, AI işleri ve kullanıcı yönetimi | R0/R1 image uyumu; mevcut storage/CRM/mail varsayımlarının salt-okunur doğrulaması | Typecheck, build ve tam test paketi geçti | 5xx veya background-worker hata oranı yükselirse yeni imajı geri al; DB/Redis temizliği yapma |
| R3 — destek intake ve oturum sözleşmesi | `39aa6eef` → `bf39e48c` | Ticket kategorileri, cloud license parity, Hotinfo matrisi, Beni Hatırla ve çok-sekmeli refresh güvenliği | R2 çalışır aday; `SESSION_MARKER_SECRET` backend ve frontendte aynı, güçlü ayrı değer olarak tanımlı; `ALLOWED_ORIGINS`, `FRONTEND_URL`, `API_URL`, `NEXT_PUBLIC_API_URL` kesin canonical URL'lerle uyumlu | Backend 226 suite/2.847 test, frontend 95 dosya/749 test, typecheck/i18n/build, izole Playwright refresh ve stale-tab senaryoları geçti | Login/refresh/me smoke başarısızsa hemen önceki backend+frontend image çiftine birlikte dön. Auth cookie sözleşmesi değiştiği için iki uygulama ayrı sürümde bırakılmaz; canlı kullanıcı token/queue/DB temizliği yapılmaz |

## Ortam sözleşmesi — deploy öncesi salt-okunur kontrol

1. Coolify'da geçerli branch/commit, backend ve frontend image digest'i, build context'i ve health endpoint'i kaydedilir; ekrana/parolaya ait değerler dokümana yazılmaz.
2. R3 için `SESSION_MARKER_SECRET` sadece backend ve frontendte aynı değer olarak bulunur. Bu değer JWT erişim/refresh secret'ı değildir; eski JWT secret'ları frontend env'inden kaldırılmıştır.
3. `DATABASE_URL`, `REDIS_URL`, `FRONTEND_URL`, `API_URL`, `ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_URL`, `ENCRYPTION_KEY` ve `ADMIN_BYPASS_EMAILS` üretimde tanımlıdır; endpointler canonical hostları gösterir. Hiçbir secret kullanıcıya/loga dökülmez.
4. Deploy öncesi çalışan PostgreSQL ve Redis persistent volume'leri, mail/queue tüketicileri ve R2 bağlantısı korunur; reset, prune, bulk retry, reindex veya seed yapılmaz.
5. Coolify kullanacağı build ortamının pnpm 11.17.0 ile lockfile'ı çözebildiği önce lokal image build veya ayrı staging build kanıtıyla doğrulanır. Bu adım disk/image yaratacağı için çalıştırmadan önce kullanıcıdan ayrıca onay alınır.

## Kabul kapıları

| Kapı | Kanıt | Durum |
| --- | --- | --- |
| K0 — yerel kaynak | `git diff --check`, backend/frontend typecheck, i18n, tam test ve production build | PASS (16 Ekim) |
| K1 — Compose sözleşmesi | production ve staging Compose sentetik değerlerle `config --quiet` | PASS (16 Ekim) |
| K2 — bağımlılık eşiği | `pnpm audit --prod --audit-level=high` | PASS (16 Ekim; bilinen açık yok) |
| K3 — dilim imajları | Her R0–R3 için bağımsız, aynı architecture local/staging build ve image digest | Temiz `1fc83798` commit arşivinden birleşik backend/frontend `linux/arm64` imajları PASS; Coolify hedef architecture ve ayrı R0–R3 imajları PENDING |
| K4 — izole runtime | Geçici Postgres/Redis ile login/refresh, ticket, worker ve health smoke | Temiz adayın backend migration/boot/health, anonim refresh reddi ve frontend login HTTP smoke PASS; önceki R3 auth E2E PASS; yetkili login/refresh, ticket oluşturma ve worker işleme PENDING |
| K5 — canlı ön-kontrol | Coolify commit/image/env varlığı + backup/queue/mail/worker sınırı salt-okunur kayıt | PENDING — ayrı kullanıcı onayı gerekir |
| K6 — yayın ve canary | Onaylı tek dilim, health + login/refresh + ticket oluşturma + queue gözlemi | BLOCKED — ayrıca push/deploy onayı gerekir |

## Rollback kartı

1. Yayından **önce** mevcut backend/frontend image digest'leri, `origin/main` başlangıç SHA'sı (`2040d598`) ve health sonucu kaydedilir.
2. R3 auth sözleşmesi nedeniyle backend ve frontend aynı aday sürüm olarak birlikte yayınlanır ve birlikte geri alınır; yalnız birini geri almak yasaktır.
3. İlk hata işaretinde yeni job, crawl, toplu retry veya reindex başlatılmaz. Yeni image çiftinin çalışması durdurulur; önceki çalışır backend/frontend image çiftine dönülür.
4. PostgreSQL, Redis, R2, mail volume veya müşteri verisi silinmez/restore edilmez. Şema migration olmadığı varsayımı yayın öncesi tekrar doğrulanır.
5. Geri dönüş sonrası `/api/v1/health`, anonim login sayfası, auth refresh reddi ve yetkili test kullanıcısı ile login/refresh smoke kontrol edilir. Gerçek müşteri ticket'ı, maili veya crawler işi tetiklenmez.

## Açık riskler

- 20 commitlik farkın her dilim için ayrı image build ve CI çalıştırma kanıtı yoktur.
- İlk 17 Ekim yerel imajları, dört kullanıcı WIP dosyası bulunan çalışma klasöründen build edilmiştir. OCI revision etiketi `ef74cc082d0bcfad8c2ea9327b37219ce3d5f1a1` olsa da bu etiket tek başına temiz commit bağlamı kanıtı değildir. Bu ilk imajlar yayın adayı olarak kullanılmaz; aşağıdaki temiz commit imajları ayrı kanıttır.
- Yerel Docker mimarisi `linux/arm64`; Coolify hedef mimarisi salt-okunur envanterle henüz eşleştirilmedi. Ayrı dilim imajları da oluşturulmadı.
- Coolify'nin mevcut build cache'i, image digest'leri ve pnpm 11 runtime uyumu canlıdan bağımsız doğrulanmadı.
- Mail/queue/R2/CRM sistemleri için canlı etkisiz geçiş kanıtı eksiktir; geçmiş tarihli notlar canlı durum yerine geçmez.
- Mevcut branch bir release branch'i olarak ayrıştırılmadı. Sadece planlanan commit aralıklarından staging branch üretmek bile yeni Git state yaratır; kullanıcı onayı olmadan yapılmayacaktır.

## 17 Ekim yerel imaj ve runtime kanıtı

- Birleşik adayın backend imajı `sha256:a0907a5f74e833f465cc40b634cc0c254b7053d7df89501232206b7033e60399` (3,88 GB), frontend imajı `sha256:95d3a2bf0984ede13cecc3e505a6b41642009eedcdf02cfe654efc10bf3dbf38` (460 MB). İkisi de `linux/arm64` ve aynı OCI revision etiketini taşıyor. Bunlar yerel image ID'leridir; registry digest'i değildir.
- Backend build `pnpm install --frozen-lockfile`, Prisma client üretimi ve Nest build ile; frontend build frozen lockfile, Prisma, ortak şema, TypeScript ve Next.js production build ile geçti.
- Backend imajının ağ kapalı statik smoke testinde 59 migration dosyası canonical manifest ile eşleşti; PostgreSQL 17.11 istemcileri ve Node 22.23.3 görüldü. Frontend imajı ağ kapalı çalıştırıldığında `/tr/login` HTTP 200 verdi.
- Ayrı, yalnız iç ağdaki geçici pgvector/PostgreSQL 17 ve Redis 7 ile backend production modunda açıldı. 59 migration doğrulaması, şema eşitliği ve RBAC sözleşmesi geçti; uygulama başladı, `/api/v1/health` HTTP 200 ve anonim `/api/v1/auth/refresh` HTTP 401 döndü. İlk denemede sentetik `SWAGGER_PASSWORD` eksikliği nedeniyle uygulama 1 koduyla çıktı; değer eklenince aynı imaj sağlıklı açıldı. Bu bir ürün kodu hatası değil, test ortamı eksiğiydi.
- Test konteynerleri ve iç ağ kaldırıldı; kalıcı volume yaratılmadı. İmajlar yerelde kaldı. Canlıya bağlantı, push, deploy, gerçek mail/ticket veya queue replay yapılmadı.

## 17 Ekim temiz commit imaj ve runtime kanıtı

- `git archive` ile yalnız `1fc8379805ff7b1c91f95aa5401f5024ab3f77ff` commit'i geçici, temiz klasöre açıldı. Arşiv yaklaşık 17 MB, Docker build context yaklaşık 14,65 MB idi; dört kullanıcı WIP dosyası bu bağlama alınmadı.
- Aynı arşivden `linux/arm64` backend ve frontend imajları frozen lockfile ile yeniden kuruldu. Yerel image ID'leri sırasıyla `sha256:73d07c94a57b3589c878f042404f89be41722d1b81187eaa9389433de01678c1` ve `sha256:607495dbd024f532619bbc622fdf8f8e3276be34b1b05d12f21168ce6c143927`; ikisinin OCI revision etiketi tam commit SHA'sı ile eşleşiyor. Bunlar registry digest'i değildir ve Coolify hedef mimarisi henüz teyit edilmedi.
- Frontend ağ kapalı, salt-okunur konteynerde `/tr/login` için HTTP 200 verdi. Backend yalnız iç Docker ağındaki geçici pgvector/PostgreSQL 17 ve Redis 7 ile production modunda 59 migration, şema eşitliği ve RBAC doğrulamasını geçti; `/api/v1/health` HTTP 200, anonim `POST /api/v1/auth/refresh` HTTP 401 verdi. İlk backend açılışındaki test amaçlı sentetik `ENCRYPTION_KEY` geçersizdi; 64 karakter hex anahtarla aynı imaj sorunsuz açıldı.
- Geçici backend, PostgreSQL, Redis konteynerleri ve iç ağ kaldırıldı. Kalıcı veri/volume, gerçek mail/ticket, dış AI bağlantısı, remote push veya deploy yoktu. Temiz imajlar yerel Docker'da kanıt olarak kaldı.

## Sonraki yerel kapı

K3 için Coolify hedef mimarisiyle uyumlu ve dilim bazlı imaj kanıtı; K4 için yetkili login/refresh, sentetik bilet oluşturma ve worker işleme smoke testi gerekir. Ardından salt-okunur Coolify envanteri ve canlı ön-kontrol yapılmadan yayın kararı verilmez.
