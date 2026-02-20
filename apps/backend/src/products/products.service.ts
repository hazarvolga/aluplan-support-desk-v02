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
            include: { categories: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getProduct(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
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
}
