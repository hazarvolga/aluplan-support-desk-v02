import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TargetCriteriaDto } from './dto/announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('admin')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    @Post()
    create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Request() req: any) {
        return this.announcementsService.create(createAnnouncementDto, req.user.id);
    }

    @Get('filters')
    getFilters() {
        return this.announcementsService.getFilterOptions();
    }

    @Get()
    findAll() {
        return this.announcementsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.announcementsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
        return this.announcementsService.update(id, updateAnnouncementDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.announcementsService.delete(id);
    }

    @Post('target-count')
    getTargetCount(@Body() criteria: TargetCriteriaDto) {
        return this.announcementsService.getTargetCount(criteria);
    }

    @Post(':id/broadcast')
    broadcast(@Param('id') id: string) {
        return this.announcementsService.broadcast(id);
    }
}
