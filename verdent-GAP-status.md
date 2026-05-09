# GAP Durum Raporu — 2026-05-09

Kaynak: `verdent-GAP.md` + `git log --oneline -50`

---

## ✅ Kapatılan GAP'ler (14/30)

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
| GAP-13 | `5b0cec4` | automation.service ConfigService bypass → düzeltildi |
| GAP-14 | `ef4400f` | Soft-delete extension çalışmıyor → düzeltildi |
| GAP-16 | `b328059` | Debug console.log production'da → kaldırıldı |
| GAP-20 | `ef4400f` | DB pool max:100 → 20-30 |
| GAP-24 | `b328059` | console.* → logger.* (kısmen) |

---

## ⏳ Açık GAP'ler (16/30)

### Kritik (0)

Tüm kritik GAP'ler kapatıldı.

### Yüksek (7)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-07 | Açık | `prisma.service.ts` onModuleInit'te ALTER TABLE devam ediyor |
| GAP-10 | Açık | 76 `as any` backend, 284 frontend — type safety düşük |
| GAP-11 | Açık | 50+ kritik servis test yok |
| GAP-12 | Açık | `de.json` 302 anahtar eksik |
| GAP-17 | Açık | `kb-summarizer.processor.ts` dil hardcoded 'tr' |
| GAP-18 | Açık | bcrypt rounds tutarsız (10, 5 yerde) |
| GAP-19 | Açık | Soft-delete tutarsız uygulama (bazı modeller hard-delete) |

### Orta (7)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-15 | Açık | Frontend 151 bileşen, 12 test |
| GAP-21 | Açik | AiService god node (33 edge) |
| GAP-22 | Açık | help-docs spec görev 7.5, 8 eksik |
| GAP-23 | Açık | customer-list spec görevler eksik |
| GAP-25 | Açık | document-parsing TODO eksik |
| GAP-26 | Açık | Budget cap tekrar okuma (4 yerde) |
| GAP-27 | Açık | Backend e2e/integration test yok |

### Düşük (2)

| GAP | Durum | Not |
|-----|-------|-----|
| GAP-28 | Açık | CI pnpm v8, package.json v9+ |
| GAP-29 | Açık | i18n hardcoded string kontrolü gerekli |
| GAP-30 | Açık | KB processor sorumluluk örtüşmesi |

---

## İlerleme

```
Tamamlanan: 14/30 (46%)
Kalan: 16/30 (54%)
```

---

## Son Commit Sırası

```
b328059 fix(observability): remove noisy debug logs (GAP-16)
c6e55ca fix(observability): reduce Sentry sample rates to 10% (GAP-08)
5b0cec4 fix(automation): replace direct process.env with ConfigService (GAP-13)
77013ba fix(tests): remove hardcoded admin email (GAP-02) from tests
50690e3 fix(scripts): comprehensive removal of hardcoded admin email (GAP-02)
380b42d fix(scripts): remove hardcoded admin email (GAP-02) from seeds
61033f7 fix(crm): remove hardcoded admin email (GAP-02) in validator
ef4400f fix(prisma): fix soft-delete extension (GAP-14) and reduce pool size (GAP-20)
0274c23 fix(security): resolve critical gaps (01, 03, 04, 05, 06, 09, 13)
```

---

## Öneriler

1. **GAP-07**: Runtime ALTER TABLE → formal Prisma migration
2. **GAP-10**: Tip güvenliği için `pnpm typecheck` hedefi
3. **GAP-12**: `pnpm i18n:check` ile Almanca eksikleri tamamla
4. **GAP-17**: Ticket language'dan dinamik dil belirleme