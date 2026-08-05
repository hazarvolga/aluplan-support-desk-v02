import { TicketClusteringService } from './ticket-clustering.service';
import { RAG_CONFIG } from '../config/rag.config';

describe('TicketClusteringService', () => {
    it('uses centralized RAG_CONFIG clustering thresholds', () => {
        const service = new TicketClusteringService(
            {} as any,
            {} as any,
            {} as any,
            {} as any,
        );

        expect((service as any).SIMILARITY_THRESHOLD).toBe(RAG_CONFIG.CLUSTERING.SIMILARITY_THRESHOLD);
        expect((service as any).MIN_CLUSTER_SIZE).toBe(RAG_CONFIG.CLUSTERING.MIN_CLUSTER_SIZE);
    });
});
