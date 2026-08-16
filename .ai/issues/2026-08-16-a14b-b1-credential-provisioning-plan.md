# A.1.4-B1 Credential Provisioning Plan

Tarih: 2026-08-16
Durum: **METHOD APPROVED / CREDENTIAL PROVISIONING NO-GO / LIVE OBSERVATION NO-GO / DEPLOY NO-GO**

Bu belge B1 canlı salt-okunur gözleme geçmeden önce credential üretim yöntemini
kilitlemek için hazırlanmıştır. Bu belge tek başına credential oluşturma,
production bağlantısı, live observation, SSH/Coolify erişimi veya deploy yetkisi
vermez.

## 1. Amaç

Amaç, canlı sistemlere zarar vermeden yalnız gerekli metadata'yı okuyabilecek,
kısa ömürlü ve dar kapsamlı credential modelini tanımlamaktır.

B1 gözlem ancak şu sıra korunursa ilerleyebilir:

```text
Credential provisioning planı
    ↓
Ayrı açık credential provisioning onayı
    ↓
Kısa ömürlü credential oluşturma / kullanıcı operatörlüğü
    ↓
Credential scope kanıtı
    ↓
Ayrı açık B1 canlı salt-okunur gözlem onayı
    ↓
B1 observation
```

Credential provisioning onayı, canlı gözlem veya deploy onayı değildir.

## 2. Hâlâ NO-GO olan kapılar

- Credential provisioning: **NO-GO until explicit approval**
- B1 concrete transports: **NO-GO until explicit approval**
- B1 live observation: **NO-GO until explicit approval**
- Runtime-topology/SSH/Coolify: **NO-GO until separate explicit approval**
- Production deploy: **NO-GO until explicit `deploy et` approval**

## 3. Genel credential kuralları

- Secret, token, parola, connection string veya reset URL değeri Git'e,
  dokümana, terminal çıktısına veya ortak rapora yazılmaz.
- Credential değerleri Codex tarafından okunmaz, saklanmaz veya tekrar edilmez.
- Gerekirse kullanıcı kendi ekranında üretir; Codex yalnız scope/checklist
  üzerinden rehberlik eder.
- Her sistem için ayrı credential kullanılır; tek credential PostgreSQL, R2 ve
  Redis'i birlikte kapsamaz.
- Credential kısa ömürlü olmalıdır; iş bitince revoke/drop/disable planı baştan
  yazılı olmalıdır.
- Credential scope kanıtı alınmadan B1 live observation başlamaz.
- Geniş kapsamlı existing/admin credential kullanımı B1 GO kanıtı sayılmaz.

## 4. PostgreSQL credential planı

Hazırlanacak credential tipi:

- Kısa ömürlü read-only PostgreSQL rolü.
- `LOGIN`, `NOINHERIT`.
- `default_transaction_read_only = on`.
- Hedef production database dışında bağlantı yetkisi olmamalı.
- Gereken tablolar için yalnız `SELECT`.
- `CREATE`, `TEMP`, DML, DDL ve riskli fonksiyon kullanımı olmamalı.
- Bounded `statement_timeout`, `lock_timeout`,
  `idle_in_transaction_session_timeout`.

Zorunlu kullanım sözleşmesi:

- Collector yalnız exact SQL allowlist üzerinden çalışır.
- Transaction seviyesi `REPEATABLE READ READ ONLY` olmalıdır.
- Her durumda `ROLLBACK` denenmelidir.
- Failed/contradictory/unknown migration ledger satırı varsa NO-GO.
- Role scope probe fazla privilege görürse NO-GO.

Operasyon sınırı:

- Role create/alter/drop production DB üzerinde write kabul edilir; bu belge o
  işlemi yetkilendirmez.
- Böyle bir rol yalnız kullanıcı ayrı olarak açıkça
  `B1 PostgreSQL credential provisioning başlat` derse konuşulabilir.
- Rol parolası Codex'e yazılmaz; sadece "oluşturuldu / oluşturulmadı" ve
  redacted scope kanıtı kaydedilir.

