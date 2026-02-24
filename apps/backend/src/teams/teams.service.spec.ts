import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    organization: { findMany: jest.fn() },
    department: { findMany: jest.fn() },
    team: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    teamMember: { upsert: jest.fn(), delete: jest.fn() },
    shift: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
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
            const mockTeam = { id: 'team-1', name: 'Support', departmentId: 'dept-1', routingLogic: 'MANUAL' };
            mockPrismaService.team.create.mockResolvedValue(mockTeam);

            const result = await service.createTeam({ name: 'Support', departmentId: 'dept-1' });

            expect(prisma.team.create).toHaveBeenCalledWith({
                data: { name: 'Support', departmentId: 'dept-1', routingLogic: 'MANUAL' }
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
            const mockMember = { userId: 'u1', teamId: 't1', roleInTeam: 'Lead' };
            mockPrismaService.teamMember.upsert.mockResolvedValue(mockMember);

            const result = await service.addMember('t1', { userId: 'u1', roleInTeam: 'Lead' });

            expect(prisma.teamMember.upsert).toHaveBeenCalledWith({
                where: { userId_teamId: { userId: 'u1', teamId: 't1' } },
                create: { teamId: 't1', userId: 'u1', roleInTeam: 'Lead' },
                update: { roleInTeam: 'Lead' }
            });
            expect(result).toEqual(mockMember);
        });
    });

    describe('Agent Shifts', () => {
        it('should create a shift if none exists for the agent', async () => {
            mockPrismaService.shift.findFirst.mockResolvedValue(null);
            mockPrismaService.shift.create.mockResolvedValue({ id: 's1', userId: 'u1', status: 'AWAY' });

            const result = await service.updateShiftStatus('u1', 'AWAY');

            expect(prisma.shift.create).toHaveBeenCalledWith({ data: { userId: 'u1', status: 'AWAY' } });
            expect(result.status).toEqual('AWAY');
        });

        it('should update existing shift if found', async () => {
            mockPrismaService.shift.findFirst.mockResolvedValue({ id: 's1', userId: 'u1', status: 'ONLINE' });
            mockPrismaService.shift.update.mockResolvedValue({ id: 's1', userId: 'u1', status: 'DND' });

            const result = await service.updateShiftStatus('u1', 'DND');

            expect(prisma.shift.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { status: 'DND' } });
            expect(result.status).toEqual('DND');
        });
    });
});
