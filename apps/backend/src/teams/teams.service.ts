import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
        const dept = await this.prisma.department.findFirst({
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
                                agentStatus: true,
                                _count: {
                                    select: {
                                        ticketsAssigned: {
                                            where: { status: { notIn: ['RESOLVED', 'CLOSED'] } }
                                        }
                                    }
                                }
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
        // Ensure slug uniqueness — append suffix if taken
        let slug = data.slug;
        const existing = await this.prisma.team.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        return this.prisma.team.create({
            data: {
                name: data.name,
                slug,
                departmentId: data.departmentId,
                description: data.description,
                assignmentStrategy: data.assignmentStrategy || AssignmentStrategy.MANUAL,
                autoAssignmentEnabled: data.autoAssignmentEnabled || false
            }
        });
    }

    async getTeam(id: string) {
        const team = await this.prisma.team.findFirst({
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
                                title: true,
                                _count: {
                                    select: {
                                        ticketsAssigned: {
                                            where: { status: { notIn: ['RESOLVED', 'CLOSED'] } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!team) throw new NotFoundException('Team not found');
        return team;
    }

    async getTeamStats(id: string) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                members: {
                    select: { userId: true, user: { select: { agentStatus: true } } }
                }
            }
        });

        if (!team) throw new NotFoundException('Team not found');

        const memberIds = team.members.map(m => m.userId);
        const totalMembers = team.members.length;
        const onlineMembers = team.members.filter(m => m.user.agentStatus === 'ONLINE').length;

        const onlineRate = totalMembers > 0 ? Math.round((onlineMembers / totalMembers) * 100) : 0;

        const waitingQueue = await this.prisma.ticket.count({
            where: {
                assignedTo: { in: memberIds },
                status: { notIn: ['RESOLVED', 'CLOSED'] }
            }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const resolvedToday = await this.prisma.ticket.count({
            where: {
                assignedTo: { in: memberIds },
                status: 'RESOLVED',
                resolvedAt: { gte: today }
            }
        });

        return {
            onlineRate,
            waitingQueue,
            resolvedToday
        };
    }

    // MEMBERS & AGENTS
    async addMember(teamId: string, data: { userId: string; roleOverride?: SystemRole }) {
        const existing = await this.prisma.teamMember.findUnique({
            where: { userId_teamId: { userId: data.userId, teamId } }
        });
        if (existing) {
            return this.prisma.teamMember.update({
                where: { id: existing.id },
                data: { roleOverride: data.roleOverride }
            });
        }
        return this.prisma.teamMember.create({
            data: {
                teamId,
                userId: data.userId,
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
        const existing = await this.prisma.agentSkill.findUnique({
            where: { userId_skillId: { userId, skillId } }
        });
        if (existing) {
            return this.prisma.agentSkill.update({
                where: { id: existing.id },
                data: { proficiency }
            });
        }
        return this.prisma.agentSkill.create({
            data: { userId, skillId, proficiency }
        });
    }
}
