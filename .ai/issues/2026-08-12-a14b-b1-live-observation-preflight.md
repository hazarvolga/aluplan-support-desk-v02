# A.1.4-B1 Live Observation Preflight Plan

Tarih: 2026-08-12
Durum: **PRE-FLIGHT ONLY / LIVE NO-GO / PRODUCTION DEPLOY NO-GO**

Bu belge A.1.4-B0 offline collector çekirdeği kapandıktan sonra, canlı sistemlere
yaklaşmadan önce kilitlenecek güvenli B1 gözlem protokolünü tanımlar. Bu belge
bir uygulama veya çalıştırma talimatı değildir; production PostgreSQL, Redis,
Cloudflare R2, SSH, Coolify veya SharePoint erişimi yetkilendirmez.

## 1. Mevcut durum

- A.1.4-B0 offline collector core ve takip hardening kapandı.
- B0-1 üzerinden B0-7 dahil local/offline hardening commit'lendi.
- B0-3 annotated restore point ve complete-history bundle ile kapandı.
- B1 concrete transports, credential provisioning, live observation ve deploy
  hâlâ **NO-GO**.

Kanonik son yerel kapanış:

- Commit: `219d1142` — `fix(release): close A14B B0-1 and low hardening findings`
- Restore tag: `restore/post-release-a14b-b0-hardening-20260812-219d1142`
- Tag türü: annotated `tag`
- Bundle: `.private-data/restore-points/post-release-a14b-b0-hardening-20260812-219d1142.bundle`
- Bundle SHA-256: `bbbb9a9636208ca2b81dab0a9ddd1f02c884825d587bb2b8101ad0bdf191554e`

## 2. B1'in amacı

B1'in amacı canlı deployment'a müdahale etmek değil, canlı sistemlerin salt-okunur
durumunu kanıtlanabilir ve geri dönülebilir biçimde gözlemlemektir:

1. Production migration ledger durumunu okumak.
2. DB'deki object reference setini R2 metadata manifestiyle karşılaştırmak.
3. Redis/BullMQ queue ve repeatable-job durumunu exact-known-key sözleşmesiyle
   okumak.
4. Runtime cron/timer/replica tekilliği için gözlem kanıtını hazırlamak.
   Bu gözlem yalnız ayrıca onaylanmış SSH/Coolify read-only erişim kapsamıyla
   yapılabilir; genel B1 canlı gözlem onayı bunu kapsamaz.
5. Local uploads veya storage fallback yüzeyi varsa bunu ayrı adapter/manifest
   olarak raporlamak.

B1 başarılı olsa bile production deploy yetkilendirmez. B1 yalnız canlı durum
kanıtı üretir.

## 3. Kesin sınırlar

Aşağıdakiler açık kullanıcı onayı olmadan yasaktır:

- Production PostgreSQL'e bağlanmak.
- Production Redis'e bağlanmak.
- `aluplan-support-desk` application R2 bucket'ını canlı okumak.
- Cloudflare, Coolify, SSH veya SharePoint üzerinde credential veya ayar
  değiştirmek.
- Migration, seed, deploy, restart, queue mutation, Redis mutation, object
  upload/download/delete veya database write yapmak.
- Secret, token, parola veya connection string değerlerini belgeye veya terminal
  çıktısına yazmak.
- Push, tag-push veya deploy yapmak.

B1 canlı gözlem için ayrıca açık bir "B1 canlı salt-okunur gözleme başla" onayı
gerekecektir.

## 4. Credential protokolü

Her sistem için ayrı, kısa ömürlü ve yalnız gereken yetkiye sahip credential
kullanılmalıdır. Tek bir süreç veya dosya tüm production credential'larını
kalıcı olarak taşımamalıdır.

### 4.1 PostgreSQL

Gerekli özellikler:

- Kısa ömürlü read-only rol.
- `default_transaction_read_only = on`.
- `LOGIN`, `NOINHERIT`.
- Hedef database dışı bağlantı yetkisi olmamalı.
- Gereken tablolar için yalnız `SELECT`.
- `CREATE`, `TEMP`, DML, DDL ve riskli fonksiyon kullanımı olmamalı.
- Collector tüm sorguları exact allowlist üzerinden yürütmeli.
- Transaction seviyesi `REPEATABLE READ READ ONLY` olmalı.
- Bounded `statement_timeout`, `lock_timeout` ve
  `idle_in_transaction_session_timeout` uygulanmalı.
- Her durumda `ROLLBACK` denenmeli.

Başarısızlık durumları:

- Beklenmeyen privilege genişliği.
- Failed/contradictory/unknown migration ledger satırı.
- Ledger checksum/marker sapması.
- Timeout, abort veya rollback belirsizliği.

### 4.2 Cloudflare R2

Hedef bucket:

- Production application bucket: `aluplan-support-desk`

Gerekli özellikler:

- Parent secret collector'a verilmemeli.
- Collector yalnız action-scoped child credential almalı.
- İzin verilen eylemler yalnız:
  - `ListObjectsV2`
  - `HeadObject`
- Object body okuması, upload, delete ve overwrite yasaktır.
- Pagination tamamlanmadan manifest tamamlanmış sayılamaz.
- Her listelenen key için HEAD metadata doğrulanmalıdır.
- Raw object key kalıcı evidence'a yazılmamalı; HMAC/fingerprint kullanılmalıdır.
- Cloudflare token API'si `GetObject`'i credential seviyesinde dışlayamıyorsa,
  bucket-scoped read-only token tek başına yeterli kanıt sayılmaz. Bu durumda
  collector'ın yalnız allowlist çağrıları yaptığının audit-log kanıtı ve ayrı
  kullanıcı onayı compensating control olarak gereklidir.

Başarısızlık durumları:

- `GetObject`, `PutObject`, `DeleteObject` veya gövde okuma yetkisi.
- Pagination belirsizliği.
- List/HEAD metadata uyuşmazlığı.
- Bucket identity belirsizliği.

### 4.3 Redis / BullMQ

Gerekli özellikler:

- `SCAN`, `KEYS`, Lua, write komutları ve BullMQ mutating helper'ları yasaktır.
- Sadece dokuz kanonik queue için exact-known-key okumaları yapılmalıdır.
- Queue depth, active/delayed/failed/repeatable job bilgileri bounded biçimde
  okunmalıdır.
- `StalledJobRecoveryService` gibi in-process timer kaynakları runtime gözlemde
  ayrı sınıflandırılmalıdır.

Başarısızlık durumları:

- Beklenmeyen queue adı.
- Fallback SCAN ihtiyacı.
- Redis credential scope'unun exact-known-key sözleşmesini aşması.
- Aktif veya hareketli queue state'i nedeniyle bounded observation drift.

## 5. Observation window

Canlı sistem hareketli olduğu için tek snapshot production GO kanıtı değildir.
B1 gözlemi şu modeli kullanmalıdır:

1. Redis-before
2. R2-before
3. PostgreSQL-before
4. R2-after
5. PostgreSQL-after
6. Redis-after
7. Pure reconcile
8. Closed evidence publish

Her alt sistem için before/after digest farkı varsa sonuç:

- `ready:false`
- `productionGo:false`
- `status:moving-target`

Bu durumda artifact üretilebilir, fakat `READY.json` yazılmamalıdır.

## 6. Evidence hedefi

Canlı B1 gözlemi onaylandığında kanıtlar yalnız Git dışı private alana
yazılmalıdır:

```text
.private-data/release-evidence/a14b-production-inventory/<run-id>/
```

Kurallar:

