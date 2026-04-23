import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

@WebSocketGateway({
    cors: {
        origin: (origin: string, callback: (err: Error | null, allowed?: boolean) => void) => {
            // Allow connections without origin (e.g., server-side, mobile apps)
            if (!origin) return callback(null, true);
            // In production, restrict to configured frontend URL
            const allowed = process.env.FRONTEND_URL
                ? origin === process.env.FRONTEND_URL
                : true;
            callback(null, allowed);
        },
        credentials: true,
    },
    namespace: '/ws',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(NotificationsGateway.name);
    private connectedClients = 0;

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly emailService: EmailService,
    ) { }

    // GAP-09: Socket.io Redis Adapter for horizontal scaling
    afterInit(server: Server) {
        try {
            const redisUrl = this.config.get<string>('redis.url') || this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
            const pubClient = new Redis(redisUrl);
            const subClient = pubClient.duplicate();
            server.adapter(createAdapter(pubClient, subClient));
            this.logger.log('✅ Socket.io Redis Adapter connected — multi-instance WS broadcasting ready');
        } catch (err) {
            this.logger.warn('⚠️ Socket.io Redis Adapter failed — falling back to in-memory adapter', err);
        }
    }

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
            this.logger.log(`🔌 Client connected: ${payload.sub} | Role: ${payload.role} (total: ${this.connectedClients})`);

            // Join role room for targeted notifications (lowercase for consistency)
            if (payload.role) {
                await client.join(`role:${payload.role.toLowerCase()}`);

                // Track active users in role-specific Redis Sets for ultra-fast targeting (GAP-PERF-002)
                if (payload.role) {
                    const redis = this.redisService.getClient();
                    const roleKey = `ws:active:role:${payload.role.toLowerCase()}`;
                    await redis.sadd(roleKey, payload.sub);
                    await redis.expire(roleKey, 86400); // 24h safety
                }
            }
            await client.join(`user:${payload.sub}`);
        } catch {
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        this.connectedClients = Math.max(0, this.connectedClients - 1);
        const userId = client.data.userId;

        if (userId) {
            const redis = this.redisService.getClient();
            const userTicketsKey = `presence:user:${userId}:tickets`;
            const ticketIds = await redis.smembers(userTicketsKey);

            for (const ticketId of ticketIds) {
                await redis.srem(`presence:ticket:${ticketId}`, userId);
                await this.updatePresence(ticketId);
            }
            await redis.del(userTicketsKey);

            if (client.data.role) {
                const roleKey = `ws:active:role:${client.data.role.toLowerCase()}`;
                await redis.srem(roleKey, userId);
            }
        }

        this.logger.log(`❌ Client disconnected: ${userId} (total: ${this.connectedClients})`);
    }

    private async updatePresence(ticketId: string) {
        const redis = this.redisService.getClient();
        const userIds = await redis.smembers(`presence:ticket:${ticketId}`);
        this.server.to(`ticket:${ticketId}`).emit('ticket:presence', {
            ticketId,
            userIds,
        });
    }

    // Subscribe to a specific ticket room
    @SubscribeMessage('ticket:join')
    async joinTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
        // Authorization check: User must be an agent or the creator of the ticket
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true }
        });

        if (!ticket) return { error: 'Ticket not found' };

        const isCreator = ticket.userId === client.data.userId;
        const isAgent = client.data.role && client.data.role.toUpperCase() !== 'CUSTOMER';

        if (!isCreator && !isAgent) {
            return { error: 'Unauthorized' };
        }

        await client.join(`ticket:${ticketId}`);

        // Presence Logic
        const userId = client.data.userId;
        const redis = this.redisService.getClient();
        await redis.sadd(`presence:ticket:${ticketId}`, userId);
        await redis.sadd(`presence:user:${userId}:tickets`, ticketId);
        await redis.expire(`presence:ticket:${ticketId}`, 3600); // 1h safety
        await this.updatePresence(ticketId);

        this.logger.log(`👤 User ${userId} joined ticket room: ${ticketId}`);
        return { joined: ticketId };
    }

    @SubscribeMessage('ticket:leave')
    async leaveTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
        await client.leave(`ticket:${ticketId}`);

        // Presence Logic
        const userId = client.data.userId;
        const redis = this.redisService.getClient();
        await redis.srem(`presence:ticket:${ticketId}`, userId);
        await redis.srem(`presence:user:${userId}:tickets`, ticketId);
        await this.updatePresence(ticketId);

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

    @SubscribeMessage('ticket:message_read')
    async markAsRead(@ConnectedSocket() client: Socket, @MessageBody() data: { ticketId: string, messageId: string }) {
        // Smart Buffer: If message is read via chat, cancel the pending email notification
        const jobId = `msg-ntf-${data.messageId}`;
        await this.emailService.cancelEmail(jobId);

        // Broadcast that a message was read
        client.to(`ticket:${data.ticketId}`).emit('ticket:message_read', {
            messageId: data.messageId,
            readerId: client.data.userId,
        });
    }

    @OnEvent('ticket.created', { async: true })
    async emitTicketCreated(ticket: any) {
        this.logger.log(`📢 Broadcasting ticket:created event to admins/agents for Ticket #${ticket.ticketNumber} (ID: ${ticket.id})`);
        const payload = {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            priority: ticket.priority,
            status: ticket.status,
            creatorName: ticket.creator?.fullName || 'Müşteri',
            productName: ticket.product?.name,
        };

        // Broadcast to relevant roles (Admin, Managers, Team Leads, Agents)
        this.server.to('role:admin').to('role:super-admin').to('role:department-manager').to('role:team-lead').to('role:agent').emit('ticket:created', payload);
        this.logger.log(`✔️ Broadcast completed for ${ticket.ticketNumber}. Payload: ${JSON.stringify(payload)}`);
        // Background: Create persistent notifications (optimized via granular Redis role sets)
        try {
            const redis = this.redisService.getClient();
            const relevantRoles = ['admin', 'super-admin', 'department-manager', 'team-lead', 'agent'];

            // Fetch all active agents across relevant roles
            const setsToFetch = relevantRoles.map(r => `ws:active:role:${r}`);
            const activeAgentIds = await redis.sunion(...setsToFetch);

            if (activeAgentIds.length > 0) {
                await this.prisma.notification.createMany({
                    data: activeAgentIds.map(userId => ({
                        userId,
                        title: 'New Ticket',
                        message: `Ticket #${ticket.ticketNumber} created: ${ticket.subject}`,
                        type: 'TICKET_CREATED',
                        link: `/tickets/${ticket.id}`
                    })),
                    skipDuplicates: true // Defensive check for overlapping roles
                });
            }
        } catch (e) {
            this.logger.error('Failed to create persistent notifications via Redis cached agent sets', e);
        }
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
        this.server.to('role:admin').to('role:department-manager').emit('ticket:status_changed', {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
        });
    }

    emitTicketEscalated(ticket: any) {
        // High-priority broadcast to managers
        this.server
            .to('role:admin')
            .to('role:department-manager')
            .emit('ticket:escalated', {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                priority: ticket.priority,
                escalationCount: ticket.escalationCount,
            });
    }

    async emitSlaBreached(ticket: any) {
        const managers = await this.prisma.user.findMany({
            where: {
                role: {
                    name: { in: ['admin', 'super-admin', 'department-manager'] }
                }
            },
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
            .to('role:admin')
            .to('role:department-manager')
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

    @OnEvent('attachment.created', { async: true })
    emitAttachmentAdded(payload: { ticketId: string, messageId: string, attachment: any }) {
        this.server.to(`ticket:${payload.ticketId}`).emit('ticket:attachment_added', payload);
    }

    emitBulkUpdate(ticketIds: string[]) {
        this.server
            .to('role:admin')
            .to('role:department-manager')
            .to('role:team-lead')
            .emit('tickets:bulk_updated', { ticketIds });
    }

    @OnEvent('system.ai_fallback', { async: true })
    async handleAiFallback(payload: { primaryProvider: string, fallbackProvider: string, task: string, error: string }) {
        this.logger.warn(`⚠️ AI Fallback Triggered: ${payload.primaryProvider} -> ${payload.fallbackProvider} (Task: ${payload.task}). Error: ${payload.error}`);

        // 1. Create persistent notifications for admins/agents
        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    name: { in: ['admin', 'super-admin', 'department-manager'] }
                }
            },
            select: { id: true }
        });

        const userIds = admins.map(a => a.id);
        if (userIds.length > 0) {
            await this.prisma.notification.createMany({
                data: userIds.map(userId => ({
                    userId,
                    title: 'AI Auto-Fallback Triggered',
                    message: `Primary AI (${payload.primaryProvider}) failed. Switched to ${payload.fallbackProvider} for task: ${payload.task}. Error: ${payload.error}`,
                    type: 'SYSTEM_ALERT',
                    link: '/admin/settings?tab=ai'
                }))
            });
        }

        // 2. Broadcast to connected admins/agents via WebSocket
        this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('system:ai_fallback', {
            ...payload,
            timestamp: Date.now()
        });
    }

    sendToUser(userId: string, event: string, payload: any) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }
}
