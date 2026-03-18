# GAP RAPORU — Aluplan Support Desk V02
## Coolify Production Deploy — Kesin Sorun Analizi
**Tarih:** 18 Mart 2026 (Güncellenmiş — Gerçek Env Variables ile)
**Sunucu:** http://167.86.84.107:8000/ (Coolify)
**Durum:** Deploy başarısız — 25+ deployment fix commit'i, sorun devam ediyor

---

## ÖZET

Gerçek Coolify environment variables incelendi. Birden fazla kritik sorun tespit edildi. En önemlisi: **Redis URL formatı yanlış** (WRONGPASS hatası kesin), **PORT=3001 ama Dockerfile PORT=4000**, ve **Prisma 7 driverAdapters migration bloğu** hâlâ çözülmemiş.

---

## KRİTİK SORUNLAR (Öncelik Sırasına Göre)

---

### [SORUN-1] Redis URL — WRONGPASS Hatası (KESİN HATA)
**Önem:** KRİTİK — Backend başlamıyor

**Mevcut değer:**
```
REDIS_URL=redis://default:wHkyob0fAuQsTbo6M086RPs83ZN4Ad9yS00v0Qka4YbbxC7MIpMUdfjiIGOUkuyz@mc8wsc4g8s0kcok4w8cco0c4:6379/0
```

**Sorun:** `redis://default:SIFRE@host` formatında `default:` kullanıcı adı var.
`DEPLOYMENT_GUIDE.md`'de bu sorun daha önce yaşandı ve çözüm belgelendi:
> "ioredis kütüphanesinin `redis://default:password@host` formatındaki `default` kullanıcı adını bazı bulut sağlayıcılarında yanlış yoruklayarak şifreyi reddetmesi"

**Düzeltilmiş değer:**
```
REDIS_URL=redis://:wHkyob0fAuQsTbo6M086RPs83ZN4Ad9yS00v0Qka4YbbxC7MIpMUdfjiIGOUkuyz@mc8wsc4g8s0kcok4w8cco0c4:6379/0
```
(`default:` kaldırılıp yerine `:` (boş kullanıcı adı) konuldu)

---

### [SORUN-2] PORT Uyumsuzluğu — Container Ayağa Kalkmıyor
**Önem:** KRİTİK

**Mevcut değer:** `PORT=3001`

**Sorun:**
- `apps/backend/Dockerfile`: `EXPOSE 4000` ve `ENV PORT=4000`
- Coolify'da `PORT=3001` set edilmiş
- `docker-compose.yml` health check: `http://localhost:${PORT:-3001}/api/v1/health`
- Backend `PORT=3001`'de dinliyor ama Dockerfile `4000`'i expose ediyor
- Coolify reverse proxy 4000'e yönlendiriyorsa bağlantı kurulamıyor

**Düzeltme seçenekleri:**
- Ya Coolify'da `PORT=4000` yap
- Ya da `docker-compose.yml`'de `"3001:3001"` sabit port kullan ve Dockerfile'ı `PORT=3001`'e hizala

**Önerilen:** `PORT=4000` — Dockerfile ile tutarlı olsun.

---

### [SORUN-3] Prisma 7 + driverAdapters Migration Bloğu (KESİN HATA)
**Önem:** KRİTİK

**Sorun kökü:**
`packages/database/prisma/schema.prisma`:
```prisma
generator client {
  previewFeatures = ["driverAdapters", ...]  # Bu aktif
}

datasource db {
  provider   = "postgresql"
  # url satırı YOK — Prisma 7 driverAdapters ile url'yi yasaklıyor
}
```

`deploy.sh` bunu `sed` ile geçici olarak çözmeye çalışıyor:
```sh
sed "/provider.*=.*\"postgresql\"/a \  url = env(\"DATABASE_URL\")" "$SCHEMA_FILE" > "$TEMP_SCHEMA"
npx --no-install prisma@6.4.1 migrate deploy --schema "$TEMP_SCHEMA"
```

**Neden başarısız oluyor:**

1. **Alpine Linux'ta `sed -i` davranışı farklı** — GNU sed'in `\a` (append) komutu BusyBox sed'de çalışmıyor. Temp schema boş veya bozuk oluşuyor.

2. **`npx --no-install prisma@6.4.1`** — Runner image'da `prisma@6.4.1` global olarak kurulu (`npm install -g prisma@6.4.1` var) ama `npx --no-install` global binary'yi değil, local `node_modules`'u arıyor. Çakışma var.

