import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutoAssignmentService {
    private readonly logger = new Logger(AutoAssignmentService.name);

    constructor(private readonly prisma: PrismaService) { }

    @OnEvent('ticket.created', { async: true })
    async handleTicketCreated(ticket: Ticket) {
        if (ticket.assignedTo) return;

        // Briefly wait to ensure rule engine didn't already override assignment synchronously
        await new Promise(resolve => setTimeout(resolve, 1500));

        const currentTicket = await this.prisma.ticket.findUnique({ where: { id: ticket.id } });
        if (!currentTicket || currentTicket.assignedTo) return;

        try {
            // Find all active agent users — exclude users with 'customer' role
            const agents = await this.prisma.user.findMany({
                where: {
                    role: {
                        name: { not: 'customer' }
                    },
                    status: 'ACTIVE'
                },
                select: { id: true }
            });

            if (agents.length === 0) {
                this.logger.warn(`⚠️ No agents available to auto-assign ticket ${ticket.ticketNumber}`);
                return;
            }

            const agentIds = agents.map((a: any) => a.id);

            // Compute current active workload for these agents
            const workload = await this.prisma.ticket.groupBy({
                by: ['assignedTo'],
                where: {
                    assignedTo: { in: agentIds },
                    status: { in: ['NEW', 'OPEN', 'IN_PROGRESS'] }
                },
                _count: { id: true }
            });

            let selectedAgentId = agentIds[Math.floor(Math.random() * agentIds.length)]; // backup random
            let minLoad = Infinity;

            for (const agentId of agentIds) {
                const load = (workload as any[]).find((w: any) => w.assignedTo === agentId)?._count.id || 0;
                if (load < minLoad) {
                    minLoad = load;
                    selectedAgentId = agentId;
                }
            }

            await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: { assignedTo: selectedAgentId }
            });

            this.logger.log(`🤖 Auto-assigned ticket ${ticket.ticketNumber} to agent ${selectedAgentId} (current load: ${minLoad})`);

        } catch (error: any) {
            this.logger.error(`❌ Auto-assignment failed for ticket ${ticket.id}`, error.stack);
        }
    }
}
