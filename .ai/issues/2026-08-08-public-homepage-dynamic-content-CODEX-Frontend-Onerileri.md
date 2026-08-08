# CODEX Frontend Önerileri

**Tarih:** 2026-08-08
**Kapsam:** Public giriş sayfasındaki dinamik sistem gereksinimleri akışı ile public ana sayfanın karşılaştırılması
**Durum:** Analiz ve mimari öneri; ürün kodu, veritabanı ve migration değiştirilmedi
**Sınırlar:** Local ve salt-okunur inceleme; push, deploy ve production erişimi yapılmadı

## 1. Yönetici özeti

Evet, `/tr/login` sayfasındaki modele benzer biçimde `/tr`, `/en` ve `/de` public ana sayfaları da yönetilebilir içerikle beslenebilir. Ancak mevcut `SYSTEM_REQUIREMENTS` çözümünü kopyalayıp ana sayfanın tamamını tek bir `Setting.value` JSON alanına koymak doğru değildir.

Önerilen çözüm:

1. Admin sidebar içinde **İçerik Yönetimi** adlı ayrı bir üst bölüm oluşturmak.
2. Bunun altında **Public Site İçeriği** ekranını açmak; Admin Settings içine yeni tab eklememek.
3. Backend'de generic Settings API yerine tip güvenli bir `PublicSiteContentModule` kurmak.
4. Ana sayfayı kontrollü bloklardan oluşturmak: `HERO`, `CARD_GRID`, `FAQ_GRID`, `ACCORDION`, `CTA`, `STATS`, `LOGO_GRID`.
5. Taslak, önizleme, yayınlama, revizyon ve geri alma süreçlerini ilk günden veri modeline dahil etmek.
6. Public sayfada yalnız **yayınlanmış** sürümü, locale bazlı ve cache'li olarak sunmak.

Bu yapı giriş sayfasındaki accordion fikrini genelleştirir; fakat ana sayfayı accordion görünümüne zorlamaz. Genelleştirilecek şey UI biçimi değil, **yönetilebilir + çok dilli + kontrollü yayınlanan public içerik sözleşmesidir**.

## 2. Mevcut giriş sayfası akışı

Akış şu şekilde çalışıyor:

```text
Admin Settings / Sistem Gereksinimleri
  -> GET/POST /api/v1/settings/SYSTEM_REQUIREMENTS
  -> settings tablosunda tek JSON string
  -> GET /api/v1/auth/system-requirements?locale=tr
  -> login RequirementAccordion
```

### Kod kanıtı

- Public bileşen endpoint'i kendi oluşturuyor ve doğrudan `fetch()` çağırıyor: `apps/frontend/src/components/auth/requirement-accordion.tsx:23-56`.
- Veri yoksa veya istek hata verirse bileşen sessizce kayboluyor: `requirement-accordion.tsx:48-52,77`.
- Accordion giriş sayfasındaki `SİSTEM_YAYINI // GÜNCEL_BİLDİRİMLER` alanında render ediliyor: `apps/frontend/src/app/[locale]/login/page.tsx:95-102`.
- Admin formu `SYSTEM_REQUIREMENTS` kaydını okuyup TR/EN/DE içeriğinin tamamını tek JSON olarak kaydediyor: `apps/frontend/src/components/admin/settings/SystemRequirementsForm.tsx:42-68`.
- Public backend endpoint'i gerçekten auth gerektirmiyor: `apps/backend/src/auth/auth.controller.ts:189-194`.
- Backend JSON'u parse edip istenen locale'i, yoksa İngilizceyi döndürüyor: `apps/backend/src/auth/auth.service.ts:648-659`.
- Generic Settings yazma uçları yalnız `ADMIN` ve `SUPERUSER` rollerine açık: `apps/backend/src/settings/settings.controller.ts:10-52`.
- DTO yalnız `key`, `value`, `isSecret` tiplerini doğruluyor; içerik JSON şemasını doğrulamıyor: `apps/backend/src/settings/dto/upsert-setting.dto.ts:1-15`.
- Prisma `Setting` modeli tekil key/value deposudur; taslak, yayın, revizyon ve locale alanları yoktur: `packages/database/prisma/schema.prisma:367-376`.

