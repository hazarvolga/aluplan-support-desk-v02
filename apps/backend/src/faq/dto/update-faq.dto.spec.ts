import { ValidationPipe } from '@nestjs/common';
import { UpdateFaqDto } from './update-faq.dto';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

describe('UpdateFaqDto', () => {
    const pipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    });

    it('accepts only the editable FAQ fields', async () => {
        await expect(pipe.transform(
            { question: 'Updated question', answer: 'Updated answer', tags: ['support'] },
            { type: 'body', metatype: UpdateFaqDto },
        )).resolves.toEqual(expect.objectContaining({
            question: 'Updated question',
            answer: 'Updated answer',
            tags: ['support'],
        }));
    });

    it('rejects fields that could bypass review or deletion permissions', async () => {
        await expect(pipe.transform(
            { status: 'PUBLISHED', deletedAt: new Date().toISOString(), isInternal: false },
            { type: 'body', metatype: UpdateFaqDto },
        )).rejects.toThrow();
    });

    it.each(['question', 'answer', 'tags'])('rejects null for %s', async (field) => {
        await expect(pipe.transform(
            { [field]: null },
            { type: 'body', metatype: UpdateFaqDto },
        )).rejects.toThrow();
    });

    it('enforces content and tag size limits', async () => {
        await expect(pipe.transform(
            { question: 'q'.repeat(1001) },
            { type: 'body', metatype: UpdateFaqDto },
        )).rejects.toThrow();
        await expect(pipe.transform(
            { tags: Array.from({ length: 51 }, () => 'tag') },
            { type: 'body', metatype: UpdateFaqDto },
        )).rejects.toThrow();
    });

    it.each(['question', 'answer'])('rejects blank or whitespace-only %s', async (field) => {
        await expect(pipe.transform(
            { [field]: '   ' },
            { type: 'body', metatype: UpdateFaqDto },
        )).rejects.toThrow();
    });

    it('publishes the runtime content constraints in the OpenAPI schema metadata', () => {
        const questionSchema = Reflect.getMetadata(
            DECORATORS.API_MODEL_PROPERTIES,
            UpdateFaqDto.prototype,
            'question',
        );
        const answerSchema = Reflect.getMetadata(
            DECORATORS.API_MODEL_PROPERTIES,
            UpdateFaqDto.prototype,
            'answer',
        );
        const tagsSchema = Reflect.getMetadata(
            DECORATORS.API_MODEL_PROPERTIES,
            UpdateFaqDto.prototype,
            'tags',
        );

        expect(questionSchema).toEqual(expect.objectContaining({ pattern: '\\S', maxLength: 1000 }));
        expect(answerSchema).toEqual(expect.objectContaining({ pattern: '\\S', maxLength: 20000 }));
        expect(tagsSchema).toEqual(expect.objectContaining({
            maxItems: 50,
            items: { type: 'string', maxLength: 100 },
        }));
    });
});
