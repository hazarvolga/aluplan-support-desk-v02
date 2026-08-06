import { validate } from 'class-validator';
import { KnowledgeSourceType } from '@aluplan/database';
import { CreateKnowledgeSourceDto } from './create-knowledge-source.dto';

describe('CreateKnowledgeSourceDto', () => {
    it('requires a URL when the source type is URL', async () => {
        const dto = Object.assign(new CreateKnowledgeSourceDto(), {
            name: 'Missing URL',
            type: KnowledgeSourceType.URL,
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'url')).toBe(true);
    });

    it('does not require a URL for file source types', async () => {
        const dto = Object.assign(new CreateKnowledgeSourceDto(), {
            name: 'Uploaded PDF',
            type: KnowledgeSourceType.FILE_PDF,
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'url')).toBe(false);
    });

    it('still validates a URL supplied for a non-URL source type', async () => {
        const dto = Object.assign(new CreateKnowledgeSourceDto(), {
            name: 'Uploaded PDF',
            type: KnowledgeSourceType.FILE_PDF,
            url: 'not-a-url',
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'url')).toBe(true);
    });
});
