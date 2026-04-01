import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DatabaseBackupService } from '../common/services/database-backup.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly backup: DatabaseBackupService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Health check' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'aluplan-support-desk-api',
            version: '1.0.0',
        };
    }

    @Post('backup')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Trigger manual database backup (Admin only)' })
    async triggerManualBackup() {
        return this.backup.runBackup();
    }
}
