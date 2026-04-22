import {
    Controller, Get, Post, Patch, Param, Body,
    Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateArticleDto, UpdateArticleDto, ReviewArticleDto, SubmitFeedbackDto } from './dto/article.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';

const ArticleStatus = {
    DRAFT: 'DRAFT',
    REVIEW: 'REVIEW',
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
    findAll(@Query() q: any, @Request() req: any): Promise<any> {
        const isStaff = req.user?.role?.toUpperCase() !== 'CUSTOMER';
        return this.kbService.findAll({
            status: q.status,
            categoryId: q.categoryId,
            search: q.search,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 20,
            includeInternal: isStaff,
        });
    }

    @Get('articles/:id')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'Get article detail (all versions)' })
    findOne(@Param('id') id: string): Promise<any> {
        return this.kbService.findOne(id);
    }

    @Post('articles')
    @RequirePermissions('kb:create')
    @ApiOperation({ summary: 'Create new article (starts as DRAFT)' })
    create(@Body() dto: CreateArticleDto, @Request() req: any): Promise<any> {
        return this.kbService.create(dto, req.user.sub);
    }

    @Patch('articles/:id')
    @RequirePermissions('kb:update')
    @ApiOperation({ summary: 'Update article (creates new version if content changes)' })
    update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Request() req: any): Promise<any> {
        return this.kbService.update(id, dto, req.user.sub);
    }


    @Patch('articles/:id/archive')
    @RequirePermissions('kb:delete')
    @ApiOperation({ summary: 'Archive an article' })
    archive(@Param('id') id: string): Promise<any> {
        return this.kbService.archive(id);
    }

    @Get('search')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'Keyword search in published articles' })
    @ApiQuery({ name: 'q', required: true })
    keywordSearch(@Query('q') query: string, @Request() req: any): Promise<any> {
        const isStaff = req.user?.role?.toUpperCase() !== 'CUSTOMER';
        return this.kbService.keywordSearch(query, 10, isStaff);
    }

    // ─── ANALYTICS & FEEDBACK ─────────────────────────────
    @Public()
    @Post('articles/:id/view')
    @ApiOperation({ summary: 'Increment article view count' })
    incrementViewCount(@Param('id') id: string): Promise<any> {
        return this.kbService.incrementViewCount(id);
    }

    @Post('articles/:id/feedback')
    @ApiOperation({ summary: 'Submit feedback for an article' })
    submitFeedback(@Param('id') id: string, @Body() dto: SubmitFeedbackDto, @Request() req: any) {
        return this.kbService.submitFeedback(id, dto, req.user?.sub);
    }

    @Get('articles/:id/analytics')
    @RequirePermissions('reports:read')
    @ApiOperation({ summary: 'Get article analytics' })
    getAnalytics(@Param('id') id: string) {
        return this.kbService.getAnalytics(id);
    }

    // ─── VERSIONING ───────────────────────────────────────
    @Get('articles/:id/compare')
    @RequirePermissions('kb:read')
    @ApiOperation({ summary: 'Compare two versions of an article' })
    @ApiQuery({ name: 'v1', required: true, type: Number })
    @ApiQuery({ name: 'v2', required: true, type: Number })
    compare(@Param('id') id: string, @Query('v1') v1: number, @Query('v2') v2: number) {
        return this.kbService.compareVersions(id, v1, v2);
    }

    @Post('articles/suggest-category')
    @RequirePermissions('kb:create')
    @ApiOperation({ summary: 'Suggest a category for an article' })
    suggestCategory(@Body() body: { title: string; content: string }) {
        return this.kbService.suggestArticleCategory(body.title, body.content);
    }

    @Get('analytics')
    @RequirePermissions('reports:read')
    @ApiOperation({ summary: 'Get global KB usage and feedback analytics' })
    getGlobalAnalytics() {
        return this.kbService.getGlobalAnalytics();
    }
}
