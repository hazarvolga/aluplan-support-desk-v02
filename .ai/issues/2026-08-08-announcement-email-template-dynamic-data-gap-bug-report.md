# 2026-08-08 — Duyuru Email Template Dinamik Veri GAP ve BUG Raporu

## 1. Kapsam

Bu rapor `/tr/admin/announcements` ekranındaki **Duyuru Yönetimi / Şablon Kütüphanesi / Şablon Düzenleyici** alanının, gerçek email gönderiminde dinamik alıcı verilerini doğru kullanıp kullanmadığını inceler.

İnceleme yalnız yerel kaynak kod ve yerel çalışan uygulama bağlamında yapıldı. Ürün kodu, migration, seed, veritabanı verisi, canlı sistem, push ve deploy işlemi yapılmadı.

## 2. Kısa Sonuç

Mevcut sistem email gövdesinde Handlebars değişkenlerini teknik olarak render edebiliyor; ancak duyuru şablonları için **kanonik değişken sözleşmesi yok**. Önizleme verisi ile gerçek broadcast verisi aynı şekle sahip değil. Bu nedenle kullanıcı arayüzünde doğru görünen bazı dinamik alanların gerçek gönderimde boş basılması mümkün.

En kritik iki problem:

1. **Subject alanı dinamik render edilmiyor.** `{{customer.firstName}}` gibi değişkenler email konusu içinde kullanılırsa alıcıya ham `{{...}}` olarak gidebilir.
2. **Preview mock verisi gerçek broadcast verisiyle uyumsuz.** Preview `customer.first_name`, `customer.full_name`, `customer.name` gibi alanları gösteriyor; gerçek gönderim `CustomerProfile` nesnesini `customer` olarak veriyor ve alanlar camelCase (`firstName`, `lastName`, `companyName`, `user.email`) geliyor.

Bu haliyle sistem “mail kesin doğru kişiye özel veriyle gider” garantisini vermiyor.

## 3. Sistem Akışı

### 3.1 Frontend

Dosya: `apps/frontend/src/app/[locale]/(dashboard)/admin/announcements/page.tsx`

- Şablon önizleme `api.email.previewTemplate('master-announcement', ...)` ile yapılır.
- Duyuru taslağı `api.announcements.create(...)` ile kaydedilir.
- Broadcast `api.announcements.broadcast(id)` ile başlatılır.
- Şablon kütüphanesi DB tabanlı `announcementTemplates` endpointlerini kullanır.

Kanıt:

- Önizleme mock verisi: satır 152-155.
- Kütüphane önizleme mock verisi: satır 182-185.
- Şablon kaydı `contentMjml` alanına yazılıyor: satır 207-212.
- Duyuru kaydı `contentMjml: contentHtml` olarak yazılıyor: satır 263-268.
- Render test butonu gerçek hedef alıcı verisiyle değil, editördeki içerikle preview çağırıyor: satır 598-600.

### 3.2 Backend Duyuru

Dosya: `apps/backend/src/announcements/announcements.service.ts`

- Broadcast hedefleri `customerProfile.findMany(...)` ile bulunur.
- Her hedef için `EmailService.enqueueEmail(...)` çağrılır.
- Gönderilen data içinde `customer: target` bulunur.

Kanıt:

- Hedef customer sorgusu: satır 140-152.
- Email enqueue data: satır 185-193.
- AnnouncementLog, email kuyruğa alınınca `SENT` işaretleniyor: satır 194-201.

### 3.3 Email Render Motoru

Dosya: `apps/backend/src/email/email.templates.ts`

- Render context `...data` ile kurulur.
- `contentHtml` varsa MJML section içine sarılır.
- Handlebars pass 1 raw MJML üzerinde, pass 3 final HTML üzerinde çalışır.

Kanıt:

- Render context: satır 172-182.
- `contentHtml` wrapper: satır 184-193.
- Handlebars/MJML render: satır 202-220.

Dosya: `apps/backend/src/email/email.controller.ts`

- Preview endpoint gerçek müşteri seçmez; standart mock data sağlar.
- Mock data frontend tarafından da override edilir.

Kanıt:

- Preview mock data: satır 337-344.
- Preview compile: satır 390-394.

## 4. Dinamik Veri Sözleşmesi

### 4.1 Gerçek broadcast context

Broadcast sırasında `customer` alanı, Prisma `CustomerProfile` nesnesidir ve ayrıca `user` içinde yalnız `id` ve `email` seçilir.

Kullanılabilecek muhtemel alanlar:

- `{{customer.firstName}}`
- `{{customer.lastName}}`
- `{{customer.companyName}}`
- `{{customer.customerNo}}`
- `{{customer.contractStatus}}`
- `{{customer.industry}}`
- `{{customer.user.email}}`

### 4.2 Preview context

Preview tarafında örnekler farklıdır:

- Create preview: `customer.first_name`, `customer.full_name`, `customer.email`
- Template library preview: `customer.name`, `customer.email`
- Backend default preview: `customer.first_name`, `customer.full_name`, `customer.email`

Bu nedenle `{{customer.full_name}}` preview'de dolabilir ama gerçek broadcast'te boş kalabilir.

## 5. Bulgular

### BUG-01 — Subject alanı dinamik değişkenleri render etmiyor

Şiddet: HIGH

Gerçek gönderimde `EmailProcessor` provider'a `subject: subject || compiled.subject` gönderiyor. Duyuru broadcast'i `announcement.subject` değerini doğrudan verir. `TemplateService.compile(...)` içinde subject render edilse bile explicit subject onu ezer.

Sonuç:

- `Merhaba {{customer.firstName}}, ürün güncellemesi` gibi bir konu gerçek alıcı için kişiselleşmez.
- Ham Handlebars ifadesi müşteriye gidebilir.

Kanıt:

- `AnnouncementsService.broadcast()` subject'i doğrudan veriyor: `apps/backend/src/announcements/announcements.service.ts:185-189`.
- `EmailProcessor.process()` provider'a explicit subject'i tercih ederek gönderiyor: `apps/backend/src/email/queues/email.processor.ts:98-103`.
- `TemplateService.compile()` subject için yalnız default döndürüyor; payload subject render etmiyor: `apps/backend/src/email/email.templates.ts:221-228`.

Beklenen davranış:

- Subject de aynı data context ile render edilmeli.
- Bilinmeyen değişken varsa fail-closed veya açık uyarı verilmeli.

### BUG-02 — Preview verisi gerçek broadcast verisiyle uyumsuz

Şiddet: HIGH

Preview `snake_case` ve `full_name/name` alanları kullanırken broadcast `CustomerProfile` camelCase alanlarını kullanır.

Sonuç:

- Preview'de doğru görünen `{{customer.full_name}}`, gerçek gönderimde boş basılabilir.
- Gerçekte çalışan `{{customer.firstName}}`, mevcut preview örneklerinde boş görünebilir.
- Admin yanlış güvenle broadcast başlatabilir.

Kanıt:

- Frontend create preview mock: `page.tsx:152-155`.
- Frontend library preview mock: `page.tsx:182-185`.
- Backend default preview mock: `email.controller.ts:337-344`.
- Broadcast gerçek data: `announcements.service.ts:185-193`.

Beklenen davranış:

- Preview, gerçek hedef sorgusundan seçilen güvenli örnek customer context'i ile render edilmeli.
- Alternatif olarak tek bir `buildAnnouncementEmailContext(customer)` helper'ı preview ve broadcast tarafından ortak kullanılmalı.

### GAP-03 — Kanonik değişken kataloğu yok

Şiddet: MEDIUM

Şablon editörü kullanıcıya hangi değişkenlerin güvenli ve destekli olduğunu göstermiyor. Backend DTO veya service katmanı da izinli değişken listesini doğrulamıyor.

Sonuç:

- Admin `{{customer.fullName}}`, `{{user.fullName}}`, `{{company.name}}`, `{{customer.email}}` gibi tahmini alanlar kullanabilir.
- Handlebars bilinmeyen alanları varsayılan olarak sessiz boş string yapacağı için hata yakalanmaz.

Beklenen davranış:

- UI'da “Kullanılabilir Değişkenler” paneli olmalı.
- Backend render öncesi kullanılan değişkenleri çıkarıp desteklenmeyenleri reddetmeli veya en azından draft/broadcast öncesi uyarı vermeli.

### BUG-04 — AnnouncementLog gerçek email teslim durumunu temsil etmiyor

Şiddet: MEDIUM

Broadcast sırasında `enqueueEmail(...)` başarılı olunca `AnnouncementLog.status` hemen `SENT` yapılır. Ancak gerçek SMTP/Resend/Gmail gönderimi daha sonra `EmailProcessor` içinde gerçekleşir. Ayrıca yorumda belirtildiği gibi `emailLogId` bağlanmıyor.

Sonuç:

- Gönderim geçmişinde “gönderildi” görünen kayıt aslında sadece kuyruğa alınmış olabilir.
- Dinamik render veya provider hatası sonradan oluşursa AnnouncementLog ile EmailLog arasında güvenilir bağlantı yoktur.

Kanıt:

- `AnnouncementLog` hemen `SENT`: `announcements.service.ts:194-201`.
- Kod yorumu emailLog bağının eksik olduğunu söylüyor: `announcements.service.ts:195-197`.
- Prisma modelinde `AnnouncementLog.emailLogId` alanı var ama pratikte doldurulmuyor: `packages/database/prisma/schema.prisma:1074-1088`.

Beklenen davranış:

- `enqueueEmail` log id döndürmeli veya `AnnouncementLog` ile `EmailLog` aynı transaction/iş akışında bağlanmalı.
- `AnnouncementLog.status` queued/sent/failed ayrımını gerçek processor sonucundan almalı.

### BUG-05 — Announcement email preference kategorisi yanlış olabilir

Şiddet: MEDIUM

`EmailService.mapTemplateToType(...)` yalnız `raw` veya `broadcast` template adlarını `ANNOUNCEMENTS` sayıyor. Modern HTML duyurular `master-announcement` ile gönderiliyor. Bu nedenle ANNOUNCEMENTS tercihi yerine default `SYSTEM` kategorisine düşebilir.

Sonuç:

- Kullanıcı “duyuru emaili istemiyorum” tercihi verse bile `master-announcement` SYSTEM olarak değerlendirilebilir.
- Ya da SYSTEM kapalıysa duyuru yanlış nedenle engellenebilir.