## 5. Cloudflare R2 credential planı

Hedef bucket:

- Production application bucket: `aluplan-support-desk`.

Hazırlanacak credential tipi:

- Parent secret collector'a verilmez.
- Tercih edilen model: bucket-scoped, kısa ömürlü child credential.
- Hedef eylemler yalnız:
  - `ListObjectsV2`
  - `HeadObject`
- Object body read, upload, delete, overwrite veya lifecycle değişikliği yoktur.

Compensating-control şartı:

- Cloudflare token/API modeli `GetObject`'i credential seviyesinde kesin
  dışlayamıyorsa bucket-scoped read-only token tek başına GO kanıtı değildir.
- Bu durumda collector'ın yalnız allowlist çağrıları yaptığını gösteren
  audit-log / invocation-record kanıtı ve ayrıca kullanıcı onayı gerekir.

Operasyon sınırı:

- Token oluşturma veya scope değiştirme canlı provider işlemidir; bu belge o
  işlemi yetkilendirmez.
- Token değeri Codex'e yazılmaz.
- Ham object key kalıcı evidence'a yazılmaz; HMAC/fingerprint kullanılır.

## 6. Redis / BullMQ credential planı

Hazırlanacak credential tipi:

- Tercih edilen model: exact-known-key read-only erişim.
- Kapsam dokuz kanonik BullMQ queue ile sınırlıdır.
- `SCAN`, `KEYS`, Lua, write komutları ve BullMQ mutating helper'ları yasaktır.
- Queue depth, active/delayed/failed/repeatable state bounded biçimde okunur.

GO koşulu:

- Redis credential exact-known-key sözleşmesini aşmamalıdır.
- Fallback `SCAN` gerekiyorsa default B1 scope NO-GO olur; ayrı privacy/scope
  onayı gerekir.
- Belirsiz veya hareketli queue state'i deploy kapısını açmaz; yalnız diagnostic
  artifact üretilebilir.
- `StalledJobRecoveryService` gibi in-process timer kaynakları runtime gözlemde
  ayrı sınıflandırılır.

Operasyon sınırı:

- Redis ACL user oluşturma/değiştirme canlı mutasyondur; bu belge o işlemi
  yetkilendirmez.
- Existing broad Redis credential ile B1 Redis GO verilmez.

## 7. Runtime-topology / SSH / Coolify

Varsayılan B1 credential provisioning kapsamı:

- SSH yok.
- Coolify yok.
- Runtime-topology yok.

Runtime-topology kanıtı gerekiyorsa:

- Ayrı açık kullanıcı onayı gerekir.
- Komut seti önceden listelenmeden çalıştırma yoktur.
- Salt-okunur gözlem dışında restart, redeploy, env edit, volume edit veya
  container mutation yapılmaz.

## 8. Secret handling ve yerel saklama

Bu fazda secret saklama hedefi belirlenirse:

- Git dışı private alan kullanılmalıdır.
- Dosya mode `0600`, dizin mode `0700` olmalıdır.
- Secret dosyaları rapora veya Git'e eklenmez.
- Ortak rapora yalnız redacted presence, scope kararı ve recovery/revoke planı
  yazılır.

Tercih:

- Credential değerleri mümkünse Codex çalışma alanına hiç yazılmasın.
- Kullanıcı/provider UI üzerinden üretip sadece scope kanıtını paylaşsın.

## 9. Revocation / cleanup planı

Her credential için oluşturulmadan önce geri alma planı net olmalıdır:

- PostgreSQL rolü: observation sonrası revoke/drop/disable planı.
- R2 token: observation sonrası revoke/expire planı.
- Redis ACL user/token: observation sonrası revoke/disable planı.
- Local secret dosyası varsa: hangi dosyanın ne zaman silineceği veya arşivde
  tutulacağı.

Cleanup yapılmadan deploy kapısı açılmaz.

## 10. GO/NO-GO kapıları

Credential provisioning planı GO sayılabilir, eğer:

