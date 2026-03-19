## 1. Uygulama Nedir? (Genel Bakış)
**Aluplan AI Support Desk**, Aluplan müşterilerinin taleplerini (Ticket) yönettiği, Dynamics 365 CRM ile entegre çalışan ve OpenAI destekli akıllı "Çözüm Bulma" asistanına sahip, modern mimarili bir Yardım Masası yazılımıdır. 

Sistem temel olarak 5 ana modül üzerinden çalışır. Yeni bir geliştirici proje kodunda gezinirken aşağıdaki kavramları ve iş akışlarını bilmelidir:

---

## 2. Ana Modüller ve Fonksiyonel İşleyiş Detayları

### 2.1. Kimlik Doğrulama ve Rol Yönetimi (Auth & RBAC)
*   **Fonksiyon Mimarisi:** Sistemde `User` modeli temel kimlik tutucudur. Roller (`Role` enum): `ADMIN`, `AGENT` ve `CUSTOMER` olarak ayrılır.
*   **İşleyiş:** 
    *   Kullanıcı sisteme girdiğinde NextAuth / JWT veya özel JWT tabanlı NestJS Guard'larından geçer (`JwtAuthGuard`, `RolesGuard`).
    *   **Customer:** Sadece kendi oluşturduğu veya CRM üzerinden kendisine atanmış (Account bazlı) biletleri görebilir.
    *   **Agent/Admin:** Tüm biletleri görebilir, durumlarını değiştirebilir ve departmanlara atayabilir.
    *   **Takımlar (Teams):** Agent'lar spesifik "Takımlara" eklenebilir. Yeni ekip üyesi ekleme işlemi (Örn: `users.service.ts -> create`), eğer kişi sistemde sadece `CUSTOMER` olarak kayıtlıysa onu otomatik olarak `AGENT` rolüne yükseltir ("Upgrade" algoritması).

### 2.2. CRM Senkronizasyon Modülü (Dynamics 365)
En karmaşık iş akışlarından biridir. Müşterilerin ve şirketlerin (Accounts & Contacts) Dynamics 365 üzerinden kendi sistemimize kopyalanması işlemidir.
*   **Bağlantı Kurulumu (`crm.service.ts`):** Dynamics 365 Tenant ID, Client ID ve Secret bilgileri maskelenerek veritabanında saklanır. Kayıt güncellenirken (Upsert) şifre UI'dan `"********"` gelse bile, arkaplanda asıl şifre veritabanından çekilerek bağlantı korunur (`upsertConnection`).
*   **Senkronizasyon Kuyruğu (BullMQ):** "Senkronize Et" butonuna basıldığında işlem API'yi dondurmaz. `this.crmQueue.add('execute-sync')` fonksiyonu ile kuyruğa atılır.
*   **Senkronizasyon İşleyişi (`dynamics365.adapter.ts`):**
    1.  **Hesaplar (CrmAccount):** Tüm şirketler çekilir ve Prisma `upsert` (varsa güncelle, yoksa yarat) ile kaydedilir.
    2.  **Kişiler (CustomerProfile & User):** CRM Contacts çekilir. Her bir Contact için veritabanında önce ana `User` oluşturulur, ardından `CustomerProfile` tablosuna CRM verileriyle (İsim, Şirket ID'si, Telefon, Departman vb.) yazılır.
    3.  **Hata Koruması:** `customerNo` eşsiz (unique) kalabilmesi için `DYN-C-{contactId}` mantığıyla oluşturulur. Prisma'nın çok katı olduğu `user` ilişkilerinde (relation), mutlak suretle `{ connect: { id: user.id } }` objesi kullanılır. Senkronizasyon transaction izolasyonuna sahiptir; bir müşterinin e-postası bozuksa sadece o müşteri atlanır (skip), tüm süreç iptal olmaz.

### 2.3. Bilet ve Talep Yönetimi (Tickets)
*   **Fonksiyon Mimarisi:** Müşterilerin ve Agent'ların iletişim kurduğu çekirdek yapıdır.
*   **Oluşturma (`tickets.controller.ts` & `tickets.service.ts`):** Bir "Ticket" oluşturulurken Müşteri sisteme bir "Konu" ve "Açıklama" girer. 
*   **Sohbet Akışı (Messages & Attachments):** Ticket altında `TicketMessage` logları tutulur. Kullanıcıdan ve Agent'tan gelen mesajlar aynı tabloya, `isInternal` bayrağı boolean olarak farklılaştırılarak kaydedilir (Customer `isInternal=true` mesajlarını göremez, Agent'lar kendi arasında notlaşabilir). Müşterinin eklediği dosyalar AWS S3 / Local depolamaya "Attachments" olarak `upload` edilir. 
*   **Aşama ve Departman:** `status` (OPEN, OPEN_ANSWERED, IN_PROGRESS vb.) ve `department` enumları ile filtreleme ve atama kararları verilir.