Kanıt:

- Broadcast modern HTML için `template: 'master-announcement'`: `announcements.service.ts:185-187`.
- `mapTemplateToType` `master-announcement` değerini ANNOUNCEMENTS saymıyor: `apps/backend/src/email/email.service.ts:145-162`.

Beklenen davranış:

- `master-announcement` açıkça `ANNOUNCEMENTS` kategorisine map edilmeli.

### GAP-06 — Varsayılan kütüphane placeholder'ları makine tarafından doğrulanmıyor

Şiddet: MEDIUM

Varsayılan şablonlarda `[Özellik Adı]`, `[Tarih]`, `[Dönem]`, `[Şirket Adı]` gibi çok sayıda manuel placeholder var. Bunlar Handlebars değişkeni değildir ve gönderim öncesi kalan placeholder kontrolü yoktur.

Sonuç:

- Mail müşteriye `[Tarih]`, `[Özellik Adı]` gibi ham metinlerle gidebilir.

Kanıt örnekleri:

- `announcement-templates.defaults.ts:35-41`
- `announcement-templates.defaults.ts:76-84`
- `announcement-templates.defaults.ts:182-185`
- `announcement-templates.defaults.ts:400-405`

Beklenen davranış:

- Broadcast öncesi `[...]` placeholder taraması yapılmalı.
- Admin kalan placeholder'ları bilinçli override etmeden gönderim yapılamamalı.

### GAP-07 — Template contract testi yok

Şiddet: MEDIUM

Mevcut announcement testleri broadcast sayısı, log izolasyonu ve excerpt gibi davranışları kapsıyor; fakat subject/body dynamic variable render sözleşmesi, preview/broadcast context eşitliği ve unsupported variable fail behavior kapsanmıyor.

Kanıt:

- `apps/backend/src/announcements/announcements.service.spec.ts` içinde broadcast excerpt ve list/read testleri var; kişiselleştirme sözleşmesi yok.
- `apps/backend/src/announcement-templates/__tests__/announcement-templates.service.spec.ts` CRUD ağırlıklı; render contract yok.

Beklenen davranış:

- `buildAnnouncementEmailContext` için unit test.
- `preview` ve `broadcast` aynı context builder'ı kullanıyor mu test.
- Unknown variable ve kalan bracket placeholder testleri.
- Subject render testi.

### GAP-08 — Şablon editörü content alanını `contentMjml` adıyla taşıyor

Şiddet: LOW

Frontend rich HTML içerik üretse de payload alanı `contentMjml` olarak adlandırılmış. Kodda bu durum “legacy compatibility” yorumlarıyla geçiyor.

Sonuç:

- Bakım yapan geliştirici veya admin açısından mental model bulanık: alan MJML mi, HTML mi, rich text mi?
- `isMjml` ayrımı içerik prefix'ine bakarak yapılıyor; semantik olarak açık bir `contentFormat` yok.

Kanıt:

- `page.tsx:207-212`
- `page.tsx:263-268`
- `announcements.service.ts:180-187`

Beklenen davranış:

- `contentFormat: RICH_HTML | MJML` gibi explicit bir sözleşme.
- DB alanı ileride migrate edilmese bile API DTO seviyesinde net isimlendirme.

## 6. Güvenli Düzeltme Planı

Kod değişikliğine geçilecekse önerilen sıra:

1. Önce mevcut durumu commit/restore point ile sabitle.
2. `AnnouncementEmailContext` helper'ı oluştur:
   - `customer.firstName`
   - `customer.lastName`
   - `customer.fullName`
   - `customer.companyName`
   - `customer.customerNo`
   - `customer.email`
   - `customer.userEmail`
   - `brand.*`
   - `unsubscribe_url`
3. Preview ve broadcast aynı helper'ı kullansın.
4. Subject render'ı ekle; provider'a ham subject yerine rendered subject gitsin.
5. Bilinmeyen `{{...}}` değişkenleri ve kalan `[Placeholder]` metinleri için broadcast öncesi fail-closed doğrulama ekle.
6. UI'da “Kullanılabilir Değişkenler” paneli ve tek tıkla ekleme kontrolü ekle.
7. `master-announcement` email type mapping'i `ANNOUNCEMENTS` yap.
8. `AnnouncementLog` ile `EmailLog` ilişkisini gerçek enqueue/process sonucu üzerinden bağla.
9. Testler:
   - subject personalization,
   - body personalization,
   - preview/broadcast context parity,
   - unsupported variable rejection,
   - bracket placeholder rejection,
   - preference category mapping,
   - announcement log/email log linkage.

## 7. GO / NO-GO

Bu analiz sonucuna göre mevcut yapı için **NO-GO** öneriyorum: müşteri adı, firma adı veya benzeri kişiselleştirilmiş dinamik veri içeren bir duyuru emailini canlı müşterilere göndermeden önce yukarıdaki en az ilk 7 madde kapatılmalı.

Kişiselleştirme kullanmadan, yalnız statik içerik ve marka/footer değişkenleriyle gönderim yapılacaksa risk daha düşüktür; yine de `[Tarih]` gibi manuel placeholder kalmadığı kontrol edilmelidir.

## 8. Değişiklik Kapsamı

Bu rapor hazırlanırken ürün kodu değiştirilmedi. Yalnız bu analiz dosyası eklendi. Önceden var olan `.ai/current-focus.md` yerel not değişikliği bu rapordan bağımsızdır.

---

## 9. Claude bağımsız doğrulama alanı

**Tarih:** 2026-08-08 · **İnceleme türü:** Yalnız kaynak kod, test dosyaları, Prisma şeması · **Kod/test/DB yazımı:** Yapılmadı · **Production/shadow bağlantısı:** Yapılmadı

Codex'in bu rapordaki hiçbir iddiasına güvenmeden, her bulguyu kaynaktan yeniden okuyarak tek tek doğruladım. Aşağıda her madde için kendi bağımsız dosya:satır kanıtım var.

### Doğrulanan bulgular

**BUG-01 (Subject render edilmiyor) — DOĞRULANDI, tam zincir okundu:**
- `apps/backend/src/announcements/announcements.service.ts:188` → `subject: announcement.subject` — ham, DB'den gelen string, hiçbir render'dan geçmeden `enqueueEmail`'e veriliyor.
- `apps/backend/src/email/queues/email.processor.ts:47` → `const { template, to, subject, data, logRef } = job.data;` ve satır 102 → `subject: subject || compiled.subject` — `subject` (ham) her zaman truthy olduğu için `compiled.subject`'e hiç ulaşılmıyor.
- `apps/backend/src/email/email.templates.ts:236` → `subject: data.dynamicSubject || 'Aluplan Destek - Yeni Bildirim'` — bu değer de kendisi bir `Handlebars.compile(...)` çağrısından geçmiyor; yalnız statik fallback. Announcement akışında `data.dynamicSubject` hiç set edilmediği için bu satır zaten hiç devreye girmiyor.
- Sonuç: admin subject alanına `{{customer.firstName}}` yazarsa, bu ifade **hiçbir noktada** render edilmeden, ham `{{customer.firstName}}` metniyle müşteriye gider. Kanıt tam ve kesin.

**BUG-02 (Preview/broadcast context uyumsuzluğu) — DOĞRULANDI, üç farklı mock şekli tek tek okundu:**
- `apps/frontend/.../admin/announcements/page.tsx:152` (create preview) → `customer: { first_name, full_name, email }`.
- `apps/frontend/.../admin/announcements/page.tsx:182` (kütüphane preview) → `customer: { name, email }`.
- `apps/backend/src/email/email.controller.ts:337` (backend varsayılan preview mock) → `customer: { first_name: 'John', full_name: 'John Doe', email: 'john@example.com' }`.
- Gerçek broadcast (`announcements.service.ts:192`) → `customer: target` — ham Prisma `CustomerProfile` (`firstName`, `lastName`, `companyName`, `customerNo`, `contractStatus`, `industry`, `user:{id,email}`).
- Üç mock şeklinin **hiçbiri** gerçek şekille eşleşmiyor; üçü kendi aralarında da tutarsız. Kanıt tam.

**BUG-04 (AnnouncementLog SENT işaretlemesi, emailLogId bağlanmaması) — DOĞRULANDI, hatta biraz daha netleştirildi:**
- `apps/backend/src/email/email.service.ts:71` → `enqueueEmail(payload): Promise<void>` — dönüş tipi `void`, çağırana hiçbir id döndürmüyor.
- Ancak `email.service.ts:127-134`'te aslında bir `EmailLog` satırı (`draftLog`, `status:'QUEUED'`) gerçekten oluşturuluyor ve `draftLog.id` `emailQueue.add(...)`'a `logRef` olarak veriliyor (satır 138) — yani ID'nin kendisi zaten üretiliyor, yalnızca `AnnouncementsService`'e **döndürülmüyor**. Bu, düzeltmenin (dönüş tipini `Promise<string>` yapıp `draftLog.id` döndürmek) beklenenden daha küçük/kolay bir değişiklik olduğunu gösteriyor — raporun remediation planındaki madde 8 ile uyumlu, hatta biraz daha ucuz.
- `packages/database/prisma/schema.prisma:1082` → `emailLogId String? @unique @map("email_log_id")` alanı gerçekten şemada var ve `EmailLog`'a ilişkili.
- `grep -rn "emailLogId" apps/backend/src` → yalnızca `announcements.service.ts:195`'teki **yorumda** geçiyor, hiçbir gerçek `.update()`/`.create()` çağrısında set edilmiyor. Kanıt tam.

**BUG-05 (Yanlış email preference kategorisi) — DOĞRULANDI, birebir:**
- `apps/backend/src/email/email.service.ts:167-182` → `mapTemplateToType()`: yalnız `template === 'raw' || template === 'broadcast'` → `'ANNOUNCEMENTS'`; `master-announcement` ne bu listede ne `tickets`/`system` dizilerinde — son satır `return 'SYSTEM'; // Default fallback` devreye giriyor.
- `announcements.service.ts:186` → `template: isMjml ? 'raw' : 'master-announcement'` — `isMjml` çoğu modern HTML duyuru için `false` olacağından (MJML/`<mj-` ile başlamayan zengin metin içerik varsayılan durumdur), **varsayılan/yaygın yol** `master-announcement`'tır ve bu **SYSTEM**'e düşer, `ANNOUNCEMENTS`'a değil. Gerçek, ciddi bir tercih/rıza (consent) hatası — kullanıcı yalnız "duyuru" bildirimlerini kapatsa bile SYSTEM açıksa duyuru almaya devam eder.

