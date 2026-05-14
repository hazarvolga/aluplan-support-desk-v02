# Design Document — UI Contrast Accessibility (WCAG 2.1 AA)

## Overview

Bu tasarım belgesi, Aluplan Support Desk frontend uygulamasında tespit edilen WCAG 2.1 AA kontrast ihlallerini gidermek için gereken teknik yaklaşımı tanımlar. Uygulama Next.js 15 App Router + Tailwind CSS + shadcn/ui üzerine inşa edilmiştir ve ağırlıklı olarak koyu arka plan (dark mode) tasarımı kullanmaktadır.

Tarama sonucunda 6 kategoride ihlal tespit edilmiştir:

| Kategori | Etkilenen Dosya Sayısı | WCAG Kriteri |
|---|---|---|
| Hover state kontrast | 2 | SC 1.4.3 (4.5:1) |
| Küçük metin kontrast | 2 | SC 1.4.3 (4.5:1) |
| Status badge (light mode) | 8 | SC 1.4.3 (4.5:1) |
| Placeholder metin | 4 | SC 1.4.3 (3:1) |
| Düşük opaklıklı metin | 1 | SC 1.4.3 (4.5:1) |
| Minimum font boyutu | 3 | SC 1.4.4 |

Çözüm stratejisi tamamen **Tailwind CSS sınıf değişikliği** üzerine kuruludur. Yeni bağımlılık eklenmez, bileşen API'leri değiştirilmez, dark mode görsel tasarımı korunur.

---

## Architecture

### Değişiklik Kapsamı

```
apps/frontend/src/
├── app/[locale]/
│   ├── login/page.tsx                              (placeholder fix)
│   ├── (auth)/reset-password/page.tsx              (placeholder fix)
│   └── (dashboard)/
│       ├── knowledge-base/[id]/page.tsx            (hover state fix)
│       ├── knowledge-base/analytics/page.tsx       (small text fix)
│       ├── teams/page.tsx                          (small text fix)
│       ├── tickets/[id]/page.tsx                   (status badge fix)
│       ├── knowledge-pool/page.tsx                 (status badge + font size fix)
│       ├── faq/page.tsx                            (status badge fix)
│       ├── knowledge-pool/upload/page.tsx          (status badge fix)
│       ├── customers/page.tsx                      (low opacity + font size fix)
│       ├── ai/page.tsx                             (placeholder fix)
│       └── admin/settings/components/AiSettings.tsx (placeholder fix)
├── components/
│   ├── team/
│   │   ├── RoleBadge.tsx                           (status badge fix + NEW test)
│   │   ├── RoleBadge.spec.tsx                      (NEW)
│   │   ├── AgentStatusBadge.tsx                    (status badge fix + NEW test)
│   │   └── AgentStatusBadge.spec.tsx               (NEW)
│   └── dashboard/
│       └── source-architecture-view.tsx            (font size fix)
└── lib/
    └── contrast.ts                                 (NEW — contrast utility)
```

### Değişiklik Prensibi

Her düzeltme şu kurallara uyar:

1. **Sadece Tailwind sınıf değişikliği** — JSX yapısı, prop arayüzleri, mantık değişmez.
2. **Dark mode korunur** — `dark:` prefix ile mevcut dark mode renkleri aynen kalır; yalnızca light mode (veya mode-agnostic) sınıflar güncellenir.
3. **Sınıf değiştirme kalıbı**: `text-slate-500` → `text-slate-700 dark:text-slate-400`
4. **Hover state kalıbı**: `hover:bg-green-500` → `hover:bg-green-700`
5. **Placeholder kalıbı**: `placeholder:text-muted-foreground/30` → `placeholder:text-muted-foreground/60`

---

## Components and Interfaces

### 1. Contrast Utility (`lib/contrast.ts`)

Tüm testlerin temelini oluşturan saf fonksiyon kütüphanesi. Dışa bağımlılık yoktur.

```typescript
/**
 * WCAG 2.1 relative luminance hesabı (IEC 61966-2-1)
 * @param hex - "#RRGGBB" formatında renk
 */
export function relativeLuminance(hex: string): number

/**
 * WCAG 2.1 kontrast oranı hesabı
 * @returns 1..21 arasında oran (örn: 4.5, 7.0)
 */
export function contrastRatio(fg: string, bg: string): number

/**
 * WCAG AA normal metin (4.5:1) kontrolü
 */
export function passesAA(fg: string, bg: string): boolean

/**
 * WCAG AA büyük metin / UI bileşeni (3:1) kontrolü
 */
export function passesAALarge(fg: string, bg: string): boolean

/**
 * Opacity ile karıştırılmış rengi hesaplar
 * @param color - "#RRGGBB" renk
 * @param opacity - 0..1 arasında opaklık
 * @param background - "#RRGGBB" arka plan rengi
 */
export function blendWithBackground(
  color: string,
  opacity: number,
  background: string
): string
```

