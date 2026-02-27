import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AnnouncementTemplatesService } from './announcement-templates.service';
import { CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto } from './dto/announcement-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('announcement-templates')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('admin')
export class AnnouncementTemplatesController {
    constructor(private readonly service: AnnouncementTemplatesService) { }

    @Post()
    create(@Body() dto: CreateAnnouncementTemplateDto, @Request() req: any) {
        return this.service.create(dto, req.user.id);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAnnouncementTemplateDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
