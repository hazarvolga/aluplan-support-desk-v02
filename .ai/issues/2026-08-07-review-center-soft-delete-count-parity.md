# Görev Merkezi Soft-Delete Sayaç / Liste Paritesi

## Belge durumu

- Tarih: 2026-08-07
- Durum: Bağımsız ikinci inceleme bekleniyor
- Sahibi: Codex ilk inceleme; Claude bağımsız karşı inceleme
- Çalışma sınırı: Yalnız yerel ve salt-okunur inceleme
- Uygulama kararı: Alınmadı
- Kod, migration, seed veya veri değişikliği: Yapılmadı
- Push, deploy, production erişimi veya dış entegrasyon çağrısı: Yapılmadı
- İncelenen başlangıç HEAD'i: `8c65224f`

Bu belge bir uygulama kaydı değildir. Amaç, aynı sorunun iki bağımsız inceleyici tarafından kaynak kod ve yerel kanıt üzerinden araştırılması; bulgular karşılaştırılmadan çözüm geliştirmesine başlanmamasıdır.

## 1. Kullanıcı tarafından gözlenen davranış

Görev ve Onay Merkezi içindeki **Canlı sohbet bekleyen müşteriler** kartı `1` bekleyen iş gösteriyor.

Kartın hedefi:

```text
/tickets?chatStatus=REQUESTED&activeOnly=true
```

Hedef bilet sayfası açıldığında liste boş görünüyor. Beklenen sözleşme:

```text
Görev Merkezi kart sayısı == hedef listenin toplam aktif kayıt sayısı
```

Bu eşitlik mevcut yerel gözlemde sağlanmıyor:

```text
Kart: 1
Liste: 0
```

## 2. Çalışma ortamı ve gölge DB sınırı

İnceleme sırasında frontend ve backend yerel olarak çalışıyor. Kontrol edilen yerel env dosyalarının tamamı aynı PostgreSQL hedefini gösterdi:

```text
host: localhost
port: 55433
database: aluplan_support
```

Bu nedenle gözlenen `1 / 0` farkı, frontend ve backend'in iki farklı yerel DB'ye bağlanmasıyla açıklanamıyor.

Kullanılan veri production'dan türetilmiş yerel gölge veridir. Gölge DB, canlıdaki güncel bekleyen kayıtların lokalde bulunmamasını açıklayabilir; ancak aynı yerel veri üzerinde çalışan kart ve hedef listenin farklı sonuç vermesini tek başına açıklamaz.

Bu incelemede gölge DB'ye yalnız salt-okunur sorgular yapıldı. Kayıt eklenmedi, güncellenmedi veya silinmedi. Production DB'ye bağlanılmadı.

## 3. Kaynak kod sözleşmesi

### 3.1 Görev Merkezi canlı sohbet sayacı

Dosya:

```text
apps/backend/src/review-center/review-center.service.ts:83-98
```

Sayaç şu koşulları uyguluyor:

```ts
{
  chatStatus: REQUESTED,
  status: { notIn: [RESOLVED, CLOSED] }
}
```

Sorguda açık bir `deletedAt: null` koşulu bulunmuyor. Sayaç, `PrismaService` global soft-delete extension'ının bu koşulu eklemesine güveniyor.

### 3.2 Hedef bilet listesi

Dosya:

```text
apps/backend/src/tickets/tickets.service.ts:231-263
```

Hedef liste şu koşulları birlikte uyguluyor:

```ts
{
  chatStatus: REQUESTED,
  status: { notIn: [RESOLVED, CLOSED] },
  deletedAt: null
}
```

Dolayısıyla hedef liste soft-delete edilmiş bileti açık biçimde dışlıyor.

### 3.3 Frontend deep-link aktarımı

Dosyalar:

```text
apps/frontend/src/components/review-center/deep-link-filters.ts
apps/frontend/src/app/[locale]/(dashboard)/tickets/TicketsClient.tsx:88-125
```

Frontend aşağıdaki parametreleri backend'e gönderiyor:

```text
chatStatus=REQUESTED
activeOnly=true
```

Deep-link parser ve mevcut frontend testleri bu parametre aktarımını kapsıyor. İlk incelemede query parametresinin kaybolduğuna dair kanıt bulunmadı.

## 4. Yerel DB üzerinde salt-okunur kanıt

Aynı filtre kümesiyle yapılan salt-okunur sorguların özeti:

| Küme | Sayı |
|---|---:|
| Aktif, nondeleted, `REQUESTED`, çözülmemiş/açık | 0 |
| Soft-delete edilmiş, `REQUESTED`, çözülmemiş/açık | 1 |

Soft-delete edilmiş tek kayıt kartta görülen `1` değeriyle birebir örtüşüyor. Kayıt kimliği ve müşteri verileri bu belgeye alınmadı.

## 5. PrismaService Proxy kanıtı

Dosya:

```text
apps/backend/src/prisma/prisma.service.ts:25-43
```

`PrismaService`, `$extends` ile oluşturulan client'ı bir ES6 Proxy ile döndürüyor. Proxy sıralaması önce özgün `PrismaService` üzerindeki property'yi kontrol ediyor:

```ts
if (prop in this) {
  return this[prop];
}
```

Prisma model delegeleri, örneğin `ticket`, özgün client üzerinde de bulunduğu için bu dal genişletilmiş `target.ticket` yerine ham `this.ticket` delegesini döndürebiliyor.

Mevcut extension ve Proxy davranışını aynı yerel DB üzerinde karşılaştıran salt-okunur çalışma sonucu:

```json
{
  "ticketPropertyFoundOnRaw": true,
  "proxyDelegateIsRaw": true,
  "rawCount": 1,
  "extendedCount": 0,
  "proxyCount": 1,
  "explicitActiveCount": 0
}
```

Yorum:

- Ham Prisma delegate soft-delete edilmiş kaydı sayıyor: `1`.
- `$extends` uygulanmış delegate kaydı dışlıyor: `0`.
- Mevcut Proxy semantiğini kullanan delegate tekrar ham sonucu veriyor: `1`.
- Açık `deletedAt: null` filtresi hedef listeyle aynı sonucu veriyor: `0`.

Bu bulgu, mevcut çelişkinin ana kök neden adayıdır. Bununla birlikte gerçek Nest dependency-injection zinciri ve transaction client davranışı bağımsız incelemede ayrıca kanıtlanmalıdır.

## 6. Global etki riski

`applySoftDeleteExtension()` şu modelleri kapsadığını iddia ediyor:

```text
User
Department
Team
Category
KnowledgeArticle
CustomerProfile
CrmConnection
Ticket
TicketMessage
Attachment
FaqEntry
Macro
Product
ProductCategory
Announcement
CrmAccount
```

Extension'ın kapsadığı okuma operasyonları:

```text
findMany
findFirst
findFirstOrThrow
count
```

Proxy gerçekten ham model delegelerini döndürüyorsa sorun yalnız Görev Merkezi sayacına ait değildir. Soft-delete sözleşmesine güvenen ve açık `deletedAt: null` yazmayan başka okuma yolları da silinmiş verileri görebilir.

Graphify sorgusu `PrismaService` merkezinden iki seviye içinde 924 düğüme ulaştı. Bu sayı tek başına 924 hatalı akış olduğu anlamına gelmez; yalnız merkezi servisin blast radius'unun yüksek olduğunu gösterir.

GitNexus bu çalışma ortamında kullanılabilir değil. Proje belleğindeki lisans sınırı nedeniyle yeni GitNexus kurulumu yapılmadı. Kaynak taraması ve Graphify kullanıldı.

## 7. Diğer Görev Merkezi kartlarının ilk durumu

Kart registry'sindeki başlık, açıklama, ikon ve rota tanımları statiktir. Operasyonel sayılar mock değildir; backend DB sorgularından gelir.

