import { Test, TestingModule } from '@nestjs/testing';
import { QueueMonitorService } from '../queue-monitor.service';
import { getQueueToken } from '@nestjs/bullmq';

// QueueMonitorService creates QueueEvents internally via `new QueueEvents(...)`.
// We mock the bullmq module so QueueEvents is a no-op in tests.
jest.mock('bullmq', () => {
    const actual = jest.requireActual('bullmq');
    return {
        ...actual,
        QueueEvents: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        })),
    };
});

const createMockQueue = (name: string) => ({
    name,
    opts: { connection: { host: 'localhost', port: 6379 } },
    getFailed: jest.fn(),
});

describe('QueueMonitorService', () => {
    let service: QueueMonitorService;
    let aiQueue: any;
    let emailQueue: any;
    let crmQueue: any;
    let docQueue: any;

    beforeEach(async () => {
        aiQueue = createMockQueue('ai-query-processing');
        emailQueue = createMockQueue('email');
        crmQueue = createMockQueue('crm-sync');
        docQueue = createMockQueue('document-parsing');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueMonitorService,
                { provide: getQueueToken('ai-query-processing'), useValue: aiQueue },
                { provide: getQueueToken('email'), useValue: emailQueue },
                { provide: getQueueToken('crm-sync'), useValue: crmQueue },
                { provide: getQueueToken('document-parsing'), useValue: docQueue },
            ],
        }).compile();

        service = module.get<QueueMonitorService>(QueueMonitorService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should attach event listeners on module init', () => {
        const { QueueEvents } = require('bullmq');
        service.onModuleInit();
        // QueueEvents is instantiated once per queue (4 queues)
        expect(QueueEvents).toHaveBeenCalledTimes(4);
        // Each QueueEvents instance has .on called for stalled, failed, completed
        const instance = QueueEvents.mock.results[0].value;
        expect(instance.on).toHaveBeenCalledWith('stalled', expect.any(Function));
        expect(instance.on).toHaveBeenCalledWith('failed', expect.any(Function));
        expect(instance.on).toHaveBeenCalledWith('completed', expect.any(Function));
    });

    it('should get failed jobs from a queue', async () => {
        const failedJobs = [{ id: 'job-1' }];
        aiQueue.getFailed.mockResolvedValue(failedJobs);
        const result = await service.getFailedJobs('ai-query-processing', 10);
        expect(result).toEqual(failedJobs);
        // getFailedJobs calls queue.getFailed(0, count)
        expect(aiQueue.getFailed).toHaveBeenCalledWith(0, 10);
    });

    it('should throw for unknown queue name', async () => {
        await expect(service.getFailedJobs('unknown-queue' as any)).rejects.toThrow('Unknown queue');
    });
});
