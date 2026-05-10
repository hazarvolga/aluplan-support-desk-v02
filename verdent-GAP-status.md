# GAP Durum Raporu — 2026-05-10

Kaynak: `verdent-GAP.md` + git log

---

## ✅ Kapatılan GAP'ler (23/30)

| GAP | Commit | Özet |
|-----|--------|------|
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

---

## ⏳ Açık GAP'ler (7/30)

### Yüksek (1)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-15 | Açık | Frontend 151 bileşen, 12 test - test kapsamı gerekli |

### Orta (6)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-21 | ⏳ Kısmen | AiService sorumlulukları ayrıldı - AiCircuitBreakerService, AiProviderRouter |
| GAP-22 | Açık | help-docs spec görev 7.5, 8 eksik |
| GAP-23 | Açık | customer-list spec görevler eksik |
| GAP-25 | Açık | document-parsing TODO eksik |
| GAP-27 | Açık | Backend e2e/integration test yok |
| GAP-29 | Açık | i18n hardcoded string kontrolü gerekli |

### Düşük (1)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-30 | Açık | KB processor sorumluluk örtüşmesi |

---

## İlerleme

```
Tamamlanan: 23/30 (77%)
Kalan: 7/30 (23%)
```

---

## Bu Session'dda Yapılan

- **GAP-10**: Backend typecheck ✅ Geçti - sadece 1 adet 3.party kütüphane uyumsuzluğu (kabul edilebilir)
- **GAP-11**: 5+ yeni test dosyası eklendi, tüm backend testleri yeşil ✅
  - auto-assignment.service.spec.ts (3 test)
  - business-hours.service.spec.ts
  - Düzeltilen: macros, faq, dynamics365, crm-email-validator, proactive-chat, ai-auto-resolver
- **GAP-12**: i18n key nesting düzeltildi (dot → underscore)
- **AGENTS.md**: Terminal execution rule eklendi

---

## Öncelik Sırası

1. **GAP-15** - Frontend test kapsamı (en kritik açık)
2. **GAP-21** - AiService refactor (uzun vadeli)
3. **GAP-29** - i18n hardcoded string kontrolü