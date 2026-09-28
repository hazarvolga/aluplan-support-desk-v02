# A.1.4-B Production Salt-Okunur Envanter Collector — Design-Only Sözleşme

Tarih: 2026-08-12  
Durum: Tasarım; collector geliştirilmedi veya çalıştırılmadı  
Karar: Production deploy **NO-GO**

## 1. Amaç

A.1.4 yerel hazırlık sözleşmesini, ileride ayrıca onaylanacak gerçek production
envanterine dönüştürmeden önce collector'ın yetki, komut, kanıt, redaksiyon,
tutarlılık ve durdurma sınırlarını kesinleştirmek.

Bu belge canlı erişim yetkisi vermez. Bu turda:

- production PostgreSQL, Cloudflare R2, Redis, SSH, Coolify veya SharePoint'e
  bağlanılmaz,
- credential oluşturulmaz, okunmaz veya doğrulanmaz,
- object body indirilmez,
- migration, seed, deploy, queue/Redis/object mutasyonu yapılmaz,
- `StalledJobRecoveryService` davranışı değiştirilmez.

## 2. Değişmez mimari sınır

A.1.4-B iki ayrı kapı olarak yürütülmelidir:

1. **B0 — local design/contract:** network client içermeyen sözleşme, test
   matrisi, kanıt şeması ve credential kapsamı hazırlanır.
2. **B1 — approved live observation:** yalnız kullanıcı ayrıca açık onay verdikten
   sonra kısa ömürlü credential'larla gerçek salt-okunur collector çalıştırılır.

B0'ın geçmesi B1'i, B1'in geçmesi de deploy'u otomatik olarak yetkilendirmez.
Her artifact `productionGo=false` taşır.

`StalledJobRecoveryService` için de iki iş karıştırılmayacaktır:

- timer'ın envanterde görünmesi A.1.4-B'nin parçasıdır,
- timer'ın multi-replica davranışını leader election, repeatable job veya
  kapatma modu ile değiştirmek ayrı ürün/mimari fazıdır.

## 3. Kaynak incelemesinde bulunan zorunlu sözleşme genişletmeleri

### D-01 — PostgreSQL sayımları DB↔R2 paritesini kanıtlamaya yetmiyor

Mevcut `postgres-object-reference-summary` yalnız toplamları sayıyor.
`attachments.url`, `knowledge_sources.file_path` ve `branding.logo_url`
değerlerinin hangi R2 object key'lerine karşılık geldiğini vermediği için
`missing`, `duplicate` veya `orphan` setleri hesaplanamaz.

Collector uygulanmadan önce exact SQL allowlist şu semantik çıktıları üretmelidir:

- aktif attachment storage key'leri,
- file-backed knowledge source storage key'leri,
- branding logo storage key'i,
- `FAILED_STORAGE_UPLOAD_*` marker kayıtları ayrı sınıf,
- her kayıt için yalnız kaynak türü, stabil kayıt kimliği ve storage key.

Ham key'ler terminale, rapora, Git'e veya kalıcı private artifact'e
yazılmamalıdır. Exact key karşılaştırması yalnız process belleğinde yapılmalı;
persist edilmeden önce ayrı tutulan run-scoped HMAC anahtarıyla fingerprint'e
dönüştürülmelidir. HMAC anahtarı artifact ile aynı yerde saklanmamalı ve run
sonunda imha edilmelidir. Salt SHA-256 tahmin edilebilir kısa key'lerde sözlük
saldırısına açık olduğu için kabul edilmez.

### D-02 — Redis allowlist active/repeatable kanıtı için eksik

Mevcut liste `LLEN`, `ZCARD`, `SCARD` ile sayım yapabilir; fakat active job ID,
failed job örneği veya repeatable job kimliği için gereken bounded
`LRANGE`/`ZRANGE`/`HSCAN` benzeri salt-okunur erişimleri tanımlamıyor.

Redis ACL key patternleri, key argümanı olmayan `SCAN` çıktısını prefix ile
güvenilir biçimde sınırlandıramaz. Bu nedenle collector uygulanmadan önce:

- queue key prefix'i runtime configten okunup yalnız kanonik dokuz queue ile
  eşleştirilmeli,
