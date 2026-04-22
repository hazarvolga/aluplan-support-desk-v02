import { Module } from '@nestjs/common';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseApprovalController } from './knowledge-base-approval.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [AiModule], // for EmbeddingService
    controllers: [KnowledgeBaseController, KnowledgeBaseApprovalController],
    providers: [KnowledgeBaseService],
    exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule { }
