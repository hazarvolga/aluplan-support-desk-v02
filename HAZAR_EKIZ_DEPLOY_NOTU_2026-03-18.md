# Hazar Ekiz'e Deploy Notu
**Tarih:** 18 Mart 2026  
**Proje:** Aluplan Support Desk V02  
**Sunucu:** http://167.86.84.107:8000/ (Coolify)  
**Hazırlayan:** Kiro AI — Kod + Commit + Env analizi sonucu

---

## Ne Durumdasın?

Local'de her şey çalışıyor. E2E testler geçiyor. Ama Coolify'da deploy 25+ commit'e rağmen hâlâ başarısız. Aşağıda tam olarak ne yanlış, ne yapman gerekiyor, sırayla yazdım.

---

## HEMEN DÜZELTİLECEKLER (Coolify Dashboard — Kod Değişikliği Yok)

Coolify'da servisinin Environment Variables bölümüne gir, şu 6 değişikliği yap, redeploy et.

### 1. Redis URL — `default:` prefix'ini kaldır

**Şu an (YANLIŞ):**
```
REDIS_URL=redis://default:wHkyob0fAuQsTbo6M086RPs83ZN4Ad9yS00v0Qka4YbbxC7MIpMUdfjiIGOUkuyz@mc8wsc4g8s0kcok4w8cco0c4:6379/0
```

**Olması gereken (DOĞRU):**
```
REDIS_URL=redis://:wHkyob0fAuQsTbo6M086RPs83ZN4Ad9yS00v0Qka4YbbxC7MIpMUdfjiIGOUkuyz@mc8wsc4g8s0kcok4w8cco0c4:6379/0
```

`default:` kısmını sil, sadece `:` (iki nokta) bırak. `ioredis` bu formatı yanlış parse ediyor ve `WRONGPASS` hatası veriyor. Bu sorun daha önce de yaşandı, DEPLOYMENT_GUIDE.md'de bile yazıyor ama env'e yanlış girilmiş.

---

### 2. PORT — 3001 değil, 4000 olmalı

**Şu an (YANLIŞ):**
```
PORT=3001
```

**Olması gereken (DOĞRU):**
```
PORT=4000
```

Dockerfile `EXPOSE 4000` ve `ENV PORT=4000` diyor. Sen 3001 set etmişsin. Container ayağa kalkıyor ama yanlış portta dinliyor, Coolify reverse proxy bağlanamıyor.

---

### 3. RESEND_API_KEY — Sonundaki metni sil

**Şu an (YANLIŞ):**
```
RESEND_API_KEY=re_fupJu99g_BM3sewTw2JtnpG3ezskBSWhB Buraya Resend API anahtarınızı yapıştırın
```

**Olması gereken (DOĞRU):**
```
RESEND_API_KEY=re_fupJu99g_BM3sewTw2JtnpG3ezskBSWhB
```

Key'in sonuna placeholder açıklaması yapışmış. Email servisi bu yüzden başlarken `401 Unauthorized` alıyor ve çöküyor.

---

### 4. NEXT_INTERNAL_API_URL — Eksik, ekle

**Şu an:** Yok

**Ekle:**
```
NEXT_INTERNAL_API_URL=http://aluplan_backend:4000/api/v1
```

Bu olmadan Next.js SSR sırasında `https://api.allplan.net.tr`'ye istek atmaya çalışıyor. Docker network içinde bu domain çözümlenemiyor → 504 Gateway Timeout. `api.ts` dosyasında bu değişken için kod zaten var, sadece env eksik.

---

### 5. NODE_ENV — Eksik, ekle

**Şu an:** Yok (default: `development` olarak çalışıyor)

**Ekle:**
```
NODE_ENV=production
```

---

### 6. ALLOWED_ORIGINS — IP adresini ekle

**Şu an:**
```
ALLOWED_ORIGINS=https://allplan.net.tr
```

**Olması gereken:**
```
ALLOWED_ORIGINS=https://allplan.net.tr,http://167.86.84.107:8000
```

