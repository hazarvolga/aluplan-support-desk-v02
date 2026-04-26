import { Test, TestingModule } from '@nestjs/testing';
import { LangfuseService } from './langfuse.service';
import { SettingsService } from '../settings/settings.service';

describe('LangfuseService — addEvent()', () => {
    let service: LangfuseService;

    const mockSettingsService = {
        getValue: jest.fn().mockResolvedValue(null),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LangfuseService,
                { provide: SettingsService, useValue: mockSettingsService },
            ],
        }).compile();

        service = module.get<LangfuseService>(LangfuseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should silently return without throwing when langfuse is null', async () => {
        (service as any).langfuse = null;

        await expect(
            service.addEvent('trace-1', 'test-event', { key: 'value' })
        ).resolves.toBeUndefined();
    });

    it('should call logger.error and not propagate exception when flushAsync throws', async () => {
        const mockEvent = jest.fn();
        const mockTrace = { event: mockEvent };
        const mockFlushAsync = jest.fn().mockRejectedValue(new Error('flush failed'));

        (service as any).langfuse = {
            trace: jest.fn().mockReturnValue(mockTrace),
            flushAsync: mockFlushAsync,
        };

        const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');

        await expect(
            service.addEvent('trace-1', 'test-event', { key: 'value' })
        ).resolves.toBeUndefined();

        expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should call trace.event() with correct arguments on a successful call', async () => {
        const mockEvent = jest.fn();
        const mockTrace = { event: mockEvent };
        const mockFlushAsync = jest.fn().mockResolvedValue(undefined);

        (service as any).langfuse = {
            trace: jest.fn().mockReturnValue(mockTrace),
            flushAsync: mockFlushAsync,
        };

        const payload = {
            previousKeywords: ['a'],
            newKeywords: ['b'],
            historyLength: 3,
            userId: 'user-1',
        };

        await service.addEvent('my-trace-id', 'problem-shift', payload);

        expect(mockEvent).toHaveBeenCalledWith({
            name: 'problem-shift',
            input: {
                previousKeywords: ['a'],
                newKeywords: ['b'],
                historyLength: 3,
                userId: 'user-1',
            },
        });
    });
});
