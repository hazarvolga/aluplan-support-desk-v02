# Production Release Readiness + Live Drift Audit

Tarih: 2026-08-08
Release adayı: `restore/codex-claude-report-20260805` / `4e1c6819`
Durum: **NO-GO — yalnız yerel hazırlık ve salt-okunur inceleme tamamlandı**

> Bu belge yeni bir genel kod GAP raporu değildir. Amacı; yerel release adayını gerçek canlı topoloji, veri, migration ledger’ı, obje depolama, kuyruklar ve geri dönüş kanıtlarıyla karşılaştırmadan deploy edilmesini engellemektir. Bu turda production/shadow bağlantısı, DB yazımı, migration/seed, push, tag-push veya deploy yapılmadı.

## 1. Yönetici kararı

Canlıya çıkış için doğru sonraki adım **bir kez daha genel kod taraması yapmak değil**, “release candidate ↔ live drift” denetimi ve geri dönüş provasıdır.

Bugün deploy kararı verilemez. Kod/test katmanı güçlü olsa da aşağıdaki üretim kanıtları eksiktir:

1. Canlıda çalışan exact image digest/commit ve gerçek pending migration kümesi bilinmiyor.
2. Faz 8 runbook’u güncel 56 migration zincirini kapsamıyor.
3. DR workflow’u ve otomatik backup yolları başarısızlığı başarı gibi gösterebiliyor.
4. PostgreSQL yedeği R2/S3 üzerindeki attachment, knowledge-pool ve branding nesnelerini korumuyor.
5. BullMQ worker’ları ve cron’lar backend içinde başladığı için sağlık kontrolü öncesi yan etki üretme riski var.
6. Exact release image ile PG17 restore + migration + eski image rollback provası henüz yapılmadı.

“Hata payı sıfır” mutlak olarak garanti edilemez. Güvenli hedef **bilinmeyen bırakmamak, tüm kritik kapıları fail-closed yapmak ve ölçülmüş geri dönüş süresine sahip olmak**tır.

## 2. Kaynak ve kanıt hiyerarşisi

Bu denetimde doğruluk sırası:

1. Kod, testler, Prisma schema/migration’ları ve runtime config.
2. Git geçmişi ve temiz çalışma ağacı.
3. Yerel doğrulama komutlarının güncel çıktısı.
4. `.ai` karar/hafıza belgeleri.
5. Canlıdan alınacak ayrıca onaylı, salt-okunur envanter.

`main`, `origin/main` veya eski bir runbook **canlıda gerçekten çalışan sürümün kanıtı değildir**. Canlı sürüm yalnız çalışan container/image digest ve deployment metadata ile belirlenebilir.

## 3. Yerel release adayı envanteri

### 3.1 Git kapsamı

| Kanıt | Sonuç | Yorum |
|---|---|---|
| Branch / HEAD | `restore/codex-claude-report-20260805` / `4e1c6819` | Yerel aday |
| Çalışma ağacı | Temiz | Denetim başlamadan önce |
| Yerel `main` / `origin/main` | `d9b21b9d` | İkisi aynı yerel ref |
| `main..HEAD` | 153 commit | Büyük release kapsamı; canlı farkı olduğu anlamına gelmez |
| Değişim | 287 dosya, yaklaşık `+23833/-5525` | Exact staging ve rollback provası zorunlu |
| Yerel restore tag | `restore/post-public-landing-final-20260808-4e1c6819` | Kaynak kod geri dönüş noktası; production image rollback kanıtı değildir |

### 3.2 Bu turda güncel HEAD üzerinde geçen hızlı kapılar

| Kapı | Sonuç |
|---|---|
| Operations safety | 24/24 geçti |
| Backend typecheck | Geçti |
| Frontend typecheck | Geçti |
| i18n | TR/EN/DE tam |
| Frontend API contract | `frontend=182, openapi=233, missing=0, raw-network=0` |
| RBAC source contract | `roles=12, permissions=19` |
| Migration file integrity | `56/56` manifest ile eşleşiyor |
| `git diff --check` | Temiz |

Tam backend kanıtı `117526b1` ürün ağacında `130/130 suite, 1305 passed, 1 skipped`; bu committen sonra backend dosyası değişmedi. Tam frontend kanıtı `ff8ff8a7` ürün ağacında `42/42 dosya, 308/308 test`; bu committen sonra yalnız dokümantasyon commitleri geldi. Bunlar değerlidir fakat **exact immutable Docker image üzerinde CI/staging kabulünün yerini tutmaz**.

Not: `pnpm` wrapper bu turda kısıtlı ağ altında registry signature doğrulamasını tamamlayamadığı için fail-closed durdu. Hızlı kapılar repoda kurulu gerçek `node`, `tsc` ve proje scriptleriyle paket indirmeden çalıştırıldı. Bu durum kod hatası değildir; exact release CI’sında normal signed/frozen kurulum ayrıca geçmelidir.

## 4. Release bloklayıcıları

### P0-01 — Canlı sürüm kimliği ve drift henüz ölçülmedi

Yerel branch’in 153 commit ileride olması, canlıda 153 commit eksik olduğu anlamına gelmez. Açık kullanıcı onayıyla yapılacak salt-okunur envanterde şunlar alınmalıdır:

- backend/frontend çalışan image adı ve immutable digest,
- image build commit/revision etiketi,
- gerçek PostgreSQL major/minor sürümü ve pgvector sürümü,
- `_prisma_migrations` ledger’ının tamamı,
- Redis sürümü/persistence durumu ve BullMQ queue sayaçları,
- R2/S3 bucket adı yerine yalnız kimliksiz config varlığı, versioning/lifecycle durumu ve nesne envanteri,
- backend/frontend health ve son hata oranı baz çizgisi.

Secret değerleri, signed URL’ler, tokenlar ve connection string’ler rapora yazılmayacaktır.

### P0-02 — Faz 8 runbook migration listesi güncel değil

`FAZ-8-PRODUCTION-MIGRATION-RUNBOOK.md:9-17`, `47-64`, `187-203` yalnız üç migration’ı sabit listeliyor:

- `20260314900000_restore_crm_foundation`
- `20260806000000_align_schema_parity`
- `20260806010000_harden_auth_action_tokens`

Kanonik manifest artık 56 dosya içeriyor ve bunlardan sonra en az şu migration’lar var (`packages/database/prisma/migration-checksums.json:53-57`):

- `20260806020000_add_faq_provenance_ai_history_permissions`
- `20260806021000_grant_faq_review_to_existing_reviewers`
- `20260806022000_align_faq_entry_sources_updated_at_default`
- `20260807090000_add_support_agent_rbac_contract`
- `20260807143000_add_product_taxonomy_unique_indexes`

Son iki migration salt DDL değildir: permission/role ekler, mevcut role genişliğini fail-closed kontrol eder ve aktif taxonomy duplicate’larında migration’ı durdurur. Bu nedenle runbook’taki “DML yok” ve “üç pending migration” varsayımları güncel zincire uygulanamaz.

**Kapı:** Gerçek pending küme canlı `_prisma_migrations` tablosundan salt-okunur çıkarılmadan ve her pending migration production-derived PG17 klonda prova edilmeden deploy yok.

### P0-03 — DR workflow’u release kanıtı değildir

- `.github/workflows/dr-drill.yml:21-26`, script hatasını `|| true` ile yutar.
- Script raporu random temp dizininde üretir ve EXIT cleanup ile siler (`scripts/dr-drill.sh:15-33`); workflow ise `/tmp/dr-report.txt` arar (`dr-drill.yml:28-44`).
- DR scripti PG16 kullanır (`scripts/dr-drill.sh:18`); bilinen canlı/shadow ve ana CI PG17’dir.
- Script plain SQL/gzip restore ederken Faz 8 cutover yedeği `pg_dump -Fc` + `pg_restore` kullanır.
- Backup auto-discovery ve row-count eşikleri TODO’dur; checksum/signature doğrulaması yoktur.

