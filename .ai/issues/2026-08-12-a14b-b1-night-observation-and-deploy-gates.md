# A.1.4-B1 Night Observation and Deploy Gates

Tarih: 2026-08-12
Durum: **NIGHT PLAN / LIVE READ-ONLY REQUIRES EXPLICIT APPROVAL / DEPLOY NO-GO**

Bu belge bu gece uygulanacak güvenli sırayı tanımlar. Amaç canlıya zarar
vermeden önce salt-okunur production gözlem kapısını hazırlamak, sonucuna göre
backup/restore/rollback ve ancak ayrıca onaylanırsa deploy kararına geçmektir.

Bu belge tek başına production erişimi, credential provisioning veya deploy
yetkisi vermez.

## 1. Mevcut güvenli başlangıç noktası

- A.1.4-B1 preflight dokümantasyon planı kapandı.
- Commit: `454f6693` — `docs(release): close A14B B1 live observation preflight plan`.
- Restore evidence commit: `e921851b` — `docs(release): record A14B B1 preflight restore point`.
- Annotated restore tag: `restore/post-release-a14b-b1-preflight-20260812-454f6693`.
- Verified bundle SHA-256:
  `c708dbeb8feefa56be3807504694ae24b126401e3c294a12ab7e3757db18aeee`.

Hâlâ NO-GO:

- B1 concrete transports.
- Credential provisioning.
- Live observation.
- Runtime-topology/SSH/Coolify access.
- Production deploy.

## 2. Bu gece için güvenli karar modeli

Bu gece deploy otomatik hedef değildir. Deploy yalnız aşağıdaki kapılar sırayla
yeşil olursa ayrıca değerlendirilebilir:

```text
Credential planı
    ↓
B1 live read-only observation
    ↓
Observation GO/NO-GO
    ↓
Backup/restore/rollback hızlı kanıt kontrolü
    ↓
Final deploy GO/NO-GO
    ↓
Ayrı açık "deploy et" onayı
```

Her kapı kendi başına durdurucu olabilir. Bir kapı NO-GO ise sonraki kapıya
geçilmez.

## 3. Onay ayrımı

Aşağıdaki onaylar birbirinden bağımsızdır:

1. **Credential preparation approval**
   - Kısa ömürlü credential'ların nasıl üretileceğini konuşma/onaylama.
   - Bu onay canlı collector çalıştırma anlamına gelmez.

2. **B1 live read-only observation approval**
   - PostgreSQL/R2/Redis metadata okumaları için ayrı açık onay.
   - Bu onay deploy anlamına gelmez.

3. **Runtime-topology approval**
   - SSH/Coolify read-only runtime topology gözlemi gerekiyorsa ayrıca açık
     onay.
   - Genel B1 onayı bunu kapsamaz.

4. **Deploy approval**
   - Tüm gözlem ve rollback kapıları yeşil olsa bile ayrıca açık "deploy et"
     onayı gerekir.

## 4. Credential hazırlık checklist'i

Credential değerleri bu belgeye, terminal çıktısına veya Git'e yazılmayacaktır.

### 4.1 PostgreSQL

Hazırlanacak şey:

- Kısa ömürlü read-only rol.
- `LOGIN`, `NOINHERIT`.
- `default_transaction_read_only = on`.
- Hedef dışı database bağlantısı yok.
- Gereken tablolar için yalnız `SELECT`.
- Bounded `statement_timeout`, `lock_timeout`,
  `idle_in_transaction_session_timeout`.
- Collector tüm sorguları exact allowlist üzerinden yürütür.
- Transaction seviyesi `REPEATABLE READ READ ONLY` olmalıdır.
- Her durumda `ROLLBACK` denenmelidir.
- `CREATE`, `TEMP`, DML, DDL ve riskli fonksiyon kullanımı olmamalıdır.

GO kriteri:

- Etkili privilege scope collector tarafından doğrulanabilir.
- Fazla privilege varsa B1 observation başlamaz.

### 4.2 Cloudflare R2

Hazırlanacak şey:

- Production application bucket: `aluplan-support-desk`.
- Parent token collector dışında kalır.
- Hedef yalnız metadata: `ListObjectsV2` + `HeadObject`.
- `GetObject` credential seviyesinde dışlanamıyorsa compensating control gerekir:
  collector invocation audit log + ayrı kullanıcı onayı.

GO kriteri:

