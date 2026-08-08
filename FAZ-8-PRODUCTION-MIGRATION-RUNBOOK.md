# Faz 8 Production Migration Runbook

Durum: **NO-GO — YEREL HAZIRLIK SÜRÜYOR, PRODUCTION UYGULAMA YETKİSİ YOK**

Bu runbook yalnız kullanıcı açıkça salt-okunur canlı envanteri, bakım
penceresini ve production uygulamasını ayrı ayrı onayladığında yürütülür.
Runbook’un varlığı push, deploy, migration, seed veya production bağlantısı
yetkisi vermez.

## 1. Değişmez güvenlik sınırları

- Production verisi korunur; doğrulanmamış hiçbir `DROP`, `TRUNCATE`, restore,
  queue purge veya Redis flush işlemi uygulanmaz.
- Yeni ve eski backend aynı production PostgreSQL/Redis üzerinde aynı anda
  çalıştırılmaz. Backend process’i worker ve cron’ları da içerir.
- Migration planı belgeye yazılmış sabit bir listeden çıkarılmaz. Tek kaynak,
  release adayındaki kanonik migration manifesti ile production
  `_prisma_migrations` ledger’ının salt-okunur farkıdır.
- Secret, connection string, signed URL ve token hiçbir rapora veya Git
  artifact’ına yazılmaz.
- Migration öncesi backup yalnız dosya oluştuğu için başarılı sayılmaz;
  SHA-256, `pg_restore --list` ve ayrı PostgreSQL 17 restore kanıtı gerekir.
- PostgreSQL backup, production’ın kanonik S3-compatible object storage
  nesnelerinin yerine geçmez. Uygulamadaki tarihsel local-storage fallback
  yalnız kurtarma envanteri olarak taranır; aktif storage hedefi sayılmaz.
- S3 nesne paritesi tek başına yedek değildir. Versioning veya immutable backup
  ile ayrı restore/canary kanıtı GO kapısıdır.
- İlk cutover rolling/blue-green değildir: bakım modu, sıfır eski backend ve
  yalnız bir yeni backend instance kullanılır.

## 2. Release adayı ve kanonik migration kaynağı

Her prova ve cutover başında aşağıdaki kimlikler birlikte kaydedilir:

- Git commit SHA,
- backend ve frontend immutable image digest’i,
- `pnpm-lock.yaml` SHA-256,
- iki Dockerfile SHA-256,
- `packages/database/prisma/migration-checksums.json` SHA-256,
- `scripts/resolve-production-migration-plan.mjs` çıktısı.

Mevcut kanonik manifest bu belge yazılırken 56 migration içerir. Bu sayı yalnız
release adayının yerel durumudur; production’da 56 migration’ın tamamının
uygulanmış veya belirli son migration’ların pending olduğu varsayılmaz.

Kanonik zincirin son bölümünde veri veya veri önkoşulu içeren önemli
migration’lar bulunur:

- `20260806020000_add_faq_provenance_ai_history_permissions`
- `20260806021000_grant_faq_review_to_existing_reviewers`
- `20260806022000_align_faq_entry_sources_updated_at_default`
- `20260807090000_add_support_agent_rbac_contract`
- `20260807143000_add_product_taxonomy_unique_indexes`

Bu liste **pending migration listesi değildir**. Yalnız preflight ve etki
incelemesinde unutulmaması gereken yüksek etkili kanonik tail’dir.

## 3. Fail-closed migration planı

Planlayıcı şu durumlarda plan üretmeden kapanır:

- migration dosyaları ile checksum manifesti uyuşmuyorsa,
- production ledger’da kanonik dosyası olmayan bir migration varsa,
- başarılı migration checksum’u kanonik kaynakla uyuşmuyorsa ve aşağıdaki dar,
  açıkça onaylanmış tarihsel istisna kullanılmamışsa,
- `finished_at`/`rolled_back_at` yaşam döngüsü ikisi de boş veya ikisi de doluysa,
- canlı DB modu açık opt-in olmadan çağrılırsa.

Yerel/offline ledger dosyasıyla kullanım:

```bash
node scripts/resolve-production-migration-plan.mjs \
  --ledger-file .private-data/release/production-ledger.json \
  --output .private-data/release/production-migration-plan.json
```

Ayrıca onaylanmış salt-okunur canlı envanter sırasında, bağlantı bilgisi
yalnız process environment’tan alınarak kullanılabilir:

