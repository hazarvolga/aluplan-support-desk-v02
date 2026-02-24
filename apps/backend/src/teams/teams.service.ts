import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
    constructor(private readonly prisma: PrismaService) { }

    // ORG & DEPT
    async getOrganizations() {
        return this.prisma.organization.findMany({
            include: { departments: true }
        });
    }

    async getDepartments(orgId?: string) {
        return this.prisma.department.findMany({
            where: orgId ? { orgId } : undefined,
            include: { organization: true, teams: true }
        });
    }

    // TEAMS
    async getTeams() {
        return this.prisma.team.findMany({
            include: {
                department: { include: { organization: true } },
                members: { include: { user: true } }
            }
        });
    }

    async createTeam(data: { name: string; departmentId: string; routingLogic?: any }) {
        return this.prisma.team.create({
            data: {
                name: data.name,
                departmentId: data.departmentId,
                routingLogic: data.routingLogic || 'MANUAL'
            }
        });
    }

    async getTeam(id: string) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                department: true,
                members: { include: { user: true } }
            }
        });
        if (!team) throw new NotFoundException('Team not found');
        return team;
    }

    // MEMBERS
    async addMember(teamId: string, data: { userId: string; roleInTeam?: string }) {
        return this.prisma.teamMember.upsert({
            where: {
                userId_teamId: { userId: data.userId, teamId }
            },
            create: {
                teamId,
                userId: data.userId,
                roleInTeam: data.roleInTeam || 'Agent'
            },
            update: {
                roleInTeam: data.roleInTeam
            }
        });
    }

    async removeMember(teamId: string, userId: string) {
        return this.prisma.teamMember.delete({
            where: { userId_teamId: { userId, teamId } }
        });
    }

    // AGENT SHIFTS & SKILLS

    async updateShiftStatus(userId: string, status: 'ONLINE' | 'AWAY' | 'DND') {
        const shift = await this.prisma.shift.findFirst({ where: { userId } });
        if (shift) {
            return this.prisma.shift.update({
                where: { id: shift.id },
                data: { status }
            });
        }
        return this.prisma.shift.create({
            data: { userId, status }
        });
    }
}
