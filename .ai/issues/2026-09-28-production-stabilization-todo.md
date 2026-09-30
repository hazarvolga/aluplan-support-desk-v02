# Üretim Stabilizasyon ve Kalite Görev Planı (TODO) — 28 Eylül 2026

**Bağlam ve Kaynak Belgeler:**
- Devir Planı: [`.ai/issues/2026-09-28-current-release-handoff-and-quality-plan.md`](./2026-09-28-current-release-handoff-and-quality-plan.md)
- Sistem Röntgeni ve Denetim Raporu: [`.ai/issues/2026-09-28-system-xray-and-learning-cycle-audit.md`](./2026-09-28-system-xray-and-learning-cycle-audit.md)
- Başlangıç Git Commit: `20240db46ed086ab17cb20615f535b38d298cb62`
- Çalışma Alanı: `/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-stabilization-20260928`
- Çalışma Dalı: `fix/production-stabilization-20260928`

Bu plan, handoff belgesinin 7. bölümündeki uygulama sırasını, paket sınırlarını, veri koruma ilkelerini ve Codex ana ajanı inceleme geri bildirimlerini somut görevlere dönüştürür.

**Kullanıcının Kesin Yayın Kararı (28 Eylül 2026):** TODO listesindeki TÜM işler (Paket A, Paket B ve ilgili kalite doğrulamaları) tamamlanıp incelenmeden hiçbir yayın (deploy/release) gündeme alınmayacaktır. Paket A veya Paket B sonrası ara yayın/deploy önerileri iptal edilmiştir; süreç yalnızca yerel geliştirme, hedefli testler, kod incelemeleri ve yerel Git checkpoint commit'leri ile yürütülür. Ayrı açık kullanıcı onayı olmadan remote push, remote tag veya Coolify deploy kesinlikle yapılmaz.

**29 Eylül çalışma devri:** Kullanıcı kalan görevleri Antigravity yerine bu ajan üzerinden yürütmemi ve istediği işleri sırayla, atlamadan tamamlamamı istedi. UX-01 etiketleri, REL-02'ye geçmeden önce bitirilecek şekilde öne alındı; sonraki işlerde TODO sırası izlenecek. Tüm çalışmalar yerel kalır; ara paket yayını/deploy yapılmaz.

### Kullanıcı Onaylı Ek Düzeltme — E-posta Kategori ve CSAT Bağlantısı (29 Eylül 2026)

- **Durum:** `DONE` (odaklı kontroller ve bağımsız kod incelemesi tamamlandı; yalnız yerel)
- **Kapsam:** Lisanslama etiketi, müşteri makbuzu ve personel yeni bilet uyarısında `Lisanslama` kategorisini gösterir; şemada tutulmayan bilet türü için sahte `-` gösterilmez. CSAT e-postasındaki boş CTA metni doğru TR/EN anahtarlarıyla, imzalı ve 7 gün geçerli `/tr/feedback/<token>` akışıyla değiştirildi. Bir kez puanlanan bilet yeniden açılıp çözümlense dahi eski bağlantı tekrar gösterim veya puan güncelleme yapamaz; yıldız değerlendirmesi yerel ayarlı erişilebilir native radio grubudur.
- **Doğrulama:** Backend hedefli testler 6 suite / 67 test; frontend hedefli testler 2 dosya / 7 test; backend ve frontend typecheck; TR/EN/DE i18n kontrolü ve `git diff --check` geçti. Bağımsız reviewer yeniden incelemesi önemli bulgu bildirmedi.
- **Veri / dış etki:** Şema/migration yok; gerçek müşteri verisi, SMTP, dış servis, push veya deploy kullanılmadı.
- **Release kapısı:** Bu ek düzeltme, aşağıdaki Paket A/B işlerinin tamamlanıp incelenmesi şartını değiştirmez; ara yayın yoktur.

---

## Durum Özeti Tablosu

| Sıra | Görev ID | Rapor Karşılığı | Başlık / Alan | Paket | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 0 | **STAB-00** | Handoff Bölüm 8 | Ayrı worktree, dal, belge aktarımı ve TODO planı teslimi | Altyapı / Hazırlık | **COMPLETED** (Kabul Edildi) |
| 1.1 | **SEC-01** | SEC-01 | CSAT / Bilet Çözüm Değerlendirmesi Müşteri Sahiplik ve Durum Doğrulaması | Paket A (Erişim/Oturum) | **COMPLETED** (Kabul Edildi) |
| 1.2 | **SEC-02** | SEC-02 | Refresh Token Rotasyonunda Bcrypt 72-Bayt Sınırı ve Token Doğrulama Güvenliği | Paket A (Erişim/Oturum) | **COMPLETED** (Kabul Edildi) |
| 1.3 | **SEC-03** | SEC-03 | Profil Parola Güncellemesinde Mevcut Parola, Model Uyumu ve Oturum İptal Zinciri | Paket A (Erişim/Oturum) | **COMPLETED** (Kod incelemesi kabul) |
| 1.4 | **SEC-04** | SEC-04 | WhatsApp Webhook Tanınmayan Göndericide Güvenli Ret / Karantina İzolasyonu | Paket A (Erişim/Oturum) | **COMPLETED** (dar kapsam kabul) |
| 1.5 | **SEC-05** | Röntgen Bölüm 5.3 / 13 | Genel / Bulk Bilet Güncellemelerinde Yetki ve Durum Geçiş Sınırları | Paket A (Erişim/Oturum) | **COMPLETED** (Bağımsız kabul) |
| 2.1 | **REL-01** | Handoff Bölüm 7 (Sıra 2) | Paket A Sonrası Tip Kontrolü, Derleme ve Odaklı Testler (Ara Yayın Yok) | Paket A (Kalite Kontrolü) | **COMPLETED** (Bağımsız kabul; tarayıcı kapsam sınırı kayıtlı) |
| 2.2 | **REL-02** | Handoff Bölüm 5 (P1) | Erişilebilir High Bağımlılık Denetimi ve Quality Gate CI/E2E Analizi | Paket A (Yayın Hazırlığı) | **COMPLETED** (yerel audit/CI düzeltmeleri, izole seed smoke ve bağımsız inceleme geçti; hosted CI çalıştırılmadı) |
| 3.1 | **RAG-01** | RAG-01 | Bilgi Bankası Raw SQL Makale Aramasında Silinmeme ve Güncel Sürüm Filtrelemesi | Paket B (Güvenilir Bilgi) | **COMPLETED** (yerel; odaklı test, typecheck ve bağımsız inceleme geçti) |
| 3.2 | **CACHE-01**| Röntgen Bölüm 10 | Redis ve Semantic Cache Tutarsızlığı / İptal (Invalidation) Olayları | Paket B (Güvenilir Bilgi) | **PENDING** |
| 3.3 | **PRIV-01** | PRIV-01 | SSS Özetlerinde ve Bilet Vektörlerinde İç Notların Ayrıştırılması ve Gizlilik | Paket B (Güvenilir Bilgi) | **PENDING** |
| 3.4 | **LRN-01** | Röntgen Bölüm 8.2 / 8.3 | Çözüm Temelli SSS Çıkarımı, Puanlama Ayrımı ve Yaşam Döngüsü Açıklığı | Paket B (Güvenilir Bilgi) | **PENDING** |
| 4.1 | **CWL-01** | CRAWL-01 | Crawler / Havuz Kuyruk Hatasında SYNCING Takılması ve Eski İndeks Koruması | Paket B (Ingestion) | **PENDING** |
| 4.2 | **CWL-02** | Handoff Bölüm 7 (Sıra 4) | Temsilî Tek Public URL Uçtan Uca İçe Aktarma ve Vektörleme Doğrulaması | Paket B (Ingestion) | **PENDING** |
| 4.3 | **MOD-01** | RAG-02 | Model / Embedding Sürüm Değişimi ve Toplu Reindex Operasyonel Kısıtı | Paket B (Ingestion) | **PENDING** |
| 5.1 | **UX-01** | Handoff Bölüm 4 | Bölüm 4 Görünür Frontend AI / `ANN_*` Metin ve Etiket Revizyonu | Paket B (Kullanım/UX) | **COMPLETED** (TR/EN/DE; yerel render ve odaklı kontroller geçti) |
| 5.2 | **UX-02** | Röntgen Bölüm 12 | Yardım Ekranı (`/tr/help`) Çeviri Anahtarları ve Gerçek Personel Rol Menüsü | Paket B (Kullanım/UX) | **PENDING** |
| 5.3 | **UX-03** | Röntgen Bölüm 12 | Öğrenme, Değerlendirme Anketi ve Aday Durumlarının Arayüzde Şeffaf Ayrımı | Paket B (Kullanım/UX) | **PENDING** |
| 6.1 | **DEF-01** | Handoff Bölüm 5 (P1) | Depo Geneli Kapsamlı Lint Borcunun Kademeli Temizliği | Ertelenen İşler | **DEFERRED** |
| 6.2 | **DEF-02** | Handoff Bölüm 5 (P2) | Eski 500 `knowledge-sync` Başarısız Kuyruk Kaydının Ayrı Analizi | Ertelenen İşler | **DEFERRED** |
| 6.3 | **DEF-03** | Röntgen Bölüm 14 | Outbound Webhook Wildcard ve Çift Bildirim Riskinin Koşullu Takibi | Ertelenen İşler | **DEFERRED** |

---

## Sıra 0: STAB-00 — Çalışma Alanı İzolasyonu ve Planlama

