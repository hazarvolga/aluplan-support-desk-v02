import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ProductsService', () => {
    let service: ProductsService;
    let prisma: any;

    beforeEach(async () => {
        const mockPrismaService = {
            product: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            productCategory: {
                create: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                updateMany: jest.fn(),
            },
            faqEntry: {
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            $queryRaw: jest.fn().mockResolvedValue([{ id: 'locked-row' }]),
            $transaction: jest.fn(async (callback: (transaction: any) => unknown) => callback(mockPrismaService)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: { emitAsync: jest.fn().mockResolvedValue(false) } },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createProduct', () => {
        it('should create a new product with the given data', async () => {
            const data = { name: 'Allplan', description: 'BIM software' };
            const expected = { id: 'prod-1', ...data };

            prisma.product.findFirst.mockResolvedValue(null);
            prisma.product.create.mockResolvedValue(expected);

            const result = await service.createProduct(data);

            expect(result).toEqual(expected);
            expect(prisma.product.create).toHaveBeenCalledWith({ data });
        });

        it('normalizes product input before persistence', async () => {
            prisma.product.findFirst.mockResolvedValue(null);
            prisma.product.create.mockResolvedValue({ id: 'prod-1' });

            await service.createProduct({ name: '  ALLPLAN  ', description: '  BIM support  ' });

            expect(prisma.product.create).toHaveBeenCalledWith({
                data: { name: 'ALLPLAN', description: 'BIM support' },
            });
        });

        it('rejects duplicate active product names case-insensitively', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'existing', name: 'ALLPLAN' });

            await expect(service.createProduct({ name: ' allplan ' })).rejects.toThrow(ConflictException);
            expect(prisma.product.create).not.toHaveBeenCalled();
        });

        it('maps a database uniqueness race to ConflictException', async () => {
            prisma.product.findFirst.mockResolvedValue(null);
            prisma.product.create.mockRejectedValue({ code: 'P2002' });

            await expect(service.createProduct({ name: 'ALLPLAN' })).rejects.toThrow(ConflictException);
        });
    });

    describe('updateProduct', () => {
        it('updates an existing product with normalized fields', async () => {
            prisma.product.findFirst
                .mockResolvedValueOnce({ id: 'prod-1', name: 'ALLPLAN' })
                .mockResolvedValueOnce(null);
            prisma.product.update.mockResolvedValue({ id: 'prod-1', name: 'ALLPLAN 2027' });

            await service.updateProduct('prod-1', { name: '  ALLPLAN 2027  ' });

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod-1' },
                data: { name: 'ALLPLAN 2027' },
            });
        });

        it('rejects a duplicate product name owned by another product', async () => {
            prisma.product.findFirst
                .mockResolvedValueOnce({ id: 'prod-1', name: 'ALLPLAN' })
                .mockResolvedValueOnce({ id: 'prod-2', name: 'AX3000' });

            await expect(service.updateProduct('prod-1', { name: ' ax3000 ' })).rejects.toThrow(ConflictException);
            expect(prisma.product.update).not.toHaveBeenCalled();
        });

        it('maps an update uniqueness race to ConflictException', async () => {
            prisma.product.findFirst
                .mockResolvedValueOnce({ id: 'prod-1', name: 'ALLPLAN' })
                .mockResolvedValueOnce(null);
            prisma.product.update.mockRejectedValue({ code: 'P2002' });

            await expect(service.updateProduct('prod-1', { name: 'AX3000' }))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('archiveProduct', () => {
        it('soft-archives the product and all active categories without deleting history', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1', name: 'ALLPLAN' });
            prisma.productCategory.updateMany.mockResolvedValue({ count: 2 });
            prisma.product.update.mockResolvedValue({ id: 'prod-1', isActive: false });

            await service.archiveProduct('prod-1');

            expect(prisma.productCategory.updateMany).toHaveBeenCalledWith({
                where: { productId: 'prod-1', deletedAt: null },
                data: { isActive: false, deletedAt: expect.any(Date) },
            });
            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod-1' },
                data: { isActive: false, deletedAt: expect.any(Date) },
            });
        });
    });

    describe('findAllProducts', () => {
        it('should return all non-deleted products with non-deleted categories ordered by createdAt', async () => {
            const products = [{ id: 'prod-1', name: 'Allplan' }];
            prisma.product.findMany.mockResolvedValue(products);

            const result = await service.findAllProducts();

            expect(result).toEqual(products);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null, isActive: true },
                include: { categories: { where: { deletedAt: null, isActive: true } } },
                orderBy: { createdAt: 'asc' },
            });
        });
    });

    describe('getProduct', () => {
        it('should return a non-deleted product with categories', async () => {
            const product = { id: 'prod-1', name: 'Allplan', categories: [] };
            prisma.product.findFirst.mockResolvedValue(product);

            const result = await service.getProduct('prod-1');

            expect(result).toEqual(product);
            expect(prisma.product.findFirst).toHaveBeenCalledWith({
                where: { id: 'prod-1', deletedAt: null, isActive: true },
                include: { categories: { where: { deletedAt: null, isActive: true } } },
            });
        });

        it('should throw NotFoundException if product does not exist', async () => {
            prisma.product.findFirst.mockResolvedValue(null);

            await expect(service.getProduct('prod-1')).rejects.toThrow(
                new NotFoundException('Product not found'),
            );
        });
    });

    describe('createCategory', () => {
        it('should create a category for an existing product', async () => {
            const product = { id: 'prod-1', name: 'Allplan' };
            prisma.product.findFirst.mockResolvedValue(product);
            prisma.productCategory.findFirst.mockResolvedValue(null);

            const categoryData = { name: 'Genel', keywords: ['allplan'] };
            const expectedCategory = { id: 'cat-1', productId: 'prod-1', ...categoryData };

            prisma.productCategory.create.mockResolvedValue(expectedCategory);

            const result = await service.createCategory('prod-1', categoryData);

            expect(result).toEqual(expectedCategory);
            expect(prisma.productCategory.create).toHaveBeenCalledWith({
                data: {
                    productId: 'prod-1',
                    name: 'Genel',
                    keywords: ['allplan'],
                },
            });
        });

        it('should throw NotFoundException if product does not exist', async () => {
            prisma.product.findFirst.mockResolvedValue(null);

            await expect(
                service.createCategory('prod-1', { name: 'Genel' }),
            ).rejects.toThrow(new NotFoundException('Product not found'));
        });

        it('should default keywords to empty array if not provided', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.findFirst.mockResolvedValue(null);
            prisma.productCategory.create.mockResolvedValue({ id: 'cat-1' });

            await service.createCategory('prod-1', { name: 'Genel' });

            expect(prisma.productCategory.create).toHaveBeenCalledWith({
                data: {
                    productId: 'prod-1',
                    name: 'Genel',
                    keywords: [],
                },
            });
        });

        it('normalizes and de-duplicates category keywords', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.findFirst.mockResolvedValue(null);
            prisma.productCategory.create.mockResolvedValue({ id: 'cat-1' });

            await service.createCategory('prod-1', {
                name: '  Lisans  ',
                keywords: [' Aktivasyon ', 'aktivasyon', '', 'WIBU'],
            });

            expect(prisma.productCategory.create).toHaveBeenCalledWith({
                data: {
                    productId: 'prod-1',
                    name: 'Lisans',
                    keywords: ['Aktivasyon', 'WIBU'],
                },
            });
        });

        it('rejects duplicate active category names within the same product', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.findFirst.mockResolvedValue({ id: 'cat-existing' });

            await expect(service.createCategory('prod-1', { name: ' lisans ' })).rejects.toThrow(ConflictException);
            expect(prisma.productCategory.create).not.toHaveBeenCalled();
        });

        it('maps a category create uniqueness race to ConflictException', async () => {
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.findFirst.mockResolvedValue(null);
            prisma.productCategory.create.mockRejectedValue({ code: 'P2002' });

            await expect(service.createCategory('prod-1', { name: 'Lisans' }))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('updateCategory', () => {
        it('updates an active category with normalized values', async () => {
            prisma.productCategory.findFirst
                .mockResolvedValueOnce({ id: 'cat-1', productId: 'prod-1' })
                .mockResolvedValueOnce(null);
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.update.mockResolvedValue({ id: 'cat-1', name: 'Aktivasyon' });

            await service.updateCategory('cat-1', {
                name: '  Aktivasyon  ',
                keywords: [' wibu ', 'WIBU', ' license '],
            });

            expect(prisma.productCategory.update).toHaveBeenCalledWith({
                where: { id: 'cat-1' },
                data: { name: 'Aktivasyon', keywords: ['wibu', 'license'] },
            });
        });

        it('rejects updates for an archived category', async () => {
            prisma.productCategory.findFirst.mockResolvedValue(null);

            await expect(service.updateCategory('cat-1', { name: 'Aktivasyon' }))
                .rejects.toThrow(new NotFoundException('Product category not found'));
            expect(prisma.productCategory.update).not.toHaveBeenCalled();
        });

        it('maps a category update uniqueness race to ConflictException', async () => {
            prisma.productCategory.findFirst
                .mockResolvedValueOnce({ id: 'cat-1', productId: 'prod-1' })
                .mockResolvedValueOnce(null);
            prisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
            prisma.productCategory.update.mockRejectedValue({ code: 'P2002' });

            await expect(service.updateCategory('cat-1', { name: 'Aktivasyon' }))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('deleteCategory', () => {
        it('soft-archives an active category', async () => {
            prisma.productCategory.findFirst.mockResolvedValue({ id: 'cat-1', productId: 'prod-1' });
            prisma.productCategory.update.mockResolvedValue({ id: 'cat-1', isActive: false });

            await service.deleteCategory('cat-1');

            expect(prisma.productCategory.update).toHaveBeenCalledWith({
                where: { id: 'cat-1' },
                data: { isActive: false, deletedAt: expect.any(Date) },
            });
        });
    });

    describe('restoreAllplanFaqs', () => {
        it('does not reuse archived taxonomy and creates active replacements', async () => {
            prisma.product.findFirst
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null)
                .mockResolvedValue({ id: 'active-product' });
            prisma.product.create.mockResolvedValue({ id: 'active-product', name: 'Allplan', isActive: true });
            prisma.productCategory.findFirst
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);
            prisma.productCategory.create.mockResolvedValue({ id: 'active-category', name: 'Genel', isActive: true });
            prisma.faqEntry.findFirst.mockResolvedValue(null);
            prisma.faqEntry.create.mockResolvedValue({ id: 'faq' });

            const result = await service.restoreAllplanFaqs();

            expect(prisma.product.findFirst).toHaveBeenCalledWith({
                where: {
                    name: { equals: 'Allplan', mode: 'insensitive' },
                    isActive: true,
                    deletedAt: null,
                },
            });
            expect(prisma.product.create).toHaveBeenCalledWith({
                data: { name: 'Allplan', description: 'Allplan BIM software support' },
            });
            expect(prisma.productCategory.create).toHaveBeenCalledWith({
                data: {
                    productId: 'active-product',
                    name: 'Genel',
                    keywords: ['allplan', 'genel'],
                },
            });
            expect(result.product.id).toBe('active-product');
            expect(result.category.id).toBe('active-category');
        });
    });
});
