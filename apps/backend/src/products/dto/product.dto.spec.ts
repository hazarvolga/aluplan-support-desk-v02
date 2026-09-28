import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
    CreateProductCategoryDto,
    CreateProductDto,
    UpdateProductCategoryDto,
} from './product.dto';

describe('Product DTO validation', () => {
    it('trims a valid product name and description', async () => {
        const dto = plainToInstance(CreateProductDto, {
            name: '  ALLPLAN  ',
            description: '  BIM support  ',
        });

        expect(await validate(dto)).toHaveLength(0);
        expect(dto).toEqual({ name: 'ALLPLAN', description: 'BIM support' });
    });

    it.each([undefined, '', '   '])('rejects a missing or blank product name: %p', async (name) => {
        const dto = plainToInstance(CreateProductDto, { name });

        expect(await validate(dto)).not.toHaveLength(0);
    });

    it('rejects oversized product fields', async () => {
        const dto = plainToInstance(CreateProductDto, {
            name: 'x'.repeat(121),
            description: 'x'.repeat(2001),
        });

        expect(await validate(dto)).not.toHaveLength(0);
    });

    it('rejects non-array or non-string category keywords', async () => {
        const nonArray = plainToInstance(CreateProductCategoryDto, {
            name: 'Lisans',
            keywords: 'wibu',
        });
        const nonString = plainToInstance(UpdateProductCategoryDto, {
            keywords: ['wibu', 42],
        });

        expect(await validate(nonArray)).not.toHaveLength(0);
        expect(await validate(nonString)).not.toHaveLength(0);
    });
});
