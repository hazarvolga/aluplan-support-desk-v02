# Üretim Stabilizasyon ve Kalite Görev Planı (TODO) — 28 Eylül 2026

**Bağlam ve Kaynak Belgeler:**
- Devir Planı: [`.ai/issues/2026-09-28-current-release-handoff-and-quality-plan.md`](./2026-09-28-current-release-handoff-and-quality-plan.md)
- Sistem Röntgeni ve Denetim Raporu: [`.ai/issues/2026-09-28-system-xray-and-learning-cycle-audit.md`](./2026-09-28-system-xray-and-learning-cycle-audit.md)
- Başlangıç Git Commit: `20240db46ed086ab17cb20615f535b38d298cb62`
- Çalışma Alanı: `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-stabilization-20260928`
- Çalışma Dalı: `fix/production-stabilization-20260928`

Bu plan, handoff belgesinin 7. bölümündeki uygulama sırasını, paket sınırlarını, veri koruma ilkelerini ve Codex ana ajanı inceleme geri bildirimlerini somut görevlere dönüştürür.

**Kullanıcının Kesin Yayın Kararı (28 Eylül 2026):** TODO listesindeki TÜM işler (Paket A, Paket B ve ilgili kalite doğrulamaları) tamamlanıp incelenmeden hiçbir yayın (deploy/release) gündeme alınmayacaktır. Paket A veya Paket B sonrası ara yayın/deploy önerileri iptal edilmiştir; süreç yalnızca yerel geliştirme, hedefli testler, kod incelemeleri ve yerel Git checkpoint commit'leri ile yürütülür. Ayrı açık kullanıcı onayı olmadan remote push, remote tag veya Coolify deploy kesinlikle yapılmaz.

---

## Durum Özeti Tablosu

| Sıra | Görev ID | Rapor Karşılığı | Başlık / Alan | Paket | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 0 | **STAB-00** | Handoff Bölüm 8 | Ayrı worktree, dal, belge aktarımı ve TODO planı teslimi | Altyapı / Hazırlık | **REVIEW** |
| 1.1 | **SEC-01** | SEC-01 | CSAT / Bilet Çözüm Değerlendirmesi Müşteri Sahiplik ve Durum Doğrulaması | Paket A (Erişim/Oturum) | **DONE** (Yerel Kabul) |
| 1.2 | **SEC-02** | SEC-02 | Refresh Token Rotasyonunda Bcrypt 72-Bayt Sınırı ve Token Doğrulama Güvenliği | Paket A (Erişim/Oturum) | **PENDING** |
| 1.3 | **SEC-03** | SEC-03 | Profil Parola Güncellemesinde Mevcut Parola, Model Uyumu ve Oturum İptal Zinciri | Paket A (Erişim/Oturum) | **PENDING** |
| 1.4 | **SEC-04** | SEC-04 | WhatsApp Webhook Tanınmayan Göndericide Güvenli Ret / Karantina İzolasyonu | Paket A (Erişim/Oturum) | **PENDING** |
| 1.5 | **SEC-05** | Röntgen Bölüm 5.3 / 13 | Genel / Bulk Bilet Güncellemelerinde Yetki ve Durum Geçiş Sınırları | Paket A (Erişim/Oturum) | **PENDING** |
| 2.1 | **REL-01** | Handoff Bölüm 7 (Sıra 2) | Paket A Sonrası Tip Kontrolü, Derleme ve Odaklı Testler (Ara Yayın Yok) | Paket A (Kalite Kontrolü) | **PENDING** |
| 2.2 | **REL-02** | Handoff Bölüm 5 (P1) | Erişilebilir High Bağımlılık Denetimi ve Quality Gate CI/E2E Analizi | Paket A (Yayın Hazırlığı) | **PENDING** |
| 3.1 | **RAG-01** | RAG-01 | Bilgi Bankası Raw SQL Makale Aramasında Silinmeme ve Güncel Sürüm Filtrelemesi | Paket B (Güvenilir Bilgi) | **PENDING** |
| 3.2 | **CACHE-01**| Röntgen Bölüm 10 | Redis ve Semantic Cache Tutarsızlığı / İptal (Invalidation) Olayları | Paket B (Güvenilir Bilgi) | **PENDING** |
| 3.3 | **PRIV-01** | PRIV-01 | SSS Özetlerinde ve Bilet Vektörlerinde İç Notların Ayrıştırılması ve Gizlilik | Paket B (Güvenilir Bilgi) | **PENDING** |
| 3.4 | **LRN-01** | Röntgen Bölüm 8.2 / 8.3 | Çözüm Temelli SSS Çıkarımı, Puanlama Ayrımı ve Yaşam Döngüsü Açıklığı | Paket B (Güvenilir Bilgi) | **PENDING** |
| 4.1 | **CWL-01** | CRAWL-01 | Crawler / Havuz Kuyruk Hatasında SYNCING Takılması ve Eski İndeks Koruması | Paket B (Ingestion) | **PENDING** |
| 4.2 | **CWL-02** | Handoff Bölüm 7 (Sıra 4) | Temsilî Tek Public URL Uçtan Uca İçe Aktarma ve Vektörleme Doğrulaması | Paket B (Ingestion) | **PENDING** |
| 4.3 | **MOD-01** | RAG-02 | Model / Embedding Sürüm Değişimi ve Toplu Reindex Operasyonel Kısıtı | Paket B (Ingestion) | **PENDING** |
| 5.1 | **UX-01** | Handoff Bölüm 4 | Bölüm 4 Görünür Frontend AI / `ANN_*` Metin ve Etiket Revizyonu | Paket B (Kullanım/UX) | **PENDING** |
| 5.2 | **UX-02** | Röntgen Bölüm 12 | Yardım Ekranı (`/tr/help`) Çeviri Anahtarları ve Gerçek Personel Rol Menüsü | Paket B (Kullanım/UX) | **PENDING** |
| 5.3 | **UX-03** | Röntgen Bölüm 12 | Öğrenme, Değerlendirme Anketi ve Aday Durumlarının Arayüzde Şeffaf Ayrımı | Paket B (Kullanım/UX) | **PENDING** |
| 6.1 | **DEF-01** | Handoff Bölüm 5 (P1) | Depo Geneli Kapsamlı Lint Borcunun Kademeli Temizliği | Ertelenen İşler | **DEFERRED** |
| 6.2 | **DEF-02** | Handoff Bölüm 5 (P2) | Eski 500 `knowledge-sync` Başarısız Kuyruk Kaydının Ayrı Analizi | Ertelenen İşler | **DEFERRED** |
| 6.3 | **DEF-03** | Röntgen Bölüm 14 | Outbound Webhook Wildcard ve Çift Bildirim Riskinin Koşullu Takibi | Ertelenen İşler | **DEFERRED** |

