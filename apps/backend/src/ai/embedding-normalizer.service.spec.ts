import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingNormalizer } from './embedding-normalizer.service';

describe('EmbeddingNormalizer', () => {
    let normalizer: EmbeddingNormalizer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmbeddingNormalizer],
        }).compile();

        normalizer = module.get<EmbeddingNormalizer>(EmbeddingNormalizer);
    });

    describe('normalize', () => {
        it('should pass-through with "none" strategy', () => {
            const vec = [1, 2, 3];
            const result = normalizer.normalize(vec, 'none');
            expect(result).toEqual(vec);
        });

        it('should L2 normalize a vector to unit length', () => {
            const vec = [3, 4]; // magnitude = 5
            const result = normalizer.normalize(vec, 'l2');
            const magnitude = Math.sqrt(result.reduce((s, v) => s + v * v, 0));
            expect(magnitude).toBeCloseTo(1.0, 6);
            expect(result[0]).toBeCloseTo(0.6, 6);
            expect(result[1]).toBeCloseTo(0.8, 6);
        });

        it('should canonical normalize (L2 + dimension alignment)', () => {
            const vec = [3, 4, 0];
            const result = normalizer.normalize(vec, 'canonical');
            expect(normalizer.isNormalized(result)).toBe(true);
        });

        it('should truncate vector to target dimensions', () => {
            const vec = [1, 2, 3, 4, 5];
            const result = normalizer.normalize(vec, 'none', 3);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should pad vector with zeros to target dimensions', () => {
            const vec = [1, 2];
            const result = normalizer.normalize(vec, 'none', 5);
            expect(result).toEqual([1, 2, 0, 0, 0]);
        });

        it('should handle zero-magnitude vector gracefully', () => {
            const vec = [0, 0, 0];
            const result = normalizer.normalize(vec, 'l2');
            expect(result).toEqual([0, 0, 0]);
        });
    });

    describe('normalizeResult', () => {
        it('should normalize an EmbeddingResult', () => {
            const result = normalizer.normalizeResult(
                { embedding: [3, 4], model: 'test-model' },
                'l2'
            );
            expect(normalizer.isNormalized(result.embedding)).toBe(true);
            expect(result.model).toBe('test-model');
        });
    });

    describe('cosineSimilarity', () => {
        it('should return 1.0 for identical normalized vectors', () => {
            const vec = [1, 0, 0];
            const sim = normalizer.cosineSimilarity(vec, vec);
            expect(sim).toBeCloseTo(1.0, 6);
        });

        it('should return 0.0 for orthogonal vectors', () => {
            const a = [1, 0, 0];
            const b = [0, 1, 0];
            const sim = normalizer.cosineSimilarity(a, b);
            expect(sim).toBeCloseTo(0.0, 6);
        });

        it('should return -1.0 for opposite vectors', () => {
            const a = [1, 0, 0];
            const b = [-1, 0, 0];
            const sim = normalizer.cosineSimilarity(a, b);
            expect(sim).toBeCloseTo(-1.0, 6);
        });

        it('should throw on dimension mismatch', () => {
            expect(() => normalizer.cosineSimilarity([1, 2], [1, 2, 3])).toThrow('Vector dimension mismatch');
        });
    });

    describe('isNormalized', () => {
        it('should return true for unit vector', () => {
            expect(normalizer.isNormalized([1, 0, 0])).toBe(true);
        });

        it('should return false for non-unit vector', () => {
            expect(normalizer.isNormalized([2, 0, 0])).toBe(false);
        });

        it('should respect tolerance', () => {
            expect(normalizer.isNormalized([1.001, 0, 0], 0.01)).toBe(true);
            expect(normalizer.isNormalized([1.1, 0, 0], 0.01)).toBe(false);
        });
    });
});
