# Gereksinimler Belgesi

## Giriş

Bu özellik, Aluplan Support Desk uygulamasındaki Microsoft Dynamics 365 CRM entegrasyonunun mevcut sorunlarını gidermek için geliştirilmektedir. Hedef; firma numarası (`customerNo`) verisinin doğru kaydedilmesi, alan etiketlerinin (label) Dynamics 365'ten doğru çekilmesi, option set alanlarının her zaman okunabilir metin olarak çözümlenmesi, hata yönetiminin iyileştirilmesi ve senkronizasyon sırasının garanti altına alınmasıdır.

## Sözlük

- **CRM_Sync_Service**: NestJS backend'deki `CrmService` ve `Dynamics365Adapter` bileşenlerinden oluşan senkronizasyon katmanı.
- **CrmAccount**: Dynamics 365'ten gelen firma (Account) kayıtlarını tutan veritabanı tablosu.
- **CustomerProfile**: Dynamics 365'ten gelen kişi (Contact) kayıtlarını tutan veritabanı tablosu.
- **CrmSyncLog**: Her senkronizasyon işleminin sonucunu ve hata detaylarını kaydeden tablo.
- **Discovery_Service**: Dynamics 365 metadata API'sini sorgulayarak mevcut alan adlarını ve etiketlerini döndüren servis bileşeni.
- **Field_Resolver**: `resolveField` metodunu içeren, CRM verisinden doğru alan değerini çıkaran bileşen.
- **Option_Set**: Dynamics 365'te seçim listesi (picklist) tipindeki alanlar; hem ham kod hem de `@OData.Community.Display.V1.FormattedValue` formatında gelir.
- **FormattedValue**: Dynamics 365 OData API'sinin option set alanları için döndürdüğü okunabilir metin değeri (örn. `"Aktif"`).
- **accountnumber**: Dynamics 365 Account varlığındaki firma numarası alanı (C300XXXXXX formatı).
- **customerNo**: `CrmAccount` tablosuna eklenecek, `accountnumber` değerini tutan yeni alan.
- **Sync_Orchestrator**: `executeSyncProcess` metodunu içeren, Account ve Contact senkronizasyon sırasını yöneten bileşen.
- **Admin**: CRM Kontrol Merkezi sayfasına erişim yetkisi olan sistem yöneticisi.

---

## Gereksinimler

### Gereksinim 1: CrmAccount Tablosuna customerNo Alanı Eklenmesi

**Kullanıcı Hikayesi:** Bir Admin olarak, firma numarasının (accountnumber) CrmAccount tablosunda saklanmasını istiyorum; böylece aynı firmaya bağlı birden fazla müşteri bu numaraya erişebilsin.

#### Kabul Kriterleri

1. THE CRM_Sync_Service SHALL `CrmAccount` tablosunda `customerNo` adında, `VARCHAR(50)` tipinde, nullable bir alan içermelidir.
2. WHEN Dynamics 365'ten bir Account kaydı senkronize edildiğinde, THE CRM_Sync_Service SHALL `accountnumber` alanının değerini `CrmAccount.customerNo` alanına kaydetmelidir.
3. WHEN bir Contact kaydı senkronize edildiğinde ve ilgili Account zaten veritabanında mevcutsa, THE CRM_Sync_Service SHALL `CustomerProfile.customerNo` değerini `CrmAccount.customerNo` alanından almalıdır.
4. IF bir Account kaydında `accountnumber` alanı boşsa, THEN THE CRM_Sync_Service SHALL `CrmAccount.customerNo` alanını `null` olarak kaydetmelidir.
5. WHEN `CrmAccount.customerNo` alanı güncellenmek istendiğinde, THE CRM_Sync_Service SHALL mevcut kaydı `externalAccountId` üzerinden bulup `customerNo` değerini güncelleyebilmelidir.

---

### Gereksinim 2: Discovery'de Alan Etiketlerinin Doğru Çekilmesi

**Kullanıcı Hikayesi:** Bir Admin olarak, alan eşleştirme ekranında Dynamics 365 alanlarının gerçek görünen adlarını (label) görmek istiyorum; böylece hangi alanı seçmem gerektiğini doğru anlayabileyim.

#### Kabul Kriterleri

1. WHEN Discovery işlemi başlatıldığında, THE Discovery_Service SHALL Dynamics 365 Metadata API'sini (`EntityDefinitions` endpoint'i) kullanarak her alan için `DisplayName.UserLocalizedLabel.Label` değerini çekmelidir.
2. WHEN bir alanın `DisplayName.UserLocalizedLabel.Label` değeri boş veya mevcut değilse, THEN THE Discovery_Service SHALL o alanın `LogicalName` değerini görünen ad olarak kullanmalıdır.
3. THE Discovery_Service SHALL Account varlığına ait alanları `account` entity'sinden, Contact varlığına ait alanları `contact` entity'sinden ayrı ayrı çekmelidir.
4. WHEN Discovery verisi frontend'e döndürüldüğünde, THE Discovery_Service SHALL her alan için `{ logicalName, displayName, sampleValue }` yapısında bir nesne döndürmelidir.
5. WHEN `fetchEntityMetadata` metodu çağrıldığında, THE Discovery_Service SHALL `EntityDefinitions(LogicalName='{entityName}')/Attributes` endpoint'ini kullanarak metadata'yı çekmelidir.

