/**
 * RAG Maintenance Service
 * =======================
 * Provides explicit infrastructure maintenance tasks.
 * 1. Ensures HNSW vector indexes are optimized.
 * 2. Optionally triggers sync when RAG version increases (e.g. from Faz 1 to Faz 3).
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
    private readonly VECTOR_COLUMNS = [
        { table: 'knowledge_embeddings', column: 'embedding' },
        { table: 'knowledge_pool_embeddings', column: 'embedding' },
        { table: 'ticket_embeddings', column: 'embedding' },
        { table: 'faq_entries', column: 'question_embedding' },
        { table: 'ai_response_cache', column: 'query_embedding' },
    ] as const;

    constructor(
        private readonly prisma: PrismaService,
        private readonly settings: SettingsService,
        private readonly poolService: KnowledgePoolService,
        private readonly registry: EmbeddingVersionRegistry,
    ) { }

    async onModuleInit() {
        this.logger.log('🛡️ RAG Maintenance Service registered. Boot-time DDL and auto-sync are disabled; run the explicit maintenance command when needed.');
    }

    async runInfrastructureMaintenance(options: {
        optimizeIndexes?: boolean;
        syncKnowledgePool?: boolean;
    } = {}) {
        const optimizeIndexes = options.optimizeIndexes ?? true;
        const syncKnowledgePool = options.syncKnowledgePool ?? false;

        this.logger.log(`🚀 RAG infrastructure maintenance starting (optimizeIndexes=${optimizeIndexes}, syncKnowledgePool=${syncKnowledgePool})...`);
        try {
            if (optimizeIndexes) {
                await this.optimizeIndexes();
            }

            if (syncKnowledgePool) {
                await this.checkVersionAndSync();
            }

            this.logger.log('✅ RAG infrastructure maintenance complete.');
        } catch (err) {
            this.logger.error(`❌ RAG infrastructure maintenance failed: ${err.message}`);
            throw err;
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
        for (const column of this.VECTOR_COLUMNS) {
            await this.ensureVectorColumnIsUnconstrained(column.table, column.column);
        }
        for (const index of this.VECTOR_INDEXES) {
            await this.ensureVectorIndex(index.name, index.table, config.version, config.dimension);
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

    private async ensureVectorIndex(indexName: string, tableName: string, embeddingVersion: string, expectedDimension: number) {
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

        const hasExpectedDimensionExpression =
            currentDefinition.includes(`embedding::vector(${expectedDimension})`)
            || currentDefinition.includes(`(embedding)::vector(${expectedDimension})`);
        if (
            currentDefinition.includes('using hnsw')
            && hasExpectedDimensionExpression
            && currentDefinition.includes('embedding_version')
            && currentDefinition.includes('embedding_dim')
        ) {
            return;
        }

        if (currentDefinition) {
            this.logger.warn(`♻️ Rebuilding ${indexName}: expected HNSW, found ${currentDefinition}`);
            await this.prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${indexName}"`);
        }

        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX "${indexName}"
      ON "${tableName}" USING hnsw ((embedding::vector(${expectedDimension})) vector_cosine_ops)
      WITH (m = 16, ef_construction = 64)
      WHERE embedding_version = '${embeddingVersion.replace(/'/g, "''")}' AND embedding_dim = ${expectedDimension};
    `);
    }

    private async ensureVectorColumnIsUnconstrained(tableName: string, columnName: string) {
        const columns = await this.prisma.$queryRawUnsafe<Array<{ formatted_type: string }>>(
            `
        SELECT format_type(a.atttypid, a.atttypmod) AS formatted_type
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = $1
          AND a.attname = $2
          AND a.attnum > 0
      `,
            tableName,
            columnName,
        );

        const formattedType = columns[0]?.formatted_type?.toLowerCase();
        if (!formattedType || formattedType === 'vector') {
            return;
        }

        if (!/^vector\(\d+\)$/.test(formattedType)) {
            this.logger.warn(`⚠️ Unexpected vector column type on ${tableName}.${columnName}: ${formattedType}. Leaving unchanged.`);
            return;
        }

        this.logger.warn(`🧱 Rewriting ${tableName}.${columnName} from ${formattedType} to unconstrained vector for embedding index isolation`);
        await this.prisma.$executeRawUnsafe(
            `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE vector USING "${columnName}"::vector`,
        );
    }
}
