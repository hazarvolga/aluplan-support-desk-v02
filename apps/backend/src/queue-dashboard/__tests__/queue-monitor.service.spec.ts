import { Test, TestingModule } from '@nestjs/testing';
import { QueueMonitorService } from '../queue-monitor.service';
import { getQueueToken } from '@nestjs/bullmq';

const createMockQueue = (name: string) => {
    const eventHandlers: Record<string, Function[]> = {};
    return {
        name,
        events: {
            on: jest.fn((event: string, handler: Function) => {
                eventHandlers[event] = eventHandlers[event] || [];
                eventHandlers[event].push(handler);
            }),
        },
        getFailed: jest.fn(),
        _emit: (event: string, data: any) => {
            (eventHandlers[event] || []).forEach((h) => h(data));
        },
    };
};

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
        service.onModuleInit();
        expect(aiQueue.events.on).toHaveBeenCalledWith('stalled', expect.any(Function));
        expect(aiQueue.events.on).toHaveBeenCalledWith('failed', expect.any(Function));
        expect(aiQueue.events.on).toHaveBeenCalledWith('completed', expect.any(Function));
    });

    it('should get failed jobs from a queue', async () => {
        const failedJobs = [{ id: 'job-1' }];
        aiQueue.getFailed.mockResolvedValue(failedJobs);
        const result = await service.getFailedJobs('ai-query-processing', 10);
        expect(result).toEqual(failedJobs);
        expect(aiQueue.getFailed).toHaveBeenCalledWith(10, 0);
    });

    it('should throw for unknown queue name', async () => {
        await expect(service.getFailedJobs('unknown-queue' as any)).rejects.toThrow('Unknown queue');
    });
});
