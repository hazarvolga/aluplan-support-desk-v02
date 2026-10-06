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
                graphicsCards: [
                    {
                        name: 'NVIDIA RTX 4070',
                        vram: '12 GB',
                        ram: '',
                        driverDate: '2026-01-20',
                        driverVersion: '551.86',
                        resolution: '3840x2160',
                    },
                    {
                        name: 'AMD Radeon(TM) 880M Graphics',
                        vram: 'Bilinmiyor (Paylaşımlı Bellek)',
                        ram: '512 MB',
                        driverDate: 'Bilinmiyor',
                        driverVersion: 'Bilinmiyor',
                        resolution: '3840x2160',
                    },
                ],
                screenResolution: '3840x2160',
                licenseType: 'CodeMeter',
                installedModules: ['Architecture'],
                securityServices: ['Windows Defender'],
                conflictingProcesses: ['onedrive.exe'],
                defaultPrinter: 'PDF Printer',
                errorTrace: 'SEC Hata: test trace',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]');
        expect(result).toContain('Allplan Sürümü: 2026');
        expect(result).toContain('Allplan Hotfix/Patch: HF3');
        expect(result).toContain('OpenGL: 4.6');
        expect(result).toContain('Ekran Kartları Detayı');
        expect(result).toContain('NVIDIA RTX 4070');
        expect(result).toContain('AMD Radeon(TM) 880M Graphics');
        expect(result).toContain('Sürücü Tarihi: 2026-01-20');
        expect(result).toContain('RAM: 512 MB');
        expect(result).toContain('Lisans Telemetrisi: CodeMeter');
        expect(result).toContain('Güvenlik/Antivirüs Servisleri: Windows Defender');
        expect(result).toContain('Olası Çakışmalar: onedrive.exe');
        expect(result).toContain('Hata Kaydı/Trace: Hotinfo hata trace sinyali mevcut; ham trace ayrıntısı gizlendi.');
    });

    it('treats legacy unreadable license Hotinfo signals as low-confidence telemetry for non-license questions', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Murat Şahin',
            email: 'murat@example.com',
            customerProfile: {
                companyName: 'ENKA',
                industry: 'AEC',
                hotinfoData: null,
            },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'BIMPLUS depolama alanı yetersiz uyarısı alıyoruz',
            kbContent: 'BIMPLUS storage knowledge.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2026-1-3 Unicode 64-bit',
                allplanBuildId: '39.1613.8530.664',
                licenseType: '⚠ Lisans dosyası okunamadı',
                errorTrace: 'SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('Lisans Telemetrisi: Lisans telemetrisi mevcut (yöntem ayrıntısı gizlendi)');
        expect(result).toContain('Legacy yerel lisans trace sinyali mevcut; lisans dışı talepte kök neden olarak kullanılmamalı.');
        expect(result).not.toContain('- Lisans Tipi: ⚠ Lisans dosyası okunamadı');
        expect(result).not.toContain('C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE');
    });

    it('does not expose an opaque Product Key or license number in prompt context', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Murat Şahin',
            email: 'murat@example.com',
            customerProfile: { companyName: 'ENKA', industry: 'AEC', hotinfoData: null },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Allplan lisansımı yeni bilgisayara aktarmak istiyorum',
            kbContent: 'License transfer guidance.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2023',
                licenseType: 'Product Key 1234-5678-9012',
                hotinfoLicense: '1014361a',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('Lisans Telemetrisi: Lisans telemetrisi mevcut (yöntem ayrıntısı gizlendi)');
        expect(result).not.toContain('1234-5678-9012');
        expect(result).not.toContain('1014361a');
    });

    it('summarizes arbitrary Hotinfo traces without exposing raw paths or trace contents', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Murat Şahin',
            email: 'murat@example.com',
            customerProfile: { companyName: 'ENKA', industry: 'AEC', hotinfoData: null },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Allplan açılırken hata alıyorum',
            kbContent: 'Startup guidance.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2026',
                errorTrace: 'Exception: C:\\Users\\murat\\private-project\\trace-SECRET-123.log',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('Hotinfo hata trace sinyali mevcut; ham trace ayrıntısı gizlendi.');
        expect(result).not.toContain('private-project');
        expect(result).not.toContain('trace-SECRET-123');
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
