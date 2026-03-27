import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool as any);
        super({ adapter, errorFormat: 'pretty' });
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
                'attachments', 'categories', 'products'
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
