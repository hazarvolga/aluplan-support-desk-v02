# Aluplan Support Desk - Deployment & Infrastructure Guide

Bu belge, projenin canlı ortama (Coolify/Docker) taşınması sırasında karşılaşılan kritik engelleri, uygulanan çözümleri ve gelecekteki dağıtımlar için güvenli adımları özetler.

## 🏁 "Büyük 5" Uygulama Tuzağı ve Çözümleri

### 1. Prisma Şema Sapması (Database Divergence)
*   **Sorun**: Local ve Production şemaları arasındaki `announcements`, `sla_warning_sent_at` gibi yeni eklenen alanların SQL migrasyonlarına yansımaması sonucu NestJS'in çökmesi.
*   **Çözüm**: `packages/database/prisma/migrations` klasörü manuel olarak denetlendi. Eksik alanlar için ham SQL migrasyonları (`20260303...`) oluşturuldu. Docker başlatma komutu (`CMD`) içine `npx prisma migrate deploy` zorunlu hale getirildi.

### 2. Redis Kimlik Doğrulama (ioredis `WRONGPASS`)
*   **Sorun**: `ioredis` kütüphanesinin `redis://default:password@host` formatındaki `default` kullanıcı adını bazı bulut sağlayıcılarında (Coolify/Redis Stack) yanlış yorumlayarak şifreyi reddetmesi.
*   **Çözüm**: `REDIS_URL` değişkeninden `default:` kullanıcı adı temizlendi (`redis://password@host`).

### 3. MJML Import Interop (CJS vs ESM)
*   **Sorun**: `mjml` kütüphanesinin TypeScript/NestJS ortamında `(0, mjml_1.default) is not a function` hatasıyla runtime'da çökmesi. Bu hata frontend'e detay iletmediği için login/previvew gibi işlemlerde 400 hatası olarak görünüyordu.
*   **Çözüm**: `email.templates.ts` içinde `require('mjml')` ile dinamik interop guard uygulandı. Kütüphane tipi çalışma zamanında kontrol edilerek doğru fonksiyon çağrısı sağlandı.

### 4. Next.js Internal Docker DNS (504 Gateway Timeout)
*   **Sorun**: Frontend'in Server-Side Rendering (SSR) sırasında Backend'e gitmeye çalışırken `localhost:4000` kullanması ve Docker içindeki izole network nedeniyle bağlantının zaman aşımına uğraması.
*   **Çözüm**: `apps/frontend/src/lib/api.ts` içinde hibrit URL mantığı kuruldu. `typeof window === 'undefined'` (Sunucu tarafı) ise `NEXT_INTERNAL_API_URL` (Docker konteyner adı örn: `backend:3001`), tarayıcı tarafı ise standart public URL kullanılıyor.

### 5. Bcrypt Native Compatibility
*   **Sorun**: `bcrypt` kütüphanesinin Alpine Linux (Docker) ortamında Python/C++ build dependency gerektirmesi ve çoğu zaman runtime mismatch ile hata vermesi.
*   **Çözüm**: Tüm proje `bcrypt` yerine saf JS implementasyonu olan `bcryptjs` kütüphanesine taşındı.

---

## 🚀 Canlıya Geçiş (Sync-to-Live) Prosedürü

Eğer yerel geliştirmedeki verileri ve şemayı canlıya taşımak isterseniz:

1.  **Repo Sync**: `git push origin main` ile son kodları gönderin.
2.  **Veritabanı Senkronizasyonu**:
    *   `/scripts/sync-to-live.sh` scriptini kullanarak local DB yedeğini alın.
    *   Coolify Dashboard üzerinden Postgres terminaline girip `RECREATE public schema` komutunu çalıştırın (Veya `RESET_DB_ON_START=true` flag'ini kullanın).
3.  **Çevre Değişkenleri**:
    *   `NEXT_INTERNAL_API_URL` değişkeninin backend konteyner adını (örn: `http://aluplan-backend:3001`) işaret ettiğinden emin olun.
    *   `MAIL_PROVIDER` ve `RESEND_API_KEY` değerlerini kontrol edin.

## 🛠️ Tanı Araçları
*   **API Echo**: `/api/v1/email/debug/echo` (Geçici olarak kullanıldı, silindi).
*   **Global Error Log**: `apps/backend/global-debug-errors.log` (Sadece derin debug için aktif edilir).
