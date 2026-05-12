import { calculateMRR, calculateHitAtK, calculateNDCG, aggregateMetrics } from './eval-metrics';

describe('eval-metrics', () => {
    describe('calculateMRR', () => {
        it('returns 1 when relevant doc is at rank 1', () => {
            expect(calculateMRR(['a', 'b', 'c'], ['a'])).toBe(1);
        });

        it('returns 0.5 when relevant doc is at rank 2', () => {
            expect(calculateMRR(['x', 'a', 'c'], ['a'])).toBe(0.5);
        });

        it('returns 0 when no relevant doc is retrieved', () => {
            expect(calculateMRR(['x', 'y', 'z'], ['a'])).toBe(0);
        });

        it('returns 0 for empty retrieved list', () => {
            expect(calculateMRR([], ['a'])).toBe(0);
        });
    });

    describe('calculateHitAtK', () => {
        it('returns 1 when relevant doc is within top-K', () => {
            expect(calculateHitAtK(['a', 'b', 'c', 'd', 'e'], ['c'], 5)).toBe(1);
        });

        it('returns 0 when relevant doc is beyond top-K', () => {
            expect(calculateHitAtK(['a', 'b', 'c', 'd', 'e'], ['e'], 4)).toBe(0);
        });

        it('returns 0 for empty retrieved list', () => {
            expect(calculateHitAtK([], ['a'], 5)).toBe(0);
        });
    });

    describe('calculateNDCG', () => {
        it('returns 1.0 when all retrieved are relevant (perfect ranking)', () => {
            expect(calculateNDCG(['a', 'b'], ['a', 'b'])).toBe(1);
        });

        it('returns 0 when no retrieved results are relevant', () => {
            expect(calculateNDCG(['x', 'y'], ['a', 'b'])).toBe(0);
        });

        it('returns 0 for empty retrieved list', () => {
            expect(calculateNDCG([], ['a'])).toBe(0);
        });
    });

    describe('aggregateMetrics', () => {
        it('returns zero report for empty samples', () => {
            const report = aggregateMetrics([]);
            expect(report.sampleCount).toBe(0);
            expect(report.avgMRR).toBe(0);
        });

        it('aggregates multiple samples correctly', () => {
            const report = aggregateMetrics([
                { mrr: 1.0, hitAt5: 1, hitAt10: 1, ndcg: 1.0 },
                { mrr: 0.5, hitAt5: 1, hitAt10: 1, ndcg: 0.5 },
                { mrr: 0.0, hitAt5: 0, hitAt10: 0, ndcg: 0.0 },
            ]);
            expect(report.sampleCount).toBe(3);
            expect(report.avgMRR).toBeCloseTo(0.5, 2);
            expect(report.avgHitAt5).toBeCloseTo(0.667, 2);
        });

        it('sets passedMrrThreshold based on threshold', () => {
            const pass = aggregateMetrics([{ mrr: 0.7, hitAt5: 1, hitAt10: 1, ndcg: 0.7 }]);
            expect(pass.passedMrrThreshold).toBe(true);

            const fail = aggregateMetrics([{ mrr: 0.4, hitAt5: 0, hitAt10: 0, ndcg: 0.4 }]);
            expect(fail.passedMrrThreshold).toBe(false);
        });
    });
});
