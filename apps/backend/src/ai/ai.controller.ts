import {
    Controller, Post, Get, Body, Param, Request,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiQueryService } from './ai-query.service';
import { EmbeddingService } from './embedding.service';
import { OllamaService } from './ollama.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

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

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('ai')
export class AiController {
    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly embeddingService: EmbeddingService,
        private readonly ollamaService: OllamaService,
    ) { }

    @Post('query')
    @ApiOperation({ summary: 'Ask a question — semantic search + AI reformat pipeline' })
    @HttpCode(HttpStatus.OK)
    query(@Body() dto: AiQueryDto, @Request() req: any) {
        return this.aiQueryService.query(dto.query, req.user.sub);
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
    @ApiOperation({ summary: 'Check Ollama availability' })
    async status() {
        const available = await this.ollamaService.isAvailable();
        return { ollama: available ? 'online' : 'offline' };
    }

    @Get('tickets/:id/summarize')
    @Roles('admin', 'agent', 'support_manager')
    @ApiOperation({ summary: 'Generate AI summary of a ticket thread' })
    summarize(@Param('id') ticketId: string) {
        return this.aiQueryService.summarizeTicket(ticketId);
    }
}