**Kapı:** Quarterly DR yalnız PG17, gerçek cutover formatı, SHA-256, dış depolama, disposable restore, migration integrity, business counts ve kalıcı artifact ile fail-closed hale geldikten sonra “geçti” sayılabilir.

### P0-04 — Otomatik backup yanlış başarı üretebilir

1. `scripts/backup-db.sh:24` `pg_dump | gzip` pipeline’ında `pipefail` kullanmıyor; pg_dump hatası gzip success ile maskelenebilir.
2. `DatabaseBackupService` tüm hataları `{success:false}` olarak döndürüp throw etmez (`apps/backend/src/common/services/database-backup.service.ts:73-76`); cron ve HTTP katmanı bunu başarısız job/status olarak görmeyebilir.
3. S3 upload hatasında `StorageService` local dosyaya fallback edip anahtar döndürür (`storage.service.ts:107-138`). Backend local upload/temp yolunun persistent volume’u yoktur; container yenilenince “başarılı” denen yedek kaybolabilir.
4. Checksum, dış bucket doğrulaması, restore testi ve ölçülmüş retention/PITR kanıtı yoktur.

**Kapı:** Cutover öncesi yedek ancak dış hedefte varlığı, checksum’ı ve ayrı PG17 restore sonucu doğrulandığında geçerlidir.

### P0-05 — PostgreSQL yedeği tüm müşteri verisi değildir

Uygulama attachment, inbound e-posta dosyaları, branding ve knowledge-pool kaynaklarını `StorageService` üzerinden S3/R2’ye yazar. DB satırları storage key tutar; `pg_dump` obje byte’larını içermez.

Ek bütünlük riski: S3 upload hatasında local fallback’e yazılan key yine başarı olarak döner (`storage.service.ts:107-138`), fakat S3 modundaki okuma yolu yalnız S3’den okumayı dener (`141-185`). Böyle bir kayıt DB’de mevcut görünürken dosya kullanıcıya ulaşılamaz olabilir. Attachment controller da başarısız fiziksel yüklemede DB kaydı/`FAILED_STORAGE_UPLOAD_*` marker üretebilir (`attachments.controller.ts:67-106`).

**Kapı:** Deploy öncesinde:

- bucket versioning/retention veya immutable snapshot doğrulanmalı,
- DB’deki storage key’lerden temsili ve mümkünse tam manifest çıkarılmalı,
- R2 object manifestine ek olarak production container/volume local `uploads` manifesti çıkarılmalı,
- DB→R2/local missing ve `FAILED_STORAGE_UPLOAD_*` sayımı yapılmalı; orphanlar yalnız raporlanmalı, silinmemeli,
- restore provasında DB + R2 birlikte doğrulanmalı,
- R2 silme/overwrite geri dönüş yöntemi ve süresi yazılmalı.

### P0-06 — Worker/cron bakım başlangıcı yok

`docker-compose.yml:70-73`, BullMQ worker’ların backend içinde çalıştığını açıkça söylüyor. Kodda 9 queue, 10 `@Cron` ve SLA repeatable job bootstrap’ı vardır. Queue dashboard yalnız 4 queue’yu izlediği için UI’daki “temiz” görünüm bütün queue’ların boş olduğunu kanıtlamaz. Mevcut `WORKER_MODE` yalnız Bull Board yüzeyini etkiler; processor/cron izolasyonu sağlamaz. Backend ayağa kalktığında e-posta, CRM, RAG, FAQ, backup ve bildirim yan etkileri health/smoke kabulünden önce başlayabilir.