| Kart | Sayı kaynağı | İlk risk notu |
|---|---|---|
| Canlı sohbet bekleyen müşteriler | `ticket.count` | Açık `deletedAt: null` yok; gözlenen hata burada |
| Atanmamış aktif talepler | `ticket.count` | Açık `deletedAt: null` yok; aynı hata sınıfına açık |
| Makale incelemeleri | `knowledgeArticle.count` | Açık `deletedAt: null` mevcut |
| SSS öğrenme adayları | `faqEntry.count` | Açık `deletedAt: null` yok; aynı hata sınıfına açık |
| Tarama içerik adayları | `crawlCandidate.count` | Modelin soft-delete sözleşmesi ayrıca doğrulanmalı |
| AI çözüm geçmişi | Sayısız audit bağlantısı | Mock sayı yok; route/RBAC ayrı doğrulanmalı |

Bu tablo “tüm kartlar uçtan uca çalışıyor” kanıtı değildir. Her kartın sayaç predicate'i ile hedef sayfanın predicate'i ayrı ayrı karşılaştırılmalıdır.

## 8. İkincil hipotezler ve görünürlük açıkları

### 8.1 Eski sayaç

Görev Merkezi ve sidebar özeti ilk mount/rol değişiminde yükleniyor. Sürekli polling veya domain mutation sonrası merkezi invalidation bulunmadığı için kart değeri sayfa açık kaldığında eski kalabilir.

Bu durum genel bir UX riski olsa da mevcut gölge DB'deki `1 soft-deleted / 0 active` dağılımıyla birebir eşleşen Proxy kanıtını geçersiz kılmaz.

### 8.2 API hatasının boş liste gibi görünmesi

Dosya:

```text
apps/frontend/src/app/[locale]/(dashboard)/tickets/TicketsClient.tsx:103-125
```

Liste yükleme kodu hatayı şu anda sessizce yutuyor:

```ts
catch { /* handled */ }
```

Bu nedenle bir API hatası kullanıcıya gerçek “kuyruk boş” durumuyla aynı görünebilir. Browser/network doğrulamasında hedef isteğin gerçekten `200` döndüğü ayrıca kanıtlanmalıdır.

### 8.3 Gölge verinin güncelliği

Gölge DB canlı verinin anlık replikası değildir. Canlıda bekleyen sohbet bulunup gölgede bulunmaması normal olabilir. Ancak ürün sözleşmesi, hangi DB kullanılırsa kullanılsın aynı predicate için kart ve hedef listenin eşit olmasıdır.

## 9. İlk Codex değerlendirmesi

Kanıt ağırlığına göre ön sıralama:

1. **Yüksek güven:** `PrismaService` Proxy model delegelerini ham client'tan döndürüyor ve global soft-delete extension'ını etkisizleştiriyor.
2. **Yüksek güven:** Review Center canlı sohbet sayacı açık `deletedAt: null` kullanmadığı için soft-delete edilmiş kayıt kart sayısına girebiliyor.
3. **Orta güven:** Aynı sınıf atanmamış talepler ve SSS aday sayacını da etkileyebilir.
4. **Doğrulandı, ikincil:** Frontend hata durumu ile gerçek boş durumunu ayırmıyor.
5. **Olası, mevcut örneğin ana açıklaması değil:** Sayaç mount sonrası eski kalmış olabilir.
6. **Mevcut kanıtla zayıf:** Kartın mock veri kullanması veya query parametresinin kaybolması.

Henüz çözüm seçilmedi. Özellikle global Proxy değişikliğinin geniş etkisi nedeniyle bağımsız doğrulama tamamlanmadan kod yazılmamalıdır.

## 10. Claude'dan istenen bağımsız doğrulama

Claude aşağıdaki maddeleri Codex'in sonuçlarına güvenmeden, kaynak kod ve salt-okunur yerel kanıt üzerinden incelemelidir:

1. Aktif ve soft-delete edilmiş `REQUESTED` kayıt sayılarını aynı yerel DB'de bağımsız sorgula. Yalnız agregat sonuçları raporla; PII veya kayıt içeriği yazma.
2. Backend runtime'ın gerçekten hangi `DATABASE_URL` hedefini kullandığını secret yazmadan doğrula; frontend/backend veya env drift ihtimalini dışla.
3. Gerçek `PrismaService` constructor dönüşünde `ticket` model delegesinin ham client'a mı extended client'a mı ait olduğunu doğrula. Yalnız benzetilmiş Proxy testine güvenme.
4. `ticket.count()` için ham Prisma, doğrudan extended client ve Nest'e enjekte edilen `PrismaService` sonuçlarını karşılaştır.
5. `$transaction` callback'indeki client'ın soft-delete extension'ını koruyup korumadığını araştır.
6. `findMany`, `findFirst`, `findFirstOrThrow` ve `count` için extension'ın gerçek çalışma durumunu kontrol et.
7. Soft-delete listesindeki 16 modelin tüm tüketicilerini tarayıp açık `deletedAt: null` kullanmayan yüksek riskli okuma yollarını sınıflandır. Her eşleşmeyi otomatik olarak bug sayma; gerçek çağrı bağlamını oku.
8. Silinmiş kayıtları bilinçli okuması gereken restore, audit, reconciliation veya diagnostic akışlarını belirle. Global düzeltmenin bu akışları bozup bozmayacağını değerlendir.
9. Görev Merkezi'ndeki beş sayımlı kartın her biri için sayaç predicate'i ile hedef liste predicate'ini karşılaştır.
10. Kart özetinin ne zaman yenilendiğini ve eski sayaç ihtimalini kontrol et.
11. Hedef bilet isteğinin API hatasında neden boş liste gibi göründüğünü doğrula; network hatasını gerçek sıfır sonuçtan ayıracak test öner.
12. Aşağıdaki çözüm seçeneklerini risk, blast radius ve test gereksinimi bakımından karşılaştır:
    - Yalnız Review Center sorgularına açık `deletedAt: null` eklemek.
    - Yalnız global Proxy/extension kök nedenini düzeltmek.
    - Dar savunma filtresi ve global kök düzeltmeyi ayrı commit/gate olarak birlikte yapmak.
13. Prisma schema, migration, seed veya generated client değişikliği gerekip gerekmediğini açıkça belirt. İlk değerlendirmeye göre gerekmemelidir.
14. Bulgularını bu dosyanın en altındaki **Claude bağımsız doğrulama alanı** altına append-only biçimde ekle. Codex bölümlerini değiştirme veya silme.

### Claude için değişmez sınırlar

- Kod değiştirme.
- Test dosyası değiştirme veya oluşturma.
- DB'ye yazma; migration, seed, reset, resolve veya deploy çalıştırma.
- Production/canlı DB'ye, Redis'e veya dış entegrasyonlara bağlanma.
- Gölge DB'de yalnız salt-okunur sorgular kullan.
- Push, deploy, publish veya tag-push yapma.
- Ortak raporun eski bölümlerini değiştirme.
- Secret, connection string, PII veya müşteri içeriği raporlama.

## 11. Claude sonrası karşılaştırma matrisi

Bağımsız inceleme geldikten sonra aşağıdaki tablo Codex tarafından doldurulacaktır:

