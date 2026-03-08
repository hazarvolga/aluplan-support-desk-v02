import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

export const userFactory = Factory.define<{ email: string; fullName: string; passwordHash: string; status: UserStatus }>(({ onCreate }) => {
    onCreate(async (user) => {
        const prisma = new PrismaService();
        return prisma.user.create({ data: user });
    });

    return {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        passwordHash: 'hashed_password', // Dummy hash for tests
        status: UserStatus.ACTIVE,
    };
});
