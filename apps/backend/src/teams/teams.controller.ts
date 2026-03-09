import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { AssignmentStrategy, SystemRole, AgentStatus } from '@aluplan/database';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    // DEPARTMENTS
    @Roles('ADMIN', 'DEPARTMENT_MANAGER')
    @Get('departments')
    @ApiOperation({ summary: 'List all departments' })
    getDepartments() {
        return this.teamsService.getDepartments();
    }

    @Roles('ADMIN', 'DEPARTMENT_MANAGER')
    @Get('departments/:id')
    @ApiOperation({ summary: 'Get department details' })
    getDepartment(@Param('id') id: string) {
        return this.teamsService.getDepartment(id);
    }

    // TEAMS
    @Roles('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'AGENT')
    @Get()
    @ApiOperation({ summary: 'List all teams' })
    getTeams() {
        return this.teamsService.getTeams();
    }

    @Roles('ADMIN', 'DEPARTMENT_MANAGER')
    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    createTeam(@Body() dto: {
        name: string;
        slug: string;
        departmentId: string;
        description?: string;
        assignmentStrategy?: AssignmentStrategy;
        autoAssignmentEnabled?: boolean;
    }) {
        return this.teamsService.createTeam(dto);
    }

    @Roles('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'AGENT')
    @Get(':id')
    @ApiOperation({ summary: 'Get team details' })
    getTeam(@Param('id') id: string) {
        return this.teamsService.getTeam(id);
    }

    // MEMBERS & AGENTS
    @Roles('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD')
    @Post(':id/members')
    @ApiOperation({ summary: 'Add or update team member role' })
    addMember(@Param('id') id: string, @Body() dto: { userId: string; roleOverride?: SystemRole }) {
        return this.teamsService.addMember(id, dto);
    }

    @Roles('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD')
    @Delete(':id/members/:userId')
    @ApiOperation({ summary: 'Remove team member' })
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.teamsService.removeMember(id, userId);
    }

    @Roles('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'AGENT')
    @Get('agents/:id')
    @ApiOperation({ summary: 'Get agent profile' })
    getAgentProfile(@Param('id') id: string) {
        return this.teamsService.getAgentProfile(id);
    }

    @Patch('agents/me/status')
    @ApiOperation({ summary: 'Update my agent status' })
    updateMyStatus(@Req() req: any, @Body() dto: { status: AgentStatus }) {
        return this.teamsService.updateAgentStatus(req.user.id, dto.status);
    }

    @Patch('agents/me/profile')
    @ApiOperation({ summary: 'Update my agent profile' })
    updateMyProfile(@Req() req: any, @Body() dto: { title?: string; bio?: string; timezone?: string; language?: string }) {
        return this.teamsService.updateAgentProfile(req.user.id, dto);
    }

    // SKILLS
    @Get('skills')
    @ApiOperation({ summary: 'List all skills' })
    getSkills() {
        return this.teamsService.getSkills();
    }
}
