import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

export const productFactory = Factory.define<{
    name: string;
    description?: string;
    isActive?: boolean;
}>(({ onCreate }) => {
    onCreate(async (product) => {
        const prisma = new PrismaService();
        return prisma.product.create({ data: product });
    });

    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        isActive: true,
    };
});
