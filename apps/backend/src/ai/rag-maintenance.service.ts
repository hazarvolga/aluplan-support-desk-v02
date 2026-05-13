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
import { EmbeddingVersionRegistry } from './embedding-version.registry';

@Injectable()
export class RagMaintenanceService implements OnModuleInit {
    private readonly logger = new Logger(RagMaintenanceService.name);
    private readonly MAINTENANCE_VERSION = 3; // Corresponds to Faz 3 improvements
    private readonly VECTOR_INDEXES = [
        {
            name: 'knowledge_embeddings_vector_hnsw_idx',
            table: 'knowledge_embeddings',
        },
        {
            name: 'knowledge_pool_embeddings_vector_hnsw_idx',
            table: 'knowledge_pool_embeddings',
        },
        {
            name: 'ticket_embeddings_vector_hnsw_idx',
            table: 'ticket_embeddings',
        },
    ] as const;

    constructor(
        private readonly prisma: PrismaService,
        private readonly settings: SettingsService,
        private readonly poolService: KnowledgePoolService,
        private readonly registry: EmbeddingVersionRegistry,
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

        const config = await this.registry.getActiveVersionConfig();
        for (const index of this.VECTOR_INDEXES) {
            await this.ensureVectorColumnDimension(index.table, config.dimension);
            await this.ensureVectorIndex(index.name, index.table, config.dimension);
        }

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

    private async ensureVectorIndex(indexName: string, tableName: string, expectedDimension: number) {
        const existing = await this.prisma.$queryRawUnsafe<Array<{ indexdef: string }>>(
            `
        SELECT indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1 AND indexname = $2
      `,
            tableName,
            indexName,
        );

        const currentDefinition = existing[0]?.indexdef?.toLowerCase() ?? '';
        if (expectedDimension > 2000) {
            if (currentDefinition) {
                this.logger.warn(`🧹 Removing ${indexName}: pgvector HNSW on vector supports up to 2000 dimensions, active model uses ${expectedDimension}`);
                await this.prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${indexName}"`);
            }
            this.logger.warn(`⏭️ Skipping ${indexName}: active embedding dimension ${expectedDimension} exceeds pgvector HNSW vector limit. Exact search remains available.`);
            return;
        }

        if (currentDefinition.includes('using hnsw')) {
            return;
        }

        if (currentDefinition) {
            this.logger.warn(`♻️ Rebuilding ${indexName}: expected HNSW, found ${currentDefinition}`);
            await this.prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${indexName}"`);
        }

        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX "${indexName}"
      ON "${tableName}" USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
    `);
    }

    private async ensureVectorColumnDimension(tableName: string, expectedDimension: number) {
        const columns = await this.prisma.$queryRawUnsafe<Array<{ formatted_type: string }>>(
            `
        SELECT format_type(a.atttypid, a.atttypmod) AS formatted_type
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = $1
          AND a.attname = 'embedding'
          AND a.attnum > 0
      `,
            tableName,
        );

        const formattedType = columns[0]?.formatted_type?.toLowerCase();
        if (formattedType === `vector(${expectedDimension})`) {
            return;
        }

        const counts = await this.prisma.$queryRawUnsafe<Array<{ total: number }>>(
            `SELECT COUNT(*)::int AS total FROM "${tableName}"`,
        );
        const totalRows = counts[0]?.total ?? 0;
        if (totalRows > 0) {
            throw new Error(`Embedding column drift detected on ${tableName}: ${formattedType ?? 'unknown'}. Table contains ${totalRows} rows, refusing automatic dimension rewrite.`);
        }

        this.logger.warn(`🧱 Rewriting ${tableName}.embedding from ${formattedType ?? 'unknown'} to vector(${expectedDimension})`);
        await this.prisma.$executeRawUnsafe(
            `ALTER TABLE "${tableName}" ALTER COLUMN "embedding" TYPE vector(${expectedDimension}) USING embedding::vector(${expectedDimension})`,
        );
    }
}
