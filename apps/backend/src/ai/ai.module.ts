import { Module, forwardRef } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { GeminiService } from './gemini.service';
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
import { AiEvalService } from './ai-eval.service';
import { RagObservabilityService } from './rag-observability.service';
import { RagMaintenanceService } from './rag-maintenance.service';
import { KnowledgePoolModule } from '../knowledge-pool/knowledge-pool.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentAiService } from './document-ai.service';
import { DocumentParsingProcessor } from './document-parsing.processor';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AiQueryProcessor } from './ai-query.processor';
import { AiProviderRegistry } from './ai-provider-registry.service';
import { AiProviderRouter } from './ai-provider-router.service';
import { AiCircuitBreakerService } from './ai-circuit-breaker.service';
import { EmbeddingNormalizer } from './embedding-normalizer.service';
import { AiSemanticCache } from './ai-semantic-cache.service';
import { AiBudgetMonitor } from './ai-budget-monitor.service';
import { EmbeddingVersionRegistry } from './embedding-version.registry';
import { EmbeddingMigrationProcessor } from './embedding-migration.processor';
import { FaqModule } from '../faq/faq.module';
import { AiHealthEventService } from './ai-health-event.service';
import { PreReimportInspectService } from './pre-reimport-inspect.service';
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';

@Module({
    imports: [
        SettingsModule,
        RedisModule,
        PrismaModule,
        forwardRef(() => EmailModule),
        forwardRef(() => KnowledgePoolModule),
        forwardRef(() => FaqModule),
        forwardRef(() => NotificationsModule),
        BullModule.registerQueue(
            {
                name: 'document-parsing',
                defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: false }
            },
            {
                name: 'ai-query-processing',
                defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: false },
            },
            {
                name: 'embedding-migration',
                defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: false },
            }
        ),
    ],
    controllers: [AiController],
    providers: [
        AiService,
        AiProviderRegistry,
        AiProviderRouter,
        AiCircuitBreakerService,
        EmbeddingNormalizer,
        AiSemanticCache,
        AiBudgetMonitor,
        OpenAiService,
        GenericOpenAiService,
        OllamaService,
        EmbeddingService,
        AiQueryService,
        SupportAnswerOrchestrator,
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
        DocumentAiService,
        DocumentParsingProcessor,
        AiQueryProcessor,
        EmbeddingVersionRegistry,
        EmbeddingMigrationProcessor,
        GeminiService,
        AiEvalService,
        AiHealthEventService,
        PreReimportInspectService,
    ],
    exports: [
        AiService,
        AiProviderRegistry,
        AiProviderRouter,
        AiCircuitBreakerService,
        EmbeddingNormalizer,
        AiSemanticCache,
        AiBudgetMonitor,
        EmbeddingService,
        AiQueryService,
        SupportAnswerOrchestrator,
        AiCopilotService,
        AiDiagnosisService,
        PromptContextBuilderService,
        PromptsService,
        LangfuseService,
        LlmApiService,
        TrustScoreCalculator,
        TicketClusteringService,
        AiReportingService,
        AiEvalService,
        RagObservabilityService,
        RagMaintenanceService,
        DocumentAiService,
        EmbeddingVersionRegistry,
        GeminiService,
        AiHealthEventService,
        PreReimportInspectService,
    ],
})
export class AiModule { }