- Dizinler `0700`.
- Dosyalar `0600`.
- No-clobber.
- Symlink ve path traversal reddi.
- Atomic publish.
- `READY.json` en son ve yalnız gerçekten ready ise.
- Secret/raw-key scanner pass etmeden publish yok.
- Evidence içinde `productionGo:false` sabit kalmalı.

## 7. Object parity sınıfları

B1 raporu en az şu setleri üretmelidir:

- DB referanslı ve R2'de bulunan object fingerprint'leri.
- DB referanslı ama R2'de bulunamayan object fingerprint'leri.
- R2'de bulunan ama DB'de referansı olmayan object fingerprint'leri.
- Ambiguous/local-volume/FAILED marker sınıfları.

Karar:

- DB referansı olup R2'de olmayan production object: **blocker**.
- R2 orphan: ilk aşamada report-only; silme yok.
- Local-volume sınıfı: ayrı onaylı adapter/manifest olmadan full parity GO vermez.
- Ambiguous reference: fail-closed, manuel inceleme gerekir.

## 8. Gece / bakım penceresi kararı

Canlı sistem çalışırken bilet açılabildiği ve dosya yüklenebildiği için exact
parity iddiası en güvenli şekilde düşük trafik veya bakım penceresinde alınır.

Önerilen operasyon sırası:

1. Gündüz: B1 preflight dokümanı ve credential planı tamamlanır.
2. Gündüz: Claude/Codex bağımsız doğrulaması alınır.
3. Gece/düşük trafik: kullanıcı açık onayıyla salt-okunur live observation
   çalıştırılır.
4. Çıktı moving-target ise deploy'a geçilmez; artifact teşhis için kullanılır.
5. Çıktı stable ve tüm blocker setleri temizse bir sonraki backup/restore ve
   cutover kapılarına geçilir.

## 9. B1 GO/NO-GO kapıları

B1 live observation yalnız aşağıdakilerin tamamı sağlanırsa GO sayılabilir:

- Credential scope kanıtı geçerli.
- PostgreSQL ledger exact ve failed/contradictory/unknown satır yok.
- R2 list+head manifest eksiksiz.
- Redis/BullMQ exact-known-key envanteri tamam.
- Runtime-topology kanıtı gerekiyorsa ayrı onaylı SSH/Coolify read-only erişim
  kapsamıyla sağlanmış.
- R2 credential scope'u `GetObject`'i credential seviyesinde dışlayamıyorsa,
  collector'ın yalnız allowlist çağrıları yaptığını gösteren audit-log
  compensating control kanıtı mevcut ve kullanıcı bunu ayrıca onaylamış.
- Before/after snapshotlar stable.
- DB↔R2 missing blocker yok.
- Local-volume parity gerekiyorsa ayrı manifest mevcut.
- Evidence private/no-clobber/READY-last kurallarına uyuyor.
- Secret/raw object key evidence'a yazılmamış.

Aşağıdakilerden biri varsa B1 **NO-GO**:

- Credential scope fazla geniş.
- Runtime-topology kanıtı gerekiyor ve ayrı SSH/Coolify read-only onayı yok.
- R2 credential scope'u `GetObject`'i dışlayamıyor ve compensating-control
  audit kanıtı veya ayrı kullanıcı onayı yok.
- Hareketli sistem drift'i.
- Eksik R2 object.
- Belirsiz Redis queue state'i.
- Raw secret/key evidence sızıntısı.
- Artifact publish belirsizliği.
- Kullanıcıdan açık live observation onayı yok.

## 10. Bu belgenin sonucu

Bu belge yalnız preflight planıdır.

- B1 concrete transports: **NO-GO**
- Credential provisioning: **NO-GO**
- Live observation: **NO-GO**
- Production deploy: **NO-GO**

Sıradaki güvenli adım, bu preflight planını bağımsız olarak Claude'a doğrulatmak
ve ancak ondan sonra B1 için hangi credential ve gözlem yönteminin kullanılacağına
ayrı bir onayla karar vermektir.
