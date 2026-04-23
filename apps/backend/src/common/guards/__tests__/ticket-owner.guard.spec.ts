import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketOwnerGuard } from '../ticket-owner.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('TicketOwnerGuard', () => {
    let guard: TicketOwnerGuard;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            ticket: {
                findUnique: jest.fn(),
            },
        };
        guard = new TicketOwnerGuard(prisma as PrismaService);
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

    it('should allow ADMIN without checking ticket ownership', async () => {
        const context = createContext({ sub: 'admin-1', role: 'ADMIN' }, { id: 'ticket-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.ticket.findUnique).not.toHaveBeenCalled();
    });

    it('should allow DEPARTMENT_MANAGER without checking ticket ownership', async () => {
        const context = createContext({ sub: 'mgr-1', role: { name: 'DEPARTMENT_MANAGER' } }, { id: 'ticket-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(prisma.ticket.findUnique).not.toHaveBeenCalled();
    });

    it('should allow ticket creator', async () => {
        prisma.ticket.findUnique.mockResolvedValue({ userId: 'user-1', assignedTo: null });
        const context = createContext({ sub: 'user-1', role: 'CUSTOMER' }, { id: 'ticket-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should allow ticket assignee', async () => {
        prisma.ticket.findUnique.mockResolvedValue({ userId: 'user-2', assignedTo: 'agent-1' });
        const context = createContext({ sub: 'agent-1', role: 'AGENT' }, { id: 'ticket-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
        prisma.ticket.findUnique.mockResolvedValue(null);
        const context = createContext({ sub: 'user-1', role: 'AGENT' }, { id: 'ticket-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is neither owner nor assignee', async () => {
        prisma.ticket.findUnique.mockResolvedValue({ userId: 'user-2', assignedTo: 'agent-2' });
        const context = createContext({ sub: 'user-3', role: 'AGENT' }, { id: 'ticket-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no user context', async () => {
        const context = createContext(null, { id: 'ticket-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no ticket id in params', async () => {
        const context = createContext({ sub: 'user-1', role: 'AGENT' }, {});
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should work with user.id fallback when sub is missing', async () => {
        prisma.ticket.findUnique.mockResolvedValue({ userId: 'user-1', assignedTo: null });
        const context = createContext({ id: 'user-1', role: 'CUSTOMER' }, { id: 'ticket-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
