import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentStrategy, SystemRole, AgentStatus } from '@aluplan/database';

@Injectable()
export class TeamsService {
    constructor(private readonly prisma: PrismaService) { }

    // DEPARTMENTS
    async getDepartments() {
        return this.prisma.department.findMany({
            where: { isArchived: false },
            include: {
                teams: {
                    include: {
                        _count: { select: { members: true } }
                    }
                },
                slaPolicies: true,
                _count: { select: { teams: true } }
            },
            orderBy: { name: 'asc' }
        });
    }

    async getDepartment(id: string) {
        const dept = await this.prisma.department.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        _count: { select: { members: true } }
                    }
                },
                slaPolicies: true
            }
        });
        if (!dept) throw new NotFoundException('Department not found');
        return dept;
    }

    // TEAMS
    async getTeams() {
        return this.prisma.team.findMany({
            where: { isArchived: false },
            include: {
                department: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                avatarUrl: true,
                                role: true,
                                agentStatus: true
                            }
                        }
                    }
                },
                _count: { select: { members: true } }
            }
        });
    }

    async createTeam(data: {
        name: string;
        slug: string;
        departmentId: string;
        description?: string;
        assignmentStrategy?: AssignmentStrategy;
        autoAssignmentEnabled?: boolean;
    }) {
        return this.prisma.team.create({
            data: {
                name: data.name,
                slug: data.slug,
                departmentId: data.departmentId,
                description: data.description,
                assignmentStrategy: data.assignmentStrategy || AssignmentStrategy.MANUAL,
                autoAssignmentEnabled: data.autoAssignmentEnabled || false
            }
        });
    }

    async getTeam(id: string) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                department: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                avatarUrl: true,
                                role: true,
                                agentStatus: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });
        if (!team) throw new NotFoundException('Team not found');
        return team;
    }

    // MEMBERS & AGENTS
    async addMember(teamId: string, data: { userId: string; roleOverride?: SystemRole }) {
        return this.prisma.teamMember.upsert({
            where: {
                userId_teamId: { userId: data.userId, teamId }
            },
            create: {
                teamId,
                userId: data.userId,
                roleOverride: data.roleOverride
            },
            update: {
                roleOverride: data.roleOverride
            }
        });
    }

    async removeMember(teamId: string, userId: string) {
        return this.prisma.teamMember.delete({
            where: { userId_teamId: { userId, teamId } }
        });
    }

    async getAgentProfile(userId: string) {
        const agent = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                teamMembers: {
                    include: {
                        team: {
                            include: { department: true }
                        }
                    }
                },
                agentSkills: {
                    include: { skill: true }
                },
                shifts: true,
                availability: true,
                _count: {
                    select: {
                        ticketsAssigned: { where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }
                    }
                }
            }
        });
        if (!agent) throw new NotFoundException('Agent not found');
        return agent;
    }

    async updateAgentStatus(userId: string, status: AgentStatus) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { agentStatus: status }
        });
    }

    async updateAgentProfile(userId: string, data: { title?: string; bio?: string; timezone?: string; language?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data
        });
    }

    // SKILLS
    async getSkills() {
        return this.prisma.skill.findMany({
            include: {
                _count: { select: { agentSkills: true } }
            }
        });
    }

    async addAgentSkill(userId: string, skillId: string, proficiency: number) {
        return this.prisma.agentSkill.upsert({
            where: { userId_skillId: { userId, skillId } },
            create: { userId, skillId, proficiency },
            update: { proficiency }
        });
    }
}
