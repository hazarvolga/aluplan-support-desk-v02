# Güncel sürüm devri ve kalite işleri — 28 Eylül 2026

Bu belge başka ajanın işe başlayacağı **kaynağı**, bugün canlıya çıkan sürümleri ve ertelenen frontend/backend işlerini ayırır. Saatli üretim gözlemleri anlıktır; sonraki çalışma veya yayın öncesi yeniden doğrulanmalıdır. Bu belge yayın veya üretim verisi değişikliği onayı değildir.

**Son kullanıcı kararı — 28 Eylül, sistem röntgeni sonrası:** Kullanıcı bu belgeyi diğer ajana kendisi iletecek. Uygulayıcı ajan önce yalnız **STAB-00: ayrı dal/worktree + uygulanabilir TODO planı** görevini tamamlayacak; ana ajan teslimi denetleyip sonraki aşamayı onaylayacak. Bu belgede aşağıda tanımlanan ürün düzeltmeleri ilk görevin uygulama yetkisi değildir. Eski “aynı aday dalında çalış / ilk iş etiketleri değiştir” sırası bu kararla yürürlükten kalkmıştır. Hedef yeniden yazım veya kusursuzluk iddiası değil, mevcut platformu küçük ve veri koruyan düzeltmelerle güvenilir hale getirmektir.

## 1. Yanlış klasörde çalışmayı önleyen kimlik kartı

| Konu | Kesin değer / kural |
| --- | --- |
| Korunacak kaynak Git kökü; yeni geliştirme burada yapılmayacak | `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-release-candidate-20260919` |
| Korunacak kaynak dalı | `security/release-candidate-20260919` |
| GitHub | `https://github.com/hazarvolga/aluplan-support-desk-v02.git`; önceki uzak dal gözlemi `64d71aeccbffa092482faad550131a17744d364c`, bu devir güncellemesinde uzaktan yenilenmedi |
| Bu devir güncellemesinde doğrulanan yerel başlangıç HEAD'i | `20240db46ed086ab17cb20615f535b38d298cb62`; canlı frontend/backend SHA'larıyla aynı olduğu iddia edilmez |
| STAB-00 için ayrılacak yeni dal | `fix/production-stabilization-20260928` |
| STAB-00 için ayrılacak tek uygulama çalışma alanı | `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-stabilization-20260928` — henüz oluşturulmadı; bu belgeyi alan ajan oluşturacak |
| Üst klasör | `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02` **Git kökü değil**; çok sayıda ayrı worktree/klasör içeriyor. Burada `pnpm`, commit veya deploy yapma. |
| Dokunulmayacak kardeşler | `aluplan-support-desk-v02-main-live-site`, `aluplan-ticket-hotfix-20260926`, `backend-security-hotfix-20260905`, `emergency-frontend-20260904`, `release-candidate-20260904`, `aluplan-build-Dif5UM`, `.private-data` altındaki detached build checkout'ları. Bunları aktif adayla birleştirme. |
| Kullanıcıya ait mevcut yerel değişiklikler | `apps/frontend/next-env.d.ts`, kök `package.json`, `pnpm-lock.yaml` değişmiş durumda. Bu belgenin işi değildir; incelemeden stage etme, düzeltme, geri alma veya bağımlılık sürümü için kullanma. |

Başlangıç kontrolü: `cd` ile yukarıdaki **tam** Git köküne gir; `git rev-parse --show-toplevel`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short` ve `git remote -v` çıktılarını bu tabloyla karşılaştır. Dal/checkout farklıysa çalışma yapma. `AGENTS.md` ve ilgili `.ai` belgelerini oku. `graphify-out/GRAPH_REPORT.md` bu checkout'ta mevcut değildi; yokluğu gizleyip güncel grafik raporu varmış gibi davranma.

Üç kullanıcı WIP dosyasının birleşik diff SHA-256 referansı: `c16c01ba1002f74f5a830950486b56da8b97b594b08717a6bfb9742e0fecce4c`. Kontrol: `git diff -- apps/frontend/next-env.d.ts package.json pnpm-lock.yaml | shasum -a 256`. Fark varsa kullanıcı yeni iş yapmış olabilir; geri alma, durumu bildir. Ayrıca `.ai/current-focus.md`, `.ai/session-summary.md` değişmiş; röntgen raporu untracked durumdadır. Bu rapor ve bu handoff'un son hali başlangıç commit'inin içinde varsayılamaz. **Yalnız iki belgeyi** yeni worktree'ye açık dosya listesiyle aktar; tüm dirty tree'yi kopyalama/stash/cherry-pick yapma.

## 2. Bugün canlıda çalışan iki ayrı kaynak revizyonu

28 Eylül 19:24 TRT civarında salt-okunur `docker ps` ve public HTTP kontrolleriyle doğrulandı:

| Canlı kaynak | Coolify uygulama UUID | Docker adı | Çalışan imaj etiketi/revizyon |
| --- | --- | --- | --- |
| `https://allplan.net.tr` frontend | `h8k4ko84wkksgws4socsowgg` | `frontend-api` | `h8k4ko84wkksgws4socsowgg:8622312a6dbd597884167189defa748ae58c3acc` |
| `https://api.allplan.net.tr` backend | `dc4csokww8ss0cs0sc8c8gco` | `backend-api` | `dc4csokww8ss0cs0sc8c8gco:64d71aeccbffa092482faad550131a17744d364c` |

