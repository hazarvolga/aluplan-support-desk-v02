import {
    Controller, Post, Param, Body,
    Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { ReviewArticleDto } from './dto/article.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('kb/articles')
export class KnowledgeBaseApprovalController {
    constructor(private readonly kbService: KnowledgeBaseService) { }

    @Post(':id/submit')
    @RequirePermissions('kb:submit_review')
    @ApiOperation({ summary: 'Submit article for review' })
    submitForReview(@Param('id') id: string): Promise<any> {
        return this.kbService.submitForReview(id);
    }

    @Post(':id/review')
    @RequirePermissions('kb:approve')
    @ApiOperation({ summary: 'Approve or reject article (reviewer only)' })
    review(@Param('id') id: string, @Body() dto: ReviewArticleDto, @Request() req: any): Promise<any> {
        return this.kbService.review(id, dto, req.user.sub);
    }
}
