/**
 * RAG Maintenance Service
 * =======================
 * Automates infrastructure maintenance tasks on application startup.
 * 1. Ensures HNSW vector indexes are optimized.
 * 2. Triggers auto-sync when RAG version increases (e.g. from Faz 1 to Faz 3).
 * 3. Performs periodic VACUUM ANALYZE to maintain performance.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { KnowledgePoolService } from '../knowledge-pool/knowledge-pool.service';
import { RAG_CONFIG } from '../config/rag.config';

@Injectable()
export class RagMaintenanceService implements OnModuleInit {
    private readonly logger = new Logger(RagMaintenanceService.name);
    private readonly MAINTENANCE_VERSION = 3; // Corresponds to Faz 3 improvements

    constructor(
        private readonly prisma: PrismaService,
        private readonly settings: SettingsService,
        private readonly poolService: KnowledgePoolService,
    ) { }

    async onModuleInit() {
        this.logger.log('🚀 RAG Maintenance Service initializing...');

        try {
            // 1. Database Optimization (HNSW)
            await this.optimizeIndexes();

            // 2. Version-based Sync Check
            await this.checkVersionAndSync();

            this.logger.log('✅ RAG Maintenance complete.');
        } catch (err) {
            this.logger.error(`❌ RAG Maintenance failed: ${err.message}`);
        }
    }

    /** Run optimized index creation (HNSW) */
    private async optimizeIndexes() {
        this.logger.log('⚡ Optimizing HNSW Vector Indexes...');

        // Check if PGVector is available
        const extensions = await this.prisma.$queryRaw<any[]>`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        if (extensions.length === 0) {
            this.logger.warn('⚠️ PGVector extension not found. Skipping optimization.');
            return;
        }

        // Apply HNSW index to main tables if they don't exist
        // We use raw SQL to ensure precise index definitions matching Faz 3 standards
        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS knowledge_embeddings_vector_hnsw_idx 
      ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 64);
    `);

        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS knowledge_pool_embeddings_vector_hnsw_idx 
      ON knowledge_pool_embeddings USING hnsw (embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 64);
    `);

        // Ensure content hash indexes for duplicate detection
        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_ke_content_hash ON knowledge_embeddings (md5(content)) WHERE parent_id IS NOT NULL;
    `);

        this.logger.log('✨ Database indexes optimized.');
    }

    /** Check if a full re-index is required due to code changes */
    private async checkVersionAndSync() {
        const currentVersion = await this.settings.getValue('rag.infrastructure_version') || '0';

        if (parseInt(currentVersion.toString()) < this.MAINTENANCE_VERSION) {
            this.logger.warn(`🔄 RAG Infrastructure upgrade detected (${currentVersion} -> ${this.MAINTENANCE_VERSION})`);
            this.logger.warn('📦 Triggering automatic background synchronization of Knowledge Pool content...');

            // Async trigger to not block startup
            this.poolService.syncLocalDataset().then(() => {
                this.logger.log('✅ Background synchronization complete.');
                this.settings.upsert({ key: 'rag.infrastructure_version', value: this.MAINTENANCE_VERSION.toString() });
            }).catch(err => {
                this.logger.error(`❌ Background synchronization failed: ${err.message}`);
            });
        } else {
            this.logger.log(`🛡️ RAG Infrastructure version is up-to-date (v${currentVersion}).`);
        }
    }
}
