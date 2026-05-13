---
name: aluplan-db-prisma
description: >
  Aluplan Support Desk projesinde PostgreSQL, Prisma ORM ve genel veritabanı yönetimi
  iyileştirmeleri için kapsamlı rehber. Şu durumlarda MUTLAKA bu skill'i kullan:
  Prisma schema değişikliği, migration yazımı, soft-delete implementasyonu, connection
  pool ayarı, query optimizasyonu, index ekleme, transaction yönetimi, seed/fixture
  oluşturma, DB audit logging, Prisma extension yazımı, veya "database neden yavaş",
  "migration nasıl", "soft delete ekle", "pool ayarı" gibi ifadeler geçtiğinde.
  GAP-14, GAP-19, GAP-20, GAP-30 ve benzeri DB kaynaklı açık/kapalı GAP'ler için
  de bu skill'i kullan.
---

# Aluplan DB & Prisma Skill

## Proje Bağlamı

**Stack**: NestJS (backend) + Prisma ORM + PostgreSQL  
**Repo**: `aluplan-support-desk-V02`  
**Kritik tamamlanan GAP'ler (DB ile ilgili)**:
- GAP-14: Soft-delete extension düzeltildi (`ef4400f`)
- GAP-19: FaqEntry / Macro / Announcement soft-delete'e geçirildi (`session-20260509`)
- GAP-20: DB pool `max:100 → 20-30` (`ef4400f`)
- GAP-13: automation.service ConfigService bypass düzeltildi

**Hâlâ açık**:
- GAP-30: FaqService üzerinden tek nokta mimari refactor

---

## Karar Ağacı — Neye Bakacağım?

```
DB ile ilgili bir görev mi?
│
├── Schema değişikliği / yeni model    → Bkz. §1 Schema Standartları
├── Migration oluştur / uygula         → Bkz. §2 Migration Yönetimi
├── Soft-delete ekle / düzelt          → Bkz. §3 Soft-Delete Paterni
├── Connection pool / performans       → Bkz. §4 Pool & Bağlantı Yönetimi
├── Yavaş sorgu / N+1 / index          → Bkz. §5 Query Optimizasyonu
├── Transaction / atomik işlem         → Bkz. §6 Transaction Paterni
├── Seed / test verisi                 → Bkz. §7 Seed & Fixtures
├── Audit log / değişiklik takibi      → Bkz. §8 Audit Logging
├── Prisma extension / middleware      → Bkz. §9 Prisma Extensions
└── GAP-30 FaqService refactor         → Bkz. references/gap30-faqservice.md
```

---

## §1 — Schema Standartları

### Zorunlu Alanlar (her model için)

```prisma
model ExampleEntity {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Soft-delete için (eğer silinebilir içerikse)
  deletedAt DateTime?

  @@map("example_entities")   // snake_case tablo adı
}
```

**Kurallar:**
- `id`: her zaman `String @id @default(cuid())` — UUID yerine CUID tercih et (collision daha düşük, URL-safe)
- `@@map`: tablo adları daima `snake_case`
- Enum değerleri `SCREAMING_SNAKE_CASE`
- İlişki alanları: `@@index([foreignKeyId])` ekle (Prisma bunu otomatik yapmaz)
- `Boolean` alanlar: default değer her zaman açık belirtilmeli (`@default(false)`)

### Index Standartları

```prisma
// Tek alan index
@@index([tenantId])

// Bileşik index — sıralama önemli (en seçici alan başa)
@@index([tenantId, createdAt])

// Unique constraint
@@unique([tenantId, email])

// Soft-delete ile birlikte — deletedAt null olanları hızlı filtrele
@@index([deletedAt, tenantId])
```

---

## §2 — Migration Yönetimi

### Standart Akış

```bash
# 1. Schema değişikliğini yap
# 2. Migration oluştur (isim: snake_case, açıklayıcı)
pnpm prisma migrate dev --name add_soft_delete_to_faq_entry

# 3. Migration dosyasını gözden geçir (prisma/migrations/<timestamp>_*/migration.sql)
# 4. Üretim ortamına deploy
pnpm prisma migrate deploy

# 5. Client'ı yenile
pnpm prisma generate
```

### Tehlikeli Migration'lar — Checklist

Aşağıdaki durumlarda migration'ı `--create-only` ile oluştur, SQL'i elle düzenle:

| Durum | Risk | Çözüm |
|-------|------|-------|
| `ALTER COLUMN` type change | Veri kaybı | Shadow table + data migration |
| `NOT NULL` ekleme | Mevcut satırlar kırılır | Önce `DEFAULT` ekle, sonra `NOT NULL` |
| Büyük tablo `ADD INDEX` | Tablo lock | `CREATE INDEX CONCURRENTLY` kullan |
| Kolon silme | Geri dönülemez | Önce uygulama kodundan kaldır, sonra schema'dan |

```bash
# Sadece SQL üret, uygulamadan önce gözden geçir
pnpm prisma migrate dev --name risky_change --create-only
```