- PostgreSQL, R2 ve Redis için ayrı credential modeli tanımlanmışsa.
- Hiçbir secret değeri belgeye veya terminale yazılmamışsa.
- R2 `GetObject` dışlama veya compensating-control şartı açıkça korunuyorsa.
- Redis exact-known-key dışında fallback gerekmiyorsa.
- SSH/Coolify kapsamı varsayılan olarak dışarıda tutulmuşsa.
- Revocation/cleanup planı her credential için yazılmışsa.

Aşağıdakilerden biri varsa NO-GO:

- Admin/broad credential kullanımı öneriliyorsa.
- Token/secret değeri dokümana, terminale veya Git'e yazılmışsa.
- R2 object body read ihtimali credential veya compensating-control ile
  kapatılmamışsa.
- Redis `SCAN`/`KEYS`/Lua/write ihtiyacı varsa.
- PostgreSQL rolü `CREATE`, `TEMP`, DML, DDL veya hedef dışı DB erişimi
  taşıyorsa.
- Runtime-topology için ayrı SSH/Coolify onayı yokken bu kapsam plana dahil
  ediliyorsa.

## 11. Bir sonraki açık onay cümleleri

Bu belge tamamlandıktan sonra bile hiçbir canlı işlem başlamaz.

Bir sonraki konuşma için anlamları dar onay cümleleri:

- `B1 credential provisioning yöntemini onaylıyorum`
  - Kullanıcı tarafından 2026-08-16 tarihinde verildi.
  - Yalnız yöntemin onayıdır; credential oluşturma veya canlı gözlem değildir.
- `B1 PostgreSQL credential provisioning başlat`
  - Yalnız PostgreSQL credential üretim rehberliğini başlatır.
- `B1 R2 credential provisioning başlat`
  - Yalnız R2 credential üretim rehberliğini başlatır.
- `B1 Redis credential provisioning başlat`
  - Yalnız Redis credential üretim rehberliğini başlatır.
- `B1 canlı salt-okunur gözleme başla`
  - Yalnız credential scope kanıtları hazırsa live observation için ayrıca
    değerlendirilebilir.
- `deploy et`
  - Yalnız tüm observation, backup/restore/rollback ve final deploy kapıları GO
    ise deployment için ayrı açık onaydır.

## 12. Onaylanan yöntem sonrası secret'sız operatör checklist'i

Bu bölüm, kullanıcı tarafından verilen `B1 credential provisioning yöntemini
onaylıyorum` cümlesi sonrasında hazırlanmıştır. Bu onay yalnız yöntemi
onaylar; aşağıdaki alt credential üretim adımlarını başlatmaz.

### 12.1 Ortak hazırlık

- Her credential ayrı üretilir; PostgreSQL/R2/Redis tek secret altında
  birleştirilmez.
- Credential değerleri Codex'e yazılmaz ve ortak rapora eklenmez.
- Operatör her credential için şu bilgileri secret'sız kayda hazırlar:
  - sistem adı,
  - kapsam özeti,
  - üretim zamanı,
  - planlanan bitiş/expire zamanı,
  - revoke/drop/disable yöntemi,
  - scope kanıtı var/yok.
- Geniş/admin credential kullanılırsa B1 provisioning GO sayılmaz.
- Credential scope kanıtları tamamlanmadan `B1 canlı salt-okunur gözleme
  başla` onayı istenmez.

### 12.2 PostgreSQL operatör checklist'i

Bu adım yalnız kullanıcı ayrıca `B1 PostgreSQL credential provisioning başlat`
derse ilerleyebilir.

- Kısa ömürlü read-only rol hazırlanır.
- Rol `LOGIN`, `NOINHERIT` ve `default_transaction_read_only = on` şartlarını
  taşır.
- Hedef production database dışında bağlantı yetkisi olmamalıdır.
- Gereken tablolar dışında `SELECT` yetkisi verilmez.
- `CREATE`, `TEMP`, DML, DDL ve riskli fonksiyon kullanımı effective-scope
  probe ile fail-closed doğrulanmalıdır.
