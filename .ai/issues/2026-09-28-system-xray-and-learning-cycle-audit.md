# Sistem röntgeni: çalışma prensipleri, öğrenme döngüsü ve sözleşme farkları

Tarih: 28 Eylül 2026. Görev: kaynak kodu ve kullanıcıya sunulan açıklamaları salt-okunur incelemek. **Bu belge düzeltme, migration, üretim sorgusu, push veya deploy onayı değildir.**

## 1. Kimlik, yöntem ve dürüst kapsam

- Tek çalışma kökü: `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-release-candidate-20260919`.
- Dal: `security/release-candidate-20260919`.
- İncelenen HEAD: `20240db46ed086ab17cb20615f535b38d298cb62`.
- Remote: `https://github.com/hazarvolga/aluplan-support-desk-v02.git`.
- Önceden değişmiş ve bu görevde korunmuş dosyalar: `apps/frontend/next-env.d.ts`, `package.json`, `pnpm-lock.yaml`. Bu üçünün birleşik başlangıç diff SHA-256 değeri: `c16c01ba1002f74f5a830950486b56da8b97b594b08717a6bfb9742e0fecce4c`.
- Aynı günün önceki handoff belgesindeki frontend `8622312a` / backend `64d71aec` bilgisi **tarihsel dağıtım gözlemidir**. Bu denetimde SSH, Coolify, canlı DB/Redis veya imaj kimliği yenilenmedi. Yerel HEAD'i doğrudan canlı sürüm diye sunmuyoruz.
- Kullanıcının verdiği `/tr/help` ve `/tr/knowledge-pool` sayfaları Firefox'ta salt-okunur incelendi; yardım içeriği, aday ve URL kaynak durumları görüldü. Üretimde form gönderimi, AI, tarama, senkron, onay, gönderim veya bilet işlemi tetiklenmedi.

Git izlemeli `apps/backend/src`, `apps/frontend/src`, `packages/database/prisma`, `packages/shared-schemas` envanteri: **837 dosya, yaklaşık 128.700 satır**, 240 test dosyası; 45 frontend sayfası, 34 controller, 37 Nest module dosyası, 62 Prisma modeli ve 28 enum. Bunlar inceleme evreninin büyüklüğüdür, okunmuş satır sayısı veya test başarısı değildir. Docker/CI/i18n/operasyon belgeleri bu sayının dışındadır.

Üç paralel salt-okunur uzman incelemesi yapıldı: (1) AI/RAG/öğrenme, (2) kimlik/RBAC/CRM, (3) bilet/ekip/kanallar/SLA. Ana inceleme veri modeli, frontend, yardım, deployment/CI ve bulguların birleştirilmesini kapsadı. Kritik uçtan uca yollar servis/controller/olay/worker/depo/arayüz boyunca izlendi. **128.700 satırın her birinin elle incelendiğini, bütün testlerin çalıştığını veya bütün davranışların canlıda doğrulandığını iddia etmiyoruz.** Bölüm 16 kapsam sınırını açıklar. Bu bir geniş mimari ve davranış röntgenidir; tamamlanmış penetrasyon testi veya satır-başına sertifika değildir.

Kanıt sınıfları:

- **KOD:** mevcut dosyadan doğrudan görülen davranış.
- **ÇIKARIM:** kod birleşiminden çıkan, koşulları belirtilmiş sonuç; uygulamalı tekrar yok.
- **EKRAN:** bu görevde yardım ekranında görülen durum.
- **TARİHSEL:** önceki handoff/kanıt; güncel üretim garantisi değil.
- **AÇIK:** çalışma zamanı veya daha ayrıntılı okuma gerektiren konu.

Bu rapordaki kısa yollar çalışma köküne göredir. `B/` = `apps/backend/src/`, `F/` = `apps/frontend/src/`, `D/` = `packages/database/prisma/`. Satır atıfları bu HEAD ve çalışma ağacına aittir.

## 2. Ürün gerçekte nedir?

Bu proje yalnızca destek bileti CRUD uygulaması değildir. **CRM ile müşteri kimliğini besleyen, Allplan'a özgü teknik teşhis bağlamı kullanan, çok kanallı insan desteğini kaynak tabanlı AI yanıtları ve editoryal bilgi üretimiyle birleştiren bir destek operasyon platformudur.**

Altı ana sistem birlikte çalışıyor:

1. **Kimlik ve müşteri uygunluğu:** Dynamics kişi/şirket senkronizasyonu, yerel kullanıcı, hesap sahiplenme, e-posta doğrulama, rol/izinler.
2. **Destek operasyonu:** biletler, tek sorumlu, departman/ekip, mesaj/özel not/ekler, SLA, canlı ve proaktif sohbet.
3. **Ürüne özgü teşhis:** Allplan ürün/sürüm/kategori; Hotinfo donanım, lisans, işletim sistemi ve hata bağlamı.
4. **Bilgi üretimi ve arama:** insan yazımı makaleler, belgeler, URL/tarama adayları, SSS ve farklı vektör depoları.
5. **AI orkestrasyonu:** sağlayıcı seçimi/fallback, arama ve eşik, teşhis, taslak, özet, dil düzenleme, kuyruk/cache/telemetri.
6. **Operasyon ve yönetişim:** değerlendirme/onay kuyrukları, duyurular, e-posta takibi, raporlar, ayarlar, sağlık/iş kuyrukları ve Git/Coolify yayın süreci.

En güçlü taraf, bu sistemlerin gerçek veri modelleri ve çalışan akış kodlarıyla kurulmuş olmasıdır. En önemli eksik ise modüllerin tamamında **aynı kelimenin aynı durumu, aynı işlemin aynı güvenlik/teslim garantisini ifade etmemesi**. “Onay”, “öğrenildi”, “yayımlandı”, “sağlıklı” ve “ekibe atandı” ifadelerinde bu fark belirgindir.

## 3. Fiziksel mimari ve veri sahipliği

```text
TR / EN / DE Next.js arayüzü
  ├─ müşteri: teşhis → talep → yazışma → çözüm değerlendirme
  └─ personel: operasyon → taslak/özet → çözüm → bilgi inceleme
                   │ HTTP + HttpOnly oturum / WebSocket
                NestJS API
  ├─ PostgreSQL: kimlik, CRM, bilet, bilgi, log ve onay durumları
  │     └─ pgvector: article / pool / FAQ / ticket / semantic cache
  ├─ Redis: BullMQ işleri + cache + presence + iptal/kota bilgileri
  ├─ S3/R2 veya yerel storage: dosya içerikleri
  ├─ Dynamics 365: şirket ve kişi kaynağı
  ├─ SMTP/IMAP, imzalı webhook, WhatsApp: iletişim kanalları
  └─ AI sağlayıcıları: chat, embedding, görsel analiz, özet/çeviri
```

Stack: pnpm/Turborepo; Next 15/React 19; Nest 11; Prisma 7 + PostgreSQL adapter; BullMQ/Redis; pgvector; Docker. API, event listener, cron ve worker'lar aynı AppModule içinde toplanmış. Kodda `WORKER_MODE` kontrolü bulunması tüm servislerin güvenle ayrı worker dağıtımına bölündüğünü kanıtlamaz. Yatay çoğaltma bazı process-local cron/event/cache davranışlarını ayrıca değerlendirmeyi gerektirir. Kaynak: `B/app.module.ts:61-201`.

Veritabanı bütün dosyaların kendisi değildir: ticket eklerinin nesne içeriği storage'dadır. Redis de yalnız vazgeçilebilir cache değildir; posta ve AI işlerinin durumlarını taşır. DB yedeği tek başına dosya/posta/kuyruk kurtarma güvencesi sayılmaz. Bu inceleme yedekleri açmadı veya geri yükleme sınamadı.

