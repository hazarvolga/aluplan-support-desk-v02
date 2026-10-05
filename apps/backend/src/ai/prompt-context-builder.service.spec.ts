import { Test, TestingModule } from '@nestjs/testing';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
    user: { findUnique: jest.fn() },
    ticket: { findMany: jest.fn().mockResolvedValue([]) },
    macro: { findMany: jest.fn().mockResolvedValue([]) },
};

describe('PromptContextBuilderService licensing context', () => {
    let service: PromptContextBuilderService;

    beforeEach(async () => {
        jest.clearAllMocks();
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

    it('routes exact release 2024-1-10 to WIBU/CodeMeter and asks for the license topology', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Yeni bilgisayarda lisansımı etkinleştiremiyorum.',
            kbContent: 'Approved ALLPLAN licensing procedures.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2024-1-10',
                allplanBuildId: '2024-1-10',
                licenseType: 'Lisans dosyası okunamadı',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('2024-1-10 ve öncesi WIBU/CodeMeter lisans dönemi');
        expect(result).toContain('tek kullanıcı mı, lisans sunucusu/ağ lisansı mı');
        expect(result).toContain('Lisans tipi doğrulanmadan aktivasyon veya iade adımı verme');
        expect(result).not.toContain('eski bilgisayardaki lisansı iade etmeye gerek yoktur');
        expect(result).not.toContain('2024 ve sonrası tespit edilmiştir');
    });

    it('routes exact release 2024-2-0 to ALLPLAN ID cloud licensing', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Lisans aktivasyonu için ne yapmalıyım?',
            kbContent: 'Approved ALLPLAN licensing procedures.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2024-2-0',
                allplanBuildId: '2024-2-0',
                licenseType: 'Lisans dosyası okunamadı',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('2024-2-0 ve sonrası ALLPLAN ID bulut lisans dönemi');
        expect(result).toContain('ALLPLAN ID');
        expect(result).toContain('kuruluş daveti');
        expect(result).toContain('koltuk ataması');
        expect(result).not.toContain('Allmenu -> Lisans Ayarları (Wibu) -> Lisansı İade Et');
    });

    it('describes Connect for 2025-2027 only as the cloud-license administration layer', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Allplan 2026 lisans aktivasyonu ve koltuk ataması nasıl yapılır?',
            kbContent: 'Approved ALLPLAN licensing procedures.',
            hotinfoSnapshot: {
                allplanVersion: 'Allplan 2026-1-3',
                allplanBuildId: '39.1613.8530.664',
                licenseType: 'Lisans dosyası okunamadı',
            },
            skipHotinfoProfile: false,
        });

        expect(result).toContain('Connect portalı lisans teknolojisi değildir');
        expect(result).toContain('kullanıcı, kuruluş ve koltuk yönetim katmanıdır');
        expect(result).toContain('ALLPLAN ID bulut lisansı');
    });

    it('keeps Hotinfo optional and asks for the exact release before any risky license instruction', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Lisansımı yeni bilgisayara nasıl aktarırım?',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(result).toContain('Hotinfo isteğe bağlıdır');
        expect(result).toContain('tam ALLPLAN sürümünü ve build bilgisini sor');
        expect(result).toContain('2024-1-10 veya 2024-2-0 sınırı doğrulanmadan');
        expect(result).toContain('otomatik aktivasyon, lisans iadesi veya oturum kapatma adımı verme');
        expect(result).toContain('bilgi sağlanamazsa destek uzmanına yönlendir');
        expect(result).not.toContain('Allmenu -> Lisans Ayarları (Wibu) -> Lisansı İade Et');
        expect(result).not.toContain('aktif oturumlarını deaktive etmeli');
    });

    it('uses the confirmed intake version even when the description mentions an older release', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Allplan 2023 sürümünden geçiş yaptım ve lisansı etkinleştiremiyorum.',
            allplanVersion: '2024-2-0',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(result).toContain('2024-2-0 ve sonrası ALLPLAN ID bulut lisans dönemi');
        expect(result).not.toContain('tam ALLPLAN sürümünü ve build bilgisini sor');
    });

    it('fails closed when confirmed intake and consented Hotinfo belong to different eras', async () => {
        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Lisans aktivasyonu için yardım istiyorum.',
            allplanVersion: '2024-2-0',
            hotinfoSnapshot: { allplanVersion: 'Allplan 2023' },
            skipHotinfoProfile: false,
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(result).toContain('kullanıcı beyanı ile Hotinfo sürümü çelişiyor');
        expect(result).toContain('destek uzmanına yönlendir');
    });

    it('does not reload stored profile Hotinfo after the user opts out', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Test Customer',
            email: 'customer@example.com',
            customerProfile: {
                companyName: 'Aluplan Test',
                industry: 'AEC',
                hotinfoData: {
                    allplanVersion: 'Allplan 2024-2-0',
                    gpu: 'PRIVATE GPU DATA',
                },
            },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Lisans aktivasyonu için ne yapmalıyım?',
            kbContent: 'Approved ALLPLAN licensing procedures.',
            skipHotinfoProfile: true,
        });

        expect(result).not.toContain('PRIVATE GPU DATA');
        expect(result).not.toContain('[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]');
    });

    it('does not load stored profile Hotinfo when consent is omitted', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            fullName: 'Test Customer',
            email: 'customer@example.com',
            customerProfile: {
                companyName: 'Aluplan Test',
                industry: 'AEC',
                hotinfoData: {
                    allplanVersion: 'Allplan 2024-2-0',
                    gpu: 'PRIVATE GPU DATA',
                },
            },
        });

        const result = await service.buildContext({
            userId: 'user-1',
            userQuery: 'Lisans aktivasyonu için ne yapmalıyım?',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(result).not.toContain('PRIVATE GPU DATA');
        expect(result).not.toContain('[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]');
    });

    it('keeps release-boundary safeguards without profile enrichment', async () => {
        const exact = await service.buildContext({
            userQuery: 'Allplan 2024-1-10 lisans aktivasyonu',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });
        const ambiguous = await service.buildContext({
            userQuery: 'Allplan 2024 lisans aktivasyonu',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(exact).toContain('WIBU/CodeMeter');
        expect(ambiguous).toContain('tam ALLPLAN sürümünü ve build bilgisini');
        expect(ambiguous).toContain('otomatik aktivasyon, lisans iadesi veya oturum kapatma adımı verme');
    });

    it('applies licensing safeguards to German activation questions', async () => {
        const result = await service.buildContext({
            userQuery: 'Allplan 2024-2-0 Lizenz aktivieren',
            kbContent: 'Approved ALLPLAN licensing procedures.',
        });

        expect(result).toContain('ALLPLAN ID bulut lisans');
        expect(result).toContain('kuruluş daveti ve koltuk atamasını doğrula');
    });
});