### Yerel çalışma doğrulaması

`GET http://localhost:4000/api/v1/auth/system-requirements?locale=tr` salt-okunur çağrısı beş güncel grubu döndürdü:

- ALLPLAN 2026
- FRILO 2026
- SCIA Engineer 2026
- Sanal Ortamlar
- Servisler (Share, BIMPLUS, Exchange)

Bu nedenle ekrandaki yapı mock değildir; yerel veritabanındaki yönetilebilir kayda bağlıdır.

## 3. Mevcut giriş çözümünün güçlü ve zayıf yanları

### Güçlü yanlar

- Oturum açmadan okunabiliyor.
- TR/EN/DE tek editörden yönetilebiliyor.
- Public ekranda içerik React metni olarak render ediliyor; doğrudan HTML enjeksiyonu kullanılmıyor.
- English fallback mevcut.
- Basit içerikler için hızlı ve düşük maliyetli.

### GAP ve riskler

1. **Şema doğrulaması yok:** Bozuk fakat parse edilebilir JSON public bileşeni runtime'da bozabilir.
2. **Tek blob / son yazan kazanır:** İki admin eşzamanlı düzenlerse biri diğerinin değişikliğini sessizce ezebilir.
3. **Taslak ve yayın ayrımı yok:** Kaydetme public davranışı doğrudan değiştirebilir.
4. **Revizyon/rollback yok:** Hatalı içerikten geri dönüş için içerik seviyesinde geçmiş tutulmuyor.
5. **Hata görünürlüğü zayıf:** Public fetch hatasında accordion tamamen kayboluyor; kullanıcıya fallback veya retry sunulmuyor.
6. **Merkezi API istemcisi kullanılmıyor:** Raw `fetch()` timeout, iptal ve ortak request-id davranışını taşımıyor.
7. **Cache sözleşmesi yok:** Public içerik her ziyaretçide tekrar backend'e gider.
8. **İkon seçimi başlık metnine bağlı:** Çeviri veya başlık değişikliği ikon davranışını değiştirebilir.
9. **Liste key'leri index:** Sıralama/değişiklik sırasında React kimliği içerikle bağlı değildir.
10. **Yetki kaba:** İçerik editörü için ayrı izin yerine ADMIN/SUPERUSER rolü gerekiyor.

Bu eksikler giriş accordion'unun bugün çalışmadığı anlamına gelmez. Yapı çalışıyor; fakat ana sayfa gibi daha geniş ve ticari olarak görünür bir yüzeye ölçeklenirken aynı sınırlamalar büyür.

## 4. Public ana sayfanın mevcut durumu

Ana sayfa şu anda dinamik içerik sistemine bağlı değildir:

- `/[locale]` yalnız `LandingHub` render ediyor: `apps/frontend/src/app/[locale]/page.tsx:1-7`.
- `LandingHub` tamamen client component ve içerikleri `home.*` çeviri anahtarları ile hardcoded JSX'ten alıyor: `apps/frontend/src/components/landing-hub.tsx:1-32`.
- Hero, eğitim kartları, FAQ, entegrasyonlar, istatistikler ve sosyal kanıt alanları kod içinde sabit yapıda.
- Sayfa statik içerikli olmasına rağmen `force-dynamic` ve tamamı client component; SEO ve ilk render açısından gereksiz maliyet oluşturuyor.

### Ana sayfada analiz sırasında görülen mevcut içerik açıkları