---

## Sıra 0: STAB-00 — Çalışma Alanı İzolasyonu ve Planlama

### STAB-00: Doğru Commit'ten Ayrı Worktree, Belge Aktarımı ve TODO Teslimi
- **Durum:** `REVIEW`
- **Rapor ID / Kanıt:** Handoff Bölüm 8; Röntgen Bölüm 1.
- **Dosya / Modül:** 
  - Worktree: `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-stabilization-20260928`
  - Dal: `fix/production-stabilization-20260928`
  - `.ai/issues/2026-09-28-current-release-handoff-and-quality-plan.md`
  - `.ai/issues/2026-09-28-system-xray-and-learning-cycle-audit.md`
  - `.ai/issues/2026-09-28-production-stabilization-todo.md`
- **Minimum Değişiklik:** Kaynak aday dalına ve kullanıcı WIP dosyalarına dokunmadan, `20240db4` commit'inden izole worktree açılması, iki güncel denetim belgesinin SHA-256 bütünlüğüyle kopyalanması ve bu TODO belgesinin oluşturulması.
- **Kapsam Dışı:** Her türlü ürün kodu değişikliği, bağımlılık kurulumu, derleme, test çalıştırma, commit, push veya canlı erişim.
- **Bağımlılık:** Yok (ilk hazırlık adımı).
- **Kabul Ölçütü:** Kaynak WIP diff hash'i (`c16c01ba...`) değişmemiş olmalı; iki belgenin kaynak ve hedef SHA-256 hash'leri birebir eşleşmeli; yeni worktree tam `20240db4` commit'inden dallanmalı.
- **Dar Doğrulama:** `git worktree list`, `shasum -a 256` doğrulamaları.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** STAB-00'ın Codex ana ajanı tarafından denetlenip KABUL edilmesi; ardından ilk ürün görevi SEC-01'in açılması.

---

## Sıra 1: Paket A — Erişim ve Oturum Güvenliği

### SEC-01: CSAT / Çözüm Değerlendirmesi Sahiplik ve Durum Doğrulaması
- **Durum:** `DONE` (Yerel İnceleme Kabul Edildi)
- **Rapor ID / Kanıt:** SEC-01; Röntgen Bölüm 13 (Satır 333), Bölüm 5.3 (Satır 114-118); `B/tickets/tickets.controller.ts:257-267`, `B/tickets/tickets.service.ts:1144-1168,367-408`.
- **Dosya / Modül:** `apps/backend/src/tickets/tickets.controller.ts`, `apps/backend/src/tickets/tickets.service.ts`, `apps/backend/src/tickets/dto/submit-feedback.dto.ts`.
- **Kullanıcı Kararı (Kesinleşen):** CSAT değerlendirmesi **yalnızca** bileti açan asıl müşteri (`Ticket.userId === req.user.sub`) tarafından gönderilebilir. Personel, yönetici veya admin dahil hiç kimse müşteri adına puan/yorum iletemez (`ForbiddenException`). Bilet çözüm ve yeniden açma süreçleri ayrı olup dokunulmamıştır.
- **Uygulanan Değişiklik:** 
  - `SubmitFeedbackDto` oluşturuldu (`score`: 1-5 arası tam sayı zorunlu, `comment`: opsiyonel maksimum 2000 karakter, Swagger/class-validator entegrasyonu).
  - **Global ValidationPipe Tip Güvenliği:** `main.ts` içerisindeki global `ValidationPipe` ayarında `enableImplicitConversion: true` olduğundan boolean veya string değerlerin (örn. `score: true` $\rightarrow$ 1, `score: "5"` $\rightarrow$ 5, `comment: 12345` $\rightarrow$ '12345') otomatik tip dönüşümüyle kabul edilmesi riski giderildi. DTO üzerinde `@Transform` kullanılarak orijinal JSON tipleri korundu; boolean/string score ve numeric comment değerlerinin kesin olarak 400 Bad Request ile reddedilmesi sağlandı. `comment: null` ve `comment: undefined` için opsiyonel sözleşme korundu.
  - `tickets.controller.ts`: `submitFeedback` endpoint'i DTO doğrulaması ile güncellendi; oturum token'ındaki kullanıcı kimliği (`req.user?.sub || req.user?.id`) servise aktarıldı. Servis istisna fırlatırsa bildirim yayını engellendi.
  - `tickets.service.ts`:
    - Aktör kimliği eksikse `UnauthorizedException`.
    - Bilet `deletedAt: null` filtresiyle arandı; bulunamazsa veya silinmişse `NotFoundException`.
    - `ticket.userId !== customerId` durumunda (veya bilette kullanıcı yoksa) `ForbiddenException` ile ret.
    - Bilet durumu `RESOLVED` veya `PENDING_CUSTOMER_REVIEW` haricinde ise `BadRequestException`.
    - **Gizlilik ve Atomik Skaler Yanıt:** `updateMany` ve ilişkileri genişleten `findOne` çağrısı kaldırıldı. Bunun yerine Prisma 7'nin atomik koşullu `prisma.ticket.update({ where: { id, userId, deletedAt: null, status: { in: [...] } }, data: { ... } })` metodu doğrudan kullanıldı. Bu sayede hiçbir `include` veya `select` olmadan saf skaler `Ticket` yanıtı üretildi.
    - **Hata Ayrıştırması:** Yalnızca gerçek Prisma `P2025` yarış/uygunsuzluk hatası yakalanarak `BadRequestException` fırlatıldı; diğer beklenmeyen veri tabanı hataları gizlenmeyerek yeniden fırlatıldı (`throw error`).
    - Yalnızca puan >= 4 durumunda self-learning KB summarize eventi (`ticket.kb_summarize`) yayınlandı.