| Veri kümesi | Temel modeller | İşlev |
|---|---|---|
| Kimlik | User, Role, Permission, RolePermission | Oturum sürümü, reset challenge, güncel izinler |
| Organizasyon | Department, Team, TeamMember, Skill, AgentSkill, Shift, AvailabilityOverride, SlaPolicy | Yönlendirme, iş yükü, çalışma takvimi |
| CRM | CustomerProfile, CrmAccount, CrmConnection, CrmSyncLog, DeltaSyncState, CrmChangeLog | Harici kayıt kimlikleri, doğrulama, cursor ve değişim izi |
| Bilet | Ticket, TicketMessage, Attachment, TicketEscalation | Müşteri işi, tek sorumlu, durum, ek ve SLA |
| AI izi | AiInteraction, InteractionFeedback, AiShiftDetection, AiResponseCache, AiHealthEvent | Yanıt/teşhis geçmişi, kabul/puan, cache, sağlık |
| Bilgi bankası | KnowledgeArticle, KnowledgeArticleVersion, KnowledgeEmbedding, ArticleFeedback | Editoryal içerik, sürüm ve arama vektörleri |
| Bilgi havuzu | KnowledgeSource, PoolEmbedding, CrawlCandidate, SyncLog | Dosya/web keşfi, içerik işleme ve arama |
| Öğrenme | FaqEntry, FaqEntrySource, TicketEmbedding, TrainingQueue, EvalDataset | SSS adayları, köken ilişkisi, örüntüler ve kalite ölçümü |
| İletişim | InboundEmailLog, EmailLog/Event/Preference, Announcement/Log/Template, ProactiveChatSession/Message | Tekrar işleme, teslim/tercih ve sohbet |

Kaynak: `D/schema.prisma`. Bu, veri modeli açısından çoğunlukla tek işletme platformudur; bir modelde `tenantId` görülmesi tam çok-kiracılı izolasyon kanıtı değildir.

## 4. CRM → hesap → giriş gerçekte nasıl çalışıyor?

### 4.1 Yeni müşteri

Dynamics tam senkronu önce şirketleri, ardından kişileri ortak kayıt eşleme servisine aktarır. E-postası olan yeni kişi ACTIVE yerel kullanıcıya dönüşebilir; `CRM_SYNCED` gerçek parola değil başlangıç işaretidir. E-postası olmayan kayıt placeholder ile INACTIVE olur. Hesap sahiplenme/parola sıfırlama yolu e-posta sahipliğini doğrulayıp gerçek parolayı kurar. Genel kayıt akışında yerel CRM doğrulanmış profil kontrolü ve e-posta doğrulaması vardır.

CRM kontrolü her seferinde Microsoft'a gerçek zamanlı sorgu değildir: yerel `crmVerified` profil eşleşmesi, pozitif 1 saat/negatif 15 dakika Redis cache'i kullanılır. Kaynak: `B/auth/auth.service.ts:217-228,308-368,435-478`; `B/customers/customers.service.ts:139-280`; `B/crm/crm.service.ts:125-165`; `B/crm/crm-email-validator.service.ts:183-243`.

### 4.2 Mevcut hesabın girişi

E-posta → yerel ACTIVE/silinmemiş kullanıcı → parola → güncel DB rol/izinleri → oturum. Her girişte canlı CRM üyeliği veya lisans/sözleşme uygunluğu sorgulanmaz. CRM'den silinen/pasifleşen profil `crmVerified=false` olabilir; gerçek parola edinmiş kullanıcı otomatik kapatılmaz. Yalnız `CRM_SYNCED` durumundaki kullanıcı pasifleştirilir. Bu, onaylı test hesaplarını koruyabilir ama **yalnız onaylı üç test adresine özgü dar istisna değildir**.

Kullanıcının iş kararı “CRM listesinde bulunması yeterli; ayrıca sözleşme uygunluğu şartı yok” şeklindedir. Bu rapor yeni lisans/sözleşme engeli önermiyor. Mevcut uygulamanın CRM'den çıkarılmış kullanıcıya nasıl davranacağı ise ayrı ve açık bir politika kararıdır; toplu kullanıcı kapatma gerekçesi olarak kullanılmamalı. Kaynak: `B/auth/auth.service.ts:48-100`; `B/crm/services/crm-record-sync.service.ts:338-448,589-597`.

### 4.3 Delta ve webhook

Beş dakikalık delta işi cursor tutar; hata halinde ilerletmez. Son CRM 400 düzeltmesi her 400'ü susturmaz: eski cursor, yedi günden eski başarı ve daha yeni **hatasız tam sync** gibi koşullar arar; yeni snapshot mevcut doğrulanmış kayıtları eksiltmemelidir. Tam sync'in SUCCESS etiketi satır hatası olmayacağını her yerde garanti etmez; `errorCount` da okunmalıdır. Worker completed durumu da uygulamanın CRM log SUCCESS durumu ile eşdeğer değildir. Kaynak: `B/crm/crm-delta-sync.service.ts:139-246`; `B/crm/adapters/dynamics365.adapter.ts:82-87,171-178`; `B/crm/crm.service.ts:420-451`.

## 5. Bilet, kategori, ekip, SLA ve iletişim

### 5.1 Yeni talep

Kategori seçimi departmana gider; “Lisanslama” `billing-payments` departmanına ve `licensing` etiketine eşlenir. Yeni departman yaratmaz. Ürün ve Hotinfo isteğe bağlı teşhis bağlamıdır. AI teşhisi başarısız olduğunda da insan destek bileti açılabilmelidir; kod bu yolu koruyor. Bilet oluşturma, ilk mesaj ve ek yüklemeleri frontend'de ayrı aşamalardır; ek hatası biletin varlığını geri almaz.

Sunucu bilet numarasını PostgreSQL sequence ile üretir. AI interaction bağlantısında sahiplik/yeniden kullanım ve unique yarış koruması vardır. Bilet DB'ye yazıldıktan sonra AI etiketleme, olaylar, yönlendirme ve bildirimler çalışır; bunlar aynı transaction değildir. Dolayısıyla “talep kaydoldu” ile “bütün yan işlemler tamamlandı” farklıdır. Kaynak: `F/lib/ticket-category-options.ts:14-37`; `F/app/[locale]/(dashboard)/tickets/new/page.tsx:190-530`; `B/tickets/tickets.service.ts:58-230`.

### 5.2 Ekibe atama konusunda kesin ayrım

- Ticket'ta **bir `assignedTo` ve bir `departmentId`** var; `teamId` veya çoklu sorumlu ilişkisi yok.
- Otomatik atama departmanın uygun ekip üyeleri içinden tek kişi seçiyor.
- Ekip filtresi ekip üyelerine atanmış biletleri gösteriyor; aynı departmandaki atanmamış biletleri otomatik ekip havuzu yapmıyor.
- Personelin genel bilet erişimi ise geniş; yalnız kendi ekip üyeliğine bağlı izolasyon değil.

Sonuç: **“Tüm ekip üyeleri görebilir” ile “bilet ekibin ortak sahipliğine atanmıştır” aynı özellik değildir. İkincisini tamamlanmış sayamayız.** Kaynak: `D/schema.prisma:610-665`; `B/tickets/auto-assignment.service.ts:27-103`; `B/tickets/tickets.service.ts:253-299`; `B/common/services/ticket-access.service.ts:44-58`.

### 5.3 Durum, çözüm ve puan

Ana durumlar NEW/OPEN/IN_PROGRESS/PENDING_CUSTOMER/PENDING_CUSTOMER_REVIEW/RESOLVED/CLOSED; otomatik AI taslak yolunda ayrıca DRAFT kullanılıyor. Personelin “Çözümü Onayla” metni mevcut UI'da müşteri değerlendirmesine geçişi temsil ediyor; doğrudan bilgi bankası yayınlama düğmesi değil. Müşteri değerlendirmesi skoru yazar, bileti CLOSED yapar; **düşük puan da kapatır**, >=4 ayrıca öğrenme olayı üretir. Bu, “sorunum devam ediyor” ile “düşük memnuniyetle kapatıyorum” ayrımını zayıflatıyor.