`ScheduleModule.forRoot()` açık timezone tanımlamaz; cron zamanı container TZ’sine bağlıdır. Ayrıca `AiHealthEventService` iki modülde doğrudan provider olarak kayıtlıdır ve aynı cleanup cron’unun iki instance tarafından çağrılması mümkündür. Canlı/staging envanterinde container TZ, replica sayısı ve her cron’un tek-yürütme kanıtı alınmalıdır.

Repo compose’u Redis için `allkeys-lru` kullanır (`docker-compose.yml:51-52`). BullMQ anahtarlarının memory pressure altında evict edilmesi kabul edilemez; canlıdaki gerçek `maxmemory`, `maxmemory-policy`, persistence ve eviction sayaçları salt-okunur doğrulanmadan queue güvenliği varsayılmaz.

İlk güvenli cutover’da yeni ve eski backend aynı production DB/Redis üzerinde paralel çalıştırılmayacaktır. Blue/green HTTP yönlendirmesi, in-process job consumer’ları nedeniyle tek başına güvenli değildir.

**Kapı:** Şunlardan biri testle kanıtlanmalıdır:

1. `workers/cron disabled` bakım başlangıç modu; health ve DB doğrulaması sonrası kontrollü etkinleştirme, veya
2. tüm üreticiler ve kuyruklar durdurulmuşken one-shot migration; tek backend instance’ını bir kez başlatma ve idempotent/yan etkisiz smoke.

### P0-07 — Staging/CI gerçek release teslimini kanıtlamıyor

- Staging webhook hatası `|| echo` ile yutuluyor ve ardından başarı mesajı basılıyor (`.github/workflows/ci.yml:181-194`).
- Staging job security job’una bağlı değil.
- Webhook sonrası deployment status, image digest, health ve smoke kontrolü yok.
- CI yalnız backend image build/scan ediyor; exact frontend image ve immutable registry digest zinciri yok.
- Frontend Dockerfile frozen install başarısızsa normal install’a düşüyor (`apps/frontend/Dockerfile:20-21`); aynı committen farklı dependency ağacı üretilebilir.
- Staging compose healthcheck içermez ve frontend yalnız backend container start’ına bağlıdır (`docker-compose.staging.yml:1-56`).
- Semantic release, kalite işlerine dependency olmadan her main/master push’unda çalışabilir (`.github/workflows/semantic-release.yml:1-23`).

**Kapı:** Aynı immutable backend/frontend digest’i staging’de çalıştırılıp, sonra production’a promote edilmelidir; production’da yeniden build yapılmamalıdır.

### P0-08 — PostgreSQL major sürümü tek sözleşme değil

- Ana CI ve Faz 8 restore: PG17.
- Ana `docker-compose.yml`, `backend-test.yml` ve DR scripti: PG16.

**Kapı:** Canlı sürüm salt-okunur doğrulandıktan sonra local, CI, DR, staging ve runbook tek production-equivalent PG sürümüne hizalanmalıdır. Bilinen 2026-08-05 canlı dump kaydı PG17’dir; yine de cutover öncesi taze doğrulama gerekir.

### P0-09 — Mevcut shadow snapshot uygulama çalıştırmak için güvenli değil

`.ai/current-focus.md:58-68` kaydına göre eski production-derived snapshot’ta `settings.is_secret=true` olan 14 non-empty değer kalmıştır. CRM/webhook ve refresh token sanitizasyonu tek başına yeterli değildir.

**Kapı:** Eski shadow üzerinde uygulama başlatılmaz. Taze production dump clone-only sanitizer ile işlenir; secret/token/endpoint/recipient/queue yan etkisi kontrolleri geçmeden staging girdisi olmaz. Redis production’dan kopyalanmaz.

## 5. Veri koruma matrisi

