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

describe('PromptContextBuilderService — Property-Based Tests', () => {
    let service: PromptContextBuilderService;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.ticket.findMany.mockResolvedValue([]);
        mockPrisma.macro.findMany.mockResolvedValue([]);

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

    it('includes ticket-specific Hotinfo diagnostic fields in the prompt context', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Test Customer',
            email: 'customer@example.com',
            customerProfile: {
                companyName: 'Aluplan Test',
                industry: 'AEC',
                hotinfoData: null,
            },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Hotinfo dosyamı analiz eder misin?',
            kbContent: 'Allplan performance knowledge.',
            hotinfoSnapshot: {
                allplanVersion: '2026',
                allplanBuildId: '2026-1-2',
                allplanHotfix: 'HF3',
                osVersion: 'Windows 11 24H2',
                cpu: 'Intel Core i9',
                gpu: 'NVIDIA RTX 4070',
                gpuDriverVersion: '551.86',
                openglVersion: '4.6',
                ram: '32 GB',
                vram: '12 GB',
                screenResolution: '3840x2160',
                licenseType: 'CodeMeter',
                installedModules: ['Architecture'],
                securityServices: ['Windows Defender'],
                conflictingProcesses: ['onedrive.exe'],
                defaultPrinter: 'PDF Printer',
                errorTrace: 'SEC Hata: test trace',
            },
        });

        expect(result).toContain('[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]');
        expect(result).toContain('Allplan Sürümü: 2026');
        expect(result).toContain('Allplan Hotfix/Patch: HF3');
        expect(result).toContain('OpenGL: 4.6');
        expect(result).toContain('Lisans Tipi: CodeMeter');
        expect(result).toContain('Güvenlik/Antivirüs Servisleri: Windows Defender');
        expect(result).toContain('Olası Çakışmalar: onedrive.exe');
        expect(result).toContain('Hata Kaydı/Trace: SEC Hata: test trace');
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
    it('P1: kbContent bölümü [ACTIVE QUERY] bölümünden önce gelir', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                async (kbContent) => {
                    const result = await service.buildContext({ userQuery: 'test query', kbContent });
                    const kbIdx = result.indexOf('[APPROVED KNOWLEDGE SOURCE]');
                    const queryIdx = result.indexOf('[ACTIVE QUERY');
                    expect(kbIdx).toBeLessThan(queryIdx);
                },
            ),
            { numRuns: 100 },
        );
    });
});