`/tr/login` ve `/api/v1/health` HTTP 200 döndü. Bunlar kimlik ve temel ulaşılabilirlik kanıtıdır, bütün iş akışlarının veya güvenliğin sertifikası değildir. Üretimde ayrıca `allplan-release-maintenance-20260928` konteyneri çalışıyor; bu tek başına bakım yönlendirmesinin etkin olduğu anlamına gelmez. Uygulama yayını açısından canlı frontend `8622312a`, backend `64d71aec` revizyonundadır; aradaki tek commit sadece backend auth değişikliğidir. Bu belge için oluşturulan yerel docs-only commit canlı imajlardan farklı bir Git HEAD üretir, uygulama sürümünü değiştirmez ve GitHub'a push edilmemiştir. Dolayısıyla “iki servis aynı commit'te” demeyin. Önceki `.ai/current-focus.md` ve yayın kartındaki `Production NO-GO` satırları **yayın öncesi tarihsel anlara** aittir; bugün yapılan dar yayın için güncel kimlik yerine kullanılamaz. Yayın öncesi/sonrası veri ve mail kanıtlarının ayrıntıları o dosyalarda kalır.

Önceki GitHub gözleminde PR [#26](https://github.com/hazarvolga/aluplan-support-desk-v02/pull/26) `main`e karşı **draft/açık**, HEAD `64d71aec` idi; bu yayın `main`e merge edildiği anlamına gelmez. Bu güncellemede PR/canlı kimlikleri yeniden sorgulanmadı. Yeni iş tablo 1'deki **yerel kesin commit'ten ayrı worktree'de** başlayacak. `main`/HEAD'e veya başka Coolify kaydına kör deploy yapılmamalı. Push ve deploy ayrıca açık kullanıcı onayı gerektirir.

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

## 4. Sonraki UX paketinde korunacak frontend metin/etiket kapsamı — ilk görev değil

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

## 6. Röntgen raporu: diğer ajanın anlaması gereken ürün ve bulgular

**Zorunlu eşlik eden rapor:** `.ai/issues/2026-09-28-system-xray-and-learning-cycle-audit.md`. Bu handoff onun yerine geçmez. Rapor kaynak dosya/fonksiyon/satır referanslarını, koddan çıkarımı ve canlı ekranda gözlenenleri ayrı tutar. Yaklaşık 128.700 satırlık envanterin tamamının tek tek okunduğu veya canlıda güvenlik istismarı denendiği iddia edilmez. Yeni ajan düzeltmeden önce ilgili kaynak referansını başlangıç commit'inde kontrol etmelidir.

### Ürünün korunacak çalışma prensibi

- Bu yalnız bilet CRUD uygulaması değil: Dynamics CRM müşteri kabulü, Allplan/Hotinfo teşhisi, insan destek operasyonu, çok kanallı iletişim, AI yanıtları, kaynak havuzu ve insan onaylı bilgi yayını birlikte çalışır. NestJS + Next.js + Prisma/PostgreSQL/pgvector + Redis/Bull + mevcut AI sağlayıcıları korunacak. Yeni vektör DB, ajan çatısı veya mikroservis tasarımı yok.
- CRM'de olmak müşteri kabul ölçütüdür; ayrı “destek alabilir” sözleşme alanı istenmedi. Mevcut hesabın girişinde her defasında CRM'e gidildiğini varsayma. Personel ve elle eklenmiş geliştirme hesaplarını CRM dışı diye silme/pasifleştirme; test adresleri ve mevcut super-admin yetkileri değiştirilmeyecek.
- Lisanslama = mevcut Billing & Payments departmanı + `licensing` etiketi. Tek kullanıcı ataması ve departman vardır; bütün ekip üyelerine ortak sahiplik tamamlanmış özellik sayılmaz. Bu yeni işte ekip modelini genişletme.
- Özet, AI taslak yanıtı, müşteriye sunulan teşhis ve otomatik internal draft ayrı işlemlerdir. Auto-resolver internal taslak yazıp DRAFT yapabilir; müşteriye otomatik gönderim veya otomatik kapatma anlamına gelmez.
- Öğrenme tek yol değildir: CSAT >=4 olayı, gece/manuel SSS çıkarımı, kümeleme ve insan yayın onayı farklı koşullara sahiptir. CSAT akışı anketten sonra durum değiştirebilir; butona basmayı, anket göndermeyi ve yayınlamayı birbirine karıştırma. Kullanıcı puanı teknik doğruluk sertifikası değildir.
- `knowledgeBaseAdded`, aday oluşturulduğunu gösterebilir; kamuya onaylanmış ve RAG'de kullanılabilir bilgi demek değildir. Internal/PUBLISHED ile public/PUBLISHED da aynı şey değildir. Bu sistem model fine-tuning'i yaptığını kanıtlamaz; bilgi çıkarma/indeksleme/retrieval katmanları iyileşir.
- Crawler keşif → aday → onay/içe aktarma → kaynak → kuyruk/embedding → retrieval zinciridir. Ekranda HAZIR görünen aday yalnız içeriğin alınabildiğini gösterebilir. URL kaydı, aday ve aktif indeks ayrı durumlardır.

### Bulguların öncelik özeti

| ID / alan | Raporda saptanan sorun | Dar düzeltme hedefi / sınır |
| --- | --- | --- |
| SEC-01 CSAT | Feedback yolu müşteri sahipliğini kullanmıyor; başka bilet UUID'si üzerinden yetkisiz değerlendirme/durum değişimi riski | Sahiplik, rol, izin verilen durum ve DTO doğrulaması. Mevcut destek-personeli iş akışını açık sözleşmeyle koru. |
| SEC-02 refresh | Tam JWT'nin bcrypt ile karşılaştırılmasında 72 bayt sınırı, eski token yeniden kullanımını ayıramama riski | Token'ın tüm içeriğini kapsayan doğrulama; rotasyon/revocation korunmalı. Gerekli yeniden giriş etkisini açıkla; kullanıcı parolalarını topluca değiştirme. |
| SEC-03 profil parolası | Mevcut parola/minimum parola sözleşmesi ve oturum/reset iptal zinciri eksik | Mevcut güvenli reset yoluyla tutarlı dar parola değişim akışı. Yetkisiz parola değişimi ve eski oturum devamı önlensin. |
| SEC-04 WhatsApp | Bilinmeyen numarada undefined kullanıcı filtresi başka müşterinin açık biletini seçebilir | Bilinmeyen gönderende güvenli ret/karantina; asla başka kullanıcı bileti seçme. Canlı kanalın etkinliği doğrulanmış değil. Kanalı etkinleştirme. |
| RAG-01 ve cache | Raw makale sorgusunda silinme/güncel sürüm şartları; Redis ve semantic cache iptali tutarsız | Geri çekilmiş/eski içeriğin müşteriye dönmesini önle; ilgili iki cache yolunu ele al. Yeni cache mimarisi kurma. |
| PRIV-01 / öğrenme | İç notlar bazı özet/embedding yollarına giriyor; bazı adaylar çözüm yerine sorun metninden üretiliyor | Public bilgi ve müşteri cevaplarına iç not/kişisel veri taşınmasın; adayın doğrulanabilir çözüm kaynağı olsun. Kanıtlanmış müşteriler arası sızıntı varmış gibi yazma. |
| CRAWL-01 | Queue ekleme hatasında takılı SYNCING; yeni embedding başarısızken eski iyi indeks kaybı | Hata görünür olsun; sağlayıcı hatasında son iyi indeks korunsun. Bir temsilî public URL ile dar uçtan uca doğrulama. |
| RAG-02 model migration | Dry-run/kalıcı hata döngüsü ve hedef sürüm/işlem anındaki ayar uyuşmazlığı | Bu çalışma boyunca model/embedding sürümü değişimi ve toplu reindex yok. Düzeltme ertelenirse riskli işlem için uygulanabilir kullanım engeli/operasyon kısıtı açıkça teslim edilsin; mevcut tehlikeli yolu güvenli sayma. |
| INT / operasyon | İmzalı webhook ile CSRF sınırı; genel/bulk güncelleme özel kontrolleri atlayabiliyor; retry/atama/bildirim yarışları | Kullanılan yolun somut güvenlik/veri riski önce. Global CSRF kapatma, otomatik replay veya kullanılmayan dış webhook'u etkinleştirme yok. |
| UX / yardım | ANN dili, yanlış öğrenme/puan açıklamaları, eksik çeviri anahtarları, rol/sayaç farkları | Teknik teşhis ekranını ana işten ayır; gerçek aday/onay/indeks durumunu anlat. Kullanıcının seçtiği görünür metinleri uygula. |

**Crawler kök nedeni konusunda kritik düzeltme:** Canlı ekrandaki bir FAILED kaynağın geçmişinde 8 Eylül Gemini embedding 429/kredi tükenmesi görüldü. Bu, bütün 500 eski işin bozuk link olduğu veya şu an kredinin bittiği kanıtı değildir. Bir LearnNow adayı PENDING_REVIEW/3224 karakter/54 görsel olarak görüldü; RAG'e başarıyla girdiği kanıtlanmadı. Eski işleri topluca retry/silme yapma.

## 7. Kabul edilen uygulama sırası — iki küçük yayın paketi

Her satır ayrı ve denetlenebilir iş olsun. Bitiş ölçütü sağlanmadan sonraki kapsamı büyütme. Aşağıdaki uygulama işleri STAB-00 incelemesinden sonra görev bazında açılacak.

| Sıra | Paket / yapılacak iş | Bitiş ölçütü |
| --- | --- | --- |
| 0 | **STAB-00:** doğru commit'ten ayrı worktree, belge aktarımı, TODO ve kanıt teslimi | Kod değişmeden kaynak WIP korunmuş; ana ajan incelemesi bekleniyor. |
| 1 | **Paket A — erişim/oturum güvenliği:** SEC-01 → SEC-02 → SEC-03 → SEC-04; ilgili genel/bulk yetki sınırları | Her düzeltmede önce açığı gösteren dar regresyon, sonra izinli/izinsiz durum; mevcut giriş/bilet/yeniden açma akışı korunuyor. Canlı exploit denemesi yok. |
| 2 | **Paket A — kısa yayın hazırlığı:** değişen uygulama typecheck/build, odaklı auth/bilet smoke, erişilebilir High bağımlılıkların ve gerekli CI kapılarının kararı | İncelemeyi engelleyen açıklar kapalı; kalan borçlar gerekçeli. GitHub/Coolify yayını ancak ayrı kullanıcı onayıyla. Paket A, bütün crawler/UX işlerinin bitmesini beklemez. |
| 3 | **Paket B — güvenilir bilgi:** RAG-01/cache → PRIV-01/çözüm temelli aday → aday/onay/indeks durumları | Silinmiş/eski içerik ve iç not müşteri yanıtına taşınmıyor; bir uygun çözümden onaylı/retrievable bilgiye zincir gösterilebiliyor. Yeni öğrenme motoru yok. |
| 4 | **Paket B — çalışan ingestion:** CRAWL-01, custom URL/aday/import hata durumları; RAG-02 için sınırlı düzeltme veya açık kullanım engeli | Tek temsilî public URL uçtan uca çalışıyor; provider hatasında iyi indeks korunuyor; toplu crawl/reindex yapılmıyor. |
| 5 | **Paket B — anlaşılır kullanım:** bölüm 4 etiketleri, gerçek öğrenme durumları, yardım ve ilgili sayaç/rol farkları | TR/EN/DE'de değiştirilmiş ekranlar anlaşılır; “taslak/aday/yayımlandı/indekslendi” ayrımı doğru; kapanma/değerlendirme yan etkisi açık. |
| 6 | **Ertelenen işler:** kalan repo-geneli lint, kozmetik uyarılar, kullanılmayan entegrasyonlar ve kapsamlı retry/performans iyileştirmeleri | Her maddeye neden ertelendiği ve yeniden açma koşulu yazılmış. Veri kaybı/güvenlik riski gösterilen bir madde sırf eski diye ertelenmez. |

**Test bütçesi:** Tüm repo testlerini her küçük değişiklikte tekrar çalıştırma. Önce ilgili kusuru gösteren test, düzeltmeden sonra ilgili olumlu/olumsuz yollar; paket sonunda etkilenen app typecheck/build ve küçük kritik akış smoke'u. UI değişirse gerçek yerel render kontrolü. Zorunlu CI kapılarını kapatma, hatayı suppress ederek yeşil gösterme. Eski lint/coverage borcu ile yeni regresyonu ayır; yalnız belgelerden oluşan STAB-00 için test/build/install çalıştırma. Sonradan kod değişiklikleri bağımsız code review, güvenlik değişiklikleri security review gerektirir.

**Veri ve yayın sınırı:** Canlı müşteri DB'si asıl kaynaktır; yerel DB hiçbir zaman canlıya geri yüklenmez. Geliştirmede üretim bağlantısı/Redis kuyruğu/SMTP/CRM/AI zamanlayıcıları kullanılmaz. Gerekirse sonraki onaylı aşamada izole veri kopyası; STAB-00'da kopya alınmaz. Tercih şemasız uyumlu düzeltme; migration gerçekten gerekirse ayrı veri koruma kararı ve prova. Yayında taze DB kurtarma kontrol noktası ve yeni kabul edilen müşteri yazılarını koruyan plan gerekir; değişmeyen R2/mail için her küçük adımda yeniden tam yedek döngüsü başlatma. ADR-022 ile uyumsuz eski imaj rollback'i vaat etme. Onaylı yayın GitHub/PR → standart Coolify kaydı üzerinden, sunucu kapasitesi nedeniyle eşzamanlı değil sıralı yapılır; frontend/backend sıra uyumluluğu release diff'ine göre doğrulanır. Elle gizli alternatif konteyner/yayın yolu yok.

## 8. Diğer ajana verilecek İLK görev — STAB-00

### Yetki ve teslim sınırı

Bu belge kullanıcı tarafından görev olarak iletildiğinde yalnız yerel Git worktree/dal hazırlığı ve dokümantasyon için talimattır. **Ürün kodunu düzeltme.** Dal/worktree zaten varsa üzerine yazma, resetleme, silme veya aynı isimle yeniden oluşturma; kimliğini inceleyip farkı bildir. Kaynak HEAD/WIP referansı değişmişse nedenini netleştirmeden devam etme. Diğer ajanlar/kullanıcı aynı kaynakta çalışıyor olabilir; onların değişikliklerini geri alma.

1. Kaynak kökü, dal, tam HEAD, remote ve dirty dosyaları doğrula. `AGENTS.md`, `.ai/bootstrap.txt`, `.ai/current-focus.md`, `.ai/session-summary.md`, ilgili `.ai/architecture-decisions.md` kararlarını, bu handoff'u ve **röntgen raporunun tamamını** oku. Tarihsel NO-GO ve canlı gözlemleri güncel karar sanma. Eksik grafik raporu için bu görevde indeks üretme.
2. `git worktree list` ve dal/dizin varlığı kontrolünden sonra, yoksa, tam `20240db46ed086ab17cb20615f535b38d298cb62` commit'inden `fix/production-stabilization-20260928` dalını belirtilen `aluplan-stabilization-20260928` worktree'sinde oluştur. Mevcut aday klasöründe branch checkout yapma. Git worktree ortak Git metadata kullanır; bağımsız tam yedek değildir.
3. Kaynaktaki **güncel bu handoff** ile **röntgen raporunu** yeni worktree'nin aynı `.ai/issues/` yollarına aktar; kaynak/hedef SHA-256 eşitliğini kaydet. Kaynak belgeleri değiştirme. `.env*`, `.private-data`, müşteri dump'ları, şifreler, tokenlar, `node_modules`, build çıktıları ve üç kullanıcı WIP dosyasını kopyalama. Kaynak dirty değişiklikleri yeni dalda varmış gibi söyleme.
4. Yalnız yeni worktree'de `.ai/issues/2026-09-28-production-stabilization-todo.md` oluştur. Bölüm 7'deki sıra ve rapor ID'leri ile her iş için: sorun/kanıt referansı, etkilenen dosya/modül, yapılacak en küçük değişiklik, açıkça kapsam dışı işler, bağımlılık, kabul ölçütü, odaklı doğrulama, veri/migration etkisi, kullanıcı kararı gereken nokta. `PENDING / IN_PROGRESS / REVIEW / DONE / DEFERRED` durumlarını kullan; STAB-00 hariç bütün uygulama işleri PENDING kalsın. Etiket karşılıklarını kullanıcı onayını bekleyen öneri olarak tut.
5. İnceleme için diff/dosya listesi ve belge hash'lerini teslim et. Bu aşamada commit/push/deploy yapma; ana ajanın belge incelemesinden sonra yalnız yeni dalda açık dosya listesiyle docs-only yerel checkpoint hazırlanabilir. `git add .` kullanma. Kaynak WIP hash'inin değişmediğini tekrar göster. STAB-00 durumunu **REVIEW** yap ve dur.

**Yapılmayacaklar:** Ürün/test/lockfile/Docker/CI dosyası düzenleme, dependency install/update, test/build/dev-server/cron çalıştırma, DB migration/seed/restore/download, container başlatma/durdurma, provider/SSH/Coolify/CRM/mail/R2/Redis erişimi, canlı UI butonlarına basma, parola değiştirme, queue retry/cleanup, main merge, remote push/tag/PR veya deploy. Özellikle raporu düzeltme yetkisi sanıp SEC-01'i bile bu görevde uygulama.

### Kopyalanabilir görev mesajı

> Önce `.ai/issues/2026-09-28-current-release-handoff-and-quality-plan.md` belgesini, kaynak repo `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-release-candidate-20260919` içinde oku. Eşlik eden `2026-09-28-system-xray-and-learning-cycle-audit.md` raporunu da tamamen oku. Yalnız bölüm 8'deki **STAB-00** görevini uygula: mevcut aday dalını ve kullanıcı WIP'ini değiştirmeden kesin commit'ten ayrı dal/worktree hazırla, iki belgeyi doğrulayarak aktar, sıralı TODO oluştur. Kod düzeltme, test/build/install, commit, push ve canlı erişim yapma. Teslimde yeni worktree yolu/dalı/başlangıç SHA'sı, Git durumları, kaynak WIP koruma kanıtı, belge hash'leri, TODO yolu ve açık kararları ver. Ana ajan incelemesi için REVIEW durumunda dur; sonraki aşamaya kendiliğinden geçme.

## 9. Ana ajanın denetimi ve onay mekanizması

Kullanıcı diğer ajanın teslimini bu göreve getirir. Ben salt-okunur karşılaştırmada şunları denetlerim:

- Yeni dalın başlangıcı tam `20240db46ed086ab17cb20615f535b38d298cb62` mi; çalışma kökü doğru mu; mevcut adayın dalı/HEAD'i ve üç WIP dosyası korunmuş mu?
- Yalnız izinli belgeler değişmiş mi; iki kaynak belgesi birebir aktarılmış mı; sır/DB/env/build çıktısı taşınmış mı?
- TODO somut rapor kanıtına dayanıyor mu; SEC-01..04 önce mi; paketler ayrılmış mı; gereksiz refactor ve repo-geneli test döngüsü eklenmiş mi?
- Müşteri verisi, iç notlar, mevcut oturumlar ve CRM/test hesapları için sınırlar açık mı; aday/onay/yayın/indeks ayrımı korunmuş mu?
- Uygulama işleri henüz PENDING mi; teslim gerçek kanıt mı, yapılmamış test/canlı başarı iddiası var mı?

Sonuç **KABUL / DÜZELTME GEREKİYOR / BLOKE** olur; gerekçeyi dosya/diff ile veririm. STAB-00 kabulü yalnız plan ve izolasyon kabulüdür, production-ready veya deploy onayı değildir. Kabulden sonra ilk ürün görevi **yalnız SEC-01 CSAT sahiplik/izin doğrulaması** olarak ayrıca sınırlandırılacak; bütün güvenlik paketini tek seferde başlatma. Ürün tesliminde kod/test ve gerektiğinde güvenlik incelemesi yapılmadan tamamlandı sayılmaz. Push ve deploy için kullanıcıdan ayrıca açık talep gerekir.
