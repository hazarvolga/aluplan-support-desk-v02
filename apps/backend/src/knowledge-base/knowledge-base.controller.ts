import {
    Controller, Get, Post, Patch, Param, Body,
    Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateArticleDto, UpdateArticleDto, ReviewArticleDto } from './dto/article.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';

const ArticleStatus = {
    DRAFT: 'DRAFT',
    PENDING_REVIEW: 'PENDING_REVIEW',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
} as const;
type ArticleStatus = typeof ArticleStatus[keyof typeof ArticleStatus];

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('kb')
export class KnowledgeBaseController {
    constructor(private readonly kbService: KnowledgeBaseService) { }

    // ─── CATEGORIES ─────────────────────────────────────────
    @Get('categories')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'List all categories' })
    listCategories() {
        return this.kbService.listCategories();
    }

    @Post('categories')
    @RequirePermissions('kb:create')
    @ApiOperation({ summary: 'Create a category' })
    createCategory(@Body() body: { name: string; parentId?: string }) {
        return this.kbService.createCategory(body);
    }

    // ─── ARTICLES ───────────────────────────────────────────
    @Get('articles')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'List articles' })
    @ApiQuery({ name: 'status', required: false, enum: ArticleStatus })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() q: any) {
        return this.kbService.findAll({
            status: q.status,
            categoryId: q.categoryId,
            search: q.search,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 20,
        });
    }

    @Get('articles/:id')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'Get article detail (all versions)' })
    findOne(@Param('id') id: string) {
        return this.kbService.findOne(id);
    }

    @Post('articles')
    @RequirePermissions('kb:create')
    @ApiOperation({ summary: 'Create new article (starts as DRAFT)' })
    create(@Body() dto: CreateArticleDto, @Request() req: any) {
        return this.kbService.create(dto, req.user.sub);
    }

    @Patch('articles/:id')
    @RequirePermissions('kb:update')
    @ApiOperation({ summary: 'Update article (creates new version if content changes)' })
    update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Request() req: any) {
        return this.kbService.update(id, dto, req.user.sub);
    }

    @Post('articles/:id/submit')
    @RequirePermissions('kb:submit_review')
    @ApiOperation({ summary: 'Submit article for review' })
    submitForReview(@Param('id') id: string, @Request() req: any) {
        return this.kbService.submitForReview(id, req.user.sub);
    }

    @Post('articles/:id/review')
    @RequirePermissions('kb:approve')
    @ApiOperation({ summary: 'Approve or reject article (reviewer only)' })
    review(@Param('id') id: string, @Body() dto: ReviewArticleDto, @Request() req: any) {
        return this.kbService.review(id, dto, req.user.sub);
    }

    @Patch('articles/:id/archive')
    @RequirePermissions('kb:delete')
    @ApiOperation({ summary: 'Archive an article' })
    archive(@Param('id') id: string) {
        return this.kbService.archive(id);
    }

    @Get('search')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'Keyword search in published articles' })
    @ApiQuery({ name: 'q', required: true })
    keywordSearch(@Query('q') query: string) {
        return this.kbService.keywordSearch(query);
    }
}
