import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FaqService } from './faq.service';

@Injectable()
export class FaqCronService {
    private readonly logger = new Logger(FaqCronService.name);

    constructor(private readonly faqService: FaqService) { }

    /**
     * Run FAQ pipeline every night at 03:00.
     * Extracts patterns from the last day's resolved tickets and failed interactions.
     */
    @Cron(CronExpression.EVERY_DAY_AT_3AM, { waitForCompletion: true })
    async runNightlyPipeline() {
        this.logger.log('🌙 Running nightly FAQ pipeline...');

        try {
            const result = await this.faqService.runPipeline();
            this.logger.log(
                `✅ Nightly FAQ: +${result.autoPublished} published, +${result.queued} queued for review, ${result.skipped} skipped`,
            );
        } catch (err: any) {
            this.logger.error(`❌ FAQ pipeline failed: ${err.message}`);
        }
    }
}
