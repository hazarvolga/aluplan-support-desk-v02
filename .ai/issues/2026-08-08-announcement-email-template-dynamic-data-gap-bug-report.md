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
