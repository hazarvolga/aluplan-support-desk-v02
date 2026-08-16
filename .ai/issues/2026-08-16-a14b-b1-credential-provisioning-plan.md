# A.1.4-B1 Credential Provisioning Plan

Tarih: 2026-08-16
Durum: **PLAN ONLY / CREDENTIAL PROVISIONING NO-GO / LIVE OBSERVATION NO-GO / DEPLOY NO-GO**

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

## 12. Bu belgenin sonucu

Bu belge credential provisioning yöntemini planlar; credential oluşturmaz.

- Credential provisioning: **NO-GO**
- B1 concrete transports: **NO-GO**
- B1 live observation: **NO-GO**
- Runtime-topology/SSH/Coolify: **NO-GO**
- Production deploy: **NO-GO**

Bu belge oluşturulurken production PostgreSQL, Redis, Cloudflare R2, SSH,
Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya
yazılmadı; migration, seed, queue/object/Redis/DB mutation, push, tag-push veya
deploy yapılmadı.
