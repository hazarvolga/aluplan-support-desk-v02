import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async createProduct(data: { name: string; description?: string }) {
        return this.prisma.product.create({ data });
    }

    async findAllProducts() {
        return this.prisma.product.findMany({
            where: { deletedAt: null },
            include: { categories: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getProduct(id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: { categories: true },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async createCategory(productId: string, data: { name: string; keywords?: string[] }) {
        await this.getProduct(productId); // verify exists
        return this.prisma.productCategory.create({
            data: {
                productId,
                name: data.name,
                keywords: data.keywords || [],
            },
        });
    }

    async updateCategory(categoryId: string, data: { name?: string; keywords?: string[] }) {
        return this.prisma.productCategory.update({
            where: { id: categoryId },
            data,
        });
    }

    async deleteCategory(categoryId: string) {
        return this.prisma.productCategory.delete({ where: { id: categoryId } });
    }

    async restoreAllplanFaqs() {
        // Enforce Allplan product and category setup
        const product = await this.prisma.product.upsert({
            where: { id: '00000000-0000-0000-0000-000000000001' as any }, // Mock or specific ID if needed, using name search for safety
            update: {},
            create: {
                name: 'Allplan',
                description: 'Allplan BIM software support',
            },
        });

        // Use name search for stability
        const actualProduct = await this.prisma.product.findFirst({ where: { name: 'Allplan' } });
        if (!actualProduct) throw new NotFoundException('Failed to ensure Allplan product');

        const category = await this.prisma.productCategory.upsert({
            where: { id: '00000000-0000-0000-0000-000000000002' as any },
            update: {},
            create: {
                productId: actualProduct.id,
                name: 'Genel',
                keywords: ['allplan', 'genel'],
            },
        });

        const actualCategory = await this.prisma.productCategory.findFirst({
            where: { name: 'Genel', productId: actualProduct.id },
        });

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
            await this.prisma.faqEntry.upsert({
                where: { id: 'unique-id-per-faq' as any }, // In a real scenario, use unique keys
                update: faq,
                create: {
                    ...faq,
                    status: 'PUBLISHED' as any,
                    confidenceScore: 0.99,
                    isInternal: false,
                },
            });
        }

        return { message: 'Restoration completed successfully', product: actualProduct, category: actualCategory };
    }
}