**GAP-06 (Manuel `[placeholder]` kalıntısı) — DOĞRULANDI:**
- `apps/backend/src/announcement-templates/announcement-templates.defaults.ts` içinde `grep -c` ile **19 adet** `[Tarih]`/`[Şirket Adı]`/`[Özellik Adı]`/`[Dönem]` deseni bulundu; örneğin satır 35 `subject: 'Yakında Geliyor: [Özellik Adı] – İlk Bakış'` — placeholder **subject alanında bile** var (BUG-01 ile birleşince: bu subject zaten hiç render edilmeyecek, ama `[Özellik Adı]` da hiçbir mekanizmayla doldurulmuyor). Broadcast öncesi `[...]` taraması `announcements.service.ts`'in tamamında **yok** — doğrulandı.

**GAP-03/GAP-07 (Kanonik sözleşme ve test eksikliği) — DOĞRULANDI:**
- `grep -rln "buildAnnouncementEmailContext"` → **sıfır sonuç**, böyle bir fonksiyon hiç yok.
- `apps/frontend/src` içinde "Kullanılabilir Değişkenler" paneline dair hiçbir bileşen yok.
- `announcements.service.spec.ts` test başlıkları tek tek listelendi: yalnız `generateExcerpt`, `findAll` soft-delete, `markLogRead`, `getMyUnreadCount`, `getMyAnnouncements` kapsıyor — **subject render, personalization, preview/broadcast parity, unknown-variable davranışı testlerinin hiçbiri yok**. Kanıt tam.

### Ek bulgular (Codex'in raporunda yok)

1. **Item 3'ün doğrudan kanıtı — "sessizce boş" davranışı sadece varsayım değil, kod okuyarak doğrulandı:** `email.templates.ts:206,222` → `Handlebars.compile(mjmlContent, { noEscape: true })` ve `Handlebars.compile(html, { noEscape: true })` — ikisinde de `strict: true` **yok**. Handlebars'ın resmi varsayılan davranışı (`strict` olmadan) tanımsız/bilinmeyen bir path'i (`{{customer.fullName}}` gibi, `fullName` alanı yoksa) hatasız, sessizce boş string'e çeviriyor. Yani GAP-03'ün "hata yakalanmaz" iddiası benzetme değil, kullanılan compile seçenekleriyle **doğrudan kanıtlanabilir**.
2. **Var olan ama bu sınıf hatayı yakalayamayan bir soft-validation katmanı bulundu:** `email.templates.ts:197` → `BaseEmailSchema.safeParse(renderContext)` çağrılıyor ve başarısız olursa yalnız `logger.error(...)` yapılıyor (göndermeyi durdurmuyor). Ancak `apps/backend/src/email/contracts/base.contract.ts:18-23`'teki `BaseEmailSchema` yalnız `userId`, `brand`, `t`, `unsubscribe_url` alanlarını tanımlıyor — **`customer` alanı şemada hiç yok**. Zod'un varsayılan (`.strict()` olmayan) davranışı tanımsız ekstra alanları görmezden geldiği için, bu validasyon katmanı BUG-02/GAP-03 sınıfı hatanın **hiçbirini yakalayamaz** — mevcut altyapı bu spesifik riske karşı zaten kör. Bu, remediation planına eklenebilecek somut bir ek adım: yeni `AnnouncementEmailContext` için de gerçek bir Zod şeması tanımlanmalı (yalnız helper fonksiyon yeterli değil, mevcut "soft validation" mekanizmasına gerçekten entegre edilmeli).
3. **`enqueueEmail`'in `EmailLog` ID'sini zaten ürettiği ama döndürmediği** (yukarıda BUG-04 altında detaylandırıldı) — bu, raporun kendisinin "muhtemelen küçük bir refactor" diye tahmin etmediği ama gerçekten öyle olduğunu kanıtlayan bir ayrıntı.

### Çürütülen veya zayıflatılan bulgular

Yok. Raporun teknik iddialarının tamamı (BUG-01, BUG-02, BUG-04, BUG-05, GAP-03, GAP-06, GAP-07) kaynak kod okunarak birebir doğrulandı; hiçbiri abartılı, yanlış karakterize edilmiş veya çürütülebilir bulunmadı. GAP-08 (alan adı `contentMjml`) ve item 5/6'daki diğer kanıt referansları da (page.tsx satırları) doğru.

### Açık kalan belirsizlikler

- E2E/gerçek e-posta gönderim testi çalıştırılmadı (kurallar gereği canlı/production/SMTP bağlantısı yasak); bu doğrulama tamamen statik kaynak kod okumasına dayanıyor. Kod akışı bu kadar net olduğu için ek çalışma zamanı kanıtına ihtiyaç duyulmadı, ama teyit isteniyorsa yerel bir test SMTP/Mailtrap ile uçtan uca bir deneme önerilir.
- `TicketEmailSchema` gibi diğer email tiplerinin kendi Zod şemaları olup olmadığı, yalnızca announcement/`BaseEmailSchema` bağlamı için kontrol edildi; sistemin geri kalanında benzer "şema var ama customer alanı eksik" deseni başka template'lerde de tekrarlanıyor olabilir — bu raporun kapsamı dışında, ayrıca taranmadı.

### GO / NO-GO

Codex'in **NO-GO** kararına **katılıyorum**, aynı gerekçelerle ve bağımsız kanıtla:

