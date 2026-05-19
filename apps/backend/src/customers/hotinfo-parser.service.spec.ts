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

    it('should correctly map the entire range of Windows builds', () => {
        const testCases = [
            { build: '26200', expected: '25H2' },
            { build: '26100', expected: '24H2' },
            { build: '22631', expected: '23H2' },
            { build: '22621', expected: '22H2' },
            { build: '22000', expected: '21H2' },
            { build: '19045', expected: '22H2' },
            { build: '19044', expected: '21H2' },
            { build: '19043', expected: '21H1' },
            { build: '19042', expected: '20H2' },
            { build: '19041', expected: '2004' },
            { build: '18363', expected: '1909' },
            { build: '18362', expected: '1903' },
            { build: '17763', expected: '1809' },
            { build: '17134', expected: '1803' },
            { build: '16299', expected: '1709' },
            { build: '15063', expected: '1703' },
        ];

        testCases.forEach(({ build, expected }) => {
            const xml = `<hotinfo><system><platform name="Win"><build>${build}</build></platform></system></hotinfo>`;
            const data = service.parseHotinfo(xml);
            expect(data?.osVersion).toContain(expected);
        });
    });

    it('should extract screen resolution from multiple possible XML locations', () => {
        const xmlDisplay = `<hotinfo><system><display resolution="1920x1080" /></system></hotinfo>`;
        const xmlVideo = `<hotinfo><system><video screen-resolution="2560x1440" /></system></hotinfo>`;
        const xmlVideoWH = `<hotinfo><system><video screen-width="3840" screen-height="2160" /></system></hotinfo>`;

        expect(service.parseHotinfo(xmlDisplay)?.screenResolution).toBe('1920x1080');
        expect(service.parseHotinfo(xmlVideo)?.screenResolution).toBe('2560x1440');
        expect(service.parseHotinfo(xmlVideoWH)?.screenResolution).toBe('3840x2160');
    });

    it('should expose primary and secondary graphics cards with support details', () => {
        const xml = `<hotinfo>
            <system>
                <video
                    card-description="NVIDIA RTX A2000"
                    dedicated-memory="4294967296"
                    adapter-ram="8589934592"
                    screen-resolution="1920 x 1080 x True Color (32bit)"
                    driver-date="2026-01-15"
                    driver-version="31.0.15.5186">
                    <additional-graphics-adapters>
                        <graphics-adapter
                            card-description="Intel UHD Graphics"
                            dedicated-memory="536870912"
                            adapter-ram="2147483648"
                            driver-date="2025-11-10"
                            driver-version="31.0.101.5333" />
                    </additional-graphics-adapters>
                </video>
            </system>
        </hotinfo>`;

        const data = service.parseHotinfo(xml);

        expect(data?.graphicsCards).toHaveLength(2);
        expect(data?.graphicsCards[0]).toMatchObject({
            name: 'NVIDIA RTX A2000',
            vram: '4 GB',
            ram: '8 GB',
            resolution: '1920 x 1080 x True Color (32bit)',
            driverDate: '2026-01-15',
            driverVersion: '31.0.15.5186',
        });
        expect(data?.graphicsCards[1]).toMatchObject({
            name: 'Intel UHD Graphics',
            vram: '512 MB',
            ram: '2 GB',
            resolution: '1920 x 1080 x True Color (32bit)',
            driverDate: '2025-11-10',
            driverVersion: '31.0.101.5333',
        });
        expect(data?.gpu).toBe('NVIDIA RTX A2000 / Intel UHD Graphics');
    });

    it('should split collapsed dual-GPU names and read item-style driver fields', () => {
        const xml = `<hotinfo>
            <system>
                <video>
                    <item name="Graphics Card">NVIDIA GeForce RTX 5070 Laptop GPU / AMD Radeon(TM) 880M Graphics</item>
                    <item name="VRAM">536870912</item>
                    <item name="RAM">2147483648</item>
                    <item name="Resolution">1920 x 1080 x Gerçek Renk (32bit)</item>
                    <item name="Driver Date">2026-04-12</item>
                    <item name="Driver Version">32.0.15.7602</item>
                </video>
            </system>
        </hotinfo>`;

        const data = service.parseHotinfo(xml);

        expect(data?.graphicsCards).toHaveLength(2);
        expect(data?.graphicsCards[0]).toMatchObject({
            name: 'NVIDIA GeForce RTX 5070 Laptop GPU',
            vram: '512 MB',
            ram: '2 GB',
            resolution: '1920 x 1080 x Gerçek Renk (32bit)',
            driverDate: '2026-04-12',
            driverVersion: '32.0.15.7602',
        });
        expect(data?.graphicsCards[1]).toMatchObject({
            name: 'AMD Radeon(TM) 880M Graphics',
            resolution: '1920 x 1080 x Gerçek Renk (32bit)',
        });
        expect(data?.graphicsCards[1].vram).toBe('');
        expect(data?.gpu).toBe('NVIDIA GeForce RTX 5070 Laptop GPU / AMD Radeon(TM) 880M Graphics');
    });

    it('should extract comprehensive diagnostic data (Registry, Drives, Printers, EnvVars)', () => {
        const mockXml = `<?xml version="1.0" encoding="utf-8"?>
        <hotinfo>
            <cadinfo>
                <registry>
                    <item name="DataPath">C:\\Data</item>
                    <item name="ProgramPath">C:\\Prg</item>
                </registry>
                <allplanversion>
                    <item name="Version">Allplan 2026</item>
                    <item name="Build-ID">39.1.1</item>
                </allplanversion>
            </cadinfo>
            <system>
                <platform name="Win11"><build>26100</build></platform>
                <drives>
                    <drive root="C:\\">
                        <total>100000000000</total>
                        <free>50000000000</free>
                        <filesystem>NTFS</filesystem>
                    </drive>
                </drives>
                <printers>
                    <printer name="PDF Printer" default="yes" />
                    <printer name="Office Jet" />
                </printers>
                <processes>
                    <process>C:\\Windows\\System32\\onedrive.exe</process>
                </processes>
                <variables>
                    <item name="USERNAME">Melih</item>
                    <item name="COMPUTERNAME">WORKSTATION-01</item>
                </variables>
            </system>
        </hotinfo>`;

        const data = service.parseHotinfo(mockXml);

        expect(data).not.toBeNull();
        if (data) {
            expect(data.allplanBuildId).toBe('39.1.1');
            expect(data.registryPaths).toHaveProperty('DataPath', 'C:\\Data');
            expect(data.drives).toHaveLength(1);
            expect(data.drives[0].free).toContain('47 GB');
            expect(data.printers).toContain('PDF Printer');
            expect(data.defaultPrinter).toBe('PDF Printer');
            expect(data.conflictingProcesses).toContain('onedrive.exe');
            expect(data.envVars).toHaveProperty('USERNAME', 'Melih');
            expect(data.envVars).toHaveProperty('COMPUTERNAME', 'WORKSTATION-01');
        }
    });

    it('should return null for invalid XML strings', () => {
        const badXml = `<UnclosedTag>Missing</AnotherTag>`;
        const result = service.parseHotinfo(badXml);
        expect(result).toBeNull();
    });
});
