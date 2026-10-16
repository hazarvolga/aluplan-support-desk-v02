# 16 Ekim 2026 — Yerel Release Dilimleme ve Kabul Kartı

## Durum

`EXECUTING` — Bu kart yalnız yerel hazırlık ve kabul kanıtı içindir. Remote push, Coolify ayar değişikliği, build, deploy, migration veya canlı veri/queue/mail işlemi yetkilendirilmemiştir.

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
| K3 — dilim imajları | Her R0–R3 için bağımsız, aynı architecture local/staging build ve image digest | PENDING |
| K4 — izole runtime | Geçici Postgres/Redis ile login/refresh, ticket, worker ve health smoke | R3 auth kanıtı PASS; tam dilim runtime PENDING |
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
- Coolify'nin mevcut build cache'i, image digest'leri ve pnpm 11 runtime uyumu canlıdan bağımsız doğrulanmadı.
- Mail/queue/R2/CRM sistemleri için canlı etkisiz geçiş kanıtı eksiktir; geçmiş tarihli notlar canlı durum yerine geçmez.
- Mevcut branch bir release branch'i olarak ayrıştırılmadı. Sadece planlanan commit aralıklarından staging branch üretmek bile yeni Git state yaratır; kullanıcı onayı olmadan yapılmayacaktır.

## En küçük sonraki karar

K3 için yalnız yerel, disk etkili Docker image build ve geçici izole runtime provası yapılmasına izin verilecek mi? Bu izin deploy, push veya canlı erişim izni değildir.
