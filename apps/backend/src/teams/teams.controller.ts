import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Roles('admin', 'support_manager')
    @Get('organizations')
    @ApiOperation({ summary: 'List all organizations (tenants)' })
    getOrganizations() {
        return this.teamsService.getOrganizations();
    }

    @Roles('admin', 'support_manager')
    @Get('departments')
    @ApiOperation({ summary: 'List all departments' })
    getDepartments(@Query('orgId') orgId?: string) {
        return this.teamsService.getDepartments(orgId);
    }

    @Roles('admin', 'support_manager', 'support_agent')
    @Get()
    @ApiOperation({ summary: 'List all teams' })
    getTeams() {
        return this.teamsService.getTeams();
    }

    @Roles('admin', 'support_manager')
    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    createTeam(@Body() dto: { name: string; departmentId: string; routingLogic?: string }) {
        return this.teamsService.createTeam(dto);
    }

    @Roles('admin', 'support_manager', 'support_agent')
    @Get(':id')
    @ApiOperation({ summary: 'Get team details' })
    getTeam(@Param('id') id: string) {
        return this.teamsService.getTeam(id);
    }

    @Roles('admin', 'support_manager')
    @Post(':id/members')
    @ApiOperation({ summary: 'Add or update team member role' })
    addMember(@Param('id') id: string, @Body() dto: { userId: string; roleInTeam?: string }) {
        return this.teamsService.addMember(id, dto);
    }

    @Roles('admin', 'support_manager')
    @Delete(':id/members/:userId')
    @ApiOperation({ summary: 'Remove team member' })
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.teamsService.removeMember(id, userId);
    }

    @Patch('shifts/presence')
    @ApiOperation({ summary: 'Update agent presence (Shift Status)' })
    updatePresence(@Req() req: any, @Body() dto: { status: 'ONLINE' | 'AWAY' | 'DND' }) {
        return this.teamsService.updateShiftStatus(req.user.id, dto.status);
    }
}