Personel CLOSED → OPEN yapabilir; eski kapanış bilgisi iç mesajla korunur, geçmiş silinmez. Müşteri yanıtı PENDING_CUSTOMER → OPEN yapar. Link/merge çocuk bileti kapatıp iç iz bırakır; soft delete veriyi fiziksel silmekten farklıdır. Genel/bulk update ile özel durum geçişi yollarının kuralları tümüyle eşdeğer değil. Kaynak: `B/tickets/tickets.service.ts:821-901,1099-1168,1174-1300`; ilgili frontend detay sayfası.

### 5.4 SLA ve iş kuralları

Departman+öncelik → genel öncelik → varsayılan SLA zinciri; iş saatleri/tatiller ve cron uyarı/ihlal/otomatik kapatma işlemleri bulunuyor. `TicketRule` olaylarla koşul/atama/öncelik/çeviri gibi eylemler uygular. Ayrı `AutomationService.evaluateRules` placeholder olması gerçek TicketRule motorunun yok olduğu anlamına gelmez.

Sözleşme farkları: `businessHoursOnly` alanına rağmen deadline hesabı her zaman iş takvimini kullanıyor; escalation yeniden hesabı departmanı kaybedebiliyor; tanınmayan kural koşulu yok sayılabiliyor; bazı atama yolları özel assign yolundaki uygunluk kontrolünü paylaşmıyor. Bunlar standart bilet ekranının çalışmasına rağmen uç durumlarda farklı sonuç üretir. Kaynak: `B/tickets/sla.service.ts:31-60,109-140`; `B/tickets/business-hours.service.ts:25-114`; `B/tickets/rule-engine.service.ts:18-114`.

### 5.5 Çok kanallı iletişim

- **SMTP/Bull:** sağlayıcı kuyruğu, log, STARTTLS/sertifika doğrulaması; queued/sent/delivered birbirinden farklı.
- **IMAP:** dakikalık unread tarama, aktif bilinen yerel gönderici, mevcut bilet yanıtında sahiplik; ortak Message-ID claim/hold akışı.
- **İmzalı inbound webhook:** HMAC kapısı ve ortak claim; normal tarayıcı CSRF kontrolüyle uyum bulgusu bölüm 13'te.
- **WhatsApp:** Meta imza guard'ı var; mevcut bilete doğrudan mesaj yazma, ana addMessage olaylarını atlayabiliyor. Tanınmayan kişi koşulunda ciddi açık aşağıda.
- **WebSocket:** DB oturum/rol/sürüm denetimi, oda erişimi, müşteri için iç-not engeli; varlık/presence Redis'te.
- **Proaktif sohbet:** temsilci daveti, 120 saniye kabul süresi, katılımcı kontrolü, mesajlar, görüşmeyi bilete transaction içinde kopyalama. Dönüşüm ana TicketsService.create yolunu kullanmıyor; ana oluşturma olayları/SLA yan etkilerinin birebir uygulanması varsayılmamalı.
- **Ekler:** storage nesnesi + DB metadata; iç-not/owner erişimi ve süreli URL. Nesne yazımı ile metadata transaction'ı ayrı.

Kaynak: `B/email/email-inbound.service.ts:36-100,201-301`; `B/email/inbound-email-claim.ts:78-155`; `B/email/smtp.provider.ts:12-49`; `B/notifications/notifications.gateway.ts:67-100,291-385,587-624`; `B/proactive-chat/proactive-chat.service.ts:31-416`; `B/attachments/attachments.service.ts:20-95`.

## 6. Allplan/Hotinfo katmanı: ürünü genel destek sisteminden ayıran bölüm

`.hxl` XML, yalnız dosya eki olarak saklanmıyor: lisans türü/numarası, Allplan sürüm/edition/hotfix/build, GPU ve sürücüsü/OpenGL, CPU/RAM, Windows build, disk boşluğu, registry yolları, ekran/yazıcılar, hata izleri ve bazı süreç/servis adları yapılandırılmış bağlama dönüştürülüyor. Profildeki teknik durum ve bilet snapshot'ı AI teşhisinde kullanılabiliyor.

Bu alanlar teşhis sinyalidir; dosyada lisans alanı bulunması geçerli lisansın otoritatif doğrulaması değildir. Güvenlik/antivirüs süreç adının “conflictingProcesses” listesinde bulunması sorunun nedeninin kanıtı değildir. E-posta, kişi, telefon, makine/kullanıcı adı ve dosya yolları kişisel/kurumsal veri taşıyabilir; Hotinfo filtreleme ile tam anonimleştirme eş anlamlı değildir. Kaynak: `B/customers/hotinfo-parser.service.ts:29-376`; `B/ai/prompt-context-builder.service.ts:74-135,255-261`.

## 7. AI yanıtı nasıl üretiliyor?

Ana `queryTracked/queryInternal` yolu:

1. Kullanıcı/global kota; istek dili, hedef kitle ve cache kapsamı.
2. Exact Redis veya semantic DB cache; eklere göre cache kısıtları.
3. Teşhis/konu değişimi, ek çözümleme, Hotinfo sinyalleri.
4. Konuşma geçmişiyle sorgu yeniden yazımı, eş anlamlılar/HyDE genişletmesi.
5. pgvector + kelime tabanlı hibrit arama; ürün/dil/kaynak/yenilik/geri bildirim sıralaması.
6. Ortak SupportAnswerOrchestrator eşik kapısı; yetersiz bağlamda bilet/insan desteğine yönlendirme.
7. Sağlayıcı prompt'u, yanıt üretimi, timeout/fallback/dil/format onarımı.
8. AiInteraction, tahmini token/maliyet ve uygun cache kaydı; istemciye sonuç.

Kaynak: `B/ai/ai-query.service.ts:206-775`; `B/ai/support-answer-orchestrator.service.ts:71-104`; `B/ai/embedding.service.ts:386-599`.

Arama sonucu skoru istatistiksel olarak kalibre edilmiş “doğru cevap olasılığı” değildir. Senkron yol LLM rerank'i atlayabilir; async yol top8 için model rerank kullanabilir. Personel ve müşterinin eşikleri/kaynak görünürlüğü aynı değil. Müşteriye ana `sources` listesi dönmez; görseller ayrı olabilir. Yanıtın beş bölüm formatına uyması da teknik doğruluğunu kanıtlamaz.

### 7.1 Birbirinden farklı AI yolları

| Yol | Paylaşılan / ayrılan davranış |
|---|---|
| Ana query senkron | `wait=true`; queryTracked quota/cache → queryInternal; ortak retrieval kabul kapısı, üretim ve dil onarımı |
| Ana query kuyruklu | WEB `wait=false`; enqueue ön kontrolü, worker queryInternal; concurrency2, varsayılan15/dakika. WS sonucu senkron cevaptaki bütün ek alanları taşımıyor |
| SSE streamQuery | Ortak retrieval gate var; fakat ayrı bir saatlik ham-metin cache, farklı arama; ana kota/semantic cache/dil onarım yolunu paylaşmıyor. Bazı no-context mesajı sabit Türkçe |
| Manuel AI Yanıtı/Copilot | Son10mesaj + ek + Hotinfo + staff retrieval; ortak üretim/dil onarımı var, ana retrieval kabul gate'ini çağırmıyor; queryTracked quota/cache/interaction hattı değil |
| Manuel ANN_ÖZET | Konuşma + Hotinfo, doğrudan reformat görevi; RAG araması değil; iç notlar da konuşmaya giriyor |
| Otomatik resolver | Ana query'yi kullanır; uygun NEW/interaction'sız bilete HIGH cevap geldiğinde **internal AI draft** yazar ve DRAFT yapar; müşteriye otomatik göndermez, CLOSED yapmaz |