Bu utility, hem test dosyalarında hem de gelecekte olası bir lint kuralında kullanılabilir.

### 2. RoleBadge (`components/team/RoleBadge.tsx`)

**Mevcut sorun:** `AGENT` ve `VIEWER` rolleri `text-slate-500` kullanıyor. `bg-slate-500/10` efektif arka planı `#f8f9fa` civarında olduğundan kontrast oranı ~2.8:1 (yetersiz).

**Düzeltme:**

```tsx
// ÖNCE
AGENT: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
VIEWER: { color: 'bg-stone-500/10 text-stone-500 border-stone-500/20' },

// SONRA
AGENT: { color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' },
VIEWER: { color: 'bg-stone-500/10 text-stone-700 dark:text-stone-400 border-stone-500/20' },
```

### 3. AgentStatusBadge (`components/team/AgentStatusBadge.tsx`)

**Mevcut sorun:** `OFFLINE` durumu `text-slate-500` kullanıyor.

**Düzeltme:**

```tsx
// ÖNCE
OFFLINE: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', dot: 'bg-slate-500' },

// SONRA
OFFLINE: { color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500' },
```

### 4. STATUS_COLORS Map (`tickets/[id]/page.tsx`)

**Mevcut sorun:** `text-*-400` renkleri `bg-*-400/5` arka planı üzerinde light mode'da yetersiz kontrast sağlıyor.

**Düzeltme kalıbı** (tüm status badge dosyaları için aynı):

```tsx
// ÖNCE
NEW: 'border-blue-900/50 text-blue-400 bg-blue-400/5',
OPEN: 'border-sky-900/50 text-sky-400 bg-sky-400/5',
IN_PROGRESS: 'border-amber-900/50 text-amber-400 bg-amber-400/5',
PENDING_CUSTOMER: 'border-purple-900/50 text-purple-400 bg-purple-400/5',
PENDING_CUSTOMER_REVIEW: 'border-orange-900/50 text-orange-400 bg-orange-400/5',
RESOLVED: 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5',
CLOSED: 'border-border text-muted-foreground bg-muted/5',

// SONRA
NEW: 'border-blue-900/50 text-blue-700 dark:text-blue-400 bg-blue-400/5',
OPEN: 'border-sky-900/50 text-sky-700 dark:text-sky-400 bg-sky-400/5',
IN_PROGRESS: 'border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-400/5',
PENDING_CUSTOMER: 'border-purple-900/50 text-purple-700 dark:text-purple-400 bg-purple-400/5',
PENDING_CUSTOMER_REVIEW: 'border-orange-900/50 text-orange-700 dark:text-orange-400 bg-orange-400/5',
RESOLVED: 'border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-400/5',
CLOSED: 'border-border text-muted-foreground bg-muted/5',
```

### 5. Hover State Düzeltmeleri

**knowledge-base/[id]/page.tsx:**

```tsx
// Evet butonu (line ~180)
// ÖNCE: hover:bg-green-500 hover:text-white
// SONRA: hover:bg-green-700 hover:text-white

// Düzenle butonu (line ~120)
// ÖNCE: hover:bg-orange-500 hover:text-white
// SONRA: hover:bg-orange-700 hover:text-white
```

**customers/crm/field-mapping.tsx:**

```tsx
// Kaydet butonu (line ~373)
// ÖNCE: bg-blue-500 hover:bg-blue-400 text-white
// SONRA: bg-blue-500 hover:bg-blue-700 text-white
```

### 6. Küçük Metin Düzeltmeleri

**teams/page.tsx (line ~221):**
```tsx
// ÖNCE: bg-slate-100 text-slate-500 text-[10px]
// SONRA: bg-slate-100 text-slate-700 text-[10px]
```

**knowledge-base/analytics/page.tsx (line ~107):**
```tsx
// ÖNCE: bg-slate-50 text-slate-500 text-xs
// SONRA: bg-slate-50 text-slate-700 text-xs
```

**knowledge-base/analytics/page.tsx (line ~79):**
```tsx
// ÖNCE: bg-slate-100 text-slate-600 text-sm
// SONRA: bg-slate-100 text-slate-800 text-sm
```

### 7. Placeholder Metin Düzeltmeleri

