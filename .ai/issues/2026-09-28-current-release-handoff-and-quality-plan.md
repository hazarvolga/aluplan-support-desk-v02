# Güncel sürüm devri ve kalite işleri — 28 Eylül 2026

Bu belge başka ajanın işe başlayacağı **kaynağı**, bugün canlıya çıkan sürümleri ve ertelenen frontend/backend işlerini ayırır. Saatli üretim gözlemleri anlıktır; sonraki çalışma veya yayın öncesi yeniden doğrulanmalıdır. Bu belge yayın, veri değişikliği veya yeni bir ajana otomatik görev verme onayı değildir.

## 1. Yanlış klasörde çalışmayı önleyen kimlik kartı

| Konu | Kesin değer / kural |
| --- | --- |
| Monorepo Git kökü ve bu devir için tek çalışma klasörü | `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-release-candidate-20260919` |
| Git dalı | `security/release-candidate-20260919` |
| GitHub | `https://github.com/hazarvolga/aluplan-support-desk-v02.git`; bu dalın uzak HEAD'i kontrol anında `64d71aeccbffa092482faad550131a17744d364c` |
| Yerel HEAD, belge yazılmadan önce | `64d71aeccbffa092482faad550131a17744d364c` |
| Üst klasör | `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02` **Git kökü değil**; çok sayıda ayrı worktree/klasör içeriyor. Burada `pnpm`, commit veya deploy yapma. |
| Dokunulmayacak kardeşler | `aluplan-support-desk-v02-main-live-site`, `aluplan-ticket-hotfix-20260926`, `backend-security-hotfix-20260905`, `emergency-frontend-20260904`, `release-candidate-20260904`, `aluplan-build-Dif5UM`, `.private-data` altındaki detached build checkout'ları. Bunları aktif adayla birleştirme. |
| Kullanıcıya ait mevcut yerel değişiklikler | `apps/frontend/next-env.d.ts`, kök `package.json`, `pnpm-lock.yaml` değişmiş durumda. Bu belgenin işi değildir; incelemeden stage etme, düzeltme, geri alma veya bağımlılık sürümü için kullanma. |

Başlangıç kontrolü: `cd` ile yukarıdaki **tam** Git köküne gir; `git rev-parse --show-toplevel`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short` ve `git remote -v` çıktılarını bu tabloyla karşılaştır. Dal/checkout farklıysa çalışma yapma. `AGENTS.md` ve ilgili `.ai` belgelerini oku. `graphify-out/GRAPH_REPORT.md` bu checkout'ta mevcut değildi; yokluğu gizleyip güncel grafik raporu varmış gibi davranma.

## 2. Bugün canlıda çalışan iki ayrı kaynak revizyonu

28 Eylül 19:24 TRT civarında salt-okunur `docker ps` ve public HTTP kontrolleriyle doğrulandı:

| Canlı kaynak | Coolify uygulama UUID | Docker adı | Çalışan imaj etiketi/revizyon |
| --- | --- | --- | --- |
| `https://allplan.net.tr` frontend | `h8k4ko84wkksgws4socsowgg` | `frontend-api` | `h8k4ko84wkksgws4socsowgg:8622312a6dbd597884167189defa748ae58c3acc` |
| `https://api.allplan.net.tr` backend | `dc4csokww8ss0cs0sc8c8gco` | `backend-api` | `dc4csokww8ss0cs0sc8c8gco:64d71aeccbffa092482faad550131a17744d364c` |

`/tr/login` ve `/api/v1/health` HTTP 200 döndü. Bunlar kimlik ve temel ulaşılabilirlik kanıtıdır, bütün iş akışlarının veya güvenliğin sertifikası değildir. Üretimde ayrıca `allplan-release-maintenance-20260928` konteyneri çalışıyor; bu tek başına bakım yönlendirmesinin etkin olduğu anlamına gelmez. Uygulama yayını açısından canlı frontend `8622312a`, backend `64d71aec` revizyonundadır; aradaki tek commit sadece backend auth değişikliğidir. Bu belge için oluşturulan yerel docs-only commit canlı imajlardan farklı bir Git HEAD üretir, uygulama sürümünü değiştirmez ve GitHub'a push edilmemiştir. Dolayısıyla “iki servis aynı commit'te” demeyin. Önceki `.ai/current-focus.md` ve yayın kartındaki `Production NO-GO` satırları **yayın öncesi tarihsel anlara** aittir; bugün yapılan dar yayın için güncel kimlik yerine kullanılamaz. Yayın öncesi/sonrası veri ve mail kanıtlarının ayrıntıları o dosyalarda kalır.

