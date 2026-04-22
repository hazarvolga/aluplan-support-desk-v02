import { Test, TestingModule } from '@nestjs/testing';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiDiagnosisService', () => {
    let service: AiDiagnosisService;
    let mockPrisma: any;

    beforeEach(async () => {
        mockPrisma = {
            product: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiDiagnosisService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<AiDiagnosisService>(AiDiagnosisService);
    });

    describe('analyze', () => {
        const mockProducts = [
            {
                id: 'p1',
                name: 'SCIA Engineer',
                isActive: true,
                categories: [
                    { id: 'c1', name: 'Modeling', keywords: ['mesh', 'node', 'fem'], isActive: true },
                    { id: 'c2', name: 'Licensing', keywords: ['wibu', 'license', 'activate'], isActive: true },
                ],
            },
            {
                id: 'p2',
                name: 'ZWCAD',
                isActive: true,
                categories: [
                    { id: 'c3', name: 'Drafting', keywords: ['line', 'block', 'dwg'], isActive: true },
                ],
            }
        ];

        it('should identify product by name in query', async () => {
            mockPrisma.product.findMany.mockResolvedValue(mockProducts);

            const result = await service.analyze('SCIA Engineer setup issue');

            expect(result.productId).toBe('p1');
            expect(result.productName).toBe('SCIA Engineer');
        });

        it('should identify categories and keywords', async () => {
            mockPrisma.product.findMany.mockResolvedValue(mockProducts);

            const result = await service.analyze('How to mesh in SCIA Engineer?');

            expect(result.categoryNames).toContain('Modeling');
            expect(result.matchedKeywords).toContain('mesh');
        });

        it('should detect problem shift when history doesnt match new keywords', async () => {
            mockPrisma.product.findMany.mockResolvedValue(mockProducts);

            const history = ['I am basic user', 'Where is buttons?'];
            const result = await service.analyze('Now license activate failed with wibu error', history);

            expect(result.isProblemShift).toBe(true);
        });

        it('should NOT detect problem shift when history overlaps', async () => {
            mockPrisma.product.findMany.mockResolvedValue(mockProducts);

            const history = ['My license is broken', 'Looking for wibu'];
            const result = await service.analyze('Still license activate failed', history);

            expect(result.isProblemShift).toBe(false);
        });

        it('should map generic causes like installation', async () => {
            mockPrisma.product.findMany.mockResolvedValue([]);
            const result = await service.analyze('How to setup or install?');

            expect(result.suggestedCauses).toContainEqual(expect.objectContaining({
                id: 'installation_midway_failure'
            }));
        });

        it('should map product-specific causes', async () => {
            mockPrisma.product.findMany.mockResolvedValue(mockProducts);
            const result = await service.analyze('mesh instability in SCIA Engineer');

            expect(result.suggestedCauses).toContainEqual(expect.objectContaining({
                id: 'fem_mesh_instability'
            }));
        });
    });
});
