import { Module } from '@nestjs/common';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [AiModule], // for EmbeddingService
    controllers: [KnowledgeBaseController],
    providers: [KnowledgeBaseService],
    exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule { }
