# Uygulama Planı: CRM Senkronizasyon İyileştirmeleri

## Genel Bakış

Bu plan, Dynamics 365 CRM entegrasyonundaki beş kritik sorunu gidermek için gereken kodlama adımlarını kapsar. Her görev tamamlandıktan sonra commit yapılacaktır.

## Görevler

- [x] 1. Prisma şemasına `customerNo` alanı ekle ve migration oluştur
  - `packages/database/prisma/schema.prisma` dosyasındaki `CrmAccount` modeline `customerNo String? @map("customer_no") @db.VarChar(50)` alanını ekle
  - `npx prisma migrate dev --name add_customer_no_to_crm_account` komutuyla migration oluştur
  - Prisma client'ı yeniden oluştur (`npx prisma generate`)
  - _Gereksinimler: 1.1_

- [x] 2. `Dynamics365Adapter.syncAccounts` metodunu `customerNo` kaydedecek şekilde güncelle
  - [x] 2.1 `syncAccounts` içindeki `prisma.crmAccount.upsert` çağrılarına `customerNo: account.accountnumber ?? null` alanını ekle
    - Hem `update` hem `create` bloklarına eklenmelidir
    - `accountnumber` değeri `resolveField` ile değil doğrudan `account.accountnumber` üzerinden alınmalıdır
    - _Gereksinimler: 1.2, 1.4, 1.5_
  - [ ]* 2.2 `customerNo` round-trip property testi yaz (Özellik 1)
    - **Özellik 1: Account senkronizasyonu customerNo'yu doğru kaydeder**
    - `fc.record({ accountid: fc.uuid(), name: fc.string(), accountnumber: fc.option(fc.string({ maxLength: 50 })) })` ile test et
    - Senkronizasyon sonrası `CrmAccount.customerNo === account.accountnumber ?? null` doğrulanmalı
    - **Doğrular: Gereksinim 1.2, 1.5**

- [x] 3. `Dynamics365Adapter.resolveField` metodunu FormattedValue öncelikli hale getir
  - [x] 3.1 `resolveField` private metodunu güncelle: `crmKey` belirlendikten sonra `${crmKey}@OData.Community.Display.V1.FormattedValue` anahtarını kontrol et; mevcut ve boş değilse bu değeri döndür, aksi hâlde mevcut mantığa devam et
    - Dot notation desteği korunmalıdır
    - _Gereksinimler: 3.1, 3.2, 3.3, 3.6_
  - [ ]* 3.2 FormattedValue öncelik kuralı property testi yaz (Özellik 3)
    - **Özellik 3: FormattedValue ham değere göre önceliklidir**
    - `fc.string(), fc.string(), fc.string()` ile `fieldName`, `rawValue`, `formattedValue` üret
    - Her ikisi de mevcut olduğunda `resolveField` sonucunun `formattedValue` olduğunu doğrula
    - **Doğrular: Gereksinim 3.1, 3.2, 3.3**
  - [ ]* 3.3 `resolveField` birim testleri yaz
    - FormattedValue mevcut senaryosu, FormattedValue eksik senaryosu, FormattedValue boş string senaryosu
    - _Gereksinimler: 3.1, 3.2, 3.3_

- [x] 4. `Dynamics365Adapter.fetchEntityMetadata` metodunu `EntityDefinitions` endpoint'i kullanacak şekilde güncelle
  - [x] 4.1 `fetchEntityMetadata` içindeki URL'yi `EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,DisplayName&$filter=IsValidForRead eq true and AttributeType ne 'Virtual'` olarak değiştir
    - Mevcut `Attributes?$filter=EntityLogicalName eq '${entityName}'` URL'si kaldırılmalıdır
    - _Gereksinimler: 2.1, 2.5_
  - [ ]* 4.2 `fetchEntityMetadata` birim testi yaz
    - Mock axios ile doğru URL'nin oluşturulduğunu doğrula
    - `DisplayName` eksik alanda `logicalName` fallback'ini test et
    - _Gereksinimler: 2.2, 2.4_
  - [ ]* 4.3 Discovery alan yapısı property testi yaz (Özellik 4)
    - **Özellik 4: Discovery alanları gerekli yapıyı içerir**
    - `fc.array(fc.record({ LogicalName: fc.string(), DisplayName: fc.option(...) }))` ile test et
    - Her alanın `logicalName` ve `displayName` içerdiğini, `displayName`'in boş olmadığını doğrula
    - **Doğrular: Gereksinim 2.2, 2.4**

