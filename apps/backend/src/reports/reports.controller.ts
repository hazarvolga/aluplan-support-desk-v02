import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(RbacGuard, ThrottlerGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sla-performance')
    @Roles('admin', 'support_manager')
    @ApiOperation({ summary: 'Get SLA performance statistics for a specific period' })
    @ApiQuery({ name: 'startDate', required: false, type: Date })
    @ApiQuery({ name: 'endDate', required: false, type: Date })
    getSlaPerformance(
        @Query('startDate') startDateString?: string,
        @Query('endDate') endDateString?: string
    ) {
        const startDate = startDateString ? new Date(startDateString) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = endDateString ? new Date(endDateString) : new Date();
        return this.reportsService.getSlaPerformance(startDate, endDate);
    }

    @Get('agent-performance')
    @Roles('admin', 'support_manager')
    @ApiOperation({ summary: 'Get agent resolution performance and CSAT for a specific period' })
    @ApiQuery({ name: 'startDate', required: false, type: Date })
    @ApiQuery({ name: 'endDate', required: false, type: Date })
    getAgentPerformance(
        @Query('startDate') startDateString?: string,
        @Query('endDate') endDateString?: string
    ) {
        const startDate = startDateString ? new Date(startDateString) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = endDateString ? new Date(endDateString) : new Date();
        return this.reportsService.getAgentPerformance(startDate, endDate);
    }
}
