import { Test, TestingModule } from '@nestjs/testing';
import { AlertingService } from '../alerting.service';
import { ConfigService } from '@nestjs/config';

describe('AlertingService', () => {
    let service: AlertingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AlertingService,
                { provide: ConfigService, useValue: { get: () => undefined } },
            ],
        }).compile();

        service = module.get<AlertingService>(AlertingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should log alert when no webhook configured', async () => {
        const logSpy = jest.spyOn((service as any).logger, 'warn');
        await service.sendAlert('database', 'down', 'Connection timeout');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('database'));
    });

    it('should respect cooldown for repeated down alerts', async () => {
        await service.sendAlert('redis', 'down');
        const logSpy = jest.spyOn((service as any).logger, 'warn');
        await service.sendAlert('redis', 'down'); // same alert within cooldown
        expect(logSpy).not.toHaveBeenCalled();
    });

    it('should allow up alert after down alert', async () => {
        const logSpy = jest.spyOn((service as any).logger, 'warn');
        await service.sendAlert('redis', 'down');
        await service.sendAlert('redis', 'up');
        expect(logSpy).toHaveBeenCalledTimes(2);
    });
});
