import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { OpsDashboardService } from './ops-dashboard.service';

@ApiTags('Operations Dashboard')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('dashboard')
export class OpsDashboardController {
    constructor(private readonly service: OpsDashboardService) { }

    @Get('ops')
    @Roles('ADMIN', 'SUPERUSER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT')
    @ApiOperation({ summary: 'Get real-time operations dashboard aggregates' })
    @ApiQuery({ name: 'days', required: false, type: Number, description: 'Trend window in days, max 30' })
    getOpsDashboard(@Request() req: any, @Query('days') days?: string) {
        return this.service.getOverview({
            requesterRole: req.user?.role,
            days: days ? Number.parseInt(days, 10) : undefined,
        });
    }
}