- mümkün olan her envanter bilgisi BullMQ'nun kanonik exact known-key
  sözleşmesinden türetilmeli ve `SCAN` kullanılmamalı,
- exact known-key ile çözülemeyen discovery ihtiyacı kalırsa, `SCAN`ın paylaşılan
  Redis key adlarını görünür kılabildiği açıkça kabul edilmeli; bu ayrı privacy
  onayı, dedicated Redis instance kanıtı veya collector guard + tam invocation
  audit'i olmadan çalıştırılmamalı,
- onaylı fallback `SCAN` ancak `MATCH <exact-prefix>:<queue>:* COUNT <bounded>`
  biçiminde, cursor turu ve toplam key üst sınırıyla kullanılmalı; client-side
  `MATCH` credential düzeyinde izolasyon sayılmamalı,
- key türüne göre yalnız exact salt-okunur komut çalıştırılmalı,
- active/failed/delayed/waiting/repeatable çıktıları ayrı sınıflanmalı,
- payload, job data, return value, stacktrace ve e-posta/CRM içeriği okunmamalı,
- key/job identifier'ları paylaşılabilir raporda HMAC/fingerprint olarak
  gösterilmeli.

`KEYS`, `MONITOR`, scripting, blocking pop, queue API mutation ve bütün write
komutları yasaktır.

BullMQ `Queue` getter API'leri de collector'da kullanılmamalıdır; sürüme ve
getter'a bağlı olarak Lua/`EVALSHA` çalıştırabilirler. Redis adapter yalnız bu
belgede ayrıca onaylanmış raw salt-okunur komutları gönderebilir.

### D-03 — R2 token yetkisi body indirmeyi credential düzeyinde ayıramayabilir

Cloudflare'ın güncel resmi sözleşmesinde bucket-scoped `Object Read only`,
nesne okuma ve listelemeyi birlikte verir. Temporary credentials tarafında
explicit action listesi yerel imzalama yoluyla desteklenir; bu yüzden en dar
hedef `ListObjectsV2` + `HeadObject` action setidir.

Kaynaklar:

- <https://developers.cloudflare.com/r2/api/tokens/>
- <https://developers.cloudflare.com/r2/api/s3/temporary-credentials/>

Explicit-action child credential ayrı bir güvenilir minting broker/process
tarafından üretilmelidir. Parent secret collector process'ine, evidence
dizinine veya operator shell'ine verilmemelidir. Eğer çalışma anında bu sınır
kurulamıyorsa, bucket-scoped read-only token tek başına yeterli güvenlik kanıtı
sayılmaz; collector'ın yalnız allowlist komutları çağırdığı test ve ağ çağrısı
kaydıyla compensating control ve ayrıca kullanıcı onayı gerekir. `GetObject`
hiçbir koşulda çağrılmayacaktır.

### D-04 — Runtime singleton kanıtı veri collector'ından ayrı adapter ister

PostgreSQL/R2/Redis verisi replica sayısını, container timezone'unu, çalışan
image digest'ini ve aynı cron/timer'ın kaç process içinde aktif olduğunu tek
başına kanıtlamaz. Runtime topology gözlemi ayrı, salt-okunur adapter ve ayrı
onay kapsamı olmalıdır.

Bu adapter tasarlanmadan aşağıdaki iddialar yapılamaz:

- cron/repeatable/timer singleton,
- tek backend replica,
- exact deployed backend/frontend digest,
- container timezone,
- eski ve yeni instance overlap yokluğu.

SSH veya Coolify read-only erişimi bu belgenin verdiği yetki değildir.

### D-05 — Üç sistem arasında atomik snapshot mümkün değil

PostgreSQL repeatable-read snapshot, R2 listing ve Redis sayaçları tek atomik
transaction içinde alınamaz. Ayrıca `StalledJobRecoveryService` dört kuyruğu
beş dakikada bir mutate eder; çalışan uygulama DB referanslarını ve R2
nesnelerini de capture penceresi boyunca değiştirebilir.

Bu nedenle collector sonucu “aynı anın kesin resmi” değil, sınırları ölçülmüş
bir observation window olacaktır:

