# Production Salt-Okunur Envanter Sözleşmesi — A.1.4

Tarih: 2026-08-10  
Durum: Yerel hazırlık tamamlanıyor; production erişimi yapılmadı  
Karar: Production NO-GO

## 1. Amaç

Canlı sisteme bağlanmadan önce PostgreSQL, Cloudflare R2 ve Redis/BullMQ
envanterinin hangi bilgilerle, hangi salt-okunur işlemlerle ve hangi kanıt
sınırları içinde çıkarılacağını kodla kilitlemek.

Bu faz bir collector çalıştırmaz. Credential kabul etmez, ağ/database client'ı
import etmez ve `--execute` çağrısını fail-closed reddeder.

## 2. Kanonik araç

- Sözleşme: `scripts/release-a14-inventory-contract.mjs`
- Regresyonlar: `scripts/release-a14-inventory-contract.test.mjs`
- Komut: `pnpm release:a14:prepare-inventory -- --git-sha <40-hex-sha>`
- Varsayılan özel kanıt:
  `.private-data/release-evidence/a14-production-inventory/preparation-plan.json`

Plan mode `0600` ve no-clobber olarak yazılır. Çıktı `.private-data` dışına
alınamaz; private path içindeki symlink veya group/world-readable dizinler
reddedilir. Plan `productionAccessPerformed=false` ve `productionGo=false`
taşır.

## 3. Kilitlenen yüzey

### PostgreSQL

- Migration ledger, server/extension metadata ve object-reference sayımları.
- Yalnız `REPEATABLE READ READ ONLY`, dar `SET LOCAL`, `SELECT`, `SHOW` ve
  `ROLLBACK` grameri.
- DML/DDL, lock, `COPY`, `FOR UPDATE/SHARE`, sleep, backend-control fonksiyonları
  ve multi-statement payload fail-closed reddedilir.

### Cloudflare R2

- Gelecek collector için yalnız `ListObjectsV2` ve `HeadObject`.
- `GetObject`, `PutObject`, `DeleteObject` ve `CopyObject` bu envanter fazında
  yasaktır.
- Çıktı yalnız private key/size/ETag/last-modified manifestidir.

### Redis ve BullMQ

- Tam dokuz queue: `ai-query-processing`, `crm-sync`, `document-parsing`,
  `email`, `embedding-migration`, `kb-summarizer`, `knowledge-sync`,
  `proactive-chat`, `sla-processing`.
- Yalnız INFO/CONFIG GET/SCAN/TYPE ve sayım komutları planlanır.
- Queue pause/resume, pop, add, delete, flush ve Redis write komutları yasaktır.
- Kodda dokuz `@Cron` deklarasyonu ve dört repeatable job kayıt noktası vardır.
  Bunların varlığı runtime singleton kanıtı değildir; canlı replica ve job
  tekilliği ayrıca salt-okunur gözlemlenecektir.

## 4. Bu turda yapılmayanlar

- Production PostgreSQL/R2/Redis/SSH bağlantısı yok.
- Credential oluşturma, okuma veya doğrulama yok.
- Canlı object listeleme/indirme/kopyalama yok.
- Migration, seed, queue mutation, worker/cron durdurma veya deploy yok.
- Mevcut `aluplan-support-desk` ve `aluplancoolify` bucket'larına erişim yok.

## 5. Bir sonraki karar kapısı

Yerel testler ve bağımsız inceleme kapandıktan sonra kullanıcıdan ayrıca açık
onay alınır. Onay verilirse ayrı kısa ömürlü ve least-privilege credential'lar
ile collector A.1.4-B geliştirilir/çalıştırılır. İlk gerçek production erişimi
de yalnız şu sırayla yapılır:

1. Salt-okunur migration ledger ve PostgreSQL metadata.
2. R2 key/size/ETag/last-modified manifesti; object body indirilmez.
3. Dokuz queue sayaçları, active job ID'leri, repeatable job listesi, Redis
   persistence/eviction metadata.
4. DB object-reference sayımları ile R2 manifest paritesi.

Her artifact private, redacted, hash-bound ve `productionGo=false` kalır. Bu
envanterin başarılı olması tek başına deploy yetkisi vermez.
