import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';

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
});
