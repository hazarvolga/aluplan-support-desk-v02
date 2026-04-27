import { Module, forwardRef } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { CrmProcessor } from './crm.processor';
import { CrmWebhookController } from './webhooks/crm-webhook.controller';
import { CrmEmailValidatorService } from './crm-email-validator.service';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({
            name: 'crm-sync',
            defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 50, removeOnFail: false },
        }),
    ],
    controllers: [CrmController, CrmWebhookController],
    providers: [CrmService, Dynamics365Adapter, CrmProcessor, CrmEmailValidatorService],
    exports: [CrmService, CrmEmailValidatorService],
})
export class CrmModule { }