- **Kişiselleştirilmiş/dinamik duyuru (customer.\* değişkeni subject veya gövdede kullanan):** **NO-GO**. Subject hiçbir zaman render edilmiyor (BUG-01, kesin kanıtlı) — `{{...}}` sözdizimi ham olarak müşteriye gidebilir. Gövdede de preview ile broadcast'in gerçek veri şekli uyuşmuyor (BUG-02) ve tutarsız/eksik alanlar sessizce boş basılıyor (Handlebars `strict` kapalı, kanıtlı). Admin, önizlemede doğru görünen bir şablonu canlıda bozuk gönderebilir ve bunu **fark edemez**.
- **Yalnız statik içerik + marka/footer değişkeni (customer.\* kullanılmayan):** Risk düşük ama **sıfır değil** — (a) `master-announcement` kategorisi yanlış (BUG-05, SYSTEM'e düşüyor) yine de geçerli, kullanıcı consent tercihini etkiler; (b) varsayılan şablon kütüphanesinden kopyalanan içerikte `[Tarih]`/`[Şirket Adı]` gibi manuel placeholder kalma riski gerçek ve makine kontrolsüz (GAP-06). Statik gönderim öncesi en azından bu ikisi (kategori + bracket taraması) elle/manuel doğrulanmalı.

### Önerilen düzeltme sırası

Codex'in 9 maddelik planına katılıyorum; bağımsız incelemem sırasına şu netleştirmeleri ekliyorum:

1. Restore point (zaten rapor kuralı).
2. **Önce BUG-05 (kategori map) — tek satırlık, izole, düşük riskli, hemen düzeltilebilir bir fix; diğer düzeltmeler beklerken bile uygulanabilir.**
3. `AnnouncementEmailContext` helper'ı + **gerçek Zod şeması** (yalnız TypeScript tipi değil — mevcut `BaseEmailSchema.safeParse` altyapısına customer şekli eklenmeli, aksi halde yeni helper de aynı "sessiz görünmez hata" sınıfına düşer).
4. Preview ve broadcast'in aynı context builder'ı kullanması.
5. Subject render'ı ekle (aynı context, aynı Handlebars pass).
6. `enqueueEmail`'in dönüş tipini `Promise<string>` yapıp `draftLog.id` döndürmesi + `AnnouncementLog.emailLogId` bağlanması (yukarıda gösterildiği gibi bu beklenenden küçük bir değişiklik).
7. Bilinmeyen değişken/kalan `[bracket]` placeholder için broadcast-öncesi fail-closed tarama.
8. UI "Kullanılabilir Değişkenler" paneli.
9. Rapordaki 7 test senaryosu + benim eklediğim: yeni Zod şemasının gerçekten "customer alanı eksik/yanlış" senaryosunda `safeParse` başarısız döndüğünü doğrulayan bir test.

### Kod değişikliği yapıldı mı: Hayır

Yalnız bu doğrulama bölümü eklendi. Ürün kodu, test dosyası, migration, seed, DB verisi değiştirilmedi. Production/shadow/canlı sisteme bağlanılmadı. Commit atılmadı.

---

## 10. CODEX uygulama kaydı — BUG-05 yerel kapanış

**Tarih:** 2026-08-08
**Kapsam:** Yalnız `master-announcement` tercih kategorisi ve davranış regresyon testi
**Sonuç:** BUG-05 için **GO / kapalı by code + test**

### Uygulanan düzeltme

- `EmailService.mapTemplateToType(...)`, `master-announcement` değerini artık `ANNOUNCEMENTS` olarak sınıflandırıyor.
- Regresyon testi, kayıtlı kullanıcının `ANNOUNCEMENTS=false` tercihi olduğunda modern duyurunun kuyruğa eklenmediğini ve `EmailLog` oluşturulmadığını kanıtlıyor.
- Test önce mevcut davranışta RED oldu: sorgu `ALL` ve `SYSTEM` kategorileriyle yapıldığı için modern duyuru yanlışlıkla kuyruğa/loga giriyordu.
- Minimal düzeltmeden sonra aynı test GREEN oldu.

### Commit ve restore kanıtı

- Rapor/hafıza baseline commit'i: `cc1a7896` — `docs: record announcement email template risks`.
- Ürün commit'i: `8f40deef` — `fix: classify master announcement emails correctly`.
- Test commit'i: `bddd51ac` — `test: cover master announcement email preference`.
- Pre-change restore tag: `restore/pre-announcement-email-safety-20260808-cc1a7896`.
- Pre-change bundle SHA-256: `d174ba9c1687ca48e571f69349198d59bfe4c2770f821d1eb092aac64735c27c`.
- Post-fix restore tag: `restore/post-announcement-bug05-20260808-bddd51ac`.
- Post-fix complete-history bundle: `.private-data/restore-points/post-announcement-bug05-bddd51ac.bundle`.
- Post-fix bundle SHA-256: `236c1800c7ad09486b7bc5ecde455150c1d773437a6311874e1fa140f5b7b2f6`.
- Her iki bundle için `git bundle verify` geçti; `git fsck --strict` kritik hata vermedi, yalnız tarihsel dangling tree nesneleri gösterdi.

### Doğrulama

- Hedef test: `14/14` geçti.
- Genişletilmiş email/announcement regresyon seti: `4/4 suite`, `61/61 test` geçti.
- Tam backend suite: `125/125 suite`, `1169 passed`, `1 skipped`, `0 failed`.
- Backend TypeScript kontrolü geçti.
- `git diff --check` geçti.
- Bağımsız code-review: **GO**; test mock izolasyonu uyarısı commit öncesi kapatıldı.
- Bağımsız security/privacy review: **GO**; BUG-05 diff'ine ait Critical/High/Medium = `0/0/0`.

### Açık kalan sınırlar

- BUG-04 kapanmadı: tercih nedeniyle enqueue edilmeyen bir duyuru, `enqueueEmail(): Promise<void>` nedeniyle üst katmanda yine `SENT` kaydedilebilir; gerçek delivery/log linkage ayrı fazdır.
- BUG-01/BUG-02, GAP-03/GAP-06/GAP-07/GAP-08 kapanmadı. Subject render, kanonik `AnnouncementEmailContext` + Zod şeması, preview/broadcast paritesi, bilinmeyen değişken ve kalan `[placeholder]` koruması henüz uygulanmadı.
- Bu nedenle kişiselleştirilmiş/dinamik duyuru e-postaları hâlâ **NO-GO** durumundadır.
- Canlı/production/shadow bağlantısı, migration/seed, DB değişikliği, harici e-posta gönderimi, push/tag-push/deploy/publish yapılmadı.

---

## 10. Claude BUG-02 kapanışı (uygulayıcı olarak) — bağımsız Codex kontrolü isteniyor

**Tarih:** 2026-08-08 · **Rol notu:** Bu bölümde Claude, her zamanki bağımsız doğrulayıcı rolünden farklı olarak ürün kodunu **kendisi yazdı** (kullanıcı talebiyle). Codex bu teslimatı, Claude'un daha önce Codex teslimatlarını doğruladığı aynı disiplinle **bağımsız olarak** kontrol etmelidir — bu bölümdeki hiçbir iddiaya güvenilmeden.

### Kapatılan bulgu

**BUG-02 (Preview verisi gerçek broadcast verisiyle uyumsuz)** dar kapsamda kapatıldı. BUG-01, BUG-04, GAP-03 (kısmi), GAP-06, GAP-07 (kısmi) hâlâ açık.

### Yapılan değişiklikler

1. **Yeni dosya** `apps/backend/src/announcements/announcement-email-context.ts`:
   - `buildAnnouncementEmailContext(customer)` — `CustomerProfile` + `user.email` alan kümesini kanonik `{firstName, lastName, fullName, companyName, customerNo, email, userEmail}` şekline eşliyor.
   - `AnnouncementCustomerContextSchema` (Zod, `.strict()`) ve `AnnouncementEmailSchema = BaseEmailSchema.extend({customer: ...})` — ileride kullanılmak üzere gerçek şema tanımlandı (bkz. "Bilinçli açık bırakılan" altında kapsam notu).
   - Yan fayda: `industry`, `contractStatus`, `tags`, `id`, `userId` gibi iç/CRM alanları artık email render context'ine hiç girmiyor — şablon yazan biri yanlışlıkla `{{customer.contractStatus}}` yazsa bile hiçbir zaman bir değer bulamaz.
2. `announcements.service.ts` `broadcast()`: `customer: target` → `customer: buildAnnouncementEmailContext(target)`.
3. `apps/frontend/.../admin/announcements/page.tsx`: iki preview çağrı noktası (`handlePreview`, `handleTemplatePreview`) artık aynı modül-seviyesi `PREVIEW_CUSTOMER_CONTEXT` sabitini kullanıyor; üç farklı eski mock şekli (`first_name/full_name`, `name`) kaldırıldı.
4. tr/en/de `admin.announcements.editor.default_content`: yeni duyuru taslağının varsayılan içeriğindeki çalışmayan `[customer.name]` (tr/en) / yanlış-alanlı `{{customer.name}}` (de) yerine gerçekten çalışan `{{customer.firstName}}` kondu.
5. Yeni test dosyaları: `announcement-email-context.spec.ts` (10 test), `announcements.service.spec.ts`'e eklenen 2 test (broadcast'in kanonik şekli gönderdiğini ve iç alanları sızdırmadığını doğruluyor), `apps/frontend/src/lib/announcement-preview-context.spec.ts` (4 test — FE/BE alan adı paritesini kilitliyor).

### Bilinçli açık bırakılan kapsam

- **`TemplateService.compile()` hâlâ `BaseEmailSchema.safeParse` kullanıyor, yeni `AnnouncementEmailSchema`'ya bağlanmadı.** `TemplateService` için hiçbir test altyapısı (dosya sistemi bağımlı, statik sınıf) mevcut değildi; test yazmadan bu bağlantıyı kurmak riskli olacağından bilinçli olarak bu commit'in dışında bırakıldı. Bu, GAP-03'ün "gerçek Zod şeması render'a bağlanmalı" kısmının hâlâ açık olduğu anlamına geliyor — şema tanımlı ama devrede değil.
- BUG-01 (subject hâlâ render edilmiyor), BUG-04 (AnnouncementLog erken SENT + emailLogId bağı yok), GAP-06 (kalan `[bracket]` placeholder taraması yok), GAP-07 (unknown-variable/fail-closed testi yok), GAP-08 (`contentMjml` adlandırması) **hiçbiri bu commit'te ele alınmadı.**
- **Kişiselleştirilmiş/dinamik duyuru e-postaları için NO-GO aynen sürüyor.**

### TDD kanıtı

- `announcement-email-context.spec.ts`: modül dosyası oluşturulmadan önce test çalıştırıldı → `Cannot find module './announcement-email-context'` (RED, gerçek). İmplementasyon sonrası 10/10 GREEN.
- `announcements.service.spec.ts` yeni testler: `buildAnnouncementEmailContext` çağrısı `announcements.service.ts`'e bağlanmadan önce çalıştırıldı → iki test de gerçek assertion hatasıyla düştü (`Received` çıktısında ham `target` nesnesi — `industry`, `contractStatus`, `tags`, `id`, `userId`, iç içe `user` objesi — görüldü). Bağlama sonrası 22/22 GREEN (tüm dosya).

### Doğrulama kanıtı (Claude'un kendi koşusu)

- Backend tam suite: **126/126 suite**, **1181 passed**, **1 skipped**, **1182 total**, **0 failed**.
- Frontend tam suite: **39/39 dosya**, **266/266 test**.
- Backend/frontend `tsc --noEmit`: 0 hata.
- `pnpm i18n:check`: tr/en/de tam.
- `pnpm api:verify-frontend-contract`: `frontend=182, openapi=233, missing=0, raw-network=0`.
- `pnpm test:ops-safety`: 24/24.
- `pnpm rbac:verify-contract`, `pnpm db:verify:migration-files`: değişmedi, geçti (sanity).
- `git diff --check`: temiz.

### Commit ve restore point

- Ürün + test commit'i (tek commit): `d8f42c6d` — `fix: unify announcement email customer context (BUG-02)`.
- Pre-work tag: `restore/pre-announcement-context-parity-20260808-7e681af0`; bundle `.private-data/restore-points/pre-announcement-context-parity-7e681af0.bundle`; SHA-256 `e4a762f9d71ed91f162336dcaa3ad4d027b6ce9d8ec895b685f6bd36be83af83`.
- Post-work tag: `restore/post-announcement-context-parity-20260808-d8f42c6d`; bundle `.private-data/restore-points/post-announcement-context-parity-d8f42c6d.bundle`; SHA-256 `c80bdc364bc6beede8f7061b0c88efc1b6f7b966fd0109547fe51fdac9c1de80`.
- `git bundle verify` ve `git fsck --strict` her ikisi de kritik hata olmadan geçti.
- Push, tag-push, deploy yapılmadı; production/shadow/canlı sisteme bağlanılmadı; migration/seed çalıştırılmadı.

### Codex'ten istenen bağımsız kontrol

1. `announcement-email-context.ts`'i kaynak koddan oku: `buildAnnouncementEmailContext`'in gerçekten `firstName/lastName/fullName/companyName/customerNo/email/userEmail` döndürdüğünü ve `industry/contractStatus/tags/id/userId` gibi hiçbir iç alanı sızdırmadığını doğrula.
2. `announcements.service.ts:broadcast()`'in artık `customer: target` değil `customer: buildAnnouncementEmailContext(target)` gönderdiğini doğrula.
3. `page.tsx`'teki iki preview çağrı noktasının da aynı `PREVIEW_CUSTOMER_CONTEXT` sabitini kullandığını ve eski üç farklı mock şeklinin (`first_name`, `full_name`, `name`) kalmadığını doğrula.
4. tr/en/de `default_content`'in artık `{{customer.firstName}}` içerdiğini, eski `[customer.name]`/yanlış `{{customer.name}}`'in kalmadığını doğrula.
5. Yeni testleri bağımsız çalıştır; RED iddiasını (test dosyası/implementasyon geçici olarak kaldırılıp) yeniden üretmeyi dene veya en azından testlerin gerçekten bu davranışı ölçtüğünü kod okuyarak teyit et.
6. `TemplateService.compile()`'a dokunulmadığını (yalnız `BaseEmailSchema` kullanmaya devam ettiğini) ve bunun bilinçli, belgelenmiş bir kapsam dışı bırakma olduğunu doğrula — kazayla unutulmuş bir adım değil.
7. Restore point hash'lerini bağımsız hesapla; diff kapsamının yalnız announcements/frontend-page/i18n dosyalarıyla sınırlı olduğunu, migration/schema/DB/production'a girilmediğini git diff/history ile doğrula.
8. Tam test/typecheck/i18n/ops-safety/api-contract kapılarını bağımsız çalıştır.

