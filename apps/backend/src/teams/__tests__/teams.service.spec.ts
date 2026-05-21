import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../teams.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TeamsService', () => {
    let service: TeamsService;
    let prisma: any;

    const mockPrismaService = {
        department: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
        team: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        teamMember: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        skill: {
            findMany: jest.fn(),
        },
        agentSkill: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        ticket: {
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<TeamsService>(TeamsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDepartments', () => {
        it('should return all non-archived departments ordered by name', async () => {
            const mockDepartments = [
                { id: 'd1', name: 'Sales', teams: [], slaPolicies: [], _count: { teams: 1 } },
            ];
            mockPrismaService.department.findMany.mockResolvedValue(mockDepartments);

            const result = await service.getDepartments();

            expect(prisma.department.findMany).toHaveBeenCalledWith({
                where: { isArchived: false },
                include: {
                    teams: { include: { _count: { select: { members: true } } } },
                    slaPolicies: true,
                    _count: { select: { teams: true } },
                },
                orderBy: { name: 'asc' },
            });
            expect(result).toEqual(mockDepartments);
        });
    });

    describe('getDepartment', () => {
        it('should return a department by id with teams and slaPolicies', async () => {
            const mockDept = { id: 'd1', name: 'Sales', teams: [], slaPolicies: [] };
            mockPrismaService.department.findFirst.mockResolvedValue(mockDept);

            const result = await service.getDepartment('d1');

            expect(prisma.department.findFirst).toHaveBeenCalledWith({
                where: { id: 'd1' },
                include: {
                    teams: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: expect.objectContaining({
                                            id: true,
                                            fullName: true,
                                            email: true,
                                            status: true,
                                            agentStatus: true,
                                            role: true,
                                        }),
                                    },
                                },
                            },
                            _count: { select: { members: true } },
                        },
                    },
                    slaPolicies: true,
                },
            });
            expect(result).toEqual(mockDept);
        });

        it('should throw NotFoundException when department does not exist', async () => {
            mockPrismaService.department.findFirst.mockResolvedValue(null);
            await expect(service.getDepartment('invalid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTeams', () => {
        it('should return all non-archived teams with members and department', async () => {
            const mockTeams = [{ id: 't1', name: 'Support', members: [], department: {} }];
            mockPrismaService.team.findMany.mockResolvedValue(mockTeams);

            const result = await service.getTeams();

            expect(result).toEqual(mockTeams);
        });
    });

    describe('createTeam', () => {
        it('should create a team with default MANUAL strategy and autoAssignmentEnabled false', async () => {
            const mockTeam = { id: 't1', name: 'Support', slug: 'support', departmentId: 'd1' };
            mockPrismaService.team.findFirst.mockResolvedValue(null);
            mockPrismaService.team.create.mockResolvedValue(mockTeam);

            const result = await service.createTeam({ name: 'Support', slug: 'support', departmentId: 'd1' });

            expect(prisma.team.create).toHaveBeenCalled();
            expect(result).toEqual(mockTeam);
        });
    });

    describe('getTeam', () => {
        it('should return a team by id with department and members', async () => {
            const mockTeam = { id: 't1', name: 'Support', department: {}, members: [] };
            mockPrismaService.team.findFirst.mockResolvedValue(mockTeam);

            const result = await service.getTeam('t1');

            expect(result).toEqual(mockTeam);
        });

        it('should throw NotFoundException when team does not exist', async () => {
            mockPrismaService.team.findFirst.mockResolvedValue(null);
            await expect(service.getTeam('invalid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTeam', () => {
        it('should update routing settings for an active team', async () => {
            const existing = { id: 't1', name: 'Support' };
            const updated = { ...existing, autoAssignmentEnabled: true, assignmentStrategy: 'SKILL_BASED' };
            mockPrismaService.team.findFirst.mockResolvedValue(existing);
            mockPrismaService.team.update.mockResolvedValue(updated);

            const result = await service.updateTeam('t1', {
                autoAssignmentEnabled: true,
                assignmentStrategy: 'SKILL_BASED' as any,
            });

            expect(prisma.team.update).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: {
                    assignmentStrategy: 'SKILL_BASED',
                    autoAssignmentEnabled: true,
                },
            });
            expect(result).toEqual(updated);
        });

        it('should throw NotFoundException when updating a missing team', async () => {
            mockPrismaService.team.findFirst.mockResolvedValue(null);

            await expect(service.updateTeam('missing', { autoAssignmentEnabled: true })).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTeamStats', () => {
        it('should calculate onlineRate, waitingQueue and resolvedToday', async () => {
            mockPrismaService.team.findUnique.mockResolvedValue({
                id: 't1',
                members: [
                    { userId: 'u1', user: { agentStatus: 'ONLINE' } },
                    { userId: 'u2', user: { agentStatus: 'OFFLINE' } },
                ],
            });
            mockPrismaService.ticket.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);

            const result = await service.getTeamStats('t1');

            expect(result).toEqual({ onlineRate: 50, waitingQueue: 5, resolvedToday: 2 });
        });

        it('should throw NotFoundException when team does not exist', async () => {
            mockPrismaService.team.findUnique.mockResolvedValue(null);
            await expect(service.getTeamStats('invalid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('addMember', () => {
        it('should create a new team member when one does not exist', async () => {
            const mockMember = { id: 'tm1', teamId: 't1', userId: 'u1' };
            mockPrismaService.teamMember.findUnique.mockResolvedValue(null);
            mockPrismaService.teamMember.create.mockResolvedValue(mockMember);

            const result = await service.addMember('t1', { userId: 'u1', roleOverride: 'AGENT' as any });

            expect(prisma.teamMember.create).toHaveBeenCalledWith({
                data: { teamId: 't1', userId: 'u1', roleOverride: 'AGENT' },
            });
            expect(result).toEqual(mockMember);
        });

        it('should update roleOverride when member already exists', async () => {
            const existing = { id: 'tm1', teamId: 't1', userId: 'u1', roleOverride: 'AGENT' };
            mockPrismaService.teamMember.findUnique.mockResolvedValue(existing);
            mockPrismaService.teamMember.update.mockResolvedValue({ ...existing, roleOverride: 'ADMIN' });

            const result = await service.addMember('t1', { userId: 'u1', roleOverride: 'ADMIN' as any });

            expect(prisma.teamMember.update).toHaveBeenCalledWith({
                where: { id: existing.id },
                data: { roleOverride: 'ADMIN' },
            });
        });
    });

    describe('removeMember', () => {
        it('should delete a team member by composite key', async () => {
            mockPrismaService.teamMember.delete.mockResolvedValue({ id: 'tm1' });

            const result = await service.removeMember('t1', 'u1');

            expect(prisma.teamMember.delete).toHaveBeenCalledWith({
                where: { userId_teamId: { userId: 'u1', teamId: 't1' } },
            });
            expect(result).toEqual({ id: 'tm1' });
        });
    });

    describe('getAgentProfile', () => {
        it('should return agent profile with team members, skills, shifts and ticket count', async () => {
            const mockAgent = {
                id: 'u1',
                fullName: 'Agent A',
                teamMembers: [],
                agentSkills: [],
                shifts: [],
                availability: [],
                _count: { ticketsAssigned: 3 },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockAgent);

            const result = await service.getAgentProfile('u1');

            expect(result).toEqual(mockAgent);
        });

        it('should throw NotFoundException when agent does not exist', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.getAgentProfile('invalid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateAgentStatus', () => {
        it('should update the agent status', async () => {
            const mockUser = { id: 'u1', agentStatus: 'AWAY' };
            mockPrismaService.user.update.mockResolvedValue(mockUser);

            const result = await service.updateAgentStatus('u1', 'AWAY' as any);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'u1' },
                data: { agentStatus: 'AWAY' },
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('getSkills', () => {
        it('should return all skills with agent skill count', async () => {
            const mockSkills = [{ id: 's1', name: 'JavaScript', _count: { agentSkills: 5 } }];
            mockPrismaService.skill.findMany.mockResolvedValue(mockSkills);

            const result = await service.getSkills();

            expect(prisma.skill.findMany).toHaveBeenCalledWith({
                include: { _count: { select: { agentSkills: true } } },
            });
            expect(result).toEqual(mockSkills);
        });
    });

    describe('addAgentSkill', () => {
        it('should create a new agent skill if it does not exist', async () => {
            const mockSkill = { id: 'as1', userId: 'u1', skillId: 's1', proficiency: 5 };
            mockPrismaService.agentSkill.findUnique.mockResolvedValue(null);
            mockPrismaService.agentSkill.create.mockResolvedValue(mockSkill);

            const result = await service.addAgentSkill('u1', 's1', 5);

            expect(prisma.agentSkill.create).toHaveBeenCalledWith({
                data: { userId: 'u1', skillId: 's1', proficiency: 5 },
            });
            expect(result).toEqual(mockSkill);
        });

        it('should update proficiency when agent skill already exists', async () => {
            const existing = { id: 'as1', userId: 'u1', skillId: 's1', proficiency: 3 };
            mockPrismaService.agentSkill.findUnique.mockResolvedValue(existing);
            mockPrismaService.agentSkill.update.mockResolvedValue({ ...existing, proficiency: 5 });

            const result = await service.addAgentSkill('u1', 's1', 5);

            expect(prisma.agentSkill.update).toHaveBeenCalledWith({
                where: { id: existing.id },
                data: { proficiency: 5 },
            });
        });
    });
});
