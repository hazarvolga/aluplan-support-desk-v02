import {
    Controller, Get, Post, Patch, Delete,
    BadRequestException, Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { FaqStatus } from '@aluplan/database';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions, Roles } from '../rbac/decorators/rbac.decorators';

const FAQ_STATUSES = new Set<string>(Object.values(FaqStatus));
const FAQ_STAFF_ROLES = new Set([
    'ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'SUPPORT_MANAGER',
    'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT', 'SUPPORT_AGENT', 'KB_EDITOR',
]);

function isFaqStaffRole(role: unknown): boolean {
    const value = typeof role === 'string'
        ? role
        : role && typeof role === 'object' && 'name' in role
            ? (role as { name?: unknown }).name
            : '';
    const normalized = typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : '';
    return FAQ_STAFF_ROLES.has(normalized);
}

function parsePositiveIntQuery(value: unknown, fallback: number, field: string, max?: number): number {
    if (value === undefined || value === null || value === '') return fallback;

    const normalized = Array.isArray(value) ? value[0] : value;
    const parsed = Number(normalized);

    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new BadRequestException(`${field} must be a positive integer`);
    }
    if (max !== undefined && parsed > max) {
        throw new BadRequestException(`${field} must be at most ${max}`);
    }

    return parsed;
}

function parseFaqStatusQuery(value: unknown): FaqStatus | undefined {
    if (value === undefined || value === null || value === '') return undefined;

    const normalized = String(Array.isArray(value) ? value[0] : value).trim().toUpperCase();
    if (!FAQ_STATUSES.has(normalized)) {
        throw new BadRequestException(`status must be one of: ${[...FAQ_STATUSES].join(', ')}`);
    }

    return normalized as FaqStatus;
}

@ApiTags('FAQ')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    // ─── PUBLIC: Published FAQs (for widget) ─────────────────
    @Get('published')
    @ApiOperation({ summary: 'Get published FAQs (public widget endpoint)' })
    @ApiQuery({ name: 'language', required: false })
    getPublished(@Query('language') language = 'tr', @Request() req: any) {
        const isStaff = isFaqStaffRole(req.user?.role);
        return this.faqService.getPublished(language, 50, isStaff);
    }

    // ─── ADMIN: CRUD + Review ─────────────────────────────────
    @Get()
    @RequirePermissions('faq:review')
    @ApiOperation({ summary: 'List all FAQs with pagination' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() q: any): Promise<any> {
        return this.faqService.findAll({
            status: parseFaqStatusQuery(q.status),
            page: parsePositiveIntQuery(q.page, 1, 'page'),
            limit: parsePositiveIntQuery(q.limit, 20, 'limit', 100),
        });
    }

    @Get(':id')
    @RequirePermissions('faq:review')
    findOne(@Param('id') id: string): Promise<any> {
        return this.faqService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('faq:manage')
    @ApiOperation({ summary: 'Edit FAQ question/answer/tags' })
    update(@Param('id') id: string, @Body() body: { question?: string; answer?: string; tags?: string[] }) {
        return this.faqService.updateFaq(id, body);
    }

    @Post(':id/approve')
    @Roles('admin', 'support_manager', 'kb_editor')
    @ApiOperation({ summary: 'Approve and publish a pending FAQ' })
    approve(@Param('id') id: string) {
        return this.faqService.approveFaq(id);
    }

    @Post(':id/dismiss')
    @Roles('admin', 'support_manager', 'kb_editor')
    @ApiOperation({ summary: 'Dismiss (reject) a pending FAQ' })
    dismiss(@Param('id') id: string) {
        return this.faqService.dismissFaq(id);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Permanently delete a FAQ entry' })
    remove(@Param('id') id: string): Promise<any> {
        return this.faqService.deleteFaq(id);
    }

    // ─── PIPELINE ─────────────────────────────────────────────
    @Post('pipeline/run')
    @Roles('admin', 'support_manager')
    @ApiOperation({ summary: 'Manually trigger FAQ extraction pipeline' })
    runPipeline() {
        return this.faqService.runPipeline();
    }
}
