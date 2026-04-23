/**
 * Property-Based Tests: PromptContextBuilderService
 * Feature: rag-faq-improvements
 * Property 1: kbContent context dahil edilmesi
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    ticket: { findMany: jest.fn().mockResolvedValue([]) },
    macro: { findMany: jest.fn().mockResolvedValue([]) },
};

describe.skip('PromptContextBuilderService — Property-Based Tests', () => {
    let service: PromptContextBuilderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromptContextBuilderService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(PromptContextBuilderService);
    });

    // Feature: rag-faq-improvements, Property 1: kbContent context dahil edilmesi
    it('P1: non-empty kbContent için [APPROVED KNOWLEDGE SOURCE] başlığı context başında yer alır', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                async (kbContent) => {
                    const result = await service.buildContext({ userQuery: 'test query', kbContent });
                    expect(result.startsWith('[APPROVED KNOWLEDGE SOURCE]')).toBe(true);
                    expect(result).toContain(kbContent);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 1.5: boş kbContent için bölüm eklenmez
    it('P1.5: boş veya whitespace-only kbContent için [APPROVED KNOWLEDGE SOURCE] bölümü eklenmez', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 10 }).map(s => s.replace(/\S/g, ' '))),
                async (kbContent) => {
                    const result = await service.buildContext({ userQuery: 'test query', kbContent });
                    expect(result).not.toContain('[APPROVED KNOWLEDGE SOURCE]');
                },
            ),
            { numRuns: 50 },
        );
    });

    // Feature: rag-faq-improvements, Property 1: kbContent her zaman diğer bölümlerden önce gelir
    it('P1: kbContent bölümü [3. Mevcut Sorgu] bölümünden önce gelir', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                async (kbContent) => {
                    const result = await service.buildContext({ userQuery: 'test query', kbContent });
                    const kbIdx = result.indexOf('[APPROVED KNOWLEDGE SOURCE]');
                    const queryIdx = result.indexOf('[3. Mevcut Sorgu]');
                    expect(kbIdx).toBeLessThan(queryIdx);
                },
            ),
            { numRuns: 100 },
        );
    });
});
