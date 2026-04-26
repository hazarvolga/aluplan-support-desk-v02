# Production Readiness — Karşılaştırmalı Doğrulama

> **Tarih:** 26 Nisan 2026 (akşam)
> **Branch:** main · **Commit:** `77a9498` (review öncesi: HEAD)
> **Bağlam:** `PRODUCTION_READINESS.md` raporu için bağımsız doğrulama
> **Sonuç:** 🟡 **Hazır değil — 1 kritik bloker düzeltildi, 1 backend integration fail kaldı**

---

## 0. Yönetici Özeti

| Alan | `PRODUCTION_READINESS.md` İddiası | Doğrulanmış Gerçek | Fark |
|---|---|---|---|
| Backend unit | "39.16% lines" | 72 suite, **558 PASS / 6 skip** | ✅ |
| Backend integration | (rapor değinmiyor) | 4 suite, **52/53 PASS, 1 FAIL** | ⚠ |
| Frontend unit | (rapor değinmiyor) | 13/13 suite, **92 PASS** | ✅ |
| Frontend E2E | "✅ Playwright, 9 senaryo" | **🔴 Syntax error → 0 test çalışıyordu**; düzeltildi → **57 test, 20 dosya keşfediliyor** | 🚨 |
| Skip'lenen testler | "ai.service ve ai-query 1 skip — backlog" | **2 dosyada 6 atomik test skipped** (1× describe.skip + 5 it içerir, 1× it.skip) | ✅ ihmal sınırlı |
| Test'siz modüller | (rapor değinmiyor) | 7 modül: `config`, `events`, `health`, `metrics`, `prisma`, `rbac`, `whatsapp` | ⚠ |
| TypeCheck + Lint | (rapor değinmiyor) | ✅ Geçen koşumda exit 0 | ✅ |

**Durum**: User raporundaki "✅ Production'a hazır" iddiası, **bu inceleme öncesinde hatalıydı**. Playwright suite'i `proactive-chat.spec.ts:807` syntax hatası nedeniyle **tamamen kapalıydı** — 57 testten **hiçbiri çalışmıyordu**, ama rapor 9 senaryonun yeşil olduğunu varsayıyordu. **Bu inceleme sırasında düzeltildi**.

---

## 1. 🔴 KRİTİK BULGU — DÜZELTİLDİ

### K-1 — `proactive-chat.spec.ts` syntax hatası tüm Playwright suite'ini bloke ediyordu

**Kanıt** (review öncesi `pnpm --filter @aluplan/frontend test:e2e`):
```
SyntaxError: /apps/frontend/e2e/proactive-chat.spec.ts: Unexpected token (807:0)
  805 |         }
  806 |     });
> 807 | });
      | ^
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL @aluplan/frontend@0.1.0 test:e2e
```

**Kök neden** (commit `2bfed29 test: add comprehensive E2E tests for proactive chat`):
- `test.describe(...)` 116. satırda başlıyor.
- 605. satırda **prematür `});`** ile yanlış kapatılmış.
- 7., 8., 9. testler describe **dışında** kalıyor, 807'de orphan `});`.

**Düzeltme** (bu inceleme sırasında uygulandı):
- `proactive-chat.spec.ts:605` satırındaki orphan `});` kaldırıldı.
- Artık 9 test tek `test.describe` blok'unda.

**Doğrulama**:
```
$ npx playwright test --list
Total: 57 tests in 20 files
```

**Önem**: Bu hata fark edilmeden production'a gitseydi, **CI'daki Playwright job'u sessizce 0 test çalıştırarak yeşil dönüyor olabilirdi** (npm/pnpm exit code'a göre). `PRODUCTION_READINESS.md` "✅ E2E Tests / Playwright / 9 senaryo" demesine rağmen gerçekte hiçbirine bakılmıyordu.

---

## 2. 🟡 KALAN İŞLER (Bloker olmasa da deploy öncesi)

### Ö-1 — Backend integration: 1 test fail

**Failing**: `auth.integration.spec.ts › Auth Flow (Integration) › should register, login, access protected route, and logout`

**Belirti**: Test DB'ye user oluşturuyor (status: ACTIVE, hash 60 char), `POST /api/v1/auth/login` 200 yerine **401 dönüyor**. Diğer 52 integration test geçiyor (users, crm-webhook, crm-dynamics365 + auth'un ikinci testi).