1. **Kırık çeviri yolu:** Bileşen `home.integrations.oska_link` ve `home.integrations.imar_link` okuyor (`landing-hub.tsx:271,288`), fakat linkler üç dilde de `home.training.*` altında (`messages/{tr,en,de}.json:17-27`). Bu durum missing-message ve hatalı dış bağlantı davranışı üretebilir.
2. **Hardcoded Türkçe:** `REHBERİ_GÖRÜNTÜLE` (`landing-hub.tsx:243`) ve Türkiye pazarı açıklaması (`landing-hub.tsx:264`) EN/DE sayfalarda da Türkçe kalır.
3. **Eksik Almanca çeviri:** DE istatistik etiketleri ve sosyal kanıt metinleri Türkçe kalmış: `apps/frontend/messages/de.json:45-55`.
4. **Etkileşimsiz FAQ kartları:** Kartlarda pointer/call-to-action görünümü var ancak link veya click davranışı yok: `landing-hub.tsx:220-245`.
5. **Doğrulanması gereken pazarlama iddiaları:** `10.000+`, `5.000+`, `7/24` ve sosyal kanıt metinleri katalogdan geliyor. Bunlar admin tarafından serbestçe değiştirilebilir hale getirilmeden önce kaynak/onay yönetimi gerekir.
6. **Placeholder sosyal kanıt:** Gerçek kurum logoları yerine sembolik görsel kullanım devam ediyor; canlı doğruluk iddiası gibi sunulmamalı.
7. **Güvenli dış link yardımcı katmanı yok:** `window.open(..., '_blank')` çağrıları ortak URL doğrulaması ve açık `noopener/noreferrer` sözleşmesi taşımıyor.

Bu maddeler önerilen CMS geliştirmesinden bağımsız mevcut düzeltme adaylarıdır. Yeni içerik yönetimi bunları gizlememeli; önce sözleşme testleriyle görünür kılmalıdır.

## 5. Önerilen admin bilgi mimarisi

Admin Settings zaten sistem ve entegrasyon ayarlarıyla yoğun. Public site içeriği teknik konfigürasyon değildir; editoryal içeriktir.

Önerilen sidebar yapısı:

```text
İÇERİK YÖNETİMİ
├── Public Site İçeriği
│   ├── Ana Sayfa
│   ├── Giriş Sayfası
│   ├── SEO ve Meta
│   └── Medya
├── Duyurular
└── Yardım İçeriği (ileride)
```

İlk sürümde yalnız **Public Site İçeriği > Ana Sayfa** açılabilir. Mevcut Sistem Gereksinimleri formu, yeni yapı stabil olduktan sonra **Giriş Sayfası** altına taşınabilir. Geçişte eski public endpoint adapter olarak korunmalı; login sayfası aynı anda kırılmamalıdır.

### Yetkilendirme

Role-only kontrol yerine kanonik izinler önerilir:

- `public-content:read`
- `public-content:write`
- `public-content:publish`
- `public-content:rollback`

Yayın yetkisi içerik düzenleme yetkisinden ayrılabilir. Böylece her editör doğrudan public yayını değiştiremez.

## 6. Önerilen teknik mimari

### Backend

Yeni bir `PublicSiteContentModule`:

- Public read: `GET /api/v1/public-content/pages/:pageKey?locale=tr`
- Admin draft read/write: `/api/v1/admin/public-content/...`
- Publish ve rollback: ayrı komut endpoint'leri
- DTO/Zod veya class-validator ile blok şeması, alan uzunlukları ve URL kuralları
- Public yanıt yalnız published revision döndürür
- Audit: updatedBy, publishedBy, tarih ve versiyon
- Optimistic concurrency: admin eski versiyonu kaydetmeye çalışırsa `409`
- ETag veya kısa `Cache-Control` ve publish sonrası invalidation

### Veri modeli

Önerilen ana kayıt:

```text
PublicPageContent
- pageKey            // home, login
- locale             // tr, en, de
- status             // DRAFT, PUBLISHED, ARCHIVED
- version
- contentJson        // doğrulanan blok birleşimi
- updatedBy / updatedAt
- publishedBy / publishedAt
```

Ve değişmez geçmiş için:

```text
PublicPageRevision
- pageContentId
- version
- contentJson
- createdBy / createdAt
- changeNote
```

`pageKey + locale + status/version` bütünlüğü DB constraint ile korunmalıdır.

### Kontrollü blok sözleşmesi

Serbest HTML veya serbest React bileşen adı yerine discriminated union kullanılmalı:

- `HERO`
- `CARD_GRID`
- `FAQ_GRID`
- `ACCORDION`
- `CTA`
- `STATS`
- `LOGO_GRID`

Her blok kendi tip güvenli alanlarına, görünürlük durumuna ve stabil `id` değerine sahip olmalı. Navigation, güvenlik mesajları, auth davranışı ve uygulama shell'i kod tarafından yönetilmeye devam etmelidir.

### Frontend

- Ana public sayfa mümkün olduğunca Server Component olmalı.
- Yayınlanmış içerik server-side alınmalı; animasyon gereken bloklar küçük client adalarına ayrılmalı.
- API yoksa son geçerli yayın veya kod içindeki versiyonlu fallback kullanılmalı; tüm sayfa sessizce boşalmamalı.
- Admin önizlemesi public sayfayla **aynı renderer** üzerinden yapılmalı; mock preview yazılmamalı.
- Login accordion genelleştirilecekse başlık metninden ikon çıkarmak yerine blok verisinde doğrulanan `iconKey` kullanılmalı.

## 7. Güvenlik ve içerik doğruluğu kuralları

1. Arbitrary HTML varsayılan olarak yasak olmalı; gerekiyorsa server-side sıkı allowlist ile sanitize edilmeli.
2. Link alanları HTTPS, izin verilen protokol ve gerekiyorsa izin verilen domain listesiyle doğrulanmalı.
3. Public içerikte secret, iç sistem endpoint'i, müşteri verisi veya operasyonel hata ayrıntısı bulunmamalı.
4. Görsel kaynakları CSP ile uyumlu ve onaylı storage/branding hattından gelmeli.
5. İstatistik ve referans/logolar için kaynak, onay ve son doğrulama tarihi tutulmalı.
6. TR/EN/DE eksiklikleri yayın öncesi validation gate ile gösterilmeli; fallback kullanılıyorsa admin bunu açıkça görmeli.
7. Preview linki public token veya gizli draft verisini kalıcı olarak açığa çıkarmamalı.
8. Admin değişiklikleri audit log'a yazılmalı.
9. Public endpoint rate-limit/cache ile korunmalı fakat içerik yayınlandıktan sonra kontrollü biçimde yenilenmeli.

## 8. Seçenek karşılaştırması

| Seçenek | Hız | Risk | Değerlendirme |
|---|---:|---:|---|
| `PUBLIC_HOME_CONTENT` adlı yeni bir Setting JSON'u | Çok hızlı | Yüksek | Küçük geçici MVP dışında önerilmez; taslak/revizyon/concurrency yok |
| Ayrı UI + generic Settings backend | Hızlı | Orta-yüksek | Settings kalabalığını azaltır ama veri sözleşmesini çözmez |
| Ayrı `PublicSiteContentModule` + typed blocks + revision | Orta | Düşük | **Önerilen kalıcı çözüm** |
| Tam serbest sayfa oluşturucu/WYSIWYG | Yavaş | Yüksek | Bu proje için gereksiz karmaşıklık ve güvenlik yüzeyi |

## 9. Güvenli uygulama fazları

### Faz 0 — Mevcut public ana sayfa sözleşmesini temizle

- Eksik `integrations.*_link` anahtarlarını düzelt.
- Hardcoded TR metinlerini i18n'e taşı.
- Almanca katalog eksiklerini tamamla.
- FAQ kartlarını gerçek route'a bağla veya etkileşim görünümünü kaldır.
- Pazarlama sayıları ve sosyal kanıtı iş sahibiyle doğrula.
- TR/EN/DE public Playwright smoke testleri ekle.

