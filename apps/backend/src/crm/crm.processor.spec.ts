import { Test, TestingModule } from '@nestjs/testing';
import { CrmProcessor } from './crm.processor';
import { CrmService } from './crm.service';
import { CrmDeltaSyncService } from './services/crm-delta-sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { SyncStatus } from '@aluplan/database';

describe('CrmProcessor', () => {
    let processor: CrmProcessor;
    let mockCrmService: any;
    let mockCrmDeltaSyncService: any;
    let mockPrisma: any;

    beforeEach(async () => {
        mockCrmService = {
            getAdapter: jest.fn(),
            decryptSecret: jest.fn((v: string) => `decrypted-${v}`),
            executeSyncProcess: jest.fn(),
        };
        mockCrmDeltaSyncService = {
            runScheduledDeltaSync: jest.fn(),
        };
        mockPrisma = {
            crmConnection: { findUnique: jest.fn() },
            crmSyncLog: { update: jest.fn() },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CrmProcessor,
                { provide: CrmService, useValue: mockCrmService },
                { provide: CrmDeltaSyncService, useValue: mockCrmDeltaSyncService },
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        processor = module.get<CrmProcessor>(CrmProcessor);
    });

    describe('process', () => {
        const mockJob: any = {
            id: 'job-1',
            data: { connectionId: 'conn-1', logId: 'log-1' },
        };

        it('should execute delta sync successfully if job name is delta-sync', async () => {
            const deltaJob: any = {
                id: 'job-delta',
                name: 'delta-sync',
                data: {},
            };

            const result = await processor.process(deltaJob);

            expect(result.status).toBe('completed');
            expect(result.type).toBe('delta');
            expect(mockCrmDeltaSyncService.runScheduledDeltaSync).toHaveBeenCalled();
        });

        it('should execute sync process successfully', async () => {
            const mockConnection = { id: 'conn-1', provider: 'DYNAMICS_365', clientSecret: 'sec' };
            mockPrisma.crmConnection.findUnique.mockResolvedValue(mockConnection);
            const mockAdapter = { provider: 'DYNAMICS_365' };
            mockCrmService.getAdapter.mockReturnValue(mockAdapter);

            const result = await processor.process(mockJob);

            expect(result.status).toBe('completed');
            expect(mockCrmService.decryptSecret).toHaveBeenCalledWith('sec');
            expect(mockCrmService.executeSyncProcess).toHaveBeenCalledWith(
                expect.objectContaining({ clientSecret: 'decrypted-sec' }),
                mockAdapter,
                'log-1'
            );
        });

        it('should throw error if connection not found', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue(null);
            await expect(processor.process(mockJob)).rejects.toThrow('CRM connection conn-1 not found');
        });
    });

    describe('onFailed', () => {
        it('should update sync log to ERROR status on final attempt', async () => {
            const mockJob: any = {
                data: { logId: 'log-1' },
                attemptsMade: 3,
                opts: { attempts: 3 }
            };
            const error = new Error('Sync failed');

            await processor.onFailed(mockJob, error);

            expect(mockPrisma.crmSyncLog.update).toHaveBeenCalledWith({
                where: { id: 'log-1' },
                data: expect.objectContaining({
                    status: SyncStatus.ERROR,
                    errorMessage: 'Sync failed'
                })
            });
        });

        it('should not update sync log to ERROR status if more attempts remain', async () => {
            const mockJob: any = {
                data: { logId: 'log-1' },
                attemptsMade: 1,
                opts: { attempts: 3 }
            };
            const error = new Error('Sync failed');

            await processor.onFailed(mockJob, error);

            expect(mockPrisma.crmSyncLog.update).not.toHaveBeenCalled();
        });
    });
});
