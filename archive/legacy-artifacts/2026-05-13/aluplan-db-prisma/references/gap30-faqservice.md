# GAP-30 — FaqService Tek Nokta Mimari Refactor

**Öncelik**: Düşük  
**Durum**: ⏳ Açık  
**Hedef**: FaqEntry, FaqCategory ve bağlı varlıklara erişim tek bir `FaqService` üzerinden yönetilmeli; servis bypass edilmemeli.

---

## Mevcut Sorun

Birden fazla servis veya controller doğrudan Prisma'ya erişerek `faqEntry` veya `faqCategory` okuyup yazıyor. Bu:
- Soft-delete filtresinin bypass edilmesine yol açabilir
- Audit log'un atlanmasına neden olabilir
- Business logic'in dağılmasına sebep olur

---

## Hedef Mimari

```
Controller / diğer servisler
        │
        ▼
   FaqService  ◄─── tek erişim noktası
        │
        ├── this.prisma.faqEntry.*
        └── this.prisma.faqCategory.*
```

---

## Uygulama Adımları

### 1. FaqService Interface'ini Genişlet

`FaqService`'e eksik metodları ekle (mevcut metodları kırmadan):

```typescript
// src/faq/faq.service.ts
@Injectable()
export class FaqService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,  // inject et
  ) {}

  // --- FaqEntry ---
  async findEntryById(id: string, tenantId: string) {
    return this.prisma.faqEntry.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findEntriesByCategory(categoryId: string, tenantId: string) {
    return this.prisma.faqEntry.findMany({
      where: { categoryId, tenantId, deletedAt: null },
      orderBy: { position: 'asc' },
    });
  }

  async createEntry(dto: CreateFaqEntryDto, actorId: string) {
    const entry = await this.prisma.faqEntry.create({ data: dto });
    await this.auditService.log({
      entityType: 'FaqEntry',
      entityId: entry.id,
      action: 'CREATE',
      actorId,
      tenantId: dto.tenantId,
      after: entry as any,
    });
    return entry;
  }

  async updateEntry(id: string, dto: UpdateFaqEntryDto, actorId: string) {
    const before = await this.findEntryById(id, dto.tenantId);
    const after = await this.prisma.faqEntry.update({ where: { id }, data: dto });
    await this.auditService.log({
      entityType: 'FaqEntry',
      entityId: id,
      action: 'UPDATE',
      actorId,
      tenantId: dto.tenantId,
      before: before as any,
      after: after as any,
    });
    return after;
  }

  async deleteEntry(id: string, tenantId: string, actorId: string) {
    await this.prisma.faqEntry.softDelete({ id, tenantId });
    await this.auditService.log({
      entityType: 'FaqEntry',
      entityId: id,
      action: 'DELETE',
      actorId,
      tenantId,
    });
  }

  // --- FaqCategory ---
  async findCategories(tenantId: string) {
    return this.prisma.faqCategory.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { position: 'asc' },
      include: { entries: { where: { deletedAt: null } } },
    });
  }
}
```

### 2. Direkt Prisma Erişimini Kaldır

Projede `prisma.faqEntry` veya `prisma.faqCategory`'yi doğrudan kullanan tüm yerleri bul ve `FaqService` metodlarına yönlendir:

```bash
# Direkt erişim noktalarını bul
grep -rn "prisma\.faqEntry\|prisma\.faqCategory" src/ --include="*.ts" \
  | grep -v "faq.service.ts" \
  | grep -v ".spec.ts"
```

Her sonuç için:
1. İlgili servise `FaqService` inject et
2. Prisma çağrısını `FaqService` metoduyla değiştir

### 3. FaqModule Export'larını Güncelle

```typescript
// src/faq/faq.module.ts
@Module({
  providers: [FaqService, FaqResolver, FaqController],
  exports: [FaqService],  // diğer modüller FaqService'i import edebilir
})
export class FaqModule {}
```

### 4. Test Güncellemeleri

```typescript
// faq.service.spec.ts — mevcut testleri koru, yenilerini ekle
describe('FaqService', () => {
  it('should filter soft-deleted entries', async () => {
    prismaStub.faqEntry.findMany.mockResolvedValue([]);
    const result = await service.findEntriesByCategory('cat-1', 'tenant-1');
    expect(prismaStub.faqEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });
});
```

---

## Tamamlanma Kriterleri

- [ ] `grep -rn "prisma\.faqEntry" src/ | grep -v faq.service` → 0 sonuç
- [ ] `grep -rn "prisma\.faqCategory" src/ | grep -v faq.service` → 0 sonuç
- [ ] Tüm backend testler (80/80 suite) geçiyor
- [ ] Audit log: FaqEntry CREATE/UPDATE/DELETE aksiyonları loglanıyor
