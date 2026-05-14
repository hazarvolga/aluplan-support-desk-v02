# Requirements Document

## Introduction

Bu özellik, Aluplan Support Desk frontend uygulamasında tespit edilen WCAG 2.1 AA uyumsuz renk kontrast sorunlarını giderir. Uygulama Next.js 15 App Router, Tailwind CSS ve shadcn/ui üzerine inşa edilmiş olup ağırlıklı olarak koyu arka plan (dark mode) tasarımı kullanmaktadır.

Tarama sonucunda 12 ayrı kontrast ihlali tespit edilmiştir: hover state'lerde yetersiz metin/arka plan oranları, küçük font boyutlarında düşük kontrast, neredeyse görünmez placeholder metinler ve erişilebilirlik sınırının altında kalan font boyutları. Tüm bu sorunlar WCAG 2.1 AA standardının gerektirdiği minimum 4.5:1 (normal metin) ve 3:1 (büyük metin / UI bileşenleri) kontrast oranlarını karşılamamaktadır.

Hedef: Tüm etkilenen bileşenleri WCAG 2.1 AA uyumlu hale getirmek; görsel tasarım dilini ve marka kimliğini korumak.

## Glossary

- **Contrast_Checker**: WCAG 2.1 AA kontrast oranı hesaplama ve doğrulama sistemi
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA — normal metin için minimum 4.5:1, büyük metin (18pt+ veya 14pt+ bold) ve UI bileşenleri için minimum 3:1 kontrast oranı standardı
- **Hover_State**: Kullanıcının fare imlecini bir eleman üzerine getirdiğinde tetiklenen CSS durumu
- **Placeholder_Text**: Form alanlarında kullanıcı henüz giriş yapmamışken görünen ipucu metni
- **Status_Badge**: Ticket, kullanıcı veya içerik durumunu gösteren küçük etiket bileşeni
- **RoleBadge**: Kullanıcı rolünü (ADMIN, AGENT vb.) gösteren `components/team/RoleBadge.tsx` bileşeni
- **AgentStatusBadge**: Ajan çevrimiçi durumunu (ONLINE, AWAY, DND, OFFLINE) gösteren `components/team/AgentStatusBadge.tsx` bileşeni
- **Bilgi_Taşıyan_Metin**: Kullanıcıya anlam ifade eden, okunması beklenen metin; dekoratif veya `aria-hidden` ile işaretlenmiş metinler bu kapsamın dışındadır
- **Tailwind_CSS**: Projenin kullandığı utility-first CSS framework'ü
- **Dark_Mode**: Uygulamanın ağırlıklı tasarım modu; koyu arka plan üzerine açık metin
- **Light_Mode**: Açık arka plan üzerine koyu metin modu; bazı bileşenler yalnızca bu modda sorun göstermektedir

---

## Requirements

### Requirement 1: Kritik Hover State Kontrast Düzeltmeleri

