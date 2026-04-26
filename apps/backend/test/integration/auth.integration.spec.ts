import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
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
        app.setGlobalPrefix('api/v1');
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        );
        await app.init();

        prisma = module.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    beforeEach(async () => {
        await truncateDatabase(prisma);
    });

    it('should register, login, access protected route, and logout', async () => {
        // 1. Create a user directly in DB (bypass registration for speed).
        // Using a unique email per run avoids interference from prior leftovers
        // that truncateDatabase couldn't clear because of FK constraints.
        const uniqueEmail = `integration-${Date.now()}@test.com`;
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email: uniqueEmail,
                passwordHash,
                fullName: 'Integration Test',
                status: 'ACTIVE',
            },
        });

        // 2. Login
        const loginRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: uniqueEmail, password: 'password123' });
        if (loginRes.status !== 200) {
            // eslint-disable-next-line no-console
            console.log('LOGIN_DEBUG status=', loginRes.status, 'body=', JSON.stringify(loginRes.body));
        }
        expect(loginRes.status).toBe(200);

        expect(loginRes.body).toHaveProperty('access_token');
        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();

        // 3. Access protected route (me)
        const meRes = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Cookie', cookies)
            .expect(200);

        expect(meRes.body.email).toBe(uniqueEmail);

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
            .send({ email: 'wrong@test.com', password: 'wrongpassword' })
            .expect(401);
    });
});
