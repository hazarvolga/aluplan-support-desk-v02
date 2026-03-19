import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        super({ adapter, errorFormat: 'pretty' });
    }

    async onModuleInit() {
        await this.$connect();
        try {
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "provider" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "model" TEXT;`);
        } catch (e: any) {
            this.logger.warn(`Dynamic schema patch skipped: ${e.message}`);
        }
        this.logger.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