| Veri/yan etki alanı | Kaynak | Deploy öncesi kanıt | Geri dönüş |
|---|---|---|---|
| PostgreSQL | PG17 + pgvector | `-Fc` dump, SHA-256, `pg_restore --list`, ayrı PG17 restore, ledger/count/FK/index kontrolü | Bakım penceresinde full restore veya additive schema üzerinde old image/forward-fix |
| R2/S3 objects | Attachment, knowledge, branding, inbound e-mail | versioning/snapshot, object manifest, DB key parity | object version restore + DB ile aynı zaman noktası |
| Redis/BullMQ | job, delayed/retry, cache, session/OAuth/throttle | 9 queue state envanteri, repeatable jobs, producer stop, active job drain/pause, persistence ve eviction policy | production Redis’i lokale taşımadan; cutover planında queue recovery/idempotency |
| Settings/secrets | DB + Coolify secret store | yalnız presence/length/fingerprint sınıfı; plaintext yok | eski secret setini güvenli store’da tut; rotasyon ayrı onaylı adım |
| External side effects | CRM, email, webhook, crawler, AI | staging’de sink/sandbox/disabled mode; production smoke write yapmamalı | producer/worker kapatma, olay ledger’ı ve idempotency |
| Container images | Backend/frontend | signed/immutable digest, SBOM/scan, health/smoke | doğrulanmış eski digest |

## 6. RAG ve AI özel release kapıları

Mimari sözleşme:

- Aktif corpus: Gemini `v2_2 / 3072`.
- Arama ve yazma `embedding_version + embedding_dim` ile izole edilir.
- 3072 boyutta HNSW varsayılamaz; exact search kullanılabilir.
- OpenAI yalnız chat fallback’tir; aynı corpus sürümüne embedding fallback/mixing yasaktır.
- Qdrant bu release’in kapsamı değildir.

Release öncesi salt-okunur/yan etkisiz doğrulamalar:

1. Canlıdaki aktif embed provider/model/version/dimension, secret değerleri açılmadan doğrulanır.
2. `knowledge_pool_embeddings` ve diğer embedding tablolarında version/dimension dağılımı; null/mismatch/mixed-provider sayıları alınır.
3. `ai.embed_fallback_provider` boş veya aynı model uzayına ait olmalıdır. Mevcut compatibility koruması model/dimension kontrol eder; yalnız provider adını esas alarak farklı embedding uzaylarının karışmayacağı varsayılamaz.
4. Migration/cutover sırasında ingestion, crawl, reindex ve embedding-migration producer/worker’ları durdurulur. Embed provider/model değişikliği event’i cache truncate edip bütün corpus grupları için migration kuyruğu oluşturabildiğinden admin AI ayarları release boyunca dondurulur.
5. Staging restore’da `.ai/rag-quality/acceptance-questions.json` ve `run-answer-smoke.mjs` ile müşteri-benzeri TR/EN/DE kabul seti çalıştırılır.
6. Kaynak sızıntısı, `NO_MATCH`, yanlış kategori, dil sapması, latency ve confidence dağılımı baz çizgiyle karşılaştırılır. Mevcut runner’lar beklenen yanıt dilini ve minimum confidence’ı tam fail-closed doğrulamadığı için bunlar ayrı assertion/manual acceptance olarak kaydedilir.
7. Deploy anında provider/model değiştirilmez ve reindex başlatılmaz; bunlar ayrı bakım işi olur.

## 7. Güvenli uygulama planı

### Faz A — Release adayını dondur ve yerel kapıları tamamla

- Release commitini sabitle; bundan sonra yalnız release-blocker düzeltmeleri ayrı commitlerle alınır.
- Güncel Faz 8 runbook’unu canlı ledger’dan türetilen dinamik pending listeye göre yeniden yaz.
- CI/DR/backup yanlış-pozitiflerini fail-closed düzelt.
- PG17’yi compose/CI/DR/staging sözleşmesi yap.
- Worker/cron maintenance boot stratejisini TDD ile oluştur.
- Backend ve frontend exact image buildlerini frozen dependency ile üret; digest kaydet.
- Tam test, integration/E2E, build, migration fresh-deploy, security scan ve contract kapılarını exact committe yeniden çalıştır.

**GO kapısı:** Kırmızı pipeline, eksik image digest veya doğrulanmamış runbook varsa ilerleme yok.

