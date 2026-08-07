import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ProductsService } from '../../src/products/products.service';

describe('ProductsService archive concurrency (Integration)', () => {
    let testModule: TestingModule;
    let service: ProductsService;
    let prisma: PrismaService;
    let productId: string | undefined;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
            providers: [ProductsService],
        }).compile();
        service = testModule.get(ProductsService);
        prisma = testModule.get(PrismaService);
        await testModule.init();
    });

    afterEach(async () => {
        if (!productId) return;
        await prisma.productCategory.deleteMany({ where: { productId } });
        await prisma.product.deleteMany({ where: { id: productId } });
        productId = undefined;
    });

    afterAll(async () => {
        await testModule.close();
    });

    it('never leaves an active category under a concurrently archived product', async () => {
        const product = await service.createProduct({
            name: `Concurrency ${crypto.randomUUID()}`,
            description: 'Disposable integration record',
        });
        productId = product.id;

        const [archiveResult] = await Promise.allSettled([
            service.archiveProduct(product.id),
            service.createCategory(product.id, {
                name: 'Concurrent category',
                keywords: ['race'],
            }),
        ]);

        expect(archiveResult.status).toBe('fulfilled');
        const archivedProduct = await prisma.product.findUnique({ where: { id: product.id } });
        const activeCategories = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*)::bigint AS "count"
            FROM "product_categories"
            WHERE "product_id" = ${product.id}::uuid
              AND "is_active" = TRUE
              AND "deleted_at" IS NULL
        `;
        expect(archivedProduct?.isActive).toBe(false);
        expect(archivedProduct?.deletedAt).not.toBeNull();
        expect(activeCategories[0]?.count).toBe(0n);
    });
});
