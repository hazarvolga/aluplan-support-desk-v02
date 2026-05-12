/**
 * AiEvalService — Offline RAG Evaluation Pipeline
 * =================================================
 * GAP-H4: Evaluates retrieval quality against a curated golden dataset.
 * Metrics: MRR, Hit@K, NDCG.  Used by CI (ai-eval.yml) and admin triggers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import {
    calculateMRR,
    calculateHitAtK,
    calculateNDCG,
    aggregateMetrics,
    EvalReport,
    SampleMetrics,
} from './utils/eval-metrics';
import { RAG_CONFIG } from '../config/rag.config';

@Injectable()
export class AiEvalService {
    private readonly logger = new Logger(AiEvalService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
    ) { }

    /**
     * Run offline retrieval evaluation against EvalDataset records for the given tenant.
     * Returns an EvalReport with MRR, Hit@K, and NDCG averages.
     */
    async evaluateRetrieval(tenantId: string): Promise<EvalReport> {
        const dataset = await this.prisma.evalDataset.findMany({
            where: { tenantId },
        });

        if (dataset.length === 0) {
            this.logger.warn(`⚠️ No EvalDataset records found for tenant ${tenantId}`);
            return aggregateMetrics([]);
        }

        this.logger.log(`🧪 Running retrieval eval on ${dataset.length} samples (tenant: ${tenantId})`);

        const sampleMetrics: SampleMetrics[] = [];

        for (const sample of dataset) {
            try {
                const searchResponse = await this.embeddingService.search(
                    sample.query,
                    RAG_CONFIG.SEARCH.PRE_RERANK_LIMIT,
                    null,
                    false, // evaluate staff=false path (customer-facing)
                );

                const retrievedIds = searchResponse.results.map(r => r.articleId);

                sampleMetrics.push({
                    mrr: calculateMRR(retrievedIds, sample.relevantChunkIds),
                    hitAt5: calculateHitAtK(retrievedIds, sample.relevantChunkIds, 5),
                    hitAt10: calculateHitAtK(retrievedIds, sample.relevantChunkIds, 10),
                    ndcg: calculateNDCG(retrievedIds, sample.relevantChunkIds),
                });
            } catch (err) {
                this.logger.warn(`⚠️ Eval sample ${sample.id} failed: ${(err as Error).message}`);
            }
        }

        const report = aggregateMetrics(sampleMetrics);

        this.logger.log(
            `📊 Eval Report [${report.sampleCount} samples]: ` +
            `MRR=${report.avgMRR} (${report.passedMrrThreshold ? '✅' : '❌'}) ` +
            `Hit@5=${report.avgHitAt5} (${report.passedHitAt5Threshold ? '✅' : '❌'}) ` +
            `Hit@10=${report.avgHitAt10} NDCG=${report.avgNDCG}`
        );

        return report;
    }
}