### Faz B — Ayrı onayla canlı salt-okunur drift envanteri

Hiçbir write/migration/seed/deploy yok. Sadece:

- container/image/topoloji,
- PG/pgvector ve full migration ledger,
- precondition query’leri (taxonomy duplicate, SUPPORT_AGENT alias/wider permission vb.),
- row counts/table sizes/long transaction/invalid constraint/index,
- Redis queue sayaçları ve persistence,
- R2 versioning/object manifest/parity,
- health/log/error-rate baz çizgisi,
- env key presence ve external integration enablement.

**GO kapısı:** Bilinmeyen pending migration, duplicate precondition, uzun yazan transaction, missing object, başarısız backup veya aktif toplu job varsa bakım penceresi açılmaz.

### Faz C — Taze dump ile izole rehearsal

- 2026-08-05 tarihli eski snapshot kullanılmaz; maintenance penceresine yakın taze native `-Fc` dump alınır.
- Ham dump local-only, mode 600 ve git-ignore kalır.
- Clone-only sanitizer uygulanır; uygulama hiçbir zaman ham/yarım sanitize snapshot’a bağlanmaz.
- Ayrı PG17’de restore edilir.
- Exact release image ile bütün gerçek pending migration’lar uygulanır; ikinci deploy `No pending migrations` vermelidir.
- Business counts, referential integrity, schema parity, RBAC, RAG dağılımı ve storage-key parity karşılaştırılır.
- Exact eski image, post-migration additive schema üzerinde read-only/smoke ile rollback uyumluluğu kanıtlar.

**GO kapısı:** Restore, data diff, migration time/lock, eski image uyumluluğu veya RAG kabulü saparsa NO-GO.

### Faz D — Production-equivalent staging

- Production’dan sanitize edilmiş DB clone, boş Redis ve izole bucket/prefix kullan.
- CRM/e-mail/webhook/crawler dış yazımları sink/sandbox/disabled yap.
- Production’a promote edilecek exact digestleri çalıştır.
- Kritik kullanıcı akışları, admin onay akışları, ticket+AI, attachment, RAG, announcement preview, queue retry ve health/observability smoke’larını tamamla.
- Soak süresince cron/worker duplicate davranışı ve kaynak kullanımı izle.

### Faz E — Onaylı bakım penceresi cutover

1. Kullanıcı bakım penceresini ve operatörleri açıkça onaylar.
2. Giriş/yazma trafiği kapatılır; active request/job drain edilir.
3. Eski backend/worker/cron producer’ları tamamen durdurulur; PostgreSQL açık kalır.
4. DB native dump + SHA-256 + dış kopya + PG17 restore doğrulaması yapılır.
5. R2 version/snapshot ve manifest kaydedilir.
6. Exact release image ile one-shot migration çalıştırılır; timeout/failure’da app başlatılmaz.
7. Ledger, schema, counts, RBAC ve RAG distribution doğrulanır.
8. Tek backend maintenance/safe mode’da başlatılır; DB/Redis/storage health ve yan etkisiz smoke yapılır.
9. Frontend başlatılır; auth, ticket list/detail/create-no-AI, attachment read, admin review center ve public sayfa smoke yapılır.
10. Worker/cron kontrollü açılır; queue backlog ve duplicate side effect izlenir.
11. Trafik kademeli açılır; 15/30/60 dakika ve 24 saat izleme yapılır.

### Faz F — Rollback kararı

- **Migration başlamadan hata:** yeni image yok; mevcut sistemi yeniden aç.
- **Migration transaction hata/timeout:** app’i başlatma; ledger/log/backup hash sakla; transaction rollback kanıtını doğrula.
- **Migration başarılı, yeni app başarısız:** yalnız staging’de kanıtlanmışsa eski immutable image’ı additive schema üzerinde başlat; ters DDL çalışma.
- **Veri bütünlüğü şüphesi:** maintenance sürsün; yeni write kabul etme. Forward-fix ile full restore arasında RPO kaybını hesaplayıp kullanıcı kararı al.
- **R2 nesne sorunu:** DB restore tek başına yeterli değildir; aynı zaman noktasındaki object version/snapshot geri alınır.

