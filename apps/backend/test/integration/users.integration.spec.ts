import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { truncateDatabase } from '../helpers/db-utils';
import { userFactory } from '../factories/user.factory';
import { UsersModule } from '../../src/users/users.module';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('UsersService (Integration)', () => {
    jest.setTimeout(30000); // 30 seconds for DB operations
    let testModule: TestingModule;
    let service: UsersService;
    let prisma: PrismaService;

    beforeAll(async () => {
        try {
            testModule = await Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({ isGlobal: true }),
                    PrismaModule,
                    UsersModule,
                ],
            }).compile();

            service = testModule.get<UsersService>(UsersService);
            prisma = testModule.get<PrismaService>(PrismaService);
        } catch (error) {
            console.error('FAILED TO COMPILE TESTING MODULE:', error);
            throw error;
        }
    });

    afterAll(async () => {
        if (testModule) {
            await testModule.close();
        }
    });

    beforeEach(async () => {
        await truncateDatabase(prisma);
    });

    it('should create a user and persist it to the database', async () => {
        const userData = {
            email: 'work-integration@test.com',
            password: 'password123',
            fullName: 'Integration Test User',
        };

        const user = await service.create(userData);

        const persistedUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        expect(persistedUser).toBeDefined();
        expect(persistedUser?.fullName).toBe(userData.fullName);
        expect(user.email).toBe(userData.email);
    });

    it('should find a user by ID using real database', async () => {
        // Create random user via prisma directly to test retrieval logic
        const existingUser = await prisma.user.create({
            data: {
                email: 'find-me@test.com',
                fullName: 'Find Me',
                passwordHash: 'hash',
            }
        });

        const foundUser = await service.findOne(existingUser.id);

        expect(foundUser.id).toBe(existingUser.id);
        expect(foundUser.email).toBe(existingUser.email);
    });
});
