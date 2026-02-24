import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SystemRole } from '@prisma/client';

@WebSocketGateway({
    cors: { origin: '*', credentials: true },
    namespace: '/ws',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(NotificationsGateway.name);
    private connectedClients = 0;

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });

            client.data.userId = payload.sub;
            client.data.role = payload.role;
            this.connectedClients++;
            this.logger.log(`🔌 Client connected: ${payload.sub} (total: ${this.connectedClients})`);

            // Join role room for targeted notifications
            if (payload.role) {
                await client.join(`role:${payload.role}`);
            }
            await client.join(`user:${payload.sub}`);
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.connectedClients = Math.max(0, this.connectedClients - 1);
        this.logger.log(`❌ Client disconnected (total: ${this.connectedClients})`);
    }

    // Subscribe to a specific ticket room
    @SubscribeMessage('ticket:join')
    async joinTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
        await client.join(`ticket:${ticketId}`);
        return { joined: ticketId };
    }

    @SubscribeMessage('ticket:leave')
    async leaveTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
        await client.leave(`ticket:${ticketId}`);
        return { left: ticketId };
    }

    // Live Chat Presence
    @SubscribeMessage('ticket:typing')
    async announceTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { ticketId: string, isTyping: boolean }) {
        client.to(`ticket:${data.ticketId}`).emit('ticket:typing', {
            userId: client.data.userId,
            isTyping: data.isTyping,
        });
    }

    // ─── EMIT METHODS (called from services) ────────────────

    async emitTicketCreated(ticket: any) {
        // Find users with agent roles
        const potentialAgents = await this.prisma.user.findMany({
            where: {
                role: {
                    in: [
                        SystemRole.ADMIN,
                        SystemRole.DEPARTMENT_MANAGER,
                        SystemRole.TEAM_LEAD,
                        SystemRole.SENIOR_AGENT,
                        SystemRole.AGENT
                    ]
                }
            },
            select: { id: true }
        });
        const userIds = potentialAgents.map(a => a.id);

        if (userIds.length > 0) {
            await this.prisma.notification.createMany({
                data: userIds.map(userId => ({
                    userId,
                    title: 'New Ticket',
                    message: `Ticket #${ticket.ticketNumber} created: ${ticket.subject}`,
                    type: 'TICKET_CREATED',
                    link: `/tickets/${ticket.id}`
                }))
            });
        }

        // Notify all agents/managers via their standard rooms
        this.server.to(`role:${SystemRole.ADMIN}`).to(`role:${SystemRole.DEPARTMENT_MANAGER}`).to(`role:${SystemRole.TEAM_LEAD}`).emit('ticket:created', {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            priority: ticket.priority,
            status: ticket.status,
        });
    }

    async emitTicketUpdated(ticket: any) {
        // If assignedTo is present, notify the assignee
        if (ticket.assignedTo) {
            await this.prisma.notification.create({
                data: {
                    userId: ticket.assignedTo,
                    title: 'Ticket Updated',
                    message: `Ticket #${ticket.ticketNumber} has been updated. Status: ${ticket.status}`,
                    type: 'TICKET_UPDATED',
                    link: `/tickets/${ticket.id}`
                }
            });
        }

        this.server.to(`ticket:${ticket.id}`).emit('ticket:updated', ticket);
        // Also broadcast to dashboard subscribers
        this.server.to(`role:${SystemRole.ADMIN}`).to(`role:${SystemRole.DEPARTMENT_MANAGER}`).emit('ticket:status_changed', {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
        });
    }

    emitTicketEscalated(ticket: any) {
        // High-priority broadcast to managers
        this.server
            .to(`role:${SystemRole.ADMIN}`)
            .to(`role:${SystemRole.DEPARTMENT_MANAGER}`)
            .emit('ticket:escalated', {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                priority: ticket.priority,
                escalationCount: ticket.escalationCount,
            });
    }

    async emitSlaBreached(ticket: any) {
        const managers = await this.prisma.user.findMany({
            where: { role: { in: [SystemRole.ADMIN, SystemRole.DEPARTMENT_MANAGER] } },
            select: { id: true }
        });
        const userIds = new Set(managers.map(a => a.id));
        if (ticket.assignedTo) userIds.add(ticket.assignedTo);

        if (userIds.size > 0) {
            await this.prisma.notification.createMany({
                data: Array.from(userIds).map(userId => ({
                    userId,
                    title: 'SLA Breached',
                    message: `Ticket #${ticket.ticketNumber} has breached SLA.`,
                    type: 'SLA_BREACH',
                    link: `/tickets/${ticket.id}`
                }))
            });
        }

        this.server
            .to(`role:${SystemRole.ADMIN}`)
            .to(`role:${SystemRole.DEPARTMENT_MANAGER}`)
            .to(`user:${ticket.assignedTo}`)
            .emit('ticket:sla_breach', {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                priority: ticket.priority,
                slaResolveDue: ticket.slaResolveDue,
            });
    }

    emitNewMessage(ticketId: string, message: any) {
        this.server.to(`ticket:${ticketId}`).emit('ticket:new_message', {
            ticketId,
            message,
        });
    }

    emitBulkUpdate(ticketIds: string[]) {
        // Notify all agents/managers that multiple tickets changed
        this.server
            .to(`role:${SystemRole.ADMIN}`)
            .to(`role:${SystemRole.DEPARTMENT_MANAGER}`)
            .to(`role:${SystemRole.TEAM_LEAD}`)
            .emit('tickets:bulk_updated', { ticketIds });
    }
}
