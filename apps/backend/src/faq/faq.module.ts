import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { FaqCronService } from './faq.cron.service';

@Module({
    controllers: [FaqController],
    providers: [FaqService, FaqCronService],
    exports: [FaqService],
})
export class FaqModule { }
