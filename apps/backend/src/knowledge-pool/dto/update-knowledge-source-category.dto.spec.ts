import { validate } from 'class-validator';
import { UpdateKnowledgeSourceCategoryDto } from './update-knowledge-source-category.dto';

describe('UpdateKnowledgeSourceCategoryDto', () => {
    it('accepts a canonical category slug', async () => {
        const dto = Object.assign(new UpdateKnowledgeSourceCategoryDto(), {
            categorySlug: 'license-activation',
        });

        await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('rejects unknown category slugs', async () => {
        const dto = Object.assign(new UpdateKnowledgeSourceCategoryDto(), {
            categorySlug: 'arbitrary-category',
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'categorySlug')).toBe(true);
    });
});