| Konu | Codex sonucu | Claude sonucu | Uyum | Karar |
|---|---|---|---|---|
| Yerel aktif/deleted REQUESTED dağılımı | `0 aktif / 1 deleted` | Bekleniyor | Bekleniyor | Bekleniyor |
| Proxy ham delegate döndürüyor mu? | Evet | Bekleniyor | Bekleniyor | Bekleniyor |
| Direct extended client filtreliyor mu? | Evet | Bekleniyor | Bekleniyor | Bekleniyor |
| Nest runtime PrismaService filtreliyor mu? | Güçlü bulgu; doğrudan ikinci kanıt isteniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| Transaction client filtreliyor mu? | Henüz kesinleştirilmedi | Bekleniyor | Bekleniyor | Bekleniyor |
| Diğer Review Center kartları etkileniyor mu? | En az iki kart daha riskli | Bekleniyor | Bekleniyor | Bekleniyor |
| Frontend eski sayaç riski | Var | Bekleniyor | Bekleniyor | Bekleniyor |
| API hatası boş liste gibi görünebilir mi? | Evet | Bekleniyor | Bekleniyor | Bekleniyor |
| Önerilen çözüm sırası | Dar savunma, ardından ayrı global kök düzeltme | Bekleniyor | Bekleniyor | Bekleniyor |

## 12. Olası çözüm seçenekleri — karar verilmedi

### Seçenek A — Yalnız Review Center filtresi

Artısı:

- Küçük değişiklik ve düşük blast radius.
- Kullanıcıya görünen `1 / 0` farkını doğrudan kapatır.

Eksisi:

- Global soft-delete extension gerçekten çalışmıyorsa kök neden açık kalır.
- Başka servislerde silinmiş veri görünürlüğü devam edebilir.

### Seçenek B — Yalnız global Proxy düzeltmesi

Artısı:

- Merkezi sözleşmeyi kökten düzeltir.

Eksisi:

- Yüksek blast radius.
- Mevcut kodun bugünkü ham davranışa yanlışlıkla bağımlı olduğu akışları bozabilir.
- Review Center kart/hedef parity'si yalnız görünmeyen global davranışa tekrar bağımlı kalır.

### Seçenek C — İki aşamalı savunma ve kök düzeltme

İlk Codex önerisi:

1. Önce Review Center sorgularında açık soft-delete predicate'leriyle dar koruma.
2. Ayrı commit, ayrı test kapısı ve ayrı restore point ile global Proxy/extension düzeltmesi.
3. Gerçek PrismaService + disposable PG17 entegrasyon kanıtı.
4. İki bağımsız code/security review.

Bu seçenek bağımsız Claude incelemesi gelmeden onaylanmış sayılmamalıdır.

## 13. Uygulama öncesi zorunlu karar kapısı

Kod geliştirmesine ancak şu koşullar sağlandığında geçilebilir:

- Claude bağımsız incelemesi bu belgenin sonuna eklenmiş olmalı.
- Codex/Claude sonuçları karşılaştırılmış olmalı.
- Çelişkiler kaynak kod veya yeniden üretilebilir kanıtla çözülmüş olmalı.
- Etkilenen global akışların test matrisi belirlenmiş olmalı.
- Kullanıcı uygulanacak seçeneği açıkça onaylamış olmalı.
- Yeni pre-work restore point doğrulanmış olmalı.

## 14. Claude bağımsız doğrulama alanı

**Tarih:** 2026-08-07 · **İnceleme türü:** Kaynak kod + yalnız salt-okunur yerel DB kanıtı · **Kod/test/DB yazımı:** Yapılmadı · **Kullanılan HEAD:** `8c65224f`

### 14.1 Madde 1 — Aktif/soft-delete `REQUESTED` sayıları (bağımsız DB sorgusu)

