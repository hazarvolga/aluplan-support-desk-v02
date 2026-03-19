# Aluplan AI Support Desk - Geliştirici Rehberi & Mimari Dokümantasyon

Hoş geldiniz! Bu rehber, projeye yeni katılan geliştiricilerin (veya projeye bir süre ara verdikten sonra geri dönen ekibin) sistemin nasıl çalıştığını, hangi zorlukların nasıl aşıldığını ve canlıya çıkış (deployment) sürecinin nasıl işlediğini hızlıca anlaması için hazırlanmıştır.

## 1. Uygulama Nedir? (Genel Bakış)
**Aluplan AI Support Desk**, Aluplan müşterilerinin taleplerini (Ticket) yönettiği, Dynamics 365 CRM ile entegre çalışan ve OpenAI destekli akıllı "Çözüm Bulma" asistanına sahip, modern mimarili bir Yardım Masası yazılımıdır. 

### Temel Özellikleri:
- **Rol Tabanlı Yönetim (RBAC):** Admin, Agent ve Customer (Müşteri) rolleri.
- **CRM Senkronizasyonu (Dynamics 365):** Müşteri firmasındaki (Account) ve ilgili kişilerin (Contact) bilgileri arka planda (Background Job) otomatik veya tetiklemeli olarak sisteme kaydedilir.
- **Akıllı Teşhis (AI Assistant):** Müşteriler bilet açarken sorunlarını yazdıklarında, yapay zeka (RAG mimarisi) destekli asistan devreye girerek çözüm önerileri sunar.

---

## 2. Teknoloji Yığını (Tech Stack) & Mimari
Proje bir **Monorepo** mimarisine sahiptir ve iki ana uygulamadan (apps) oluşur:

### Backend (`apps/backend`)
- **Framework:** NestJS (Modüler, Dependency Injection tabanlı TypeScript API frameworkü).
- **Veritabanı ORM:** Prisma ORM.
- **Veritabanı:** PostgreSQL (Relational Database).
- **Kuyruk / Arka Plan İşlemleri:** BullMQ / Redis (Özellikle CRM senkronizasyonu gibi ağır işlemler API'yi bloklamamak için arka plana atılır).

### Frontend (`apps/frontend`)
- **Framework:** Next.js (App Router). 
- **Stil & UI:** Tailwind CSS, shadcn/ui.
- **Veri Senkronizasyonu:** Component bazlı React Hooks ve sunucu yönlendirmeli (SSR/CSR) sayfa yapıları.

---

## 3. Kritik Sistemler ve "Fail-Safe" (Hata Korumalı) Mekanizmaları
Uygulama yayına (Production) alınırken birçok kilitlenme vakası yaşanmış ve bu sorunlar çok katmanlı savunma mekanizmalarıyla "kurşun geçirmez" (resilient) hale getirilmiştir. Kod yazarken bu kalıpları bilmek çok önemlidir.

### 3.1. CI/CD Kalite Kapısı (GitHub Actions)
Bir hata yapıldığında, Coolify (sunucu kontrol panelimiz) bu hatayı görmezden gelip üretim sunucusunu çökertmesin diye GitHub seviyesinde bir duvar bulunmaktadır.
**Nasıl Çalışır?**
`main` branch'ine her kod pushlandığında `.github/workflows/ci.yml` çalışır:
1. Prisma şeması doğrulanır (`npx prisma validate`).
2. Backend build edilir (Eğer Prisma tiplerinde `undefined` vs `null` hatası varsa burada süreç durur).
3. Frontend build edilir (Eğer React elementleri yanlış yerde kullanıldıysa süreç burada durur).

> 💡 **Kural:** Local'de geliştirmeyi bitirdikten sonra komut satırına `git push` yazdığınızda her şey canlıya çıkmaz! GitHub sekmesinde "Actions" kısmının yeşil (`✓`) olduğundan emin olun.

### 3.2. Veritabanı ve CRM Senkronizasyon İzolasyonu
Yüzlerce müşteriyi CRM'den içeri aktarırken (Sync) tek bir müşterinin eksik e-postası veya bozuk referansı **tüm** listeyi çökertebilir. 
- **Çözüm:** CRM entegratöründe (`dynamics365.adapter.ts`), her bir müşteri senkronizasyonu özel bir Prisma Transaction'ı (`$transaction`) içinde ve Try/Catch bloğuyla sarılmıştır.
- **Sonuç:** Bir müşteri aktarılmasa bile kaydedilmez ama geri kalan 99'u başarıyla aktarılır. Başarısız olan kayıtlar, UI'da CRM geçmişindeki "Detaylar" sekmesinden (Log payload ile birlikte) rahatlıkla izlenebilir.

### 3.3. Arayüzde Hata Sınırları (Error Boundaries & Timeouts)
Yapay Zeka "Çözüm Ara" butonuna basıldığında arka planda OpenAI'a gidilir. Kullanıcı OpenAI'ın yanıt vermesini sonsuza kadar beklememelidir.
- **Çözüm (`Promise.race` Timeout):** Frontend üzerinde 15 saniyelik bir kısıt bulunuyor. API 15 saniye içerisinde yanıt dönmezse, sistem sessizce kilitlenmek yerine "Timeout" hatası fırlatır ve kullanıcının işlemlerine pürüzsüz devam etmesine izin verir.

---

## 4. Deployment (Yayınlama) Süreci Nasıl İşler?
Uygulamanın deployment orkestrasyonu **Coolify** üzerinden yapılır. Projede iki adet izole servis vardır: 
- `aluplan-ai-support-frontend` 
- `aluplan-ai-support-backend`

### İşleyiş Adımları:
1. Geliştirici kodu yazar ve bir `git push` ile `main` branch'ine yollar.
2. (Opsiyonel) GitHub Actions CI/CD pipeline'ı tetiklenir ve testlerden geçirilir.
3. Geliştirici veya Sunucu Yöneticisi, Coolify Dashboard'ına girer.
4. **Güncelleme Gereken Servisler:**
   - Sadece arayüzde bir renk değiştirdiyseniz `aluplan-ai-support-frontend` projesine tıklayıp **Redeploy** butonuna basarsınız.
   - Eğer Prisma (veritabanı şeması) veya CRM senkronizasyonu mantığını (algoritmayı) güncellediyseniz `aluplan-ai-support-backend` projesine tıklayıp **Redeploy** butonuna basarsınız.
5. Coolify kodu GitHub'dan en güncel haliyle çeker, kendi Docker container'ında build eder ve "Zero-Downtime" mantığına benzer bir yöntemle yayına alır. Ortada hata çıkarsa (`Crash`) Coolify otomatik olarak eski sağlam versiyonu açık tutar.

---

## 5. Yeni Geliştiriciler İçin "Yapılmaması Gerekenler" (Gotchas!)
* **CustomerProfile Relation Hatası:** Prisma üzerinden `ustomerProfile` oluştururken (upsert vs.) `userId: user.id` şeklinde "scalar" değer göndermeyip daima `user: { connect: { id: user.id } }` konseptini kullanmalısınız. Prisma 5+ çok daha katı bir Object Binding prensibine sahiptir.
* **Gizli Veriler (Secrets):** CRM verilerini UI alanında kaydederken şifreler "********" olarak maskelenir. "Kaydet" yaparken Backend bu maskeli veriyi görüp, orjinalini veritabanından alarak işlemine devam etmelidir. Servisin üzerine yazarsanız bağlantılar kopar! (Bkz: `crm.service.ts -> upsertConnection`)

**Ekibe hoşgeldiniz, iyi kodlamalar! 🚀**
