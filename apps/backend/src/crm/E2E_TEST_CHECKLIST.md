# CRM Sync — E2E & Integration Test Checklist

Bu checklist, gerçek Dynamics 365 ortamına karşı local'de çalıştırılacak manuel doğrulama adımlarını içerir.
Tüm unit testler geçtikten sonra bu adımları sırayla uygula.

---

## Ön Koşullar

- [ ] Backend çalışıyor: `pnpm dev` (veya `scripts/start.sh`)
- [ ] `.env` dosyasında `ENCRYPTION_KEY` (64 hex char) tanımlı
- [ ] Dynamics 365 test ortamı erişimi mevcut (tenant, clientId, clientSecret, instanceUrl)
- [ ] Postman veya `curl` hazır

---

## BÖLÜM 1 — Bağlantı Kurma

### 1.1 Geçerli Bağlantı Kaydetme
```bash
curl -X POST http://localhost:3001/crm/connections \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "DYNAMICS_365",
    "instanceUrl": "https://<org>.crm4.dynamics.com",
    "tenantId": "<tenant-id>",
    "clientId": "<client-id>",
    "clientSecret": "<client-secret>",
    "webhookSecret": "test-webhook-secret-123"
  }'
```
**Beklenen:** `{ "id": "...", "provider": "DYNAMICS_365", "isActive": true }`

- [ ] HTTP 201 dönüyor
- [ ] `clientSecret` ve `webhookSecret` DB'de şifreli kaydedildi (Prisma Studio ile kontrol et)
- [ ] `syncStatus: "IDLE"` olarak kaydedildi

### 1.2 Geçersiz Credentials ile Bağlantı Denemesi
```bash
# clientSecret'i yanlış ver
curl -X POST http://localhost:3001/crm/connections \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "provider": "DYNAMICS_365", "instanceUrl": "...", "tenantId": "...", "clientId": "...", "clientSecret": "WRONG" }'
```
**Beklenen:** HTTP 400 `BadRequestException`

- [ ] 400 dönüyor
- [ ] DB'ye kayıt yapılmadı

### 1.3 Bağlantı Doğrulama (Verify)
```bash
curl -X POST http://localhost:3001/crm/verify-connection/<conn-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
**Beklenen:** `{ "success": true, "provider": "DYNAMICS_365" }`

- [ ] `success: true` dönüyor
- [ ] Token acquisition log'da görünüyor

---

## BÖLÜM 2 — Discovery (Alan Keşfi)

### 2.1 Discovery Endpoint
```bash
curl http://localhost:3001/crm/discovery/<conn-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
**Beklenen:** `{ "account": [...fields], "contact": [...fields] }`

- [ ] `account` array'i dolu (en az 10 alan)
- [ ] `contact` array'i dolu (en az 10 alan)
- [ ] Her field'da `logicalName`, `displayName`, `sampleValue` var
- [ ] `displayName` Türkçe/İngilizce label içeriyor (LogicalName değil)
- [ ] `sampleValue` gerçek veri içeriyor (null değil)

---

## BÖLÜM 3 — Tam Sync (Accounts + Contacts)

### 3.1 Sync Başlatma
```bash
curl -X POST http://localhost:3001/crm/sync/<conn-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
**Beklenen:** `{ "message": "Senkronizasyon başlatıldı.", "logId": "..." }`

- [ ] HTTP 200 anında dönüyor (background process)
- [ ] `logId` alındı

### 3.2 Sync Log Takibi
```bash
# Birkaç saniye bekle, sonra:
curl http://localhost:3001/crm/logs/<conn-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
**Beklenen:** En son log `status: "SUCCESS"` veya `"ERROR"`

- [ ] `status: "SUCCESS"` görünüyor
- [ ] `totalRecords > 0`
- [ ] `successCount > 0`
- [ ] `completedAt` dolu
- [ ] `details.summary.successCount` doğru toplamı gösteriyor