- **Kapsam Dışı:** Bilet durum makinesinin (`TicketStatus`) yeniden yazılması; personelin bilet kapatma/yeniden açma izinlerinin bozulması; frontend değişiklikleri; global ValidationPipe ayarlarının değiştirilmesi.
- **Bağımlılık:** STAB-00 onaylandı.
- **Kabul Ölçütü:** Başka kullanıcı veya personel/admin başkası adına puan gönderemez (403); kimliksiz istekler reddedilir (401); silinmiş veya bulunamayan bilet reddedilir (404); uygunsuz durumdaki veya mükerrer gönderilen puanlar reddedilir (400); boolean veya numeric string score ve numeric comment reddedilir (400); null comment kabul edilir; beklenmeyen DB hataları maskelenmez; meşru sahip uygun statüdeki biletini puanladığında bilet `CLOSED` olur, skaler yanıt döner.
- **Doğrulama Kanıtı ve Mock Test Sınırı:**
  - **Yerel İnceleme Onayı:** Bağımsız inceleme ve Codex tarafından iki hedefli süitte 33/33 test PASS ile onaylandı.
  - **DTO Testleri (Gerçek Production Pipe):** `src/tickets/dto/submit-feedback.dto.spec.ts` 19/19 test PASS. Global pipe ayarlarıyla (`enableImplicitConversion: true`, `whitelist: true`, `forbidNonWhitelisted: true`) boolean score (`true`/`false`), numeric string score (`"5"`/`"1"`), numeric comment (`12345`), boolean comment (`true`), float score (`4.5`), null/missing score'un reddedildiği; integer 1-5, null/undefined/boş/geçerli string comment'in başarılı olduğu kanıtlandı.
  - **Güvenlik ve Sahiplik Testleri:** `src/tickets/csat-feedback-security.spec.ts` 14/14 test PASS.
  - **Test Edilen Payload Kapsamı:** `submitFeedback` servis dönüşü, controller yanıtı, socket yayını (`notificationsGateway.emitTicketUpdated`) ve event payload'ında (`ticket.kb_summarize`) `messages`, `internalNotes`, `attachments`, `escalations` ve `creator` alanlarının her birinin **ayrı ayrı `not.toHaveProperty`** ile bulunmadığı doğrulandı.
  - **Hata Ayrıştırma Testi:** `P2025` yarış hatasının `BadRequestException`a dönüştüğü, beklenmeyen DB hatalarının ise maskelenmeden yeniden fırlatıldığı kanıtlandı.
  - **Mock Test Sınırı:** Bu aşamadaki doğrulamalar izole Jest mock testleri ve NestJS ValidationPipe simülasyonu ile yapılmıştır. Canlı müşteri veri tabanı entegrasyonu, staging çalışma zamanı veya gerçek ağ trafiği koşulları bu kapsamda test edilmemiştir; tarihsel canlı gözlemleri veya konteyner healthcheck çıktıları güncel canlı doğrulama kanıtı sayılmaz.
  - **Modül Genel Test:** `src/tickets` modülü 18 test suite, 210 testin tamamı PASS (0 fail, 0 regresyon).
  - **Tip Denetimi:** `pnpm --filter @aluplan/backend typecheck` 0 hata ile PASS.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği (mevcut `Ticket` alanları kullanıldı).
- **Açık Kullanıcı Kararı:** Çözüldü (yalnızca biletin asıl sahibi müşteri puanlayabilir).