### Migration Geri Alma

Prisma `down migration` desteklemez. Geri alma için:
1. Yeni bir `fix_` migration yaz
2. Veya `prisma migrate resolve --rolled-back <migration_name>`

---

## §3 — Soft-Delete Paterni

> GAP-14 ve GAP-19 ile kurulan pattern. Yeni modeller eklenirken aynı yapıyı izle.

### Prisma Extension (mevcut — `prisma/extensions/soft-delete.ts`)

```typescript
import { Prisma } from '@prisma/client';

export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',
  model: {
    $allModels: {
      async softDelete<T>(
        this: T,
        where: Prisma.Args<T, 'update'>['where'],
      ) {
        const context = Prisma.getExtensionContext(this);
        return (context as any).update({
          where,
          data: { deletedAt: new Date() },
        });
      },
      async softDeleteMany<T>(
        this: T,
        where: Prisma.Args<T, 'updateMany'>['where'],
      ) {
        const context = Prisma.getExtensionContext(this);
        return (context as any).updateMany({
          where,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
  query: {
    $allModels: {
      // deletedAt alanı olan modellerde otomatik filtrele
      async findMany({ model, operation, args, query }) {
        const modelHasSoftDelete = await hasSoftDelete(model);
        if (modelHasSoftDelete) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        const modelHasSoftDelete = await hasSoftDelete(model);
        if (modelHasSoftDelete) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async count({ model, operation, args, query }) {
        const modelHasSoftDelete = await hasSoftDelete(model);
        if (modelHasSoftDelete) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
    },
  },
});
```

### Yeni Modele Soft-Delete Ekleme Adımları

1. Schema'ya `deletedAt DateTime?` ekle
2. `@@index([deletedAt])` ekle
3. Migration çalıştır
4. Service katmanında `delete()` yerine `softDelete()` kullan
5. Test: `deletedAt IS NOT NULL` olan kayıtların sorgularda gelmediğini doğrula

### Soft-Delete ile "Gerçek" Silme (Admin)

```typescript
// Gerçek silme sadece admin context'inde
async hardDelete(id: string): Promise<void> {
  await this.prisma.$executeRaw`
    DELETE FROM faq_entries WHERE id = ${id}
  `;
}
```

---

## §4 — Pool & Bağlantı Yönetimi

> GAP-20: `max:100 → 20-30` düzeltildi. Aşağıdaki değerler mevcut standart.

### PrismaService Konfigürasyonu

```typescript
// src/database/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: configService.get('NODE_ENV') === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### DATABASE_URL Pool Parametreleri

```env
# .env (veya env schema'da zorunlu olarak tanımla)
DATABASE_URL="postgresql://user:pass@host:5432/aluplan_db?schema=public&connection_limit=20&pool_timeout=10&connect_timeout=10"
```

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `connection_limit` | 20 | Uygulama başına max bağlantı |
| `pool_timeout` | 10 | Bağlantı beklenme süresi (sn) |
| `connect_timeout` | 10 | İlk bağlantı timeout (sn) |

**Çoklu instance çalışıyorsa** (ör. 3 pod): toplam = 3 × 20 = 60 bağlantı → PostgreSQL `max_connections` değerinin altında kalmalı (genellikle 100).

### Bağlantı Sağlığı Kontrolü

```typescript
// health check endpoint için
async checkDatabaseHealth(): Promise<boolean> {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
```

---

## §5 — Query Optimizasyonu

### N+1 Tespit & Çözüm

```typescript
// ❌ N+1: Her ticket için ayrı sorgu
const tickets = await this.prisma.ticket.findMany();
for (const ticket of tickets) {
  const customer = await this.prisma.customer.findUnique({ where: { id: ticket.customerId } });
}

// ✅ Eager loading ile tek sorgu
const tickets = await this.prisma.ticket.findMany({
  include: {
    customer: true,
    assignee: { select: { id: true, name: true, email: true } }, // sadece gerekli alanlar
  },
});
```

### Büyük Listeler — Cursor-Based Pagination

```typescript
// ❌ Offset pagination — büyük tablolarda yavaş
findMany({ skip: 1000, take: 20 })

// ✅ Cursor pagination
async findPaginated(cursor?: string, take = 20) {
  return this.prisma.ticket.findMany({
    take,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' },
    where: { deletedAt: null },
  });
}
```

### Raw Query (Sadece Gerektiğinde)

```typescript
// Karmaşık agregasyon için
const stats = await this.prisma.$queryRaw<Array<{category: string; count: bigint}>>`
  SELECT category, COUNT(*) as count
  FROM tickets
  WHERE deleted_at IS NULL
    AND tenant_id = ${tenantId}
  GROUP BY category
`;
// BigInt → number dönüşümü
return stats.map(s => ({ ...s, count: Number(s.count) }));
```

### Query Analizi

```bash
# Yavaş sorguları bul (PostgreSQL'de)
# pg_stat_statements extension gerekli
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- 100ms üzeri
ORDER BY mean_exec_time DESC
LIMIT 20;

# EXPLAIN ANALYZE ile incele
EXPLAIN ANALYZE SELECT * FROM tickets WHERE tenant_id = 'xxx' AND deleted_at IS NULL;
```

---

## §6 — Transaction Paterni

### İnteraktif Transaction (Tercih Edilen)

```typescript
async createTicketWithAudit(dto: CreateTicketDto, actorId: string) {
  return this.prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({ data: dto });

    await tx.auditLog.create({
      data: {
        entityType: 'Ticket',
        entityId: ticket.id,
        action: 'CREATE',
        actorId,
        snapshot: JSON.stringify(ticket),
      },
    });

    return ticket;
  }, {
    timeout: 10000,      // 10 sn timeout
    maxWait: 5000,       // bağlantı beklenme süresi
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  });
}
```

### Batch Transaction (Sıralı Bağımsız İşlemler)

```typescript
// Sıralı ama bağımsız işlemler için — daha hızlı
const [updated, logged] = await this.prisma.$transaction([
  this.prisma.ticket.update({ where: { id }, data: { status: 'CLOSED' } }),
  this.prisma.auditLog.create({ data: { ... } }),
]);
```

---

## §7 — Seed & Fixtures

### Seed Dosyası Yapısı (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // İdempotent — her çalıştırmada güvenli
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Demo Tenant',
      plan: 'PRO',
    },
  });

  console.log('Seed tamamlandı:', { tenant });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

```bash
pnpm prisma db seed
```

### Test Fixtures (Jest)

```typescript
// test/fixtures/ticket.fixture.ts
export const createTicketFixture = (overrides = {}) => ({
  id: 'test-ticket-id',
  title: 'Test Ticket',
  status: 'OPEN',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});