```bash
ALLOW_PRODUCTION_LEDGER_READ=1 \
  node scripts/resolve-production-migration-plan.mjs \
  --output .private-data/release/production-migration-plan.json
```

İkinci komut ancak kullanıcı production salt-okunur bağlantısını ayrıca
onayladığında çalıştırılır. `DATABASE_URL` ekrana, shell history’ye veya
rapora yazılmaz. Script bağlantıyı `REPEATABLE READ READ ONLY` transaction ile
açar ve yalnız migration ledger’ını okur.

`20260426202926_add_proactive_chat` için ADR-011’de kayıtlı
`manual-psql-fix` ledger marker’ı otomatik kabul edilmez. Production ledger bu
exact tarihsel satırı içeriyorsa ADR-011 ve canlı satır bağımsız doğrulandıktan
sonra komuta yalnız şu dar acknowledgement eklenebilir:

```bash
--acknowledge-marker 20260426202926_add_proactive_chat=manual-psql-fix
```

Başka migration, başka marker veya rolled-back satır bu istisnadan yararlanamaz.
Artifact ilgili kaydı `ledgerChecksum: "manual-psql-fix"` ve
`matchMode: "accepted-marker"` olarak açıkça gösterir; kanonik checksum gibi
gizlemez. Bu kayıt cutover kararında ayrıca imzalanır.

Plan artifact’ında her migration için ad, kanonik checksum, uygulanmış
kayıtlarda gerçek `ledgerChecksum`/`matchMode` ve yalnız bilgilendirici
`DDL`/`DML`/`DML+DDL` sınıfı bulunur. Artifact ayrıca ledger digest’i, capture
zamanı ve canlı modda secret içermeyen hash’lenmiş hedef fingerprint’i taşır.
Offline ledger dosyasının SHA-256’sı kaydedilir; offline artifact tek başına
production GO kanıtı değildir. SQL sınıflandırması güvenlik incelemesinin
yerine geçmez.

## 4. Bakım penceresi öncesi salt-okunur preflight

Bu bölüm production’a bağlanma yetkisi değildir. Tüm sorgular ayrıca onaylı
salt-okunur oturumda, secret değerleri yazdırmadan çalıştırılır.

### 4.1 Platform ve ledger

```sql
SELECT version();
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_stat_statements');

SELECT migration_name, checksum, started_at, finished_at, rolled_back_at
FROM _prisma_migrations
ORDER BY started_at, migration_name;
```

İptal kriterleri:

- PostgreSQL major sürümü prova edilen PG17 hedefinden farklı,
- bilinmeyen migration,
- açıkça acknowledge edilmemiş checksum drift,
- `finished_at`/`rolled_back_at` alanları ikisi de boş veya ikisi de dolu olan
  migration denemesi,
- kanonik manifest/ledger planlayıcısının non-zero çıkması.

### 4.2 Uzun transaction ve kilit riski

```sql
SELECT pid,
       now() - xact_start AS age,
       state,
       wait_event_type,
       wait_event,
       backend_type
FROM pg_stat_activity
WHERE datname = current_database()
  AND xact_start IS NOT NULL
  AND pid <> pg_backend_pid()
ORDER BY xact_start;
```

İptal kriteri: 30 saniyeden eski yazan transaction, bilinmeyen DDL, aktif
import/sync/re-index veya bakım dışı uzun sorgu.

### 4.3 SUPPORT_AGENT preflight

```sql
SELECT id, name
FROM roles
WHERE UPPER(REPLACE(BTRIM(name), '-', '_')) = 'SUPPORT_AGENT';

SELECT permission_row.name
FROM role_permissions role_permission
JOIN roles role_row ON role_row.id = role_permission.role_id
JOIN permissions permission_row ON permission_row.id = role_permission.permission_id
WHERE role_row.name = 'SUPPORT_AGENT'
ORDER BY permission_row.name;
```

İptal kriterleri:

- `SUPPORT_AGENT` ile aynı normalize değere sahip farklı adlı rol,
- mevcut `SUPPORT_AGENT` rolünde onaylı kanonik 16 izin dışında izin,
- sonucu açıklanmamış rol/izin drift’i.

### 4.4 Ürün taksonomisi duplicate preflight