- `statement_timeout`, `lock_timeout` ve
  `idle_in_transaction_session_timeout` bounded olmalıdır.
- Parola/connection string Codex'e yazılmaz.
- Observation bittikten sonra rol revoke/drop/disable edilir veya expire
  edildiği kanıtlanır.

### 12.3 Cloudflare R2 operatör checklist'i

Bu adım yalnız kullanıcı ayrıca `B1 R2 credential provisioning başlat` derse
ilerleyebilir.

- Hedef bucket: `aluplan-support-desk`.
- Parent token/secret collector'a verilmez.
- Tercih edilen kapsam yalnız `ListObjectsV2` ve `HeadObject`.
- Upload/delete/overwrite/lifecycle/object body read yoktur.
- Cloudflare token modeli `GetObject`'i credential seviyesinde kesin
  dışlayamıyorsa:
  - bucket-scoped read-only token tek başına GO kanıtı sayılmaz,
  - collector'ın yalnız allowlist çağrıları yaptığını gösteren invocation/audit
    kanıtı gerekir,
  - ayrıca kullanıcıdan compensating-control onayı gerekir.
- Token değeri Codex'e yazılmaz.
- Observation bittikten sonra token revoke/expire edilir.

### 12.4 Redis/BullMQ operatör checklist'i

Bu adım yalnız kullanıcı ayrıca `B1 Redis credential provisioning başlat` derse
ilerleyebilir.

- Credential yalnız dokuz kanonik BullMQ queue'nun exact-known-key okumasına
  izin vermelidir.
- `SCAN`, `KEYS`, Lua, write komutları ve BullMQ mutating helper'ları yasaktır.
- Queue depth, active/delayed/failed/repeatable state bounded okunmalıdır.
- Fallback `SCAN` gerekirse default B1 scope NO-GO olur ve ayrı privacy/scope
  onayı gerekir.
- Existing broad Redis credential B1 Redis GO kanıtı sayılmaz.
- Observation bittikten sonra ACL user/token revoke/disable edilir.

### 12.5 Bu yöntem onayından sonra hâlâ kapalı olan işler

- PostgreSQL credential üretim rehberliği:
  - Kullanıcı tarafından 2026-08-16 tarihinde `B1 PostgreSQL credential
    provisioning başlat` cümlesiyle başlatıldı.
  - Gerçek production rol oluşturma/değiştirme/silme ve Codex production
    bağlantısı hâlâ **NO-GO**; yapılan geçici deneme ve cleanup sonucu için
    bkz. §14.8.
- R2 credential üretimi: **NO-GO** until
  `B1 R2 credential provisioning başlat`
- Redis credential üretimi: **NO-GO** until
  `B1 Redis credential provisioning başlat`
- B1 concrete transports: **NO-GO**
- B1 live observation: **NO-GO**
- Runtime-topology/SSH/Coolify: **NO-GO**
- Production deploy: **NO-GO**

## 13. Bu belgenin sonucu

Bu belge credential provisioning yöntemini planlar ve kullanıcı tarafından
yöntem düzeyinde onaylanmıştır; credential oluşturmaz.

- Credential provisioning yöntemi: **APPROVED**
- PostgreSQL credential üretim rehberliği: **STARTED**
- PostgreSQL gerçek production rol oluşturma/değiştirme/silme: **NO-GO**
  (geçici deneme ve cleanup sonucu için bkz. §14.8)
- R2/Redis credential provisioning alt adımları: **NO-GO**
- B1 concrete transports: **NO-GO**
- B1 live observation: **NO-GO**
- Runtime-topology/SSH/Coolify: **NO-GO**
- Production deploy: **NO-GO**

Bu belge oluşturulurken production PostgreSQL, Redis, Cloudflare R2, SSH,
Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya
yazılmadı; migration, seed, queue/object/Redis/DB mutation, push, tag-push veya
deploy yapılmadı.

## 14. PostgreSQL provisioning rehberi