```

---

## §8 — Audit Logging

### Schema

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  entityType String   // 'Ticket', 'FaqEntry', vb.
  entityId   String
  action     String   // 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  actorId    String?
  tenantId   String
  snapshot   Json?    // değişiklik öncesi/sonrası
  diff       Json?    // sadece değişen alanlar

  @@index([entityType, entityId])
  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

### AuditService

```typescript
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
    actorId?: string;
    tenantId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }) {
    const diff = params.before && params.after
      ? computeDiff(params.before, params.after)
      : null;

    await this.prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorId: params.actorId,
        tenantId: params.tenantId,
        snapshot: params.after ?? params.before ?? null,
        diff,
      },
    });
  }
}

function computeDiff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changed[key] = { from: before[key], to: after[key] };
    }
  }
  return Object.keys(changed).length ? changed : null;
}
```

---

## §9 — Prisma Extensions

> Mevcut extension: `soft-delete` (bkz. §3). Yeni extension eklerken:

```typescript
// prisma/extensions/index.ts
import { softDeleteExtension } from './soft-delete';
import { auditExtension } from './audit';        // varsa

export const prismaExtensions = [
  softDeleteExtension,
  // auditExtension,
];

// database/prisma.service.ts içinde
this.$extends(softDeleteExtension);
```

**Extension Yazma Kuralları:**
- Her extension tek bir sorumluluğa odaklanmalı
- `$allModels` kullanırken `modelHasSoftDelete()` gibi guard fonksiyon ekle
- Extension'lar tip güvenliğini bozmamalı — `as any` sadece Prisma internal API'de kabul edilir

---

## §10 — GAP-30 Hazırlık Notu

> FaqService üzerinden tek nokta mimari refactor hâlâ açık.

Detaylı adımlar için: **`references/gap30-faqservice.md`** dosyasını oku.

---

## Sık Kullanılan Komutlar

```bash
# Schema → client yenile
pnpm prisma generate

# Migration oluştur
pnpm prisma migrate dev --name <isim>

# Üretim migrate
pnpm prisma migrate deploy

# DB durumu kontrol
pnpm prisma migrate status

# Prisma Studio (görsel)
pnpm prisma studio

# Schema format
pnpm prisma format

# Seed çalıştır
pnpm prisma db seed

# Tüm tabloları sıfırla (sadece dev!)
pnpm prisma migrate reset
```

---

## Hata Rehberi

| Hata | Sebep | Çözüm |
|------|-------|-------|
| `P2002` UniqueConstraintFailed | Duplicate kayıt | `upsert` kullan veya önce kontrol et |
| `P2025` RecordNotFound | `update`/`delete` bulamadı | `findFirst` ile önce kontrol et |
| `P2034` TransactionConflict | Deadlock | Retry logic ekle (exponential backoff) |
| `Can't reach database` | Pool tükendi / timeout | `connection_limit` düşür, sorgu sürelerini kontrol et |
| Migration drift | Schema ≠ DB | `prisma migrate resolve` + elle düzelt |
| `P1001` Connection refused | DB kapalı / yanlış URL | `DATABASE_URL` ve pg servisini kontrol et |