```sql
SELECT LOWER(BTRIM(name)) AS normalized_name, COUNT(*) AS duplicate_count
FROM products
WHERE deleted_at IS NULL AND is_active = TRUE
GROUP BY LOWER(BTRIM(name))
HAVING COUNT(*) > 1;

SELECT product_id,
       LOWER(BTRIM(name)) AS normalized_name,
       COUNT(*) AS duplicate_count
FROM product_categories
WHERE deleted_at IS NULL AND is_active = TRUE
GROUP BY product_id, LOWER(BTRIM(name))
HAVING COUNT(*) > 1;
```

Beklenen iki sorguda da sıfır satırdır. Duplicate bulunursa otomatik silme,
merge veya rename yapılmaz; migration iptal edilir ve ayrı ürün/veri kararı
alınır.

### 4.5 Veri, RAG, queue ve storage baz çizgisi

Bakım öncesi en az şunlar kaydedilir:

- kritik business-table satır sayıları ve schema/data fingerprint’leri,
- beş embedding ailesinde `embedding_version`, `embedding_dim`, satır sayısı
  ve `vector_dims(embedding) != embedding_dim` sayısı,
- dokuz BullMQ queue’nun waiting/active/delayed/failed/paused sayıları ile
  active job ID’leri,
- repeatable job listesi, Redis persistence ve eviction policy,
- attachment, knowledge source ve branding DB key’leri ile kanonik S3-compatible
  object manifesti; local upload volume yalnız tarihsel fallback kurtarma
  envanteri olarak ayrıca raporlanır,
- S3 versioning/immutable backup durumu ve ayrı restore/canary kanıtı,
- `FAILED_STORAGE_UPLOAD_%` işaretli kayıtlar.

Queue dashboard yalnız dört queue gösterdiği için tek başına kanıt değildir.

## 5. Bakım penceresi GO kapıları

Aşağıdakilerden biri eksikse bakım başlatılmaz:

1. Exact release SHA ve backend/frontend image digest’leri sabit.
2. Güncel migration planı üretildi ve tüm pending migration SQL’leri tek tek
   incelendi.
3. Güncel production-derived PG17 klonda aynı plan iki kez prova edildi;
   ikinci çalıştırmada pending sıfır.
4. Exact eski production image, post-migration klonda rollback uyumluluğu
   gösterdi.
5. Doğrulanmış external backup + ayrı PG17 restore mevcut.
6. DB ↔ S3 object parity’de eksik nesne sıfır; versioning veya immutable backup
   ile ayrı restore/canary kanıtı mevcut. Local fallback envanteri ayrı
   uzlaştırılmış.
7. Dokuz queue’nun active iş sayısı sıfır ve resume planı kayıtlı.
8. Worker/cron maintenance boot A.2 güvenlik sözleşmesi testli.
9. İzole staging aynı immutable image digest’leriyle kritik journey’leri,
   RAG kabulünü ve image rollback’i geçti.
10. Kullanıcı bakım penceresini ve production uygulamasını açıkça onayladı.

## 6. Uygulama sırası — yalnız açık onaydan sonra

1. Bakım sayfasını aç ve tüm write ingress’i kapat.
2. Queue producer’larını durdur; aktif işleri sıfıra indir.
3. Tüm eski backend replica’larını durdur ve gerçekten sıfır olduklarını
   doğrula. PostgreSQL ve Redis volume’larını silme/yeniden oluşturma.
4. `pg_dump -Fc --no-owner --no-privileges` ile mode `0600` backup al.
5. SHA-256 doğrula, `pg_restore --list` çalıştır ve ayrı PG17+pgvector
   container’a restore et.
6. Restore hedefinde ledger, kritik tablo sayıları, FK doğrulaması ve
   fingerprint’leri kontrol et.
7. Exact release image ile one-shot `prisma migrate deploy` çalıştır; lock ve
   statement timeout uygula.
8. Aynı migration komutunu ikinci kez çalıştır; pending sıfır olmalı.
9. Plan artifact’ındaki tüm pending migration’ların ledger’da
   `finished=true, rolled_back=false` olduğunu doğrula.
10. Pre/post business fingerprint farklarını migration bazında açıkla;
    açıklanamayan kayıp veya değişimde uygulamayı başlatma.
11. Yalnız bir yeni backend instance başlat. Worker/cron A.2 kapısı olmadan
    bu adıma gelinmez.
12. DB, Redis, storage, auth, queue, mail/CRM/AI readiness smoke’larını yap.
13. Frontend’i exact digest ile başlat; iç kabul geçmeden trafiği açma.

