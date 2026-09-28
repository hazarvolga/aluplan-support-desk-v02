import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgePoolService } from './knowledge-pool.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { mockPrismaService } from '../test/mock.utils';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

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
            findMany: jest.fn(),
            update: jest.fn(),
        },
        $queryRaw: jest.fn(),
        $transaction: jest.fn((callback: any) => callback(localMockPrismaService)),
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
        localMockPrismaService.knowledgeSource.findMany.mockResolvedValue([]);
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

    describe('createSource', () => {
        it('stores the user supplied URL name in metadata before initial sync', async () => {
            const source = {
                id: 'source-url',
                name: 'License server manual add article',
                type: KnowledgeSourceType.URL,
                url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=42&source=howto',
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({
                ...source,
                status: KnowledgeSourceStatus.SYNCING,
            });

            await service.createSource({
                name: 'License server manual add article',
                type: KnowledgeSourceType.URL,
                url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=42&source=howto',
            });

            expect(localMockPrismaService.knowledgeSource.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'License server manual add article',
                    type: KnowledgeSourceType.URL,
                    metadata: expect.objectContaining({
                        userProvidedName: 'License server manual add article',
                        sourceName: 'License server manual add article',
                        ingestionMode: 'bulk-safe',
                        useAiPreprocessing: false,
                    }),
                }),
            });
        });

        it('stores a canonical URL without retaining the raw submitted URL', async () => {
            const canonicalUrl = 'https://example.com/docs?a=1&b=2';
            const source = {
                id: 'source-canonical',
                name: 'Canonical source',
                type: KnowledgeSourceType.URL,
                url: canonicalUrl,
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.findMany.mockResolvedValue([]);
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue({
                ...source,
                status: KnowledgeSourceStatus.SYNCING,
            });

            await service.createSource({
                name: 'Canonical source',
                type: KnowledgeSourceType.URL,
                url: ' HTTPS://Example.COM:443/docs/?b=2&a=1#install ',
            });

            expect(localMockPrismaService.knowledgeSource.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    url: canonicalUrl,
                    metadata: expect.objectContaining({
                        sourceUrl: canonicalUrl,
                    }),
                }),
            });
            expect(localMockPrismaService.knowledgeSource.create.mock.calls[0][0].data.metadata)
                .not.toHaveProperty('submittedUrl');
        });

        it('rejects a canonical-equivalent duplicate without inserting or enqueueing', async () => {
            localMockPrismaService.knowledgeSource.findMany.mockResolvedValue([
                { id: 'existing-source', url: 'https://example.com/docs?b=2&a=1#old' },
            ]);

            await expect(service.createSource({
                name: 'Duplicate',
                type: KnowledgeSourceType.URL,
                url: 'https://EXAMPLE.com:443/docs/?a=1&b=2&utm_source=test',
            })).rejects.toThrow(ConflictException);

            expect(localMockPrismaService.knowledgeSource.create).not.toHaveBeenCalled();
            expect(mockQueue.add).not.toHaveBeenCalled();
        });

        it('takes a transaction-scoped URL identity lock before checking and creating', async () => {
            const source = {
                id: 'source-locked',
                name: 'Locked source',
                type: KnowledgeSourceType.URL,
                url: 'https://example.com/locked',
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.findMany.mockResolvedValue([]);
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue(source);

            await service.createSource({
                name: 'Locked source',
                type: KnowledgeSourceType.URL,
                url: 'https://example.com/locked',
            });

            expect(localMockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
            expect(localMockPrismaService.$transaction).toHaveBeenCalledTimes(1);
            const advisoryLockQuery = localMockPrismaService.$queryRaw.mock.calls[0][0];
            expect(advisoryLockQuery.strings.join(' ')).toContain('IS NULL AS locked');
            expect(localMockPrismaService.$queryRaw.mock.invocationCallOrder[0])
                .toBeLessThan(localMockPrismaService.knowledgeSource.findMany.mock.invocationCallOrder[0]);
            expect(localMockPrismaService.knowledgeSource.findMany.mock.invocationCallOrder[0])
                .toBeLessThan(localMockPrismaService.knowledgeSource.create.mock.invocationCallOrder[0]);
        });

        it('keeps canonical identity metadata authoritative for crawler imports', async () => {
            const source = {
                id: 'source-imported',
                name: 'Imported source',
                type: KnowledgeSourceType.URL,
                url: 'https://example.com/imported',
                metadata: { ingestionMode: 'bulk-safe' },
            };
            localMockPrismaService.knowledgeSource.create.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.findUnique.mockResolvedValue(source);
            localMockPrismaService.knowledgeSource.update.mockResolvedValue(source);

            await service.createImportedUrlSource({
                name: 'Imported source',
                type: KnowledgeSourceType.URL,
                url: 'https://EXAMPLE.com/imported/#section',
            }, {
                metadata: {
                    source: 'crawler',
                    sourceUrl: 'https://EXAMPLE.com/imported/#section',
                    ingestionMode: 'crawler-override',
                },
            });

            expect(localMockPrismaService.knowledgeSource.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    url: 'https://example.com/imported',
                    metadata: expect.objectContaining({
                        source: 'crawler',
                        sourceUrl: 'https://example.com/imported',
                        ingestionMode: 'bulk-safe',
                    }),
                }),
            });
        });

        it('rejects LearnNow course URLs because they require enrollment', async () => {
            await expect(service.createSource({
                name: 'Enrollment course',
                type: KnowledgeSourceType.URL,
                url: 'https://learnnow.allplan.com/course/view.php?id=123',
            })).rejects.toThrow(BadRequestException);

            expect(localMockPrismaService.knowledgeSource.create).not.toHaveBeenCalled();
            expect(mockQueue.add).not.toHaveBeenCalled();
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