Kaynak: `B/ai/ai-query.service.ts:198-318,2369-2585,2945-3027`; `B/ai/ai-query.processor.ts:7-59`; `B/ai/ai-copilot.service.ts:41-234`; `B/ai/ai-auto-resolver.service.ts:28-165`. İkinci `queryInternalStream` tanımlı ama uygulama genelinde çağıranı bulunmadı; aktif yol diye sayılmadı.

**Önemli düzeltme:** `AI Yanıtı` personelin editörüne taslak koyar. Otomatik resolver da iç taslak üretir; yüksek confidence kendiliğinden müşteri mesajı veya bilet kapanışı değildir. Ops aktif statü listesi DRAFT'ı içermediğinden bu otomatik statü, aktif iş sayaçlarıyla ayrıca uzlaştırılmalıdır.

### 7.2 Diagnosis, fallback, sağlayıcı ve dil

Diagnosis ayrı eğitilmiş model değil: ürün/kategori keyword eşlemesi ve sabit neden heuristikleri. Problem-shift yeni anahtar kelimelere göre konuşma geçmişini temizleyebiliyor. Ana query'de yetersiz retrieval varsa model çağrısı yapmadan NO_MATCH/insan desteği yönlendirmesi olur. Context var ama üretim başarısızsa yeniden üretim, format onarımı ve kodda yazılı IFC/DWG/GPU/Workgroup/lisans gibi konu fallback'leri devreye girebilir. Bu sabit ürün şablonlarını “corpus'tan öğrenildi” diye saymamak gerekir. Dil hedefinde istek alanı esas; eksik/tanınmayan değerde TR. Kaynak: `ai-query.service.ts:321-358,482-530,584-628,1040-1507,1883-1970`; `ai-diagnosis.service.ts:22-147`.

AiService görev bazlı sağlayıcı seçimini gerçekten uygular: `ai.specialized.<task>_provider`, yoksa global chat sağlayıcısı. Promise çağrılarında fallback/breaker/429 retry vardır; streaming aynı güvenilirlik yolunu birebir kullanmaz. Provider health endpoint'i sağlayıcı test çağrısı da yapar, tamamen pasif sayaç okuma değildir. Bu görevde çağrılmadı. Kaynak: `B/ai/ai.service.ts:45-165,287-520,581-627`.

## 8. Gerçek öğrenme döngüleri — tek bir boru hattı yok

**Öğrenme burada model ağırlıklarını eğitmek değil; yeni bilgi üretmek, vektörlemek, aramada kullanmak ve bazı sıralama ağırlıklarını geri bildirimle ayarlamaktır.** İncelenen kodda model fine-tuning çalıştırıcısı bulunmadı.

```text
Bilet puanı >=4 ── ticket.kb_summarize ─┬─ Bull özet işi → SSS adayı (internal/pending)
                                      └─ bilet konuşması → ticket_embeddings

02:00 kümeleme ── son7gün, puan>=3 ────→ SSS adayı (internal/pending)
03:00 / manuel ── son100 çözülmüş bilet → SSS pending veya internal/published
                 tekrarlı NO_MATCH ───→ SSS adayı (internal/pending)

İnsan SSS onayı ── public/published + soru vektörü ──→ müşteri RAG araması
Makale onayı ──── published + article vektörleri ───→ RAG
Dosya/URL kabulü ─ parse/crawl/chunk/embed → ACTIVE ─→ RAG

Düşük AI puanı / tekrar eden bilgi açığı → TrainingQueue (tam kapanış hattı bulunmadı)
```

### 8.1 Puanla tetiklenen iki paralel iş

>=4 puan `ticket.kb_summarize` üretir. FAQ listener `kb-summarizer` kuyruğuna iş ekler. Worker bütün konuşmayı, **iç notlar dahil**, özetletir; Soru/Cevap biçimi yoksa konu başlığını soru, özeti cevap yapar; sabit 0.90 ile PENDING_REVIEW/internal aday açar. Ardından `knowledgeBaseAdded=true` olur.

Ayrı listener aynı konuşmayı ticket embedding deposuna yazar; FAQ yayın onayını beklemez. Ancak **ana yanıt araması TICKET depolarını UNION'a almıyor**: ARTICLE/POOL/FAQ kullanıyor. Ticket vektörleri mevcut akışta kümeleme ve etiketleme/benzer konu bulmaya hizmet ediyor. Bu nedenle iç notların dış AI işlemesine gittiğini söyleyebiliriz; başka müşteriye otomatik gösterildiğini bu koddan söyleyemeyiz.

Kaynak: `B/tickets/tickets.service.ts:1144-1168`; `B/faq/faq.service.ts:38-51,503-540`; `B/faq/kb-summarizer.processor.ts:25-91`; `B/ai/ai-auto-resolver.service.ts:171-199`; `B/ai/embedding.service.ts:446-539,722-755`.

### 8.2 Gece/manuel SSS çıkarma

En yeni 100 RESOLVED/CLOSED bilet okunur; CSAT şartı, gün penceresi ve `knowledgeBaseAdded=false` şartı yoktur. İç notlar dışarıda bırakılır. İlk personel mesajı/AI çıkarımı kullanılır. Güven skoru önemli ölçüde cevap uzunluğundan türetilir; >=0.85 durumunda PUBLISHED olabilir ama **isInternal=true kalır**, müşteriye açık yayın değildir. Tekrarlı işlem aynı soru frequency değerini artırabilir; distinct gerçek vaka sayısı sayılmamalı.

Etkileşimden çıkarma, tekrarlayan NO_MATCH etkileşimlerinin saklanan yanıtını kullanır; sonradan temsilcinin çözdüğü biletten nihai çözümü bulup kullanmaz. Bu, fallback mesajını aday çözüme dönüştürebilir; insan kapısı bu yüzden önemlidir. Kaynak: `B/faq/faq.service.ts:59-169,209-301`; `B/faq/faq.cron.service.ts`.

### 8.3 Kümeleme

02:00 işi son yedi gün, çözülmüş/kapalı, puan>=3, henüz işaretlenmemiş biletlerden varsayılan en az beşli benzer kümeler çıkarır. Çözüm üretimine **başlık ve ilk 200 karakter açıklama** verilir; yüklenen çözüm mesajları prompt'a gitmez. Dolayısıyla üretilen cevap doğrulanmış çözüm sentezi değil, problem benzerliğinden modelin ürettiği adaydır. İnsan onayı bekler. Kaynak: `B/ai/ticket-clustering.service.ts:26-145`.

### 8.4 Üç farklı geri bildirim

| Geri bildirim | Gerçek etkisi | Eşdeğer olmadığı şey |
|---|---|---|
| Bilet CSAT | Kapatma + >=4 öğrenme olayı | AI cevabı teknik doğruluk etiketi |
| Makale yararlı/yararsız | Makale analitiği | Her kaynak için RAG ranking güncellemesi |
| AI interaction puanı | Article eşleşmesinde 30 günlük ağırlık; <=2 TrainingQueue | Otomatik prompt düzeltmesi/fine-tuning |
| Kabul/editedResponse izi | Sahiplik kontrollü telemetri | Kendiliğinden SSS/embedding güncellemesi |

TrainingQueue için backend aramasında oluşturma/upsert/count yolları bulundu; tüketim, düzeltme uygulama ve tamamlanma uçtan uca hattı bulunmadı. `TrustScoreCalculator` tanımlı/kayıtlı ama çağıranı bulunmadı. Bunları bitmiş otomatik öğrenme yeteneği diye göstermemeliyiz. Kaynak: `B/ai/ai-query.service.ts:2332-2365,2818-2865`; `B/ai/rag-observability.service.ts:153-225`.

## 9. Bilgi kaynaklarının kabul ve yayın kapıları

