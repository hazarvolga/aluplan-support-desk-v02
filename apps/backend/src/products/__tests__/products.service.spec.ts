import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../prisma/prisma.service';

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
            },
            faqEntry: {
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                { provide: PrismaService, useValue: mockPrismaService },
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

            prisma.product.create.mockResolvedValue(expected);

            const result = await service.createProduct(data);

            expect(result).toEqual(expected);
            expect(prisma.product.create).toHaveBeenCalledWith({ data });
        });
    });

    describe('findAllProducts', () => {
        it('should return all non-deleted products with non-deleted categories ordered by createdAt', async () => {
            const products = [{ id: 'prod-1', name: 'Allplan' }];
            prisma.product.findMany.mockResolvedValue(products);

            const result = await service.findAllProducts();

            expect(result).toEqual(products);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null },
                include: { categories: { where: { deletedAt: null } } },
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
                where: { id: 'prod-1', deletedAt: null },
                include: { categories: { where: { deletedAt: null } } },
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
    });
});
