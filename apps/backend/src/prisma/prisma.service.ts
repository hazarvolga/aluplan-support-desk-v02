import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        await this.$connect();
        try {
            // Safely inject schema updates manually to bypass migration history drift on environments
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "provider" TEXT;`);
            await this.$executeRawUnsafe(`ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "model" TEXT;`);
            this.logger.log('✅ Dynamic schema patches applied format ai_interactions.');
        } catch (e: any) {
            this.logger.warn(`Failed to inject dynamic columns for AI metrics (ok in development): ${e.message}`);
        }
        this.logger.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
}
