import { Injectable } from '@nestjs/common';
import { RAG_CONFIG } from '../../config/rag.config';

/**
 * Trust Score Calculator based on FAQ_Self_Learing_mimarisi.MD v1.0
 * formula: trust_score = base_score * age_factor * feedback_factor
 */
@Injectable()
export class TrustScoreCalculator {
    /**
     * base_score values are centralized in RAG_CONFIG.TRUST_SCORE.BASE.
     */
    private readonly BASE_SCORES = RAG_CONFIG.TRUST_SCORE.BASE;

    calculate(params: {
        sourceType: keyof typeof TrustScoreCalculator.prototype.BASE_SCORES | string;
        createdAt: Date;
        lastUpdatedAt?: Date;
        positiveFeedbackCount: number;
        negativeFeedbackCount: number;
        isApproved?: boolean;
    }): number {
        const base = this.BASE_SCORES[params.sourceType as keyof typeof TrustScoreCalculator.prototype.BASE_SCORES] || RAG_CONFIG.TRUST_SCORE.BASE.FAQ_AUTO;

        const ageFactor = this.calculateAgeFactor(params.lastUpdatedAt || params.createdAt);
        const feedbackFactor = this.calculateFeedbackFactor(params.positiveFeedbackCount, params.negativeFeedbackCount);

        // Final score bounded between 0 and 1
        return Math.min(Math.max(base * ageFactor * feedbackFactor, 0), 1);
    }

    private calculateAgeFactor(date: Date): number {
        const daysOld = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld < RAG_CONFIG.TRUST_SCORE.AGE.FRESH_DAYS) return RAG_CONFIG.TRUST_SCORE.AGE.FRESH_FACTOR;
        if (daysOld < RAG_CONFIG.TRUST_SCORE.AGE.RECENT_DAYS) return RAG_CONFIG.TRUST_SCORE.AGE.RECENT_FACTOR;
        if (daysOld < RAG_CONFIG.TRUST_SCORE.AGE.STALE_DAYS) return RAG_CONFIG.TRUST_SCORE.AGE.STALE_FACTOR;
        return RAG_CONFIG.TRUST_SCORE.AGE.OLD_FACTOR;
    }

    private calculateFeedbackFactor(pos: number, neg: number): number {
        const total = pos + neg;
        if (total === 0) return 1.0;

        const ratio = pos / total;
        return RAG_CONFIG.TRUST_SCORE.FEEDBACK.MIN_FACTOR + (ratio * RAG_CONFIG.TRUST_SCORE.FEEDBACK.SPAN);
    }
}
