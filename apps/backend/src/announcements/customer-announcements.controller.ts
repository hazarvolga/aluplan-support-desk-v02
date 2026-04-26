import { Controller, Get, Patch, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

/**
 * Customer-facing announcement endpoints.
 * Intentionally separate from AnnouncementsController (which has class-level @Roles('ADMIN')).
 * Only JwtAuthGuard is applied — no RBAC admin role required.
 */
@ApiTags('Announcements (Customer)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class CustomerAnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) {}

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
}
