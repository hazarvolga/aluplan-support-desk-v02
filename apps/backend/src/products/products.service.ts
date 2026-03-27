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
        let product = await this.prisma.product.findFirst({ where: { name: 'Allplan' } });
        if (product) {
            product = await this.prisma.product.update({
                where: { id: product.id },
                data: {}
            });
        } else {
            product = await this.prisma.product.create({
                data: {
                    name: 'Allplan',
                    description: 'Allplan BIM software support',
                }
            });
        }

        // Use name search for stability
        const actualProduct = product;
        if (!actualProduct) throw new NotFoundException('Failed to ensure Allplan product');

        let category = await this.prisma.productCategory.findFirst({
            where: { name: 'Genel', productId: actualProduct.id }
        });

        if (category) {
            category = await this.prisma.productCategory.update({
                where: { id: category.id },
                data: {}
            });
        } else {
            category = await this.prisma.productCategory.create({
                data: {
                    productId: actualProduct.id,
                    name: 'Genel',
                    keywords: ['allplan', 'genel'],
                }
            });
        }

        const actualCategory = category;

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
            } else {
                await this.prisma.faqEntry.create({
                    data: {
                        ...faq,
                        status: 'PUBLISHED' as any,
                        confidenceScore: 0.99,
                        isInternal: false,
                    }
                });
            }
        }

        return { message: 'Restoration completed successfully', product: actualProduct, category: actualCategory };
    }
}
