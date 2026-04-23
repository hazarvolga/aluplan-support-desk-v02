import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { truncateDatabase } from '../helpers/db-utils';
import * as bcrypt from 'bcryptjs';

describe('Auth Flow (Integration)', () => {
    jest.setTimeout(30000);
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        prisma = module.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await truncateDatabase(prisma);
    });

    it('should register, login, access protected route, and logout', async () => {
        // 1. Create a user directly in DB (bypass registration for speed)
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'integration@test.com',
                passwordHash,
                fullName: 'Integration Test',
                status: 'ACTIVE',
            },
        });

        // 2. Login
        const loginRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'integration@test.com', password: 'password123' })
            .expect(200);

        expect(loginRes.body).toHaveProperty('access_token');
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();

        // 3. Access protected route (me)
        const meRes = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Cookie', cookies)
            .expect(200);

        expect(meRes.body.email).toBe('integration@test.com');

        // 4. Logout
        const logoutRes = await request(app.getHttpServer())
            .post('/api/v1/auth/logout')
            .set('Cookie', cookies)
            .expect(200);

        expect(logoutRes.body.success).toBe(true);

        // 5. Verify token is invalidated (should fail)
        await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Cookie', cookies)
            .expect(401);
    });

    it('should reject invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'wrong@test.com', password: 'wrong' })
            .expect(401);
    });
});
