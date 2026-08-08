# CLAUDE Frontend Önerileri — Public Landing Page için "Sistem Gereksinimleri" Benzeri Dinamik Yapı

**Tarih:** 2026-08-08
**Hazırlayan:** Claude
**Konu:** `/tr/login` sayfasındaki admin-editable accordion yapısının analizi ve bu yapının `http://localhost:3000/` (public landing page) için nasıl kurgulanabileceğine dair öneriler.
**Durum:** Sadece analiz + öneri. Hiçbir kod değişikliği yapılmadı. Kullanıcı aynı analizi Codex'ten de istedi; iki raporu karşılaştırıp karar verecek.

---

## 1. Görev tanımı

Kullanıcı `/tr/login` sayfasında, giriş yapılmadan görünen ve `/tr/admin/settings` → "Sistem Gereksinimleri" sekmesinden admin tarafından beslenen accordion yapısını (ALLPLAN 2026 / FRILO 2026 / SCIA Engineer 2026 / Sanal Ortamlar / Servisler) analiz etmemi istedi. Amaç: bu yapıya benzer, admin tarafından yönetilebilir bir yapıyı doğrudan public ana sayfa (`http://localhost:3000/`) için de kurgulayabilir miyiz?

**Kullanıcının önceden belirttiği kısıt:** Yeni yapı `/admin/settings` altına eklenmeyecek — o sayfa zaten çok kalabalık. Başka uygun bir yere konumlandırılmalı.

---

## 2. Mevcut yapının analizi (`/tr/login`)

Üç katmanlı, tamamen jenerik bir "Setting key-value → public GET endpoint → client accordion → admin CRUD formu" deseni. Yeni bir Prisma modeli / migration kullanılmamış; mevcut genel amaçlı `Setting` tablosu üzerinden çözülmüş.

### 2.1 Depolama

- Ayrı bir Prisma modeli yok. Genel amaçlı key-value tablosu: `Setting` (`packages/database/prisma/schema.prisma:367`).
  ```prisma
  model Setting {
    id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    key       String   @unique @db.VarChar(100)
    value     String
    isSecret  Boolean  @default(false)
    updatedBy String?
    updatedAt DateTime @updatedAt
  }
  ```
- Tek key: `SYSTEM_REQUIREMENTS`. Değeri, üç dilin hepsini içeren tek bir JSON string:
  ```ts
  type LocalizedRequirements = Record<'tr' | 'en' | 'de', Requirement[]>;
  interface Requirement { title: string; sections: Section[]; }
  interface Section { name: string; items: string[]; } // items içinde **bold** markdown destekleniyor
  ```

### 2.2 Okuma (herkese açık, kimlik doğrulama gerektirmiyor)

