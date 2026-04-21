import { Module, forwardRef } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { AiController } from './ai.controller';
import { AiAutoResolverService } from './ai-auto-resolver.service';
import { AiCopilotService } from './ai-copilot.service';
import { SettingsModule } from '../settings/settings.module';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { LangfuseService } from './langfuse.service';
import { TrustScoreCalculator } from './utils/trust-score.calculator';
import { TicketClusteringService } from './ticket-clustering.service';
import { AiReportingService } from './ai-reporting.service';
import { RagObservabilityService } from './rag-observability.service';
import { RagMaintenanceService } from './rag-maintenance.service';
import { KnowledgePoolModule } from '../knowledge-pool/knowledge-pool.module';
import { EmailModule } from '../email/email.module';
import { VertexAiService } from './vertex-ai.service';

import { BullModule } from '@nestjs/bullmq';
import { DocumentAiService } from './document-ai.service';
import { DocumentParsingProcessor } from './document-parsing.processor';
import { AiDiagnosisService } from './ai-diagnosis.service';

@Module({
    imports: [
        SettingsModule,
        forwardRef(() => EmailModule),
        forwardRef(() => KnowledgePoolModule),
        BullModule.registerQueue({ name: 'document-parsing' }),
    ],
    controllers: [AiController],
    providers: [
        AiService,
        OpenAiService,
        GenericOpenAiService,
        OllamaService,
        EmbeddingService,
        AiQueryService,
        AiAutoResolverService,
        AiCopilotService,
        AiDiagnosisService,
        PromptContextBuilderService,
        PromptsService,
        LangfuseService,
        LlmApiService,
        TrustScoreCalculator,
        TicketClusteringService,
        AiReportingService,
        RagObservabilityService,
        RagMaintenanceService,
        VertexAiService,
        DocumentAiService,
        DocumentParsingProcessor,
    ],
    exports: [
        AiService,
        EmbeddingService,
        AiQueryService,
        AiCopilotService,
        AiDiagnosisService,
        PromptContextBuilderService,
        PromptsService,
        LangfuseService,
        LlmApiService,
        TrustScoreCalculator,
        TicketClusteringService,
        AiReportingService,
        RagObservabilityService,
        RagMaintenanceService,
        VertexAiService,
        DocumentAiService,
    ],
})
export class AiModule { }
