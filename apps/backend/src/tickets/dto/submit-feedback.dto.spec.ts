import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SubmitFeedbackDto } from './submit-feedback.dto';

describe('SubmitFeedbackDto validation with production ValidationPipe', () => {
    // Real production ValidationPipe configuration from main.ts
    const productionPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    });

    async function transformBody(payload: Record<string, any>): Promise<SubmitFeedbackDto> {
        return (await productionPipe.transform(payload, {
            type: 'body',
            metatype: SubmitFeedbackDto,
        })) as SubmitFeedbackDto;
    }

    describe('Score validation with strict JSON type preservation', () => {
        it('should pass for valid integer score 5 without comment', async () => {
            const dto = await transformBody({ score: 5 });
            expect(dto.score).toBe(5);
            expect(dto.comment).toBeUndefined();
        });

        it('should pass for valid integer score 1 with comment', async () => {
            const dto = await transformBody({ score: 1, comment: 'Çözülmedi' });
            expect(dto.score).toBe(1);
            expect(dto.comment).toBe('Çözülmedi');
        });

        it('should REJECT boolean score (e.g. score: true) and not coerce to integer 1', async () => {
            await expect(transformBody({ score: true })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT boolean score (e.g. score: false) and not coerce to integer 0', async () => {
            await expect(transformBody({ score: false })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT numeric string score (e.g. score: "5") and not coerce to number 5', async () => {
            await expect(transformBody({ score: '5' })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT numeric string score (e.g. score: "1") and not coerce to number 1', async () => {
            await expect(transformBody({ score: '1' })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT null score', async () => {
            await expect(transformBody({ score: null })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT missing score', async () => {
            await expect(transformBody({})).rejects.toThrow(BadRequestException);
        });

        it('should REJECT score less than 1 (e.g. 0)', async () => {
            await expect(transformBody({ score: 0 })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT score greater than 5 (e.g. 6)', async () => {
            await expect(transformBody({ score: 6 })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT floating point score (e.g. 4.5)', async () => {
            await expect(transformBody({ score: 4.5 })).rejects.toThrow(BadRequestException);
        });
    });

    describe('Comment validation with strict JSON type preservation and null contract', () => {
        it('should REJECT numeric comment (e.g. comment: 12345) and not coerce to string', async () => {
            await expect(transformBody({ score: 5, comment: 12345 })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT boolean comment (e.g. comment: true) and not coerce to string', async () => {
            await expect(transformBody({ score: 5, comment: true })).rejects.toThrow(BadRequestException);
        });

        it('should accept null comment preserving optional contract', async () => {
            const dto = await transformBody({ score: 5, comment: null });
            expect(dto.score).toBe(5);
            expect(dto.comment).toBeNull();
        });

        it('should accept undefined comment', async () => {
            const dto = await transformBody({ score: 5, comment: undefined });
            expect(dto.score).toBe(5);
            expect(dto.comment).toBeUndefined();
        });

        it('should accept empty string comment', async () => {
            const dto = await transformBody({ score: 5, comment: '' });
            expect(dto.score).toBe(5);
            expect(dto.comment).toBe('');
        });

        it('should accept valid non-empty comment', async () => {
            const dto = await transformBody({ score: 5, comment: 'Hızlı ve etkili çözüm' });
            expect(dto.score).toBe(5);
            expect(dto.comment).toBe('Hızlı ve etkili çözüm');
        });

        it('should REJECT comment exceeding 2000 characters', async () => {
            await expect(transformBody({ score: 5, comment: 'a'.repeat(2001) })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT unexpected non-whitelisted properties', async () => {
            await expect(transformBody({ score: 5, maliciousProperty: 'payload' })).rejects.toThrow(BadRequestException);
        });
    });
});