### 2.4. Yapay Zeka / Akıllı Teşhis (AI Assistant & RAG)
Müşteri yeni bilet açarken problemini anlattığında (örneğin "Lisans hatası alıyorum"), bilet oluşturulmadan önce sistem "Otomatik Çözüm" bulmaya çalışır.
*   **Workflow (`AiQueryService`):**
    1.  Kullanıcı konuyu yazdığında `api.ai.query` tetiklenir ("Çözüm Ara" butonu).
    2.  Sistem önce vektör veritabanındaki (Vector DB - RAG) dokümanlara (Hotinfo, FAQ, PDF'ler) bakar ve problemin daha önceden cevabı var mı diye araştırır.
    3.  Bulduğu parçaları alıp OpenAI GPT modeline (Örn: `gpt-4o`) gönderir ve kullanıcıya formatlı bir yanıt döndürür.
*   **Resilience (Direnç Mekanizması):** OpenAI servisi gecikirse `Promise.race` mantığı ile 15 saniyelik bir Timeout sayacı devreye girer. API 15 saniyede cevap vermezse arayüz kitlenmez, müşteriye "Yapay Zeka Timeout" toast mesajı sunulup bilet ekranına manuel devam etmesine izin verilir (`apps/frontend/src/app/[locale]/(dashboard)/tickets/new/page.tsx -> runDiagnosis`).

---

## 3. Teknoloji Yığını (Tech Stack) & Mimari
Proje bir **Monorepo** mimarisine sahiptir ve iki ana uygulamadan (apps) oluşur:

### Backend (`apps/backend`)
- **Framework:** NestJS (Modüler, Dependency Injection tabanlı TypeScript API frameworkü).
- **Veritabanı ORM:** Prisma ORM.
- **Veritabanı:** PostgreSQL (Relational Database).
- **Kuyruk / Arka Plan İşlemleri:** BullMQ / Redis.

### Frontend (`apps/frontend`)
- **Framework:** Next.js (App Router). 
- **Stil & UI:** Tailwind CSS, shadcn/ui.
- **Veri Senkronizasyonu:** Component bazlı React Hooks ve sunucu yönlendirmeli (SSR/CSR) sayfa yapıları.

---

## 4. Kritik Sistemler ve "Fail-Safe" (Hata Korumalı) Mekanizmaları
Uygulama yayına (Production) alınırken birçok kilitlenme vakası yaşanmış ve bu sorunlar çok katmanlı savunma mekanizmalarıyla "kurşun geçirmez" (resilient) hale getirilmiştir. 

### 4.1. CI/CD Kalite Kapısı (GitHub Actions)
Bir hata yapıldığında, Coolify (sunucu kontrol panelimiz) bu hatayı görmezden gelip üretim sunucusunu çökertmesin diye GitHub seviyesinde bir duvar bulunmaktadır.
**Nasıl Çalışır?**
`main` branch'ine her kod pushlandığında `.github/workflows/ci.yml` çalışır:
1. Prisma şeması doğrulanır (`npx prisma validate`).
2. Backend build edilir (Eğer Prisma tiplerinde `undefined` vs `null` hatası varsa burada süreç durur).
3. Frontend build edilir (Eğer React elementleri yanlış yerde kullanıldıysa süreç burada durur).

> 💡 **Kural:** Local'de geliştirmeyi bitirdikten sonra komut satırına `git push` yazdığınızda her şey canlıya çıkmaz! GitHub sekmesinde "Actions" kısmının yeşil (`✓`) olduğundan emin olun.

---

## 5. Deployment (Yayınlama) Süreci Nasıl İşler?
Uygulamanın deployment orkestrasyonu **Coolify** üzerinden yapılır. Projede iki adet izole servis vardır: 
- `aluplan-ai-support-frontend` 
- `aluplan-ai-support-backend`

### İşleyiş Adımları:
1. Geliştirici kodu yazar ve bir `git push` ile `main` branch'ine yollar.
2. GitHub Actions CI/CD pipeline'ı tetiklenir ve testlerden geçirilir.
3. Geliştirici veya Sunucu Yöneticisi, Coolify Dashboard'ına girer.
4. **Güncelleme Gereken Servisler:**
   - Sadece arayüzde bir renk değiştirdiyseniz `aluplan-ai-support-frontend` projesine tıklayıp **Redeploy** butonuna basarsınız.
   - Eğer Prisma (veritabanı şeması) veya CRM senkronizasyonu mantığını (algoritmayı) güncellediyseniz `aluplan-ai-support-backend` projesine tıklayıp **Redeploy** butonuna basarsınız.
5. Coolify kodu GitHub'dan en güncel haliyle çeker, kendi Docker container'ında build eder ve "Zero-Downtime" mantığına benzer bir yöntemle yayına alır. Ortada hata çıkarsa (`Crash`) Coolify otomatik olarak eski sağlam versiyonu açık tutar.

---

## 6. Yeni Geliştiriciler İçin "Yapılmaması Gerekenler" (Gotchas!)
* **CustomerProfile Relation Hatası:** Prisma üzerinden `CustomerProfile` oluştururken (upsert vs.) `userId: user.id` şeklinde "scalar" değer göndermeyip daima `user: { connect: { id: user.id } }` konseptini kullanmalısınız. Prisma 5+ çok daha katı bir Object Binding prensibine sahiptir.
* **Gizli Veriler (Secrets):** CRM verilerini UI alanında kaydederken şifreler "********" olarak maskelenir. "Kaydet" yaparken Backend bu maskeli veriyi görüp, orjinalini veritabanından alarak işlemine devam etmelidir. Servisin üzerine yazarsanız bağlantılar kopar! (Bkz: `crm.service.ts -> upsertConnection`)

**Ekibe hoşgeldiniz, iyi kodlamalar! 🚀**