1. UTC `captureStartedAt` kaydet.
2. Redis/BullMQ ön-snapshot al.
3. R2 ön-listing + HEAD doğrulamasını al.
4. PostgreSQL repeatable-read object-reference snapshotını al.
5. R2 son-listing + HEAD doğrulamasını al.
6. PostgreSQL ikinci repeatable-read object-reference snapshotını al.
7. Redis/BullMQ son-snapshot al.
8. UTC `captureFinishedAt`, süre ve bütün ön/son digest farklarını kaydet.

DB veya R2 ön/son digestleri değişirse parite `moving-target` olur ve hiçbir
missing/orphan sonucu release kanıtı sayılmaz. Digestler sabit kalsa bile aktif
sistemde bu yalnız bounded observation kanıtıdır; kesin DB↔R2 paritesi ancak
ayrı onaylı bakım penceresinde storage writer'ları durdurulmuşken alınabilir.
Bu design-only faz writer durdurma yetkisi vermez.

## 4. Collector bileşenleri

Collector tek, geniş yetkili process yerine dört dar adapter ve bir offline
birleştiriciden oluşmalıdır:

| Bileşen                  | Yetki                                    | Çıktı                                       | Yazma yeteneği |
| ------------------------ | ---------------------------------------- | ------------------------------------------- | -------------- |
| PostgreSQL adapter       | exact role + exact SELECT                | ledger, runtime metadata, object references | yok            |
| R2 adapter               | exact bucket + List/Head                 | key/size/ETag/lastModified                  | yok            |
| Redis adapter            | exact ACL + queue prefix                 | persistence ve bounded queue metadata       | yok            |
| Runtime topology adapter | ayrıca onaylı read-only runtime metadata | replica/image/TZ/process sınıfı             | yok            |
| Local-volume adapter     | ayrıca onaylı read-only filesystem       | local uploads key/size manifesti            | yok            |
| Offline reconciler       | network yok                              | hash-bound birleşik private evidence        | yok            |

Adapter'lardan biri başarısızsa reconciler eksik parçayı başarı gibi göstermez;
run bütünü `incomplete` olur.

## 5. Credential sözleşmesi

### PostgreSQL

Uygulamanın `DATABASE_URL` değeri kullanılmamalıdır. Ayrı geçici rol:

- `LOGIN`, kısa `VALID UNTIL`, `NOINHERIT`,
- yalnız hedef DB'ye `CONNECT`, gerekli schema'ya `USAGE`, exact tablolar/
  view'lar için `SELECT`,
- `default_transaction_read_only=on`,
- bounded `statement_timeout`, `lock_timeout`,
  `idle_in_transaction_session_timeout`,
- superuser, create, temp, replication ve function execute genişliği yok,
- `PUBLIC` üzerinden gelebilen `TEMPORARY` ve function `EXECUTE` dahil efektif
  yetkiler run başında probe edilir; exact allowlistten genişse fail-closed
  durulur. `NOINHERIT` tek başına yeterli sayılmaz.

Bu rolü production'da oluşturmak bir yazma işlemidir; ayrı operator onayı ve
sonunda revoke/drop kanıtı gerektirir. Bu tasarım turunda yapılmaz.

### Cloudflare R2

- yalnız gerçek application bucket'ı,
- mümkünse explicit `ListObjectsV2` + `HeadObject` temporary credential,
- parent token yalnız ayrı güvenilir minting broker/process içinde; collector'a
  yalnız child access key/secret/session token aktarımı,
- kısa TTL,
- write/delete/admin yok,
- credential değeri argv, log, JSON veya shell history'ye yazılmaz.

`aluplan-support-desk-db-backups-dev` DEV kanıt bucket'ıdır; production
application envanteri yerine kullanılamaz.

### Redis

- ayrı kullanıcı, kısa ömür veya tek kullanımlık secret,
- `-@all` tabanından exact komut ekleme,
- yalnız BullMQ exact known-key seti için read key pattern; `SCAN` çıktısının bu
  patternle sınırlandığı varsayılmaz,
- write, script, pub/sub, admin ve dangerous komutlar kapalı,
- `CONFIG GET` gerekiyorsa yalnız `config|get` subcommand ve exact config key
  client-side allowlisti.

