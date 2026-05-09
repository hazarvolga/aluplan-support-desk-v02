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
        return this.applySoftDeleteExtension();
    }

    async onModuleInit() {
        await this.$connect();
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
     * GAP-14 & GAP-19: Prisma Client Extension — Global Soft Delete Filter
     *
     * Automatically filters out soft-deleted records (deletedAt !== null)
     * from all read operations (findMany, findFirst, findUnique, count).
     *
     * Note: Prisma Client Extensions return a NEW client instance.
     * By returning the extended client from the constructor, NestJS injects the proxy.
     */
    private applySoftDeleteExtension(): any {
        const extendedClient = this.$extends({
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
                    async findUnique({ model, operation, args, query }: any) {
                        args.where = { ...args.where, deletedAt: null };
                        return query(args);
                    },
                },
            },
        });
        this.logger.log('🔒 Soft-delete extension active — deletedAt: null filter applied to all reads');
        return extendedClient;
    }
}
