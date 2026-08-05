import { TrustScoreCalculator } from './trust-score.calculator';
import { RAG_CONFIG } from '../../config/rag.config';

describe('TrustScoreCalculator', () => {
    let calculator: TrustScoreCalculator;

    beforeEach(() => {
        calculator = new TrustScoreCalculator();
        jest.useFakeTimers().setSystemTime(new Date('2026-08-05T12:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('uses RAG_CONFIG base score for fresh article sources', () => {
        const score = calculator.calculate({
            sourceType: 'ARTICLE',
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            positiveFeedbackCount: 0,
            negativeFeedbackCount: 0,
        });

        expect(score).toBe(RAG_CONFIG.TRUST_SCORE.BASE.ARTICLE);
    });

    it('uses configured age factor for old whitelisted URL sources', () => {
        const score = calculator.calculate({
            sourceType: 'URL_WHITELIST',
            createdAt: new Date('2025-01-01T12:00:00.000Z'),
            positiveFeedbackCount: 0,
            negativeFeedbackCount: 0,
        });

        expect(score).toBeCloseTo(
            RAG_CONFIG.TRUST_SCORE.BASE.URL_WHITELIST * RAG_CONFIG.TRUST_SCORE.AGE.OLD_FACTOR,
        );
    });

    it('uses configured feedback factor range', () => {
        const score = calculator.calculate({
            sourceType: 'DOCUMENT',
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            positiveFeedbackCount: 1,
            negativeFeedbackCount: 1,
        });

        const expectedFeedbackFactor = RAG_CONFIG.TRUST_SCORE.FEEDBACK.MIN_FACTOR + (0.5 * RAG_CONFIG.TRUST_SCORE.FEEDBACK.SPAN);
        expect(score).toBeCloseTo(RAG_CONFIG.TRUST_SCORE.BASE.DOCUMENT * expectedFeedbackFactor);
    });

    it('falls back to the configured FAQ_AUTO score for unknown source types', () => {
        const score = calculator.calculate({
            sourceType: 'UNKNOWN_SOURCE',
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            positiveFeedbackCount: 0,
            negativeFeedbackCount: 0,
        });

        expect(score).toBe(RAG_CONFIG.TRUST_SCORE.BASE.FAQ_AUTO);
    });
});
