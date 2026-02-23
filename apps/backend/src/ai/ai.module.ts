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

@Module({
    imports: [SettingsModule],
    controllers: [AiController],
    providers: [
        OllamaService,
        OpenAiService,
        GenericOpenAiService,
        AiService,
        EmbeddingService,
        AiQueryService,
        AiAutoResolverService,
        AiCopilotService,
        PromptContextBuilderService
    ],
    exports: [AiService, EmbeddingService, AiQueryService, AiCopilotService, PromptContextBuilderService],
})
export class AiModule { }