### STAB-00: Doğru Commit'ten Ayrı Worktree, Belge Aktarımı ve TODO Teslimi
- **Durum:** `COMPLETED` (Kabul Edildi)
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
- **Durum:** `COMPLETED` (Kabul Edildi)
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
- **Durum:** `COMPLETED` (Kabul Edildi)
- **Rapor ID / Kanıt:** SEC-02; Röntgen Bölüm 13 (Satır 334); `B/auth/auth.service.ts:121,140,578-581,616-620`.
- **Dosya / Modül:** `apps/backend/src/auth/auth.service.ts`, `apps/backend/src/auth/refresh-token-security.spec.ts`, `apps/backend/src/auth/auth.service.spec.ts`.
- **Minimum Değişiklik:** 
  - Refresh token'ın tamamı bcrypt'e verilmeden önce SHA-256 ile sabit uzunlukta (64 karakter hex) özetlenerek (`crypto.createHash('sha256').update(token).digest('hex')`) bcrypt 72 bayt sessiz kesme ve çakışma açığı kesin olarak önlendi.
  - Saklanan hash'e açık sürüm öneki eklendi: `v2:<bcryptHash>`.
  - Doğrulama (`verifyRefreshToken`): Saklanan hash `v2:` ile başlamıyorsa veya geçersizse eski raw-bcrypt hash'lerine güvensiz geri dönüş (fallback) yapılmadan doğrudan ret (`ForbiddenException('Access denied')`) uygulandı.
  - Normal `login` ve `refreshTokens` rotasyonu aynı yeni `v2:` formatını üretecek şekilde güncellendi.
  - `refreshTokens` içerisindeki atomik CAS (`prisma.user.updateMany` with `id`, `status: 'ACTIVE'`, `deletedAt: null`, `sessionVersion`, `refreshTokenHash`) yarış ve eşzamanlı sıfırlama koruması eksiksiz korundu.
  - Parola hash'leme mantığı, kullanıcı parolaları ve JWT access token mimarisi değiştirilmedi.
- **Kapsam Dışı:** Kullanıcı parolalarının topluca sıfırlanması; JWT access token mimarisinin değiştirilmesi; veritabanı migration'ı; yeni ortam değişkeni/secret eklenmesi; frontend değişikliği.
- **Bağımlılık:** SEC-01 tamamlandı (`19155d2d`, `a53170a1`, `dbf6034f`).
- **Kabul Ölçütü:** 72 bayttan uzun refresh token'lar güvenle doğrulanabilmeli; ilk 72 baytı aynı olan farklı saldırgan token'ları kesin olarak reddedilmeli; legacy raw-bcrypt token'ları fallback olmadan reddedilmeli; geçerli `v2:` token rotasyonu başarıyla yeni `v2:` token çifti üretmeli; rotasyona uğramış eski token ve eşzamanlı CAS kaybedeni reddedilmeli.
- **Doğrulama Kanıtı ve Mock Test Sınırı:**
  - **Bağımsız İnceleme Onayı:** Bağımsız reviewer tarafından iki hedefli süitte 70/70 test PASS ile onaylandı. Login ve rotation SHA256hex/bcrypt `v2:` formatı, veritabanı TEXT alan uyumu, parola hash'lerinin değişmezliği ve CAS/sessionVersion dayanıklılığı doğrulandı.
  - **Kriptografik ve Güvenlik Testleri (`src/auth/refresh-token-security.spec.ts`):** 13/13 test PASS.
    1. Standart bcrypt 72 bayt kesme zafiyeti ve ilk 72 baytı aynı iki farklı token'ın çakıştığının kriptografik kanıtı.
    2. SHA-256 ön-özetlemenin bu 72 bayt çakışmasını giderdiğinin kriptografik kanıtı.
    3. Geçerli `v2:` formatlı token ile `refreshTokens` başarıyla yeni token üretir ve `v2:` hash rotasyonu yapar.
    4. İlk 72 baytı aynı saldırgan token'ı kesinlikle reddedilir (`ForbiddenException`).
    5. Tamamen yanlış token kesinlikle reddedilir.
    6. Legacy raw-bcrypt hash'leri güvensiz fallback yapılmadan reddedilir.
    7. Bozuk veya eksik hash (`v2:`) reddedilir.
    8. Rotasyona uğramış eski token reddedilir.
    9. Eşzamanlı yarışta `updateMany` count 0 dönen CAS kaybedeni reddedilir.
    10. JWT `sessionVersion` uyumsuzluğu reddedilir.
    11. Soft-deleted kullanıcı reddedilir.
    12. Askıya alınmış/inaktif kullanıcı reddedilir.
    13. `login` işlemi yeni hash'i `v2:` öneki ile üretir ve kaydeder.
  - **Mevcut Auth Servis Testleri (`src/auth/auth.service.spec.ts`):** 57/57 test PASS (yeni `v2:` sözleşmesine uygun armatür güncellemeleriyle).
  - **Tüm Auth Modülü Süitleri (`src/auth`):** 9 test suite, 165 testin tamamı PASS (0 fail, 0 regresyon).
  - **Tip Denetimi:** `pnpm --filter @aluplan/backend typecheck` (`tsc --noEmit`) 0 hata ile PASS.
  - **Çalışma Zamanı ve Ortam Kanıtı:**
    - Node: `/Users/hazarvolgaekiz/Library/pnpm/bin/node` (`v24.18.0`)
    - pnpm: `/Users/hazarvolgaekiz/Library/pnpm/bin/pnpm` (`9.15.4`, `package.json` içindeki `packageManager: "pnpm@9.15.4"` ile tam uyumlu).
    - `[WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.overrides"` uyarısı pnpm 9.15.4 tarafından üretilmekte olup test çıktısında gizlenmemiştir.
    - Kurulum mevcut bağımlılıklar üzerinden (frozen lockfile uyumlu, lockfile/package.json modifikasyonu yapılmadan) doğrulanmıştır.
  - **Mock Test Sınırı:** Bu aşamadaki doğrulamalar izole Jest mock testleri ve kriptografik karşılaştırma fonksiyonları ile yapılmıştır. Canlı müşteri veri tabanı entegrasyonu veya staging ortamı bu kapsamda çalıştırılmamıştır.
  - **İnceleme Notu (Non-blocking):** Veritabanında bozuk/geçersiz maliyet veya revizyona sahip boş olmayan `v2:` bcrypt hash'i bulunması durumunda `bcrypt.compare` istisna fırlatarak 500 dönebilir; sistem fail-closed kalır ve yetkisiz erişim kesinlikle verilmez. Kapsam dışına çıkmamak adına bu aşamada ek düzeltme yapılmamıştır; ileride genel auth hata davranışı ele alınırken incelenecektir.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Operasyonel Etki ve Açık Karar Kaydı:**
  - Bu düzenleme yerel teknik bir karardır; canlı oturumların sonlandırılması veya canlıya yayınlama onayı DEĞİLDİR.
  - Gelecekte canlıya alındığında: Eski raw-bcrypt formatındaki refresh token'lara sahip mevcut aktif oturumlar yenileme yapamayacak ve bir kereye mahsus yeniden kullanıcı adı/şifre ile giriş yapmaları gerekecektir. Normal giriş yapan kullanıcılara otomatik olarak yeni `v2:` formatı atanacaktır. Şifreler ve access token mimarisi etkilenmez.

### SEC-03: Profil Parola Güncellemesinde Mevcut Parola, Model Uyumu ve Oturum İptal Zinciri
- **Durum:** `COMPLETED` (Kod incelemesi kabul)
- **Rapor ID / Kanıt:** SEC-03; Röntgen Bölüm 13 (Satır 335); `B/users/dto/update-profile.dto.ts:35-38`, `B/users/users.service.ts:191-204`, `B/auth/auth.service.ts:450-480`.
- **Dosya / Modül:** `apps/backend/src/users/users.service.ts`, `apps/backend/src/users/dto/update-profile.dto.ts`, `apps/frontend/src/app/[locale]/(dashboard)/profile/page.tsx`, `apps/frontend/src/components/auth/role-guard.tsx`, `apps/frontend/messages/{tr,en,de}.json`.
- **Kullanıcı Kararı (Kesinleşen):**
  - Profil ekranından parola güncellendiğinde mevcut parola (`currentPassword`) zorunlu tutulmalı; yanlış veya eksik mevcut parola 400 Bad Request ile reddedilmelidir.
  - Başarılı parola değişiminde tüm eski oturumlar iptal edilmeli (`sessionVersion: { increment: 1 }`, `refreshTokenHash: null`, `passwordResetJtiHash: null`, Redis `user:${id}:force_logout_at`); mevcut tarayıcı oturumu kapatılıp (`logout()`) kullanıcı anlaşılır bilgilendirme metniyle (`toasts.password_changed_relogin`) locale uyumlu login ekranına (`/${locale}/login`) yönlendirilmelidir.
  - Normal ad/telefon/şirket vb. profil güncellemeleri oturumu kapatmamalıdır (`passwordChanged: false`).
  - Gerçek kullanıcı kimlik bilgileri değiştirilmemeli; yalnızca kod ve sentetik testler kullanılmalıdır.