3. **Migration schema'nın `migrations/` klasörüne relative path'i** — `TEMP_SCHEMA=/tmp/migration.prisma` konumundan `./packages/database/prisma/migrations/` klasörü görünmüyor. Prisma migration history'yi bulamıyor.

**Kesin çözüm:** `driverAdapters` kaldırılmalı veya migration ayrı bir adımda çalıştırılmalı.

---

### [SORUN-4] RESEND_API_KEY Bozuk Değer
**Önem:** YÜKSEK

**Mevcut değer:**
```
RESEND_API_KEY=re_fupJy99g_BM3sewTw2JtnpG3ezskBSWhB Buraya Resend API anahtarınızı yapıştırın
```

**Sorun:** API key'in sonunda `" Buraya Resend API anahtarınızı yapıştırın"` metni var! Bu bir placeholder açıklaması yanlışlıkla key'e eklenmiş. Email servisi başlarken bu key ile Resend'e bağlanmaya çalışacak ve `401 Unauthorized` alacak.

**Düzeltme:** Sadece key kısmı kalmalı:
```
RESEND_API_KEY=re_fupJy99g_BM3sewTw2JtnpG3ezskBSWhB
```

---

### [SORUN-5] NEXT_INTERNAL_API_URL Eksik — SSR 504 Timeout
**Önem:** YÜKSEK

**Mevcut durum:** `NEXT_INTERNAL_API_URL` env değişkeni **yok**.

**Sorun:** `apps/frontend/src/lib/api.ts`:
```typescript
const SERVER_API = process.env.NEXT_INTERNAL_API_URL ?? CLIENT_API;
// CLIENT_API = "https://api.allplan.net.tr/api/v1"
```

`NEXT_INTERNAL_API_URL` yoksa SSR sırasında frontend, `https://api.allplan.net.tr/api/v1`'e istek atıyor. Docker network içinde bu domain çözümlenemiyor → 504 Gateway Timeout.

**Düzeltme:** Frontend servisine ekle:
```
NEXT_INTERNAL_API_URL=http://aluplan_backend:3001/api/v1
```
(Container adı `aluplan_backend`, port `PORT` değeriyle aynı olmalı)

---

### [SORUN-6] ALLOWED_ORIGINS — Frontend URL Eksik
**Önem:** ORTA

**Mevcut değer:** `ALLOWED_ORIGINS=https://allplan.net.tr`

**Sorun:** `main.ts`'de CORS whitelist:
```typescript
const allowedOrigins = [
    'http://localhost:3000',
    'https://allplan.net.tr',
    'https://api.allplan.net.tr',
    ...ALLOWED_ORIGINS.split(','),
    ...frontendUrl  // = "https://allplan.net.tr"
];
```

Sunucu `http://167.86.84.107:8000/` adresinden erişiliyorsa bu origin whitelist'te yok. Tarayıcıdan yapılan istekler CORS hatası alır.

**Düzeltme:**
```
ALLOWED_ORIGINS=https://allplan.net.tr,http://167.86.84.107:8000
```

---

### [SORUN-7] MinIO Bucket Otomatik Oluşturulmuyor
**Önem:** ORTA

**Mevcut değer:** `STORAGE_BUCKET=attachments`

**Sorun:** MinIO container başlıyor ama `attachments` bucket'ı otomatik oluşturulmuyor. İlk dosya upload'unda `NoSuchBucket` hatası alınır.

---

### [SORUN-8] NODE_ENV Eksik
**Önem:** ORTA

**Mevcut durum:** `NODE_ENV` env değişkeni **yok**.

**Sorun:** `main.ts`'de:
```typescript
const nodeEnv = configService.get<string>('NODE_ENV', 'development');
```
Default `development` olarak çalışır. Bu durumda:
- Production validation (`ENCRYPTION_KEY` kontrolü) **atlanır** — bu aslında şu an için iyi ama production davranışı yok
- Helmet CSP production modda çalışmaz
- CSRF middleware production'da aktif olması gerekirken development modda bypass ediliyor

**Düzeltme:** `NODE_ENV=production` ekle.

---

## DURUM TABLOSU

