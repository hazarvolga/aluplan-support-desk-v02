import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgePoolService } from './knowledge-pool.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { mockPrismaService } from '../test/mock.utils';
import { NotFoundException } from '@nestjs/common';
import { KnowledgeSourceStatus } from '@aluplan/database';

describe('KnowledgePoolService - BullMQ Sync Job Flow', () => {
    let service: KnowledgePoolService;
    let syncQueue: any;

    const mockQueue = {
        add: jest.fn(),
    };

    const localMockPrismaService = {
        ...mockPrismaService,
        knowledgeSource: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KnowledgePoolService,
                { provide: PrismaService, useValue: localMockPrismaService },
                { provide: StorageService, useValue: { uploadFile: jest.fn(), deleteFile: jest.fn(), getSignedUrl: jest.fn(), testConnection: jest.fn() } },
                { provide: getQueueToken('knowledge-sync'), useValue: mockQueue },
            ],
        }).compile();

        service = module.get<KnowledgePoolService>(KnowledgePoolService);
        syncQueue = module.get(getQueueToken('knowledge-sync'));

        jest.clearAllMocks();
    });

    describe('triggerSync', () => {
        it('should throw NotFoundException if source does not exist', async () => {
            // Arrange
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.triggerSync('invalid-id')).rejects.toThrow(NotFoundException);
        });

        it('should update status and add job to BullMQ queue', async () => {
            // Arrange
            const source = { id: 'source-1', name: 'Test Source', status: KnowledgeSourceStatus.ACTIVE };
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({ ...source, status: KnowledgeSourceStatus.SYNCING });

            // Act
            await service.triggerSync('source-1');

            // Assert
            expect(localMockPrismaService.knowledgeSource.update).toHaveBeenCalledWith({
                where: { id: 'source-1' },
                data: { status: KnowledgeSourceStatus.SYNCING },
            });

            expect(mockQueue.add).toHaveBeenCalledWith(
                'sync-source',
                { sourceId: 'source-1' },
                expect.objectContaining({ attempts: 3, backoff: { type: 'exponential', delay: 5000 }, delay: 0 })
            );
        });

        it('should add a pacing delay for bulk-safe ingestion jobs', async () => {
            const original = process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS;
            process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS = '20000';

            const source = {
                id: 'source-2',
                name: 'Bulk Safe Source',
                status: KnowledgeSourceStatus.ACTIVE,
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({ ...source, status: KnowledgeSourceStatus.SYNCING });

            await service.triggerSync('source-2');

            expect(mockQueue.add).toHaveBeenCalledWith(
                'sync-source',
                { sourceId: 'source-2' },
                expect.objectContaining({ delay: 20000 })
            );

            if (original === undefined) {
                delete process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS;
            } else {
                process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS = original;
            }
        });
    });

    describe('createFileSource', () => {
        it('applies the shared dataset classifier metadata to UI uploads', async () => {
            const source = {
                id: 'source-upload',
                name: 'TR License Transfer',
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({
                ...source,
                status: KnowledgeSourceStatus.SYNCING,
            });

            await service.createFileSource(
                'TR License Transfer',
                'FILE_PDF' as any,
                {
                    originalname: 'FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf',
                    path: 'knowledge-pool/uploaded-license.pdf',
                } as Express.Multer.File,
            );

            expect(localMockPrismaService.knowledgeSource.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    language: 'tr',
                    metadata: expect.objectContaining({
                        category: 'License & Activation',
                        categorySlug: 'license-activation',
                        canonicalSource: 'pdf',
                        importBatch: 'ui-upload',
                        ingestionMode: 'bulk-safe',
                    }),
                }),
            }));
        });

        it('stores Word uploads with DOCX metadata and bulk-safe ingestion', async () => {
            const source = {
                id: 'source-docx',
                name: 'Word Manual',
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({
                ...source,
                status: KnowledgeSourceStatus.SYNCING,
            });

            await service.createFileSource(
                'Word Manual',
                'FILE_DOCX' as any,
                {
                    originalname: 'Allplan Word Manual.docx',
                    path: 'knowledge-pool/allplan-word-manual.docx',
                } as Express.Multer.File,
            );

            expect(localMockPrismaService.knowledgeSource.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    type: 'FILE_DOCX',
                    metadata: expect.objectContaining({
                        importBatch: 'ui-upload',
                        ingestionMode: 'bulk-safe',
                    }),
                }),
            }));
        });
    });
});