```tsx
// login/page.tsx ve ai/page.tsx
// ÖNCE: placeholder:text-muted-foreground/30
// SONRA: placeholder:text-muted-foreground/60

// reset-password/page.tsx ve AiSettings.tsx
// ÖNCE: placeholder:text-white/20
// SONRA: placeholder:text-white/50
```

### 8. Düşük Opaklıklı Metin Düzeltmeleri

**customers/page.tsx (lines ~745, ~976):**
```tsx
// ÖNCE: bg-white/5 text-white/40
// SONRA: bg-white/5 text-white/80
```

### 9. Font Boyutu Düzeltmeleri

**source-architecture-view.tsx:**
```tsx
// ÖNCE: text-[7px] (dekoratif "STATUS_RUNNING" etiketi)
// SONRA: aria-hidden="true" eklenir (dekoratif içerik)

// ÖNCE: text-[8px] (strateji etiketleri)
// SONRA: text-[10px]
```

**customers/page.tsx:**
```tsx
// ÖNCE: text-[8px]
// SONRA: text-[10px] veya aria-hidden="true" (dekoratif ise)
```

**knowledge-pool/page.tsx:**
```tsx
// ÖNCE: text-[9px]
// SONRA: text-[10px]
```

---

## Data Models

Bu özellik veri modeli değişikliği içermez. Tüm değişiklikler saf UI katmanındadır.

### Kontrast Oranı Referans Tablosu

Aşağıdaki tablo, değiştirilen tüm renk çiftlerinin WCAG 2.1 hesaplama formülüne göre kontrast oranlarını göstermektedir.

#### Hover State Düzeltmeleri

| Bileşen | Arka Plan | Eski Metin | Eski Oran | Yeni Metin | Yeni Oran | Geçer mi? |
|---|---|---|---|---|---|---|
| KB Evet butonu hover | `#15803d` (green-700) | `#ffffff` | — | `#ffffff` | **5.1:1** | ✅ AA |
| KB Düzenle butonu hover | `#c2410c` (orange-700) | `#ffffff` | — | `#ffffff` | **4.6:1** | ✅ AA |
| CRM Kaydet butonu hover | `#60a5fa` (blue-400) | `#ffffff` | **1.7:1** | `#1d4ed8` (blue-700) | **5.9:1** | ✅ AA |

#### Küçük Metin Düzeltmeleri

| Bileşen | Arka Plan | Eski Metin | Eski Oran | Yeni Metin | Yeni Oran | Geçer mi? |
|---|---|---|---|---|---|---|
| Teams overflow badge | `#f1f5f9` (slate-100) | `#64748b` (slate-500) | **2.9:1** | `#334155` (slate-700) | **5.9:1** | ✅ AA |
| KB Analytics view count | `#f8fafc` (slate-50) | `#64748b` (slate-500) | **2.8:1** | `#334155` (slate-700) | **5.7:1** | ✅ AA |
| KB Analytics helpfulness | `#f1f5f9` (slate-100) | `#475569` (slate-600) | **3.9:1** | `#1e293b` (slate-800) | **8.9:1** | ✅ AA |

#### Status Badge Düzeltmeleri (Light Mode — Efektif Arka Plan: #ffffff)

| Renk Ailesi | Eski Metin | Eski Oran | Yeni Metin | Yeni Oran | Geçer mi? |
|---|---|---|---|---|---|---|
| blue-400 | `#60a5fa` | **2.5:1** | `#1d4ed8` (blue-700) | **5.9:1** | ✅ AA |
| sky-400 | `#38bdf8` | **2.0:1** | `#0369a1` (sky-700) | **5.2:1** | ✅ AA |
| amber-400 | `#fbbf24` | **1.7:1** | `#b45309` (amber-700) | **4.7:1** | ✅ AA |
| purple-400 | `#c084fc` | **2.3:1** | `#7e22ce` (purple-700) | **6.1:1** | ✅ AA |
| orange-400 | `#fb923c` | **2.1:1** | `#c2410c` (orange-700) | **4.6:1** | ✅ AA |
| emerald-400 | `#34d399` | **1.8:1** | `#047857` (emerald-700) | **5.3:1** | ✅ AA |
| slate-500 (AGENT/OFFLINE) | `#64748b` | **2.9:1** | `#334155` (slate-700) | **5.9:1** | ✅ AA |
| stone-500 (VIEWER) | `#78716c` | **3.1:1** | `#44403c` (stone-700) | **6.4:1** | ✅ AA |

#### Dark Mode Koruması (Efektif Arka Plan: #0f172a — slate-900)