### 3.3 Account Verilerini Doğrula
```bash
curl http://localhost:3001/crm/accounts \
  -H "Authorization: Bearer <admin-jwt>"
```
- [ ] Account listesi dolu
- [ ] Her account'ta `name` dolu
- [ ] `customerNo` alanı `C3XXXXXX` formatında (accountnumber'dan geliyor)
- [ ] `customerNo: null` olan account'lar var mı? (accountnumber'ı olmayan firmalar için beklenen)
- [ ] `industry` alanı Türkçe/İngilizce metin içeriyor (sayı değil)
- [ ] `crmVerified: true`

### 3.4 Tek Account Detayı
```bash
curl http://localhost:3001/crm/accounts/<account-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
- [ ] `customers` array'i dolu (contact'lar bağlı)
- [ ] Her customer'da `user.email` var

### 3.5 Contact / CustomerProfile Doğrulama
Prisma Studio veya DB query ile:
```sql
SELECT cp.*, u.email FROM "CustomerProfile" cp
JOIN "User" u ON cp."userId" = u.id
WHERE cp."crmVerified" = true
LIMIT 10;
```
- [ ] `firstName`, `lastName` dolu
- [ ] `customerNo` alanı dolu (`C3XXXXXX` veya `DYN-XXXXXXXX`)
- [ ] `contractStatus` Türkçe metin içeriyor (sayı değil — FormattedValue çalışıyor)
- [ ] `accountId` bağlı (skippedLinks olmadıysa)
- [ ] `externalContactId` Dynamics GUID formatında

---

## BÖLÜM 4 — Hata Senaryoları

### 4.1 Sync Log Hata Detayları
Eğer `errorCount > 0` ise:
```bash
curl http://localhost:3001/crm/logs/<conn-id> \
  -H "Authorization: Bearer <admin-jwt>"
```
- [ ] `details.failedRecords` array'i dolu
- [ ] Her failed record'da `externalId`, `entityType`, `errorMessage` var
- [ ] `details.skippedRecords` — email'siz contact'lar burada
- [ ] `details.skippedLinks` — DB'de account'ı olmayan contact'lar burada

### 4.2 Accounts ERROR Durumunda Contacts Çalışmıyor
Token'ı geçici olarak geçersiz yap (DB'de clientSecret'i boz), sync başlat:
- [ ] `status: "ERROR"` görünüyor
- [ ] `errorMessage` "Account Sync Error" içeriyor
- [ ] Contact sync hiç başlamadı (log'da contact kaydı yok)

---

## BÖLÜM 5 — Webhook

### 5.1 Geçerli Webhook İsteği (Account)
```bash
curl -X POST http://localhost:3001/crm/webhooks/dynamics365 \
  -H "x-api-key: test-webhook-secret-123" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "account",
    "data": {
      "accountid": "test-webhook-acc-001",
      "name": "Webhook Test GmbH",
      "accountnumber": "C399999",
      "websiteurl": "https://webhook-test.com",
      "industrycode@OData.Community.Display.V1.FormattedValue": "Technology"
    }
  }'
```
**Beklenen:** `{ "status": "success", "message": "Webhook processed" }`

- [ ] HTTP 200 dönüyor
- [ ] DB'de `CrmAccount` kaydı oluştu
- [ ] `customerNo: "C399999"` kaydedildi
- [ ] `industry: "Technology"` kaydedildi

### 5.2 Geçerli Webhook İsteği (Contact)
```bash
curl -X POST http://localhost:3001/crm/webhooks/dynamics365 \
  -H "x-api-key: test-webhook-secret-123" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "contact",
    "data": {
      "contactid": "test-webhook-con-001",
      "emailaddress1": "webhook-test@aluplan.com",
      "firstname": "Webhook",
      "lastname": "Test",
      "jobtitle": "Tester",
      "new_musteridurumu@OData.Community.Display.V1.FormattedValue": "Aktif",
      "parentcustomerid_account": {
        "accountid": "test-webhook-acc-001",
        "name": "Webhook Test GmbH"
      }
    }
  }'
```
- [ ] HTTP 200 dönüyor
- [ ] `User` kaydı oluştu (`email: webhook-test@aluplan.com`)
- [ ] `CustomerProfile` kaydı oluştu
- [ ] `contractStatus: "Aktif"` kaydedildi
- [ ] `accountId` bağlı (önceki webhook account'ına)

### 5.3 Geçersiz API Key
```bash
curl -X POST http://localhost:3001/crm/webhooks/dynamics365 \
  -H "x-api-key: WRONG-KEY" \
  -H "Content-Type: application/json" \
  -d '{ "entity": "account", "data": {} }'