Yerel dev DB'de (`localhost:55433/aluplan_support`), Codex'in kullandığı script'e güvenmeden, kendi yazdığım bağımsız bir doğrulama script'iyle (aşağıda madde 3'te açıklanan) aynı filtre kümesiyle salt-okunur sorgu çalıştırıldı:

| Küme | Sayı |
|---|---:|
| Aktif (`deletedAt: null`), `chatStatus=REQUESTED`, `status notIn [RESOLVED,CLOSED]` | **0** |
| Soft-delete edilmiş, aynı filtre | **1** |

Codex'in madde 4 tablosuyla **birebir aynı**. PII/kayıt kimliği raporlanmadı.

### 14.2 Madde 2 — Backend runtime DB hedefi

`.env`, `apps/backend/.env`, `packages/database/.env` dosyalarındaki `DATABASE_URL` host/port/dbname bileşenleri (kimlik bilgisi yazdırılmadan) karşılaştırıldı:

```text
.env                     -> localhost 55433 aluplan_support
apps/backend/.env        -> localhost 55433 aluplan_support
packages/database/.env   -> localhost 55433 aluplan_support
```

Üçü birebir aynı. Frontend `API_URL=http://localhost:4000/api/v1` — backend'in bu DB'ye bağlı çalıştığı portla tutarlı. **Frontend/backend veya env drift ihtimali dışlandı.**

### 14.3 Madde 3-4-5-6 — Gerçek `PrismaService` constructor dönüşü: benzetilmiş test değil, gerçek sınıf çalıştırıldı

Codex'in "benzetilmiş Proxy testine güvenme" uyarısını dikkate alarak, `apps/backend/src/prisma/prisma.service.ts`'teki **gerçek** `PrismaService` sınıfını, gerçek `MetricsService`'i ve gerçek yerel DB'yi kullanan, tek seferlik, repo dışı (scratchpad) bir `ts-node` script'i yazıp çalıştırdım. Script depoya eklenmedi, test dosyası oluşturulmadı, yalnız `count`/`findMany`/`findFirst` (SELECT) çağrıları yapıldı, hiçbir yazma yapılmadı. Komut:

```bash
cd apps/backend
NODE_PATH="$(pwd)/node_modules:$(pwd)/../../node_modules" \
TS_NODE_PROJECT=./tsconfig.json TS_NODE_TRANSPILE_ONLY=true \
  node -r ts-node/register /path/to/scratchpad/prisma-proxy-probe.ts
```

Script şunu yaptı: `new PrismaService(new MetricsService())` ile **gerçek constructor'ı** çalıştırıp dönen nesneyi (`injectedInstance` — NestJS DI'nın da tam olarak ürettiği aynı Proxy nesnesi, çünkü class-provider'lar için Nest de aynı şekilde `new PrismaService(...)` çağırır) bağımsız bir ham `PrismaClient` ve bağımsız, doğrudan `$extends()` edilmiş bir client ile karşılaştırdı. Sonuç (ham JSON çıktısı):

```json
{
  "hasTicketProp": true,
  "hasDollarTransactionProp": true,
  "rawClientCount": 1,
  "directlyExtendedClientCount": 0,
  "injectedPrismaServiceCount": 1,
  "explicitActiveCount": 0,
  "explicitDeletedOnlyCount": 1,
  "injectedFindManyCount": 1,
  "injectedFindManyIncludesDeleted": true,
  "injectedTransactionCount": 1,
  "directlyExtendedTransactionCount": 0,
  "injectedFindFirstDeletedAt": "non-null"
}
```

**Yorum ve doğrulanan kök neden:**

- `hasTicketProp: true` — `'ticket' in injectedInstance` doğru. `PrismaService`'in constructor'ı `super({adapter,...})` çağırdığında `this` (orijinal, proxy'lenmemiş nesne) zaten tam bir `PrismaClient` örneğidir ve tüm model delege'leri (`ticket`, `user`, ...) doğrudan `this` üzerinde bulunur. `$extends()` bunları **mutasyona uğratmaz**, yeni bir `extendedClient` nesnesi döndürür; `this` değişmeden kalır.
- `Reflect.get` şu üç dallı Proxy trap'inden geçiyor (`prisma.service.ts:29-43`): (1) `prop in this` VE fonksiyon → `this[prop].bind(this)`, (2) `prop in this` → `this[prop]`, (3) aksi halde `target[prop]` (yani `extendedClient`). Model delegeleri (`ticket` vb.) obje oldukları için dal (1)'i atlıyor ama `prop in this` her zaman `true` olduğu için dal (2)'ye giriyor ve **ham, genişletilmemiş** `this.ticket`'ı döndürüyor — `target.ticket` (genişletilmiş delege) hiçbir zaman erişilmiyor.
- `injectedPrismaServiceCount: 1` (ham client ile aynı, genişletilmiş client'ın `0`'ından farklı) — bu, **gerçek enjekte edilen singleton üzerinden global soft-delete extension'ının `count()` için tamamen etkisiz olduğunu ampirik olarak kanıtlıyor**. Codex'in "yüksek güven" bulgusu doğrulandı ve benzetme değil gerçek sınıfla teyit edildi.
- `injectedFindManyCount: 1`, `injectedFindManyIncludesDeleted: true`, `injectedFindFirstDeletedAt: "non-null"` — **`findMany` ve `findFirst` için de aynı bypass ampirik olarak doğrulandı** (Codex'in belgesi bunları teorik olarak "extension kapsıyor" diye listelemişti ama ayrı ayrı kanıtlamamıştı).
- **Yeni bulgu — madde 5'in cevabı, Codex'in belgesinde "henüz kesinleştirilmedi" işaretliydi:** `injectedTransactionCount: 1` — enjekte edilen `PrismaService` üzerinden çağrılan `$transaction()` callback'i içindeki `tx.ticket.count()` **de** ham sonucu veriyor (extension `$transaction` içinde de çalışmıyor). Kök neden aynı: `$transaction` de `this` üzerinde gerçek bir fonksiyon olarak var olduğu için Proxy dal (1)'den ham, bağlı (`bind`) haliyle dönüyor — `target.$transaction` (genişletilmiş client'ın transaction metodu) hiç çağrılmıyor.
- **Kontrol grubu:** `directlyExtendedTransactionCount: 0` — bağımsız olarak doğrudan `$extends()` edilmiş bir client'ta `$transaction()` **doğru çalışıyor** (extension transaction içine doğru yayılıyor). Yani bu, genel bir Prisma sınırlaması değil; yalnız `PrismaService`'in Proxy sarmalama şeklinden kaynaklanan, NestJS'e özgü bir hata.

**Sonuç:** Bu, Görev Merkezi kartıyla sınırlı bir hata değil — enjekte edilen `PrismaService` üzerinden yapılan **her** `findMany`/`findFirst`/`findFirstOrThrow`/`count` çağrısı, **her** 16 modelde, **ve `$transaction` içinde bile**, global soft-delete filtresini hiçbir zaman uygulamıyor. Extension kodu pratikte tamamen ölü koddur (yalnız `target` üzerinde erişilebilir ama Proxy hiçbir gerçek çağrıda oraya ulaşmıyor).

### 14.4 Madde 7-8 — 16 modelin gerçek tüketicileri ve "canlı" vs "durgun" sınıflandırması

Otomatik grep sonuçlarını tek başına kanıt saymadan, önce her modelin `deletedAt` alanının **gerçekten bir yerde yazılıp yazılmadığını** doğruladım (bir modelin okuma tarafında extension'ı atlaması, o model hiç soft-delete edilmiyorsa pratikte zararsızdır):

| Model | Okuma call-site sayısı (kaba grep) | `deletedAt` gerçekten yazılıyor mu? | Durum |
|---|---:|---|---|
| Ticket | 39 | Evet (`tickets.service.ts`) | **Canlı — doğrulanmış bug (bu belge konusu)** |
| User | 25 | Evet (`users.service.ts`) | Canlı — ek risk |
| CustomerProfile | 11 | Evet (`customers.service.ts`, `crm-record-sync.service.ts`) | Canlı — ek risk |
| CrmAccount | 4 | Evet (`crm-record-sync.service.ts`) | Canlı — ek risk |
| Product / ProductCategory | 5 / 1 | Evet (`products.service.ts`) | Canlı — ek risk (bu oturumda ayrıca doğrulanan ürün taksonomisi işiyle ilişkili) |
| FaqEntry | 10 | Evet (`faq.service.ts`) | **Canlı — ek risk, aşağıda 14.6'da ayrıca detaylandırıldı** |
| KnowledgeArticle | 9 | Evet (`knowledge-base.service.ts`) | Canlı ama zaten explicit filtre var (bkz. 14.6) |
| Announcement | 1 | Evet (`announcements.service.ts`) | Canlı — düşük call-site sayısı, düşük risk |
| Macro | 2 | Evet (`macros.service.ts`) | Canlı — düşük risk |
| TicketMessage | 4 | **Hayır** — `ticketMessage.update()` çağrıları yalnız `metadata`/`sentiment` günceller, `deletedAt` hiçbir yerde set edilmiyor | **Durgun** — extension kapsıyor ama şu an hiç kullanılmıyor, pratik risk yok |
| Attachment | 1 | **Hayır** — `deletedAt` yazan hiçbir yer bulunamadı | **Durgun** — pratik risk yok |
| Team | 4 | **Hayır** — `teams.service.ts:182`'deki `update()` yalnız `isArchived` kullanıyor (ayrı bir alan), `deletedAt` set etmiyor | **Durgun** (not: `isArchived` ayrı bir mekanizma, bu extension'ın kapsamında değil) |
| Department, Category | 3 / 2 | **Hayır** — bu oturumdaki taramada `deletedAt` yazan bir yer bulunamadı | **Durgun görünüyor, ama düşük call-site sayısı nedeniyle tam kapsamlı taranmadı** |
| CrmConnection | 11 | **Bulunamadı** — birçok yerde `deletedAt: null` **okunuyor** (zaten explicit) ama yazıldığı yer bu oturumda tespit edilemedi | Belirsiz — muhtemelen durgun, ayrıca doğrulanmalı |

**Önemli metodolojik not:** Bu sınıflandırma `apps/backend/src` içindeki `.update()`/`.updateMany()` çağrılarının grep taramasına dayanıyor; ham SQL, seed script'i veya `apps/backend/src` dışındaki bir yol üzerinden `deletedAt` yazılması ihtimalini kesin olarak dışlamıyorum. Bu bir **açık belirsizlik** olarak 14.9'da tekrar not edildi.

**Madde 8 — restore/audit/reconciliation akışları:** Kasıtlı olarak silinmiş kayıt okuyan (`deletedAt: { not: null }` gibi) akışlar arandı. Tek somut örnek `apps/backend/src/scripts/check-deleted.ts` — ancak bu script `PrismaService` **kullanmıyor**, kendi `new PrismaClient()` (ham, sarmalanmamış) örneğini oluşturuyor (satır 7). Yani bu script zaten Proxy'nin dışında çalışıyor; global bir düzeltme onu **etkilemez**. `products.controller.ts`'teki `restoreFaqs`/`restoreAllplanFaqs()` de yalnız *aktif* (deletedAt:null) kayıt arıyor, silinmiş kayıt okumuyor. Bu oturumda enjekte edilen `PrismaService` üzerinden kasıtlı olarak silinmiş kayıt okuyan **hiçbir** canlı akış bulunamadı — ancak bu, ~130 call-site'ın tamamının teker teker okunduğu anlamına gelmiyor (bkz. 14.9).

**Yeni risk — Codex'in belgesinde yok:** `applySoftDeleteExtension()`'daki middleware (`prisma.service.ts:84`) şunu yapıyor: `safeArgs.where = { ...safeArgs.where, deletedAt: null }` — bu, **çağıranın `where` içinde ne yazdığından bağımsız olarak** `deletedAt`'i koşulsuz `null`'a **eziyor**. Yani bir gün birisi enjekte edilen `PrismaService` üzerinden kasıtlı olarak `deletedAt: { not: null }` sorgusu yazsaydı (bir "çöp kutusu" ekranı gibi), extension gerçekten çalışır hale getirilirse bu sorgu **sessizce yanlış sonuç** verirdi (istenen silinmiş kayıtlar yerine aktif kayıtlar dönerdi). Şu an böyle bir canlı tüketici bulunamadı ama bu, **Seçenek B'nin (yalnız global Proxy düzeltmesi) gizli bir regresyon riskidir** ve düzeltme sırasında ayrıca ele alınmalı (örn. middleware `deletedAt` zaten explicit olarak set edilmişse dokunmamalı).

### 14.5 Madde 9 — Görev Merkezi'ndeki 5 sayımlı kartın predicate/hedef-liste karşılaştırması

`review-center.service.ts` (bu oturumun önceki bir turunda tam okunmuştu) ile hedef sayfaların gerçek predicate'leri tek tek karşılaştırıldı:

| Kart | Sayaç predicate'i (`review-center.service.ts`) | Hedef predicate'i | Parite |
|---|---|---|---|
| Canlı sohbet bekleyen | `chatStatus:REQUESTED, status:notIn[...]` — **`deletedAt` yok** | `tickets.service.ts:262` `deletedAt: null` **explicit** | ❌ **Uyumsuz — doğrulanan bug** |
| Atanmamış aktif talepler | `assignedTo:null, status:notIn[...]` — **`deletedAt` yok** | Aynı `tickets.service.ts` explicit `deletedAt:null` filtresini kullanıyor | ❌ **Aynı hata sınıfı — doğrulanan ek risk** |
| Makale incelemeleri | `status:REVIEW, deletedAt:null, isAutoImported:false` — **explicit** | `knowledge-base.service.ts:60-63` aynı iki alanı explicit kullanıyor | ✅ **Uyumlu — extension'a bağımlı değil, bug yok** |
| SSS öğrenme adayları | `status:PENDING_REVIEW` — **`deletedAt` yok** | `faq.service.ts:326-350 findAll()` de **`deletedAt` yok** (yalnız iç içe `sources.deletedAt:null` var, üst seviyede yok) | ⚠️ **İkisi de aynı şekilde bozuk — simetrik, bu yüzden kart/liste arasında görünür fark OLUŞMUYOR ama ikisi de yanlışlıkla silinmiş SSS adaylarını gösterebilir** |
| Tarama içerik adayları | `status:PENDING_REVIEW` | `CrawlCandidate` modelinde **`deletedAt` alanı hiç yok** (schema'da doğrulandı) | ✅ **N/A — bu hata sınıfına hiç açık değil** |

**Yeni bulgu:** SSS kartı Codex'in ön tablosunda ("Orta güven: aynı sınıf... SSS aday sayacını da etkileyebilir") genel olarak işaretlenmişti ama karakter farkı belirtilmemişti. Ben bunu ayrıştırdım: bilet kartlarının aksine, SSS kartında **kart ve hedef liste simetrik olarak bozuk** — ikisi de extension'a güveniyor ve extension çalışmadığı için ikisi de aynı (yanlış) sayıyı gösterirdi. Bu, kullanıcı gözlemindeki "kart≠liste" belirtisini SSS için üretmez, ama altta yatan doğruluk sorunu (silinmiş SSS adayının hâlâ görünmesi) aynı derecede gerçektir.

### 14.6 Madde 10 — Kart yenileme zamanlaması ve eski (stale) sayaç riski

- Sidebar (`sidebar.tsx`, bu oturumun önceki bir turunda tam okunmuştu, satır 104-122): `api.reviewCenter.summary()` yalnız `useEffect(..., [isStaff, role])` bağımlılığıyla, yani yalnız **mount'ta veya rol değiştiğinde** çağrılıyor. Polling veya mutation-sonrası invalidation **yok**.
- Görev Merkezi sayfasının kendisi (`ReviewCenterClient.tsx:35-37`): `useEffect(() => { void loadSummary(); }, [loadSummary])` — `loadSummary` boş bağımlılıklı `useCallback`, yani bu da yalnız **mount'ta** çalışıyor.
- Her iki durumda da: kullanıcı sayfayı açık tutup başka bir yerde (kendisi veya başka bir agent) ilgili ticket/FAQ/makale durumunu değiştirirse, kart sayısı **elle yenilemeden** (sayfa navigasyonu veya `RefreshCcw` butonu, `ReviewCenterClient.tsx`'te import edilmiş görünüyor) güncellenmez.
- Bu genel bir UX riskidir ama **bu belgedeki spesifik `1/0` gözlemini açıklamaz** — çünkü gözlemlenen tutarsızlık aynı anlık DB durumu üzerinde, aynı sayfa yüklemesinde gerçekleşiyor (madde 14.1'de doğrulandı: aynı DB durumunda kart-predicate `1`, hedef-liste-predicate `0` veriyor).

### 14.7 Madde 11 — API hatasının boş liste gibi görünmesi

`TicketsClient.tsx:122` (bu oturumda tam okundu): `catch { /* handled */ }` — gerçek, doğrulanmış bir sessiz hata yutma. `tickets` state güncellenmiyor, kullanıcıya hata mesajı gösterilmiyor, `loading` yine de `false` yapılıyor → sayfa "sonuç yok" gibi render ediliyor, gerçek bir API hatasından ayırt edilemiyor.

**Ancak bu spesifik olayda bu, gözlemlenen `1/0` farkının açıklaması DEĞİL:** madde 14.1'de doğrulandığı gibi, `chatStatus=REQUESTED&activeOnly=true` filtresiyle hedef sorgu **gerçekten ve doğru şekilde `0` sonuç döndürüyor** (explicit `deletedAt:null` filtresi sayesinde) — yani hedef listenin boş görünmesi bir API hatası değil, **doğru** bir `200` yanıtıdır. Kartın **yanlış** olan tarafı `1` göstermesidir (soft-delete edilmiş kaydı sayması), tersi değil.

**Karşıt kanıt (kontrast):** `ReviewCenterClient.tsx:27-29`'daki hata yakalama **sessiz değil** — `setError(true)` ile açık bir hata durumu set ediyor. Yani sorun yalnız `TicketsClient.tsx`'e özgü, tutarsız bir hata-yönetimi deseni; Görev Merkezi tarafında zaten daha iyi yapılmış.

**Test önerisi (madde 11'in istediği ayrım testi):** Ticket listesi API çağrısı mock'lanarak (a) `200` + boş `data:[]` senaryosu ile (b) `4xx/5xx` hata senaryosunun ikisinde de UI'da **farklı, ayırt edilebilir** durumlar (örn. "kayıt yok" mesajı vs "yüklenemedi, tekrar dene" mesajı) render edildiğini doğrulayan bir frontend testi eklenmeli — şu an ikisi de aynı (boş liste) görünüme düşüyor.

### 14.8 Madde 12 — Üç çözüm seçeneği: risk/blast-radius/test gereksinimi karşılaştırması

| | Seçenek A — Yalnız Review Center'a explicit filtre | Seçenek B — Yalnız global Proxy düzeltmesi | Seçenek C — İki aşamalı (dar savunma + ayrı global düzeltme) |
|---|---|---|---|
| **Blast radius** | Çok düşük — yalnız `review-center.service.ts`'teki `deletedAt`'siz 2 sorgu (canlı sohbet, atanmamış talepler) ve isteğe bağlı SSS sorgusu | **Çok yüksek** — 14.4'te "canlı" olarak sınıflandırılan ~9 modelin tüm okuma yollarını (findMany/findFirst/findFirstOrThrow/count) aynı anda etkiler; Ticket tek başına 39 call-site | Aşama 1 düşük, Aşama 2 yüksek ama **izole edilmiş, ayrı test kapısıyla** |
| **Kullanıcı gözlemindeki `1/0` farkını kapatır mı?** | Evet, doğrudan | Evet, ama dolaylı (global davranış değişimi üzerinden) | Evet, Aşama 1'de hemen |
| **Yeni bulunan middleware-override riski (14.4)** | Etkilenmez (route değişmiyor) | **Etkilenir** — `deletedAt`'i koşulsuz eziyor; kasıtlı silinmiş-kayıt sorgusu varsa (şu an bulunamadı ama kanıtlanamadı da) sessizce bozulabilir | Aşama 2'de aynı riski taşır ama izole test/rollback ile yönetilebilir |
| **Kök nedeni çözer mi?** | Hayır — extension hâlâ ölü kod, başka modellerde/gelecekte aynı sınıf hata tekrar olabilir | Evet | Evet (Aşama 2'de) |
| **Test gereksinimi** | Küçük — hedefli backend testi (2-3 senaryo) + review-center özet regresyon testi | Büyük — 9 "canlı" modelin tümü için önce/sonra davranış testi, disposable PG17 entegrasyon testi, tüm mevcut suite'in regresyon taraması (extension artık gerçekten filtrelemeye başlayınca, ondan **yanlışlıkla** yararlanan/ona bağımlı olan gizli davranışlar ortaya çıkabilir) | Aşama 1 küçük; Aşama 2 Seçenek B ile aynı büyüklükte ama ayrı commit/restore point/review turunda izole |
| **Geri alınabilirlik** | Kolay (tek dosya, birkaç satır) | Zor (geniş, iç içe geçmiş davranış değişikliği) | Aşama 1 kolay; Aşama 2 Seçenek B ile aynı zorlukta ama izole restore point sayesinde geri alınabilir |

**Değerlendirme:** Kanıtlar Codex'in ön-önerisini (Seçenek C) destekliyor — ama şu netleştirmeyle: Aşama 2'ye geçilirken middleware'in `deletedAt`'i koşulsuz ezme davranışı da (14.4'teki yeni bulgu) aynı commit'te gözden geçirilmeli, yoksa Aşama 2 kendi başına yeni, sessiz bir regresyon sınıfı açabilir.

### 14.9 Madde 13 — Şema/migration/seed gerekli mi?

**Hayır.** `deletedAt` kolonu ilgili tüm modellerde zaten mevcut (şema doğrulandı). Hem Seçenek A (review-center sorgularına `deletedAt: null` eklemek) hem Seçenek B/C'nin 2. aşaması (Proxy `get` trap mantığını düzeltmek — örn. model delege adlarını/`$transaction`'ı öncelik sırasında `target`'a yönlendirmek) yalnızca TypeScript servis kodu değişikliğidir. Migration, seed veya generated client değişikliği **gerekmez**. Codex'in ön değerlendirmesiyle aynı sonuca bağımsız olarak ulaşıldı.

### 14.10 Açık kalan belirsizlikler

1. Department, Category, CrmConnection ve Team modellerinin `deletedAt` alanının **hiçbir yerde** yazılmadığı iddiası yalnız `apps/backend/src` içindeki `.update()`/`.updateMany()` grep taramasına dayanıyor; ham SQL, harici script veya seed yolu tam olarak dışlanmadı.
2. ~130 toplam call-site'ın tamamı teker teker okunmadı (bu oturumun kapsamı ve süresi buna izin vermedi); User (25), Ticket (39), CustomerProfile (11), CrmConnection (11) call-site'larının yalnız temsil edici bir örneklemi doğrudan okundu. Bu nedenle "kasıtlı silinmiş-kayıt okuyan başka bir akış yok" iddiası **yüksek güvenli ama kesin değil**.
3. Frontend/browser doğrulaması (madde 11'in istediği gerçek `200` vs hata ayrımı, canlı tarayıcı gözlemiyle) bu incelemede **yapılmadı** — yalnız kaynak kod ve DB kanıtına dayanarak, hedef sorgunun DB seviyesinde doğru şekilde `0` döndürdüğü (dolayısıyla API'nin muhtemelen `200` döndürdüğü) çıkarımı yapıldı, doğrudan network gözlemiyle teyit edilmedi.
4. Diğer "canlı" modellerin (User, CustomerProfile, CrmAccount, Product, Announcement, Macro) somut, gözlemlenebilir bir kullanıcı-etkisi örneği bu oturumda **üretilmedi** — yalnız kod-yapısal olarak aynı hata sınıfına açık oldukları gösterildi. Her biri için Ticket'takine benzer bir "kart 1 / liste 0" tipi somut senaryo henüz doğrulanmadı.

### 14.11 Sonuç formatı

**Codex ile doğrulanan ortak bulgular:**
- Yerel DB'de aktif=0 / soft-delete=1 REQUESTED dağılımı (bağımsız sorguyla birebir teyit edildi).
- `PrismaService` Proxy'sinin model delegelerini (`ticket` dahil) ham client'tan döndürdüğü — artık **benzetilmiş değil, gerçek sınıfın gerçek constructor'ı çalıştırılarak** kanıtlandı.
- Doğrudan `$extends()` edilmiş client'ın aynı sorguyu doğru filtrelediği (extension mekanizmasının kendisi sağlam, yalnız Proxy sarmalaması bozuk).
- Review Center canlı-sohbet sayacının explicit `deletedAt:null` kullanmadığı, hedef ticket listesinin kullandığı.
- Atanmamış talepler kartının da aynı hata sınıfına açık olduğu.
- Frontend'de ticket listesi hata yutma deseninin var olduğu.
- Şema/migration/seed değişikliği gerekmediği.
- Önerilen sıra olarak dar savunma + ayrı global düzeltmenin (Seçenek C) en makul yol olduğu.

**Codex'ten farklı veya ek bulgular:**
- **`$transaction` içinde de extension'ın çalışmadığı ampirik olarak kanıtlandı** (Codex'in belgesi bunu "henüz kesinleştirilmedi" olarak bırakmıştı — madde 302).
- `findMany`/`findFirst` için de bypass ayrı ayrı ampirik olarak doğrulandı (Codex yalnız `count` üzerinden kanıt sunmuştu).
- Middleware'in `deletedAt`'i **koşulsuz ezdiği** (var olan `where.deletedAt` değerini bile geçersiz kılıyor) — Seçenek B/C-Aşama2 için yeni, daha önce belgelenmemiş bir regresyon riski.
- 16 modelin "canlı" (gerçekten soft-delete ediliyor) ile "durgun" (`deletedAt` hiç yazılmıyor, extension'ın kapsaması pratikte önemsiz) olarak ayrıştırılması — TicketMessage, Attachment, Team bu oturumda durgun bulundu.
- SSS (`faqEntry`) kartının, bilet kartlarından farklı bir hata karakteri taşıdığı: kart ve hedef liste **simetrik olarak** bozuk (ikisi de filtrelemiyor), bu yüzden görünür bir `kart≠liste` belirtisi üretmez ama aynı derecede yanlış.
- `check-deleted.ts` teşhis script'inin zaten `PrismaService`'i değil ham `PrismaClient`'ı kullandığı — bir global düzeltmeden etkilenmeyeceği.
- `CrawlCandidate` modelinin `deletedAt` alanı hiç olmadığı için bu hata sınıfına hiç açık olmadığı.
- Görev Merkezi sayfasının kendi hata yönetiminin (`ReviewCenterClient.tsx`) TicketsClient'ın aksine sessiz olmadığı (`setError(true)` var).

**Çürütülen iddialar:** Yok. Codex'in hiçbir iddiası bağımsız incelemede çürütülmedi; tamamı doğrulandı veya daha da güçlü kanıtla teyit edildi.

**Açık kalan belirsizlikler:** Bkz. 14.10 (4 madde) — özetle: Department/Category/CrmConnection/Team'in tam olarak durgun olduğu, ~130 call-site'ın tamamının okunduğu ve canlı tarayıcı network gözlemi iddiaları **kesinleştirilmedi**, yalnız kod/DB kanıtına dayalı yüksek güvenli çıkarımlar yapıldı.

**Önerilen çözüm sırası (Codex'in Seçenek C'siyle uyumlu, bir netleştirmeyle):**
1. Review Center'daki canlı-sohbet ve atanmamış-talepler sayaçlarına explicit `deletedAt: null` eklenmesi (dar savunma, düşük risk, kullanıcı gözlemindeki farkı hemen kapatır).
2. SSS adayları sayaç/liste çiftine de aynı explicit filtrenin eklenmesi değerlendirilmeli (simetrik ama yine de yanlış).
3. Ayrı commit/restore point/test kapısıyla: `PrismaService` Proxy `get` trap'inin, model delegeleri ve `$transaction`'ı öncelikle `target`'a (genişletilmiş client) yönlendirecek şekilde düzeltilmesi.
4. Aşama 3 ile **aynı commit'te**: middleware'in `deletedAt`'i koşulsuz ezme davranışının, çağıran zaten explicit bir `deletedAt` filtresi vermişse dokunmayacak şekilde gözden geçirilmesi (14.4'teki yeni risk).
5. "Canlı" 9 modelin (Ticket, User, CustomerProfile, CrmAccount, Product/ProductCategory, FaqEntry, KnowledgeArticle, Announcement, Macro) tam regresyon testi + disposable PG17 entegrasyon testi.
6. İki bağımsız code/security review turu.

**GO / NO-GO (bu bağımsız incelemenin kapsamı için):**

**NO-GO — henüz uygulamaya geçilmemeli.** Gerekçe: bu belge ve talimat, açıkça "Codex/Claude sonuçları karşılaştırılmadan, kullanıcı onayı olmadan kod geliştirilmeyecek" bekleme kapısını (bölüm 13) tanımlıyor; bu inceleme yalnız doğrulama amaçlıdır, uygulama kararı bu turun kapsamında değildir. İçerik olarak: kök neden analizi tamamlanmış ve güçlü kanıtla desteklenmiş durumda, **ancak** 14.10'daki açık belirsizlikler (özellikle ~130 call-site'ın tam taranmaması ve canlı tarayıcı doğrulamasının yapılmamış olması) kapatılmadan, Seçenek B/C-Aşama2'nin global blast radius'u için "GO" verilmesi erken olur. Seçenek A (dar savunma) tek başına, izole bir ilk adım olarak düşük riskli ve kullanıcı onayına hazır durumda — ama bu da ayrı bir kullanıcı kararı gerektirir, bu incelemenin kapsamında otomatik onay verilmedi.

---

Bu bölüm append-only olarak eklenmiştir; yukarıdaki Codex bölümleri (1-13) değiştirilmedi veya silinmedi. Kod, test dosyası, migration, seed değişikliği yapılmadı. Yalnız yerel, salt-okunur DB sorguları ve tek seferlik, depo dışı bir doğrulama script'i çalıştırıldı. Production/shadow/canlı sisteme bağlanılmadı. Commit, push, tag-push veya deploy yapılmadı.

## 15. Codex karşılaştırma ve ortak karar kaydı

**Tarih:** 2026-08-07 · **Durum:** İki bağımsız inceleme karşılaştırıldı · **Kod/test/DB yazımı:** Yapılmadı

Bu bölüm Claude'un 14. bölümdeki bağımsız bulguları okunduktan sonra append-only olarak eklenmiştir. Bölüm 1-14 değiştirilmemiştir.

### 15.1 Codex'in Claude sonrası bağımsız tekrar kontrolü

Claude'un karar açısından yeni olan `findMany` ve `$transaction` bypass iddiaları, gerçek `PrismaService` sınıfı doğrudan oluşturularak Codex tarafından da yeniden kontrol edildi. Yalnız SELECT/count çağrıları kullanıldı; kayıt içeriği, kimlik, PII veya connection string yazdırılmadı.

Sonuç:

```json
{
  "actualPrismaServiceCount": 1,
  "actualPrismaServiceFindManyCount": 1,
  "actualPrismaServiceFindManyIncludesDeleted": true,
  "actualPrismaServiceTransactionCount": 1,
  "explicitActiveCount": 0
}
```

Bu sonuç Claude'un gerçek sınıfla elde ettiği kanıtla birebir uyumludur:

- Enjekte edilen gerçek `PrismaService.ticket.count()` soft-delete edilmiş kaydı sayıyor.
- Gerçek `PrismaService.ticket.findMany()` soft-delete edilmiş kaydı döndürüyor.
- Gerçek `PrismaService.$transaction(...)` içindeki `tx.ticket.count()` da ham sonucu veriyor.
- Açık `deletedAt: null` sorgusu doğru aktif küme olan `0` sonucunu veriyor.

Middleware'in `safeArgs.where = { ...safeArgs.where, deletedAt: null }` ifadesi, çağıranın explicit `deletedAt` koşulunu koşulsuz ezdiği için Claude'un yeni regresyon riski kaynak koddan ayrıca doğrulandı.

### 15.2 Sonuç karşılaştırması

| Konu | Codex ilk sonucu | Claude bağımsız sonucu | Codex tekrar kontrolü | Ortak hüküm |
|---|---|---|---|---|
| Aktif/deleted `REQUESTED` dağılımı | `0 / 1` | `0 / 1` | Önceki salt-okunur sorguyla uyumlu | Doğrulandı |
| Proxy model delegesini ham client'tan döndürüyor mu? | Evet | Gerçek sınıfla evet | Gerçek sınıfla yeniden evet | Doğrulandı |
| Doğrudan `$extends` doğru filtreliyor mu? | Evet | Evet | Önceki kontrolle uyumlu | Doğrulandı |
| `count` bypass | Evet | Evet | Evet | Doğrulandı |
| `findMany` / `findFirst` bypass | Yapısal risk | Ampirik olarak evet | `findMany` yeniden evet | Doğrulandı; `findFirst` Claude kanıtıyla kabul edildi |
| `$transaction` bypass | Açık belirsizlikti | Ampirik olarak evet | Yeniden evet | Doğrulandı |
| Explicit `deletedAt` koşulunun ezilmesi | İlk belgede yoktu | Yeni risk olarak bulundu | Kaynak koddan evet | Global düzeltmenin zorunlu tasarım girdisi |
| Canlı sohbet kart/liste paritesi | Uyumsuz | Uyumsuz | Kaynak ve DB kanıtıyla uyumlu | Doğrulanmış bug |
| Atanmamış talepler paritesi | Aynı risk | Uyumsuz | Kaynakla uyumlu | Doğrulanmış ek bug |
| SSS adayları | Riskli | Kart ve liste simetrik biçimde yanlış | Kaynakla uyumlu | Görünür parite farkı yok; doğruluk bug'ı var |
| Makale kartı | Açık filtreli | Uyumlu | Kaynakla uyumlu | Bu hata sınıfından etkilenmiyor |
| Crawler kartı | Model kontrolü gerekiyordu | `deletedAt` alanı yok | Şema bulgusuyla uyumlu | Bu hata sınıfından etkilenmiyor |
| Ticket API hatasının boş görünmesi | Evet | Evet | Kaynakla uyumlu | Ayrı frontend güvenilirlik açığı |
| Schema/migration/seed gereksinimi | Gerekmiyor | Gerekmiyor | Uyumlu | Gerekmiyor |

### 15.3 Çelişki ve düzeltme notları

- İki inceleme arasında kök neden veya gözlenen kullanıcı etkisi bakımından çelişki yoktur.
- Claude, Codex'in açık bıraktığı transaction davranışını kapatmış ve middleware override riskini eklemiştir.
- Claude'un son kapsam cümlesindeki “shadow sisteme bağlanılmadı” ifadesi, bölüm 14.1-14.2'de açıkça `localhost:55433/aluplan_support` üzerinde salt-okunur sorgu yapıldığı bilgisiyle birlikte okunmalıdır. Kullanıcının tanımı ve proje bağlamına göre bu hedef production'dan türetilmiş **yerel gölge/geliştirme kopyasıdır**. Doğru ortak ifade: production/canlı DB'ye bağlanılmadı; yerel gölge kopyada yalnız salt-okunur sorgular yapıldı.
- Claude'un call-site sınıflandırması faydalı bir ilk envanterdir; yaklaşık 130 okuma call-site'ının tamamı henüz kaynak bağlamıyla incelenmediği için global düzeltme kapısı açılmış sayılmaz.

### 15.4 Ortak teknik karar önerisi

İki bağımsız incelemenin ortak kanıtı **Seçenek C'yi** desteklemektedir; ancak uygulama iki ayrı onay ve geri dönüş kapısına bölünmelidir.

#### Aşama A — Dar, kullanıcıya görünen doğruluk düzeltmesi

Kapsam:

1. Canlı sohbet sayacına explicit `deletedAt: null` eklemek.
2. Atanmamış aktif talepler sayacına explicit `deletedAt: null` eklemek.
3. SSS adaylarının hem sayaç hem hedef liste sorgusuna explicit `deletedAt: null` eklemek.
4. Ticket listesi API hatasını gerçek boş sonuçtan ayıran lokalize hata + retry durumu eklemek.
5. Sayaç ve hedef liste predicate paritesi için backend/frontend regresyon testleri eklemek.

Karar durumu:

- Teknik hazırlık: **GO adayı**.
- Blast radius: Düşük/orta.
- Migration/schema/seed: Yok.
- Production/canlı veri: Gerekmez.
- Uygulama yetkisi: Henüz verilmedi; kullanıcı açık onayı bekleniyor.

#### Aşama B — Global Prisma soft-delete altyapısı

Uygulamadan önce zorunlu ön çalışma:

1. 16 model ve yaklaşık 130 call-site'ın tamamını kaynak bağlamıyla sınıflandırmak.
2. Kasıtlı deleted-record okuma sözleşmesini tanımlamak.
3. Middleware kuralını şu biçimde netleştirmek: çağıran `deletedAt` koşulu vermemişse `deletedAt: null` ekle; explicit koşul varsa koru.
4. Model delegeleri ile `$transaction`'ı extended target'a, Nest lifecycle/custom üyelerini doğru instance'a yönlendirecek Proxy sözleşmesini tasarlamak.
5. Gerçek `PrismaService`, transaction ve disposable PG17 testlerini önce RED olarak yazmak.
6. Canlı soft-delete kullanan 10 model girdisi / 9 domain grubu için regresyon matrisi oluşturmak.

Karar durumu:

- Teknik hazırlık: **NO-GO**.
- Gerekçe: Tam call-site envanteri ve bypass sözleşmesi henüz tamamlanmadı.
- Aşama A ile aynı committe uygulanmamalı.
- Ayrı restore point, ayrı commit, tam backend suite ve iki bağımsız code/security review gerektirir.

### 15.5 Güncel karar kapısı

| İş | Durum |
|---|---|
| Kök neden incelemesi | Tamamlandı ve iki kez bağımsız doğrulandı |
| Aşama A planı | Kullanıcı onayına hazır |
| Aşama A uygulaması | Başlatılmadı |
| Aşama B tam etki envanteri | Bekliyor |
| Aşama B uygulaması | NO-GO |
| Kod/test değişikliği | Yok |
| Migration/schema/seed | Yok |
| Production/canlı bağlantı | Yok |
| Yerel gölge DB | Yalnız salt-okunur inceleme |
| Commit/push/deploy | Yok |

Bir sonraki adım, kullanıcı onay verirse yalnız **Aşama A** için plan kaydı, pre-work restore point ve TDD RED testleriyle başlamaktır. Aşama B otomatik olarak başlamaz ve ayrı onay gerektirir.

## 16. Aşama A uygulama ve kapanış kaydı

**Tarih:** 2026-08-07 · **Durum:** Tamamlandı · **Ürün commit'i:** `69655f1c`

Kullanıcı onayıyla yalnız dar Aşama A uygulandı. Global `PrismaService`/Proxy/middleware katmanı, migration, schema ve seed değiştirilmedi.

### 16.1 Kapatılan davranışlar

- Review Center canlı sohbet, atanmamış bilet ve bekleyen SSS sayaçları açıkça `deletedAt: null` kullanıyor.
- `FaqService.findAll()` liste ve sayımda aynı aktif kayıt/status predicate'ini kullanıyor.
- FAQ tekil okuma, yayın listesi, approve, dismiss ve update yolları silinmiş kaydı okuyamıyor veya değiştiremiyor.
- `PATCH /faq/:id` gerçek `UpdateFaqDto` ile yalnız `question`, `answer`, `tags` alanlarını kabul ediyor. Unknown lifecycle alanları reddediliyor; servis ayrıca immutable explicit allowlist uyguluyor.
- DTO null, boş/whitespace içerik, uzunluk ve tag adet/uzunluk sınırlarını reddediyor. OpenAPI şeması runtime kontratıyla aynı `pattern`, `maxLength`, `maxItems` ve item `maxLength` bilgilerini yayımlıyor.
- Ticket listesi API hatasını gerçek boş kuyruktan ayırıyor, lokalize retry sunuyor ve eski eşzamanlı yanıtların güncel filtre sonucunu ezmesini request-id ile engelliyor.

### 16.2 TDD ve doğrulama kanıtı

- RED kanıtları: eksik active filtreleri, hata/empty ayrımı, stale 503 yarışı, deleted FAQ mutation/exposure, mass-assignment, null/blank ve OpenAPI drift testleri uygulama öncesi beklendiği şekilde başarısız oldu.
- Hedefli backend: **3 suite, 33/33**.
- Backend tam suite: **125/125 suite, 1168 passed, 1 skipped, 0 failed**.
- Frontend tam suite: **38/38 dosya, 262/262 test**.
- Backend/frontend typecheck, TR/EN/DE i18n, operations safety **24/24**, API route contract `frontend=182 / openapi=233 / missing=0 / raw-network=0`, RBAC source contract `roles=12 / permissions=19`, migration manifest **56/56**, yerel migration integrity ve `git diff --check` geçti.
- Bağımsız son code-review ve security-review: **GO**, Critical/High/Medium = **0/0/0**.
- Graphify etki sorgusu `FaqService`, `TicketsClient`, FAQ controller/processor ve ilgili test akışlarını doğruladı. Yerel GitNexus executable bulunmadığı için yeni kurulum yapılmadı.

### 16.3 Restore ve sınırlar

- Pre-work: `restore/pre-review-center-phase-a-20260807-2fa872d0`.
- Post-work: `restore/post-review-center-phase-a-20260807-69655f1c` → `69655f1c36e95cf16f843e9f2e3c59bb7f78ff39`.
- Complete-history bundle: `.private-data/restore-points/post-review-center-phase-a-69655f1c.bundle`.
- SHA-256: `466460f32cfb0bddf5a3adc478dd4f64c95f71bf18585a84aa12fb549f2a5c80`.
- `git bundle verify` ve `git fsck --strict` geçti; yalnız zararsız dangling tree kayıtları görüldü.
- Production/canlı/shadow bağlantısı veya yazımı, DB mutation, migration/seed, push, tag-push, deploy ve publish yapılmadı.

### 16.4 Açık kalan karar

Aşama B global soft-delete altyapı düzeltmesi hâlâ **NO-GO** durumundadır. Tam call-site envanteri, explicit deleted-record sözleşmesi, gerçek transaction/Proxy test matrisi ve ayrı kullanıcı onayı olmadan başlatılmayacaktır.