## 8. Zorunlu NO-GO kontrol listesi

Aşağıdakilerden biri “hayır/bilinmiyor” ise deploy yok:

- [ ] Canlı image digest/commit ve gerçek topoloji kayıtlı mı?
- [ ] Canlı full `_prisma_migrations` ledger’ı salt-okunur alındı mı?
- [ ] Gerçek pending migration kümesi güncel runbook’a işlendi mi?
- [ ] Tüm pending migration precondition’ları canlı-derived PG17 klonda geçti mi?
- [ ] DB dump dış hedefte, checksum’lı ve ayrı PG17’ye restore edildi mi?
- [ ] R2/S3 versioning/snapshot ve DB-key parity doğrulandı mı?
- [ ] Redis queue active/delayed/retry durumu ve drain/pause planı doğrulandı mı?
- [ ] Dokuz queue’nun tamamı ayrı ayrı envanterlendi mi; dashboard’un dört queue görünümüyle yetinilmedi mi?
- [ ] Worker/cron maintenance boot veya eşdeğer güvenli başlangıç kanıtlandı mı?
- [ ] Exact backend/frontend image digestleri staging’de test edilip production’a promote ediliyor mu?
- [ ] Eski exact image, yeni additive schema üzerinde rollback provası yaptı mı?
- [ ] Tam CI, integration/E2E, security scan ve migration integrity exact release committe yeşil mi?
- [ ] RAG provider/version/dimension dağılımı ve kabul seti geçti mi?
- [ ] External e-mail/CRM/webhook/crawler smoke’ları side-effect-safe mi?
- [ ] Bakım penceresi, rollback sorumlusu, karar süresi ve iletişim planı onaylı mı?
- [ ] Push/deploy için kullanıcı açıkça yetki verdi mi?

## 9. Sonraki tek güvenli adım

Önce **Faz A yerel release güvenlik borçları** kapatılmalıdır. İlk uygulama sırası:

1. Faz 8 runbook’u 56 migration zinciri ve canlı-ledger tabanlı pending discovery ile güncelle.
2. DR workflow/script ve backup yollarını fail-closed + PG17 + gerçek restore artifact sözleşmesine taşı.
3. In-process worker/cron için maintenance boot stratejisini tasarla ve testle.
4. Staging pipeline’ını security’ye bağımlı, webhook sonucunu/health’i doğrulayan ve exact image digest üreten hale getir.

Bu dört yerel başlık kapanıp bağımsız doğrulanmadan canlı salt-okunur envanter aşamasına dahi “deploy hazırlığı tamam” denmeyecektir.

## 10. Bağımsız denetim sonucu

Üç salt-okunur inceleme aynı karara ulaştı:

- Release planı: çift backend/tek DB-Redis riskinden dolayı rolling/blue-green ilk geçiş için uygun değil; maintenance + tek backend gerekir.
- CI/DR/backup: güncel durumda yanlış başarı üretebilen kapılar nedeniyle production release NO-GO.
- Veri/RAG/storage: taze PG17 restore, full ledger, 9 queue envanteri ve R2+local storage parity olmadan veri koruması kanıtlanmış değil.

Bağımsız incelemelerde dosya, DB veya canlı sistem değiştirilmedi. Çürütülen ana bulgu yoktur.

## 11. Bu turun değişiklik ve yetki kaydı

- Ürün kodu: değiştirilmedi.
- Prisma schema/migration/DB: değiştirilmedi ve çalıştırılmadı.
- Production/shadow/Redis/R2: bağlanılmadı.
- Push/tag-push/deploy/publish: yapılmadı.
- Oluşturulan tek artifact: bu audit belgesi.
