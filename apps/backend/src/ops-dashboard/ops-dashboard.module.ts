import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { OpsDashboardController } from './ops-dashboard.controller';
import { OpsDashboardService } from './ops-dashboard.service';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue(
            { name: 'knowledge-sync' },
            { name: 'crm-sync' },
            { name: 'ai-query-processing' },
        ),
    ],
    controllers: [OpsDashboardController],
    providers: [OpsDashboardService],
    exports: [OpsDashboardService],
})
export class OpsDashboardModule { }
