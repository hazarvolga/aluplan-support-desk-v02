import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { AiController } from './ai.controller';
import { AiAutoResolverService } from './ai-auto-resolver.service';
import { AiCopilotService } from './ai-copilot.service';

@Module({
    controllers: [AiController],
    providers: [OllamaService, EmbeddingService, AiQueryService, AiAutoResolverService, AiCopilotService],
    exports: [OllamaService, EmbeddingService, AiQueryService, AiCopilotService],
})
export class AiModule { }