- **Uygulanan Değişiklikler ve Güvenlik Sınırları:**
  - **DTO Güvenliği (`update-profile.dto.ts`):** `currentPassword`, `newPassword` ve geriye dönük uyumlu `password` alanları eklendi; `@MinLength(8)` şartı kondu. `main.ts` global ValidationPipe `enableImplicitConversion: true` tip zorlamasını önlemek için `@Transform` koruyucuları eklendi (boolean veya numeric değerlerin string'e dönüştürülmesi engellendi).
  - **Ham Parola Bütünlüğü (Zero-Trim):** Hashlenecek yeni parola (`rawNewPassword`) asla `.trim()` ile kırpılmamakta, bayt bütünlüğü korunmaktadır. Boşluk içeren geçerli parolalar (`'  Pass with spaces!  '`) aynen hashlenip login aşamasındaki `bcrypt.compare` ile %100 uyumlu doğrulanmaktadır. Trim yalnızca boşluk-only (`rawNewPassword.trim().length === 0`) geçersiz parolaları yakalamak için kullanılmaktadır.
  - **İlişkili DB Yazımlarında Atomik Prisma Transaction:** Parola CAS güncellemesi (`user.updateMany`), profil senkronizasyonu (`updateOrCreateCustomerProfile`) ve taze kullanıcı okuması (`user.findUnique`) aynı `this.prisma.$transaction(async (tx) => { ... })` bloğuna alındı. Profil güncellemesi (ör. müşteri profili kısıt ihlali) veya veri tabanı hatası durumunda parola ve oturum sürümündeki değişiklikler otomatik olarak geri alınır (rollback); Redis oturum iptal işaretçisi çağrılmaz ve fail-closed kalınır.
  - **Müşteri Profili İsim Tutarlılığı:** `updateOrCreateCustomerProfile` metodu, güncellenen `dto.fullName` değerini esas alarak `firstName` ve `lastName` türetmektedir. Parola, ad-soyad ve şirket alanları aynı anda güncellendiğinde eski `user.fullName` kullanılma regresyonu giderilmiştir.
  - **Durable Oturum İptal Zinciri:** Prisma CAS koşulu (`where: { id, status: 'ACTIVE', deletedAt: null, sessionVersion, passwordHash }`) ile eşzamanlı yarışlar önlendi. Başarılı commit sonrasında Redis oturum iptal anahtarı (`user:${userId}:force_logout_at`) fail-safe try-catch ile işaretlendi.
  - **Gizlilik:** Servis yanıtından `passwordHash`, `refreshTokenHash` ve `passwordResetJtiHash` alanları kesin olarak temizlendi; yanıt nesnesi `{ ...result, passwordChanged: boolean }` döndürmektedir.
  - **Frontend UX & Tek Yönlendirme:** `role-guard.tsx` içerisindeki `logout` metodu isteğe bağlı yönlendirme hedefi (`redirectTo?: string`) alacak ve bulunulan sayfaya göre (`pathname` içinden `routing.locales` prefix'i) varsayılan locale uyumlu login rotasını (`/${localePrefix}/login`) belirleyecek şekilde güncellendi. `profile/page.tsx` içerisindeki ikinci `router.push` çağrısı kaldırılarak doğrudan tek ve locale uyumlu `await logout(`/${locale}/login`)` çağrısına dönüştürüldü; böylece çift yönlendirme riski ortadan kaldırıldı ve diğer mevcut `logout()` çağrılarının davranışları bozulmadan korundu.
  - **Çeviriler:** `tr.json`, `en.json`, `de.json` dosyalarına `current_password` placeholder/etiket ve gerekli toast mesajları eklendi.
- **Kapsam Dışı:** Şifremi unuttum / e-posta sıfırlama (reset password) akışının baştan yazılması; migration; global ValidationPipe ayarlarının değiştirilmesi.
- **Bağımlılık:** SEC-02 tamamlandı (`b125a24d`, `765ed689`, `7df9f3cd`).
- **Kabul Ölçütü:** Yanlış veya eksik mevcut parola ile şifre değişimi reddedilmeli (400); doğru mevcut parola ile şifre güncellenmeli; boşluk içeren parolalar bozulmadan saklanmalı; transaction içi profil yazımı hata verirse parola/session değişimi rollback olmalı ve Redis çağrılmamalı; başarılı şifre değişiminde tarayıcı oturumu kapatılıp login ekranına yönlendirilmeli; normal profil güncellemesi oturumu kapatmamalıdır.
- **Doğrulama Kanıtı ve Mock Test Sınırı:**
  - **Bağımsız İnceleme Onayı:** Backend (37/37 hedefli test) ve frontend (iki dar suite 8/8 test) bağımsız incelemeden geçerek KABUL edildi.
  - **Backend Testleri (`src/users`):** 4 test suite, 48/48 test PASS (0 fail).
    - `src/users/profile-password-security.spec.ts`: 15/15 test PASS (ham parola bütünlüğü, login uyumu, whitespace-only ret, birleşik profil senkronizasyonu, transaction rollback ve Redis izolasyonu, CAS yarış koruması, soft-delete ve inaktif kullanıcı koruması).
    - `src/users/dto/update-profile.dto.spec.ts`: 11/11 test PASS (global ValidationPipe ayarlarıyla tip güvenliği, boolean/numeric engellemesi, 8 karakter alt sınır).
    - `src/users/users.service.spec.ts`: 14/14 test PASS.
    - `src/users/__tests__/users.controller.spec.ts`: 8/8 test PASS.
  - **Backend Tip Denetimi:** `pnpm --filter @aluplan/backend typecheck` (`tsc --noEmit`) 0 hata ile PASS.
  - **Frontend Testleri:**
    - `src/app/[locale]/(dashboard)/profile/ProfilePage.spec.tsx`: 5/5 test PASS (mevcut parola zorunluluğu, min length, parola uyuşmazlığı, başarılı parola değişiminde toast + tek locale login yönlendirmeli logout, normal güncellemede oturum korunması).
    - `src/components/auth/role-guard.spec.tsx`: 3/3 test PASS (varsayılan locale duyarlı logout ve özel redirectTo doğrulaması).
  - **Frontend Tip Denetimi:** `pnpm --filter @aluplan/frontend typecheck` (`tsc --noEmit`) 0 hata ile PASS.
  - **Çeviri Bütünlüğü:** `pnpm --filter @aluplan/frontend i18n:check` TR, EN, DE %100 eksiksiz ve yeşil.
  - **Mock Test Sınırı ve Kanıt Dili:** Doğrulamalar NestJS ve Vitest/Jest mock ortamında (mock bcrypt, mock Prisma transaction ve mock Redis) yapılmıştır. bcrypt ve Prisma transaction mock'ları gerçek login/DB rollback entegrasyon kanıtı değildir; yalnız iletilen parametrelerin (untrimmed raw string, BCRYPT_ROUNDS) ve transaction hata bağlantısının (hata durumunda transaction'ın istisna fırlatması ve Redis'in çağrılmaması) doğrulanmasıdır. Mock testleri tarayıcı veya canlı DB entegrasyon kanıtı olarak sunulamaz. Gerçek tarayıcı/render doğrulaması bu aşamada yapılmamıştır; Paket A kalite kontrolü olan REL-01 maddesi altında beklemektedir. Canlı kullanıcı kimlik bilgileri, gerçek veritabanı veya canlı dış servisler kesinlikle kullanılmamıştır.
  - **İnceleme Notu (Non-blocking):** `logout` API çağrısının 401/reject dönmesi sonrasında `finally` bloğundaki yerel temizliğin (`setUser(null)`) ve yönlendirmenin işletilmesine dair hata yolu birim testi eksiktir. Kapsamı büyütmemek adına yeni iş açılmamış olup ileride auth hata davranışları ele alınırken incelenecektir.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği (mevcut `User` ve `CustomerProfile` alanları kullanıldı).
- **Operasyonel Etki:** Profil ekranından parola değiştiren kullanıcıların oturumları derhal sonlanır ve yeni parolalarıyla tekrar giriş yapmaları gerekir. Normal profil bilgisi güncelleyenlerin oturumu kesilmez.

### SEC-04: WhatsApp Webhook Tanınmayan Göndericide Güvenli Ret / Karantina İzolasyonu
- **Durum:** `COMPLETED` (dar kapsam kabul)
- **Rapor ID / Kanıt:** SEC-04; Röntgen Bölüm 13 (Satır 336), Bölüm 5.5 (Satır 131); `B/whatsapp/whatsapp.service.ts:35-69`.
- **Dosya / Modül:** `apps/backend/src/whatsapp/whatsapp.service.ts`, `apps/backend/src/whatsapp/whatsapp.service.spec.ts`.
- **Minimum Değişiklik ve Güvenlik Sınırları:**
  - **Desteklenmeyen / Boş Metin Erken Reddi (`no_text/unsupported`):** Eksik veya metin içermeyen mesaj tipleri (görsel, çıkartma, konum, boş metin) veri tabanı ve bilet yazımı yapılmadan doğrudan `{ status: 'no_text', reason: 'unsupported' }` ile erken sonlandırıldı; genel içerikli bilet oluşturma davranışı kaldırıldı.
  - **Erken Güvenli Ret ve Çapraz Kiracı İzolasyonu:** Telefon numarası müşteri profiliyle eşleşmediğinde (`!profile`) veya profilde ilişkili kullanıcı kimliği eksik olduğunda (`!profile.userId`), bilet arama sorgusunun `userId: undefined` ile çalıştırılması kesin olarak engellendi. İşlem erken sonlandırılarak `{ status: 'rejected', reason: 'unrecognized_sender' }` veya `{ status: 'rejected', reason: 'missing_user_identity' }` güvenli durum nesnesi döndürüldü.
  - **Başka Müşterinin Biletini Arama / Mesaj Ekleme Engeli:** `prisma.ticket.findFirst` sorgusu yalnızca eşleşen bir profil ve `userId` mevcut olduğunda çalıştırılır. Tanınmayan gönderici durumunda bilet sorgusu, bilet mesajı ekleme (`prisma.ticketMessage.create`) ve bilet güncelleme çağrıları kesinlikle yapılmaz.
  - **Anonim Müşteri / Bilet Açma Engeli:** Tanınmayan veya ilişkisiz göndericiler için `ticketsService.create` çağrılmaz; CRM kabul kuralları korunarak yetkisiz anonim bilet oluşturulması engellendi.
  - **Güvenli Loglama ve PII Koruması:** Loglardan açık incoming telefon (`fromPhone`, `cleanPhone`), e-posta ve outbound alıcı telefon numarası (`to`) ile ham mesaj metinleri kaldırıldı; ret ve doğrulama akışlarında neden/durum kodları (`unrecognized_sender`, `missing_user_identity`, `invalid_sender_phone`, `no_text/unsupported`) kullanıldı. İç `userId`, bilet kimliği ve sağlayıcı `error.message` sınırları residual riskler bölümünde açıkça kayıtlıdır.
  - **Outbound Sadeliği:** Outbound tarafındaki gereksiz emoji ve optional-chain değişiklikleri geri alınarak minimal tutuldu; telefon numarasının logdan kaldırılması korundu.
  - **Sıfır Yeni Altyapı:** Yeni bir veritabanı karantina tablosu veya Prisma migration'ı eklenmemiştir.
  - **Canlı Kanal Durumu:** WhatsApp kanalı canlıya açılmamış / etkinleştirilmemiştir.
- **Kapsam Dışı:** Yeni bir veritabanı tablosu veya Prisma migration'ı eklemek; WhatsApp kanalını canlı trafiğe açmak; Meta webhook sözleşmesini değiştirmek; CRM veri kurallarını veya telefon normalizasyon altyapısını yeniden yazmak.
- **Bağımlılık:** SEC-03 tamamlandı (`95f05899`, `bcbd578d`, `5c8868c9`).
- **Kabul Ölçütü:** Tanınmayan veya ilişkisiz bir telefon numarasından gelen webhook isteğinde asla başka bir müşterinin biletine mesaj eklenmemeli; anonim müşteri/bilet oluşturulmamalı; desteklenmeyen/boş metin bilet açmadan reddedilmeli; istek erken ve güvenli biçimde reddedilip güvenli kodla loglanmalı; meşru kullanıcı akışı bozulmamalıdır.
- **Bakiye Riskler ve İddia Sınırları (Residual Risks):**
  - **1. Substring Telefon Eşleme Belirsizliği:** Mevcut `phoneNumber: { contains: cleanPhone }` ve `findFirst` mantığı, kısa veya ortak rakam dizileri içeren numaralarda yanlış profile eşleşme belirsizliğini çözmez. Bu turda kapsamı büyütmemek adına telefon normalizasyon altyapısı / E.164 CRM kural refactor'ü başlatılmamıştır.
  - **2. Kullanıcı Varlık/Durum/Silinme Denetimi Eksikliği:** `include: { user: true }` çekilmekle birlikte kullanıcının `status` (örn. `ACTIVE`/`SUSPENDED`) veya `deletedAt` durumu bu dar patch kapsamında denetlenmemektedir; yalnızca `profile.userId` varlığı denetlenmektedir.
  - **3. Outbound Sağlayıcı Hata İçeriği:** `sendOutgoing` hata logunda yer alan `error.message`, Meta sağlayıcısının döndürdüğü hata ayrıntılarını barındırabilir.
  - **4. SEC-04 Kapsam Sınırı ve Canlı Yayın Yasağı:** SEC-04 yalnızca `no-profile` ve `missing-userId` kaynaklı `userId: undefined` kapsam açığının kapatılmasıdır; tüm müşteri izolasyonunun veya kanal olgunluğunun nihai kanıtı değildir. Bu bakiye riskler giderilmeden WhatsApp kanalının canlıda etkinleştirilmesi kesinlikle önerilmeyecektir.
- **Doğrulama Kanıtı ve Mock Test Sınırı:**
  - **Birim ve Güvenlik Testleri (`src/whatsapp/whatsapp.service.spec.ts`):** 12/12 test PASS (0 fail).
    1. Boş payload'da `no_message` dönüşü ve DB sorgusu yapılmaması.
    2. Eksik message entry'de `no_message` dönüşü.
    3. **Desteklenmeyen / Boş Metin Kanıtı:** Görsel/çıkartma gibi metin içermeyen veya boşluk-only text payload'larında DB ve ticket yazımı olmadan `no_text/unsupported` ile erken sonlandığı kanıtlandı.
    4. Rakam içermeyen/geçersiz gönderici numarasında `invalid_sender_phone` erken reddi ve DB sorgusu yapılmaması.
    5. Normalize edilmiş telefon rakamlarıyla profil eşleştirme araması ve bulunamadığında `unrecognized_sender` erken reddi.
    6. **SEC-04 Çapraz Kiracı / İzolasyon Kanıtı:** Veritabanında/mock'ta başka bir müşteriye ait açık WhatsApp bileti bulunsa dahi tanınmayan numarada `ticket.findFirst` sorgusunun **asla çağrılmadığı**, kurbanın biletine mesaj eklenmediği ve anonim bilet oluşturulmadığı kanıtlandı.
    7. **SEC-04 Eksik Kullanıcı Kimliği Kanıtı:** Müşteri profili var ancak ilişkili `userId` null/eksik ise `missing_user_identity` ile erken ret, bilet sorgulanmaması ve mesaj eklenmemesi kanıtlandı.
    8. **SEC-04 Güvenli Loglama Kanıtı:** Reddedilen isteklerde Logger `warn`, `debug`, `log` çıktılarında açık incoming telefon numarası, gönderilen gizli mesaj metni bulunmadığı, `unrecognized_sender` kodunun loglandığı spy assertion'ları ile doğrulandı.
    9. **Eşleşen Profil (Aktif Biletli):** Müşteri profilinde açık WhatsApp biletine `senderId` ile güvenle mesaj eklenmesi.
    10. **Eşleşen Profil (Yeni Bilet):** Açık bileti olmayan müşteriye `tickets.create` ve `WHATSAPP` kanalı ile bilet oluşturulması.
    11. **Ajan Yanıtı (Outbound):** WhatsApp biletine ajan yanıt verdiğinde müşterinin telefonuna dış mesaj gönderilmesi.
    12. **Dahili Not İzolasyonu:** Dahili notların ve müşterinin kendi mesajlarının dış WhatsApp mesajı tetiklememesi.
  - **Tüm WhatsApp Modülü Testleri (`src/whatsapp`):** 3 test suite (`whatsapp.service.spec.ts`, `whatsapp.controller.spec.ts`, `whatsapp-webhook-signature.guard.spec.ts`), 17/17 testin tamamı PASS (0 fail, 0 regresyon).
  - **Backend Tip Denetimi:** `pnpm --filter @aluplan/backend typecheck` (`tsc --noEmit`) 0 hata ile PASS.
  - **Mock Test Sınırı:** Doğrulamalar NestJS ve Jest izole mock ortamında çalıştırılmıştır. Canlı Meta/WhatsApp Graph API çağrısı, harici Dynamics 365 CRM bağlantısı veya canlı ağ trafiği kullanılmamıştır; kanal canlıya açılmamıştır.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Açık Kullanıcı Kararı:** Çözüldü (güvenli teknik varsayılan: tanınmayan numara reddedilir, anonim bilet/müşteri açılmaz, migration yapılmaz).

### SEC-05: Genel / Bulk Bilet Güncellemelerinde Yetki ve Durum Geçiş Sınırları
- **Durum:** `COMPLETED` (Bağımsız kod incelemesi kabul edildi; yerel checkpoint oluşturuluyor)
- **Rapor ID / Kanıt:** Röntgen Bölüm 5.3 (Satır 118), Bölüm 13 (Satır 342), Bölüm 14 (Satır 349); `B/tickets/tickets.service.ts`, `B/tickets/dto/update-ticket.dto.ts`.
- **Dosya / Modül:** `apps/backend/src/tickets/tickets.service.ts`, `apps/backend/src/tickets/dto/update-ticket.dto.ts`, `apps/backend/src/tickets/ticket-management-security.spec.ts`, `apps/backend/src/tickets/ticket-management.http.spec.ts`.
- **Minimum Değişiklik ve Güvenlik Sınırları:**
  - **Müşteri Alan Kısıtlamaları (`assertTicketFieldUpdateAllowed`):**
    - Müşteri rolü (`CUSTOMER` veya `VIEWER`), genel `PATCH /tickets/:id` veya toplu `PATCH /tickets/bulk` üzerinden atama (`assignedTo`), öncelik (`priority`), SLA alanları (`slaPolicyId`), yönetim alanları (`teamId`, `departmentId`, `tags`) veya durum (`status`) alanlarını güncelleyemez. Herhangi biri gönderildiğinde doğrudan `ForbiddenException('TICKET_FIELD_AGENT_ONLY')` (403) fırlatılır ve veri tabanına sıfır yazım yapılır.
    - `UpdateTicketDto` sınıfına yalnızca geçerli `status?: TicketStatus;` eklendi; gereksiz `slaPolicyId`, `teamId`, `departmentId` ekleri kaldırıldı. Servis katmanında personelin bu alanları genel güncellemeden göndermesi durumunda sessizce yok sayılmayıp `BadRequestException` (400) ile açıkça reddedilmesi sağlandı.
  - **Müşteri Yetkili Yeteneklerinin Korunması:**
    - Müşterinin kendi biletinde konu (`subject`) ve açıklama (`description`) güncelleme izni korundu.
    - Müşterinin kendi biletini onay incelemesine gönderme hakkı (`PATCH /tickets/:id/status/PENDING_CUSTOMER_REVIEW` via `transition`) korundu.
    - VIP müşteri profiline sahip kullanıcıların canlı destek talep etme hakkı (`chatStatus: REQUESTED`) korundu.
    - Müşterinin `PENDING_CUSTOMER` durumundaki biletine yanıt vererek bileti yeniden açması (`addMessage` içinde reopen on customer reply) korundu.
    - Müşterinin CSAT çözümlenme değerlendirmesi sunması (`POST /tickets/:id/feedback`) korundu.
  - **P1: No-op / Aynı-Status Güncellemede Skaler Güvenli Yanıt ve Veri Sızıntısı Engeli:**
    - `findOne(id, requester)` personelde çağrıldığında `messages` (dahili notlar dahil) ve `attachments` ilişkilerini genişletilmiş olarak getirmektedir. `update()` metodunda no-op veya salt alan güncellemesi durumunda bu genişletilmiş nesnenin controller'a ve oradan `emitTicketUpdated` ile istemci WebSocket odalarına sızması engellendi. No-op dahil her durumda yalnızca skaler `Ticket` alanları (ilişkilerden arındırılmış) döndürülür.
  - **Genel Birleşik Güncellemede (`update`) Erken Doğrulama ve Atomiklik:**
    - Birleşik isteklerde (ör. geçerli `status` geçişi + geçersiz `assignedTo`) tüm doğrulamalar (durum makinesi yetki/geçiş kuralları, kapalı bilet kontrolü, personelin aktif ekip/departman üyeliği) herhangi bir DB yazımından önce işletilir.
    - Geçersiz bir atama yapıldığında durum geçişi veritabanına yazılmaz, işlem anında durdurulur ve sıfır olay yayılır (kısmi başarı/hata asimetrisi önlendi).
    - Yazım aşamasında eşzamanlı yarışlara karşı durum değişsin veya değişmesin (yalnızca atama dahil) tüm mutasyon yazımları `where: { id: ticket.id, status: ticket.status, deletedAt: null, ...(closedAt if CLOSED) }` koşullandırması ile sınırlandırılır; yarış durumunda `ConflictException` üretilir ve commit öncesi hiçbir olay fırlatılmaz.
  - **Personel Toplu Güncelleme (`bulkUpdate`) Sınırları ve "All-or-Nothing" Atomikliği:**
    - **Yazım Öncesi Doğrulama (Pre-Validation, Fail-Closed):** Veri tabanında hiçbir bilet güncellenmeden önce:
      1. Batch'teki her bir biletin durum geçişi `ALLOWED_TRANSITIONS[ticket.status]` kuralına göre denetlenir. Tek bir bilet dahi kuralı ihlal ediyorsa işlem anında `BadRequestException` ile durdurulur.
      2. `assignedTo` belirtilmişse batch'teki biletlerin ait olduğu her bir benzersiz departman (`distinctDeptIds`) için personelin aktif, arşivlenmemiş bir ekipte yer aldığı (`assign()` ile birebir aynı `teamMembers.some.team` sorgusuyla) doğrulanır. Herhangi bir departman kısıtı karşılanmazsa işlem anında reddedilir.
      3. `assignedTo` belirtilmişse batch'teki hiçbir biletin `CLOSED` durumunda olmaması şart koşulur (aynı bulk işlemde `status: OPEN` ile yeniden açılmıyorsa); ihlalde `BadRequestException('Cannot assign a closed ticket')` fırlatılır.
    - **Bilet Başına Bağımsız Hedef Durum Hesaplaması:** Yalnızca atama yapılan bulk isteklerde batch içinde `NEW` durumundaki biletler `OPEN` durumuna geçirilirken, `IN_PROGRESS` veya `RESOLVED` durumundaki diğer biletlerin mevcut durumları kesin olarak korunur (tüm batch'in körü körüne `OPEN` yapılması engellendi).
    - **İlk Yanıt Zamanı Bütünlüğü (`slaRespondedAt`):** Mevcut `slaRespondedAt` zaman damgasına sahip biletlerde bu değer korunur, yeniden `now` yapılarak SLA metriğinin ezilmesi engellendi.
    - **Atomik Prisma Transaction & Optimistic Concurrency:**
      - Tüm bilet güncellemeleri `this.prisma.$transaction(async (tx) => { ... })` içinde tek tip çalıştırılır.
      - Her bilet güncellemesi `where: { id: ticket.id, status: ticket.status, deletedAt: null, ...(closedAt if CLOSED) }` ile koşullandırılır. Okuma sonrası eşzamanlı olarak kapatılan veya durumu değişen biletlerde Prisma `P2025` hatası yakalanarak `ConflictException` fırlatılır ve transaction rollback edilir.
      - Kapalı biletler `OPEN` durumuna toplu açılırken (`CLOSED -> OPEN`) her bir bilet için `closedAt: null` yapılır ve dahili denetim mesajı (`TICKET_REOPENED`) atomik olarak eklenir.
    - **Commit Sonrası Güvenli Olay Yayımı (Post-Commit Event Emission):**
      - `ticket.status_changed` ve `ticket.resolved` olayları transaction başarıyla commit edildikten sonra tetiklenir; rollback veya hata durumunda asılsız olay yayılmaz.
  - **Prisma Mock Uyumu ve Kod Hijyeni:** Production kodunda mock yetersizliklerini örtmek için konulan `findMany/$transaction/updateMany var mı` fallback'leri tamamen temizlendi; test mock'ları gerçek Prisma Client sözleşmesine uyarlandı.
- **Kapsam Dışı:** UI toplu işlem menüsünün baştan tasarlanması; yeni veritabanı migration'ı; kapsamlı rol/RBAC mimarisi değişikliği.
- **Bağımlılık:** SEC-01..SEC-04 tamamlandı (`dfa49a0c`, `336f8115`, `570e5725`).
- **Kabul Ölçütü:** Müşteri genel/bulk yollarla kısıtlı alanları değiştirememeli (403); kapalı biletler geçersiz yollarla doğrudan açık/işlemde yapılamamalı (400); kapalı bilet atanamamalı (400); toplu işlemde tek bir geçersiz bilet tüm batch'i durdurmalı ve hiçbir yazım yapılmamalı (all-or-nothing); yetkili personelin geçerli reopen/close/assign akışları ve müşterinin konu/açıklama düzenleme hakları bozulmamalıdır.
- **Açık Kullanıcı Kararı:** Çözüldü (Kullanıcı kararı: Müşteri genel/bulk PATCH üzerinden atama, öncelik, SLA ve yönetim alanları veya status değişimi yapamaz; mevcut açıkça yetkilendirilmiş müşteri reopen/feedback ve onay incelemesi akışları korunur; yetkili personel reopen/close/assign işlevleri kısıtlanmaz).
- **Doğrulama Kanıtı ve Mock Test Sınırı:**
  - **Birim ve Güvenlik Testleri (`src/tickets/ticket-management-security.spec.ts`):** 53/53 test PASS (0 fail).
    - 7 ayrı kısıtlı alanda (`status`, `assignedTo`, `priority`, `slaPolicyId`, `teamId`, `departmentId`, `tags`) müşteri generic update denemelerinin `TICKET_FIELD_AGENT_ONLY` ile engellendiği ve sıfır yazım yapıldığı kanıtlandı.
    - Müşterinin kendi biletinde `subject` ve `description` güncelleyebildiği kanıtlandı.
    - Personelin kapalı bileti generic `update` üzerinden atamasının `Cannot assign a closed ticket` ile engellendiği kanıtlandı.
    - Personelin inaktif/müşteri kullanıcıya bilet atamasının engellendiği kanıtlandı.
    - Personelin kapalı bileti generic `update` ile `IN_PROGRESS` yapmasının engellendiği kanıtlandı.
    - Personelin kapalı bileti generic `update` ile `OPEN` yaparak atomik `TICKET_REOPENED` mesajı ve `ticket.status_changed` olayıyla yeniden açabildiği kanıtlandı.
    - **Bulk Update All-or-Nothing Kanıtı:** Batch içindeki tek bir bilet kural ihlali yaptığında (geçersiz durum geçişi veya kapalı bilet ataması) sıfır yazımla reddedildiği kanıtlandı.
    - Bulk update ile kapalı biletlerin atomik mesaj ve olaylarla toplu yeniden açılması kanıtlandı.
    - Bulk update ile `NEW` biletlerin atamayla `OPEN` durumuna geçirilmesi kanıtlandı.
    - **Hedefli Regresyon Testleri (8 Vaka):**
      1. *P1 No-op Scalar Return:* Boş update veya aynı-status update durumunda genişletilmiş ilişkilerin (`messages`, `attachments`, `escalations`) döndürülmediği, salt skaler `Ticket` döndürüldüğü kanıtlandı.
      2. *Bulk Target Status Independence:* `NEW` ve `IN_PROGRESS` biletleri içeren batch atandığında `NEW` bilet `OPEN` olurken `IN_PROGRESS` biletin durumunun korunduğu kanıtlandı.
      3. *Bulk Assignee Department Check:* Batch içindeki tüm departmanlar için personelin aktif ekip üyeliği arandığı, yetkisiz departman biletinde işlemin sıfır yazımla reddedildiği kanıtlandı.
      4. *Optimistic Locking:* Eşzamanlı yarışta bilet durumu değiştiğinde `ConflictException` üretilerek transaction'ın geri alındığı ve olay yayılmadığı kanıtlandı.
      5. *Combined Update Atomicity:* Geçerli status + geçersiz assignee birleşik isteğinde atama hatasının erken yakalandığı, durum geçişinin yapılmadığı ve sıfır olay fırlatıldığı kanıtlandı.
      6. *Existing SLA Preservation:* Var olan `slaRespondedAt` zaman damgasının bulk veya generic atamada ezilmediği kanıtlandı.
      7. *Unsupported Fields Rejection:* Personelin `slaPolicyId`, `teamId`, `departmentId` göndermesinin 400 `BadRequestException` ile reddedildiği kanıtlandı.
      8. *Generic Assignment-Only Optimistic Lock and Race Protection:* `OPEN` durumundaki bir bilete yalnızca `assignedTo` ataması yapılırken `where` koşuluna `{ status: OPEN, deletedAt: null }` eklendiği, okuma sonrası eşzamanlı kapatılma/silinme simülasyonunda (`P2025` hatası) `ConflictException` fırlatıldığı ve WebSocket/audit olaylarının kesinlikle yayılmadığı (sıfır event) kanıtlandı.
  - **HTTP Katmanı Testleri (`src/tickets/ticket-management.http.spec.ts`):** 23/23 test PASS (0 fail).
    - Müşteri rolünün HTTP `PATCH /tickets/:id` üzerinden kısıtlı alanları güncelleme denemelerinin 403 ile reddedildiği ve sıfır yazım yapıldığı doğrulandı.
    - Personelin HTTP üzerinden desteklenmeyen yönetim alanlarını (`slaPolicyId`, `teamId`, `departmentId`) güncelleme denemelerinin 400 ile reddedildiği doğrulandı.
    - Müşteri rolünün HTTP üzerinden konu ve açıklama güncelleyebildiği (200) doğrulandı.
  - **Odaklı Bilet Testleri:** 4 test suite (`ticket-management-security.spec.ts`, `ticket-management.http.spec.ts`, `ticket-reopen.spec.ts`, `tickets.service.spec.ts`), 120/120 test PASS (0 fail).
  - **Tüm Bilet Modülü Testleri (`src/tickets`):** 18 test suite, 245/245 test PASS (0 fail, 0 regresyon).
  - **Backend Tip Denetimi:** `pnpm --filter @aluplan/backend typecheck` (`tsc --noEmit`) 0 hata ile PASS.
  - **Biçim ve Kod Kontrolü:** `git diff --check` 0 hata ile PASS.
  - **Mock Test Sınırı:** Doğrulamalar NestJS ve Jest izole mock ortamında yürütülmüştür. Mock Prisma transaction, whereClause sorgu assertion'ları ve P2025 hata simülasyonları servis seviyesinde mantıksal doğrulama olup gerçek PostgreSQL veritabanı eşzamanlı kilit mekanizması veya tarayıcı render testi REL-01 altında Paket A kalite kontrolünde beklemektedir. Canlı veritabanı, gerçek müşteri verisi veya dış CRM servisleri kesinlikle kullanılmamıştır.
- **Veri / Migration Etkisi:** Sıfır şema değişikliği.
- **Operasyonel Etki:** Müşterilerin bilet yönetim alanlarını genel PATCH üzerinden manipüle etmesi kesin olarak engellendi. Toplu bilet yönetiminde kapalı biletlerin veya geçersiz durumların atlanması önlendi; hatalı isteklerde kısmi bozulma yerine tüm işlem atomik olarak durdurulur. İç not ve eklerin WebSocket üzerinden sızma riski ortadan kaldırıldı.

---

## Sıra 2: Paket A — Kalite Doğrulaması (Ara Yayın Yok)

### REL-01: Paket A Sonrası Tip Kontrolü, Derleme ve Odaklı Dosya Bazlı Testler
- **Durum:** `COMPLETED` (Kalite doğrulaması bağımsız incelemeden geçti; tarayıcı kapsam sınırı aşağıda kayıtlı)
- **Rapor ID / Kanıt:** Handoff Bölüm 7 (Sıra 2); `apps/backend/package.json`, `apps/frontend/package.json`.
- **Dosya / Modül:** `apps/backend`, `apps/frontend`, `apps/backend/src/tickets/tickets.service.spec.ts`.
- **Minimum Değişiklik ve Doğrulama Kapsamı:**
  - **Backend Tip Kontrolü:** `pnpm --filter @aluplan/backend typecheck` (`tsc --noEmit`) 0 hata ile PASS (Exit code 0).
  - **Backend Derlemesi (Build):** `pnpm --filter @aluplan/backend build` (`nest build`) 0 hata ile derlendi (Antigravity görev kaydında exit code 0; çıktı: `/Users/hazarvolgaekiz/.gemini/antigravity/brain/ecd74b96-ce3d-4a79-9a46-4591965f2929/.system_generated/tasks/task-1941.log`; ham çıktı dosyası tek başına exit kodu içermiyor).
  - **Frontend Tip Kontrolü:** `pnpm --filter @aluplan/frontend typecheck` (`tsc --noEmit`) 0 hata ile PASS (Exit code 0).
  - **Frontend Derlemesi (Build):** `pnpm --filter @aluplan/frontend build` (`next build`, Next.js 15.5.24 standalone) tüm sayfalar (özellikle `/[locale]/profile`) derlendi ve statik/dinamik optimizasyonlar başarıyla tamamlandı (Antigravity görev kaydında exit code 0; çıktı: `/Users/hazarvolgaekiz/.gemini/antigravity/brain/ecd74b96-ce3d-4a79-9a46-4591965f2929/.system_generated/tasks/task-1947.log`; ham çıktı dosyası tek başına exit kodu içermiyor). Next build tip kontrolü/lint’i atladığından bunlar yukarıdaki ayrı typecheck kanıtlarıyla karşılanmıştır.
  - **Dört Hedefli Modülün Birim Testleri (Final SHA: `23682769` ürün, `45a34287` test, `45193711` belge):**
    - `src/tickets/tickets.service.spec.ts`: 35/35 test PASS (0 fail). SEC-05 kapsamında `tickets.service.ts` içine eklenen koşulsuz iyimser kilit (`where: { id, status, deletedAt: null }`) sözleşmesine uygun olarak, VIP chat testindeki mock bilet verisine `status: TicketStatus.NEW` eklendi ve `where` assertion'ı minimal olarak hizalandı.
    - `src/auth/auth.service.spec.ts`: 57/57 test PASS (0 fail).
    - `src/users/users.service.spec.ts`: 8/8 test PASS (0 fail).
    - `src/whatsapp/whatsapp.service.spec.ts`: 12/12 test PASS (0 fail).
    - **Toplam:** 4 test suite, 112/112 test PASS (%100 yeşil).
  - **SEC-03 Gerçek Chromium Motorunda Yerel UI Doğrulaması (Mock API):**
    - **Doğrulama Betiği ve Log Kanıtı:**
      - Betik: `scratch/verify-profile-browser.js` (Playwright 1.58.2 Chromium headless).
      - Log Yolu: `/Users/hazarvolgaekiz/.gemini/antigravity/brain/ecd74b96-ce3d-4a79-9a46-4591965f2929/scratch/verify-profile-browser.log` (Exit code: 0).
      - Sunucu: `HOSTNAME=127.0.0.1 PORT=3099 node apps/frontend/.next/standalone/apps/frontend/server.js` (doğrulama sonrası sunucu süreci sonlandırılmıştır).
    - **Sertleştirilmiş İzolasyon ve Ağ Kısıtları:**
      - Context düzeyinde `serviceWorkers: 'block'` yapılandırması etkinleştirildi.
      - Context düzeyinde `context.routeWebSocket('**', ws => ws.close())` ile WebSocket bağlantı denemeleri engellendi.
      - Sentry tünel rotası (`/monitoring`), `socket.io` yoklamaları, Next.js link prefetch RSC istekleri (`/tr/dashboard`, `/tr/my-tickets`, vb.) ve tüm beklenmeyen istekler fail-closed olarak `route.abort('blockedbyclient')` ile engellendi (toplam 19 beklenmeyen istek engellendi).
      - Web güvenliği/TLS atlanmadı (`ignoreHTTPSErrors` kaldırıldı).
      - Gerçek veritabanı, gerçek parola, canlı CRM, mail, AI veya harici R2 servisleri kesinlikle kullanılmadı; bellek içi sentetik müşteri kimliği (`CUSTOMER`, `syn-user-1`) işletildi.
      - **Kapsam sınırı:** Bunlar gerçek Chromium’da yerel derlenmiş profil UI’sinin mock API ile odaklı etkileşim doğrulamalarıdır; backend/DB entegrasyon testi veya tüm dashboard navigasyonu/asset’leri için genel render kabulü değildir. Engellenen 19 istek arasında dashboard RSC prefetch’leri (`/dashboard`, `/my-tickets`, `/knowledge-base`, `/help`), proactive-chat/announcement yardımcı API’leri ve logo asset’leri bulunur. Bunlar konsol hatası/uyarıları ve RSC fallback’leri üretmiştir; profil senaryolarının doğrudan assertion’ları yine geçmiştir. Yardımcı akışlar, logo görünümü ve engellenen sayfalar doğrulanmış sayılmaz. Gövdenin tamamı loglanmış olsa da assertion'lar normal güncellemede tam `fullName` ve parola alanlarının yokluğu; parola senaryolarında mevcut/yeni parola değerleri, istek sayıları ve logout/nihai URL koşullarıyla sınırlıdır; kalan profil alanlarının tümü exact-match değildir.
    - **Alt Alan Adı (Subdomain) Teşhisi ve Dürüst Not:**
      - Önceki koşuda doğrudan IP adresine (`http://127.0.0.1:3099`) gidildiğinde `apps/frontend/src/lib/env.ts` dosyasındaki `window.location.hostname !== 'localhost'` mantığı nedeniyle `https://api.127.0.0.1/api/v1` şeklinde geçersiz bir alt alan adına yönelindiği ve DNS çözümlemesi başarısız olduğu tespit edilmiştir. Doğrulama hedefi `http://localhost:3099` (arkada `127.0.0.1:3099` loopback'e bağlı) olarak ayarlanarak `window.location.hostname === 'localhost'` koşulu sağlandı ve API isteklerinin `http://localhost:4000/api/v1` üzerinden bellek içi mock katmanına ulaşması sağlandı.
    - **Deterministik Bekleme ve Doğrulanan Assertion'lar:**
      - **Senaryo 1 (Normal Profil Güncelleme):**
        - Form alanına `'Synthetic User Renamed'` girildi ve submit tıklandı.
        - PATCH yanıtı `page.waitForResponse(...)` ile deterministik olarak beklendi (HTTP 200).
        - Loglanan PATCH gövdesi: `{"fullName":"Synthetic User Renamed","phone":"+905550000000","companyName":"Synthetic Mimarlik A.S.","jobTitle":"Mimar","industry":"Architecture"}`. Betik `fullName` değerini tam eşleştirir; diğer profil alanlarının değerleri ayrı ayrı eşleştirilmemiştir.
        - Parola alanlarının (`currentPassword`, `newPassword`) gövdede yer almadığı assert edildi.
        - PATCH Çağrı Sayısı: `1` (tam olarak 1 çağrı assert edildi).
        - Logout Çağrı Sayısı: `0` (oturum kapatma çağrılmadı, `logoutCount === 0` assert edildi).
        - URL Doğrulaması: Tarayıcının `/tr/profile` üzerinde kalmaya devam ettiği doğrulandı (PASS).
      - **Senaryo 2 (Parola Değişimi - Türkçe):**
        - Mevcut ve yeni parolalar girildi (`OldSecurePass123!`, `NewSecurePass123!`).
        - PATCH ve Logout yanıtları `page.waitForResponse(...)` ile deterministik olarak beklendi (her ikisi de HTTP 200).
        - Loglanan PATCH gövdesi: `{"fullName":"Synthetic User","phone":"+905550000000","companyName":"Synthetic Mimarlik A.S.","jobTitle":"Mimar","industry":"Architecture","currentPassword":"OldSecurePass123!","newPassword":"NewSecurePass123!"}`. Betik mevcut/yeni parola değerlerini ve çağrı sayısını assert eder; diğer profil alanları tek tek eşleştirilmemiştir.
        - PATCH Çağrı Sayısı: `1`.
        - Logout Çağrı Sayısı: `1` (tam olarak 1 logout çağrısı assert edildi).
        - URL Doğrulaması: Tarayıcının `/tr/login` sayfasına yönlendiği `page.waitForURL('**/tr/login')` ile doğrulandı (PASS).
      - **Senaryo 3 (Parola Değişimi - İngilizce):**
        - İngilizce profil sayfası (`/en/profile`) yüklendi ve parola alanları dolduruldu.
        - PATCH ve Logout yanıtları `page.waitForResponse(...)` ile deterministik olarak beklendi (her ikisi de HTTP 200).
        - Loglanan EN PATCH gövdesi: `{"fullName":"Synthetic User","phone":"+905550000000","companyName":"Synthetic Mimarlik A.S.","jobTitle":"Mimar","industry":"Architecture","currentPassword":"OldSecurePass123!","newPassword":"NewSecurePass123!"}`. Betik mevcut/yeni parola değerlerini ve çağrı sayısını assert eder; diğer profil alanları tek tek eşleştirilmemiştir.
        - EN PATCH Çağrı Sayısı: `1`.
        - EN Logout Çağrı Sayısı: `1` (tam olarak 1 logout çağrısı assert edildi).
        - URL Doğrulaması: Tarayıcının `/en/login` sayfasına yönlendiği `page.waitForURL('**/en/login')` ile doğrulandı (PASS).
      - **İddia Düzeltmesi:** Ölçülmemiş olan "çift yönlendirme olmaksızın / tek adımda" ifadesi belgeden çıkarılmış, yalnızca ulaşılan nihai URL'ler ve çağrı adetleri assert edilmiştir.
- **Kapsam Dışı:** Depo genelindeki 240 test dosyasının veya ağır E2E paketinin topluca çalıştırılması; bağımlılık yükseltme; ara yayın veya deploy yapmak.
- **Bağımsız İnceleme:** Reviewer REL-01 kabulünü verdi. Betikte üç hedefli profil akışı gerçek submit, PATCH payload/çağrı adedi, logout ve nihai URL assertion’ları ile denetleniyor. API’ler mock’tur; engellenen RSC/asset/yardımcı API isteklerinin konsol hatası ve fallback ürettiği, bu akışların kapsam dışı kaldığı açıkça kayıtlıdır.
- **Bağımlılık:** SEC-01'den SEC-05'e kadar tüm Paket A maddelerinin tamamlanmış olması.
- **Kabul Ölçütü:** Backend ve frontend typecheck ve build 0 hata ile tamamlanmalı; 4 odaklı test dosyası %100 yeşil geçmeli; profil sayfası gerçek tarayıcıda doğrulanmalıdır.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı (Kesinleşen):** Kullanıcının kesin kararı doğrultusunda Paket A sonrası ara yayın önerisi kaldırılmıştır. Tüm işler (Paket A ve B) bitip bağımsız olarak incelenene kadar yayın gündeme alınmayacaktır; yalnızca yerel derleme/test doğrulaması ve yerel checkpoint commit'i işletilir.

### REL-02: Erişilebilir High Bağımlılık Denetimi ve Quality Gate CI/E2E Analizi
- **Durum:** `COMPLETED` (30 Eylül 2026; yerel dependency/CI düzeltmeleri, hedefli testler, taze boş DB migration+seed smoke ve bağımsız inceleme geçti. Hosted GitHub E2E koşusu iddia edilmiyor.)
- **Rapor ID / Kanıt:** Handoff Bölüm 5 (P1); Röntgen Bölüm 15.
- **Dosya / Modül:** `package.json`, `pnpm-lock.yaml`, CI workflow dosyaları.
- **Uygulanan Dar Değişiklikler:**
  - 7 High bağımlılık bulgusu için risk/erişilebilirlik matrisi korundu. MJML runtime patch'i ile kullanılmayan `mjml-cli`/`html-minifier` dependency kenarları kaldırıldı; minifier açılırsa işlem güvenli biçimde fail-closed kalır. `pnpm why --prod html-minifier` ve `pnpm why --prod mjml-cli` üretim grafiğinde yol göstermedi.
  - `picomatch`, OpenTelemetry, `linkify-it` ve Tiptap bulgularının erişilebilirlik/koşulları ayrı ele alındı; güvenli, hedefli override/patch değişiklikleri ve güncel audit doğrulaması yapıldı. Yeni `brace-expansion` High advisories için etkilenen major aralıkları 2.1.6 ve 5.0.11 tabanlarına alındı. Audit bastırılmadı.
  - E2E CI job'ına kendi health-checked Postgres/Redis servisleri, yalnız sentetik ve job başına üretilen sırlar, migration ve seed adımları eklendi. Seed doğrudan backend `tsx` bağımlılığını kullanır ve kullanıcı/izin fixture'larını doğrular.
  - Seed aracı varsayılan olarak kapalıdır; açık `E2E_SEED_ALLOWED=true`, `NODE_ENV !== production`, PostgreSQL URL'i, loopback IP host'u ve `_e2e` veritabanı adı ister. Bunları güvenceleyen hedefli testler eklendi; kullanıcı verisine veya preview DB'lerine yönelme engellenir.
- **Kapsam Dışı:** Kullanıcının kirli WIP dosyalarını onay almadan ezmek veya stage etmek; geniş sürüm yükseltmeleri; CI kapılarını bastırmak (`suppress`).
- **Bağımlılık:** Yok; kullanıcı REL-02 dahil kalan işleri sırayla bu ajana devretti. `apps/frontend/next-env.d.ts` dışındaki kapsam bu görev için düzenlenmiştir; `next-env.d.ts` kullanıcı WIP'i korunur ve bu görevin staging kapsamına girmez.
- **Kabul Ölçütü:** 7 High güvenlik bulgusu için risk/erişilebilirlik matrisi ve CI E2E timeout kök nedeni belgeli; seçili dependency düzeltmeleri/regression testleri ile izole runtime seed smoke geçmiştir. GitHub-hosted E2E başarısı push yapılmadığı için bu yerel görevin kanıtı değildir ve iddia edilmez.
- **Dar Doğrulama:** Sabit pnpm 9.15.4 ile `audit --prod --audit-level high` (High sayısının sıfır olması; diğer seviyeler rapor edilir), dependency regresyon testleri, CI/E2E contract testleri, frozen install, backend typecheck ve ayrılmış DB seed smoke.
- **Veri / Migration Etkisi:** Sıfır.
- **Açık Kullanıcı Kararı:** Yok. Kullanıcı yerel düzeltmeleri yürütme yetkisi verdi; remote push/tag/deploy hâlâ ayrı açık onay gerektirir.
- **Başlangıç Salt-okunur Audit Kanıtı (29 Eylül, stabilizasyon HEAD'i `b31c3ee3`):** `pnpm audit --prod --json` sonucu 1.530 üretim bağımlılığı / 34 advisory: 7 High, 20 Moderate, 7 Low. CI'nin 28 Eylül koşusunda audit job'ı yüksek bulgular yüzünden başarısızdı. Bu başlangıç sayıları yaşayan registry advisories'ine bağlıdır.
- **High Risk / Erişilebilirlik Matrisi:**
  | Bulgu | Kilitli sürüm ve yol | Erişilebilirlik değerlendirmesi |
  |---|---|---|
  | `html-minifier` / CVE-2022-37620 (`GHSA-pfq8-rq6v-vf5m`) | `4.0.0`, 58 çözüm yolu; `mjml` -> backend e-posta şablonu derleme | Üretim backend'inde MJML derleme kodu var; ham MJML içerik e-posta/duyuru yollarında kullanılabiliyor. Etki admin tarafından yazılan/sağlanan içerik üzerinden koşullu; anonim talep içeriğinin aynı minifier'a ulaştığı kanıtlanmadı. Audit'te düzeltilmiş upstream aralığı yok. “Ulaşılamaz” kabul edilmedi; MJML/minifier için uyumlu, bakımı sürdürülen düzeltme yolu ayrıca incelenmeli. |
  | `picomatch` / CVE-2026-33671 (`GHSA-c2c7-rcm5-vvqj`) | `4.0.3`, Sentry `@rollup/plugin-commonjs` yolundan | Üretim lock graph'ında bulunuyor; repo kullanımında bu alt yol build eklentisi altında. İstek-zamanı (request-time) kullanımına dair kanıt bulunmadı; build girdisi güven sınırı yine korunmalı. Kaynak checkout WIP'i `4.0.7` override'ı içeriyor ve audit'te bu bulgu görünmedi. |
  | OpenTelemetry / CVE-2026-44902 (`GHSA-q7rr-3cgh-j5r3`) | `auto-instrumentations-node@0.71.0` ve `sdk-node@0.213.0`; düzeltmeler sırasıyla `0.75.0` ve `0.217.0` | `src/otel.ts` NodeSDK'yi backend açılışında başlatıyor; ancak advisory yalnız OTel Prometheus exporter kullanıldığında uygulanıyor. Kodun `/metrics` yolu `@willsoto/nestjs-prometheus`'tan ayrı bir exporter; bu, OTel exporter'ın etkin/etkin olmadığını ispatlamaz. Repo dışı çalışma ortamı değişkenleri okunmadı; konfigürasyon teyidine kadar koşullu DoS riski açık tutulmalı. |
  | `linkify-it` / CVE-2026-48801 (`GHSA-22p9-wv53-3rq4`) ve CVE-2026-59887 (`GHSA-v245-v573-v5vm`) | `5.0.0`, 45 çözüm yolu; Tiptap/prosemirror-markdown | Frontend üretim grafiğinde ve Tiptap zengin metin editörü zincirinde. Repo editörleri içerik editörü/yetkili akışlarında kullanılıyor; herkese açık bir API'de doğrudan `linkify-it` girdisi kanıtlanmadı. WIP `5.0.2` override'ı iki advisory aralığını da kapsıyor; henüz bu dala aktarılmadı. |
  | `@tiptap/core` / GHSA-j95f-988m-3j2f | `3.20.0`, 28 çözüm yolu; patched `>=3.30.5` | Zengin metin editörü frontend grafiğinde; etkilenebilir Markdown ayrıştırması editör içeriğiyle ilişkilidir. Yetkili editör rotaları bulundu; anonim kullanıcıdan bu parser'a giden yol kanıtlanmadı. WIP bunu yükseltmiyor; sürüm uyumluluğu ve editör regressions ayrı odaklı doğrulanmalı. |
- **WIP / Lockfile Güvenliği:** Korunan `aluplan-release-candidate-20260919` değiştirilmedi. Stabilizasyon lockfile'ında XLSX CDN tarball `integrity` değeri başlangıç Git sürümünden doğrulanıp korundu; temiz kurulum frozen modda geçti. Ayrı kullanıcı WIP'i `apps/frontend/next-env.d.ts` değiştirilmedi ve staging kapsamı dışındadır.
- **Quality Gate E2E Kök Neden (başlangıç kanıtı ve uygulanan düzeltme):** Kaynak GitHub CI koşusu `36416406236`, SHA `64d71aeccbffa092482faad550131a17744d364c` (28 Eylül) `End-to-End Tests` işinde `Error: Timed out waiting 300000ms from config.webServer` ile sonlandı. Log, Playwright testlerinin çalıştığına değil webServer hazır olamadığına kanıttı. `playwright.config.ts` backend health URL'sini beklerken ayrı E2E job'ında Postgres/`DATABASE_URL` ve zorunlu secrets yoktu; job'lar arasında servis paylaşılmaz. `auth.setup.ts` ayrıca migrate/seed edilmiş sentetik hesap bekliyordu. Uygulanan yerel CI değişikliği yalnız job'a ait health-checked Postgres/Redis, sentetik job secrets, migration ve guarded seed adımlarını ekledi; bu workflow henüz GitHub'da çalıştırılmadı (push izni yok), dolayısıyla kök neden düzeltmesinin hosted koşu başarısı doğrulanmış değildir.
- **Güncel Yerel Doğrulama (30 Eylül):** Sabit pnpm 9.15.4 `audit --prod --audit-level high` exit 0; rapor 30 bulgu (7 Low, 23 Moderate, 0 High). Bu yaşayan advisory verisinin anlık görüntüsüdür, kalıcı temiz audit garantisi değildir. `test:security:dependencies` 263/263; odaklı dependency/lock/MJML/seed sözleşme testleri 24/24; backend typecheck, pnpm frozen install ve `git diff --check` geçti. Bağımsız son inceleme uygulanabilir bulgu vermedi. Lokal `Playwright --list`/contract testleri GitHub-hosted gerçek E2E koşusu yerine geçmez.
- **İzole Runtime Kanıtı (30 Eylül):** Yeni, boş, loopback'e bağlı ve geçici tmpfs Postgres `pgvector/pgvector:pg17` container'ında 57 Prisma migration ve `NODE_ENV=test E2E_SEED_ALLOWED=true` seed komutu başarıyla geçti; üç sentetik rol (`ADMIN`, `SUPPORT_AGENT`, `CUSTOMER`) üretildi. Geçici container otomatik kaldırıldı; DB verisi RAM'deydi, kalıcı volume oluşturulmadı. Önceki P1000'li ayrılmış container'a/volume'üne dokunulmadı; `aluplan-stab-preview-*` container'ları çalışır durumda ve değiştirilmedi.
- **Kapsam Sınırı:** Local seed proof ve testler bu uygulama düzeltmesini doğrular; GitHub-hosted E2E job'ı çalıştırılmadı, çünkü push yetkisi yok. Yayın/push/deploy kapısı aynen geçerlidir.

---

## Sıra 3: Paket B — Güvenilir Bilgi ve Öğrenme Döngüsü

### RAG-01: Bilgi Bankası Raw SQL Makale Aramasında Silinmeme ve Güncel Sürüm Filtrelemesi
- **Durum:** `COMPLETED` (yerel)
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
- **Uygulama / Doğrulama:** `EmbeddingService.search` ARTICLE dalı soft-deleted makaleleri ve pasif embedding'leri eler; embedding `article_version_id` değeri `knowledge_article_versions` üzerinden makalenin `current_version` sürümüne bağlanır. Makale görünürlük filtreleri anahtar-kelime CTE'sinde de korunur. Odaklı test 23/23 ve backend typecheck geçti; bağımsız kod/güvenlik incelemesinde engelleyici bulgu yok. GitNexus tek-seferlik CLI, yerel macOS `libssl.3.dylib` eksikliği nedeniyle indeks/etki analizi çalıştıramadı; çağrı zinciri elle izlenip incelemede doğrulandı. DB/migration, canlı servis/verisi, push veya deploy yok.

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
- **Durum:** `COMPLETED` (29 Eylül 2026; ürün kodu yerel doğrulandı ve bağımsız incelemeden geçti)
- **Rapor ID / Kanıt:** Handoff Bölüm 4, Bölüm 7 (Sıra 5); Röntgen Bölüm 12 (Satır 311); `apps/frontend/messages/{tr,en,de}.json`.
- **Dosya / Modül:** `apps/frontend/messages/tr.json`, `apps/frontend/messages/en.json`, `apps/frontend/messages/de.json`.
- **Uygulanan Değişiklik:** Yalnızca TR/EN/DE i18n değerleri güncellendi; anahtarlar, API ve backend enum'ları değişmedi. Kullanıcı onaylı AI etiketlerine ek olarak aynı talep detayında görünen `ANN_*`, `AI Ticket Trace`, `Ticket Flag`, `STATUS_CODE`, `OPEN_DATE`, `ASSIGNED_EXPERT`, `SECURITY_WARNING`, `STARTED_BY` ve `TS` gibi ham teknik kopyalar doğal dile çevrildi. İç teknik `Provider`/`Model` gibi terimler ve tanılama anlamı korunmuştur.
  - Onaylı karşılıklar:
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
- **Doğrulama:** `pnpm --dir apps/frontend run i18n:check` üç locale için geçti; üç JSON parse edildi; `git diff --check` geçti; eski ham anahtar etiketleri `rg` ile tarandı ve bulunmadı. Yerel Next render'ında talep detayı ve yeni talep ekranı TR/EN/DE görüntülendi; API yanıtları yalnız sentetik Playwright fixture'larıydı, DB/müşteri verisi ve AI üretimi kullanılmadı. Görsel kanıtlar `/tmp/aluplan-ux01-{tr,en,de}.png` ve `/tmp/aluplan-ux01-new-{tr,en,de}.png` altında. Bağımsız metin incelemesi bloklayıcı bulgu vermedi.
- **Dış Etki / Sınır:** Gerçek servis, müşteri verisi, bilet gönderimi, e-posta, push veya deploy kullanılmadı. `apps/frontend/next-env.d.ts` içindeki yerel değişiklik kullanıcı WIP'i olarak korunur ve bu görevin commit'ine alınmaz.
- **Kalan Kullanıcı Kararı:** Yok; terimler kullanıcı tarafından onaylandı. UX-01 ve REL-02 tamamlandı; sıradaki planlı görev RAG-01'dir.

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
