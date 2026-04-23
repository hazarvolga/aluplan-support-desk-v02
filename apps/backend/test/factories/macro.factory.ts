import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

export const macroFactory = Factory.define<{
    name: string;
    content: string;
    createdBy?: string;
}>(({ onCreate }) => {
    onCreate(async (macro) => {
        const prisma = new PrismaService();
        return prisma.macro.create({ data: macro });
    });

    return {
        name: faker.lorem.words(2),
        content: `Hello {{name}}, regarding {{ticketNumber}}`,
    };
});
