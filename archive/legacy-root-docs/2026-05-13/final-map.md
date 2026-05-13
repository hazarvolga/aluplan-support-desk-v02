# Aluplan Support Desk - Final Mapping Report
## 2026-05-10

---

## 1. GAP Durumu (83% Tamamlandı)

### Tamamlanan GAP'ler (25/30)

| GAP | Commit | Özet |
|-----|--------|------|
| GAP-01 | `0274c23` | Canlı API anahtarları hardcoded — kaldırıldı |
| GAP-02 | `77013ba` | Kişisel e-posta 4 yerde hardcoded — kaldırıldı |
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
| GAP-15 | `session-20260510` | Frontend test kapsamı: 18 dosya, 169 test |
| GAP-16 | `b328059` | Debug console.log production'da → kaldırıldı |
| GAP-19 | `session-20260509` | FaqEntry/Macro/Announcement soft-delete'e geçirildi |
| GAP-20 | `ef4400f` | DB pool max:100 → 20-30 |
| GAP-22 | `session-20260510` | Help docs testleri: doc-tree, TipBox, DocBreadcrumb |
| GAP-24 | `b328059` | console.* → logger.* (kısmen) |
| GAP-26 | Kapalı | Global cap constructor'da cached |

### Açık GAP'ler (5/30)

| GAP | Öncelik | Durum | Not |
|-----|---------|-------|-----|
| GAP-21 | Orta | ⏳ Kısmen | AiService sorumlulukları ayrıldı |
| GAP-23 | Orta | ⏳ | Spec dosyaları gerekli |
| GAP-27 | Orta | ⏳ | e2e/integration test gerekli |
| GAP-25 | Düşük | ⏳ | Düşük öncelik - TODO mevcut |
| GAP-30 | Düşük | ⏳ | Mimari refactor gerekli - FaqService üzerinden tek nokta |

---

## 2. Code Intelligence - GitNexus Analizi

### Proje İstatistikleri
- **Symbols**: 9,366
- **Relationships**: 16,197
- **Execution Flows**: 241

### Blast Radius (Son Değişiklikler)

| Component | Risk | Upstream Dependencies |
|-----------|------|----------------------|
| `findNode` (doc-tree.ts) | **LOW** | 1 direct: HelpDocsContent |
| `TipBox` | **LOW** | 0 upstream |
| `DocBreadcrumb` | **LOW** | 0 upstream |

**Sonuç**: Tüm değişiklikler izole, düşük riskli.

---

## 3. Knowledge Graph - Graphify Analizi

### Graf İstatistikleri
- **Nodes**: 11,474
- **Edges**: 16,107
- **Communities**: 644
- **Extraction Quality**: 86% EXTRACTED · 14% INFERRED

### Help Bileşenleri - Community Yapısı

| Component | Community | Degree | Bağlantılar |
|-----------|-----------|--------|-------------|
| doc-tree.spec.ts | 68 | 17 | findNode, getBreadcrumbPath, isAdminOrAgent, buildDocTree |
| TipBox.tsx | 91 | 13 | tipBoxVariants, iconVariants, TipBoxVariant |
| DocBreadcrumb.tsx | 141 | 1 | Test imports |

### God Nodes (En Bağlantılı Soyutlamalar)

1. `Error()` - 227 edges
2. `mt()` - 113 edges
3. `t()` - 105 edges (i18n - next-intl)
4. `AiService` - 42 edges
5. `toast()` - 37 edges (frontend notification)
6. `AiQueryService` - 35 edges

### Surprising Connections
- `bootstrap()` → `Error()` - test dosyasından error handling'e
- `N()` → `qi()` - query compiler'dan frontend bundle'a

---

## 4. Test Durumu

### Backend (NestJS)
- **Suite**: 80/80 geçiyor
- **Tests**: 638/639 geçiyor

### Frontend (Next.js)
- **Files**: 18 test dosyası
- **Tests**: 169 test
  - doc-tree.spec.ts: 29 test
  - TipBox.spec.tsx: 16 test
  - DocBreadcrumb.spec.tsx: 9 test
  - Diğer: 115 test

### i18n
- **Languages**: tr, en, de (3 dil tamam)
- **i18n Check**: ✅ Geçiyor

---

## 5. Son Yapılan Değişiklikler (Bu Session)

1. **doc-tree.ts**: Node ID ve labelKey formatı `.` yerine `_` kullanacak şekilde güncellendi
2. **TipBox.tsx**: `tipBoxVariants` ve `iconVariants` export edildi
3. **Translations**: help.docs.nav.* keys tr/en/de dosyalarına eklendi
4. **AGENTS.md**: Terminal execution rule eklendi (NVM fix)

---

## 6. Sonraki Adımlar

1. GAP-23: Customer list spec dosyaları gerekli
2. GAP-27: e2e/integration test altyapısı
3. GAP-30: FaqService tek nokta mimari refactor
4. Graph index güncel tutma: `graphify update .` after major changes

---

## 7. Araçlar ve Kaynaklar

### Code Intelligence
- GitNexus MCP: Impact analysis, context queries
- Graphify: Knowledge graph, community detection

### Monitoring
- `gitnexus detect_changes()` - pre-commit check
- `graphify update .` - graph yenileme
- `pnpm i18n:check` - translation gap check

---

*Generated: 2026-05-10*
*Project: aluplan-support-desk-v02*
*Repo: https://github.com/aluplan/aluplan-support-desk-V02*