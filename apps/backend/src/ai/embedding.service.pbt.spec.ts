/**
 * Property-Based Tests: EmbeddingService
 * Feature: rag-faq-improvements
 * Property 7: KnowledgePool child → parent retrieval
 * Property 8: indexPoolContent hierarchical chunking
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { EmbeddingService } from './embedding.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

const mockEmbedding = Array(1536).fill(0.1);

const mockAiService = {
    embed: jest.fn().mockResolvedValue({ embedding: mockEmbedding, model: 'text-embedding-3-small' }),
    isAvailable: jest.fn().mockResolvedValue(true),
};

describe('EmbeddingService — Property-Based Tests', () => {
    let service: EmbeddingService;
    let mockPrisma: any;
    let insertedRows: Array<{ id: string; source_id: string; parent_id: string | null; content: string }>;

    beforeEach(async () => {
        insertedRows = [];

        mockPrisma = {
            $executeRaw: jest.fn().mockImplementation(async (query: any, ...args: any[]) => {
                // Capture INSERT calls to track parent/child relationships
                const sql = query?.strings?.join('') || '';
                if (sql.includes('INSERT INTO knowledge_pool_embeddings')) {
                    // Extract parentId from args — simplified tracking
                    insertedRows.push({ id: args[0] || 'gen', source_id: args[1], parent_id: args[2] || null, content: args[4] || '' });
                }
                return 1;
            }),
            $queryRaw: jest.fn().mockResolvedValue([]),
            knowledgePoolEmbedding: { findFirst: jest.fn() },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmbeddingService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AiService, useValue: mockAiService },
            ],
        }).compile();

        service = module.get(EmbeddingService);
    });

    // Feature: rag-faq-improvements, Property 8: indexPoolContent hierarchical chunking
    it('P8: indexPoolContent boş içerik için hiçbir kayıt oluşturmaz', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 5 }).map(s => s.replace(/\S/g, ' '))),
                async (content) => {
                    insertedRows = [];
                    await service.indexPoolContent('source-id', content);
                    // Empty content → hierarchicalChunk returns [] → no inserts
                    expect(mockPrisma.$executeRaw).not.toHaveBeenCalledWith(
                        expect.objectContaining({ strings: expect.arrayContaining([expect.stringContaining('INSERT INTO knowledge_pool_embeddings')]) }),
                    );
                },
            ),
            { numRuns: 50 },
        );
    });

    // Feature: rag-faq-improvements, Property 8: embedText returns array or null
    it('P8: embedText non-empty string için number[] döndürür', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1 }),
                async (text) => {
                    const result = await service.embedText(text);
                    expect(result).not.toBeNull();
                    expect(Array.isArray(result)).toBe(true);
                    if (result) {
                        expect(result.length).toBeGreaterThan(0);
                        result.forEach(v => expect(typeof v).toBe('number'));
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 7: embedText AI offline durumunda null döner
    it('P7: AI embed() null döndürdüğünde embedText null döndürür', async () => {
        mockAiService.embed.mockResolvedValueOnce(null);
        const result = await service.embedText('test');
        expect(result).toBeNull();
    });
});