Bu bölüm, kullanıcının `B1 PostgreSQL credential provisioning başlat`
cümlesi sonrasında hazırlanmıştır. Bu cümle yalnız PostgreSQL credential
üretim rehberliğini başlatır; Codex'in production PostgreSQL'e bağlanmasına,
rol oluşturmasına, parola okumasına/yazmasına, backup almasına, live
observation başlatmasına veya deploy yapmasına yetki vermez.

### 14.1 Hedef

Operatörün hazırlayacağı credential, yalnız A.1.4-B1 PostgreSQL envanter
gözleminde kullanılacak kısa ömürlü bir read-only roldür.

Bu rolün beklenen sözleşmesi:

- `LOGIN`, `NOINHERIT`.
- `default_transaction_read_only = on`.
- `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`,
  `NOBYPASSRLS`.
- Üyelik yok; başka rolden privilege inherit etmez.
- Hedef production database dışında `CONNECT`, `CREATE` veya `TEMPORARY`
  yetkisi yok.
- Hedef database içinde yalnız `public` schema için `USAGE`; `CREATE` yok.
- Yalnız şu dört tablo için `SELECT`:
  - `public."_prisma_migrations"`
  - `public.attachments`
  - `public.knowledge_sources`
  - `public.settings`
- Sequence, view/materialized-view/foreign-table, column-level grant, DML/DDL,
  `TEMP`, schema create veya non-system function execute yok.

### 14.2 Operatör rol oluşturma şablonu

Bu şablon **Codex tarafından çalıştırılmayacaktır**. Operatör production
PostgreSQL admin/owner oturumunda, secret değerleri chat'e yazmadan kendi
ortamında uyarlamalıdır.

```sql
-- PLACEHOLDER ONLY — do not paste real password or connection string into chat.
-- Replace these locally in the operator session:
--   <ROLE_NAME>          e.g. a14b_inventory_ro_20260816
--   <TARGET_DATABASE>    production application database name
--   <EXPIRES_AT_UTC>     ISO-8601 UTC timestamp, no more than 24h ahead
--   <PASSWORD_LOCAL>     generated locally, never shared with Codex

CREATE ROLE <ROLE_NAME>
  WITH
  LOGIN
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  PASSWORD '<PASSWORD_LOCAL>'
  VALID UNTIL '<EXPIRES_AT_UTC>';

ALTER ROLE <ROLE_NAME> SET default_transaction_read_only = on;

GRANT CONNECT ON DATABASE <TARGET_DATABASE> TO <ROLE_NAME>;
GRANT USAGE ON SCHEMA public TO <ROLE_NAME>;
GRANT SELECT ON TABLE
  public."_prisma_migrations",
  public.attachments,
  public.knowledge_sources,
  public.settings
TO <ROLE_NAME>;
```

Önemli PostgreSQL nüansı: `VALID UNTIL` parola geçerliliğini sınırlar; rolün
tüm erişimini tek başına kalıcı biçimde kapatmaz. Bu yüzden observation sonrası
revoke/drop/disable kanıtı ayrıca gereklidir.

### 14.3 Effective-scope probe zorunluluğu

Rol oluşturulduktan sonra B1 canlı gözlem başlamadan önce, aynı rol ile
effective privilege probe yapılmalıdır. Probe sonucu secret içermemelidir ve
yalnız şu sonucu raporlamalıdır:

- role adı beklenen role adı mı,
- expiry beklenen timestamp ile birebir mi,
- expiry observation anından sonra ve en fazla 24 saat içinde mi,
- `NOINHERIT`, `LOGIN`, `default_transaction_read_only=on` koşulları sağlandı
  mı,
- membership sayısı `0` mı,
- hedef dışı database `CONNECT/CREATE/TEMPORARY` görünmüyor mu,
- hedef database için `CONNECT=true`, `CREATE=false`, `TEMPORARY=false` mı,
- `public` schema için `USAGE=true`, `CREATE=false` mı,
- non-system function execute satırı `0` mı,
- column-level grant satırı `0` mı,
- relation grantleri tam olarak dört tablo ve sadece `SELECT` mi.