| Kaynak | Ana aramaya girebilme şartı | Önemli sınır |
|---|---|---|
| Makale | PUBLISHED, audience filtresi, aktif model sürüm/boyutu | Raw SQL silinmiş/güncel artikel sürümünü yeterince ayırmıyor |
| Havuz belge/URL | ACTIVE, sürüm/boyut, ürün şartı | İlk başarılı ingestion ayrı editoryal onay beklemeden ACTIVE olabilir |
| SSS | PUBLISHED, silinmemiş, müşteri için internal=false | İnsan onayı public yapar; status tek başına yetmez |
| Ticket vektörü | Ana müşteri answer aramasında yok | Konu/kümeleme için ayrı kullanım |

URL akışı: normalize/dedup → LearnNow özel yol veya Crawl4AI/axios/Playwright → gerekirse aynı host görsellerinin AI özeti → chunk/embed → durum. Güncellenen URL uzunluğu >%30 değişirse PENDING_REVIEW olur; bu statüyü açık bir approve/reactivate endpoint'iyle çözme yolu ilgili controller'da bulunmadı. Dosya akışı PDF/TXT/MD/CSV/MSG/DOC/DOCX parser'larıdır; taranmış PDF için kanıtlanmış OCR hattı bu parser'da yok.

MSG parser From/başlık/tarih/gövdeyi içerir. “AI temizledi” anonimleştirdi demek değildir. Tarama adayını keşfetmek, içe aktarmak, parse etmek, vektörlemek ve aramaya almak farklı durumlardır. Local dataset keşfi ACTIVE kaynak kaydı oluşturabilse de indekslemeyi ayrıca ister. Kaynak sayısı dolayısıyla aramaya hazır kaynak sayısı değildir.

NotebookLM sync yolu yeni makaleler oluşturup dosya yolu olmayan sanal havuz kaynağını kuyruğa gönderiyor; worker filePath bekliyor. İlgili yolun yeni kaynak senaryosu statik olarak tutarsız; kullanıcının bunu üretimde kullandığı doğrulanmadı. Kaynak: `B/knowledge-pool/knowledge-pool.service.ts:278-456`; `B/knowledge-pool/knowledge-pool.processor.ts:145-331`; `B/knowledge-pool/knowledge-pool-parser.service.ts:29-113`.

### 9.1 Kullanıcının eklediği custom URL / crawler adayı röntgeni

Bu alan tek bir crawler düğmesi değil; dört ayrı aşamadır:

```text
URL EKLE / tek sayfa → KnowledgeSource → sync işi → içerik+embedding → ACTIVE
URL EKLE / crawl    → site keşfi → CrawlCandidate → kullanıcı İÇE AKTAR
LearnNow ÖNİZLE     → keşif sonucu, kalıcı aday yok
ADAYLARI KAYDET     → CrawlCandidate PENDING_REVIEW, embedding yok
İÇE AKTAR          → KnowledgeSource + sync işi, henüz başarı kanıtı değil
Başarılı sync      → ACTIVE + vektörler; aktif model sürümü de eşleşmeli
```

`URL EKLE` varsayılan single modunda tek URL'yi kaynak yapıp kuyruğa alır. Crawl modunda help.allplan.com için özel subtree, diğerleri için same-host depth2/max50 aday keşfi vardır. Crawler sekmesindeki ÖNİZLE/ADAYLARI KAYDET kontrolleri **LearnNow keşfine** bağlıdır; ALLPLAN HELP ve GENEL WEB chip'leri farklı tarayıcı başlatıcıları değil **aday listesinin kaynak filtreleridir**. Kullanıcının bunları tarama modu sanması anlaşılır bir UX sorunudur. Kaynak: `F/app/[locale]/(dashboard)/knowledge-pool/page.tsx:302-349,659-680,1117-1129`.

HAZIR = `metadata.reviewQuality.readyForImport`. LearnNow howto için yeterli çıkarılmış metin/transkript gibi bir ön inceleme ölçütüdür; embedding veya RAG kullanımı değildir. PENDING_REVIEW adayın henüz kaynak olarak alınmadığı ayrı statüdür. Ekrandaki GÖRSEL sayısı keşfedilen görsellerdir; sync görsel analizi varsayılan en fazla4seçili görseli işler, bütün görsellerin AI tarafından okunmuş olduğunu göstermez. Kaynak: `B/knowledge-pool/learnnow-crawler.service.ts:556-683`; `F/app/[locale]/(dashboard)/knowledge-pool/page.tsx:519-607`; `B/knowledge-pool/visual-content.service.ts:39-100`.

İçe aktarma backend'de ayrıca readyForImport veya APPROVED zorunluluğu uygulamıyor; privileged import fiilî insan kabul kapısı. Kaynak oluştu/aday IMPORTED oldu demek embedding başarıyla tamamlandı demek değil. `triggerSync` kuyruğa eklemeden önce SYNCING yazar; queue.add başarısızsa bu durumda kalabilir. Başarısız yeniden indeksleme eski iyi vektörleri de kaybettirebilir; bu yüzden bu incelemede toplu retry/tarama yapılmadı. Kaynak: `B/knowledge-pool/learnnow-crawler.service.ts:95-169,201-229`; `B/knowledge-pool/knowledge-pool.service.ts:55-91,254-276`; `B/ai/embedding.service.ts:638-719`.

### 9.2 Bu görevde canlı ekranda görülen somut veri — 28 Eylül

- Ham kaynaklar toplam **248**, URL filtresi **48** kayıt gösterdi. Çok sayıda LearnNow/allplan.com URL'si ACTIVE ve sıfırdan büyük vektör sayısıyla listelendi. Bu yüzden “URL mekanizması hiç çalışmamış” genellemesi desteklenmiyor; aktif model sürümüne uygun arama hazır olma durumu ayrıca bilinmiyor.
- Bazı aynı tam URL'ler farklı satırlarda tekrarlanıyor; örneğin LearnNow id8616. Bunlar geçmiş duplicate veri işareti; yeni dedup kodunun bu kayıtları otomatik temizlediğini varsaymıyoruz. Silme/birleştirme yapılmadı.
- Crawler listesinde id7262 LearnNow adayı: **PENDING_REVIEW**, içerik3224, görsel54, HAZIR. Bu görünüm aday keşif/kalıcılık aşamasının en az bu kayıt için çalıştığını gösterir; source import/index/RAG aşaması için kanıt değildir.
- URL+FAILED filtresinde “Hotlinetools - cleanstd/cleanreg/cleanup”, `allplan.my.site.com/Customer/s/article/0000A8BE?...` kaynağı **FAILED /0vektör /son eşitleme yok** göründü.
- Yalnız History simgesinden açılan mevcut günlükte **8 Eylül 2026 13:07:02 ve önceki denemeler: Gemini EMBED Error429 /RESOURCE_EXHAUSTED /prepayment credits depleted** görüldü. Bu kaydın görünen geçmiş hatası link geçersizliği değil **embedding sağlayıcısı kredi tükenmesi**. İçerik fetch'in bütün ayrıntıları günlükte yok; bugünkü bakiye/erişim denenmedi.

Kullanıcı daha önce kredi yüklediğini bildirmişti; bu geçmişte başarısız kalan kaydın kendiliğinden yeniden indekslendiğini göstermez. Eski500knowledge-sync işinin tamamına bu tek kaynağın kök nedenini yaymak da doğru olmaz. En az üç ayrı vaka var: geçmişte indekslenmiş kaynaklar, inceleme bekleyen aday, kredi hatasında durmuş kaynak. Bunları “crawler çalışmıyor” tek etiketiyle birleştirmek hem kullanıcıyı hem teşhisi yanıltır.

Canlıda yalnız sekme/filtre/geçmiş günlük görüntülendi. Refresh/sync, önizleme taraması, aday kaydetme, içe aktarma veya silme yapılmadı.

## 10. Vektör, cache ve model değişimi sözleşmesi

