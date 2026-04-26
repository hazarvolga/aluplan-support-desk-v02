import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
    HealthCheckService,
    HttpHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DatabaseBackupService } from '../common/services/database-backup.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('HealthController', () => {
    let controller: HealthController;
    let prismaService: { $queryRaw: jest.Mock };
    let redisService: { getClient: jest.Mock };
    let queue: { client: any };
    let healthCheck: { check: jest.Mock };

    beforeEach(async () => {
        prismaService = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
        const redisClient = { ping: jest.fn().mockResolvedValue('PONG') };
        redisService = { getClient: jest.fn().mockReturnValue(redisClient) };
        const queueClient = { ping: jest.fn().mockResolvedValue('PONG') };
        queue = { client: Promise.resolve(queueClient) };

        // The HealthCheckService normally runs each indicator. We capture the
        // indicators array and assert on their behaviour individually.
        healthCheck = {
            check: jest.fn(async (indicators: any[]) => {
                const results = await Promise.all(indicators.map((i: any) => i()));
                return { status: 'ok', info: Object.assign({}, ...results) };
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                { provide: HealthCheckService, useValue: healthCheck },
                { provide: HttpHealthIndicator, useValue: {} },
                {
                    provide: MemoryHealthIndicator,
                    useValue: {
                        checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
                        checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: 'up' } }),
                    },
                },
                {
                    provide: DiskHealthIndicator,
                    useValue: { checkStorage: jest.fn().mockResolvedValue({ storage: { status: 'up' } }) },
                },
                { provide: PrismaService, useValue: prismaService },
                { provide: RedisService, useValue: redisService },
                { provide: DatabaseBackupService, useValue: { runBackup: jest.fn().mockResolvedValue({ ok: true }) } },
                { provide: getQueueToken('ai-query-processing'), useValue: queue },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('returns ok when all indicators are up', async () => {
        const result = await controller.check();
        expect(result.status).toBe('ok');
        expect(result.info).toMatchObject({
            memory_heap: { status: 'up' },
            database: { status: 'up' },
            redis: { status: 'up' },
            bullmq: { status: 'up' },
        });
    });

    it('reports database as down when the query fails', async () => {
        prismaService.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));
        const result = await controller.check();
        expect(result.info.database).toMatchObject({
            status: 'down',
            message: 'connection refused',
        });
    });

    it('reports redis as down when ping fails', async () => {
        redisService.getClient.mockReturnValueOnce({ ping: jest.fn().mockRejectedValue(new Error('redis timeout')) });
        const result = await controller.check();
        expect(result.info.redis).toMatchObject({
            status: 'down',
            message: 'redis timeout',
        });
    });

    it('reports bullmq as down when its underlying client cannot ping', async () => {
        queue.client = Promise.resolve({ ping: jest.fn().mockRejectedValue(new Error('queue offline')) });
        const result = await controller.check();
        expect(result.info.bullmq).toMatchObject({
            status: 'down',
            message: 'queue offline',
        });
    });

    it('triggers a manual backup via the admin endpoint', async () => {
        const result = await controller.triggerManualBackup();
        expect(result).toEqual({ ok: true });
    });
});