Bu probe A.1.4-B0 PostgreSQL adapter sözleşmesindeki exact allowlist ile uyumlu
olmalıdır; ekstra SQL, object-reference okuma veya full collector çalıştırma
değildir.

### 14.4 Fail-closed duruş noktaları

Aşağıdaki durumlardan biri görülürse PostgreSQL credential scope **NO-GO**
sayılır ve B1 live observation istenmez:

- Rol admin/superuser/createdb/createrole/replication/bypassrls yetkisi taşıyor.
- Rol bir başka role member olarak bağlı.
- `rolvaliduntil` yok, geçmişte, 24 saatten uzun veya beklenen timestamp ile
  birebir değil.
- `default_transaction_read_only=on` yok.
- Hedef dışı database için `CONNECT`, `CREATE` veya `TEMPORARY` görünüyor.
- Hedef database için `TEMPORARY=true` görünüyor.
- `public` schema dışında schema privilege görünüyor veya `public.CREATE=true`.
- Dört gerekli tablo dışında relation grant var.
- Dört gerekli tablodan biri view/materialized-view/foreign-table/sequence gibi
  beklenmeyen relkind ile görünüyor.
- DML/DDL/column grant/non-system function execute görünüyor.
- Production ortamında `PUBLIC` üzerinden gelen geniş `CONNECT`/`TEMP`
  varsayılanları role sızıyorsa.

`PUBLIC` varsayılan privilege'lerini veya production database-wide ayarlarını
değiştirmek geniş etkilidir. Böyle bir ihtiyaç doğarsa bu PostgreSQL
credential provisioning rehberinin kapsamı durur; ayrı risk analizi ve ayrı
açık kullanıcı onayı gerekir.

### 14.5 Operatörün Codex'e bildirebileceği secret'sız çıktı

Operatör gerçek parolayı, connection string'i, host'u veya secret değeri
paylaşmadan yalnız şu formatta özet dönebilir:

```text
PostgreSQL B1 role prepared: yes/no
Role name: <non-secret role name>
Expiry: <ISO timestamp>
Effective-scope probe: PASS/NO-GO
NO-GO reason category if any: role-attribute | membership | db-privilege |
schema-privilege | relation-grant | column-grant | function-grant |
public-default | expiry | other
Revoke/drop plan prepared: yes/no
```

Bu özet PASS olsa bile `B1 canlı salt-okunur gözleme başla` onayı verilmiş
sayılmaz. PostgreSQL credential scope kanıtı yalnız sonraki live-observation
kararına girdi sağlar.

### 14.6 Revoke/drop planı

Observation tamamlandıktan veya iptal edildikten sonra rol kaldırılmalı ya da
erişimi devre dışı bırakılmalıdır. Operatör aşağıdaki gibi bir rollback planı
hazırlamalıdır; gerçek role adı ve üretim bağlantısı Codex'e yazılmaz.

```sql
-- PLACEHOLDER ONLY — operator runs locally if/when cleanup is approved.
REVOKE SELECT ON TABLE
  public."_prisma_migrations",
  public.attachments,
  public.knowledge_sources,
  public.settings
FROM <ROLE_NAME>;

REVOKE USAGE ON SCHEMA public FROM <ROLE_NAME>;
REVOKE CONNECT ON DATABASE <TARGET_DATABASE> FROM <ROLE_NAME>;
DROP ROLE <ROLE_NAME>;
```

Drop öncesi role bağlı beklenmeyen ownership/default privilege görülürse cleanup
durur ve ayrı inceleme gerekir. Cleanup tamamlanmadan deploy kapısı açılmaz.

### 14.7 Rehber hazırlandığı andaki sonuç

Kullanıcının `B1 PostgreSQL credential provisioning başlat` cümlesiyle
PostgreSQL credential üretim rehberliği başlamıştır; ancak bu belgeyi
ilk güncelleme sırasında:

- Production PostgreSQL'e bağlanılmadı.
- Rol oluşturulmadı, değiştirilmedi veya silinmedi.
- Parola, token, connection string veya endpoint okunmadı/yazılmadı.
- Backup, live observation, migration, seed, queue/object/Redis/DB mutation,
  SSH/Coolify/SharePoint erişimi, push, tag-push veya deploy yapılmadı.

PostgreSQL credential'ın gerçekten oluşturulması kullanıcı/operatör tarafında
ayrı bir production write işlemidir. Scope probe PASS kanıtı gelmeden ve
kullanıcı ayrıca `B1 canlı salt-okunur gözleme başla` demeden canlı gözlem
başlatılamaz.

### 14.8 Gerçek deneme sonucu

Bu bölüm, §14.7'deki rehber hazırlandıktan sonra kullanıcı tarafından verilen
dar production-write onayıyla yapılan gerçek provisioning denemesini kaydeder.

Kullanıcı şu onayı verdi:

```text
Production PostgreSQL üzerinde yalnız B1 için geçici read-only rol oluşturmanı
onaylıyorum; parola/connection string değerlerini okuma, yazma veya rapora
geçirme.
```

Bu onay yalnız geçici B1 PostgreSQL read-only rol denemesini kapsadı; B1 live
observation, production backup, runtime-topology/SSH/Coolify erişimi veya deploy
onayı olarak yorumlanmadı.

Deneme özeti:

- Production database bağlamı `postgres` olarak doğrulandı.
- Başlangıç kontrolünde `a14b_inventory_ro_20260816` rolü yoktu
  (`role_exists = f`).
- Dört hedef tablo mevcuttu:
  - `public."_prisma_migrations"`
  - `public.attachments`
  - `public.knowledge_sources`
  - `public.settings`
- Geçici rol oluşturuldu:
  - Role name: `a14b_inventory_ro_20260816`
  - Expiry: `2026-08-16T23:59:00.000Z`
  - `LOGIN`, `NOINHERIT`
  - `default_transaction_read_only=on`
  - Yalnız dört hedef tabloya `SELECT` grant'i
- Parola kullanıcı/operatör tarafından `\password` ile girildi; değer Codex'e
  yazılmadı, okunmadı veya rapora eklenmedi.

Effective-scope probe sonucu: **NO-GO**.

NO-GO gerekçeleri:

- Database privilege çıktısı beklenenden genişti:
  - `aluplan_support | can_connect=t | can_temporary=t`
  - `postgres | can_connect=t | can_temporary=t`
  - `template1 | can_connect=t | can_temporary=f`
- Ekran/pager çıktısında public/pgvector function execute satırları görüldü
  (`array_to_vector`, `halfvec_*`, `cosine_distance` vb.).
- Relation grants kısmı dört hedef tablo için beklenen dar kapsamdaydı:
  - dört satır,
  - `relkind = r`,
  - `can_read = t`,
  - `can_write = f`.

NO-GO sonucundan sonra cleanup yapıldı:

- `REVOKE SELECT ...`
- `REVOKE USAGE ON SCHEMA public ...`
- `REVOKE CONNECT ON DATABASE postgres ...`
- `DROP ROLE a14b_inventory_ro_20260816`
- `COMMIT`

Final cleanup doğrulaması:

```text
role_exists = f
```

Yani geçici rol production'da kalmadı.

Bu deneme sonucunda B1 live observation başlatılmadı. Production backup,
runtime-topology/SSH/Coolify gözlemi, Redis/R2 credential provisioning,
migration, seed, queue/object/Redis veri mutasyonu, deploy, push veya tag-push
yapılmadı.

Sıradaki güvenli karar, PostgreSQL credential stratejisinin bu `PUBLIC`/pgvector
privilege gerçekliği altında nasıl değişeceğini tasarlamaktır. Production-wide
`PUBLIC` privilege revocation gibi geniş etkili değişiklikler bu denemenin ve
bu belgenin mevcut onay kapsamı dışındadır.
