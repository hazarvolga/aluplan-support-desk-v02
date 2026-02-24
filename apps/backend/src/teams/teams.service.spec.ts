import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { AssignmentStrategy, SystemRole, AgentStatus } from '@prisma/client';

const mockPrismaService = {
    department: { findMany: jest.fn(), findUnique: jest.fn() },
    team: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    teamMember: { upsert: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    skill: { findMany: jest.fn() },
    agentSkill: { upsert: jest.fn() }
};

describe('TeamsService', () => {
    let service: TeamsService;
    let prisma: PrismaService;

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

    describe('Teams', () => {
        it('should create a team with default MANUAL routing logic', async () => {
            const mockTeam = { id: 'team-1', name: 'Support', slug: 'support', departmentId: 'dept-1', assignmentStrategy: 'MANUAL' };
            mockPrismaService.team.create.mockResolvedValue(mockTeam);

            const result = await service.createTeam({ name: 'Support', slug: 'support', departmentId: 'dept-1' });

            expect(prisma.team.create).toHaveBeenCalledWith({
                data: {
                    name: 'Support',
                    slug: 'support',
                    departmentId: 'dept-1',
                    description: undefined,
                    assignmentStrategy: AssignmentStrategy.MANUAL,
                    autoAssignmentEnabled: false
                }
            });
            expect(result).toEqual(mockTeam);
        });

        it('should throw NotFoundException if team does not exist', async () => {
            mockPrismaService.team.findUnique.mockResolvedValue(null);
            await expect(service.getTeam('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('Team Members', () => {
        it('should add a member to a team via upsert', async () => {
            const mockMember = { userId: 'u1', teamId: 't1', roleOverride: SystemRole.AGENT };
            mockPrismaService.teamMember.upsert.mockResolvedValue(mockMember);

            const result = await service.addMember('t1', { userId: 'u1', roleOverride: SystemRole.AGENT });

            expect(prisma.teamMember.upsert).toHaveBeenCalledWith({
                where: { userId_teamId: { userId: 'u1', teamId: 't1' } },
                create: { teamId: 't1', userId: 'u1', roleOverride: SystemRole.AGENT },
                update: { roleOverride: SystemRole.AGENT }
            });
            expect(result).toEqual(mockMember);
        });
    });

    describe('Agent Status', () => {
        it('should update agent status', async () => {
            mockPrismaService.user.update.mockResolvedValue({ id: 'u1', agentStatus: AgentStatus.AWAY });

            const result = await service.updateAgentStatus('u1', AgentStatus.AWAY);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'u1' },
                data: { agentStatus: AgentStatus.AWAY }
            });
            expect(result.agentStatus).toEqual(AgentStatus.AWAY);
        });
    });
});