- [x] 5. `CrmService.executeSyncProcess` metoduna detaylı hata loglama ekle
  - [x] 5.1 `SyncDetails` arayüzünü `crm.service.ts` dosyasına ekle: `{ failedRecords, skippedRecords, skippedLinks, summary }`
    - `buildSyncDetails` yardımcı fonksiyonunu ekle: `failedRecords`, `skippedRecords`, `skippedLinks` listelerinden `summary` hesaplar
    - _Gereksinimler: 4.2, 4.4_
  - [x] 5.2 `executeSyncProcess` içinde `details` nesnesini biriktir ve `CrmSyncLog.update` çağrılarına `details` alanını ekle
    - `accountResult` ve `contactResult` üzerinden `failedRecords` ve `skippedRecords` toplanmalıdır
    - Hem başarılı hem hatalı sonlanma durumlarında `details` JSON olarak kaydedilmelidir
    - _Gereksinimler: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 5.3 Hata log yapısı property testi yaz (Özellik 5)
    - **Özellik 5: Hata log yapısı eksiksizdir**
    - `fc.array(fc.record({ externalId: fc.uuid(), entityType: fc.constantFrom('account', 'contact'), errorMessage: fc.string() }))` ile test et
    - `details.summary.errorCount === failedRecords.length` ve her kaydın zorunlu alanları içerdiğini doğrula
    - **Doğrular: Gereksinim 4.1, 4.2, 4.4**

- [x] 6. `Dynamics365Adapter.syncContacts` metoduna `skippedLinks` loglama ekle
  - [x] 6.1 `syncContacts` içinde `linkedAccountId` bulunamadığında `skippedLinks` listesine `{ contactExternalId, missingAccountExternalId }` ekle
    - `SyncResult` arayüzüne `skippedLinks` ve `skippedRecords` alanları eklenmeli (opsiyonel)
    - E-posta eksik Contact'lar `skippedRecords`'a `{ externalId: contact.contactid, reason: 'missing_email' }` olarak eklenmeli
    - _Gereksinimler: 5.3, 5.4_
  - [ ]* 6.2 Senkronizasyon sırası property testi yaz (Özellik 6)
    - **Özellik 6: Account sync hata verirse Contact sync hiç çağrılmaz**
    - Mock adapter ile `syncAccounts` hata döndürdüğünde `syncContacts`'ın çağrılmadığını doğrula
    - **Doğrular: Gereksinim 5.1, 5.2, 5.5**
  - [ ]* 6.3 `executeSyncProcess` birim testi yaz
    - Account hata verdiğinde Contact sync'in çağrılmadığını test et (mock adapter)
    - _Gereksinimler: 5.1, 5.2_

- [x] 7. Kontrol noktası — Tüm testlerin geçtiğinden emin ol
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 8. Frontend: `SyncLog` arayüzünü `details` alanıyla genişlet
  - `apps/frontend/src/app/[locale]/(dashboard)/customers/crm/page.tsx` dosyasındaki `SyncLog` arayüzüne `details: SyncDetails | null` alanını ekle
  - `SyncDetails` tipini aynı dosyada tanımla: `{ failedRecords: Array<{ externalId: string; entityType: string; errorMessage: string }>; skippedRecords: ...; skippedLinks: ...; summary: ... }`
  - `api.crm.getLogs` çağrısının `details` alanını döndürdüğünden emin ol (backend `getSyncLogs` zaten `details` içeriyor)
  - _Gereksinimler: 4.5_

- [x] 9. Frontend: Senkronizasyon günlüğü tablosuna genişletilebilir hata detayı paneli ekle
  - [x] 9.1 `SyncLogRow` bileşenini `page.tsx` içinde oluştur
    - `expandedLogId` state'i ile hangi satırın açık olduğunu takip et
    - `details?.failedRecords` listesi doluysa `data-testid="details-button"` özelliğine sahip "Detaylar" butonu göster
    - Buton tıklandığında ilgili satırın altında `externalId`, `entityType`, `errorMessage` sütunlarını içeren bir tablo aç
    - _Gereksinimler: 4.5, 4.6_
  - [ ]* 9.2 Detaylar butonu koşullu gösterim property testi yaz (Özellik 7)
    - **Özellik 7: Detaylar butonu yalnızca `failedRecords` doluyken gösterilir**
    - `fc.array(fc.record({ externalId: fc.uuid(), entityType: fc.string(), errorMessage: fc.string() }))` ile test et
    - `failedRecords.length > 0` iken butonun görünür, boşken gizli olduğunu doğrula
    - **Doğrular: Gereksinim 4.6**
  - [ ]* 9.3 `SyncLogRow` birim testi yaz
    - `failedRecords` boşken buton gizli, doluyken görünür senaryolarını test et
    - _Gereksinimler: 4.5, 4.6_

- [x] 10. Son kontrol noktası — Tüm testlerin geçtiğinden emin ol
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler opsiyoneldir; hızlı MVP için atlanabilir
- Her görev tamamlandıktan sonra commit yapılacaktır
- Property testleri minimum 100 iterasyon çalıştırılmalıdır
- Test etiketi formatı: `// Feature: crm-sync-improvements, Property {N}: {property_text}`
