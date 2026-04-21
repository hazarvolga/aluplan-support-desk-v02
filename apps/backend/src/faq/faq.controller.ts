import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions, Roles } from '../rbac/decorators/rbac.decorators';

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
        const isStaff = req.user?.role?.toUpperCase() !== 'CUSTOMER';
        return this.faqService.getPublished(language, 50, isStaff);
    }

    // ─── ADMIN: CRUD + Review ─────────────────────────────────
    @Get()
    @RequirePermissions('faq:read')
    @ApiOperation({ summary: 'List all FAQs with pagination' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() q: any): Promise<any> {
        return this.faqService.findAll({
            status: q.status,
            page: q.page ? parseInt(q.page) : 1,
            limit: q.limit ? parseInt(q.limit) : 20,
        });
    }

    @Get(':id')
    @RequirePermissions('faq:read')
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