**Olası nedenler** (sıralı önem):
1. `truncateDatabase` FK kısıtları yüzünden kullanıcı tablosunu silemiyor; eski user kalıyor → bcrypt mismatch.
2. JwtAuthGuard global APP_GUARD olarak ayarlı; `@Public()` decorator metadata aktarımı test ortamında gevşek olabilir.
3. ThrottlerGuard mock Lua script return değeri belirsiz şekilde isBlocked davranıyor olabilir.

**Etki**: Auth happy path'i integration düzeyinde doğrulanmıyor. Unit test (`auth.controller.spec.ts`, 471'lik suite içinde) bunu kapsıyor ama gerçek HTTP + Prisma + cookie + ValidationPipe stack'i sadece bu spec'te test ediliyor.

### Ö-2 — `ai.service.spec.ts` ve `ai-query.service.spec.ts` 6 test skip'li

```
apps/backend/src/ai/ai.service.spec.ts:151
  describe.skip('AiService [TODO: mocks need update for current implementation]', ...)
apps/backend/src/ai/tests/ai-query.service.spec.ts:124
  it.skip('should return context from database when similarities are above threshold ...')
```

`PRODUCTION_READINESS.md` bunları "Düşük/Orta öncelik backlog" olarak listeliyor — bu doğru ama:
- `fix(ai)` commit kalıbı 26× — yangın söndürme **tam olarak burada**. Test'siz alanda yapılan fix'lerin regresyon kapısı yok.

### Ö-3 — 7 modül komple test'siz

`config`, `events`, `health`, `metrics`, `prisma`, `rbac`, `whatsapp` — `find apps/backend/src/<module> -name "*.spec.ts"` boş.

User raporundaki "✅ RBAC", "✅ Health Checks" ifadeleri **feature-functional**, test-coverage değil. Production'da çalışıyor olmaları farklı, regresyon korumaları farklı.

**Risk eşleştirmesi**:
- `82d301c security(tickets): fix data isolation bypass caused by role case-sensitivity` — **rbac modülünde** test olsaydı yakalanırdı.
- `9a0b584 fix(production): resolve RBAC omissions, routing errors, and missing initial taxonomy seeds` — yine RBAC.

---

## 3. 🟢 DOĞRULANAN İYİLEŞTİRMELER (review öncesi)

User'ın bugün yaptığı işin sağlamlığı:

1. **Backend e2e altyapısı düzeldi**:
   - `commit 9258977 fix: resolve backend test infrastructure issues`
   - `jest-e2e.json`: `ts-jest → @swc/jest` (OOM kalktı)
   - `transformIgnorePatterns` → `packages/database/client/` Prisma generated kod skip'lendi
   - `globalTeardown.ts` → açık handle warning'leri kayboldu
   - **Önce 0 test / 23 dakika hung → şimdi 53 test / ~14 saniye**.

2. **Skip'li suite'lerin %75'i yeniden aktive edildi**:
   - `commit af1fd4c test: skip'lenmiş test dosyalarını yeniden aktif et`
   - 8 skip → 2 skip
   - `embedding.service.pbt.spec.ts` mock güncellendi (`commit 3c90516`)

3. **Yeni özellik + E2E senaryoları**:
   - `commit 780c03d feat: implement proactive chat system`
   - `commit 2bfed29 / d758f12 test: add comprehensive E2E tests for proactive chat` (9 senaryo)
   - **Ama** syntax hatası bunları çalışmaz hale getirmişti (K-1).

4. **PII redaction, helmet, CSRF, rate limit, audit log** — kod incelemesinde teyit edildi (`apps/backend/src/main.ts:101-180`, `app.module.ts:82-93`).

5. **Pre-boot network audit** (`main.ts:21-70`) — boot öncesi DB+Redis TCP probe yapıyor; production'da değerli.

---

## 4. Yarın için Plan — Deploy'a 3 adım

