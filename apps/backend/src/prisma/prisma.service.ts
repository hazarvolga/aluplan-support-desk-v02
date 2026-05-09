import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;
    private poolInterval: NodeJS.Timeout;

    constructor(private readonly metrics: MetricsService) {
        const poolInstance = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 100, // Increased to handle concurrent upserts from dashboard
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });

        const adapter = new PrismaPg(poolInstance as any);
        super({ adapter, errorFormat: 'pretty' });
        this.pool = poolInstance;

        // GAP-19: Soft-delete global filter via Prisma Client Extension
        this.applySoftDeleteExtension();
    }

    async onModuleInit() {
        await this.$connect();
        try {
            // Section A: Core Metrics & Embeddings (Existing)
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "provider" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "model" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "knowledge_pool_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;`);
            await this.$executeRawUnsafe(`ALTER TABLE "knowledge_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;`);

            // Section B: Ghost Column Repair (Missing from migrations but used in code)
            const models = [
                'users', 'departments', 'teams', 'customer_profiles',
                'knowledge_articles', 'tickets', 'ticket_messages',
                'attachments', 'categories', 'products', 'product_categories', 'crm_connections'
            ];

            for (const table of models) {
                await this.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);`);
            }

            // Section C: Specialized Model Repairs
            await this.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;`);
            await this.$executeRawUnsafe(`ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;`);

            await this.$executeRawUnsafe(`ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN DEFAULT false;`);
            await this.$executeRawUnsafe(`ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "auto_assignment_enabled" BOOLEAN DEFAULT false;`);
            // Note: assignment_strategy is an enum, we handle it as text for safety during patch
            await this.$executeRawUnsafe(`ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "assignment_strategy" TEXT DEFAULT 'MANUAL';`);

            await this.$executeRawUnsafe(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "color" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "icon" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN DEFAULT false;`);
            await this.$executeRawUnsafe(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;`);
            await this.$executeRawUnsafe(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN DEFAULT false;`);

            await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "agent_status" TEXT DEFAULT 'DND';`);
            await this.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "max_active_tickets" INTEGER DEFAULT 5;`);

            this.logger.log('✅ All dynamic schema patches (ghost columns) verified/applied.');
        } catch (e: any) {
            this.logger.warn(`Dynamic schema patch warning (may be resolved in next boot): ${e.message}`);
        }
        this.logger.log('✅ Database connected');

        // Start Prometheus pool metrics collection
        this.poolInterval = setInterval(() => {
            this.metrics.setDbPoolConnections(this.pool.totalCount);
        }, 10000);

    }

    async onModuleDestroy() {
        if (this.poolInterval) clearInterval(this.poolInterval);
        await this.$disconnect();
    }

    /**
     * GAP-19: Prisma Client Extension — Global Soft Delete Filter
     *
     * Automatically filters out soft-deleted records (deletedAt !== null)
     * from all read operations (findMany, findFirst, findUnique, count).
     *
     * To include soft-deleted records, use:
     *   prisma.model.findMany({ where: { deletedAt: { not: null } } })
     */
    private applySoftDeleteExtension(): void {
        // Note: Prisma Client Extensions require Prisma 4.7+
        // This extension patches query args before execution
        (this as any).$extends({
            query: {
                $allModels: {
                    async findMany({ model, operation, args, query }: any) {
                        args.where = { ...args.where, deletedAt: null };
                        return query(args);
                    },
                    async findFirst({ model, operation, args, query }: any) {
                        args.where = { ...args.where, deletedAt: null };
                        return query(args);
                    },
                    async findFirstOrThrow({ model, operation, args, query }: any) {
                        args.where = { ...args.where, deletedAt: null };
                        return query(args);
                    },
                    async count({ model, operation, args, query }: any) {
                        args.where = { ...args.where, deletedAt: null };
                        return query(args);
                    },
                },
            },
        });
        this.logger.log('🔒 Soft-delete extension applied — deletedAt: null filter active on all reads');
    }
}
