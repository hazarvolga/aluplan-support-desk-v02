# A.1.4-B1 Pre-Deploy Backup and Restore Gate

Tarih: 2026-08-16
Durum: **PLAN ONLY / BACKUP EXECUTION NO-GO / LIVE OBSERVATION NO-GO / DEPLOY NO-GO**

Bu belge production deploy öncesinde canlı durumun güvenli biçimde yedeklenmesi,
restore edilebilirliğinin kanıtlanması ve rollback sınırlarının netleşmesi için
hazırlanmıştır. Bu belge tek başına production PostgreSQL, Cloudflare R2,
Redis, SSH, Coolify veya SharePoint erişimi vermez; backup çalıştırma veya
deploy yetkisi değildir.

## 1. Amaç

Amaç, deploy öncesi "geri dönebiliriz" kanıtını teknik olarak ispatlamaktır.
Sadece Git restore point yeterli değildir; canlı ticket, müşteri, attachment,
knowledge file, queue ve runtime state kodun dışında yaşar.

Deploy öncesi minimum sıra:

```text
B1 credential provisioning yöntemi
    ↓
Credential alt onayları ve scope kanıtları
    ↓
B1 canlı salt-okunur observation
    ↓
Pre-deploy backup and restore gate
    ↓
Final deploy GO/NO-GO
    ↓
Explicit deploy approval: "deploy et"
```

## 2. Hâlâ NO-GO olan kapılar

- Production PostgreSQL backup execution: **NO-GO until separate explicit approval**
- R2 backup/copy execution: **NO-GO until separate explicit approval**
- Redis/Coolify/runtime inventory: **NO-GO until separate explicit approval**
- B1 live observation: **NO-GO until separate explicit approval**
- Runtime-topology/SSH/Coolify: **NO-GO until separate explicit approval**
- Production deploy: **NO-GO until explicit `deploy et` approval**

## 3. Backup kapsamı

Deploy öncesi canlı durum üç ayrı sınıfta ele alınmalıdır.

### 3.1 PostgreSQL database

Hedef:

- Production database'in transactionally consistent dump'ı.
- Dump'ın hash ve restore edilebilirlik kanıtı.

GO için:

- Backup aracı PG major/version uyumunu doğrular.
- Dump custom format olmalıdır.
- Dump dosyası Git dışı private alanda veya onaylı offsite hedefte tutulur.
- Dump SHA-256 hesaplanır.
- `pg_restore --list` veya eşdeğer catalog check başarılıdır.
- Disposable restore drill başarılıdır.
- Restore sonrası migration ledger, kritik tablo sayımları ve schema parity
  kanıtlanır.

NO-GO için:

- Plain SQL dump tek kanıt ise.
- Dump hash yoksa.
- Restore denenmemişse.
- Restore drill migration ledger/schema/business fingerprint üretmiyorsa.
- Backup komutu secret değerini terminale/loga yazıyorsa.

### 3.2 Cloudflare R2 / object storage

Hedef:

- Production application bucket `aluplan-support-desk` içindeki object state'in
  deploy öncesi korunması.
- DB içindeki object referanslarıyla R2 object manifestinin karşılaştırılması.

GO için:

- En azından deploy öncesi full R2 metadata manifesti alınır:
  - key fingerprint veya redacted key,
  - size,
  - ETag veya checksum-benzeri provider metadata,
  - last modified.
- DB-referenced object missing varsa backup/deploy NO-GO.
- R2 object copy/versioning/backup stratejisi netleşir:
  - R2 içinde ayrı backup bucket,
  - veya client-side encrypted SharePoint/OneDrive copy,
  - veya provider versioning/immutable retention kanıtı.
- Object body read gerekiyorsa ayrıca açık kullanıcı onayı ve compensating
  control gerekir.
- Ham object key ve private URL kalıcı rapora yazılmaz; HMAC/fingerprint
  tercih edilir.

NO-GO için:

- Sadece database backup var, R2 manifest yoksa.
- DB-referenced object missing varsa.
- Local-volume referansı var ama ayrı manifest yoksa.
- R2 backup/copy hedefi belirsizse.
- Object body read veya copy geniş yetkisi ayrıca onaylanmamışsa.

### 3.3 Redis / BullMQ / runtime rollback state

Redis backup, database restore gibi bir rollback kaynağı sayılmamalıdır; Redis
öncelikle queue/runtime gözlem kanıtıdır.

GO için:

- Dokuz kanonik BullMQ queue için exact-known-key state snapshot alınır.
- Active/delayed/failed/repeatable/stalled gibi durumlar deploy öncesi kayda
  geçer.
- Belirsiz veya hareketli queue state varsa deploy kapısı açılmaz.
- Runtime image/commit/env fingerprint rollback için belirlenir.
- Coolify rollback hedefi ve sağlık kontrol endpointleri bellidir.

NO-GO için:

- Redis state bilinmiyorsa.
- Active critical job varken deploy planlanıyorsa.
- Running image/commit bilinmiyorsa.
- Coolify rollback hedefi veya health gate belirsizse.

