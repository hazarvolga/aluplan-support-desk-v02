// P0 — Güvenlik + Orkestrasyon: CrmWebhookController
import { Test, TestingModule } from '@nestjs/testing';
import { CrmWebhookController } from './crm-webhook.controller';
import { CrmService } from '../crm.service';
import { CrmWebhookGuard } from '../guards/crm-webhook.guard';
import { BadRequestException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

const mockCrmService = {
    processDynamics365Webhook: jest.fn(),
};

describe('CrmWebhookController', () => {
    let controller: CrmWebhookController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CrmWebhookController],
            providers: [{ provide: CrmService, useValue: mockCrmService }],
        })
            .overrideGuard(CrmWebhookGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CrmWebhookController>(CrmWebhookController);
        jest.clearAllMocks();
    });

    it('should return success when webhook is processed', async () => {
        mockCrmService.processDynamics365Webhook.mockResolvedValue(undefined);

        const result = await controller.handleDynamics365Webhook({
            entity: 'account',
            data: { accountid: 'acc-1', name: 'Test' },
        });

        expect(result).toEqual({ status: 'success', message: 'Webhook processed' });
        expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith({
            entity: 'account',
            data: { accountid: 'acc-1', name: 'Test' },
        });
    });

    it('keeps the Dynamics webhook route public while retaining the signature guard', async () => {
        const publicMetadata = Reflect.getMetadata(
            IS_PUBLIC_KEY,
            CrmWebhookController.prototype.handleDynamics365Webhook,
        );
        const guards = Reflect.getMetadata(
            '__guards__',
            CrmWebhookController.prototype.handleDynamics365Webhook,
        );

        expect(publicMetadata).toBe(true);
        expect(guards).toContain(CrmWebhookGuard);
    });

    it('should propagate BadRequestException for unsupported entity', async () => {
        mockCrmService.processDynamics365Webhook.mockRejectedValue(
            new BadRequestException('Unsupported entity type: lead'),
        );

        await expect(
            controller.handleDynamics365Webhook({ entity: 'lead', data: {} }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should propagate errors from service', async () => {
        mockCrmService.processDynamics365Webhook.mockRejectedValue(new Error('DB error'));

        await expect(
            controller.handleDynamics365Webhook({ entity: 'account', data: {} }),
        ).rejects.toThrow('DB error');
    });

    it('should delegate contact payload to service', async () => {
        mockCrmService.processDynamics365Webhook.mockResolvedValue(undefined);
        const payload = {
            entity: 'contact',
            data: { contactid: 'con-1', emailaddress1: 'test@test.com' },
        };

        await controller.handleDynamics365Webhook(payload);

        expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith(payload);
    });
});