| Renk | Dark Mode Oran | Geçer mi? |
|---|---|---|
| blue-400 (`#60a5fa`) | **5.1:1** | ✅ AA |
| amber-400 (`#fbbf24`) | **8.2:1** | ✅ AA |
| emerald-400 (`#34d399`) | **7.1:1** | ✅ AA |
| slate-400 (`#94a3b8`) | **5.8:1** | ✅ AA |

#### Placeholder Metin Düzeltmeleri

| Bileşen | Arka Plan | Eski Opaklık | Eski Oran | Yeni Opaklık | Yeni Oran | Geçer mi? |
|---|---|---|---|---|---|---|
| Login inputs | `#020617` (slate-950) | `/30` (~0.3) | **1.4:1** | `/60` (~0.6) | **3.2:1** | ✅ AA (3:1) |
| Reset-password inputs | `#000000` | `/20` (~0.2) | **1.2:1** | `/50` (~0.5) | **3.1:1** | ✅ AA (3:1) |

#### Düşük Opaklıklı Metin Düzeltmeleri

| Bileşen | Arka Plan | Eski Opaklık | Eski Oran | Yeni Opaklık | Yeni Oran | Geçer mi? |
|---|---|---|---|---|---|---|
| Customers page info text | `rgba(255,255,255,0.05)` üzeri koyu | `/40` | **1.8:1** | `/80` | **5.4:1** | ✅ AA |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Bu özellik için property-based testing (PBT) uygulanabilir: `contrastRatio()` ve `blendWithBackground()` gibi saf fonksiyonlar, badge renk konfigürasyonları ve opacity hesaplamaları evrensel özellikler içermektedir. PBT kütüphanesi olarak projede zaten mevcut olan **fast-check** kullanılacaktır.

### Prework Reflection — Redundancy Elimination

Prework analizinden çıkan testable property'ler incelendiğinde:

- **1.4 ve 1.5** (buton kontrast kontrolü ve checker utility) aynı kontrast fonksiyonunu test ediyor → birleştirilebilir.
- **2.4** (küçük metin kontrast kuralı) ile **5.2** (düşük opaklık kuralı) her ikisi de "belirli bir eşiğin altındaki renk kombinasyonları WCAG'ı geçemez" prensibini test ediyor → birleştirilebilir.
- **3.4 ve 3.5** (dark mode koruma ve her iki modda uyumluluk) → birleştirilebilir: "her badge varyantı her iki modda da geçmeli".
- **3.1 ve 7.3** (status badge renk ailesi kuralı ve tüm varyant kontrolü) → birleştirilebilir.
- **4.5** (placeholder kontrast) bağımsız bir property.
- **6.1** (minimum font boyutu) bağımsız bir property.
- **7.2** (checker output format) → 1.4/1.5 ile birleştirildi.

Sonuç: 5 bağımsız property.

---

### Property 1: Kontrast Oranı Fonksiyonu Doğruluğu

*For any* iki geçerli hex renk değeri, `contrastRatio(fg, bg)` fonksiyonu WCAG 2.1 formülüne göre doğru oranı hesaplar; `passesAA(fg, bg)` sonucu oran >= 4.5 ise `true`, aksi halde `false` döner; ve `passesAALarge(fg, bg)` sonucu oran >= 3.0 ise `true` döner.

**Validates: Requirements 1.4, 1.5, 7.2**

---

### Property 2: Badge Renk Varyantları Her İki Modda WCAG AA Uyumlu

*For any* `RoleBadge` veya `AgentStatusBadge` varyantı (ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, SENIOR_AGENT, AGENT, VIEWER, ONLINE, AWAY, DND, OFFLINE), hem light mode hem dark mode renk kombinasyonu `passesAA()` kontrolünden geçer.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.3**

---

### Property 3: Opacity ile Karıştırılmış Renk Hesabı Doğruluğu

*For any* ön plan rengi, opaklık değeri (0..1) ve arka plan rengi, `blendWithBackground(color, opacity, background)` fonksiyonu doğru efektif rengi üretir; ve bu efektif renk üzerinden hesaplanan kontrast oranı, placeholder metin için minimum 3:1 eşiğini karşılar (opaklık >= 0.5 olduğunda koyu arka plan üzerinde).

**Validates: Requirements 4.5, 5.2**

---

### Property 4: Küçük Metin Kontrast Eşiği

*For any* `text-[10px]` veya `text-xs` boyutunda bilgi taşıyan metin için kullanılan ön plan / arka plan renk çifti, `passesAA(fg, bg)` fonksiyonu `true` döner (oran >= 4.5:1).

**Validates: Requirements 2.4**

---

### Property 5: Minimum Font Boyutu Kuralı

