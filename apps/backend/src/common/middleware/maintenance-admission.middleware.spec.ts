import {
    Controller,
    Get,
    INestApplication,
    Injectable,
    CanActivate,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { MaintenanceAdmissionMiddleware } from './maintenance-admission.middleware';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

describe('HTTP maintenance admission only', () => {
    const fixture = () => {
        const work = new MaintenanceWorkService();
        const middleware = new MaintenanceAdmissionMiddleware(work);
        const response = {
            status: jest.fn().mockReturnThis(),
            setHeader: jest.fn(),
            json: jest.fn(),
        };
        const next = jest.fn();
        return { work, middleware, response, next };
    };

    it.each(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])(
        'rejects closed %s before downstream work',
        (method) => {
            const f = fixture();
            f.work.closeAdmission();
            f.middleware.use(
                { method, url: '/settings?secret=synthetic' } as Request,
                f.response as unknown as Response,
                f.next,
            );
            expect(f.next).not.toHaveBeenCalled();
            expect(f.response.status).toHaveBeenCalledWith(503);
            expect(f.response.setHeader).toHaveBeenCalledWith(
                'Cache-Control',
                'no-store',
            );
            expect(f.response.json).toHaveBeenCalledWith({
                statusCode: 503,
                code: 'MAINTENANCE',
                message: 'Service temporarily unavailable',
            });
            expect(JSON.stringify(f.response.json.mock.calls)).not.toContain(
                'synthetic',
            );
        },
    );

    it('calls next synchronously without touching response while open', () => {
        const f = fixture();
        f.middleware.use(
            {} as Request,
            f.response as unknown as Response,
            f.next,
        );
        expect(f.next).toHaveBeenCalledTimes(1);
        expect(f.response.status).not.toHaveBeenCalled();
    });

    it('does not translate downstream exceptions into maintenance', () => {
        const f = fixture();
        const error = new Error('downstream');
        expect(() =>
            f.middleware.use(
                {} as Request,
                f.response as unknown as Response,
                (() => {
                    throw error;
                }) as NextFunction,
            ),
        ).toThrow(error);
        expect(f.response.status).not.toHaveBeenCalled();
    });

    it('does not pretend next returning means separately tracked work settled', async () => {
        const f = fixture();
        let release!: () => void;
        const held = new Promise<void>((resolve) => {
            release = resolve;
        });
        let pending!: Promise<void>;
        f.middleware.use(
            {} as Request,
            f.response as unknown as Response,
            (() => {
                pending = f.work.runRoot('test.http', () => held);
            }) as NextFunction,
        );
        f.work.closeAdmission();
        try {
            expect(await f.work.waitForIdle(0)).toEqual({
                drained: false,
                activeCount: 1,
            });
        } finally {
            release();
            await pending;
        }
        expect(await f.work.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('rejects before a real Nest global guard and exception filter', async () => {
        const guardWrite = jest.fn();
        const filterWrite = jest.fn();
        @Injectable()
        class WritingGuard implements CanActivate {
            canActivate() {
                guardWrite();
                return true;
            }
        }
        @Controller('probe')
        class ProbeController {
            @Get() get() {
                return { ok: true };
            }
        }
        const module = await Test.createTestingModule({
            controllers: [ProbeController],
            providers: [
                MaintenanceWorkService,
                MaintenanceAdmissionMiddleware,
                { provide: APP_GUARD, useClass: WritingGuard },
            ],
        }).compile();
        const app: INestApplication = module.createNestApplication();
        const middleware = module.get(MaintenanceAdmissionMiddleware);
        app.use(middleware.use.bind(middleware));
        app.useGlobalFilters({ catch: filterWrite });
        await app.init();
        try {
            await request(app.getHttpServer())
                .get('/probe')
                .expect(200, { ok: true });
            expect(guardWrite).toHaveBeenCalledTimes(1);
            module.get(MaintenanceWorkService).closeAdmission();
            await request(app.getHttpServer()).get('/probe').expect(503);
            expect(guardWrite).toHaveBeenCalledTimes(1);
            expect(filterWrite).not.toHaveBeenCalled();
        } finally {
            await app.close();
        }
    });
});
