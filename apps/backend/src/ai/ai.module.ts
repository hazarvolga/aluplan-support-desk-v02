import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
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

@Module({
    imports: [SettingsModule],
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
        PromptContextBuilderService,
        PromptsService,
        LangfuseService
    ],
    exports: [AiService, EmbeddingService, AiQueryService, AiCopilotService, PromptContextBuilderService, PromptsService, LangfuseService],
})
export class AiModule { }