Model sürümü + boyut önemlidir; aynı boyut aynı embedding uzayı değildir. Ana EmbeddingService model ve boyutu birlikte doğrular. Makale indekslemesi ilgili article-version için transaction ile değişir; eski sürümler kalır. Pool eski vektörleri yeni sağlayıcı çağrısından **önce** siler; hata temizliği yarım yeni vektörleri kaldırır ama eski iyi indeksi geri getirmez. Ticket indexing append-only; aynı bilet tekrar vektörlenebilir.

Model ayarı değişince aktif sürüm hemen değişiyor ve migration kuyruğu başlıyor. Migration batch'leri hedef sürüm dışındaki ilk satırları tekrar seçiyor; dry-run değiştirmediği veya satır kalıcı hata verdiği sürece aynı batch dönebilir. Ayrıca job hedef sürüm etiketiyle, işlem anındaki sağlayıcı ayarından gelen vektörü yazma riski var. Bunlar model değişimini sıradan UI ayarı olmaktan çıkarır. Bu incelemede migration tetiklenmedi.

Exact/semantic cache kullanıcı, hedef kitle, ürün, dil ve konuşma/Hotinfo bağlamını ayırıyor: olumlu izolasyon. Ancak article/pool event invalidation yalnız Redis'i temizliyor; semantic DB cache yeniden Redis'i doldurabilir. FAQ approve/edit/delete için uygun invalidation event'i bulunmadı. Silinen/düzeltilen içerik bir süre cevapta kalabilir.

Kaynak: `B/ai/embedding.service.ts:262-349,638-799`; `B/ai/embedding-migration.processor.ts:35-233`; `B/ai/ai-semantic-cache.service.ts:74-80,108-123,186-202,287-301`; `B/ai/ai-query.service.ts:2640-2688`.

## 11. Dashboard, bildirim, kampanya ve operasyon ekranları

Görev ve Onay Merkezi farklı nesneleri toplar: bekleyen sohbet, atanmamış talepler, makale review, SSS adayları, tarama adayları ve AI geçmişi. Bunlar tek tür “bekleyen iş” değildir; ilgili rol/izinle ayrı sayılır. Sidebar sayacı ile FAQ sayfasındaki ilk sayfa uzunluğunun farklı olması tek başına veri kaybı değildir. Kaynak: `B/review-center/review-center.service.ts`.

Ops dashboard bilet, SLA, AI kalite/maliyet, CRM değişimleri, bilgi havuzu ve kuyrukları bir araya getiriyor. Fakat:

- “Bugün çözülen” RESOLVED sayar; CSAT ile CLOSED olmuş bileti dışarıda bırakabilir (`B/ops-dashboard/ops-dashboard.service.ts:149-177`; `B/reports/reports.service.ts`).
- Sistem HEALTHY/DEGRADED kararı son 30 gündeki AI error/timeout sayılarına bağlı; anlık servis readiness ölçümü değil (`ops-dashboard.service.ts:531-589`).
- AI maliyeti tahmindir; prompt/context/history/rerank/repair çağrıları ve gerçek fallback sağlayıcısı eksik sayılabilir (`B/ai/ai-query.service.ts:662-685`).
- Topoloji ekranı bazı motorları statik “çalışıyor” gösterir; o anda worker/provider sağlığına dayalı kanıt değildir (`F/components/source-architecture-view.tsx`).
- FAQ-learning “son senkron” için render anını kullanır; gerçek job completion zamanı değildir. Çoklu API Promise.all başarısızsa varsayılan sıfırların kalması mümkün. Yalnız yüklenmiş aday sayısı toplam bekleyen sayısı değildir (`F/app/[locale]/(dashboard)/faq-learning/page.tsx`).

Duyurular segment seçimi, şablon, uygulama içi bildirim ve e-posta kuyruğu ile çalışır. SENT etiketi öncelikle kuyruklama sonucudur; teslim/sekme daha sonra reconciliation ile izlenir. E-posta doğrulama aracı syntax+DNS/MX+SMTP/catch-all tahmini yapar; mesajın gerçekten teslim edileceği veya kişinin CRM uygunluğu kanıtı değildir. Kaynak: `B/announcements/announcements.service.ts:131-355`; `B/announcements/announcement-log-reconciliation.service.ts:30-157`; `B/email-validator/email-validator.service.ts`.

## 12. Yardım ve UX röntgeni

**Canlı `/tr/help` gözlemi:** `help.title`, `HELP.BADGE`, `help.nav.back` ham çeviri anahtarları göründü. Öğrenme bölümünde “5 yıldız”, “doğrudan ana veritabanına yazılmaz”, “onaylanan çözüm Knowledge Pool'a eklenir” ifadeleri var. Onaylar bölümünde %80–100 “Güvenle onaylanabilir” diyor. Bunlar yalnız önerilen metin değil, bu incelemede ekranda okunan mevcut anlatım.

| Yardım/arayüz mesajı | Kodun yaptığı | Kullanıcıya etkisi |
|---|---|---|
| Öğrenme başlangıcı 5 yıldız olarak anlatılıyor | Olay >=4; ayrıca >=3 kümeleme ve puansız gece çıkarma | Kullanıcı eşik ve katkısını yanlış anlar |
| Aday veritabanına yazılmaz, onaydan sonra eklenir | Aday zaten DB'dedir; ticket vektörü de paralel yazılır | Depolama ile müşteriye yayınlama karışır |
| Onaylanan çözüm Knowledge Pool'a eklenir | FaqEntry public/published olur ve soru embedding'i yenilenir | Kullanıcı yanlış yerde sonuç arar |
| Yüksek güven puanı güvenle onaylanabilir | Sabit 0.90 veya cevap uzunluğu gibi heuristikler var | Teknik doğruluk/mahremiyet kontrolü atlanabilir |
| Çözümü Onayla | Bazı rolde müşteri değerlendirmesine geçiş | Personel yaptığı işlemin sonucunu kestiremez |
| ANN_ÖZET / AI Yanıtı / YZE / KB / FAQ | Farklı teknik işlemler, karışık sözlük | Kavramsal yük, buton korkusu/yanlış kullanım |
| TICKETS öğrenme kaynağı sayacı | Bazı sayaçta yayımlanmış FAQ sayısı | Bilet sayısı, aday ve vektör sayısı sanılır |
| UÇTAN_UCA_GÜVENLİ_İLETİŞİM | Sunucu mesajı okuyup DB/AI/posta işliyor | Kriptografik E2EE güvencesi çağrıştırabilir; kanıt yok |

Sorunu yalnız “personel sistemi tam kullanmıyor” diye açıklamak eksik kalır. Personelin işi müşteriyi çözmek; sistem bilgi kazanımını farklı sayfalar, teknik adlar ve belirsiz durumlar üzerinden ek mesaiye dönüştürüyor. Yardımın mevcut anlatımı da kapalı bilet, doğrulanmış çözüm, aday bilgi ve aramada kullanılabilir bilgi ayrımını öğretmiyor.

Yardım altyapısı 9 müşteri +17 yönetici bölümü içeriyor. 26 bölümdeki524 literal çeviri başvurusu TR/EN/DE'de mevcut; ham üst başlık sorununun nedeni bütün i18n'nin bozuk olması değil, `help.title`, `help.badge`, `help.nav.back` anahtarlarının üç dilde de bulunmaması. Role göre ağaç yalnız `admin`/`agent` için yönetici rehberini açıyor; SUPER_ADMIN/SUPPORT_AGENT/TEAM_LEAD vb backend staff rolleri bu listede yok. Personelin ilgili rehberi hiç görememesi mümkün. Kaynak: `F/app/[locale]/help/layout.tsx:13-37`; `F/components/help/DocBreadcrumb.tsx:44`; `F/components/help/doc-tree.ts:343-369`.