| # | Sorun | Mevcut Değer | Doğru Değer | Etki |
|---|---|---|---|---|
| 1 | Redis URL | `redis://default:SIFRE@host` | `redis://:SIFRE@host` | Backend başlamıyor |
| 2 | PORT | `3001` | `4000` | Container port mismatch |
| 3 | Prisma migration | `sed` + Prisma 6 bridge | driverAdapters kaldır | Migration çalışmıyor |
| 4 | RESEND_API_KEY | Key + placeholder metin | Sadece key | Email servisi çöküyor |
| 5 | NEXT_INTERNAL_API_URL | Yok | `http://aluplan_backend:PORT/api/v1` | SSR 504 timeout |
| 6 | ALLOWED_ORIGINS | Sadece allplan.net.tr | + IP adresi | CORS hatası |
| 7 | MinIO bucket | Otomatik yok | Init container gerekli | Upload hatası |
| 8 | NODE_ENV | Yok (development) | `production` | Yanlış mod |

---

## UYGULAMA PLANI

### Faz 1 — Hızlı Env Düzeltmeleri (Coolify Dashboard, ~15 dk)

Coolify'da şu değişiklikleri yap:

```env
# 1. Redis — default: prefix kaldır
REDIS_URL=redis://:wHkyob0fAuQsTbo6M086RPs83ZN4Ad9yS00v0Qka4YbbxC7MIpMUdfjiIGOUkuyz@mc8wsc4g8s0kcok4w8cco0c4:6379/0

# 2. Port — Dockerfile ile hizala
PORT=4000

# 3. Resend — placeholder metni kaldır
RESEND_API_KEY=re_fupJy99g_BM3sewTw2JtnpG3ezskBSWhB

# 4. SSR internal URL — container adı ile
NEXT_INTERNAL_API_URL=http://aluplan_backend:4000/api/v1

# 5. NODE_ENV
NODE_ENV=production

# 6. CORS — IP ekle
ALLOWED_ORIGINS=https://allplan.net.tr,http://167.86.84.107:8000
```

### Faz 2 — Prisma Köklü Fix (Kod değişikliği, ~1 saat)

`packages/database/prisma/schema.prisma` dosyasını düzenle:

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../client"
  binaryTargets   = ["native", "linux-musl-openssl-3.0.x"]
  # driverAdapters KALDIRILDI
  # engineType KALDIRILDI
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")   # GERİ EKLENDİ
  extensions = [uuid_ossp(map: "uuid-ossp", schema: "public"), vector(schema: "public")]
}
```

`apps/backend/src/prisma/prisma.service.ts` dosyasını düzenle:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
            errorFormat: 'pretty',
        });
    }

    async onModuleInit() {
        await this.$connect();
        // Dynamic patches
        try {
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "provider" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "model" TEXT;`);
        } catch (e: any) {
            this.logger.warn(`Dynamic schema patch skipped: ${e.message}`);
        }
        this.logger.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
```

`apps/backend/scripts/deploy.sh` dosyasını sadeleştir:

```sh
#!/bin/sh
set -e

echo "--- Starting Deployment ---"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema ./packages/database/prisma/schema.prisma

echo "Starting application..."
node apps/backend/dist/src/main.js
```

### Faz 3 — MinIO Bucket Init (docker-compose.yml, ~15 dk)

`docker-compose.yml`'e ekle:

```yaml
  minio-init:
    image: minio/mc:latest
    container_name: aluplan_minio_init
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 10;
      mc alias set local http://minio:9000 $${MINIO_ROOT_USER} $${MINIO_ROOT_PASSWORD};
      mc mb --ignore-existing local/$${STORAGE_BUCKET};
      mc anonymous set download local/$${STORAGE_BUCKET};
      echo 'MinIO bucket ready.';
      exit 0;
      "
    networks:
      - aluplan_net
```

### Faz 4 — Dockerfile binaryTargets Fix

Alpine Linux'ta Prisma native binary için `linux-musl-openssl-3.0.x` target gerekli:

```prisma
binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
```

---

## ONAY BEKLENİYOR

Hangi fazdan başlamak istiyorsunuz?

**A) Sadece Faz 1** — Env değişkenlerini düzelt, redeploy et. Prisma sorunu devam edebilir ama diğer hatalar kapanır. (~15 dk, kod değişikliği yok)

**B) Faz 1 + Faz 2** — Env fix + Prisma köklü çözüm. En güvenli yol. (~1.5 saat, kod değişikliği var)

**C) Tüm Fazlar** — Tam production-ready deploy. (~2 saat)

Onay verirseniz seçtiğiniz fazı hemen uygulayabilirim.