**User Story:** Bir destek temsilcisi olarak, bilgi bankası makale sayfasındaki ve CRM alan eşleme ekranındaki butonların üzerine geldiğimde metni net bir şekilde okuyabilmek istiyorum; böylece doğru aksiyonu hızlıca seçebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı `knowledge-base/[id]/page.tsx`'teki "Evet" geri bildirim butonunun üzerine geldiğinde, THE UI_System SHALL hover state'de arka plan rengi olarak `bg-green-500` (#22c55e) yerine beyaz metin (`text-white`) ile en az 4.5:1 kontrast oranı sağlayan `bg-green-700` (#15803d) veya daha koyu bir yeşil tonu kullanır.
2. WHEN kullanıcı `customers/crm/field-mapping.tsx`'teki kaydet butonunun üzerine geldiğinde, THE UI_System SHALL hover state'de `hover:bg-blue-400` (#60a5fa) yerine beyaz metin (`text-white`) ile en az 4.5:1 kontrast oranı sağlayan `hover:bg-blue-700` (#1d4ed8) veya daha koyu bir mavi tonu kullanır.
3. WHEN kullanıcı `knowledge-base/[id]/page.tsx`'teki düzenle butonunun üzerine geldiğinde, THE UI_System SHALL hover state'de `hover:bg-orange-500` (#f97316) yerine beyaz metin (`text-white`) ile en az 4.5:1 kontrast oranı sağlayan `hover:bg-orange-700` (#c2410c) veya daha koyu bir turuncu tonu kullanır.
4. WHEN kullanıcı klavye ile bir butona focus yaptığında, THE UI_System SHALL focus state'de de en az 4.5:1 kontrast oranını korur; disabled state WCAG 2.1 AA SC 1.4.3 kapsamında muaftır.
5. WHEN herhangi bir etkileşimli buton normal, hover veya focus state'de render edildiğinde, THE Contrast_Checker SHALL her state için metin/arka plan kontrast oranını ayrı ayrı doğrular ve 4.5:1 eşiğinin altındaki herhangi bir state'i başarısız olarak işaretler.

---

### Requirement 2: Küçük Metin Kontrast Düzeltmeleri

**User Story:** Bir yönetici olarak, teams sayfasındaki ve bilgi bankası analitik sayfasındaki küçük etiket ve istatistik metinlerini gözlemleme güçlüğü çekmeden okuyabilmek istiyorum; böylece ekip ve içerik performansını doğru takip edebilirim.

#### Acceptance Criteria

1. WHEN `teams/page.tsx`'teki `bg-slate-100 text-slate-500 text-[10px]` kombinasyonu render edildiğinde, THE UI_System SHALL `text-slate-500` (#64748b) yerine `bg-slate-100` (#f1f5f9) arka planı üzerinde minimum 4.5:1 kontrast oranını sağlayan herhangi bir ton kullanır; `text-slate-700` (#334155) bu kriteri karşılar.
2. WHEN `knowledge-base/analytics/page.tsx`'teki `bg-slate-50 text-slate-500 text-xs` kombinasyonu render edildiğinde, THE UI_System SHALL `text-slate-500` yerine `bg-slate-50` (#f8fafc) arka planı üzerinde minimum 4.5:1 kontrast oranını sağlayan herhangi bir ton kullanır; `text-slate-700` bu kriteri karşılar.
3. WHEN `knowledge-base/analytics/page.tsx`'teki `bg-slate-100 text-slate-600 text-sm` kombinasyonu render edildiğinde, THE UI_System SHALL `text-slate-600` (#475569) yerine `bg-slate-100` arka planı üzerinde minimum 4.5:1 kontrast oranını sağlayan herhangi bir ton kullanır; `text-slate-800` (#1e293b) bu kriteri karşılar.
4. WHEN `text-[10px]` veya `text-xs` (12px) boyutunda bir Bilgi_Taşıyan_Metin render edildiğinde, THE UI_System SHALL normal metin standardı olan 4.5:1 kontrast oranını uygular; büyük metin (18px+ veya 14px+ bold) için 3:1 standardı yeterlidir.

---

### Requirement 3: Status Badge Kontrast Düzeltmeleri

**User Story:** Bir destek temsilcisi olarak, ticket listelerinde ve bilgi havuzu sayfalarında durum etiketlerini (status badge) açık renk (light mode) ekranlarda da net bir şekilde okuyabilmek istiyorum; böylece içeriklerin durumunu hızlıca anlayabilirim.

#### Acceptance Criteria

1. WHEN `tickets/[id]/page.tsx`, `knowledge-pool/page.tsx`, `faq/page.tsx` veya `knowledge-pool/upload/page.tsx` sayfalarındaki `bg-*-400/5 text-*-400` pattern'i light mode'da render edildiğinde, THE UI_System SHALL metin rengi olarak `text-*-400` yerine `#ffffff` efektif arka plan üzerinde minimum 4.5:1 kontrast oranını sağlayan tonu kullanır; `text-*-700` önce denenir, 4.5:1'i sağlamazsa `text-*-800` kullanılır; `text-*-800` de 4.5:1'i sağlamazsa `text-*-800` korunur. Bu kural `blue`, `green`, `red`, `yellow`, `orange`, `purple`, `pink`, `indigo`, `teal` ve `cyan` renk aileleri için geçerlidir.
2. WHEN `components/team/RoleBadge.tsx`'teki `bg-slate-500/10 text-slate-500` kombinasyonu light mode'da render edildiğinde, THE UI_System SHALL `text-slate-500` yerine `#ffffff` efektif arka plan üzerinde minimum 4.5:1 kontrast oranını sağlayan `text-slate-700` kullanır.
3. WHEN `components/team/AgentStatusBadge.tsx`'teki OFFLINE durumu için `bg-slate-500/10 text-slate-500` kombinasyonu light mode'da render edildiğinde, THE UI_System SHALL `text-slate-500` yerine `#ffffff` efektif arka plan üzerinde minimum 4.5:1 kontrast oranını sağlayan `text-slate-700` kullanır.
4. IF dark mode aktif ise, THEN THE UI_System SHALL `text-*-400` tonlarını korur ve bu tonların koyu arka plan üzerinde minimum 4.5:1 kontrast oranını sağladığını doğrular.
5. WHEN dark mode ile light mode arasında geçiş yapıldığında, THE UI_System SHALL `RoleBadge`, `AgentStatusBadge` ve status badge bileşenlerinin her iki modda da WCAG AA uyumlu kontrast oranlarını sağladığını doğrular.

---

### Requirement 4: Placeholder Metin Görünürlüğü

**User Story:** Bir kullanıcı olarak, giriş sayfasındaki, şifre sıfırlama sayfasındaki ve AI ayarları sayfasındaki form alanlarının placeholder metinlerini görebilmek istiyorum; böylece hangi bilgiyi girmem gerektiğini anlayabilirim.

#### Acceptance Criteria

1. WHEN `login/page.tsx` sayfasındaki tüm input ve textarea alanları render edildiğinde, THE UI_System SHALL `placeholder:text-muted-foreground/30` yerine koyu arka plan üzerinde minimum 3:1 kontrast oranı sağlayan `placeholder:text-muted-foreground/60` veya daha yüksek bir opaklık değeri kullanır.
2. WHEN `ai/page.tsx` sayfasındaki tüm input ve textarea alanları render edildiğinde, THE UI_System SHALL `placeholder:text-muted-foreground/30` yerine koyu arka plan üzerinde minimum 3:1 kontrast oranı sağlayan `placeholder:text-muted-foreground/60` kullanır.
3. WHEN `reset-password/page.tsx` sayfasındaki şifre alanları render edildiğinde, THE UI_System SHALL `placeholder:text-white/20` yerine `bg-black` arka plan üzerinde minimum 3:1 kontrast oranı sağlayan `placeholder:text-white/50` kullanır.
4. WHEN `settings/components/AiSettings.tsx` bileşenindeki tüm input ve textarea alanları render edildiğinde, THE UI_System SHALL `placeholder:text-white/20` yerine koyu (`bg-black` veya eşdeğer koyu) arka plan üzerinde minimum 3:1 kontrast oranı sağlayan `placeholder:text-white/50` kullanır.
5. WHEN herhangi bir form alanının placeholder metni render edildiğinde, THE UI_System SHALL placeholder metnin kontrast oranını alanın gerçek arka plan rengi üzerinden ölçer ve hem dark hem light modda minimum 3:1 oranını sağlar; gerçek arka plan rengi belirlenemiyorsa test başarısız sayılır.

---

### Requirement 5: Düşük Opaklıklı Metin Düzeltmeleri

**User Story:** Bir müşteri temsilcisi olarak, müşteriler sayfasındaki tüm metin içeriklerini koyu arka plan üzerinde net bir şekilde okuyabilmek istiyorum; böylece müşteri bilgilerine hızlıca erişebilirim.

#### Acceptance Criteria

1. WHEN `customers/page.tsx`'teki `bg-white/5 text-white/40` kombinasyonu Bilgi_Taşıyan_Metin içeriyorsa render edildiğinde, THE UI_System SHALL `text-white/40` yerine koyu arka plan üzerinde minimum 4.5:1 kontrast oranı sağlayan `text-white/80` veya `text-white/90` kullanır.
2. IF bir metin elementi Bilgi_Taşıyan_Metin ise, THEN THE UI_System SHALL `text-white/40` veya daha düşük opaklıklı metin sınıflarını bu element için kullanmaz.
3. IF bir metin elementi yalnızca dekoratif amaçlıysa ve kullanıcı etkileşimi gerektirmiyorsa, THEN THE UI_System SHALL bu elementi `aria-hidden="true"` ile işaretler ve kontrast gereksiniminden muaf tutar; kullanıcı etkileşimi gerektiren dekoratif elementler `aria-hidden` ile işaretlenemez ve kontrast gereksinimlerini karşılamak zorundadır.

---

### Requirement 6: Minimum Font Boyutu Standardı

**User Story:** Bir kullanıcı olarak, uygulamadaki tüm bilgi taşıyan metinleri standart ekran çözünürlüklerinde gözlemleme güçlüğü çekmeden okuyabilmek istiyorum; böylece içerikleri anlamak için ekrana yaklaşmak zorunda kalmam.

#### Acceptance Criteria

1. WHEN `source-architecture-view.tsx`, `customers/page.tsx` veya `knowledge-pool/page.tsx` sayfalarındaki `text-[7px]`, `text-[8px]` veya `text-[9px]` sınıfları Bilgi_Taşıyan_Metin içeriyorsa render edildiğinde, THE UI_System SHALL bu boyutları kullanmaz ve minimum `text-[10px]` (10px) boyutunu uygular.
2. IF bir metin elementi birincil içerik (başlık, açıklama, veri değeri) taşıyorsa, THEN THE UI_System SHALL minimum `text-sm` (14px) boyutunu uygular; `text-[10px]` ve `text-xs` (12px) yalnızca etiket, badge veya kısaltılmış meta bilgi gibi destekleyici içerikler için kullanılabilir.
3. IF bir metin elementi `text-[7px]`–`text-[9px]` boyutunda olması gerekiyorsa ve yalnızca dekoratif amaçlıysa, THEN THE UI_System SHALL bu elementi `aria-hidden="true"` ile işaretler.
4. WHEN font boyutu değişiklikleri uygulandığında, THE UI_System SHALL `pnpm --filter @aluplan/frontend typecheck` komutunun sıfır hata ürettiğini ve etkilenen bileşenlerin görsel regresyon testlerini geçtiğini doğrular.

---

### Requirement 7: Kontrast Regresyon Önleme

**User Story:** Bir geliştirici olarak, gelecekteki kod değişikliklerinin mevcut WCAG AA uyumluluğunu bozmadığından emin olmak istiyorum; böylece erişilebilirlik kalitesini sürdürülebilir şekilde koruyabilirim.

#### Acceptance Criteria

1. WHEN bu spec kapsamındaki herhangi bir bileşen değiştirildiğinde, THE UI_System SHALL `RoleBadge`, `AgentStatusBadge` ve en az 3 status badge varyantı için kontrast oranını doğrulayan `*.spec.ts` veya `*.test.ts` birim testleri içerir.
2. WHEN bir geliştirici kontrast ile ilgili Tailwind sınıflarını değiştirdiğinde, THE UI_System SHALL test çıktısında hangi bileşenin hangi renk kombinasyonunun hangi kontrast oranını ürettiğini ve WCAG AA eşiğini geçip geçmediğini raporlar.
3. WHEN `RoleBadge`, `AgentStatusBadge` veya status badge bileşenleri render edildiğinde, THE UI_System SHALL her renk varyantının (ADMIN, AGENT, ONLINE, AWAY, DND, OFFLINE vb.) hem light hem dark modda WCAG AA uyumlu olduğunu doğrulayan snapshot veya unit testleri içerir.
4. WHEN kontrast düzeltmeleri uygulandığında, THE UI_System SHALL `pnpm --filter @aluplan/frontend typecheck` komutunun sıfır TypeScript hatası ürettiğini doğrular; diğer test başarısızlıkları (unit test, e2e vb.) da merge'i engelleyebilir.
5. WHEN bu spec kapsamındaki değişiklikler CI pipeline'ına gönderildiğinde, THE UI_System SHALL `frontend-test.yml` workflow'unun başarıyla tamamlandığını doğrular; herhangi bir test başarısızlığı merge'i engeller ve CI dışındaki koşullar (manuel review gereksinimleri vb.) da merge'i engelleyebilir.