Sunucu IP'si üzerinden erişirken CORS hatası alırsın.

---

## KOD DEĞİŞİKLİĞİ GEREKTİREN SORUN (Prisma)

Yukarıdaki env düzeltmelerini yaptıktan sonra deploy hâlâ başarısız olursa bu adıma geç.

### Sorun: Prisma 7 + driverAdapters + Alpine sed = Kırık Migration

`deploy.sh` şu anda şunu yapıyor:
```sh
sed "/provider.*=.*\"postgresql\"/a \  url = env(\"DATABASE_URL\")" "$SCHEMA_FILE" > "$TEMP_SCHEMA"
npx --no-install prisma@6.4.1 migrate deploy --schema "$TEMP_SCHEMA"
```

Alpine Linux'ta BusyBox `sed`, GNU `sed`'in `\a` (append) komutunu desteklemiyor. Temp schema ya boş oluşuyor ya da bozuk. Migration çalışmıyor.

**Köklü çözüm — 3 dosyada değişiklik:**

#### `packages/database/prisma/schema.prisma`
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../client"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp(map: "uuid-ossp", schema: "public"), vector(schema: "public")]
}
```
`driverAdapters` ve `engineType` satırlarını kaldır, `url` satırını geri ekle, `linux-musl-openssl-3.0.x` binary target ekle (Alpine için zorunlu).

#### `apps/backend/src/prisma/prisma.service.ts`
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
            errorFormat: 'pretty',
        });
    }

    async onModuleInit() {
        await this.$connect();
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
`@prisma/adapter-pg` ve `Pool` import'larını kaldır, standart `PrismaClient` kullan.

#### `apps/backend/scripts/deploy.sh`
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
`sed` + Prisma 6 version bridge'i tamamen kaldır. Artık gerek yok.

---

## ÖNERİLEN SIRALAMA

```
Adım 1 → Coolify'da 6 env değişikliğini düzelt
Adım 2 → Redeploy et, container loglarına bak
Adım 3 → Hâlâ hata varsa Prisma kod değişikliğini uygula
Adım 4 → git commit + push + redeploy
```

---

## HIZLI TANI — Log'da Ne Görüyorsun?

| Log mesajı | Sorun | Çözüm |
|---|---|---|
| `WRONGPASS` | Redis URL'de `default:` var | Sorun-1 |
| `EADDRINUSE` veya port hatası | PORT mismatch | Sorun-2 |
| `401` email hatası | RESEND_API_KEY bozuk | Sorun-3 |
| `504 Gateway Timeout` | NEXT_INTERNAL_API_URL eksik | Sorun-4 |
| `sh: prisma: not found` | deploy.sh sed/npx sorunu | Prisma kod fix |
| `P1001: Can't reach database` | DATABASE_URL yanlış host | Coolify DB servis adı kontrol et |
| `❌ CRITICAL: Missing ENCRYPTION_KEY` | NODE_ENV=production ama key yok | ENCRYPTION_KEY var, NODE_ENV ekle |

---

## NOTLAR

- `ENCRYPTION_KEY` zaten set edilmiş, sorun yok.
- `JWT_SECRET` ve `JWT_REFRESH_SECRET` set edilmiş, sorun yok.
- `DATABASE_URL` Coolify internal hostname kullanıyor (`lwk8ok04ocg4w4soog0c888g`) — bu Coolify'ın kendi DNS'i, doğru.
- `STORAGE_ENDPOINT=http://aluplan-support-ai-minio:9000` — MinIO container adı bu, `docker-compose.yml`'deki `aluplan_minio` ile eşleşmiyor. Coolify ayrı bir MinIO servisi mi çalıştırıyor kontrol et.
- MinIO bucket `attachments` otomatik oluşturulmuyor. İlk upload'da hata alırsın. Coolify'da MinIO terminalinden `mc mb local/attachments` çalıştır.

---

*Bu not Kiro AI tarafından kod tabanı, commit geçmişi ve gerçek Coolify environment variables analizi sonucu oluşturulmuştur.*  
*18 Mart 2026*