Ek somut farklar: yardım “çözülmediyse aynı talebe yanıt yaz” diyor ama detay composer review/resolved/closed durumlarında kapalı; puan paneli yalnız müşteri review durumunda açılıyor. Profil yardımında mevcut parola ve en az8karakter anlatılıyor, backend profil güncelleme yolu bunları sağlamıyor. Müşteri AI menüsü anlatımı da AI deneyiminin yeni bilet akışına gömülü mevcut menüsüyle uyuşmuyor. Bunlar açıklama ile davranışın ayrı yaşlandığı örnekler. Yardımda açık fine-tuning veya kriptografik E2EE vaadi bulunmadı; bilet ekranının güvenli-iletişim etiketi bundan ayrı değerlendirildi. Metin kanıtları: `apps/frontend/messages/tr.json:2016-2017,2074-2100,2605-2607`; UI koşulları: `F/app/[locale]/(dashboard)/tickets/[id]/page.tsx:307,693-732`.

Bu aşamada **etiket veya davranış değişikliği yapılmadı**. Tasarım ilkesi olarak kapanış/değerlendirme, bilgiye aday gösterme ve kamuya yayınlama ayrı sonuçları anlaşılır biçimde göstermeli; tüm onayları tek düğmede birleştirmek doğru olmaz. Düşük puan veya uzun cevap “doğru bilgi” yerine geçmemeli.

## 13. Güvenlik röntgeni — mevcut kontroller ve gerçek açıklar

### Mevcut güçlü kontroller

JWT anahtar doğrulaması; HttpOnly/Secure cookie; DB kaynaklı rol/izin ve sessionVersion; reset token amacı/issuer/audience/tek kullanım; force logout'un DB'ye kalıcı yazılması; WebSocket yeniden doğrulaması; normal bilet erişimi ve iç not ayrımı; HMAC webhook guard'ları; ayar sırlarında AES-GCM; DTO whitelist; rate limit; CSP/Helmet; nonroot container; DDL'siz Prisma init. Bunlar gerçek kaynak kodu kontrolleridir, “hiç güvenlik yok” hükmü yanlış olur.

### Öncelikli bulgular

| ID | Etki ve koşul | Kanıt / kesinlik |
|---|---|---|
| SEC-01 | Başka biletin UUID'sini bilen oturumlu `ticket:read` sahibi, uygun durumdaki bilete CSAT gönderip kapatabilir: servis `_customerId` kullanmıyor, requester olmadan findOne çağırıyor | KOD/erişilebilirlik çıkarımı, yüksek güven. `B/tickets/tickets.controller.ts:257-267`, `tickets.service.ts:1144-1168,367-408`; CUSTOMER yetkisi `D/rbac-canonical.json:130-134`. Canlı istismar denenmedi |
| SEC-02 | Refresh rotasyonu tam JWT'yi bcrypt ile hashliyor; bcrypt ilk72bayt sınırı nedeniyle aynı kullanıcının değişen tokenlarını ayıramayabilir; aynı sessionVersion ve ACTIVE kullanıcı koşulunda, süresi/imzası geçerli eski token yeniden kullanılabilir | Yüksek güvenli statik çıkarım. `B/auth/auth.service.ts:121,140,578-581,616-620`; kurulu bcryptjs3.0.3 dokümanı. CAS aynı anda yarışı azaltır, ardışık eski token kullanımını çözmez. Reset/force logout DB sessionVersion iptali bundan bağımsız çalışır |
| SEC-03 | Profil parola güncellemesi yalnız hash değiştiriyor; eski parola kontrolü, DTO minimum uzunluk, sessionVersion/refresh/reset iptali yok | KOD. `B/users/dto/update-profile.dto.ts:35-38`, `users.service.ts:191-204`. Güçlü reset yolu bu ikinci yolu kapatmıyor |
| SEC-04 | Bilinmeyen WhatsApp numarasında undefined userId filtre dışı kalıp başka müşterinin açık WhatsApp biletine mesaj yazabilir | Koşullu yüksek risk. `B/whatsapp/whatsapp.service.ts:35-69`; schema strictUndefinedChecks açmıyor. Geçerli imzalı provider isteği ve etkin kanal gerektirir; canlı etkinlik doğrulanmadı |
| INT-01 | İmzalı webhook'lar browser CSRF bypass listesinde yok; normal HMAC server request handler'a ulaşmadan403 olabilir | KOD zincir çıkarımı. `B/main.ts:152-200`; parser/guard testleri tüm middleware'i kanıtlamaz |
| RAG-01 | Makale raw retrieval SQL silinme/güncel article-version şartını kontrol etmiyor; eski/silinmiş yayımlı içerik aramada kalabilir | KOD. `B/ai/embedding.service.ts:465-477`; `B/knowledge-base/knowledge-base.service.ts:145-182,245-250` |
| RAG-02 | Model migration dry-run/permanent-failure loop'u ve ayar/target sürüm uyuşmazlığı | KOD/koşullu yürütme çıkarımı. `B/ai/embedding-migration.processor.ts:61-233` |
| PRIV-01 | CSAT özet ve ticket embedding içinde iç notlar; profil/Hotinfo kişi bilgileri dış modele gidebilir | KOD veri akışı. Bu, otomatik diğer-müşteri sızıntısı kanıtı değildir; provider veri politikası/iş kararı ayrıca gerekli |

Ek yetki tutarsızlıkları: SUPER_ADMIN ile SUPER-ADMIN/ADMIN isimleri menü, manuel controller kontrolleri ve socket odalarında farklı ele alınıyor. Ana ticket erişimi staff'a genişken AI `isStaff()` her non-CUSTOMER rolü staff sayıyor. Aynı rolün UI'da dar, başka API'de geniş davranması mümkün. Gerçek DB rol atamaları bu görevde okunmadı.

Bu bulgular **yeni saldırı oldu, bütün kullanıcı verisi sızdı veya bütün sistemi kapatmalıyız** anlamına gelmez. Ancak “önceden güvenlik testleri geçti, dolayısıyla kalanlar yalnız lint” demek de doğru değildir. Düzeltme izni geldiğinde önce dar güvenlik sözleşmeleri ele alınmalı; şu anda kod değişmedi.

## 14. Güvenilirlik/teslim sözleşmesi farkları

- Outbound `@OnEvent('ticket.*')` wildcard bekliyor; AppModule wildcard açmıyor. Listener iki argüman beklerken emit tek payload veriyor. Bu servis dış webhook teslimi için güvenilir görünmüyor; tam isimli diğer iç event listener'lar bundan ayrı (`B/webhooks/webhooks.service.ts:12`, `B/app.module.ts:146`).
- Genel/bulk update özel assign/state machine yolunun tüm kontrollerini paylaşmıyor. Otomatik atamanın 1,5 saniye sonra koşulsuz update'i manuel atamayla yarışabilir.
- Ticket create controller gateway'i doğrudan çağırıyor, aynı gateway ayrıca `ticket.created` dinliyor; servis de bu olayı yayıyor. Aynı oluşturma için çift WS/çevrimiçi staff DB bildirimi riski var. Notification'da olay+kullanıcı unique anahtarı olmadığından `skipDuplicates` bunu engellemez (`B/tickets/tickets.controller.ts:72-75`, `B/notifications/notifications.gateway.ts:467-509`, `D/schema.prisma:180-192`).
- E-posta provider kabulü ile DB log yazımı atomik değil; yeniden denemede mükerrer gönderim mümkün. Gelen claim ve bilet yazımı da tek transaction olmadığı için exactly-once garantisi yok.
- Failed-job recovery ilk101 işi her5dakikada hata sınıfı/üst retry sınırı ayrımı olmadan yeniden deneyebilir; bu davranış knowledge-sync kuyruğunu kapsamıyor. Kullanıcının eski500 knowledge-sync hatasını otomatik düzeltmez (`B/queue-dashboard/stalled-job-recovery.service.ts:26-52`).
- Duyuru boş hedefte SENDING kalabilir; kısmi kuyruklamadan sonra retry çift gönderime neden olabilir. Bildirim DB kayıtları bazı akışlarda yalnız o anda çevrimiçi staff için yazılıyor.
- SLA uyarısı tek ortak işaretle teslimden önce kapanabiliyor; iki farklı uyarı birbirini bastırabilir.
- Proaktif sohbet dönüşümü ana ticket creation yan etkilerini paylaşmıyor. WhatsApp addMessage da ana mesaj yan etkilerini atlıyor. Çok kanallı olma, her kanalın aynı davranışı uyguladığı anlamına gelmiyor.