GitHub PR [#26](https://github.com/hazarvolga/aluplan-support-desk-v02/pull/26) hâlâ `main`e karşı **draft/açık** ve HEAD `64d71aec`; bu yayın `main`e merge edildiği anlamına gelmez. Yeni iş aynı aday dalından ve bu klasörden başlamalı, `main`/HEAD'e veya başka Coolify kaydına kör deploy yapılmamalı. Push ve deploy ayrıca açık kullanıcı onayı gerektirir.

## 3. Son hafta ve bugünkü kararların kısa olay haritası

Bu, yüzlerce commit'in tek tek dökümü değil, yeni ajanın davranışını etkileyen doğrulanabilir özetidir:

| Dönem | Yapılan / sınır |
| --- | --- |
| 22–24 Eylül | Aday backend'de oturum/RBAC, müşteri erişimi, mail alma-gönderme ve canlı yazarların bakımda güvenli durdurulması üzerine dar düzeltmeler/provalar yapıldı. `ADR-021` müşteri izinlerini DB kaynaklı tutar; `ADR-022` eski güvensiz imaja otomatik geri dönüş yerine veri koruyan ileri kurtarmayı seçer; `ADR-023` şüpheli inbound teslimleri otomatik tekrar oynatmaz. Bu çalışmaların tümü canlıda tek tek kanıtlanmış sayılmaz. |
| 26 Eylül | Kapalı biletin yetkili tarafından yeniden açılması için frontend/backend yolu ve testleri geliştirildi. `ANN_TASLAK` butonunun Türkçe görünen metni mevcut kaynakta zaten `AI Yanıtı`; diğer `ANN_*` metinleri açık kaldı. Kategori/ekip kavramları karşılaştırıldı. |
| 27 Eylül | Tek aday kaynakta birleştirme, kesin imaj/CI, izole gerçek-veri kopyasında migration provası, şifreli DB ve posta yedekleri ile geçici R2 kurtarma kopyası, mail TLS ve kontrollü bakım hazırlığı yapıldı. Tarihsel yedek/kayıt sayıları bir anlık görüntüdür; güncel müşteri veri sayısı değildir. Eski `knowledge-sync` 500 failed ve beş `FAILED_STORAGE_UPLOAD_...` ek işareti bilinen ertelenmiş konulardı; otomatik retry/silme yapılmamalı. |
| 28 Eylül — lisanslama | `2cb58641` ile yeni bilette **Lisanslama** ayrı görünür kategori oldu. Yeni departman yaratmaz: mevcut `billing-payments` departmanını seçer ve `licensing` etiketini gönderir. Bu, tüm ekip üyelerine ortak bilet sahipliği özelliği değildir; çoklu ekip görünürlüğünü yapılmış saymayın. |
| 28 Eylül — CRM | `113d6eb2` süresi eskimiş Dynamics delta cursor'ını ancak daha yeni ve temiz tam içe aktarım kanıtı varsa güvenli tabandan yeniden başlatır; gerçek silinmeleri sessizce işlemez. Kullanıcının yenilediği anahtar, delta'nın otomatik sağlıklı olduğunu tek başına kanıtlamıyordu. Önceki canlı kontrolünde account/contact delta başarılıydı; gelecekteki bütün senkronlar için garanti değil. |
| 28 Eylül — yayın | `8622312a` kapsamındaki frontend, ardından backend Coolify üzerinden yayımlandı. `64d71aec` backend auth profilinde rol izinlerini geri döndürerek yeniden açma kontrolünü görünür kıldı; backend ayrıca yayımlandı. Kullanıcı kapalı bileti canlıda açtığını bizzat doğruladı. Bu devirde hiçbir canlı değişiklik yapılmadı. |

## 4. Yeni ajana ilk iş: frontend metin/etiket planı

**Amaç:** İç sistem kodu gibi görünen `ANN_*` ifadelerini kullanıcıya anlaşılır, TR/EN/DE tutarlı metne dönüştürmek. Kullanıcı hangi etiketlerin hangi ifadeye çevrileceğini ayrıca söyleyecek; kesin kelime seçimini ajanın tahmin edip yayınlaması uygun değildir.

1. `apps/frontend/messages/{tr,en,de}.json` içinde ve gerçek ekranlarda görünen `ANN_*`, `AI TICKET TRACE`, teknik `*_KODU` benzeri metinleri envanterle. Özellikle bilet detayı `apps/frontend/src/app/[locale]/(dashboard)/tickets/[id]/page.tsx` satır 633/645/760: `ai_summary_btn`, `ai_draft_btn`, `ai_summary_record`. Türkçe kaynakta `ai_summary_btn=ANN_ÖZET`, `ai_draft_btn=AI Yanıtı`, `ai_summary_record=ANN_ÖZET_KAYDI`; EN/DE özet karşılıkları da ham `ANN` içeriyor. `ai_confidence`, tanılama başlığı ve asistan metninde başka `ANN` kullanımları var.
2. Her etiket için ekran/rol, mevcut TR-EN-DE metni, önerilen yeni metin ve anlam etkisini küçük bir tabloya çıkar. “Özet” ile “taslak yanıt”ı karıştırma: bunlar farklı AI işlemleri; müşteri tarafından gönderilmiş yanıt izlenimi verme. Kullanıcının son metin onayını al.
3. Onaylanan kopyayı **yalnız görünür i18n değerlerinde** değiştir; translation key, API alanı, bilet statüsü, trace şeması, model prompt'u veya backend davranışını sırf isim düzeltmesi için değiştirme. Sabit metin/eksik yerelleştirmeler ayrı küçük difflere ayrılabilir.
4. Odaklı i18n/komponent testleri ve `pnpm i18n:check` çalıştır; lokal bilet detayı ve yeni bilet ekranlarını gerçek render'da TR/EN/DE kontrol et. Ekran görüntüsü veya kısa test kanıtını teslim et. Canlı müşteri biletinde butona basarak AI üretimi veya gönderimi tetikleme.

## 5. Frontend ve backend kalite/uyarı borcu: ayrı, öncelikli işler

28 Eylül `64d71aec` GitHub koşuları bu listenin kaynağıdır: [Frontend CI](https://github.com/hazarvolga/aluplan-support-desk-v02/actions/runs/36416406105), [Backend CI](https://github.com/hazarvolga/aluplan-support-desk-v02/actions/runs/36416405990), [CI Quality Gate](https://github.com/hazarvolga/aluplan-support-desk-v02/actions/runs/36416406236). Yeni commit geldiğinde bu sonuçlar tarihsel olur; yeni koşu okunmalıdır.

| Öncelik / alan | Bugünkü kanıt | En küçük sonraki iş / bitiş ölçütü |
| --- | --- | --- |
| P1 Frontend lint | Unit ve coverage geçti; job repository-geneli `Lint`te kaldı. Çok sayıda `@typescript-eslint/no-explicit-any`, kullanılmayan değişken ve `@next/next/no-assign-module-variable` örneği var. Frontend Playwright E2E bu nedenle **skipped**, geçmiş sayılmaz. | Hataları dosya/kural bazında sayıp kümelere ayır; önce dokunulan dosyalarda yeni hata eklememe, sonra küçük tip güvenli partiler. ESLint'i toptan kapatma veya testleri gevşetme. Her partide ilgili test/typecheck; son hedef frontend lint ve E2E'nin yeşil olması. |
| P1 Ortak bağımlılık güvenliği | Quality Gate `pnpm audit --prod --audit-level high`: **33 toplam = 7 low + 19 moderate + 7 high**. Yedi High, `html-minifier`, `picomatch`, OpenTelemetry, `linkify-it` ve Tiptap ailelerinde. Önceki yerel Trivy imaj sonucu bu GitHub audit sonucunu ortadan kaldırmaz. | Gerçek üretim erişilebilirliğini ve düzeltilebilir sürümleri paket bazında incele; küçük lockfile diffleriyle düzelt, exact imajı yeniden tara. Geniş sürüm atlaması veya `audit` bastırması yapma. Kök `package.json` ve lockfile şu anda kullanıcıya ait kirli değişiklikler içeriyor; onlara karışmadan önce sahiplik/net kapsam belirle. |
| P1 Ortak CI/E2E altyapısı | Quality Gate build, spec-code, Docker build/scan ve geniş test/coverage işleri geçti; fakat End-to-End Tests `config.webServer` için 300.000 ms timeout ile düştü. Backend CI'nin iki işi (unit/integration ve backend E2E) geçti. Bu, frontend Playwright E2E'nin geçtiği anlamına gelmez. | WebServer bootstrap/health, disposable Postgres/Redis, migrate/seed ve doğru localhost API hedefini CI loguyla teşhis et; prod/staging'e test verisi gönderme. Dar fixture düzeltmesi ve tekrarlanabilir browser E2E geçişi kanıtı üret. |
| P2 Frontend i18n/UX uyarıları | `ANN_*` kopyası ve TR/EN/DE tutarsızlıkları görünür; diğer yerelleştirmelerde eski/karışık metinler var. CRM 400 toast'unun yenilenmiş anahtara rağmen görünmesi eski delta cursor durumundan kaynaklanıyordu; yeni hatalar yine gerçek olabilir. | Kullanıcının kelime listesiyle kapsamı dondur; bildirimde yeni gerçek hatayı gizleme. UX kopyası ve hata davranışı ayrı diflerde olsun. |
| P2 Backend/operasyon uyarıları | Bilinen 27 Eylül envanterinde 500 failed `knowledge-sync` ve 5 failed-upload marker vardı; geçersiz crawl URL açıklaması henüz kök neden kanıtı değil. 28 Eylül backend CI yeşil; bu işler kendiliğinden kapanmış sayılmaz. | Yayın sonrası ayrı kapsamda, müşteri verisini silmeden/queue replay yapmadan nedenleri sınıflandır, gerekiyorsa kontrollü düzeltme öner. CRM delta, mail-to-ticket ve rol erişimini izlemeye devam et. |
| P3 CI araç uyarıları | GitHub Actions logunda Node 20 actions deprecation; Node `url.parse()`/`punycode` deprecation uyarıları var. | Güvenlik/advisory ve işlevsel kapılar çözüldükten sonra action/runtime güncellemesini ayrı uyumluluk değişikliğiyle yap. |

Bu tablo “yayını geri al” kararı değildir; çalışan canlı hizmet ile kırmızı CI/teknik borcu birlikte ve dürüstçe gösterir. Özellikle High bağımlılık bulguları için “ulaşılamaz/güvenli” diye kesin hüküm yoktur. Üretim verisine migration, reset, seed veya yerel DB kopyası yazmak bu iş paketlerinde yasaktır.

## 6. Devir teslim ve benden istenecek inceleme

Başka ajana önerilen sıra: (1) repo/HEAD/dirty-files kontrolü, (2) görünür metin envanteri ve kullanıcının seçtiği karşılıklar, (3) küçük frontend i18n değişikliği + lokal render/test, (4) lint/CI/audit sorunları için ayrı, kanıtlı iş listesi ve ancak onaylanan küçük düzeltmeler. Backend tarafında önce kırmızı Quality Gate E2E'nin gerçek nedeni ve 7 High paket ailesinin etkisi ayrıştırılsın; başarılı Backend CI gereksiz yere yeniden yazılmasın. Frontend etiket temizliği ile dependency/CI düzeltmelerini tek commit/deploy içinde karıştırmayın.

Diğer ajan teslim ettiğinde ben: çalışma klasörü ve dalını, başlangıç HEAD'ini, kullanıcıya ait üç dosyanın korunmasını, diff kapsamını, i18n anlamlarını/rollere göre görüntüyü, odaklı testleri ve yeni CI sonucunu karşılaştırmalı inceleyeceğim. Bu inceleme tamamlanmadan “hazır/production-ready” demeyeceğim. `main` merge, push, Coolify deploy, veritabanı/mail/R2/Redis işlemleri veya üretim biletine yazı için bu belge yetki vermez.