Bu doğrulama tamamlanana kadar BUG-01/BUG-04/GAP-06/07/08 fazlarından hiçbirine geçilmemeli; kişiselleştirilmiş duyuru NO-GO kararı aynen sürer.

---

## 11. Claude Faz 1 kapanışı (uygulayıcı olarak) — bağımsız Codex kontrolü isteniyor

**Tarih:** 2026-08-08 · **Kapsam:** BUG-01 (subject render), GAP-06 (kalan bracket placeholder taraması), GAP-03'ün fail-closed unknown-variable kısmı.

### Yapılan değişiklikler

1. **Yeni dosya** `apps/backend/src/announcements/announcement-content-safety.ts`:
   - `extractHandlebarsVariablePaths(template)` — gerçek Handlebars AST'ını (`Handlebars.parse`) kullanarak, regex değil, template içindeki tüm `{{...}}` değişken yollarını çıkarıyor; block helper adlarını (`if`/`each`), `@index` gibi data değişkenlerini ve `this`'i hariç tutuyor.
   - `findUnknownCustomerVariables(paths)` — yalnız `customer.*` öneki taşıyan yolları, kanonik 7 alan listesiyle (`firstName/lastName/fullName/companyName/customerNo/email/userEmail`) karşılaştırıp bilinmeyenleri döndürüyor. `brand.*`, `unsubscribe_url` gibi diğer alanlara dokunmuyor.
   - `findLeftoverBracketPlaceholders(text)` — `[Tarih]`, `[Şirket Adı]` tarzı kalıntı placeholder'ları buluyor.
   - `assertAnnouncementContentIsSafeToSend(subject, contentMjml)` — yukarıdaki ikisini birleştirip herhangi biri bulunursa `BadRequestException` fırlatıyor.
   - `renderAnnouncementSubject(subject, context)` — subject'i gövdeyle aynı customer context'iyle, aynı `noEscape:true` ayarıyla Handlebars üzerinden render ediyor.
2. `announcements.service.ts:broadcast()`:
   - `assertAnnouncementContentIsSafeToSend(...)` çağrısı, `announcement` bulunduktan hemen sonra, **durum `SENDING`'e çevrilmeden önce** ekleniyor — reddedilen bir broadcast hiçbir DB durumunu değiştirmiyor, hiçbir müşteri sorgulanmıyor.
   - Döngü içinde `subject: announcement.subject` → `subject: renderAnnouncementSubject(announcement.subject, customerContext)` — her alıcı için kendi context'iyle render ediliyor.
3. `email.processor.ts`, `TemplateService.compile()` ve diğer `enqueueEmail` çağıranları (`customers.service.ts`, `ai-reporting.service.ts`) **dokunulmadı** — kapsam bilinçli olarak yalnız `announcements.service.ts` ile sınırlı tutuldu.

### TDD kanıtı