Redis ACL resmi olarak komutları ve key patternlerini sınırlandırabilir; broad
`+@all` kullanılmamalıdır:
<https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/>.

### Credential yaşam döngüsü

Credential'lar yalnız environment/file-descriptor veya onaylı secret store
üzerinden process'e verilir. CLI argument, `.env`, repo, evidence ve ortak
raporda bulunmaz. Run bitiminde:

- process memory/temporary environment sonlanır,
- credential revoke/expiry sonucu secret değeri olmadan kaydedilir,
- private artifact yalnız credential türü, scope fingerprint'i ve expiry
  zamanını taşır.

Run artifactleri için açık retention süresi, şifreli offsite kopya kararı ve
süre sonunda kullanıcı onaylı güvenli imha prosedürü ayrı release runbook'unda
tanımlanmalıdır. Bu tasarım otomatik silme yetkisi vermez.

## 6. Kanıt şeması

Her adapter artifact'i en az şunları taşır:

- `schemaVersion`, `runId`, `environment="production"`,
- exact release contract Git SHA ve contract SHA-256,
- `captureStartedAt`, `captureFinishedAt`, duration,
- adapter adı/sürümü,
- target identity'nin redacted fingerprint'i,
- credential scope fingerprint'i ve expiry,
- uygulanan exact operation/statement contract hashleri,
- result counts/digests,
- truncation veya pagination durumu,
- warning/abort listesi,
- `productionAccessPerformed=true`,
- `productionWritePerformed=false`,
- `productionGo=false`.

Artifact kuralları:

- yalnız `.private-data/release-evidence/a14b-production-inventory/<runId>/`,
- directory `0700`, dosyalar `0600`, no-clobber, symlink reddi,
- JSON boyut/record/page/time bütçeleri,
- temp + fsync + atomic publish + `READY.json` en son,
- her dosya SHA-256 ve birleşik manifest,
- terminal çıktısı yalnız durum, relative private path ve hash; içerik yok.

## 7. Zorunlu abort koşulları

Aşağıdakilerden biri oluşursa run fail-closed durur ve `READY.json` yazılmaz:

- target identity production sözleşmesiyle eşleşmiyor,
- credential scope beklenenden geniş veya doğrulanamıyor,
- PostgreSQL read-only transaction/role kanıtlanamıyor,
- ledger duplicate, contradictory, failed veya unknown state içeriyor,
- SQL/Redis/R2 isteği exact allowlist dışında,
- R2 pagination tamamlanmadı veya HEAD/list metadata çelişti,
- Redis SCAN cursor/page/key/time bütçesi aşıldı,
- Redis discovery shared-keyspace name exposure onayı olmadan `SCAN` gerektiriyor,
- bilinmeyen queue/prefix/repeatable/timer bulundu,
- object key sayısı/artifact boyutu sınırı aşıldı,
- output path/mode/owner/symlink/no-clobber kontrolü başarısız,
- secret/connection string/token benzeri değer redaction taramasına takıldı,
- adapterlardan biri eksik veya hash/manifest binding bozuk,
- observation window azami süreyi aştı,
- runtime topology/singleton gerekli iddia için eksik kaldı.

Abort cleanup yalnız bu run tarafından oluşturulduğu immutable ID/marker ile
kanıtlanan yerel temp artifactlerini silebilir; production verisine cleanup
adı altında hiçbir write/delete yapılmaz.

## 8. DB↔R2 parite semantiği

Parite dört ayrı sonuç kümesi üretmelidir:

1. `referenced-and-present` — DB referansı ve R2 metadata kaydı var.
2. `referenced-but-missing` — release blocker; hiçbir otomatik onarım yok.
3. `failed-storage-marker` — ayrı operasyonel borç; R2 missing ile karıştırılmaz.
4. `unreferenced-r2-object` — yalnız rapor; orphan diye otomatik silinmez.

Karşılaştırma normalize edilmiş exact key üzerinde private bellekte yapılır.
Kalıcı private/paylaşılabilir artifactte yalnız run-HMAC fingerprint ve sayımlar
görünür; ham key persistence yasaktır.
ETag tek başına içerik checksum'ı sayılmaz; multipart veya provider semantiği
nedeniyle yalnız object identity metadata'sıdır.

