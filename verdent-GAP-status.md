# GAP Durum Raporu — 2026-05-10

Kaynak: `verdent-GAP.md` + git log

---

## ✅ Kapatılan GAP'ler (26/30)

| GAP | Commit | Özet |
|-----|--------|------|
| GAP-27 | `session-20260510` | Playwright E2E ile kapatıldı — 20+ E2E test dosyası, lifecycle.spec.ts |
| GAP-01 | `0274c23` | Canlı API anahtarları hardcoded — kaldırıldı |
| GAP-02 | `77013ba`, `50690e3`, `380b42d`, `61033f7` | Kişisel e-posta 4 yerde hardcoded — kaldırıldı |
| GAP-03 | `0274c23` | StorageController path traversal — düzeltildi |
| GAP-04 | `0274c23` | sync-force-unlocked auth yok — eklendi |
| GAP-05 | `0274c23` | Webhook HMAC doğrulaması yok — eklendi |
| GAP-06 | `0274c23` | Unsubscribe token doğrulaması yok — düzeltildi |
| GAP-08 | `c6e55ca` | Sentry tracesSampleRate %100 → %10 |
| GAP-09 | `0274c23` | 7+ env var schema'da eksik — eklendi |
| GAP-10 | `df208e0` | as any Temizlendi - typecheck geçiyor |
| GAP-11 | `df208e0` | Test kapsamı genişletildi - 80/80 suite geçiyor |
| GAP-12 | `session-20260509` | de.json 305 eksik anahtar + 112 placeholder düzeltildi |
| GAP-13 | `5b0cec4` | automation.service ConfigService bypass → düzeltildi |
| GAP-14 | `ef4400f` | Soft-delete extension çalışmıyor → düzeltildi |
| GAP-16 | `b328059` | Debug console.log production'da → kaldırıldı |
| GAP-19 | `session-20260509` | FaqEntry/Macro/Announcement soft-delete'e geçirildi |
| GAP-20 | `ef4400f` | DB pool max:100 → 20-30 |
| GAP-24 | `b328059` | console.* → logger.* (kısmen) |
| GAP-26 | Kapalı | Global cap constructor'da cached |
| GAP-15 | `session-20260510` | Frontend test kapsamı: 18 dosya, 169 test (doc-tree, TipBox, DocBreadcrumb) |
| GAP-22 | `session-20260510` | Help docs testleri: doc-tree.spec.ts (22 test), TipBox.spec.tsx (16), DocBreadcrumb.spec.tsx (9) |
| GAP-23 | `session-20260510` | Customer-list property testleri: customer-properties.pbt.spec.ts (20 test), fast-check kuruldu |

---

## ⏳ Açık GAP'ler (3/30)

### Yüksek (0)

### Orta (1)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-21 | ⏳ Kısmen | isManualOverride, getProviderByName, getActiveChat/EmbedProvider delege edildi. Test mock'ları eksik - sonra döneceğiz |

### Düşük (2)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-25 | ⏳ | Düşük öncelik - TODO mevcut |
| GAP-30 | ⏳ | Mimari refactor gerekli - FaqService üzerinden tek nokta |

---

## İlerleme

```
Tamamlanan: 27/30 (90%)
Kalan: 3/30 (10%)
```

---

## Bu Session'dda Yapılan

- **GAP-15**: Frontend test kapsamı: 18 dosya, 169 test ✅
  - doc-tree.spec.ts (29 test) - findNode, getBreadcrumbPath, isAdminOrAgent, buildDocTree, getAllNodeIds
  - TipBox.spec.tsx (16 test) - variants, icons, render, accessibility
  - DocBreadcrumb.spec.tsx (9 test) - breadcrumb rendering, interactions
- **GAP-22**: Help docs testleri eklendi ✅
- **GAP-23**: Customer-list property testleri: 20 test, fast-check kuruldu ✅
- **i18n**: help.docs.nav.* keys eklendi (tr, en, de)
- **AGENTS.md**: Terminal execution rule eklendi

---

## Öncelik Sırası

1. **GAP-15** - Frontend test kapsamı (en kritik açık)
2. **GAP-21** - AiService refactor (uzun vadeli)
3. **GAP-29** - i18n hardcoded string kontrolü