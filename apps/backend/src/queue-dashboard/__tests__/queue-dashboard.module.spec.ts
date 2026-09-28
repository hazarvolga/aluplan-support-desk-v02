import { MODULE_METADATA } from '@nestjs/common/constants';
import { QueueDashboardModule } from '../queue-dashboard.module';
import { QueueMonitorService } from '../queue-monitor.service';
import { StalledJobRecoveryService } from '../stalled-job-recovery.service';
import { createBullBoard } from '@bull-board/api';

jest.mock('@bull-board/api', () => ({ createBullBoard: jest.fn() }));
jest.mock('@bull-board/api/bullMQAdapter', () => ({
    BullMQAdapter: jest.fn().mockImplementation((queue) => ({ queue })),
}));
jest.mock('@bull-board/express', () => ({
    ExpressAdapter: jest.fn().mockImplementation(() => ({
        setBasePath: jest.fn(),
        getRouter: jest.fn().mockReturnValue('bull-board-router'),
    })),
}));

describe('QueueDashboardModule registration', () => {
    it('keeps queue monitoring but does not start autonomous failed-job retries', () => {
        const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, QueueDashboardModule);
        const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, QueueDashboardModule);

        expect(providers).toContain(QueueMonitorService);
        expect(exports).toContain(QueueMonitorService);
        expect(providers).not.toContain(StalledJobRecoveryService);
        expect(exports).not.toContain(StalledJobRecoveryService);
    });

    it('still mounts Bull Board in API mode', () => {
        const previousWorkerMode = process.env.WORKER_MODE;
        delete process.env.WORKER_MODE;

        try {
            const app = { use: jest.fn() };
            const queues = [{ name: 'ai' }, { name: 'document' }, { name: 'crm' }, { name: 'email' }];
            const module = new QueueDashboardModule(
                queues[0] as any,
                queues[1] as any,
                queues[2] as any,
                queues[3] as any,
                { httpAdapter: { getInstance: () => app } } as any,
                { get: () => 'development' } as any,
            );

            module.onModuleInit();

            expect(createBullBoard).toHaveBeenCalledTimes(1);
            expect(app.use).toHaveBeenCalledWith('/admin/queues', 'bull-board-router');
        } finally {
            if (previousWorkerMode === undefined) delete process.env.WORKER_MODE;
            else process.env.WORKER_MODE = previousWorkerMode;
        }
    });
});