- `GET /api/v1/auth/system-requirements?locale=xx` — [`apps/backend/src/auth/auth.controller.ts:189`](apps/backend/src/auth/auth.controller.ts#L189), `@Public()` dekoratörlü, guard yok.
- [`AuthService.getSystemRequirements()`](apps/backend/src/auth/auth.service.ts#L648) — `SettingsService.getValue('SYSTEM_REQUIREMENTS')` ile ham JSON'ı çeker, `JSON.parse` eder, istenen locale dilimini döner; yoksa `en`'e düşer; parse hatasında boş dizi döner (fail-soft).

### 2.3 Render (client)

- [`RequirementAccordion`](apps/frontend/src/components/auth/requirement-accordion.tsx) — client component.
  - `useEffect` içinde mount'ta **ham `fetch()`** ile veriyi çekiyor (projenin geri kalanında kullanılan paylaşılan `api` client wrapper'ı değil — küçük bir tutarsızlık, notlarda tekrar geçiyor).
  - Başlıktaki anahtar kelimeye göre ikon seçen basit bir `getIcon()` heuristiği var ("allplan" → Monitor, "frilo"/"scia" → Cpu, "sanal" → ShieldCheck, "servis"/"exchange" → Globe).
  - `items` içindeki `**bold**` işaretlerini regex ile ayrıştırıp `<strong>` render eden minik bir markdown-lite parser var.
  - Framer Motion ile açılır/kapanır (accordion) kartlar; ilk kart varsayılan olarak açık.
- `/tr/login` sayfasında bu bileşen, üstünde statik `{t('broadcast_title')}` başlığıyla ("SİSTEM_YAYINI // GÜNCEL_BİLDİRİMLER") kullanılıyor — [`apps/frontend/src/app/[locale]/login/page.tsx:96-101`](apps/frontend/src/app/[locale]/login/page.tsx#L96).

  **Önemli netleştirme:** Bu başlık yanıltıcı. Bu bir duyuru/broadcast akışı **değil** — sadece accordion'un üstünde duran statik metin. Projede bugün üzerinde çalıştığımız gerçek `Announcement`/e-posta duyuru sistemi (AnnouncementLog, broadcast email, vs.) ile **hiçbir bağlantısı yok**. İki ayrı mekanizma; sadece kelime seçimi ("duyuru/yayın") benzer görünüyor ve kafa karıştırabilir.

### 2.4 Yazma (admin, korumalı)

- [`SystemRequirementsForm`](apps/frontend/src/components/admin/settings/SystemRequirementsForm.tsx) — `/admin/settings` sayfasının **"requirements" adlı sekmesinde** gömülü ([`apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx:1973`](apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx#L1973)).
- Dil bazlı sekmeler (tr/en/de), her dil için ürün → bölüm → madde seviyesinde tam CRUD (ekle/sil/düzenle).
- Kaydetme: generic `api.settings.upsert({ key: 'SYSTEM_REQUIREMENTS', value: JSON.stringify(data), isSecret: false })` — backend tarafında bu JSON içeriği için **herhangi bir şema doğrulaması yok**; admin ne yazarsa opak string olarak saklanıyor.

---

## 3. `/admin/settings` sayfasının durumu — kullanıcının "çok kalabalık" tespiti doğrulandı

- Dosya: [`apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx`](apps/frontend/src/app/[locale]/(dashboard)/admin/settings/page.tsx) — **2076 satır**.
- Proje kuralı (`CLAUDE.md` / coding-style): dosyalar 800 satırı geçmemeli. Bu dosya sınırın **~2.5 katı**.
- 8 sekme içeriyor: `general`, `ai`, `email`, `whatsapp`, `sla`, `branding`, `requirements`, `storage`.
- **Sonuç:** Yeni bir sekme daha eklemek hem bu kuralı hem de kullanıcı deneyimini kötüleştirir. Kullanıcının "başka uygun bir yere" talebi teknik olarak da haklı.

---

## 4. Hedef: `http://localhost:3000/` (public landing page — `LandingHub`)

- Bileşen: [`apps/frontend/src/components/landing-hub.tsx`](apps/frontend/src/components/landing-hub.tsx) — 422 satır, tamamen **statik/hardcoded** bir pazarlama sayfası.
- Bölümler: Hero, 2 adet sabit eğitim kartı (YouTube demo + kampüs lisansı), 3 adet sabit-kodlu FAQ maddesi (`faq.item1-3`), 2 adet sabit-kodlu entegrasyon kartı (OSKA, plugin), stats (3 sayaç), social-proof (6 sembol logo), footer.
- Bu sayfada, login sayfasındaki gibi admin tarafından beslenen **hiçbir dinamik veri kaynağı yok**. Ürün×bölüm×madde tipi bir accordion da şu an burada mevcut değil — login sayfasındakiyle bire bir eşleşen bir alan yok, en yakın adaylar "FAQ" ve "entegrasyon kartları" bölümleri.

---

## 5. Admin sidebar'daki mevcut desen

`apps/frontend/src/components/sidebar.tsx:44-52` — `/admin/*` altında zaten birbirinden bağımsız, kardeş seviyede sayfalar var:

```
/admin/announcements
/admin/emails
/admin/ai-intelligence
/admin/ai-health
/admin/email-validation
/admin/settings
```

Yani **yeni bir `/admin/<isim>` route'u eklemek**, projenin zaten kullandığı ve genişlettiği desenle birebir uyumlu — `settings`'i şişirmeden, sidebar'a kendi girdisiyle eklenebilir.

---

## 6. Öneriler

1. **Mimariyi olduğu gibi tekrar kullan, veriyi ayır.** Aynı üç katmanlı desen (yeni `Setting` key → `@Public()` GET endpoint → client bileşeni → admin CRUD formu) tekrar kullanılmalı, ama **`SYSTEM_REQUIREMENTS` key'i paylaşılmamalı** — login sayfasıyla veri karışır. Örnek yeni key: `PUBLIC_LANDING_SHOWCASE` (veya seçilecek kapsama göre birden fazla ayrı key). Yeni bir Prisma modeli/migration'a gerek yok; mevcut `Setting` tablosu bu iş için zaten kanıtlanmış.
2. **Admin UI'ı yeni, bağımsız bir route'a taşı.** Önerilen: `/admin/landing-page` (ya da kullanıcı başka bir isim tercih ederse ona göre). `SystemRequirementsForm`'un tab/CRUD desenini referans alan yeni bir bileşen yazılabilir. `/admin/settings`'e dokunulmaz.
3. **Küçük teknik iyileştirmeler (yeni yapıda baştan doğru yapılmalı):**
   - `RequirementAccordion` ham `fetch()` kullanıyor; yeni bileşen paylaşılan `api` client wrapper'ını kullanmalı.
   - Backend tarafında JSON içeriği için şema doğrulaması yok; public sayfaya gideceği için en azından temel bir Zod şeması (`@aluplan/shared-schemas`) eklemek daha güvenli olur (admin'in bozuk JSON girip sayfayı boş bırakması ihtimaline karşı fail-soft davranış zaten var ama önlemek daha iyi).

---

## 7. Netleştirilmesi gereken açık noktalar (kullanıcıya soruldu, henüz yanıtlanmadı)

Kullanıcı bu sorulara şu an yanıt vermedi ("dismissed — do not proceed, wait for next instruction") çünkü paralel olarak Codex'ten de aynı analizi istedi; iki raporu karşılaştırıp karar verecek.

### Soru 1 — Kapsam: Landing page'in hangi bölüm(ler)i dinamik/admin-editable olsun?

- **(A) Önerilen) Yeni bir "Ürün/Teknoloji Vitrini" accordion'u** — login sayfasındaki gibi ürün×bölüm×madde accordion'unu landing page'e de ekle (örn. Allplan/Frilo/SCIA kartlarını burada da göster), ayrı bir Setting key ve ayrı admin sayfasıyla.
- **(B) FAQ bölümü** — şu an 3 sabit-kodlu madde (`faq.item1-3`) var; admin panelden ekle/çıkar/düzenle yapılabilir hale getir.
- **(C) Entegrasyon kartları** — şu an 2 sabit-kodlu kart var (OSKA, plugin); admin panelden yönetilebilir liste haline getir.
- **(D) Hepsi (tam CMS)** — hero, eğitim kartları, FAQ, entegrasyonlar, stats dahil sayfanın tamamı admin'den düzenlenebilir. Kapsam en geniş, işçilik de en fazla.

### Soru 2 — Yeni admin sayfası nerede olsun?

- **(A) Önerilen) Yeni bağımsız route: `/admin/landing-page`** — sidebar'da diğer admin sayfalarıyla (`announcements`, `emails`, `ai-health` gibi) aynı seviyede kendi girdisi.
- **(B) Kullanıcının önereceği farklı bir isim/grup** (örn. `/admin/marketing`, `/admin/content`).

---

## 8. Sonraki adım

Kullanıcı Codex'in raporunu bekliyor. İki rapor karşılaştırıldıktan sonra kapsam (Soru 1) ve konum (Soru 2) netleşince implementasyona geçilecek — TDD disiplini, restore point ve append-only ortak rapor kaydı ile (proje standart iş akışı).

---
---

# EK — Codex Raporu ile Karşılaştırma

**Tarih:** 2026-08-08 (yukarıdaki analizden sonra eklendi)
**Karşılaştırılan belge:** `.ai/issues/2026-08-08-public-homepage-dynamic-content-CODEX-Frontend-Onerileri.md`
**Durum:** Sadece analiz + doğrulama. Kod değişikliği yapılmadı.

## E1. Codex'in doğrulanabilir iddialarının bağımsız kontrolü

Codex'in mevcut landing page'de tespit ettiği içerik açıklarını, açıklamalarına güvenmeden kaynak koddan doğruladım. **Beş somut iddianın beşi de doğru çıktı.**

| # | Codex iddiası | Sonuç | Doğrulama kanıtı |
|---|---|---|---|
| 1 | `integrations.oska_link` / `imar_link` kırık çeviri yolu | ✅ **GERÇEK BUG** | Bileşen `home.integrations.*_link` okuyor (`landing-hub.tsx:271,288`), ancak `home.integrations` bloğunda yalnızca `oska_desc`, `oska_title`, `plugins_desc`, `plugins_title`, `title` var. `oska_link` ve `imar_link` gerçekte `home.training.*` altında. |
| 2 | Hardcoded Türkçe metinler | ✅ Doğru | `REHBERİ_GÖRÜNTÜLE` (`landing-hub.tsx:243`), "Türkiye pazarı için özel olarak geliştirilmiş..." (`landing-hub.tsx:264`) — EN/DE sayfalarda da Türkçe kalıyor. |
| 3 | Almanca katalog eksik | ✅ Doğru | `de.json` → `home.stats` ve `home.social_proof` **birebir Türkçe**: `"users_label": "Aktif Kullanıcı"`, `"support_label": "Teknik Destek"`, `"title": "SEKTÖR_LİDERLERİNİN_TERCİHİ"`. `en.json` düzgün çevrilmiş; yalnızca DE kopya kalmış. |
| 4 | FAQ kartları etkileşimsiz | ✅ Doğru | `cursor-pointer` + hover CTA görünümü var, `onClick`/`href`/`router.push` yok (`landing-hub.tsx:220-246`). |
| 5 | Settings yazma role-only | ✅ Doğru | `settings.controller.ts` — tüm uçlar `@Roles('ADMIN','SUPERUSER')`; içerik editörü için ayrı izin yok. |

### E1.1 Bulgu #1 neden ciddi

`t('integrations.oska_link')` eksik anahtar olduğu için next-intl ham anahtar string'ini döndürür; bu değer doğrudan `window.open(...)` içine gider. Tarayıcı `"home.integrations.oska_link"` string'ini göreli URL olarak çözer ve kırık bir sekme açar. Yani entegrasyon kartlarının **her iki dış bağlantısı da bugün canlıda bozuk**.

Bu, 2026-08-08 tarihinde yardım merkezinde düzelttiğim (commit `313e5b47`) **tam olarak aynı bug sınıfı**: kaynak kodda çağrılan ama katalogda bulunmayan i18n anahtarı. Ben landing-hub.tsx'i okudum ancak "statik/hardcoded pazarlama sayfası" olarak niteleyip içerik denetimi yapmadım — Codex yaptı. **Bu kaçış bana ait ve kabul ediyorum.**

### E1.2 Bulgu #3'ün metodolojik önemi

Almanca katalogdaki Türkçe değerler `pnpm i18n:check` tarafından **yakalanamaz**, çünkü anahtarlar üç dilde de mevcut — yalnızca Almanca *değerler* çevrilmemiş. Bu, aynı gün tespit ettiğim i18n:check sınırlamasının ikinci yüzü:

- **Bugün düzelttiğim eksik:** anahtar üç dilde de yok → check yakalamıyor (anahtar setleri özdeş).
- **Codex'in bulduğu eksik:** anahtar üç dilde de var ama değer çevrilmemiş → check yine yakalamıyor (yalnızca anahtar paritesi doğruluyor).

Her iki durum da `i18n:check`'in **yapısal parite** doğruladığını, **içerik doğruluğu** doğrulamadığını gösteriyor.

## E2. Codex'in bu rapordan güçlü olduğu başlıklar

1. **Mevcut kod denetimi** — 7 içerik açığı buldu; ben sıfır bulgu çıkardım. En net ayrışma noktası.
2. **Editoryal iş akışı (draft/publish/revision/rollback)** — benim önerimde admin doğrudan canlı ana sayfaya yazar, geri alma yok. Ticari görünürlüğü yüksek bir pazarlama sayfası için bu gerçek bir eksik.
3. **Eşzamanlılık (optimistic concurrency)** — tek JSON blob = son yazan kazanır; iki admin aynı anda düzenlerse biri diğerini sessizce ezer. Benim raporumda yok.
4. **SEO / Server Component** — sayfa `force-dynamic` + tamamen client component. Public pazarlama sayfası için maliyetli; zaten dokunulacaksa düzeltilmeli. Ben hiç değinmedim.
5. **Typed block union** (`HERO`/`CARD_GRID`/`FAQ_GRID`/`ACCORDION`/`CTA`/`STATS`/`LOGO_GRID`) — benim "aynı deseni tekrar kullan" ifademden belirgin biçimde somut.
6. **Veri içinde `iconKey`** — mevcut ikon seçimi başlık metnine bağlı heuristik; "ALLPLAN 2026" yeniden adlandırılırsa ikon değişir. Ben heuristiği fark ettim ancak sorun olarak işaretlemedim.
7. **Granüler izinler** (`public-content:read/write/publish/rollback`) — yayın yetkisini düzenleme yetkisinden ayırma fikri; bende role-only kabul edilmişti.
8. **Cache sözleşmesi (ETag / Cache-Control + publish invalidation)** — public içerik her ziyaretçide backend'e gidiyor. Bende yok.
9. **Liste key'lerinin index olması** — küçük ama geçerli React kimlik sorunu.

## E3. Bu raporda olup Codex'te olmayan başlıklar

1. **"SİSTEM_YAYINI // GÜNCEL_BİLDİRİMLER" netleştirmesi.** Codex bu başlığı yalnızca konum bilgisi olarak anıyor (kendi §2, satır 39) ve ne olduğunu açıklamıyor. Bu başlık **statik i18n metnidir** (`t('broadcast_title')`) — aynı gün üzerinde çalışılan gerçek `Announcement`/e-posta duyuru sistemiyle hiçbir bağı yoktur. Kullanıcı talebinde bu başlığı bir veri akışı gibi andığı için, istekteki **en olası yanlış anlaşılma noktası** budur ve açıkça belirtilmesi gerekir.
2. **`/admin/settings` kalabalığının nicel ölçümü** — 2076 satır, 8 sekme, proje kuralının (`800 satır`) ~2.5 katı. Codex nitel bıraktı ("zaten sistem ve entegrasyon ayarlarıyla yoğun").

## E4. Asıl ayrışma: kapsam mı mimariyi belirler, mimari mi kapsamı?

Codex 5 fazlı bir mini-CMS tasarladı: 2 yeni Prisma modeli (`PublicPageContent`, `PublicPageRevision`) + migration, revizyon geçmişi, publish/rollback komut uçları, granüler RBAC, ETag cache, 12 maddelik zorunlu test matrisi. Kendi karşılaştırma tablosunda hızı "Orta" olarak işaretliyor; bu kod tabanı ve mevcut kalite kapıları (TDD, %45/%35 coverage eşikleri, restore point disiplini) düşünüldüğünde dürüst tahmin **haftalar mertebesindedir**, günler değil.

Bu raporun önerisi kasıtlı olarak minimaldi: mevcut `Setting` tablosu, tek yeni key, tek yeni route.

**İki öneri aslında çelişmiyor; sıralanabilirler.** Codex doğru *son durumu*, bu rapor doğru *ilk adımı* tasarladı.

Ancak Codex'in mimarisi örtük olarak "ana sayfanın tamamı CMS tarafından yönetilecek" varsayımına dayanıyor. Kullanıcı yalnızca **tek bir accordion bloğu** istiyorsa (bu raporun Soru 1 / Seçenek A'sı), `PublicPageContent` + `PublicPageRevision` + publish workflow ciddi aşırı-mühendislik olur. Codex bu soruyu kendi §11-Q1'inde soruyor, fakat mimarisini soru yanıtlanmış varsayarak kurmuş.

**Değerlendirme: sıra tersine olmalı — önce kapsam kararı, sonra ona uygun mimari ağırlığı.**

## E5. Koşulsuz mutabakat (iki rapor bağımsız olarak aynı sonuca vardı)

- `/admin/settings`'e yeni sekme **eklenmemeli**; ayrı bir admin route'u açılmalı.
- `SYSTEM_REQUIREMENTS` key'i **paylaşılmamalı**; yeni içerik ayrı key/model kullanmalı.
- İçerik JSON'una **şema doğrulaması** eklenmeli (bugün hiç yok).
- Public bileşen ham `fetch()` yerine **paylaşılan `api` client**'ını kullanmalı.
- Yeni Prisma modeli olmadan çözülebilir olsa da, veri sözleşmesi tip güvenli olmalı.

## E6. Codex planına dair not ve çekince

1. **Faz 3 / login içeriğinin taşınması:** Codex, `/auth/system-requirements` uç noktasının geçici adapter olarak korunmasını öneriyor. Makul; ancak bu uç **auth modülünün içinde** yaşıyor — içerik servisi için yanlış bir ev. Konsolidasyon yapılacaksa adapte etmek yerine auth'tan tamamen çıkarmak daha temiz olur.
2. **Pazarlama iddiaları yönetişimi (Codex §7.5):** İstatistikler ve referans logoları için kaynak/onay/son doğrulama tarihi tutulması öneriliyor. Altta yatan gerekçe sağlam (doğrulanmamış iddialar serbestçe düzenlenebilir olmamalı), fakat bu bir yönetişim özelliğidir ve kullanıcının istediğinden ağır olabilir. Kapsam kararına bağlanmalı.
3. **Güvenli dış link (Codex §4.7 / §7.2):** Bugünkü `window.open(url,'_blank')` çağrıları için `noopener` eksikliği modern tarayıcılarda büyük ölçüde örtülüdür — tek başına kritik değil. Ancak URL'ler **admin tarafından düzenlenebilir hale geldiği anda** `javascript:` şema enjeksiyonu gerçek bir risk olur. Codex'in URL protokol doğrulaması talebi bu nedenle yerindedir.

## E7. Sonuç önerisi

**Codex'in Faz 0'ı kapsam kararından bağımsız olarak zaten yapılmalıdır.** Kırık entegrasyon linki (E1.1), Almanca katalog eksikleri ve hardcoded Türkçe metinler — CMS kararı ne yönde olursa olsun bugün canlıda duran hatalardır. Üstelik ikisi, aynı gün kapatılan bug'ın aynı sınıfındandır. Bunları CMS tartışmasından ayırıp önce kapatmak hem düşük riskli hem de hemen değer üretir.

Ardından kapsam kararına göre:

- **Dar kapsam (tek blok / accordion):** bu raporun minimal yaklaşımı yeterli — mevcut `Setting`, yeni key, yeni route, Zod doğrulaması.
- **Geniş kapsam (sayfanın tamamı editoryal):** Codex'in `PublicSiteContentModule` + typed block + revision modeli doğru tercihtir.

**Karar bekleyen sorular birleşik listesi** (bu raporun §7'si + Codex §11):

1. İlk fazda hangi ana sayfa blokları yönetilebilir olacak? (kapsam — mimari ağırlığını bu belirler)
2. Yeni admin sayfası nereye konumlanacak? (`/admin/landing-page` mi, Codex'in "İçerik Yönetimi" üst grubu mu)
3. İçeriği düzenleyen ve yayınlayan roller aynı mı, ayrı mı?
4. İstatistikler gerçek telemetri mi, onaylı statik pazarlama içeriği mi?
5. Login "Sistem Gereksinimleri" editörü ilk fazda mı taşınacak, sonraki fazda mı?
6. FAQ kartları mevcut public bilgi bankasına mı bağlanacak, özel landing içeriği mi olacak?
7. Faz 0 (mevcut hatalar) CMS çalışmasından önce ayrı bir iş kalemi olarak kapatılsın mı?
