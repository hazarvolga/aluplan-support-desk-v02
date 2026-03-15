// P3 — Controller: CrmController (guard bypass, route → service delegation)
import { Test, TestingModule } from '@nestjs/testing';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

const mockCrmService = {
    getAllConnections: jest.fn(),
    upsertConnection: jest.fn(),
    verifyConnectionById: jest.fn(),
    triggerSync: jest.fn(),
    getSyncLogs: jest.fn(),
    getFieldDefinitions: jest.fn(),
    getDiscoveryData: jest.fn(),
    getAccounts: jest.fn(),
    getAccountById: jest.fn(),
    bulkDeleteAccounts: jest.fn(),
};

describe('CrmController', () => {
    let controller: CrmController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CrmController],
            providers: [{ provide: CrmService, useValue: mockCrmService }],
        })
            // Bypass guards in unit tests
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CrmController>(CrmController);
        jest.clearAllMocks();
    });

    it('getConnections → calls getAllConnections', async () => {
        mockCrmService.getAllConnections.mockResolvedValue([]);
        await controller.getConnections();
        expect(mockCrmService.getAllConnections).toHaveBeenCalled();
    });

    it('upsertConnection → delegates dto to service', async () => {
        const dto = { provider: 'DYNAMICS_365', tenantId: 't1' };
        mockCrmService.upsertConnection.mockResolvedValue({ id: 'conn-1' });
        await controller.upsertConnection(dto);
        expect(mockCrmService.upsertConnection).toHaveBeenCalledWith(dto);
    });

    it('verifyConnection → delegates id to service', async () => {
        mockCrmService.verifyConnectionById.mockResolvedValue({ success: true });
        await controller.verifyConnection('conn-1');
        expect(mockCrmService.verifyConnectionById).toHaveBeenCalledWith('conn-1');
    });

    it('triggerSync → delegates id to service', async () => {
        mockCrmService.triggerSync.mockResolvedValue({ logId: 'log-1' });
        await controller.triggerSync('conn-1');
        expect(mockCrmService.triggerSync).toHaveBeenCalledWith('conn-1');
    });

    it('getLogs → delegates connectionId to service', async () => {
        mockCrmService.getSyncLogs.mockResolvedValue([]);
        await controller.getLogs('conn-1');
        expect(mockCrmService.getSyncLogs).toHaveBeenCalledWith('conn-1');
    });

    it('getFieldsDefinitions → calls getFieldDefinitions', async () => {
        mockCrmService.getFieldDefinitions.mockResolvedValue({ account: [], contact: [] });
        await controller.getFieldsDefinitions();
        expect(mockCrmService.getFieldDefinitions).toHaveBeenCalled();
    });

    it('getDiscovery → delegates id to service', async () => {
        mockCrmService.getDiscoveryData.mockResolvedValue({ account: [], contact: [] });
        await controller.getDiscovery('conn-1');
        expect(mockCrmService.getDiscoveryData).toHaveBeenCalledWith('conn-1');
    });

    it('getAccounts → calls getAccounts', async () => {
        mockCrmService.getAccounts.mockResolvedValue([]);
        await controller.getAccounts();
        expect(mockCrmService.getAccounts).toHaveBeenCalled();
    });

    it('getAccount → delegates id to service', async () => {
        mockCrmService.getAccountById.mockResolvedValue({ id: 'acc-1' });
        await controller.getAccount('acc-1');
        expect(mockCrmService.getAccountById).toHaveBeenCalledWith('acc-1');
    });

    it('bulkDeleteAccounts → delegates ids to service', async () => {
        mockCrmService.bulkDeleteAccounts.mockResolvedValue({ deletedCount: 2 });
        await controller.bulkDeleteAccounts(['id1', 'id2']);
        expect(mockCrmService.bulkDeleteAccounts).toHaveBeenCalledWith(['id1', 'id2']);
    });
});