Bunların çoğu “neden aylardır ana iş yürüyebildi?” sorusunu açıklar: normal HTTP ticket oluştur/oku/yanıtla yolu çalışırken nadir retry, farklı kanal, farklı rol veya arka plan öğrenme yolunun bozuk olması mümkündür. **Ana işin çalışması bütün yan sistemleri doğrulamaz; yan sistem açığı da ana işin hiç çalışmadığını göstermez.**

## 15. Yayın/CI ve teknik borç durumu

Docker kaynakları sabit base digest, nonroot çalışma, frontend standalone, build-time SHA ve backend migration/checksum/ledger/schema/RBAC kontrolleri içeriyor. Bunlar önemli kazanımlar. Shutdown servisleri cron callback, worker ve izlenen işlerin bitmesini beklemeye çalışıyor; bu process-local tracking tüm olası writer'ların kapsandığının kanıtı değil.

Repo `docker-compose.yml` ise canlı Coolify ayarı diye okunmamalı: PG16 iken CI PG17; DB/Redis host portları, zayıf varsayılan DB parolası ve Redis allkeys-lru içeriyor. Bull kuyrukları için eviction riski var. Ayrıca Dockerfile zorunlu VCS_REF isterken compose build arg'ı eksik. Bunlar **şablonun olduğu gibi kullanılma riskleri**, canlı sunucunun şu an bu ayarlarda olduğunun kanıtı değildir.

Next config lint/type hatalarını kendi build'inde bypass eder; Docker frontend build'i ayrıca typecheck çalıştırır. CI yolları eşdeğer değildir. `ci.yml` staging işi security job'ını dependency yapmıyor, curl hatası bastırılabiliyor; Trivy `ignore-unfixed` ve exit davranışı nedeniyle yeşil job'ı “0 açık” saymamak gerekir. Workflow kaynak kodu okundu; yeni CI koşusu başlatılmadı.

Önceki aynı-gün handoff'ta frontend lint kırmızı, browser E2E skipped/başlatma timeout; audit33toplam/7High, backend CI yeşil kayıtlıdır. **Bu sayılar bu görevde yeniden ölçülmedi.** Kaynak güvenlik bulguları, container CVE taraması ve lint birbirinin yerine geçmez. Uygulama içi DB backup endpoint'i bilerek503 döndürüyor; otomatik yedek var diye varsayılmamalı (`B/common/services/database-backup.service.ts`).

Bu incelemede test/build/install/dev server/DB/Redis/container başlatılmadı. “80% coverage sağlandı” veya “production-ready” sonucu üretilmedi.

## 16. Okuma kapsamı ve kalan belirsizlik

**Derin, uçtan uca izlenen:** auth/reset/session/RBAC/CRM onboarding+full/delta; bilet oluştur/list/detail/status/reopen/feedback; kategori/tekli atama; FAQ puan/gece/kümeleme/insan yayın kapısı; ana queryTracked RAG; embedding/cache/migration; bilgi pool/KB kabul/index/visibility; SMTP/IMAP/webhook/WhatsApp giriş sınırları; schema ve deployment giriş noktaları.

**Tam dosya okuması yapılan başlıca kaynaklar:** ticket service/controller/DTO'lar; auto-assignment/rule/SLA/business-hours; auth ana servis/strateji/guard ve CRM ana servis/adapter/delta/record-sync; settings/crypto; FAQ service/controller/cron/summarizer; embedding service/registry/migration/semantic cache; AI auto-resolver/clustering/orchestrator; KB service/approval; pool service/processor/parser; app/main/Prisma; storage/attachment; SMTP/inbound/claim/omni/WhatsApp; proactive-chat service/controller; review-center; reports; health; queue dashboard/monitor/shutdown; frontend auth guard/middleware/category helper/topology ana bileşeni; Dockerfile/deploy scripts/CI; Prisma schema.

**Seçili fonksiyon/bağlantı bazında okunan veya yalnız envanterlenen:** büyük dashboard/settings/customer frontend JSX'lerinin tamamı, bütün reusable UI bileşenleri; bütün test dosyaları; bütün provider implementasyonları; crawler'ların her alt dalı; 57 migration'ın her SQL satırı; bütün bakım scripts'i; bütün static asset ve üç dilde bütün ürün metinleri. Ops dashboard'un ana toplama/sağlık/karar yolları okundu, bütün trend/modal sorguları tek tek doğrulanmadı. Hotinfo ana parse ve veri çıktısı okundu, her tolerant-parser helper dalı değil. Tamamlayıcı turda AiService, Copilot, Diagnosis ve query worker tamamı; ai-query streaming/fallback/dil/özet helper yolları da okundu. Yardım26bölümünün çeviri başvuruları tarandı; her paragraf bütün backend ile birebir eşlenmiş değildir.

Test kaynaklarından sözleşme kanıtı alındı fakat testler çalıştırılmadı. Mock/controller testinin `main.ts` middleware, gerçek provider, kuyruk ve tarayıcı davranışını ispatlamadığı ayrımı korundu. Graphify çıktısı bu checkout'ta yok; yeniden üretilmedi. Çok büyük eski `.ai` günlüklerinin tamamı okunmadı; en yeni handoff ve ilgili kararlar esas alındı.

Canlıda bilinmeyenler: gerçek SHA/config/model/embedding sürümü; aktif WhatsApp kanalı; queue/cron yükü; provider payload/retention; güncel R2/DB yedeğinin kurtarılabilirliği; gerçek rol atamaları; withdrawal/cache davranışı; vector indexleri; Prisma soft-delete extension Proxy'sinin gerçek runtime etkisi. İlgili kod, Proxy'nin eski delegate'lere dönebileceğini düşündürüyor; runtime test olmadan soft-delete filtrelerinin bütün sorgularda kesin çalıştığını söylemiyoruz. Raw SQL'deki RAG sorunu bu belirsizlikten bağımsızdır.

## 17. Yönetici özeti: neyi değiştirmeden anladık?

1. Sistem gerçek bir dikey AI destek platformu; CRM, Hotinfo, insan operasyonu, RAG kaynakları ve bilgi yönetişimi somut olarak mevcut.
2. Öğrenme yalnız kullanıcının puanına bağlı değil. Birden fazla otomatik yol var; fakat doğrulanmış çözümden kamuya güvenilir bilgiye kadar tek, ölçülebilir ve tutarlı bir uçtan uca sözleşme henüz yok.
3. Kullanıcının az değerlendirme yapması olası katkı eksikliğidir; sayaç/etiket/arka plan akışı farklarının tamamının nedeni olarak gösterilemez.
4. Yardım metni gerçek koşullarla uyuşmuyor; düşük keşfedilebilirlik ve teknik dil, ürünün değerinin anlaşılmasını zorlaştırıyor.
5. Güvenlik kontrolleri ciddi emek içeriyor; buna rağmen erişim ve oturum yollarında yüksek önem taşıyan ayrı boşluklar var. Lint temizliği bunların çözümü değildir.
6. Sistemi baştan yazma gereği bu bulgulardan çıkmaz. Önce dar güvenlik açıkları; sonra öğrenme durumu/sayaç/yardım sözlüğü; ardından editoryal kalite ve operasyonel retry tutarlılığı düşünülmeli. Bu sıra yalnız öneridir, uygulanmadı.

**Yapılan değişiklik: yalnız bu inceleme raporu ve rapora işaret eden çalışma notları. Uygulama kodu, müşteri verisi ve canlı servisler değiştirilmedi.**
