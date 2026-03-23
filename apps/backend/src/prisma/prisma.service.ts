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
            await this.$executeRawUnsafe(`ALTER TABLE "knowledge_pool_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;`);
            await this.$executeRawUnsafe(`ALTER TABLE "knowledge_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;`);
        } catch (e: any) {
            this.logger.warn(`Dynamic schema patch skipped: ${e.message}`);
        }
        this.logger.log('✅ Database connected');

        // Emergency Repair: Restore hazarvolga@gmail.com to ADMIN role if needed
        try {
            const adminRole = await this.role.findFirst({ where: { name: 'ADMIN' } });
            if (adminRole) {
                const mainUser = await this.user.findUnique({ where: { email: 'hazarvolga@gmail.com' } });
                if (mainUser && mainUser.roleId !== adminRole.id) {
                    await this.user.update({
                        where: { id: mainUser.id },
                        data: { roleId: adminRole.id }
                    });
                    this.logger.warn('REPAIRED: Restored ADMIN role for hazarvolga@gmail.com at startup');
                }
            }
        } catch (repairError: any) {
            this.logger.error(`Self-repair failed: ${repairError.message}`);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
