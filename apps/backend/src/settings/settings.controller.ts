import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { BulkUpsertSettingDto } from './dto/bulk-upsert-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('settings')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post()
    @Roles('ADMIN', 'SUPERUSER')
    upsert(@Body() dto: UpsertSettingDto, @Request() req: any) {
        return this.settingsService.upsert(dto, req.user.id);
    }

    @Post('bulk')
    @Roles('ADMIN', 'SUPERUSER')
    bulkUpsert(@Body() dto: BulkUpsertSettingDto, @Request() req: any) {
        return this.settingsService.bulkUpsert(dto, req.user.id);
    }

    @Get()
    @Roles('ADMIN', 'SUPERUSER')
    findAll(@Query('decrypt') decrypt?: string) {
        return this.settingsService.getAll(decrypt === 'true');
    }

    @Get(':key')
    @Roles('ADMIN', 'SUPERUSER')
    findOne(@Param('key') key: string, @Query('decrypt') decrypt?: string) {
        return this.settingsService.get(key, decrypt === 'true');
    }

    @Delete(':key')
    @Roles('ADMIN', 'SUPERUSER')
    remove(@Param('key') key: string) {
        return this.settingsService.delete(key);
    }
}
