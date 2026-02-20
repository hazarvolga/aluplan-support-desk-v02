import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { FaqCronService } from './faq.cron.service';
import { KbSummarizerProcessor } from './kb-summarizer.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        PrismaModule,
        AiModule,
        BullModule.registerQueue({
            name: 'kb-summarizer',
        }),
    ],
    controllers: [FaqController],
    providers: [FaqService, FaqCronService, KbSummarizerProcessor],
    exports: [FaqService],
})
export class FaqModule { }