Token bütçesi tükendi; bugün K-1 düzeltildi (commit'lenecek). Yarın aşağıdaki adımlar:

### Sprint A — Kalan engelleri kapat (½ gün)

**A-1.** Playwright tam koşumu: `pnpm --filter @aluplan/frontend test:e2e` — düzeltilmiş syntax sonrası **57 testin gerçekten geçtiğini** doğrula. Playwright önceki run'larda credentials ve a11y fail vermişti; şimdi user'ın `auth helper` iyileştirmeleriyle (commit `f51a751`) daha iyi durumda olmalı. Fail eden testleri tek tek incele.

**A-2.** `auth.integration.spec.ts` login fail (Ö-1) çöz:
- `truncateDatabase` helper'ını **raw SQL TRUNCATE TABLE ... CASCADE** ile değiştir (FK güvenli).
- Veya test'i unique-email pattern'e (zaten yarım uygulanmış) tam çevir; `truncate` çağrısını `beforeEach`'ten kaldır.

**A-3.** Kalan 2 skip'li dosyayı kapat veya sil:
- `ai.service.spec.ts:151` — describe.skip blok'u: ya mock'ları güncelle, ya açık `// COVERED-BY:` referansıyla sil.
- `ai-query.service.spec.ts:124` — tek `it.skip`, mock setup'ı düzelt.

### Sprint B — Test'siz modüllere minimal kapsam (½ gün)

7 modül × ~20 dakika = ~2.5 saat. Hedef her biri için **1 happy + 1 sad path** unit test:
- `rbac/rbac.guard.spec.ts` — ROLE case-sensitivity regression test (`82d301c` için)
- `health/health.controller.spec.ts` — DB up/down 200/503 senaryosu
- `metrics/metrics.controller.spec.ts` — `/metrics` Prometheus format döndürüyor mu
- `config/env-validation.spec.ts` — eksik env'de boot fail mi
- `events/event-bus.spec.ts` — emit/subscribe round-trip
- `prisma/prisma.service.spec.ts` — `$connect`/`$disconnect` lifecycle
- `whatsapp/whatsapp.controller.spec.ts` — webhook signature validation

### Sprint C — Hijyen + CI gate (1-2 saat)

**C-1.** CI'da **Playwright çıktısının `Total: N tests`** N>0 olduğunu kontrol eden gate ekle. K-1'in tekrarını önler.

**C-2.** ESLint kuralı: `no-unused-disable` + custom **describe.skip / it.skip allowlist**. Whitelisted dışındaki skip'ler PR'da fail etsin.

**C-3.** Backend e2e için `--detectOpenHandles --runInBand` CI mode'da default; performans pahasına stabilite.

**C-4.** `apps/frontend/test-results/` ve `apps/backend/coverage/` cleanup hook (`pre-test` + `post-test`).

---

## 5. Deploy Karar Matrisi

| Senaryo | Karar |
|---|---|
| Yarın Sprint A bitince + tüm Playwright PASS | **Production'a deploy edilebilir** |
| Sprint A bitti ama auth.integration hâlâ fail | Staging'e deploy, prod'a ek doğrulama bekle |
| Sprint A yarım kaldı (örn. 5+ Playwright fail) | Deploy yok; hotfix moduna geç |

---

## 6. Doğrulama Komut Listesi (yarın için)

```bash
# Sprint A öncesi sanity
pnpm typecheck && pnpm lint                                       # baseline temiz mi
pnpm --filter @aluplan/backend test                               # 558 PASS, 6 skip beklenir
pnpm --filter @aluplan/frontend test:unit                         # 92 PASS beklenir

# Sprint A koşumu
pnpm --filter @aluplan/backend test:e2e                           # 53/53 hedefi
pnpm --filter @aluplan/frontend test:e2e                          # 57 PASS hedefi (bugün düzeltildi)

# Hijyen
grep -rn "describe\.skip\|it\.skip" apps/backend/src apps/frontend/src   # 0 hedefi
find apps/backend/src -mindepth 1 -maxdepth 1 -type d \
  -exec sh -c 'find "$1" -name "*.spec.ts" -print -quit | grep -q . || echo "untested: $1"' _ {} \;
```

---

## 7. Bu Review'da Yapılan Tek Değişiklik

```diff
diff --git a/apps/frontend/e2e/proactive-chat.spec.ts b/apps/frontend/e2e/proactive-chat.spec.ts
@@ -602,7 +602,6 @@
             await customer2Context.close();
         }
     });
-});

     test('7. Disconnect Timeout (60s)', async ({ browser }) => {
```

Tek satır silindi. Etkisi: Playwright **0 → 57 test discoverable**.

---

## Sonuç

User raporu içerik bakımından sağlam ama "✅ E2E Tests" satırı **gerçeklik kontrolü yapılmamış** bir iddiaydı. Bir syntax hatası tüm suite'i sessizce kapatıyordu. Bu inceleme:
- Hatayı buldu, düzeltti, doğruladı.
- Backend integration'da 1 fail kaldığını gösterdi.
- Test'siz 7 modülü dokümante etti.

**Yarın Sprint A bittiğinde gerçek "production ready" durumuna ulaşırız.**
