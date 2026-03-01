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
});
