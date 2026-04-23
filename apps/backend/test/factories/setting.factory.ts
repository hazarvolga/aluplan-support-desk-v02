import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

export const settingFactory = Factory.define<{
    key: string;
    value: string;
    isSecret?: boolean;
    updatedBy?: string;
}>(({ onCreate }) => {
    onCreate(async (setting) => {
        const prisma = new PrismaService();
        return prisma.setting.create({ data: setting });
    });

    return {
        key: `test.setting.${faker.string.alphanumeric(8)}`,
        value: faker.lorem.word(),
        isSecret: false,
    };
});
