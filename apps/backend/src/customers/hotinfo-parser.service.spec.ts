import { Test, TestingModule } from '@nestjs/testing';
import { HotinfoParserService } from './hotinfo-parser.service';

describe('HotinfoParserService', () => {
    let service: HotinfoParserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HotinfoParserService],
        }).compile();

        service = module.get<HotinfoParserService>(HotinfoParserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should successfully parse valid generic XML structures', () => {
        const mockXml = `<?xml version="1.0" encoding="utf-8"?>
        <hotinfo>
            <system>
                <item name="OS">Windows 10</item>
            </system>
            <cadinfo>
                <allplanversion>
                    <item name="Version">2024.1</item>
                </allplanversion>
            </cadinfo>
        </hotinfo>`;

        const parsedData = service.parseHotinfo(mockXml);

        expect(parsedData).toBeDefined();
        // The service logic transforms keys
        expect(parsedData!).toHaveProperty('allplanVersion');
        expect(parsedData!.allplanVersion).toBe('2024.1');
    });

    it('should return null for invalid XML strings', () => {
        const badXml = `<UnclosedTag>Missing</AnotherTag>`;
        const result = service.parseHotinfo(badXml);
        expect(result).toBeNull();
    });

    it('should extract error traces, map Windows versions, and identify conflicting processes', () => {
        const mockXml = `<?xml version="1.0" encoding="utf-8"?>
        <hotinfo>
            <cadinfo>
                <sec>Dosya kullanılamıyor. (C:\\\\License\\\\_SEC.NSE)</sec>
            </cadinfo>
            <system>
                <platform name="Microsoft Windows 11 Enterprise">
                    <system-caption>Microsoft Windows 11</system-caption>
                    <build>26200</build>
                </platform>
                <processes>
                    <process>C:\\\\Program Files\\\\Microsoft OneDrive\\\\OneDrive.exe</process>
                    <process>C:\\\\Windows\\\\System32\\\\svchost.exe</process>
                    <process>C:\\\\Program Files\\\\WindowsApps\\\\MSTeams\\\\teams.exe</process>
                </processes>
            </system>
            <traceinfo>
                <trace application="allplan">Dosya okunamadı.</trace>
            </traceinfo>
        </hotinfo>`;

        const parsedData = service.parseHotinfo(mockXml);

        expect(parsedData).toBeDefined();
        if (parsedData) {
            expect(parsedData.osVersion).toContain('Windows 11');
            expect(parsedData.osVersion).toContain('24H2');

            expect(parsedData.errorTrace).toContain('SEC Hata: Dosya kullanılamıyor.');
            expect(parsedData.errorTrace).toContain('Trace: Dosya okunamadı.');

            expect(parsedData.conflictingProcesses).toContain('onedrive.exe');
            expect(parsedData.conflictingProcesses).toContain('teams.exe');
            expect(parsedData.conflictingProcesses).not.toContain('svchost.exe');
        }
    });
});