### Faz 1 — Public içerik çekirdeği

- Tip güvenli veri modeli ve module.
- Sadece `home` için draft ve published içerik.
- Admin sidebar'da ayrı İçerik Yönetimi alanı.
- Public server-side renderer ve güvenli fallback.

### Faz 2 — Editoryal iş akışı

- Preview, publish, audit, revision, rollback.
- Optimistic locking ve eşzamanlı düzenleme koruması.
- Locale completeness gate.

### Faz 3 — Login içeriğini konsolide et

- Mevcut Sistem Gereksinimleri editörünü yeni Giriş Sayfası alanına taşı.
- Eski `/auth/system-requirements` endpoint'ini geçici adapter olarak koru.
- Yeni public renderer doğrulandıktan sonra eski Setting blob'unu kontrollü olarak emekliye ayır.

### Faz 4 — Medya, SEO ve gerçek ölçümler

- Onaylı medya seçici.
- SEO/meta önizlemesi.
- Statik pazarlama sayıları yerine uygunsa gerçek ve kaynaklı metrikler.

## 10. Zorunlu test matrisi

- DTO/schema kabul ve red testleri.
- Public endpoint'in yalnız published sürümü döndürmesi.
- Yetkisiz admin write/publish/rollback işlemlerinin reddi.
- Locale fallback ve eksik locale publish gate.
- XSS, tehlikeli URL ve alan uzunluğu testleri.
- Optimistic concurrency `409` testi.
- Revision rollback bütünlüğü.
- Publish sonrası cache invalidation.
- Admin preview ile public renderer parity testi.
- TR/EN/DE'de raw translation key bulunmadığını doğrulayan test.
- Login ve home için unauthenticated Playwright smoke testi.
- API hatasında boş ekran yerine son geçerli/fallback içeriğin gösterilmesi.

## 11. Codex kararı

**GO — yalnız mimari plan için.** Böyle bir yapı projeye uygundur ve admin operasyonunu kolaylaştırır.

**NO-GO — mevcut `SYSTEM_REQUIREMENTS` blob yaklaşımını doğrudan ana sayfaya kopyalamak için.** Ana sayfa daha yüksek görünürlük, editoryal yönetişim, SEO ve marka doğruluğu gerektirir.

En mantıklı sonraki adım, Claude'un bağımsız önerisiyle bu belgenin karşılaştırılması; ardından ortak kapsam kararı alınmasıdır. Kod geliştirmesine başlamadan önce şu kararlar netleşmelidir:

1. İlk fazda hangi ana sayfa blokları yönetilebilir olacak?
2. İçeriği düzenleyen ve yayınlayan roller aynı mı, ayrı mı olacak?
3. İstatistikler gerçek telemetry mi, onaylı statik pazarlama içeriği mi olacak?
4. Mevcut login Sistem Gereksinimleri editörü ilk fazda mı, sonraki fazda mı taşınacak?
5. FAQ kartları mevcut public bilgi bankasına mı bağlanacak, özel landing içerikleri mi olacak?

## 12. Claude ile karşılaştırma kontrol listesi

Claude önerisiyle aşağıdaki başlıklar birebir karşılaştırılmalıdır:

- Generic Settings blob mu, ayrı içerik modeli mi?
- Admin menü yerleşimi ve permission modeli.
- Draft/publish/revision/rollback gereksinimi.
- Server Component ve cache stratejisi.
- Serbest HTML yerine typed block yaklaşımı.
- Locale completeness/fallback davranışı.
- Mevcut ana sayfadaki i18n, link, FAQ ve doğruluk açıkları.
- Login içeriğinin ne zaman yeni yapıya taşınacağı.
- Migration ve geriye uyumluluk planı.
- Test ve güvenlik kapıları.

Claude'un sonucu geldiğinde yeni bir üçüncü tasarım üretmek yerine, iki önerinin ortak ve ayrışan noktaları karar tablosunda birleştirilmelidir.
