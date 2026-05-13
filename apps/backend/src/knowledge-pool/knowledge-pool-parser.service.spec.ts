import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';

const destroy = jest.fn().mockResolvedValue(undefined);
const getText = jest.fn().mockResolvedValue({ text: 'Parsed PDF text' });

jest.mock('pdf-parse', () => ({
    PDFParse: jest.fn().mockImplementation(() => ({
        getText,
        destroy,
    })),
}));

describe('KnowledgePoolParserService', () => {
    let service: KnowledgePoolParserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [KnowledgePoolParserService],
        }).compile();

        service = module.get<KnowledgePoolParserService>(KnowledgePoolParserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('parses pdf buffers through the pdf-parse v2 API', async () => {
        const result = await service.parsePdf(Buffer.from('fake-pdf'));

        expect(result).toBe('Parsed PDF text');
        expect(getText).toHaveBeenCalled();
        expect(destroy).toHaveBeenCalled();
    });
});