---

### Gereksinim 3: Option Set Alanlarının Okunabilir Metin Olarak Çözümlenmesi

**Kullanıcı Hikayesi:** Bir Admin olarak, senkronizasyon sonucunda müşteri durumu ve sektör gibi seçim listesi alanlarının ham kod yerine okunabilir metin olarak kaydedilmesini istiyorum.

#### Kabul Kriterleri

1. WHEN THE Field_Resolver bir alan değeri çözümlerken, THE Field_Resolver SHALL önce `{fieldName}@OData.Community.Display.V1.FormattedValue` anahtarını kontrol etmelidir.
2. WHEN `{fieldName}@OData.Community.Display.V1.FormattedValue` anahtarı mevcut ve boş değilse, THEN THE Field_Resolver SHALL bu değeri döndürmelidir.
3. IF `{fieldName}@OData.Community.Display.V1.FormattedValue` anahtarı mevcut değilse veya boşsa, THEN THE Field_Resolver SHALL `{fieldName}` anahtarının ham değerini döndürmelidir.
4. WHEN `contractStatus` alanı senkronize edildiğinde, THE CRM_Sync_Service SHALL `new_musteridurumu@OData.Community.Display.V1.FormattedValue` değerini tercih etmelidir.
5. WHEN `industry` alanı Account'tan senkronize edildiğinde, THE CRM_Sync_Service SHALL `industrycode@OData.Community.Display.V1.FormattedValue` değerini tercih etmelidir.
6. THE Field_Resolver SHALL option set çözümleme mantığını `resolveField` metoduna entegre etmelidir; böylece tüm alan çözümlemeleri tutarlı biçimde çalışsın.

---

### Gereksinim 4: Hata Yönetiminin İyileştirilmesi

**Kullanıcı Hikayesi:** Bir Admin olarak, senkronizasyon sırasında hangi kayıtların neden başarısız olduğunu detaylı olarak görmek istiyorum; böylece sorunları hızlıca tespit edip çözebiliyeyim.

#### Kabul Kriterleri

1. WHEN bir Account veya Contact kaydı senkronizasyon sırasında başarısız olduğunda, THE CRM_Sync_Service SHALL başarısız kaydın `externalId` değerini, hata mesajını ve hata türünü loglara kaydetmelidir.
2. THE CRM_Sync_Service SHALL `CrmSyncLog.details` JSON alanına `{ failedRecords: [{ externalId, entityType, errorMessage, errorCode }] }` yapısında hata detaylarını kaydetmelidir.
3. WHEN bir Contact kaydı e-posta adresi olmadığı için atlandığında, THE CRM_Sync_Service SHALL bu durumu `CrmSyncLog.details` alanına `{ skippedRecords: [{ externalId, reason }] }` yapısında kaydetmelidir.
4. WHEN senkronizasyon tamamlandığında, THE CRM_Sync_Service SHALL `CrmSyncLog.details` alanında toplam başarılı, başarısız ve atlanan kayıt sayılarını içeren bir özet kaydetmelidir.
5. WHEN Admin senkronizasyon günlüğü sayfasını görüntülediğinde, THE Frontend SHALL her log kaydı için hata detaylarını genişletilebilir bir panel (expandable row) içinde göstermelidir.
6. IF `CrmSyncLog.details` alanında `failedRecords` listesi doluysa, THEN THE Frontend SHALL ilgili log satırında hata detaylarına erişilebilir bir "Detaylar" butonu göstermelidir.

---

### Gereksinim 5: Senkronizasyon Sırasının Garanti Edilmesi

**Kullanıcı Hikayesi:** Bir Admin olarak, senkronizasyon sırasında önce firmaların (Account), sonra kişilerin (Contact) işlenmesini istiyorum; böylece bir kişinin bağlı olduğu firma henüz oluşturulmamış olduğu için bağlantı kurulamama sorunu yaşanmasın.

#### Kabul Kriterleri

1. THE Sync_Orchestrator SHALL Account senkronizasyonu tamamlanmadan Contact senkronizasyonunu başlatmamalıdır.
2. WHEN Account senkronizasyonu bir hatayla sonuçlandığında, THEN THE Sync_Orchestrator SHALL Contact senkronizasyonunu başlatmamalı ve hatayı `CrmSyncLog`'a kaydetmelidir.
3. WHEN bir Contact kaydı senkronize edilirken ilgili parent Account veritabanında bulunamazsa, THEN THE CRM_Sync_Service SHALL bu Contact kaydını `accountId = null` ile kaydetmeli ve durumu `CrmSyncLog.details.skippedLinks` listesine ekleyerek loglara yazmalıdır.
4. WHEN bir Contact kaydı `accountId = null` ile kaydedildiğinde, THE CRM_Sync_Service SHALL bu durumu sessizce geçmemeli; `CrmSyncLog.details` alanına `{ contactExternalId, missingAccountExternalId }` bilgisini kaydetmelidir.
5. THE Sync_Orchestrator SHALL senkronizasyon sırasını şu şekilde garanti etmelidir: önce tüm Account kayıtları işlenir, ardından tüm Contact kayıtları işlenir.