## 7. Manual backup/restore doğrulama sözleşmesi

Mevcut otomatik DR/backup scriptleri Faz A.1.2/A.1.3 tamamlanana kadar
production kanıtı sayılmaz. Geçici olarak yalnız aşağıdaki operator sözleşmesi
kabul edilir:

- custom-format dump,
- `--no-owner --no-privileges`,
- dosya mode `0600`,
- SHA-256 sidecar,
- `pg_restore --list` exit `0`,
- ayrı PG17 restore exit `0`,
- restore sonrası ledger, kritik sayılar ve fingerprint doğrulaması,
- dump + checksum’un production host dışında doğrulanmış dış kopyası.

Signed backup URL’leri ve secret değerleri rapora yazılmaz. Yalnız artifact
adı, boyutu, SHA-256 ve doğrulama zamanı kaydedilir.

## 8. One-shot migration sözleşmesi

One-shot container:

- exact immutable release image kullanır,
- production Docker ağına yalnız bakım penceresinde katılır,
- secret store’dan ephemeral env alır,
- `lock_timeout=5s`, `statement_timeout=300s` uygular,
- migration file integrity kontrolünü migration’dan önce ve sonra çalıştırır,
- non-zero durumda backend’i başlatmaz,
- aynı komut ikinci kez çalıştırıldığında pending sıfır üretir.

Uygulamanın normal `deploy.sh` başlangıcı bu fail-closed davranışı korur; fakat
ilk büyük cutover’da migration’ın normal app boot içinde tesadüfen çalışmasına
güvenilmez.

## 9. Son doğrulama

Release checkout/container içinde:

```bash
pnpm db:verify:migration-files
pnpm db:verify:migrations
pnpm exec prisma migrate status \
  --schema packages/database/prisma/schema.prisma \
  --config packages/database/prisma.config.js
```

Ek olarak:

- production migration planı `pending=[]` göstermeli,
- kanonik/ledger checksum drift’i sıfır olmalı; varsa tek tarihsel
  `accepted-marker` kaydı açıkça görülmeli ve ayrıca onaylanmalı,
- unresolved/unknown migration sıfır olmalı,
- pre/post business farkları açıklanmış olmalı,
- dokuz queue ve repeatable-job tekilliği doğrulanmalı,
- S3 object canary read ile versioning/immutable backup restore canary geçmeli,
- RAG kabul seti exact image üzerinde geçmeli,
- backend/frontend health ve kritik kullanıcı journey’leri geçmeli.

## 10. İptal ve rollback

### Migration commit edilmeden önce

Migration transaction’ı abort edilir. Ledger değişmediyse exact eski image
yeniden başlatılır. Backup restore edilmez.

### Migration commit edildi, trafik açılmadı

Yeni image durdurulur. Yalnız production-derived klonda post-migration schema
ile uyumluluğu kanıtlanmış exact eski image başlatılır. Otomatik ters DDL
çalıştırılmaz; additive schema yerinde kalır ve forward-fix hazırlanır.

### Trafik açıldıktan sonra

Öncelik image rollback veya forward-fix’tir. DB restore backup sonrasındaki
gerçek kullanıcı verisini kaybettirebilir; açık RPO/reconciliation kararı
olmadan yapılmaz. DB restore zorunluysa PostgreSQL, S3 object state, tarihsel
local-fallback recovery state ve Redis queue state aynı mantıksal ana getirilir.
Yalnız DB restore etmek kabul edilmez.

## 11. Açık yerel fazlar

- **A.1.1:** ledger-driven migration planı ve bu runbook — bu dosyanın mevcut
  kapsamı.
- **A.1.2:** fail-closed, checksum’lı custom-format backup scripti.
- **A.1.3:** kalıcı artifact üreten gerçek PG17 restore drill’i.
- **A.1.4:** local/CI PostgreSQL 17 hizalaması; mevcut PG16 volume doğrudan
  PG17 image ile açılmayacak, dump/restore ve yeni volume kullanılacak.
- **A.1.5:** frozen dependency, security bağımlı staging, webhook/health ve
  immutable image kapıları.
- **A.2:** worker/cron maintenance boot; job’u tüketip erken `return` eden sahte
  kapatma kabul edilmeyecek.

Bu fazların tamamı bağımsız test/review ve ayrıca kullanıcı GO’su almadan
production salt-okunur envanterden cutover aşamasına ilerlenmez.