## 4. Bakım penceresi / live writes

Canlı sistemde bilet açılmaya ve dosya yüklenmeye devam ediyorsa DB↔R2 exact
parity moving-target olabilir. Bu yüzden backup/restore gate tercihen düşük
trafik/gece penceresinde yürütülmelidir.

GO için:

- Observation başlangıç/bitiş snapshotları stable olmalıdır.
- Backup alınırken yeni upload/ticket hareketi varsa bu hareket ayrıca
  sınıflandırılır.
- Moving-target drift deploy GO sayılmaz; diagnostic artifact olarak kalır.

## 5. Offsite kopya stratejisi

Yerel backup tek başına yeterli değildir. En az bir offsite veya provider-side
kurtarma yolu belirlenmelidir.

Kabul edilebilir seçenekler:

- R2 backup bucket veya provider-side immutable/versioned copy.
- Client-side encrypted SharePoint/OneDrive copy.
- Geçici local-only copy yalnız emergency ara adım olabilir; production GO
  için tek kanıt sayılmaz.

SharePoint/OneDrive kullanılacaksa:

- Dosya client-side encrypted olmalıdır.
- Plain dump/object body SharePoint'e yüklenmez.
- En az bir restore/decrypt round-trip kanıtı gerekir.
- Kurumsal mevcut "ALUPLAN DESTEK PLATFORMU 2026" alanı izinsiz
  kullanılmamalıdır; ayrı backup alanı tercih edilir.

## 6. Restore drill kapısı

Backup ancak restore edilebildiği kanıtlanırsa deploy kapısına katkı sağlar.

Minimum restore drill:

- Disposable PostgreSQL hedefi.
- Production dump restore.
- Schema parity.
- Migration ledger doğrulaması.
- Kritik business count/fingerprint.
- RAG/vector metadata distribution.
- Object reference manifest kıyası.
- İkinci dry-run/migration no-op kanıtı.

Restore drill başarısızsa:

- Deploy NO-GO.
- Backup "alındı" sayılabilir ama "deploy güvenliği" sayılmaz.
- Önce restore hatası çözülmelidir.

## 7. Secret handling

- Secret, token, parola, connection string, reset URL veya object body değeri
  Git'e, dokümana, terminal çıktısına veya ortak rapora yazılmaz.
- Backup dosyaları Git dışı private alanda mode `0600` tutulmalıdır.
- Backup dizinleri mode `0700` olmalıdır.
- Ortak rapora yalnız redacted scope, hash, byte size, path ve GO/NO-GO sonucu
  yazılır.

## 8. Açık onay cümleleri

Bu belge hiçbir canlı işlemi başlatmaz. Gelecek adımlar için dar onay
cümleleri:

- `B1 pre-deploy backup planını onaylıyorum`
  - Yalnız bu backup/restore yönteminin onayıdır.
- `Production PostgreSQL backup al`
  - Yalnız PostgreSQL backup yürütme için ayrıca değerlendirilebilir.
- `Production R2 backup manifesti al`
  - Yalnız R2 metadata manifesti için ayrıca değerlendirilebilir.
- `Production R2 backup copy başlat`
  - Object body/copy gerektirebileceği için ayrıca yüksek dikkat gerektirir.
- `B1 canlı salt-okunur gözleme başla`
  - Yalnız credential scope kanıtları ve backup planı hazırsa değerlendirilebilir.
- `deploy et`
  - Yalnız observation + backup/restore + rollback gate GO ise deployment için
    ayrı açık onaydır.

## 9. GO/NO-GO özeti

Deploy konuşulmadan önce GO için:

- PostgreSQL backup alınmış ve restore drill başarılı.
- R2 manifest alınmış; DB-referenced missing object yok.
- R2 backup/copy/versioning/immutable recovery stratejisi net.
- Redis/BullMQ state ve runtime rollback hedefi kaydedilmiş.
- Backup artifactleri private, hashli ve restore edilebilir.
- Secret sızıntısı yok.
- Cleanup/revoke/retention planı yazılı.

NO-GO:

- Database restore drill yok.
- R2/local-volume parity yok.
- DB-referenced object missing var.
- Backup dosyalarının hash veya saklama konumu belirsiz.
- Running image/rollback hedefi belirsiz.
- Canlı writes moving-target ve sınıflandırılmamış.
- Deploy için explicit `deploy et` onayı yok.

## 10. Bu belgenin sonucu

Bu belge yalnız deploy öncesi backup/restore gate planıdır.

- Backup execution: **NO-GO**
- B1 live observation: **NO-GO**
- Runtime-topology/SSH/Coolify: **NO-GO**
- Production deploy: **NO-GO**

Bu belge oluşturulurken production PostgreSQL, Redis, Cloudflare R2, SSH,
Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya
yazılmadı; migration, seed, queue/object/Redis/DB mutation, backup execution,
push, tag-push veya deploy yapılmadı.