```
- [ ] HTTP 401 dönüyor
- [ ] DB'ye kayıt yapılmadı

### 5.4 Eksik API Key
```bash
curl -X POST http://localhost:3001/crm/webhooks/dynamics365 \
  -H "Content-Type: application/json" \
  -d '{ "entity": "account", "data": {} }'
```
- [ ] HTTP 401 dönüyor

### 5.5 Desteklenmeyen Entity
```bash
curl -X POST http://localhost:3001/crm/webhooks/dynamics365 \
  -H "x-api-key: test-webhook-secret-123" \
  -H "Content-Type: application/json" \
  -d '{ "entity": "lead", "data": {} }'
```
- [ ] HTTP 400 dönüyor

---

## BÖLÜM 6 — Pagination (Büyük Veri Seti)

> Dynamics 365 OData API varsayılan olarak 5000 kayıt döner. Eğer ortamda 5000+ account/contact varsa:

- [ ] Sync tamamlanıyor (timeout yok)
- [ ] `totalRecords` gerçek sayıyı yansıtıyor
- [ ] Tüm kayıtlar DB'ye yazıldı

> **Not:** Mevcut implementasyon pagination yapmıyor (`@odata.nextLink` takip etmiyor).
> Eğer 5000+ kayıt varsa bu bir risk. Aşağıdaki sorgu ile kontrol et:

```bash
# Dynamics 365'te toplam account sayısını öğren:
GET https://<org>.crm4.dynamics.com/api/data/v9.2/accounts?$count=true&$top=1
```
- [ ] Toplam kayıt sayısı < 5000 → Pagination riski yok
- [ ] Toplam kayıt sayısı ≥ 5000 → Pagination implementasyonu gerekli (aşağıya bak)

### Pagination Gerekiyorsa Yapılacaklar:
`dynamics365.adapter.ts` içinde `syncAccounts` ve `syncContacts`'a `@odata.nextLink` takibi ekle:
```typescript
// syncAccounts içinde, response.data.value'dan sonra:
let nextLink = response.data['@odata.nextLink'];
while (nextLink) {
    const nextResponse = await axios.get(nextLink, { headers });
    accounts.push(...nextResponse.data.value);
    nextLink = nextResponse.data['@odata.nextLink'];
}
```

---

## BÖLÜM 7 — Frontend Doğrulama

### 7.1 CRM Sayfası
- [ ] `/customers/crm` sayfası açılıyor
- [ ] Bağlantı listesi görünüyor
- [ ] "Sync Başlat" butonu çalışıyor
- [ ] Sync log tablosu güncelleniyor

### 7.2 Sync Log Detay Paneli
- [ ] `errorCount > 0` olan log'da "Detaylar" butonu görünüyor
- [ ] Butona tıklayınca failed record'lar açılıyor
- [ ] `externalId`, `entityType`, `errorMessage` kolonları dolu
- [ ] Tekrar tıklayınca kapanıyor (toggle)

### 7.3 Account Listesi
- [ ] Account tablosunda `customerNo` kolonu görünüyor
- [ ] `C3XXXXXX` formatında değerler var

---

## BÖLÜM 8 — Güvenlik Kontrolleri

- [ ] `/crm/*` endpoint'leri JWT olmadan 401 dönüyor
- [ ] `/crm/*` endpoint'leri `admin` rolü olmadan 403 dönüyor
- [ ] DB'de `clientSecret` ve `webhookSecret` şifreli (plain text değil)
- [ ] Log'larda secret değerleri maskelenmiş (`****` formatında)

---

## Sonuç

Tüm kutular işaretlendikten sonra canlıya geçiş onaylanabilir.

**Kritik Riskler (canlıya geçmeden önce mutlaka kontrol et):**
1. Pagination — 5000+ kayıt varsa sync eksik kalır
2. `contractStatus` FormattedValue — Dynamics 365 ortamında `new_musteridurumu` field'ı var mı?
3. `customerNo` format — `accountnumber` gerçekten `C3XXXXXX` formatında mı geliyor?