- `announcement-content-safety.spec.ts`: modül dosyası oluşturulmadan önce test çalıştırıldı → `Cannot find module` (RED, gerçek). İmplementasyon sonrası **21/21 GREEN** ilk denemede.
- `announcements.service.spec.ts`'e eklenen 5 entegrasyon testi gerçek `broadcast()` akışına karşı çalışıyor: subject render, subject'te/content'te bracket placeholder reddi, content'te bilinmeyen değişken reddi, temiz içeriğin sorunsuz geçmesi. Placeholder/unknown-variable testlerinde ayrıca `enqueueEmail`'in hiç çağrılmadığı ve `prisma.announcement.update`/`customerProfile.findMany`'nin hiç tetiklenmediği (yani durumun SENDING'e çevrilmediği) doğrulanıyor.

### Bir TypeScript tip sorunu ve düzeltmesi (şeffaflık için not)

İlk yazımda `import type { AST as HandlebarsAST } from 'handlebars'` ile tip hatası aldım — `@types/handlebars`, AST tiplerini (`Node`, `Program`, `PathExpression`, ...) modülün export'u olarak değil, ayrı bir global ambient namespace (`hbs`) altında tanımlıyor. `tsc --noEmit` bunu hemen yakaladı (9 hata); `hbs.AST.*` global tip referanslarına geçilerek düzeltildi, testler değişmeden geçmeye devam etti. Bu, typecheck'in neden her fazın zorunlu bir doğrulama adımı olduğunun somut bir örneği.

### Doğrulama kanıtı

- Backend tam suite: **127/127 suite**, **1207 passed**, **1 skipped**, **1208 total**.
- Frontend tam suite: **39/39 dosya**, **266/266 test** (bu faz frontend'e dokunmadı, sanity kontrolü).
- Backend/frontend `tsc --noEmit`: 0 hata (Handlebars tip düzeltmesinden sonra).
- `pnpm i18n:check`: tr/en/de tam.
- `pnpm test:ops-safety`: 24/24.
- `pnpm api:verify-frontend-contract`: `frontend=182, openapi=233, missing=0, raw-network=0`.
- `git diff --check`: temiz.

### Commit ve restore point

- Ürün+test commit'i: `df724734` — `fix: render announcement subject and fail closed on unsafe content (BUG-01, GAP-06, GAP-03)`.
- Pre-work (Faz 1 öncesi): tag `restore/pre-announcement-phase1-20260808-b6ed33a2`; bundle SHA-256 `fe0fa12240b2bcb127e53c6fc8a1406f08025aed8aecbafaf54372139142ed56`.
- Post-work: tag `restore/post-announcement-phase1-20260808-df724734`; bundle SHA-256 `cb31cf35ef8cafeba0cfc422a0691b517a4f52a1b685bd7e5ce38a28fcc1d8f3`.
- `git bundle verify` + `git fsck --strict`: kritik hata yok.
- Push, tag-push, deploy yapılmadı; production/shadow/canlı bağlantı, migration/seed yok.

### Hâlâ açık

- **BUG-04**: `AnnouncementLog` erken `SENT` işaretlemesi ve `emailLogId` bağının kurulmaması — Faz 2.
- **GAP-08**: `contentMjml` adlandırması — Faz 3, opsiyonel/düşük öncelik.
- **Kişiselleştirilmiş/dinamik duyuru için NO-GO aynen sürüyor** — Faz 2 kapanıp Codex bağımsız GO vermeden ve kullanıcı onayı olmadan değişmez.

### Codex'ten istenen bağımsız kontrol

1. `announcement-content-safety.ts`'i kaynak koddan oku: `extractHandlebarsVariablePaths`'in gerçekten Handlebars AST'ını kullandığını (regex değil), block helper adlarını path saymadığını doğrula.
2. `findUnknownCustomerVariables`'ın yalnız `customer.*` önekini kontrol ettiğini, `brand.*`/`unsubscribe_url`'a dokunmadığını doğrula.
3. `assertAnnouncementContentIsSafeToSend`'in `broadcast()` içinde durum `SENDING`'e çevrilmeden **önce** çağrıldığını; reddedilen bir çağrıda hiçbir DB yazımı/müşteri sorgusu olmadığını kod okuyarak teyit et.
4. `renderAnnouncementSubject`'in gerçekten her alıcı için ayrı ayrı, doğru customer context'iyle çağrıldığını doğrula.
5. `email.processor.ts`, `TemplateService.compile()`, `customers.service.ts`, `ai-reporting.service.ts`'in bu commit'te değişmediğini `git diff` ile doğrula.
6. Yeni testleri bağımsız çalıştır; özellikle placeholder/unknown-variable red testlerinde `enqueueEmail`'in hiç çağrılmadığını teyit et.
7. Tam backend/frontend suite, typecheck, i18n, ops-safety, api-contract kapılarını bağımsız çalıştır.
8. Restore point hash'lerini bağımsız hesapla; diff kapsamının yalnız `apps/backend/src/announcements/` ile sınırlı olduğunu doğrula.

Bu kontrol tamamlanmadan Faz 2'ye (BUG-04) geçilmeyecek.

---

## 12. Claude Faz 2 kapanışı (uygulayıcı olarak) — bağımsız Codex kontrolü isteniyor

**Tarih:** 2026-08-08 · **Kapsam:** BUG-04 (AnnouncementLog erken SENT işaretlemesi + emailLogId bağının kurulmaması).

### Yapılan değişiklikler

1. `EmailService.enqueueEmail()`: dönüş tipi `Promise<void>` → `Promise<string | null>`. Gerçek kuyruğa alma başarılıysa oluşturulan `EmailLog.id`'yi döndürüyor; üç "sessiz atlama" yolunda (production'da reserved/test alıcı, kullanıcı tür bazlı opt-out, kullanıcı global opt-out) `null` döndürüyor — önceden bu üç durumda da yalın `return;` vardı ve çağıran taraf başarıyla ayırt edemiyordu.
2. `AnnouncementsService.broadcast()`: `enqueueEmail(...)`'in dönüş değerine göre karar veriyor:
   - id döndüyse → `AnnouncementLog.update({status:'QUEUED', emailLogId: id})` — artık asla anında `SENT` yazmıyor.
   - `null` döndüyse (opt-out/engellenen alıcı) → `status:'SKIPPED'` — bu bir teslimat hatası değil, ayrı bir durum.
   - `enqueueEmail` hata fırlatırsa → değişmeyen mevcut `status:'FAILED'` davranışı.
3. **Yeni dosya** `apps/backend/src/announcements/announcement-log-reconciliation.service.ts`: `@Cron('*/2 * * * *')` ile iki dakikada bir, `status='QUEUED'` VE `emailLogId` dolu olan `AnnouncementLog` kayıtlarını buluyor, bağlı `EmailLog.status`'unu okuyup gerçek sonuca göre `SENT` (sentAt kopyalanarak) veya `FAILED` (error kopyalanarak) yapıyor. Hâlâ `QUEUED`/işlemde olan kayıtlara dokunmuyor, sonraki turda tekrar bakıyor. Bağlı `EmailLog` bulunamazsa (silinmiş/bozuk referans) çökmeden atlıyor.
4. `announcements.module.ts`'e yeni servis provider olarak eklendi. `ScheduleModule.forRoot()` zaten `AppModule` seviyesinde global olduğu için ek bir modül bağlama gerekmedi.
5. **`EmailProcessor` (`email.processor.ts`) ve BullMQ pipeline'ının kendisi hiç değiştirilmedi** — reconciliation servisi yalnız zaten yazılan `EmailLog` satırlarını okuyor; bu, tüm diğer e-posta türlerini (ticket, sistem) etkileme riskini sıfırlıyor.

### TDD kanıtı

- `email.service.spec.ts`'e eklenen 4 test önce RED (`Received: undefined` yerine `null`/id bekleniyordu), implementasyon sonrası GREEN.
- `announcements.service.spec.ts`'e eklenen 3 test RED durumunda **eski hatayı doğrudan gösterdi**: beklenen `{status:'QUEUED', emailLogId:...}` yerine gerçek çıktı `{status:'SENT', sentAt:...}` idi — yani test, mevcut buggy davranışı gerçek assertion farkıyla yakaladı. İmplementasyon sonrası GREEN.
- `announcement-log-reconciliation.service.spec.ts`: modül dosyası yokken `Cannot find module` (RED) → 7/7 GREEN ilk denemede (SENT/FAILED/QUEUED-bekliyor/eksik-EmailLog/çoklu-kayıt senaryoları dahil).

### Doğrulama kanıtı

- Backend tam suite: **128/128 suite**, **1221 passed**, **1 skipped**, **1222 total**.
- Frontend tam suite: **39/39 dosya**, **266/266 test** (bu faz frontend'e dokunmadı, sanity).
- Backend/frontend `tsc --noEmit`: 0 hata (diğer iki `enqueueEmail` çağıranı — `customers.service.ts`, `ai-reporting.service.ts` — dönüş değerini kullanmadıkları için sorunsuz derlendi).
- `pnpm i18n:check`, `pnpm test:ops-safety` (24/24), `pnpm api:verify-frontend-contract`, `git diff --check`: hepsi geçti.

### Commit ve restore point

- Ürün+test commit'i: `f4668592` — `fix: link AnnouncementLog to real EmailLog delivery outcome (BUG-04)`.
- Pre-work (Faz 2 öncesi = Faz 1 sonrası): tag `restore/post-announcement-phase1-20260808-df724734` (Faz 1 kapanışıyla aynı nokta).
- Post-work: tag `restore/post-announcement-phase2-20260808-f4668592`; bundle SHA-256 `f7d9d97a5edb787029fe45ce49da3cdd0e531005c38f5a76484bfeab26404e06`.
- `git bundle verify` + `git fsck --strict`: kritik hata yok.
- Push, tag-push, deploy yapılmadı; production/shadow/canlı bağlantı, migration/seed yok. Yeni cron job yalnız yerelde tanımlı, hiçbir deploy/production etkisi yok.

### Hâlâ açık

- **GAP-08** (opsiyonel, düşük öncelik, cosmetic — `contentMjml` adlandırması). Bu madde bir güvenlik/doğruluk kapısı değil.
- Ana rapordaki tüm HIGH/MEDIUM şiddetli bulgular (BUG-01, BUG-02, BUG-04, GAP-03, GAP-06) artık kapalı.
- **Kişiselleştirilmiş/dinamik duyuru için NO-GO**, Codex'in bu ve önceki fazları bağımsız doğrulaması ve kullanıcının açık onayı olmadan değişmez.

### Codex'ten istenen bağımsız kontrol

1. `email.service.ts`'in üç skip yolunda da (`return null;`) ve başarı yolunda (`return draftLog.id;`) doğru döndüğünü kaynak koddan doğrula.
2. `announcements.service.ts:broadcast()`'in `enqueueEmail`'in dönüş değerine göre `QUEUED`/`SKIPPED`/`FAILED` ayrımını doğru yaptığını doğrula.
3. `announcement-log-reconciliation.service.ts`'in yalnız `status='QUEUED' AND emailLogId IS NOT NULL` kayıtları sorguladığını, `EmailProcessor`'a hiç dokunmadığını doğrula.
4. `announcements.module.ts`'e servisin eklendiğini ve `ScheduleModule.forRoot()`'un zaten global olduğunu (ek modül bağlama gerekmediğini) teyit et.
5. Yeni testleri bağımsız çalıştır; özellikle "eski davranış" (her zaman SENT) iddiasının gerçek RED farkıyla kanıtlandığını kod/test geçmişinden teyit et.
6. `email.processor.ts` ve `customers.service.ts`/`ai-reporting.service.ts`'in bu commit'te değişmediğini `git diff` ile doğrula.
7. Tam backend/frontend suite, typecheck, i18n, ops-safety, api-contract kapılarını bağımsız çalıştır.
8. Restore point hash'lerini bağımsız hesapla; diff kapsamının yalnız `apps/backend/src/announcements/` ve `apps/backend/src/email/email.service.ts`(+spec) ile sınırlı olduğunu doğrula.

Bu kontrol tamamlanmadan ve kullanıcı onayı olmadan kişiselleştirilmiş duyuru gönderimine geçilmeyecek. GAP-08 (Faz 3) kullanıcı isterse ayrıca ele alınabilir.

---

## 13. Claude Faz 3 kapanışı (uygulayıcı olarak) — GAP raporundaki son madde, bağımsız Codex kontrolü isteniyor

**Tarih:** 2026-08-08 · **Kapsam:** GAP-08 (opsiyonel/düşük öncelik, kozmetik — `contentMjml` adlandırma netliği).

### Yapılan değişiklikler

1. **Yeni dosya** `apps/backend/src/announcements/announcement-content-format.ts`: `detectAnnouncementContentFormat(content): 'MJML' | 'RICH_HTML'` — daha önce yalnız `broadcast()` içinde satır içi (`content.trim().toLowerCase().startsWith('<mjml>')...`) yapılan tahmini, aynı mantıkla, isimli ve bağımsız test edilebilir bir fonksiyona çıkarıyor.
2. `announcements.service.ts:broadcast()`: satır içi `isMjml` hesaplaması artık bu fonksiyonu çağırıyor — **davranış değişmedi**, yalnız isimlendirildi.
3. `findAll()`/`findOne()`: dönen her `Announcement` nesnesine **okuma anında hesaplanan**, DB'de saklanmayan bir `contentFormat` alanı ekleniyor — API tüketicileri (admin arayüzü, ileride başka bir entegrasyon) artık formatı kendileri tahmin etmek zorunda değil.
4. **Migration yok, DB şeması değişmedi, `contentMjml` alan adı değişmedi** — raporun kendi talimatına ("DB alanı ileride migrate edilmese bile API DTO seviyesinde net isimlendirme") uygun, salt-okunur/hesaplanan bir alan.

### TDD kanıtı

- `announcement-content-format.spec.ts`: modül yokken `Cannot find module` (RED) → 6/6 GREEN ilk denemede (tam `<mjml>` dokümanı, çıplak `<mj-section>` fragmanı, case-insensitivity, düz zengin metin, boş içerik, metin içinde geçen "mjml" kelimesinin yanlış pozitif üretmemesi).
- `announcements.service.spec.ts`'e eklenen `findAll`/`findOne` testleri RED durumunda gerçek farkı gösterdi: beklenen `contentFormat` alanı yoktu, yalnız ham Prisma satırı dönüyordu. İmplementasyon sonrası GREEN.

### Doğrulama kanıtı

- Backend tam suite: **129/129 suite**, **1230 passed**, **1 skipped**, **1231 total**.
- Frontend tam suite: **39/39 dosya**, **266/266 test** (bu faz yalnız backend'e dokundu, sanity kontrolü).
- Backend/frontend `tsc --noEmit`: 0 hata.
- `pnpm i18n:check`, `pnpm test:ops-safety` (24/24), `pnpm api:verify-frontend-contract`, `git diff --check`: hepsi geçti.

### Commit ve restore point

- Ürün+test commit'i: `e4c2ddc8` — `fix: name and expose announcement content format explicitly (GAP-08)`.
- Post-work: tag `restore/post-announcement-phase3-20260808-e4c2ddc8`; bundle SHA-256 `6acafc97e8bc065d679469a7d3bbfd32be5c21911a2ea7d1740f83fa2447c01f`.
- `git bundle verify` + `git fsck --strict`: kritik hata yok.
- Push, tag-push, deploy yapılmadı; migration/seed yok; production/shadow/canlı bağlantı yok.

### Rapor durumu

Bu, GAP raporundaki **son açık madde**. BUG-01, BUG-02, BUG-04, GAP-03 (fail-closed kısmı), GAP-06, GAP-08 — hepsi yerel olarak kapatıldı. Codex'in raporun 10-11-12-13 numaralı bölümlerindeki bağımsız kontrol taleplerinin hiçbiri henüz gerçekleştirilmedi.

### Codex'ten istenen bağımsız kontrol

1. `detectAnnouncementContentFormat`'ın `broadcast()`'teki eski satır içi mantıkla **birebir aynı** koşulu uyguladığını (davranış değişmediğini) kod karşılaştırmasıyla doğrula.
2. `findAll()`/`findOne()`'ın `contentFormat`'ı yalnız okuma anında hesapladığını, hiçbir `.create()`/`.update()` çağrısına yeni alan eklemediğini doğrula.
3. Şema/migration dosyalarının bu commit'te değişmediğini `git diff` ile doğrula.
4. Yeni testleri bağımsız çalıştır.
5. Tam backend/frontend suite, typecheck, i18n, ops-safety, api-contract kapılarını bağımsız çalıştır.
6. Restore point hash'ini bağımsız hesapla.

**Nihai durum:** Üç fazın (§10, §11/12, §13) tamamı Codex tarafından bağımsız doğrulanmadan ve kullanıcı açık onay vermeden kişiselleştirilmiş/dinamik duyuru e-postası gönderimi **NO-GO** olarak kalır.

---

## 14. CODEX bağımsız doğrulaması — kısmi GO, genel NO-GO

**Tarih:** 2026-08-08

**İncelenen commitler:** `d8f42c6d`, `df724734`, `f4668592`, `e4c2ddc8`

**Yöntem:** Claude kapanış iddialarına güvenmeden kaynak kod, çağrı zinciri, test içeriği, tek-seferlik salt-okunur davranış deneyleri, Git diff/tag/bundle ve yerel kalite kapıları yeniden kontrol edildi. Ürün kodu, DB, migration ve canlı sistem değiştirilmedi.

### Commit bazlı karar

| Commit / kapsam | Karar | Gerekçe |
|---|---|---|
| `d8f42c6d` — BUG-02 context alan paritesi | **GO (dar kapsam)** | Broadcast ham `CustomerProfile` yerine yedi alanlı kanonik customer context gönderiyor; iki frontend preview çağrısı aynı alan kümesini kullanıyor; eski alan adları kaldırılmış. |
| `df724734` — BUG-01/GAP-03/GAP-06 | **NO-GO** | Customer subject render ve temel bracket kontrolü çalışıyor; ancak iddia edilen fail-closed Handlebars allowlist tam değil ve runtime Zod sözleşmesi render zincirine bağlı değil. |
| `f4668592` — BUG-04 log/delivery bağı | **NO-GO** | `enqueueEmail()` id/null sözleşmesi ve ilk `QUEUED/SKIPPED/FAILED` ayrımı doğru; reconciliation retry ve webhook durum modelini yanlış terminalleştirebiliyor ve müşteri yanıtına iç hata alanlarını taşıyor. |
| `e4c2ddc8` — GAP-08 content format | **GO, bloklayıcı olmayan notlarla** | Alan salt-okunur ve additive; migration yok. Detector bazı geçerli MJML başlangıçlarını tanımıyor ve create/update yanıtlarıyla Swagger sözleşmesi tam simetrik değil. |

### Bloklayıcı bulgular

1. **HIGH — Handlebars güvenlik kontrolü gerçek bir fail-closed allowlist değil.**

   `announcement-content-safety.ts:35-76,83-88` yalnız doğrudan `MustacheStatement`/`BlockStatement` path'lerini ve yalnız metinsel `customer.` önekini kontrol ediyor. `SubExpression`, hash argümanları, partial, parent-depth/scope ve slash biçimleri kapsanmıyor. `{{unknownRoot}}`, `{{brand.typo}}`, `{{#if (lookup customer 'name')}}...{{/if}}` ve `{{log value=customer.name}}` yerel davranış deneyinde kabul edildi. Böylece bilinmeyen değişkenler sessizce boş basılabilir. Mevcut testler bu kenarları kapsamıyor.
2. **HIGH — Geçici worker hatası kalıcı yanlış `AnnouncementLog=FAILED` üretebilir.**

   `email.processor.ts:134-158` her başarısız attempt'te `EmailLog=FAILED` yazıp BullMQ retry için tekrar throw ediyor. Cron `announcement-log-reconciliation.service.ts:33-63` içinde yalnız `AnnouncementLog=QUEUED` kayıtlarını seçip ilk `FAILED` sonucunu terminalleştiriyor. Sonraki retry başarılı olup `EmailLog=SENT` olsa bile announcement log artık taranmadığından yanlış `FAILED` kalır.
3. **MEDIUM — Bounce/delivery sonucu announcement loguna doğru yansımıyor.**

   Processor provider kabulünde `EmailLog=SENT` yazar; webhook daha sonra `DELIVERED` veya `BOUNCED` yapabilir (`email.controller.ts:106-131`). Reconciliation yalnız `SENT/FAILED` ele alıyor ve `AnnouncementLog=SENT` olduktan sonra tekrar taramıyor. Bounce olmuş ileti kalıcı olarak SENT görünebilir.
4. **MEDIUM — Müşteri API yanıtı iç e-posta takip ayrıntılarını açıyor.**

   Broadcast `emailLogId` kaydediyor, cron ham provider/SMTP `error` metnini `AnnouncementLog.error` alanına kopyalıyor. `getMyAnnouncements()` Prisma satırının tamamını döndürdüğü için müşteri yanıtında iç UUID ve altyapı hata ayrıntısı bulunabilir (`announcements.service.ts:294-308`). Müşteri yanıtı explicit select/DTO allowlist kullanmalı.

### Kapsam notları

- `AnnouncementEmailSchema` tanımlı fakat `TemplateService.compile()` hâlâ soft `BaseEmailSchema.safeParse()` kullanıyor; GAP-03 runtime doğrulama kısmı kapalı değildir.
- Subject renderer yalnız `{customer}` context'i alıyor. Güvenlik kontrolünün izin verdiği `{{brand.name}}` subject deneyi `""` üretti. Subject için desteklenen değişken sözleşmesi açıkça daraltılmalı veya gerçek brand/unsubscribe context'iyle aynı renderer kullanılmalı.
- Preview iki akışta da `master-announcement` kullanırken broadcast MJML için `raw`, HTML için `master-announcement` seçiyor. Alan-adı paritesi doğrulandı; genel preview/broadcast render paritesi henüz davranışsal olarak kanıtlanmadı.
- Reconciliation sorgusu limitsiz ve kayıt başına bir `EmailLog` sorgusu yapıyor; dağıtık kilit/overlap koruması ve koşullu terminal update yok. Bu, düzeltme fazında pagination/batch ve retry-aware durum modeliyle ele alınmalı.
- `detectAnnouncementContentFormat()` `<mjml lang="tr">`, BOM/XML-comment önekli geçerli MJML'i `RICH_HTML` sınıflayabilir. Bu GAP-08 için bloklayıcı değildir ancak regresyon testi eklenmelidir.

### Bağımsız doğrulama çıktıları

- Odak backend: **7/7 suite, 110/110 test**.
- Odak frontend preview: **1/1 dosya, 4/4 test**.
- Tam backend: **129/129 suite, 1230 passed, 1 skipped, 0 failed**.
- Tam frontend: **39/39 dosya, 266/266 test**.
- Backend/frontend typecheck, i18n TR/EN/DE, operations safety **24/24**, frontend API contract `182/233 missing=0 raw-network=0`, RBAC `roles=12 permissions=19`, migration manifest **56/56** ve `git diff --check`: geçti.
- Dört post/pre restore bundle hash'i rapordaki değerlerle birebir eşleşti; altı bundle için `git bundle verify` geçti; tag dereference değerleri doğru commitlere çözülüyor.
- Dört ürün commit'inde migration/schema/DB/production dosyası yok.

### Nihai karar ve sıradaki güvenli adım

**Genel karar: NO-GO.** Kişiselleştirilmiş/dinamik duyuru gönderimi açılmamalı; push/deploy/canlı gönderim yapılmamalı. Önce ayrı TDD fazında (1) tam Handlebars grammar allowlist + runtime announcement schema, (2) BullMQ retry-aware reconciliation, DELIVERED/BOUNCED eşlemesi ve müşteri response DTO allowlist düzeltmeleri yapılmalı. Bu düzeltmeler tekrar bağımsız Codex + Claude doğrulamasından geçmelidir.

---

## 15. Claude Faz 4 kapanışı — Codex'in 4 bloklayıcı bulgusu kapatıldı; bağımsız Codex kontrolü isteniyor

**Tarih:** 2026-08-08 · **Kapsam:** Codex'in §14'teki dört bloklayıcı bulgusunu kapatma.

### Önce yapılan: bağımsız doğrulama

Codex'in bulgularının hiçbirine körü körüne güvenmeden, kendi yazdığım kodu tekrar okuyarak dördünü de tek tek doğruladım (kullanıcıya ayrı bir mesajda aktarıldı) — dördü de gerçek çıktı, abartılı değildi.

### Kapatılan bulgular

1. **HIGH — Handlebars fail-closed kontrolü gerçek bir allowlist değildi.**
   - `extractHandlebarsVariablePaths()` artık `SubExpression`, `Hash` pair'leri ve `Partial(Block)Statement` node'larına da iniyor — `{{log value=customer.fullname}}` ve `{{#if (lookup customer 'name')}}` artık görülüyor.
   - `findUnknownCustomerVariables()` → `findUnknownAnnouncementVariables()`: artık yalnız `customer.*` değil, gerçek render context'te var olan tüm alanları (customer.\<7 alan>, brand.\<12 alan>, `unsubscribe_url`) allowlist'e alıyor, geri kalan her şeyi (bilinmeyen kök, çıplak `customer`/`brand`, `ticketId` gibi ilgisiz alanlar) reddediyor.
   - **Subject ve content ayrı doğrulanıyor**: `renderAnnouncementSubject()` yalnız `{customer}` context'i aldığından (brand/unsubscribe_url yok), subject artık yalnız `customer.*` ile sınırlı bir daha dar allowlist'ten (`findUnknownSubjectVariables`) geçiyor — `{{brand.name}}` subject'te artık reddediliyor (önceden sessizce boş basılırdı).
2. **HIGH — geçici retry hatası kalıcı FAILED üretebiliyordu.**
   `email.processor.ts` artık yalnız **son denemede** (`attemptsMade + 1 >= opts.attempts`) `EmailLog=FAILED` yazıyor; ara denemelerde durum değiştirilmiyor, yalnız uyarı logu basılıyor.
3. **MEDIUM — bounce sonucu yansımıyordu.**
   Yeni `reconcileSentLogsForBounces()`: `status=SENT` olan, son 48 saat içinde gönderilmiş kayıtları tarayıp bağlı `EmailLog=BOUNCED` olduğunda `AnnouncementLog=BOUNCED`'a çeviriyor. Her iki sorgu da (`reconcileQueuedLogs`, `reconcileSentLogsForBounces`) artık `take: 200` ile sınırlı (Codex'in "sorgusu limitsiz" notu da bu vesileyle kapatıldı).
4. **MEDIUM — müşteri API yanıtı iç detay sızdırıyordu.**
   `getMyAnnouncements()` artık `include` yerine explicit `select` kullanıyor: yalnız `id, status, sentAt, readAt, createdAt, announcement.{title,contentMjml}` — `emailLogId` ve `error` yanıttan tamamen çıkarıldı.

### Yol boyunca bulunan ek bir gerçek hata (kendi property-based testimizle yakalandı)

Madde 1'i düzeltirken mevcut `announcements.service.property.spec.ts` (fast-check tabanlı, önceden var olan bir dosya) kırmızıya döndü: rastgele üretilen `"{{"` (kapanmamış mustache) girdisiyle `Handlebars.parse()` **ham bir parser exception'ı** fırlatıyordu — `assertAnnouncementContentIsSafeToSend`'in her zaman temiz bir `BadRequestException` fırlatması gereken sözleşmesini ihlal ediyordu. Bu, benim Faz 1'de eklediğim koddaki gerçek bir hataydı, `try/catch` ile düzeltildi. Property test'in generator'ı da `fc.pre()` ile artık haklı olarak reddedilecek girdileri filtreliyor.

### TDD kanıtı

- Madde 1: Codex'in tam olarak bildirdiği dört senaryo (`{{unknownRoot}}`, `{{brand.typo}}`, `{{#if (lookup customer 'name')}}`, `{{log value=customer.fullname}}`) önce test edildi ve **gerçekten geçiyordu** (RED) — düzeltme sonrası hepsi reddediliyor (GREEN).
- Madde 2: `attemptsMade=0` (ara deneme) senaryosunda eski kod gerçekten `FAILED` yazıyordu (RED) — düzeltme sonrası yazmıyor (GREEN).
- Madde 3-4: modül/select yokken testler RED, implementasyon sonrası GREEN.
- Property test regresyonu: gerçek fast-check çalıştırması ham parser hatasıyla düştü (RED) — try/catch sonrası GREEN.

### Doğrulama kanıtı

- Backend tam suite: **130/130 suite**, **1264 passed**, **1 skipped**, **1265 total**.
- Frontend tam suite: **39/39 dosya**, **266/266 test**.
- Backend/frontend `tsc --noEmit`: 0 hata.
- `pnpm i18n:check`, `pnpm test:ops-safety`, `pnpm api:verify-frontend-contract`, `pnpm rbac:verify-contract`, `pnpm db:verify:migration-files`, `git diff --check`: hepsi geçti.

### Commit ve restore point

- Ürün+test commit'i: `edae3067` — `fix: close Codex's 4 blocking findings on announcement email safety`.
- Pre-work: tag `restore/pre-announcement-phase4-20260808-b801d66d`; bundle SHA-256 `8e48e6f3ab3e2a0fcd2d4c020b49bbf2ed2beb91a8ab2a0bfc0c9488998b4992`.
- Post-work: tag `restore/post-announcement-phase4-20260808-edae3067`; bundle SHA-256 `a1217ba28c38c8edc0778c32aa8615678f0ac6d615da9d1eba0f0b86a4af73ce`.
- `git bundle verify` + `git fsck --strict`: kritik hata yok.
- Push, tag-push, deploy yapılmadı; production/shadow/canlı bağlantı, migration/seed yok.

### Hâlâ açık (Codex'in "kapsam notları" — bloklayıcı değildi, bilinçli erteleniyor)

- `AnnouncementEmailSchema` hâlâ `TemplateService.compile()`'a bağlı değil (test altyapısı yok, Faz 1'den beri bilinçli).
- Preview/broadcast render paritesi yalnız alan-adı seviyesinde doğrulandı, tam davranışsal parite (gerçek MJML render çıktısı karşılaştırması) yapılmadı.

### Codex'ten istenen bağımsız kontrol

1. `announcement-content-safety.ts`'i tekrar oku: `SubExpression`/`Hash`/`Partial` node'larının gerçekten gezildiğini, `findUnknownAnnouncementVariables`'ın gerçek render context alanlarıyla eşleştiğini doğrula.
2. Subject/content ayrımının (`findUnknownSubjectVariables` vs `findUnknownAnnouncementVariables`) doğru uygulandığını kontrol et.
3. `email.processor.ts`'in `attemptsMade`/`opts.attempts` mantığını BullMQ'nun gerçek semantiğiyle (attemptsMade mevcut denemeden önceki sayıyı gösterir) karşılaştır.
4. `reconcileSentLogsForBounces()`'ın gerçekten yalnız son 48 saatlik `SENT` kayıtları taradığını, `BOUNCED` dışındaki durumları değiştirmediğini doğrula.
5. `getMyAnnouncements()`'ın artık `emailLogId`/`error` döndürmediğini doğrula.
6. Malformed Handlebars try/catch düzeltmesinin gerçekten `BadRequestException` fırlattığını, ham parser hatası sızdırmadığını doğrula.
7. Property-based testin generator filtresinin (`fc.pre()`) testin orijinal amacını (payload tamlığı) zayıflatmadığını, yalnız artık haklı olarak reddedilen girdileri elediğini kontrol et.
8. Kendi ortamında testleri/typecheck/i18n/ops-safety/api-contract'ı bağımsız çalıştır; restore point hash'lerini bağımsız hesapla; diff kapsamının yalnız announcements/email modülleriyle sınırlı olduğunu doğrula.

Bu doğrulama tamamlanana ve kullanıcı açık onay verene kadar kişiselleştirilmiş/dinamik duyuru gönderimi **NO-GO** olarak kalır.

---

## 16. CODEX bağımsız Faz 4 doğrulaması — kısmi kapanış, genel NO-GO

**Tarih:** 2026-08-08

**İncelenen ürün commit'i:** `edae3067`
**Yöntem:** Ortak rapordaki ve §15'teki kapanış iddialarına güvenilmeden kaynak kod, gerçek Handlebars davranışı, reconciliation durum geçişleri, testler, typecheck/contract kapıları ve restore bundle'ları yeniden kontrol edildi. Ürün kodu, DB, migration, canlı sistem, push veya deploy değiştirilmedi.

### Doğrulanan ve kapanan parçalar

- `EmailProcessor`, ara BullMQ denemelerinde `FAILED` yazmıyor; yalnız `attemptsMade + 1 >= attempts` olduğunda terminal hata kaydediyor. Hedefli testler ilk ve son deneme davranışını ölçüyor.
- `getMyAnnouncements()` explicit `select` kullanıyor; müşteri yanıtından `emailLogId` ve ham provider/SMTP `error` alanları çıkarılmış.
- Doğrudan bilinmeyen root/brand path, subexpression/hash ve malformed Handlebars senaryoları artık reddediliyor; parser hatası `BadRequestException` olarak normalize ediliyor.
- `edae3067` yalnız announcement/email modüllerindeki dokuz ürün/test dosyasını değiştiriyor; migration/schema/DB/env dosyası yok.
- Pre/post restore bundle SHA-256 değerleri raporla birebir eşleşti ve iki bundle da `git bundle verify` kontrolünden geçti.

### Kalan bloklayıcılar

1. **HIGH — `BlockStatement.path` hiç doğrulanmıyor; fail-closed allowlist hâlâ tamamlanmadı.**

   `announcement-content-safety.ts:106-112` block node'unda yalnız params/hash/program/inverse geziliyor; block'un kendi path'i kaydedilmiyor. Salt-okunur gerçek Handlebars deneyinde hem `{{#unknownHelper}}hidden{{/unknownHelper}}` hem `{{#brand.typo}}hidden{{/brand.typo}}` için çıkarılan path listesi boş kaldı, güvenlik kontrolü **ACCEPT** verdi ve gerçek renderer hata atmadan `""` üretti. Bu, bilinmeyen içeriğin yine sessizce kaybolabildiğini kanıtlıyor. Mevcut testlerde parametresiz bilinmeyen block/helper regresyonu yok.

2. **HIGH — Webhook cron'dan önce çalışırsa `AnnouncementLog=QUEUED` kalıcı kalıyor.**

   Email processor önce `EmailLog=SENT` yazıyor; Resend webhook'u bunu `DELIVERED` veya `BOUNCED` yapabiliyor (`email.controller.ts:126-131`). Ancak `reconcileQueuedLogs()` yalnız `SENT` ve `FAILED` durumlarını ele alıyor (`announcement-log-reconciliation.service.ts:71-83`). Salt-okunur mock davranış deneyinde `AnnouncementLog=QUEUED + EmailLog=DELIVERED` ve `...=BOUNCED` kombinasyonlarının ikisi de `updated:0` verdi. İki dakikalık cron'dan önce webhook gelmesi normal bir yarış olduğundan teslim edilmiş veya bounce olmuş duyuru süresiz `QUEUED` görünebilir. Yeni bounce pass yalnız zaten `AnnouncementLog=SENT` olmuş kayıtları taradığı için bu yarışı kapatmıyor.

3. **MEDIUM — `take:200` batch sınırı ilerleme garantisi vermiyor.**

   Hem QUEUED hem SENT/bounce sorgusunda `take:200` var; fakat cursor/orderBy yok ve sorgular yalnız gerçekten terminal/BOUNCED bağlı kayıtları DB tarafında filtrelemiyor. İlk 200 satırın bağlı EmailLog'u hâlâ QUEUED/SENT/DELIVERED ise aynı değişmeyen satırlar her cron'da yeniden seçilebilir; 201. ve sonraki terminal veya BOUNCED kayıtlar aç kalabilir. Batch limiti performans riskini sınırlar, ancak backlog ilerlemesini garanti etmez.

### Açık fakat önceden kabul edilmiş kapsam notları

- `AnnouncementEmailSchema` gerçek `TemplateService.compile()` zincirinde hâlâ enforce edilmiyor.
- Preview ile broadcast'in gerçek render çıktısı davranışsal olarak eşitlenmiş değil.

### Bağımsız doğrulama kanıtı

- Hedefli backend: **4/4 suite, 95/95 test**.
- Tam backend: **130/130 suite, 1264 passed, 1 skipped**.
- Tam frontend: **39/39 dosya, 266/266 test**.
- Backend/frontend typecheck: geçti.
- i18n kontrolü, ops-safety **24/24**, frontend API contract `182/233 missing=0 raw-network=0`, RBAC `roles=12 permissions=19`, migration manifest **56/56**, `git diff --check`: geçti.
- Restore SHA-256: pre `8e48e6f3ab3e2a0fcd2d4c020b49bbf2ed2beb91a8ab2a0bfc0c9488998b4992`; post `a1217ba28c38c8edc0778c32aa8615678f0ac6d615da9d1eba0f0b86a4af73ce`; ikisi de doğrulandı.

### Karar

**Genel karar: NO-GO.** `edae3067` önceki dört bulgunun önemli bölümünü gerçekten kapatıyor; ancak tam fail-closed Handlebars sözleşmesi ve webhook durum yarışı kapanmadı. Kişiselleştirilmiş/dinamik duyuru gönderimi açılmamalı. Sıradaki dar TDD düzeltmesi: (1) block path/helper allowlist'i, (2) QUEUED kayıtlar için `SENT/DELIVERED/BOUNCED/FAILED` eksiksiz durum eşlemesi, (3) DB tarafında uygun sonuca göre filtrelenen veya cursor ile ilerleyen batch modeli. Sonrasında yeniden Codex + Claude bağımsız doğrulaması gerekir.