### SEC-02: Refresh Token Rotasyonunda Bcrypt 72-Bayt Sınırı ve Token Doğrulama Güvenliği
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** SEC-02; Röntgen Bölüm 13 (Satır 334); `B/auth/auth.service.ts:121,140,578-581,616-620`.
- **Dosya / Modül:** `apps/backend/src/auth/auth.service.ts`.
- **Minimum Değişiklik:** 
  - Refresh token'ın veritabanında saklanan özeti için bcrypt'in ilk 72 bayt kesme açığını önleyecek güvenli bir karma yöntemi kullanılması (refresh token'ın SHA-256 özeti alındıktan sonra bcrypt ile hashlenmesi veya doğrudan kriptografik HMAC/SHA-256 hash karşılaştırması).
  - Rotasyon sırasında eski token'ın yeniden kullanımının kesin olarak ayırt edilmesi ve geçersiz kılınması.
  - Mevcut `sessionVersion` ve kullanıcı şifre doğrulama akışlarının korunması.
- **Kapsam Dışı:** Kullanıcı parolalarının topluca sıfırlanması; JWT access token mimarisinin değiştirilmesi.
- **Bağımlılık:** SEC-01 tamamlanmış olmalı.
- **Kabul Ölçütü:** 72 bayttan uzun refresh token'lar güvenle doğrulanabilmeli; aynı 72 baytlık prefix'e sahip farklı token'lar birbirinin yerine kullanılamamalı; geçerli refresh token rotasyonu başarıyla yeni token çifti üretmeli; rotasyona uğramış eski token reddedilmeli.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/auth/auth.service.spec.ts` odaklı refresh token rotasyon birim testleri.
- **Veri / Migration Etkisi:** Şemasız; mevcut aktif refresh token'ların geçişi sırasında kullanıcıların en fazla bir kez yeniden oturum açması gerekebilir.
- **Açık Kullanıcı Kararı:** Token hashleme mantığı güncellendiğinde, mevcut aktif oturumların bir kereye mahsus yeniden giriş yapması operasyonel olarak onaylanıyor mu?

### SEC-03: Profil Parola Güncellemesinde Mevcut Parola, Model Uyumu ve Oturum İptal Zinciri
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** SEC-03; Röntgen Bölüm 13 (Satır 335); `B/users/dto/update-profile.dto.ts:35-38`, `B/users/users.service.ts:191-204`, `B/auth/auth.service.ts:450-480`.
- **Dosya / Modül:** `apps/backend/src/users/users.service.ts`, `apps/backend/src/users/dto/update-profile.dto.ts`, `apps/frontend/src/app/[locale]/(dashboard)/profile/page.tsx` (gerekirse).
- **Minimum Değişiklik:** 
  - Profil üzerinden parola güncellenirken kullanıcının mevcut parolasını (`currentPassword`) girmesinin zorunlu kılınması ve backend'de `bcrypt.compare` ile doğrulanması.
  - Yeni parolanın mevcut kayıt/sıfırlama DTO politikasıyla uyumlu olması (`@MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })` - keyfi karmaşıklık kuralı eklenmeden).
  - Başarılı parola değişiminde kullanıcı modelinde mevcut reset akışıyla uyumlu atomik oturum iptal zincirinin işletilmesi:
    1. `sessionVersion: { increment: 1 }`
    2. `refreshTokenHash: null`
    3. Bekleyen herhangi bir parola sıfırlama token'ının iptali (`passwordResetJtiHash: null`)
    4. Redis oturum işaretçisinin temizlenmesi (`authService.invalidateAccessSessions(userId)`).
- **Kapsam Dışı:** Şifremi unuttum / e-posta sıfırlama (reset password) akışının baştan yazılması (mevcut akış model olarak korunur).
- **Bağımlılık:** SEC-02 tamamlanmış olmalı.
- **Kabul Ölçütü:** Yanlış mevcut parola ile profil şifre değişimi reddedilmeli (400/401); doğru mevcut parola ile şifre güncellenmeli; güncellenen kullanıcının eski refresh token'ı ve varsa bekleyen reset challenge token'ı geçersiz kalmalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/users/users.service.spec.ts` odaklı test; frontend profil sayfası etkilenirse render ve typecheck kontrolü.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği (mevcut `User` model alanları kullanılır).
- **Açık Kullanıcı Kararı:** Parola profil ekranından değiştiğinde kullanıcının o anki tarayıcı oturumu kapatılıp login ekranına mı yönlendirilsin, yoksa o oturum için hemen yeni bir access/refresh token çifti mi üretilsin?

### SEC-04: WhatsApp Webhook Tanınmayan Göndericide Güvenli Ret / Karantina İzolasyonu
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** SEC-04; Röntgen Bölüm 13 (Satır 336), Bölüm 5.5 (Satır 131); `B/whatsapp/whatsapp.service.ts:35-69`.
- **Dosya / Modül:** `apps/backend/src/whatsapp/whatsapp.service.ts`.
- **Minimum Değişiklik:** 
  - Telefon numarası bir müşteri profiliyle eşleşmediğinde (`profile === null`), açık bilet arama sorgusunun `userId: undefined` ile çalıştırılmasının kesin olarak engellenmesi.
  - Eşleşmeyen göndericiden gelen mesajın, CRM kabul kuralları çiğnenerek otomatik müşteri veya anonim bilet oluşturulmasına izin verilmeden, mevcut loglama altyapısı üzerinden güvenli bir ret/uyarı kaydı ile izole edilmesi.
  - Yeni veritabanı karantina tablosu veya şema migration'ı eklenmemesi (mevcut hata loglama yapısının kullanılması).
  - Bilinen manuel test hesaplarının ve yetkili personel telefonlarının yanlışlıkla engellenmemesi.
  - WhatsApp kanalının canlıya açılmaması / etkinleştirilmemesi.
- **Kapsam Dışı:** Yeni bir veritabanı tablosu veya Prisma migration'ı eklemek; WhatsApp kanalını canlı trafiğe açmak; Meta webhook sözleşmesini değiştirmek.
- **Bağımlılık:** SEC-03 tamamlanmış olmalı.
- **Kabul Ölçütü:** Tanınmayan bir telefon numarasından gelen webhook isteğinde asla başka bir müşterinin biletine mesaj eklenmemeli; anonim müşteri/bilet oluşturulmamalı; istek güvenli biçimde reddedilip loglanmalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/whatsapp/whatsapp.service.spec.ts` odaklı birim testleri.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Yok (güvenli teknik varsayılan: tanınmayan numara reddedilir, anonim bilet/müşteri açılmaz, migration yapılmaz).

### SEC-05: Genel / Bulk Bilet Güncellemelerinde Yetki ve Durum Geçiş Sınırları
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Röntgen Bölüm 5.3 (Satır 118), Bölüm 13 (Satır 342), Bölüm 14 (Satır 349); `B/tickets/tickets.service.ts`.
- **Dosya / Modül:** `apps/backend/src/tickets/tickets.service.ts`, `apps/backend/src/tickets/tickets.controller.ts`.
- **Minimum Değişiklik:** 
  - Toplu (bulk) veya genel bilet güncelleme yollarında, durum makinelerindeki (`reopen`, `close`, `assign`) özel yetki ve geçerlilik kontrollerinin atlanmasını önleyecek guard kontrollerinin eklenmesi.
  - Müşteri rolünün kendi biletleri üzerinde izin verilmeyen alanları (ör. `assignedTo`, `priority`, `slaPolicyId`) toplu olarak güncelleyememesi.
- **Kapsam Dışı:** UI toplu işlem menüsünün baştan tasarlanması.
- **Bağımlılık:** SEC-01..SEC-04 tamamlanmış olmalı.
- **Kabul Ölçütü:** Yetkisiz rol toplu işlemde kısıtlı alanları değiştirememeli; kapalı biletler geçersiz yollarla doğrudan açık yapılamamalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/tickets/tickets.service.spec.ts` odaklı izin testleri.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Müşterilerin bilet durumunu doğrudan değiştirebildiği durumlar yalnız `reopen` (yeniden açma) ve `feedback` (değerlendirme) ile mi sınırlandırılmalı?

---

## Sıra 2: Paket A — Kalite Doğrulaması (Ara Yayın Yok)

### REL-01: Paket A Sonrası Tip Kontrolü, Derleme ve Odaklı Dosya Bazlı Testler
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Handoff Bölüm 7 (Sıra 2); `apps/backend/package.json`, `apps/frontend/package.json`.
- **Dosya / Modül:** `apps/backend`, `apps/frontend` (yalnızca profil UI etkilenirse).
- **Minimum Değişiklik:** 
  - Backend tip kontrolü: `pnpm --filter @aluplan/backend typecheck`.
  - Backend derlemesi: `pnpm --filter @aluplan/backend build`.
  - Backend odaklı dosya bazlı birim testleri (backend `package.json`'da `test:unit` scripti bulunmadığından doğrudan gerçek Jest scripti ile):
    - `pnpm --filter @aluplan/backend test -- src/tickets/tickets.service.spec.ts`
    - `pnpm --filter @aluplan/backend test -- src/auth/auth.service.spec.ts`
    - `pnpm --filter @aluplan/backend test -- src/users/users.service.spec.ts`
    - `pnpm --filter @aluplan/backend test -- src/whatsapp/whatsapp.service.spec.ts`
  - Eğer SEC-03 kapsamında frontend profil formu (`apps/frontend/src/app/[locale]/(dashboard)/profile/page.tsx`) değiştirildiyse:
    - Frontend tip kontrolü: `pnpm --filter @aluplan/frontend typecheck`
    - Frontend derlemesi: `pnpm --filter @aluplan/frontend build`
    - Profil ekranı yerel render doğrulaması.
- **Kapsam Dışı:** Depo genelindeki 240 test dosyasının veya Playwright E2E testlerinin topluca çalıştırılması; yeni kalite/test altyapısı eklemek; ara yayın veya deploy yapmak.
- **Bağımlılık:** SEC-01'den SEC-05'e kadar tüm Paket A maddelerinin tamamlanmış olması.
- **Kabul Ölçütü:** Backend (ve gerekirse frontend) typecheck ve build 0 hata ile tamamlanmalı; dokunulan 4 odaklı test dosyası %100 yeşil geçmeli.
- **Dar Doğrulama:** Yukarıdaki odaklı dosya komutları (uygulama aşamasında).
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı (Kesinleşen):** Kullanıcının kesin kararı doğrultusunda Paket A sonrası ara yayın önerisi kaldırılmıştır. Tüm işler (Paket A ve B) bitip bağımsız olarak incelenene kadar yayın gündeme alınmayacaktır; yalnızca yerel derleme/test doğrulaması ve yerel checkpoint commit'i işletilir.

### REL-02: Erişilebilir High Bağımlılık Denetimi ve Quality Gate CI/E2E Analizi
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Handoff Bölüm 5 (P1); Röntgen Bölüm 15.
- **Dosya / Modül:** `package.json`, `pnpm-lock.yaml`, CI workflow dosyaları.
- **Minimum Değişiklik:** 
  - 7 High bağımlılık bulgusunun (`html-minifier`, `picomatch`, OpenTelemetry, `linkify-it`, Tiptap) üretim çalışma zamanında (production runtime) gerçekte erişilebilir olup olmadığının sınıflandırılması.
  - Kullanıcının çalışma alanındaki kirli `package.json` ve `pnpm-lock.yaml` dosyalarının kapsamı netleştirildikten sonra, yalnız kesin düzeltilebilir olanların dar override/lockfile diff'i ile planlanması.
  - Quality Gate E2E'deki 300 saniyelik `webServer` başlatma zaman aşımının CI ortam parametrelerine göre teşhis edilmesi.
- **Kapsam Dışı:** Kullanıcının kirli WIP dosyalarını onay almadan ezmek veya stage etmek; geniş sürüm yükseltmeleri; CI kapılarını bastırmak (`suppress`).
- **Bağımlılık:** Kullanıcıdan kirli dosyalar için açık kapsam teyidi.
- **Kabul Ölçütü:** 7 High güvenlik bulgusu için risk/erişilebilirlik matrisi hazırlanmalı; CI E2E zaman aşımı kök nedeni belgelenmeli.
- **Dar Doğrulama:** `pnpm audit --prod --audit-level high` (salt-okunur analiz).
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** Kullanıcının mevcut `package.json` ve `pnpm-lock.yaml` yerel değişiklikleri hangi kapsamdadır ve ne zaman birleştirilmelidir?

---

## Sıra 3: Paket B — Güvenilir Bilgi ve Öğrenme Döngüsü

### RAG-01: Bilgi Bankası Raw SQL Makale Aramasında Silinmeme ve Güncel Sürüm Filtrelemesi
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** RAG-01; Röntgen Bölüm 10, Bölüm 13 (Satır 338); `B/ai/embedding.service.ts:465-477`, `B/knowledge-base/knowledge-base.service.ts:145-182`.
- **Dosya / Modül:** `apps/backend/src/ai/embedding.service.ts`.
- **Minimum Değişiklik:** 
  - Raw SQL ile çalışan `findSimilarArticles` sorgusundaki mevcut `ka.status = 'PUBLISHED'` kontrolünün yanına gerçek şema alanları kullanılarak eksik filtrelerin eklenmesi:
    1. Makalenin silinmemiş olması (`ka.deleted_at IS NULL`).
    2. İlgili embedding kaydının aktif olması (`ke.is_active = true`).
    3. Vektörün makalenin güncel sürümüne ait olması (ilişkili `knowledge_article_versions` tablosundaki `version` değerinin `ka.current_version` ile eşleşmesi veya versiyon doğrulaması).
  - Şemada var olmayan `isPublished = true` gibi uydurma alanların kullanılmaması.
- **Kapsam Dışı:** Vektör veritabanı şemasının değiştirilmesi; makalelerin yeniden vektörlenmesi.
- **Bağımlılık:** Paket A tamamlanmış olmalı.
- **Kabul Ölçütü:**
  - `deletedAt` alanı dolu (soft-deleted) makaleler arama sonuçlarına dönmemeli.
  - Bir makalenin eski sürümüne ait embedding'ler, makale yeni bir `currentVersion`'a geçmişse sonuçlara dönmemeli; yalnız güncel sürümün embedding'leri dönmeli.
  - `status = 'PUBLISHED'` ve `is_internal` kısıtları korunmalı.
- **Dar Doğrulama:** Eski ve güncel makale sürümlerini ayırt eden odaklı embedding birim testi (`pnpm --filter @aluplan/backend test -- src/ai/embedding.service.spec.ts`).
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Yok (teknik gereklilik doğrudan şema alanlarıyla karşılanır).

### CACHE-01: Redis ve Semantic Cache Tutarsızlığı / İptal (Invalidation) Olayları
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Röntgen Bölüm 10 (Satır 282-284); `B/ai/ai-semantic-cache.service.ts`, `B/faq/faq.service.ts`, `B/knowledge-base/knowledge-base.service.ts`.
- **Dosya / Modül:** `apps/backend/src/ai/ai-semantic-cache.service.ts`, `apps/backend/src/faq/faq.service.ts`.
- **Minimum Değişiklik:** 
  - Makale veya SSS silindiğinde, güncellendiğinde veya yayından kaldırıldığında hem Redis önbelleğinin hem de veritabanındaki semantik önbellek (`AiResponseCache`) kayıtlarının tutarlı biçimde geçersiz kılınmasını sağlayan olay dinleyicisinin eklenmesi.
- **Kapsam Dışı:** Yeni bir cache altyapısı kurmak.
- **Bağımlılık:** RAG-01.
- **Kabul Ölçütü:** Güncellenen veya silinen bir SSS/makale yanıtı semantik veya Redis önbelleğinden eski haliyle kullanıcılara dönmemeli.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/ai/ai-semantic-cache.service.spec.ts`.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Semantic cache TTL süresi (varsayılan süre) operasyonel olarak kısaltılmalı mı?

### PRIV-01: SSS Özetlerinde ve Bilet Vektörlerinde İç Notların Ayrıştırılması ve Gizlilik
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** PRIV-01; Röntgen Bölüm 8.1 (Satır 203-207), Bölüm 13 (Satır 340); `B/faq/kb-summarizer.processor.ts:25-91`, `B/ai/ai-auto-resolver.service.ts:175-200`, `B/ai/embedding.service.ts:722-740`.
- **Dosya / Modül:** `apps/backend/src/faq/kb-summarizer.processor.ts`, `apps/backend/src/ai/ai-auto-resolver.service.ts`, `apps/backend/src/ai/embedding.service.ts`.
- **Minimum Değişiklik:** 
  - `kb-summarizer.processor.ts` içinde SSS özeti çıkarılırken iç notların (`isInternal: true`) konuşma metninden kesin olarak filtrelenmesi.
  - `ai-auto-resolver.service.ts` içinde bilet vektörü oluşturulurken (`indexTicket` çağrısı öncesinde) iç notların (`isInternal: true`) konuşma dökümüne eklenmesinin kesin olarak engellenmesi.
  - Müşteri-personel yazışmalarının iç not olmasa dahi kişisel ve ticari veri içerdiğinin gözetilmesi; harici LLM sağlayıcılarına gönderilen bağlamın ve kamuya açılacak SSS adaylarının gizlilik sınırlarına tabi tutulması ("kamuya açık mesaj" gibi yanlış varsayımların kullanılmaması).
- **Kapsam Dışı:** Geçmişte oluşturulmuş `ticket_embeddings` kayıtlarının topluca silinmesi.
- **Bağımlılık:** RAG-01, CACHE-01.
- **Kabul Ölçütü:** İç not içeren bir bilet çözüldüğünde oluşturulan SSS adayı prompt'unda ve `ticket_embeddings` içeriğinde `isInternal: true` olan mesaj metinleri kesinlikle yer almamalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/faq/kb-summarizer.processor.spec.ts` ve `src/ai/ai-auto-resolver.service.spec.ts`.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Geçmişte oluşturulmuş `PENDING_REVIEW` SSS adaylarında iç not taraması yapılıp temizlensin mi?

### LRN-01: Çözüm Temelli SSS Çıkarımı, Puanlama Ayrımı ve Yaşam Döngüsü Açıklığı
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Röntgen Bölüm 8.2 (Satır 209-214), Bölüm 8.3 (Satır 216-218); `B/faq/faq.service.ts`, `B/ai/ticket-clustering.service.ts`.
- **Dosya / Modül:** `apps/backend/src/faq/faq.service.ts`, `apps/backend/src/ai/ticket-clustering.service.ts`.
- **Minimum Değişiklik:** 
  - Gece/kümeleme SSS çıkarımında adayın yalnızca problem metninden uydurulması yerine, temsilcinin biletteki onaylanmış çözüm mesajını temel alması.
  - SSS adayının güven skorunun yalnızca cevap metin uzunluğuna değil, çözümün doğrulanabilirliğine dayandırılması.
  - `isInternal: true` ile işaretlenen SSS'lerin müşteriye açık aramalara sızmadığının garanti altına alınması.
- **Kapsam Dışı:** İnsan onay mekanizmasını devreden çıkarıp tam otomatik yayınlama yapmak.
- **Bağımlılık:** PRIV-01.
- **Kabul Ölçütü:** Çözümü olmayan veya çözümü doğrulanmamış biletlerden SSS adayı üretilmemeli; üretilen adaylar Review Center'da kaynak bilet referansıyla listelenmeli.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/faq/faq.service.spec.ts`.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Çözüm mesajı bulunmayan biletler kümeleme analizinde SSS adayı olarak önerilmesin mi?

---

## Sıra 4: Paket B — Çalışan Ingestion (Tarama ve Kaynak Yönetimi)

### CWL-01: Havuz Kuyruk Hatasında SYNCING Takılması ve Eski İndeks Koruması
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** CRAWL-01; Röntgen Bölüm 9.1 (Satır 262), Bölüm 10 (Satır 278); `B/knowledge-pool/knowledge-pool.service.ts:55-91`, `B/ai/embedding.service.ts:638-719`.
- **Dosya / Modül:** `apps/backend/src/knowledge-pool/knowledge-pool.service.ts`, `apps/backend/src/ai/embedding.service.ts`.
- **Minimum Değişiklik:** 
  - `triggerSync` sırasında BullMQ kuyruğuna ekleme (`queue.add`) başarısız olursa kaynağın süresiz `SYNCING` kalmasının önlenmesi, `FAILED` durumuna çekilmesi ve hatanın loglanması.
  - Havuz yeniden indeksleme sırasında eski çalışan vektörlerin yeni sağlayıcı çağrısı başarılı olmadan hemen silinmemesi; yeni vektörler hazır olduğunda atomik olarak değiştirilmesi.
- **Kapsam Dışı:** Tüm harici web crawler motorunun baştan yazılması.
- **Bağımlılık:** Sıra 3 tamamlanmış olmalı.
- **Kabul Ölçütü:** Kuyruk hatasında kaynak süresiz `SYNCING` kalmamalı; sağlayıcı 429/500 verdiğinde mevcut çalışan vektörler silinip kaynak 0 vektörlü kalmamalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/knowledge-pool/knowledge-pool.service.spec.ts`.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Başarısız sync sonrası eski vektörlerle yayına devam edilsin mi, yoksa kaynak geçici olarak DEGRADED mi işaretlensin?

### CWL-02: Temsilî Tek Public URL Uçtan Uca İçe Aktarma ve Vektörleme Doğrulaması
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Handoff Bölüm 7 (Sıra 4); Röntgen Bölüm 9.2.
- **Dosya / Modül:** `apps/backend/src/knowledge-pool`.
- **Minimum Değişiklik:** Tek bir temsili kamuya açık dokümantasyon URL'sinin yerel ortamda crawl -> chunk -> embedding -> semantic search zincirinde test edilmesi.
- **Kapsam Dışı:** Toplu URL taraması; eski 500 failed işin topluca yeniden denenmesi.
- **Bağımlılık:** CWL-01.
- **Kabul Ölçütü:** Tek bir URL başarıyla ACTIVE duruma geçmeli ve vektör aramalarında ilgili içeriği döndürmeli.
- **Dar Doğrulama:** İzole entegrasyon smoke testi.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** Temsilî doğrulama için hangi Allplan yardım/dokümantasyon URL'si referans seçilmeli?

### MOD-01: Model / Embedding Sürüm Değişimi ve Toplu Reindex Operasyonel Kısıtı
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** RAG-02; Röntgen Bölüm 10 (Satır 278-281), Bölüm 13 (Satır 339); `B/ai/embedding-migration.processor.ts`.
- **Dosya / Modül:** `apps/backend/src/ai/embedding-migration.processor.ts`, `apps/backend/src/settings`.
- **Minimum Değişiklik:** 
  - Bu stabilizasyon süresince model/embedding sürümü değişikliğinin ve kontrolsüz toplu reindex kuyruğunun tetiklenmesini engelleyen açık operasyonel/guard kısıtının eklenmesi.
  - UI üzerinden model boyutu veya adı değiştirildiğinde arka planda sonsuz döngüye giren migration işlemcisinin durdurulması.
- **Kapsam Dışı:** Tüm veritabanının yeni bir embedding modeline taşınması.
- **Bağımlılık:** CWL-01.
- **Kabul Ölçütü:** Beklenmedik model değişimleri arka planda kontrolsüz API kotası tüketmemeli; işlem açık bir operatör onayı olmadan başlamamalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/backend test -- src/ai/embedding-migration.processor.spec.ts`.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Model ayarları admin panelinde stabilizasyon süresince salt-okunur (read-only) kilitli hale getirilsin mi?

---

## Sıra 5: Paket B — Anlaşılır Kullanım ve Arayüz (UX / i18n)

### UX-01: Görünür Frontend AI / `ANN_*` Metin ve Etiket Revizyonu
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Handoff Bölüm 4, Bölüm 7 (Sıra 5); Röntgen Bölüm 12 (Satır 311); `apps/frontend/messages/{tr,en,de}.json`.
- **Dosya / Modül:** `apps/frontend/messages/tr.json`, `apps/frontend/messages/en.json`, `apps/frontend/messages/de.json`.
- **Minimum Değişiklik:** 
  - Yalnızca görünür i18n çeviri değerlerinde (translation values) güncelleme yapılması.
  - Önerilen karşılıklar (kullanıcı onayına sunulacak):
    - `ai_summary_btn`: TR `"Yapay Zeka Özeti"` (eski: `ANN_ÖZET`), EN `"AI Summary"`, DE `"KI-Zusammenfassung"`
    - `ai_draft_btn`: TR `"Taslak Yanıt"` / `"AI Yanıtı"` (korunabilir), EN `"Draft Response"`, DE `"Antwortentwurf"`
    - `ai_summary_record`: TR `"Özet Kaydı"` (eski: `ANN_ÖZET_KAYDI`), EN `"Summary Record"`, DE `"Zusammenfassungsaufzeichnung"`
    - `ai_confidence`: TR `"Yapay Zeka Güven Düzeyi"` (eski: `ANN_GÜVEN_DÜZEYİ`), EN `"AI Confidence"`, DE `"KI-Konfidenz"`
    - `title` (AI tanı): TR `"Sistem Tanılama"` (eski: `ANN_TANILAMA`), EN `"System Diagnostic"`, DE `"Systemdiagnose"`
    - `ai_assistant`: TR `"Yapay Zeka Asistanı"` (eski: `ANN Assistant`), EN `"AI Assistant"`, DE `"KI-Assistent"`.
- **Kapsam Dışı:** Translation key'lerinin değiştirilmesi; API sözleşmesi veya backend enum'larının değiştirilmesi.
- **Bağımlılık:** Sıra 3 ve 4 tamamlanmış olmalı.
- **Kabul Ölçütü:** Ekranda hiçbir kullanıcıya iç kod gibi görünen `ANN_*` metni gösterilmemeli; TR, EN ve DE tutarlı ve anlaşılır olmalı.
- **Dar Doğrulama:** `pnpm --filter @aluplan/frontend i18n:check`, yerel render kontrolü.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** Önerilen bu Türkçe/İngilizce/Almanca terimler kullanıcı tarafından onaylandı mı, yoksa alternatif terimler mi tercih ediliyor?

### UX-02: Yardım Ekranı (`/tr/help`) Çeviri Anahtarları ve Gerçek Personel Rol Menüsü
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Röntgen Bölüm 12 (Satır 302, 317); `apps/frontend/messages/*.json`, `apps/frontend/src/components/help/doc-tree.ts`.
- **Dosya / Modül:** `apps/frontend/messages/{tr,en,de}.json`, `apps/frontend/src/components/help/doc-tree.ts`.
- **Minimum Değişiklik:** 
  - Üç dilde de eksik olan `help.title`, `help.badge`, `help.nav.back` çeviri anahtarlarının eklenmesi.
  - `doc-tree.ts` içindeki `isAdminOrAgent` kontrolünün, yalnızca `admin` ve `agent` ile sınırlı kalmayıp canonical RBAC tablosunda yer alan gerçek personel rollerini (`ADMIN`, `SUPER_ADMIN`, `SUPPORT_AGENT`, `SENIOR_AGENT`, `TEAM_LEAD`, `DEPARTMENT_MANAGER`, `MANAGER`) tanımasının sağlanması. Var olmayan uydurma rol eklenmemesi.
- **Kapsam Dışı:** 26 yardım sayfasının içeriğinin baştan yazılması.
- **Bağımlılık:** UX-01.
- **Kabul Ölçütü:** `/tr/help` açıldığında ham `help.title` anahtarı yerine başlık görünmeli; gerçek personel rollerine sahip tüm kullanıcılar yetkili yönetici rehberini görebilmeli.
- **Dar Doğrulama:** `apps/frontend/src/components/help/doc-tree.spec.ts` birim testi ve yerel render kontrolü.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** Müşteri rolü yardım menüsünde hangi bölümleri görebilmeli?

### UX-03: Öğrenme, Değerlendirme Anketi ve Aday Durumlarının Arayüzde Şeffaf Ayrımı
- **Durum:** `PENDING`
- **Rapor ID / Kanıt:** Röntgen Bölüm 12 (Satır 306-312), Bölüm 8.4; `apps/frontend/src/app/[locale]/(dashboard)/tickets/[id]/page.tsx`.
- **Dosya / Modül:** `apps/frontend/src/app/[locale]/(dashboard)/tickets/[id]/page.tsx`, `apps/frontend/messages/*.json`.
- **Minimum Değişiklik:** 
  - Bilet detayındaki "Çözümü Onayla" butonunun doğrudan bir kapatma/gönderme butonu olmadığının, müşteriye değerlendirme anketini (`CSAT modal`) açan bir tetikleyici olduğunun açıkça ifade edilmesi.
  - Sürecin ayrı aşamalarının arayüz metinlerinde şeffaf kılınması:
    1. Anketin açılması (modal tetikleme)
    2. Değerlendirmenin gönderilmesi (`submitFeedback`)
    3. Biletin kapanma yan etkisi (`CLOSED` durumuna geçiş)
    4. Yüksek puan durumunda (CSAT >= 4) arka planda SSS adayı oluşturulması
    5. CSAT puanının bir teknik doğruluk veya kamuya doğrudan yayınlama onayı OLMADIĞI, adayın Review Center'da insan onayı bekleyeceği.
  - "Çözümü Tamamla ve Müşteriye İlet" gibi kanıtlanmamış gönderim vaadi taşıyan ifadelerin kaldırılması; metinlerin kullanıcı onayına bırakılması.
- **Kapsam Dışı:** Review Center mantığının veya feedback API'sinin yeniden yazılması.
- **Bağımlılık:** UX-01, UX-02.
- **Kabul Ölçütü:** Kullanıcı ve temsilci anket açma, değerlendirme gönderme ve kapanma aşamalarını net biçimde ayırt edebilmeli; kanıtlanmamış işlem vaatleri ekranda yer almamalı.
- **Dar Doğrulama:** Yerel bilet detay render kontrolü.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** "Çözümü Onayla" anket tetikleme butonunun kullanıcıya görünen metni için kullanıcının kesin tercihi nedir?

---

## Sıra 6: Ertelenen İşler (Kapsam Dışı / Sonraya Bırakılanlar)

### DEF-01: Depo Geneli Kapsamlı Lint Borcunun Kademeli Temizliği
- **Durum:** `DEFERRED`
- **Gerekçe:** Güvenlik ve veri koruma önceliklidir; yüzlerce dosyadaki `@typescript-eslint/no-explicit-any` ve kullanılmayan değişken temizliği geniş regresyon riski taşır. Paket A ve B tamamlandıktan sonra küçük, tip güvenli partiler halinde ele alınacaktır.
- **Yeniden Açma Koşulu:** Paket A ve B üretim stabilizasyonu tamamlandıktan sonra.

### DEF-02: Eski 500 `knowledge-sync` Başarısız Kuyruk Kaydının Ayrı Analizi
- **Durum:** `DEFERRED`
- **Gerekçe:** Canlı ekrandaki tek bir kaynağın geçmişinde görülen 8 Eylül Gemini embedding 429 hatası, 500 başarısız işin tamamının kök nedeni olarak genellenemez; kuyrukta bozuk URL, timeout, ağ kesintisi gibi farklı hata türleri bulunabilir. Otomatik toplu replay veya toplu silme veri kaybı/tutarsızlık riski taşır.
- **Yeniden Açma Koşulu:** Paket B tamamlandıktan sonra, kuyruktaki işlerin hata sınıflarına göre ayrı bir salt-okunur analizle tasnif edilmesi ve kontrollü onay alınmasıyla.

### DEF-03: Outbound Webhook Wildcard ve Çift Bildirim Riskinin Koşullu Takibi
- **Durum:** `DEFERRED`
- **Gerekçe:** `@OnEvent('ticket.*')` dinleyicisinin `EventEmitterModule` wildcard açılmadığı için tetiklenmemesi ve bilet oluşturmada controller ile gateway'in eşzamanlı bildirim yayması kod seviyesinde somut risklerdir. Ancak bu servislerin canlıda aktif bir dış entegrasyon tarafından beklenip beklenmediği ve bildirim çiftleşmesinin gerçek sıklığı çalışma zamanında henüz doğrulanmamıştır.
- **Yeniden Açma Koşulu:** Paket A ve B sırasında bu yolların aktif bir dış tüketici veya müşteri veri etkisi yarattığı tespit edilirse derhal önceliklendirilerek öne alınacaktır.
