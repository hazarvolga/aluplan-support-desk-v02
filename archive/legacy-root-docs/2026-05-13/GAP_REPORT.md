# GAP Raporu — Allplan Support Desk
**Tarih:** 26 Nisan 2026  
**Kapsam:** E2E (Playwright) + Backend Unit/PBT + Frontend Unit  
**Durum:** Deploy öncesi kalite değerlendirmesi

---

## 1. ÖZET TABLO

| Katman | Toplam Alan | Test Var | Test Yok | Kapsam % |
|--------|-------------|----------|----------|----------|
| Backend modülleri | 30 | 21 | 9 | ~70% |
| E2E senaryolar | 19 dosya | 19 | 0 | 100% dosya var |
| Yeni feature E2E | 3 feature | 1 kısmi | 2 eksik | ~33% |
| Frontend unit | ~15 sayfa/component | 6 | ~9 | ~40% |

---

## 2. KRİTİK AÇIKLAR (Blocker)

### GAP-1 — Announcement Notifications: E2E eksik (YENİ FEATURE)
**Risk: YÜKSEK**

`announcement.spec.ts` sadece admin broadcast akışını test ediyor. Yeni geliştirilen 3 alt özellik hiç test edilmemiş:

| Eksik Senaryo | İlgili Requirement |
|---|---|
| Customer WebSocket toast alıyor mu? (`ANNOUNCEMENT_RECEIVED`) | Req 2.3, 2.4 |
| Sidebar bell badge unread count gösteriyor mu? | Req 4.2, 4.3, 4.6 |
| Archive drawer açılıyor, pagination çalışıyor mu? | Req 3.4, 3.10 |
| Mark-as-read → badge azalıyor mu? | Req 3.6, 4.5 |
| Toast "View" butonu archive'ı açıp scroll ediyor mu? | Req 2.5 |

---

### GAP-2 — Attachment Vision Support: E2E eksik (YENİ FEATURE)
**Risk: YÜKSEK**

`attachment.spec.ts` sadece dosya yükleme + thread görüntülemeyi test ediyor. Vision analizi hiç test edilmemiş:

| Eksik Senaryo | İlgili Requirement |
|---|---|
| Görsel attachment yüklenince AI analizi tetikleniyor mu? | Vision spec |
| Analiz sonucu ticket thread'de görünüyor mu? | Vision spec |
| Desteklenmeyen dosya tipi hata veriyor mu? | Vision spec |

---

### GAP-3 — WhatsApp modülü: 0 test
**Risk: ORTA**

`apps/backend/src/whatsapp/` — controller, service, module var ama hiç spec yok.  
`whatsapp-config.spec.ts` sadece UI config sayfasını test ediyor, backend logic'i test etmiyor.

---

### GAP-4 — Backend modülleri: 0 test
**Risk: ORTA**

| Modül | Neden Önemli |
|---|---|
| `health` | Deploy sağlık kontrolü — test yok |
| `metrics` | Prometheus/OpenTelemetry — test yok |
| `rbac` | Yetkilendirme çekirdeği — test yok |
| `config` | Env validation — test yok |
| `events` | Event bus — test yok |
| `whatsapp` | Yukarıda belirtildi |

---

### GAP-5 — `CustomerAnnouncementsController` integration test eksik
**Risk: ORTA**

Task 4.6 (`tasks.md`) hâlâ `[ ]` (tamamlanmadı):
- `GET /announcements/my` — JWT 401 kontrolü
- `GET /announcements/my/unread-count` — DB state doğrulaması  
- `PATCH /announcements/logs/:logId/read` — 403/200/404 senaryoları

---

## 3. ORTA RİSK AÇIKLAR

### GAP-6 — Frontend unit test eksikleri

| Component/Store | Durum |
|---|---|
| `useAnnouncementStore` state transitions | Task 6.3 `[ ]` — eksik |
| `GlobalAnnouncementNotification` | Task 7.3 `[ ]` — eksik |
| Sidebar badge display (Property 10) | Task 8.4 `[ ]` — eksik |
| `AnnouncementArchiveDrawer` | Task 9.6 `[~]` — kısmi |

---

### GAP-7 — E2E auth helper tutarsızlığı
**Risk: DÜŞÜK-ORTA**

`helpers/auth.ts` içindeki `loginAsAdmin` fonksiyonu `e2e-test@aluplan.com / pass123` kullanıyor.  
Diğer testler `hazarvolga@gmail.com / E2E-Only-Not-A-Secret-2026!` kullanıyor.
Seed'de `e2e-test@aluplan.com` yoksa auth testleri başarısız olur.

---

### GAP-8 — `a11y.spec.ts` authenticated dashboard testleri
**Risk: DÜŞÜK**

`test.beforeEach` içinde `test@example.com / testpassword` kullanıyor — bu kullanıcı seed'de yok.  
Dashboard ve Tickets a11y testleri her zaman başarısız olur.

---

### GAP-9 — `smoke.spec.ts` staging URL'e bağımlı
**Risk: DÜŞÜK**

`STAGING_URL` env var yoksa `https://staging.allplan.net.tr`'ye bağlanıyor.  
Local CI'da çalışmaz.

---

### GAP-10 — `email-reply.spec.ts` yarım kalmış
**Risk: DÜŞÜK**

`EmailInboundService` için public endpoint yok, test "simulate" yorumuyla bırakılmış.  
Gerçek inbound email threading test edilemiyor.

---

## 4. MEVCUT GÜÇLÜ YANLAR

| Alan | Durum |
|---|---|
| AI pipeline | 20 spec dosyası, PBT dahil — çok iyi |
| Announcements backend | 31 test (19 unit + 12 PBT) — tamamlandı |
| Ticket lifecycle E2E | Hybrid API+UI — sağlam |
| Auth E2E | Login/error/redirect — kapsıyor |
| CRM | 6 spec — en kapsamlı domain dışı modül |
| Prisma schema | `readAt` migration tamamlandı |

---

## 5. DEPLOY ÖNCESİ ÖNCELİK SIRASI

```
P0 (Blocker)     → GAP-1: Announcement E2E (toast + badge + archive)
P0 (Blocker)     → GAP-2: Vision attachment E2E
P1 (Önemli)      → GAP-5: CustomerAnnouncementsController integration test
P1 (Önemli)      → GAP-6: Frontend unit testler (store + components)
P2 (İyi olur)    → GAP-3: WhatsApp backend unit test
P2 (İyi olur)    → GAP-7: Auth helper seed tutarlılığı
P3 (Teknik borç) → GAP-4: health/metrics/rbac/config testleri
P3 (Teknik borç) → GAP-8: a11y authenticated testler
```

---

## 6. TAVSİYE

E2E testleri çalıştırmadan önce **P0 açıklarını** kapatmak gerekiyor.  
Aksi hâlde announcement ve vision feature'larının production'da çalışıp çalışmadığını doğrulayamayız.

Eğer zaman kısıtlıysa minimum viable path:
1. GAP-5 → `CustomerAnnouncementsController` integration test (1-2 saat)
2. GAP-1 → Announcement E2E'ye 3-4 yeni test case ekle (2-3 saat)
3. Sonra full E2E koştur
