/**
 * Offline RAG Evaluation Metrics
 * ================================
 * Pure functions for computing retrieval quality metrics.
 * Used by AiEvalService and the CI evaluation workflow.
 */

/**
 * Mean Reciprocal Rank — average of 1/rank of first relevant result.
 * Returns 0 if no relevant result is found in the list.
 */
export function calculateMRR(
    retrievedIds: string[],
    relevantIds: string[],
): number {
    const relevantSet = new Set(relevantIds);
    for (let i = 0; i < retrievedIds.length; i++) {
        if (relevantSet.has(retrievedIds[i])) {
            return 1 / (i + 1);
        }
    }
    return 0;
}

/**
 * Hit@K — 1 if any relevant result appears in top-K retrieved, else 0.
 */
export function calculateHitAtK(
    retrievedIds: string[],
    relevantIds: string[],
    k: number,
): number {
    const relevantSet = new Set(relevantIds);
    return retrievedIds.slice(0, k).some(id => relevantSet.has(id)) ? 1 : 0;
}

/**
 * Normalized Discounted Cumulative Gain (binary relevance).
 */
export function calculateNDCG(
    retrievedIds: string[],
    relevantIds: string[],
    k = 10,
): number {
    const relevantSet = new Set(relevantIds);
    const topK = retrievedIds.slice(0, k);

    const dcg = topK.reduce((sum, id, idx) => {
        const rel = relevantSet.has(id) ? 1 : 0;
        return sum + rel / Math.log2(idx + 2); // log2(rank+1), rank is 1-based
    }, 0);

    // Ideal DCG: all relevant docs at top positions
    const idealCount = Math.min(relevantIds.length, k);
    const idcg = Array.from({ length: idealCount }, (_, i) => 1 / Math.log2(i + 2))
        .reduce((a, b) => a + b, 0);

    return idcg === 0 ? 0 : dcg / idcg;
}

export interface SampleMetrics {
    mrr: number;
    hitAt5: number;
    hitAt10: number;
    ndcg: number;
}

export interface EvalReport {
    sampleCount: number;
    avgMRR: number;
    avgHitAt5: number;
    avgHitAt10: number;
    avgNDCG: number;
    passedMrrThreshold: boolean;
    passedHitAt5Threshold: boolean;
}

export function aggregateMetrics(
    samples: SampleMetrics[],
    mrrThreshold = 0.65,
    hitAt5Threshold = 0.80,
): EvalReport {
    const n = samples.length || 1;
    const avg = (key: keyof SampleMetrics) =>
        Math.round((samples.reduce((s, m) => s + m[key], 0) / n) * 1000) / 1000;

    const avgMRR = avg('mrr');
    const avgHitAt5 = avg('hitAt5');

    return {
        sampleCount: samples.length,
        avgMRR,
        avgHitAt5,
        avgHitAt10: avg('hitAt10'),
        avgNDCG: avg('ndcg'),
        passedMrrThreshold: avgMRR >= mrrThreshold,
        passedHitAt5Threshold: avgHitAt5 >= hitAt5Threshold,
    };
}
