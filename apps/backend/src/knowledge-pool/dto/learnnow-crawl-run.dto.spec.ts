import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StartLearnNowCrawlRunDto } from './learnnow-crawl-run.dto';

describe('StartLearnNowCrawlRunDto', () => {
    it('accepts a single public Learn Now format', async () => {
        const dto = plainToInstance(StartLearnNowCrawlRunDto, {
            formats: ['knowledge_article'],
            maxCandidates: 5,
        });

        await expect(validate(dto)).resolves.toEqual([]);
    });

    it('rejects multi-format runs so catalog requests remain bounded', async () => {
        const dto = plainToInstance(StartLearnNowCrawlRunDto, {
            formats: ['knowledge_article', 'pdf'],
        });

        const errors = await validate(dto);
        expect(errors.some(error => error.property === 'formats')).toBe(true);
    });
});