S3 upload hatasında local fallback ihtimali bulunduğu için DB↔R2 paritesi tek
başına production veri bütünlüğü kanıtı değildir. Ayrıca onaylı read-only
local-volume adapter ile `uploads` manifesti alınmadan `referenced-but-missing`
sonucu kesinleştirilemez. Local-volume erişimi SSH/Coolify/topology kapsamına
girer ve B1 production onayına sessizce dahil edilemez.

## 9. Redis/BullMQ sonuç semantiği

Her dokuz queue için en az:

- waiting, active, delayed, prioritized, waiting-children,
- completed, failed, paused ve stalled sayıları,
- bounded active/failed identifier fingerprintleri,
- repeatable job kimliği/schedule fingerprintleri,
- ön/son snapshot farkı,
- unknown key/type sayısı,
- persistence, AOF/RDB ve eviction/maxmemory metadata sınıfı.

Sıfır olmayan sayaç tek başına hata değildir. Release kararı için ayrıca:

- active job drain/maintenance planı,
- delayed/repeatable işlerin cutover davranışı,
- failed işler için idempotency/retry kararı,
- eski/yeni backend overlap olmadığının runtime kanıtı gerekir.

## 10. TDD ve inceleme kapısı

Collector implementasyonuna geçilirse önce RED testler yazılmalıdır:

- hiçbir adapter forbidden operation çağıramaz,
- secret hiçbir success/error/artifact yolunda görünmez,
- pagination/cursor yarıda kesilince false success yok,
- R2 `GetObject`/Put/Delete/Copy invocation anında reddedilir,
- Redis exact-known-key yolu `SCAN` gerektirmez; fallback discovery privacy
  onayı olmadan fail-closed,
- Redis unknown command/key prefix ve write ACL fail-closed,
- PostgreSQL transaction gerçekten read-only ve rollback/finally bounded,
- PostgreSQL effective `PUBLIC`/role privileges allowlistten genişse fail-closed,
- D-01 key-level parity dört sonuç kümesini doğru üretir,
- DB, R2 veya Redis ön/son snapshot drift'i `moving-target` üretir,
- R2 child credential minting broker parent secret'ı collector'dan ayırır,
- ham object/storage key hiçbir kalıcı artifacte yazılmaz,
- local-volume kanıtı yoksa tam storage parity iddiası engellenir,
- eksik runtime topology singleton iddiasını engeller,
- no-clobber/symlink/owner/mode/atomic READY davranışı,
- timeout, signal ve partial artifact cleanup ownership'i,
- offline reconciler network import edemez.

Sonra ayrı incelemeler:

- TDD review,
- code review,
- security/privacy review,
- gerçek production erişimi olmadan disposable fake PostgreSQL/R2/Redis
  acceptance,
- yalnız bunların GO sonucundan sonra B1 için ayrı kullanıcı onayı.

## 11. Commit ve restore ayrımı

Önerilen yerel commit sırası:

1. `docs(release): design A14B readonly inventory collector`
2. `test(release): define A14B collector safety contract`
3. `feat(release): implement A14B readonly collectors`
4. `docs(release): record A14B local acceptance`
5. local restore tag + complete-history bundle

Bu belge yalnız birinci, design-only adımdır. Test veya collector kodu bu
belgeyle aynı commit'e karıştırılmamalıdır.

## 12. Sonraki karar

Bir sonraki güvenli teknik adım, hâlâ canlı erişim olmadan:

1. D-01 ve D-02 için exact veri/komut sözleşmesini test olarak yazmak,
2. adapter interface'leri ve evidence JSON Schema/Zod şemasını oluşturmak,
3. fake/disposable PostgreSQL, R2 ve Redis harness'lerinde forbidden-operation
   ve false-success testlerini RED yapmak.

Bu adım için ayrıca ürün davranışı değişikliği, migration veya production
credential gerekmez. Gerçek B1 çalıştırması, credential yaratılması ve runtime
topology erişimi için yeniden açık kullanıcı onayı alınacaktır.
