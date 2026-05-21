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
import { VisualContentService } from './visual-content.service';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => AiModule),
        BullModule.registerQueue({
            name: 'knowledge-sync',
        }),
    ],
    controllers: [KnowledgePoolController],
    providers: [KnowledgePoolService, KnowledgePoolProcessor, KnowledgePoolParserService, CrawlService, LearnNowCrawlerService, GenericWebCrawlerService, VisualContentService],
    exports: [KnowledgePoolService, KnowledgePoolParserService],
})
export class KnowledgePoolModule { }
