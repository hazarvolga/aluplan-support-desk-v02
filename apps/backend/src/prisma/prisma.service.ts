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
            max: 20, // GAP-20: Reduced from 100 to avoid connection exhaustion in multi-instance
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });

        const adapter = new PrismaPg(poolInstance);
        super({ adapter, errorFormat: 'pretty' });
        this.pool = poolInstance;

        // GAP-14 & GAP-19: Soft-delete global filter via Prisma Client Extension
        const extendedClient = this.applySoftDeleteExtension();

        // ES6 Proxy wrapping to ensure NestJS lifecycle hooks and custom methods/properties are preserved
        return new Proxy(extendedClient, {
            get: (target, prop, receiver) => {
                // If the property exists on the original PrismaService (this) and is a function,
                // bind it to this and return.
                if (prop in this && typeof (this as any)[prop] === 'function') {
                    return (this as any)[prop].bind(this);
                }
                // If the property exists on the original PrismaService instance, return it.
                if (prop in this) {
                    return (this as any)[prop];
                }
                // Otherwise, delegate to the extended Prisma Client
                return Reflect.get(target, prop, receiver);
            }
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Database connected and verified');

        // Start Prometheus pool metrics collection
        this.poolInterval = setInterval(() => {
            this.metrics.setDbPoolConnections(this.pool.totalCount);
        }, 10000);

    }

    async onModuleDestroy() {
        if (this.poolInterval) clearInterval(this.poolInterval);
        await this.$disconnect();
        this.logger.log('💤 Database connection disconnected successfully');
    }

    /**
     * GAP-14 & GAP-19: Prisma Client Extension — Global Soft Delete Filter
     *
     * Automatically filters out soft-deleted records (deletedAt !== null)
     * from read operations (findMany, findFirst, findFirstOrThrow, count).
     *
     * Note: findUnique is intentionally excluded because Prisma requires unique fields only
     * in findUnique queries, and deletedAt is not a unique field. Adding it causes runtime crashes.
     */
    private applySoftDeleteExtension(): any {
        const modelsWithSoftDelete = new Set([
            'User', 'Department', 'Team', 'Category', 'KnowledgeArticle',
            'CustomerProfile', 'CrmConnection', 'Ticket', 'TicketMessage',
            'Attachment', 'FaqEntry', 'Macro', 'Product', 'ProductCategory',
            'Announcement', 'CrmAccount',
        ]);

        const softDeleteMiddleware = async ({ model, operation, args, query }: any) => {
            if (model && modelsWithSoftDelete.has(model)) {
                // Safely handle cases where args or args.where might be undefined
                const safeArgs = args || {};
                safeArgs.where = { ...safeArgs.where, deletedAt: null };
                return query(safeArgs);
            }
            return query(args);
        };

        const extendedClient = this.$extends({
            query: {
                $allModels: {
                    findMany: softDeleteMiddleware,
                    findFirst: softDeleteMiddleware,
                    findFirstOrThrow: softDeleteMiddleware,
                    count: softDeleteMiddleware,
                },
            },
        });
        this.logger.log('🔒 Soft-delete extension active — deletedAt: null filter applied to models');
        return extendedClient;
    }
}
