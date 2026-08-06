import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { AiInteractionHistoryService } from './ai-interaction-history.service';
import { ListAiInteractionsDto } from './dto/list-ai-interactions.dto';

@ApiTags('AI Interaction History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard, ThrottlerGuard)
@Controller('ai/interactions')
export class AiInteractionHistoryController {
    constructor(private readonly historyService: AiInteractionHistoryService) { }

    @Get()
    @RequirePermissions('ai-interactions:read')
    @ApiOperation({ summary: 'List customer AI interactions for authorized staff' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'ticketState', required: false, enum: ['ALL', 'TICKETED', 'TICKETLESS'] })
    @ApiQuery({ name: 'confidence', required: false, enum: ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'NO_MATCH'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'interactionId', required: false, type: String, format: 'uuid' })
    list(@Query() query: ListAiInteractionsDto, @Request() req: any) {
        return this.historyService.list(query, req.user?.role, req.user?.sub ?? req.user?.id);
    }
}