- Object body read yapılmayacağı hem credential scope veya compensating control
  ile kanıtlanır.
- Ham object key kalıcı evidence'a yazılmaz.

### 4.3 Redis / BullMQ

Hazırlanacak şey:

- Dokuz kanonik queue için exact-known-key okuma.
- `SCAN`, `KEYS`, Lua ve write komutları yok.
- Queue state hareketliyse diagnostic artifact üretilebilir ama deploy kapısı
  açılmaz.
- `StalledJobRecoveryService` gibi in-process timer kaynakları runtime gözlemde
  ayrı sınıflandırılmalıdır.

GO kriteri:

- Beklenmeyen queue/key erişim ihtiyacı yok.
- Moving-target state açıkça sınıflandırılır.

### 4.4 SSH/Coolify runtime topology

Varsayılan:

- Bu gece ilk B1 temel gözlemde SSH/Coolify runtime topology kapsam dışında
  tutulur.

Eğer runtime topology kanıtı istenirse:

- Ayrı açık onay gerekir.
- Sadece read-only gözlem yapılır.
- Komut seti önceden listelenmeden çalıştırma yok.

## 5. Önerilen gece akışı

### Faz 0 — Şimdi / hazırlık

- Çalışma ağacı temizliği doğrulanır.
- Son commit/tag/bundle kanıtı doğrulanır.
- Credential üretim yöntemi kararlaştırılır.
- Hiçbir credential değeri yazılmaz veya ekrana basılmaz.

### Faz 1 — Düşük trafik penceresi

- Kullanıcı açıkça "B1 canlı salt-okunur gözleme başla" derse başlanır.
- PostgreSQL/R2/Redis salt-okunur observation çalışır.
- Moving-target veya blocker varsa deploy konuşulmaz.

### Faz 2 — Observation değerlendirmesi

GO için:

- Migration ledger temiz.
- R2 list+head manifest eksiksiz.
- DB↔R2 missing blocker yok.
- Local-volume parity gerekiyorsa ayrı manifest mevcut.
- Redis/BullMQ state anlaşılır.
- Evidence private, no-clobber, `READY.json` sadece ready durumda.
- `productionGo:false` korunur.

NO-GO için:

- Fazla credential scope.
- Missing R2 object.
- Local-volume referansı var ve ayrı onaylı manifest yoksa.
- Belirsiz Redis/queue state.
- Moving-target drift.
- Runtime-topology kanıtı istenip ayrı SSH/Coolify onayı yoksa.
- Raw secret/key sızıntısı.

### Faz 3 — Backup/restore/rollback hızlı kapısı

B1 observation GO olsa bile deploy'dan önce:

- En güncel backup varlığı doğrulanmalı.
- Restore/bundle/recovery kanıtları güncel olmalı.
- Rollback hedefi, commit/tag ve image bilgisi net olmalı.
- Migration bekleyen set ve fail-closed runbook tekrar kontrol edilmeli.

Bu kapı geçmeden deploy yok.

### Faz 4 — Final deploy kararı

Deploy yalnız şu cümleyle ayrı onaylanır:

```text
deploy et
```

"Her şey yolundaysa deploy bile yaparız" ifadesi niyet beyanıdır; deploy
onayı değildir.

## 6. Gece penceresi önerisi

Canlı sistemde bilet açılabildiği ve dosya yüklenebildiği için exact parity
iddiası düşük trafik saatinde alınmalıdır.

Öneri:

- İlk B1 read-only observation: gece geç saat / düşük trafik.
- Deploy değerlendirmesi: yalnız B1 + backup/restore/rollback GO sonrası.
- Deploy olursa: ayrı "deploy et" onayıyla, rollback hazırken.

## 7. Bu belgenin sonucu

Bu belge güvenli gece sırasını kilitler.

- Credential provisioning: **NO-GO until explicit approval**
- B1 concrete transports: **NO-GO until explicit approval**
- B1 live observation: **NO-GO until explicit approval**
- Runtime-topology/SSH/Coolify: **NO-GO until separate explicit approval**
- Production deploy: **NO-GO until explicit `deploy et` approval**

Bu belge oluşturulurken production PostgreSQL, Redis, Cloudflare R2, SSH,
Coolify veya SharePoint'e bağlanılmadı; credential/token/secret okunmadı veya
yazılmadı; migration, seed, queue/object/Redis/DB mutation, push, tag-push veya
deploy yapılmadı.
