import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateProductCategoryDto,
    CreateProductDto,
    UpdateProductCategoryDto,
    UpdateProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createProduct(data: CreateProductDto) {
        const normalized = this.normalizeProductData(data);
        await this.assertUniqueProductName(normalized.name);

        try {
            return await this.prisma.product.create({ data: normalized });
        } catch (error) {
            this.rethrowUniqueViolation(error, 'Product name already exists');
            throw error;
        }
    }

    async findAllProducts() {
        return this.prisma.product.findMany({
            where: { deletedAt: null, isActive: true },
            include: { categories: { where: { deletedAt: null, isActive: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getProduct(id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null, isActive: true },
            include: { categories: { where: { deletedAt: null, isActive: true } } },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async updateProduct(id: string, data: UpdateProductDto) {
        return this.prisma.$transaction(async (transaction) => {
            await this.lockActiveProduct(transaction, id);
            await this.getProductFrom(transaction, id);
            const normalized = this.normalizeProductData(data);
            if (normalized.name) {
                await this.assertUniqueProductName(normalized.name, id, transaction);
            }

            try {
                return await transaction.product.update({
                    where: { id },
                    data: normalized,
                });
            } catch (error) {
                this.rethrowUniqueViolation(error, 'Product name already exists');
                throw error;
            }
        });
    }

    async archiveProduct(id: string) {
        return this.prisma.$transaction(async (transaction) => {
            await this.lockActiveProduct(transaction, id);
            await this.getProductFrom(transaction, id);
            const archivedAt = new Date();
            await transaction.productCategory.updateMany({
                where: { productId: id, deletedAt: null },
                data: { isActive: false, deletedAt: archivedAt },
            });
            return transaction.product.update({
                where: { id },
                data: { isActive: false, deletedAt: archivedAt },
            });
        });
    }

    async createCategory(productId: string, data: CreateProductCategoryDto) {
        return this.prisma.$transaction(async (transaction) => {
            await this.lockActiveProduct(transaction, productId);
            await this.getProductFrom(transaction, productId);
            const normalized = this.normalizeCategoryData(data);
            await this.assertUniqueCategoryName(productId, normalized.name, undefined, transaction);

            try {
                return await transaction.productCategory.create({
                    data: {
                        productId,
                        name: normalized.name,
                        keywords: normalized.keywords || [],
                    },
                });
            } catch (error) {
                this.rethrowUniqueViolation(error, 'Category name already exists for this product');
                throw error;
            }
        });
    }

    async updateCategory(categoryId: string, data: UpdateProductCategoryDto) {
        return this.prisma.$transaction(async (transaction) => {
            const category = await this.lockActiveCategory(transaction, categoryId);
            const normalized = this.normalizeCategoryData(data);
            if (normalized.name) {
                await this.assertUniqueCategoryName(category.productId, normalized.name, categoryId, transaction);
            }

            try {
                return await transaction.productCategory.update({
                    where: { id: categoryId },
                    data: normalized,
                });
            } catch (error) {
                this.rethrowUniqueViolation(error, 'Category name already exists for this product');
                throw error;
            }
        });
    }

    async deleteCategory(categoryId: string) {
        return this.prisma.$transaction(async (transaction) => {
            await this.lockActiveCategory(transaction, categoryId);
            return transaction.productCategory.update({
                where: { id: categoryId },
                data: { isActive: false, deletedAt: new Date() },
            });
        });
    }

    private normalizeProductData(data: CreateProductDto | UpdateProductDto) {
        const normalized: { name?: string; description?: string | null } = {};
        if (data.name !== undefined) normalized.name = data.name.trim();
        if (data.description !== undefined) normalized.description = data.description.trim() || null;
        return normalized as CreateProductDto & { description?: string | null };
    }

    private normalizeCategoryData(data: CreateProductCategoryDto | UpdateProductCategoryDto) {
        const normalized: { name?: string; keywords?: string[] } = {};
        if (data.name !== undefined) normalized.name = data.name.trim();
        if (data.keywords !== undefined) normalized.keywords = this.normalizeKeywords(data.keywords);
        return normalized as CreateProductCategoryDto;
    }

    private normalizeKeywords(keywords: string[]) {
        const seen = new Set<string>();
        return keywords.reduce<string[]>((normalized, keyword) => {
            const trimmed = keyword.trim();
            const key = trimmed.toLowerCase();
            if (!trimmed || seen.has(key)) return normalized;
            seen.add(key);
            return [...normalized, trimmed];
        }, []);
    }

    private async assertUniqueProductName(
        name: string,
        excludeId?: string,
        database: Prisma.TransactionClient = this.prisma,
    ) {
        const duplicate = await database.product.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null,
                isActive: true,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
        if (duplicate) throw new ConflictException('Product name already exists');
    }

    private async assertUniqueCategoryName(
        productId: string,
        name: string,
        excludeId?: string,
        database: Prisma.TransactionClient = this.prisma,
    ) {
        const duplicate = await database.productCategory.findFirst({
            where: {
                productId,
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null,
                isActive: true,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
        if (duplicate) throw new ConflictException('Category name already exists for this product');
    }

    private async getProductFrom(database: Prisma.TransactionClient, id: string) {
        const product = await database.product.findFirst({
            where: { id, deletedAt: null, isActive: true },
            include: { categories: { where: { deletedAt: null, isActive: true } } },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    private async lockActiveProduct(database: Prisma.TransactionClient, id: string) {
        const rows = await database.$queryRaw<Array<{ id: string }>>`
            SELECT "id"
            FROM "products"
            WHERE "id" = ${id}::uuid
              AND "deleted_at" IS NULL
              AND "is_active" = TRUE
            FOR UPDATE
        `;
        if (rows.length === 0) throw new NotFoundException('Product not found');
    }

    private async lockActiveCategory(database: Prisma.TransactionClient, categoryId: string) {
        const category = await database.productCategory.findFirst({
            where: { id: categoryId, deletedAt: null, isActive: true },
            select: { id: true, productId: true },
        });
        if (!category) throw new NotFoundException('Product category not found');

        await this.lockActiveProduct(database, category.productId);
        const rows = await database.$queryRaw<Array<{ id: string }>>`
            SELECT "id"
            FROM "product_categories"
            WHERE "id" = ${categoryId}::uuid
              AND "deleted_at" IS NULL
              AND "is_active" = TRUE
            FOR UPDATE
        `;
        if (rows.length === 0) throw new NotFoundException('Product category not found');
        return category;
    }

    private rethrowUniqueViolation(error: unknown, message: string): void {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
            throw new ConflictException(message);
        }
    }

    async restoreAllplanFaqs() {
        // Enforce Allplan product and category setup
        let product = await this.prisma.product.findFirst({
            where: {
                name: { equals: 'Allplan', mode: 'insensitive' },
                isActive: true,
                deletedAt: null,
            },
        });
        if (!product) {
            product = await this.createProduct({
                name: 'Allplan',
                description: 'Allplan BIM software support',
            });
        }

        // Use name search for stability
        const actualProduct = product;
        if (!actualProduct) throw new NotFoundException('Failed to ensure Allplan product');

        let category = await this.prisma.productCategory.findFirst({
            where: {
                name: { equals: 'Genel', mode: 'insensitive' },
                productId: actualProduct.id,
                isActive: true,
                deletedAt: null,
            },
        });

        if (!category) {
            category = await this.createCategory(actualProduct.id, {
                name: 'Genel',
                keywords: ['allplan', 'genel'],
            });
        }

        const actualCategory = category;
        let faqChanged = false;

        // FAQ restoration
        const faqs = [
            {
                question: 'Allplan nedir?',
                answer: 'Allplan, mimarlar ve mühendisler için geliştirilmiş profesyonel bir BIM yazılımıdır.',
                tags: ['tanım', 'allplan'],
            },
            {
                question: 'Donatı metrajı nasıl alınır?',
                answer: 'Allplan Donatı modülü içerisinde metraj raporları sekmesinden güncel donatı listeleri alınabilir.',
                tags: ['donatı', 'metraj'],
            },
        ];

        for (const faq of faqs) {
            const existing = await this.prisma.faqEntry.findFirst({ where: { question: faq.question } });
            if (existing) {
                await this.prisma.faqEntry.update({
                    where: { id: existing.id },
                    data: faq
                });
                faqChanged = true;
            } else {
                await this.prisma.faqEntry.create({
                    data: {
                        ...faq,
                        status: 'PUBLISHED' as any,
                        confidenceScore: 0.99,
                        isInternal: false,
                    }
                });
                faqChanged = true;
            }
        }

        if (faqChanged) await this.eventEmitter.emitAsync('faq.changed');

        return { message: 'Restoration completed successfully', product: actualProduct, category: actualCategory };
    }
}
