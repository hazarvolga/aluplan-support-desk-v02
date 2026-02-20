import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { AiController } from './ai.controller';

@Module({
    controllers: [AiController],
    providers: [OllamaService, EmbeddingService, AiQueryService],
    exports: [OllamaService, EmbeddingService, AiQueryService],
})
export class AiModule { }
