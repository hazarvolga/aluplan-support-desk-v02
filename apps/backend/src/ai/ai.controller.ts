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
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsBoolean } from 'class-validator';

export class AiQueryDto {
    @ApiProperty({ example: 'Şifremi nasıl sıfırlarım?' })
    @IsString()
    @MinLength(3)
    query: string;
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
    ) { }

    @Post('query')
    @ApiOperation({ summary: 'Ask a question — semantic search + AI reformat pipeline' })
    @HttpCode(HttpStatus.OK)
    query(@Body() dto: AiQueryDto, @Request() req: any) {
        return this.aiQueryService.query(dto.query, req.user.sub);
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
    submitFeedback(
        @Param('id') interactionId: string,
        @Body() dto: FeedbackDto,
        @Request() req: any,
    ) {
        return this.aiQueryService.submitFeedback(
            interactionId,
            req.user.sub,
            dto.rating,
            dto.comment,
        );
    }

    @Post('interactions/:id/telemetry')
    @ApiOperation({ summary: 'Submit acceptance/edit telemetry for an AI interaction' })
    submitTelemetry(
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
    @Roles('admin', 'support_manager')
    @ApiOperation({ summary: 'Low-confidence queries pending FAQ review (admin only)' })
    getReviewQueue(): Promise<any[]> {
        return this.aiQueryService.getPendingForReview();
    }

    @Post('reindex')
    @Roles('admin')
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

    @Post('search')
    @ApiOperation({ summary: 'Semantic search Knowledge Pool + Articles with Product filtering' })
    @HttpCode(HttpStatus.OK)
    async search(@Body() dto: { query: string; productId?: string; limit?: number }, @Request() req: any) {
        const results = await this.embeddingService.search(dto.query, dto.limit ?? 5, dto.productId);

        // Log as an interaction for traceability
        const interaction = await this.aiQueryService.logSearchInteraction(
            dto.query,
            req.user?.sub,
            results,
            dto.productId
        );

        return {
            results,
            interactionId: interaction.id
        };
    }

    @Get('tickets/:id/summarize')
    @Roles('admin', 'agent', 'support_manager')
    @ApiOperation({ summary: 'Generate AI summary of a ticket thread' })
    summarize(@Param('id') ticketId: string) {
        return this.aiQueryService.summarizeTicket(ticketId);
    }

    @Get('copilot/draft/:ticketId')
    @Roles('admin', 'agent', 'support_manager')
    @ApiOperation({ summary: 'Generate AI response draft for a ticket' })
    async getCopilotDraft(@Param('ticketId') ticketId: string) {
        return this.aiCopilotService.generateDraft(ticketId);
    }
}
