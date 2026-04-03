import {
    Controller, Post, Get, Body, Param, Request, Query,
    UseGuards, HttpCode, HttpStatus, Sse, MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiQueryService } from './ai-query.service';
import { EmbeddingService } from './embedding.service';
import { OllamaService } from './ollama.service';
import { AiService } from './ai.service';
import { AiCopilotService } from './ai-copilot.service';
import { AiReportingService } from './ai-reporting.service';
import { StorageService } from '../common/services/storage.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsBoolean } from 'class-validator';

export class AiQueryDto {
    @ApiProperty({ example: 'Şifremi nasıl sıfırlarım?' })
    @IsString()
    @MinLength(3)
    query: string;

    @ApiPropertyOptional()
    @IsOptional()
    hotinfoContext?: any;
}

export class FeedbackDto {
    @ApiProperty({ example: 4 })
    @IsInt() @Min(1) @Max(5)
    rating: number;

    @ApiPropertyOptional()
    @IsString() @IsOptional()
    comment?: string;
}

export class AiTelemetryDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    accepted: boolean;

    @ApiPropertyOptional()
    @IsString() @IsOptional()
    editedResponse?: string;
}

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(RbacGuard, ThrottlerGuard)
@Controller('ai')
export class AiController {
    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly embeddingService: EmbeddingService,
        private readonly aiService: AiService,
        private readonly aiCopilotService: AiCopilotService,
        private readonly _ollama: OllamaService,
        private readonly aiReportingService: AiReportingService,
        private readonly storageService: StorageService,
    ) { }

    @Post('test-storage')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Test S3/Minio storage connectivity' })
    async testStorage() {
        return this.storageService.testConnection();
    }

    @Post('query')
    @ApiOperation({ summary: 'Ask a question — semantic search + AI reformat pipeline' })
    @HttpCode(HttpStatus.OK)
    query(@Body() dto: AiQueryDto, @Request() req: any) {
        return this.aiQueryService.query(dto.query, req.user.sub, 'WEB', dto.hotinfoContext);
    }

    @Get('metrics')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Get global AI usage metrics (Cost/Token tracking)' })
    async getMetrics() {
        return this.aiQueryService.getTelemetryMetrics();
    }

    @Get('health-metrics')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Get detailed AI health & deflection metrics' })
    async getHealth() {
        return this.aiQueryService.getHealthMetrics();
    }

    @Get('health-trends')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Get AI health time-series trends (deflection and accuracy over time)' })
    async getHealthTrends(@Query('days') days?: string) {
        return this.aiQueryService.getHealthTrends(days ? parseInt(days, 10) : 7);
    }

    @Get('knowledge-gaps')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Identify top knowledge gaps (most frequent unanswered queries)' })
    async getKnowledgeGaps(@Query('limit') limit?: string) {
        return this.aiQueryService.getKnowledgeGaps(limit ? parseInt(limit, 10) : 5);
    }

    @Post('trigger-report')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Manually trigger the weekly AI health report email' })
    async triggerReport() {
        return this.aiReportingService.triggerNow();
    }

    @Get('sources-stats')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Get counts for the 4 source pillars (Documents, Articles, URLs, Tickets)' })
    async getSourcesStats() {
        return this.aiQueryService.getSourcesStats();
    }

    @Post('translate')
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    @ApiOperation({ summary: 'Translate text to a target language' })
    async translate(@Body() body: { text: string; targetLanguage: string }) {
        const result = await this.aiService.translate(body.text, body.targetLanguage);
        return { translatedText: result };
    }

    @Get('query/stream')
    @ApiOperation({ summary: 'Stream AI response via SSE' })
    @Sse()
    streamQuery(@Query('q') query: string, @Request() req: any): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            (async () => {
                try {
                    const stream = this.aiQueryService.streamQuery(query, req.user?.sub);
                    for await (const object of stream) {
                        subscriber.next({ data: object } as MessageEvent);
                    }
                    subscriber.complete();
                } catch (err) {
                    subscriber.error(err);
                }
            })();
        });
    }

    @Post('interactions/:id/feedback')
    @ApiOperation({ summary: 'Submit rating/feedback for an AI interaction' })
    async submitFeedback(
        @Param('id') interactionId: string,
        @Body() dto: FeedbackDto,
        @Request() req: any,
    ) {
        // Feedback logic can live in either AiQueryService or AiService depending on preference.
        // We will bridge it to AiQueryService as it handles the interaction store.
        return this.aiQueryService.submitFeedback(
            interactionId,
            req.user.sub,
            dto.rating,
            dto.comment,
        );
    }

    @Post('interactions/:id/telemetry')
    @ApiOperation({ summary: 'Submit acceptance/edit telemetry for an AI interaction' })
    async submitTelemetry(
        @Param('id') interactionId: string,
        @Body() dto: AiTelemetryDto,
    ) {
        return this.aiQueryService.submitTelemetry(
            interactionId,
            dto.accepted,
            dto.editedResponse
        );
    }

    @Get('review-queue')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Low-confidence queries pending FAQ review (admin only)' })
    getReviewQueue(): Promise<any[]> {
        return this.aiQueryService.getPendingForReview();
    }

    @Post('reindex')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Re-index all published articles (run after model change)' })
    reindex() {
        return this.embeddingService.reindexAll();
    }

    @Get('status')
    @ApiOperation({ summary: 'Check AI service availability' })
    async status() {
        const available = await this.aiService.isAvailable();
        return { available, provider: 'dynamic' };
    }

    @Get('health-status')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Get detailed AI health status for all providers' })
    async getHealthStatus() {
        return this.aiService.getHealthStatus();
    }

    @Post('test-connection')
    @Roles('ADMIN', 'SUPERUSER')
    @ApiOperation({ summary: 'Test connection for a specific AI provider' })
    async testConnection(@Body() dto: { provider: string }) {
        const result = await this.aiService.testProvider(dto.provider);
        return {
            success: result.success,
            provider: dto.provider,
            message: result.message
        };
    }

    @Post('search')
    @ApiOperation({ summary: 'Semantic search Knowledge Pool + Articles with Product filtering' })
    @HttpCode(HttpStatus.OK)
    async search(@Body() dto: { query: string; productId?: string; limit?: number }, @Request() req: any) {
        const isStaff = req.user?.role !== 'customer';
        const searchResponse = await this.embeddingService.search(dto.query, dto.limit ?? 5, dto.productId, isStaff);

        // Log as an interaction for traceability
        const interaction = await this.aiQueryService.logSearchInteraction(
            dto.query,
            req.user?.sub,
            searchResponse.results, // Use searchResponse.results here
            dto.productId,
            isStaff
        );

        return {
            results: searchResponse.results,
            interactionId: interaction.id
        };
    }

    @Get('tickets/:id/summarize')
    @Roles('ADMIN', 'AGENT', 'SUPERUSER')
    @ApiOperation({ summary: 'Generate AI summary of a ticket thread' })
    summarize(@Param('id') ticketId: string) {
        return this.aiQueryService.summarizeTicket(ticketId);
    }

    @Get('copilot/draft/:ticketId')
    @Roles('ADMIN', 'AGENT', 'SUPERUSER')
    @ApiOperation({ summary: 'Generate AI response draft for a ticket' })
    async getCopilotDraft(@Param('ticketId') ticketId: string) {
        return this.aiCopilotService.generateDraft(ticketId);
    }
}
