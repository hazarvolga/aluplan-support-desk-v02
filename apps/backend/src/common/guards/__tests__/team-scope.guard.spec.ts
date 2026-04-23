import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TeamScopeGuard } from '../team-scope.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('TeamScopeGuard', () => {
    let guard: TeamScopeGuard;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            teamMember: {
                findUnique: jest.fn(),
            },
        };
        guard = new TeamScopeGuard(prisma as PrismaService);
    });

    const createContext = (user: any, params: any): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({ user, params }),
            }),
        }) as ExecutionContext;

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow ADMIN without checking membership', async () => {
        const context = createContext({ sub: 'admin-1', role: 'ADMIN' }, { id: 'team-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.teamMember.findUnique).not.toHaveBeenCalled();
    });

    it('should allow DEPARTMENT_MANAGER without checking membership', async () => {
        const context = createContext({ sub: 'mgr-1', role: { name: 'DEPARTMENT_MANAGER' } }, { id: 'team-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.teamMember.findUnique).not.toHaveBeenCalled();
    });

    it('should allow team member', async () => {
        prisma.teamMember.findUnique.mockResolvedValue({ userId: 'user-1', teamId: 'team-1' });
        const context = createContext({ sub: 'user-1', role: 'AGENT' }, { id: 'team-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.teamMember.findUnique).toHaveBeenCalledWith({
            where: { userId_teamId: { userId: 'user-1', teamId: 'team-1' } },
        });
    });

    it('should throw ForbiddenException if user is not a team member', async () => {
        prisma.teamMember.findUnique.mockResolvedValue(null);
        const context = createContext({ sub: 'user-1', role: 'AGENT' }, { id: 'team-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no user context', async () => {
        const context = createContext(null, { id: 'team-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no team id in params', async () => {
        const context = createContext({ sub: 'user-1', role: 'AGENT' }, {});
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should use user.id fallback when sub is missing', async () => {
        prisma.teamMember.findUnique.mockResolvedValue({ userId: 'user-1', teamId: 'team-1' });
        const context = createContext({ id: 'user-1', role: 'AGENT' }, { id: 'team-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.teamMember.findUnique).toHaveBeenCalledWith({
            where: { userId_teamId: { userId: 'user-1', teamId: 'team-1' } },
        });
    });
});
