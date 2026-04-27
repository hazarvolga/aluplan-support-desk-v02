import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TargetCriteriaDto } from './dto/announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    // --- Admin Endpoints ---

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new announcement' })
    create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Request() req: any) {
        return this.announcementsService.create(createAnnouncementDto, req.user.id);
    }

    @Get('filters')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get filter options for targeting' })
    getFilters() {
        return this.announcementsService.getFilterOptions();
    }

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'List all announcements' })
    findAll() {
        return this.announcementsService.findAll();
    }

    @Get('admin/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Find a specific announcement (Admin)' })
    findOne(@Param('id') id: string) {
        return this.announcementsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update an existing announcement' })
    update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
        return this.announcementsService.update(id, updateAnnouncementDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete an announcement' })
    remove(@Param('id') id: string) {
        return this.announcementsService.delete(id);
    }

    @Post('target-count')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get count of targeted customers' })
    getTargetCount(@Body() criteria: TargetCriteriaDto) {
        return this.announcementsService.getTargetCount(criteria);
    }

    @Post(':id/broadcast')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Broadcast an announcement to targeted customers' })
    broadcast(@Param('id') id: string) {
        return this.announcementsService.broadcast(id);
    }

    // --- Customer Endpoints ---

    @Get('my')
    @ApiOperation({ summary: 'Get announcements sent to the authenticated customer' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getMyAnnouncements(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.announcementsService.getMyAnnouncements(
            req.user.id,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get('my/unread-count')
    @ApiOperation({ summary: 'Get unread announcement count for the authenticated customer' })
    getMyUnreadCount(@Request() req: any) {
        return this.announcementsService.getMyUnreadCount(req.user.id);
    }

    @Patch('logs/:logId/read')
    @ApiOperation({ summary: 'Mark an announcement log as read' })
    @ApiParam({ name: 'logId', description: 'AnnouncementLog UUID' })
    markLogRead(@Param('logId') logId: string, @Request() req: any) {
        return this.announcementsService.markLogRead(logId, req.user.id);
    }

    // --- Special Admin Override for fetching any log (if needed) ---
    @Get(':id')
    @Roles('ADMIN')
    getById(@Param('id') id: string) {
        return this.announcementsService.findOne(id);
    }
}