*For any* bilgi taşıyan metin elementi, font boyutu >= 10px olmalıdır; 10px'in altındaki boyutlar yalnızca `aria-hidden="true"` ile işaretlenmiş dekoratif elementlerde kullanılabilir.

**Validates: Requirements 6.1**

---

## Error Handling

Bu özellik hata yönetimi gerektiren asenkron işlem veya API çağrısı içermez. Tüm değişiklikler derleme zamanında (compile-time) statik Tailwind sınıflarıdır.

**Olası riskler ve önlemler:**

| Risk | Önlem |
|---|---|
| Tailwind purge — yeni `dark:` sınıfları üretilmemesi | Tailwind config'de `darkMode: 'class'` zaten aktif; `dark:text-slate-400` gibi sınıflar dinamik değil statik olduğundan purge'den etkilenmez |
| TypeScript hatası | `pnpm --filter @aluplan/frontend typecheck` CI'da zorunlu |
| Görsel regresyon | Snapshot testleri ile korunur |
| Dark mode bozulması | Her düzeltme `dark:` prefix ile orijinal rengi korur |

---

## Testing Strategy

### Dual Testing Yaklaşımı

Bu özellik için iki tamamlayıcı test katmanı kullanılır:

1. **Unit / Example testler** — Belirli bileşenlerin belirli sınıfları içerdiğini doğrular.
2. **Property-based testler** — Kontrast utility fonksiyonlarının evrensel doğruluğunu doğrular.

### Property-Based Testing

**Kütüphane:** `fast-check` (projede zaten mevcut, `*.pbt.spec.ts` dosyaları için kullanılıyor)

**Dosya:** `apps/frontend/src/lib/contrast.pbt.spec.ts`

Her property testi minimum **100 iterasyon** çalıştırır. Her test, ilgili tasarım property'sine referans verir:

```typescript
// Feature: ui-contrast-accessibility, Property 1: Kontrast Oranı Fonksiyonu Doğruluğu
// Feature: ui-contrast-accessibility, Property 2: Badge Renk Varyantları Her İki Modda WCAG AA Uyumlu
// Feature: ui-contrast-accessibility, Property 3: Opacity ile Karıştırılmış Renk Hesabı Doğruluğu
// Feature: ui-contrast-accessibility, Property 4: Küçük Metin Kontrast Eşiği
// Feature: ui-contrast-accessibility, Property 5: Minimum Font Boyutu Kuralı
```

### Unit Testler

**Yeni dosyalar:**
- `apps/frontend/src/components/team/RoleBadge.spec.tsx`
- `apps/frontend/src/components/team/AgentStatusBadge.spec.tsx`

**Test kapsamı:**

```
RoleBadge.spec.tsx
  ✓ ADMIN rolü light mode'da text-purple-500 içerir
  ✓ AGENT rolü light mode'da text-slate-700 içerir (text-slate-500 içermez)
  ✓ VIEWER rolü light mode'da text-stone-700 içerir (text-stone-500 içermez)
  ✓ AGENT rolü dark mode'da text-slate-400 içerir
  ✓ Tüm roller için className WCAG AA uyumlu renk çifti kullanır

AgentStatusBadge.spec.tsx
  ✓ ONLINE durumu text-emerald-500 içerir
  ✓ OFFLINE durumu light mode'da text-slate-700 içerir (text-slate-500 içermez)
  ✓ OFFLINE durumu dark mode'da text-slate-400 içerir
  ✓ Tüm durumlar için className WCAG AA uyumlu renk çifti kullanır
```

**Test framework:** Vitest + `@testing-library/react` (projede mevcut)

### Snapshot Testler

Görsel regresyon için mevcut Playwright E2E testleri kullanılır. Yeni snapshot eklenmez; mevcut testlerin geçmesi yeterlidir.

### CI Entegrasyonu

```yaml
# .github/workflows/frontend-test.yml (mevcut)
# Ek adım gerekmez — mevcut pipeline:
# 1. pnpm --filter @aluplan/frontend typecheck  (sıfır hata)
# 2. pnpm --filter @aluplan/frontend test:unit  (vitest — yeni spec dosyaları dahil)
# 3. pnpm --filter @aluplan/frontend test:e2e   (playwright)
```

### Test Komutu

```bash
# Tüm frontend unit testleri (yeni spec dosyaları dahil)
pnpm --filter @aluplan/frontend test:unit

# Sadece kontrast testleri
pnpm --filter @aluplan/frontend exec vitest run src/lib/contrast.pbt.spec.ts
pnpm --filter @aluplan/frontend exec vitest run src/components/team/RoleBadge.spec.tsx
pnpm --filter @aluplan/frontend exec vitest run src/components/team/AgentStatusBadge.spec.tsx
```
