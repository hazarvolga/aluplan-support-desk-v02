import { Injectable } from '@nestjs/common';

/**
 * Trust Score Calculator based on FAQ_Self_Learing_mimarisi.MD v1.0
 * formula: trust_score = base_score * age_factor * feedback_factor
 */
@Injectable()
export class TrustScoreCalculator {
    /**
     * base_score:
     *   article  → 0.95
     *   document → 0.85
     *   url (whitelist) → 0.70
     *   url (external)  → 0.55
     *   faq (approved)  → 0.75
     *   faq (auto)      → 0.50
     */
    private readonly BASE_SCORES = {
        ARTICLE: 0.95,
        DOCUMENT: 0.85,
        URL_WHITELIST: 0.70,
        URL_EXTERNAL: 0.55,
        FAQ_APPROVED: 0.75,
        FAQ_AUTO: 0.50,
        TICKET: 0.10, // Benzer ticketlar
    };

    calculate(params: {
        sourceType: keyof typeof TrustScoreCalculator.prototype.BASE_SCORES | string;
        createdAt: Date;
        lastUpdatedAt?: Date;
        positiveFeedbackCount: number;
        negativeFeedbackCount: number;
        isApproved?: boolean;
    }): number {
        const base = this.BASE_SCORES[params.sourceType as keyof typeof TrustScoreCalculator.prototype.BASE_SCORES] || 0.50;

        const ageFactor = this.calculateAgeFactor(params.lastUpdatedAt || params.createdAt);
        const feedbackFactor = this.calculateFeedbackFactor(params.positiveFeedbackCount, params.negativeFeedbackCount);

        // Final score bounded between 0 and 1
        return Math.min(Math.max(base * ageFactor * feedbackFactor, 0), 1);
    }

    private calculateAgeFactor(date: Date): number {
        const daysOld = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld < 30) return 1.00;
        if (daysOld < 90) return 0.95;
        if (daysOld < 180) return 0.85;
        return 0.70;
    }

    private calculateFeedbackFactor(pos: number, neg: number): number {
        const total = pos + neg;
        if (total === 0) return 1.0;

        const ratio = pos / total;
        // logic: 0.8 to 1.2 multiplier
        return 0.8 + (ratio * 0.4);
    }
}
