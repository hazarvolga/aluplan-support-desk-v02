import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { MetricsService } from '../metrics/metrics.service';

const disconnect = jest.fn();
jest.mock('@aluplan/database', () => ({
    PrismaClient: class {
        async $connect() { }
        async $disconnect() { disconnect(); }
        $extends() { return {}; }
    },
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
jest.mock('pg', () => ({ Pool: class {} }));
jest.mock('../metrics/metrics.service', () => ({ MetricsService: class {} }));

// Real PrismaService constructor/proxy and Nest lifecycle, synthetic driver only.
// This tests hook discovery/order, not PostgreSQL durability or all-worker drain.
describe('Prisma shutdown phase through service proxy', () => {
    it('keeps the driver connected until an outstanding destroy hook completes', async () => {
        disconnect.mockClear();
        let release!: () => void;
        const outstanding = new Promise<void>((resolve) => { release = resolve; });
        const events: string[] = [];
        disconnect.mockImplementation(() => { events.push('disconnect'); });
        const module = await Test.createTestingModule({ providers: [
            PrismaService,
            { provide: MetricsService, useValue: { setDbPoolConnections: jest.fn() } },
            { provide: 'synthetic-draining-worker', useValue: {
                async onModuleDestroy() {
                    events.push('drain-start');
                    await outstanding;
                    events.push('drain-end');
                },
            } },
        ] }).compile();
        await module.init();
        const closing = module.close();
        try {
            await new Promise<void>((resolve) => setImmediate(resolve));
            expect(events).toEqual(['drain-start']);
            expect(disconnect).not.toHaveBeenCalled();
        } finally {
            release();
            await closing;
        }
        expect(events).toEqual(['drain-start', 'drain-end', 'disconnect']);
        expect(disconnect).toHaveBeenCalledTimes(1);
    });
});
