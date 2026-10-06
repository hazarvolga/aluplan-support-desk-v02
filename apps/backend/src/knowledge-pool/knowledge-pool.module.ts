import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { KnowledgePoolService } from './knowledge-pool.service';
import { KnowledgePoolController } from './knowledge-pool.controller';
import { KnowledgePoolProcessor } from './knowledge-pool.processor';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

import { CrawlService } from './crawl.service';
import { LearnNowCrawlerService } from './learnnow-crawler.service';
import { GenericWebCrawlerService } from './generic-web-crawler.service';
import { AllplanHelpCrawlerService } from './allplan-help-crawler.service';
import { VisualContentService } from './visual-content.service';
import { LearnNowCrawlRunService } from './learnnow-crawl-run.service';
import { LearnNowCrawlProcessor } from './learnnow-crawl.processor';
import { LearnNowRequestPacer } from './learnnow-request-pacer.service';
import { OutboundUrlSafetyService } from './outbound-url-safety.service';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => AiModule),
        BullModule.registerQueue({
            name: 'knowledge-sync',
        }),
        BullModule.registerQueue({
            name: 'learnnow-crawl',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: false,
            },
        }),
    ],
    controllers: [KnowledgePoolController],
    providers: [KnowledgePoolService, KnowledgePoolProcessor, KnowledgePoolParserService, CrawlService, LearnNowCrawlerService, GenericWebCrawlerService, AllplanHelpCrawlerService, VisualContentService, LearnNowCrawlRunService, LearnNowCrawlProcessor, LearnNowRequestPacer, OutboundUrlSafetyService],
    exports: [KnowledgePoolService, KnowledgePoolParserService],
})
export class KnowledgePoolModule { }
