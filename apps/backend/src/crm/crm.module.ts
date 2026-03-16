import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { CrmProcessor } from './crm.processor';

import { CrmWebhookController } from './webhooks/crm-webhook.controller';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({
            name: 'crm-sync',
        }),
    ],
    controllers: [CrmController, CrmWebhookController],
    providers: [CrmService, Dynamics365Adapter, CrmProcessor],
    exports: [CrmService],
})
export class CrmModule { }
