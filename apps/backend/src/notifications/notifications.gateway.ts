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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { PROACTIVE_CHAT_QUEUE } from '../proactive-chat/proactive-chat.constants';
import { AiHealthEventService } from '../ai/ai-health-event.service';
import { AiHealthEventType } from '@aluplan/database';

const resolveAllowedOrigins = (): string[] => {
    const configuredOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
    ];

    return configuredOrigins
        .map(origin => origin.trim())
        .filter(Boolean);
};

@WebSocketGateway({
    cors: {
        origin: (origin: string, callback: (err: Error | null, allowed?: boolean) => void) => {
            // Allow connections without origin (e.g., server-side, mobile apps)
            if (!origin) return callback(null, true);

            const allowedOrigins = resolveAllowedOrigins();
            const allowed = allowedOrigins.includes(origin);
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
        private readonly aiHealthEventService: AiHealthEventService,
        @InjectQueue(PROACTIVE_CHAT_QUEUE) private readonly proactiveChatQueue: Queue,
    ) { }

    private get isProduction(): boolean {
        return this.config.get<string>('NODE_ENV') === 'production';
    }

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
            const rawCookies = client.handshake.headers?.cookie || '';
            const cookieToken = rawCookies
                .split('; ')
                .find(c => c.trim().startsWith('alu_at='))
                ?.substring(7); // skip 'alu_at=' prefix, keeps full token even with =

            const authToken = client.handshake.auth?.token || '';
            const bearerToken = client.handshake.headers?.authorization?.replace('Bearer ', '') || '';

            const token = authToken || cookieToken || bearerToken;

            if (!this.isProduction) {
                this.logger.debug(
                    `[WS-DIAG] handshake received: auth.token=${authToken ? 'present' : 'MISSING'} | cookieToken=${cookieToken ? 'present' : 'MISSING'} | bearer=${bearerToken ? 'present' : 'MISSING'} | rawCookies=${rawCookies ? 'present' : 'MISSING'}`
                );
            }

            if (!token) {
                this.logger.warn(`[WS-DIAG] No token found — disconnecting client. Auth:${!!authToken} Cookie:${!!cookieToken} Bearer:${!!bearerToken} RawCookies:${!!rawCookies}`);
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

            // Proactive chat: cancel pending disconnect-timeout jobs on reconnect
            try {
                const activeSessions = await this.prisma.proactiveChatSession.findMany({
                    where: {
                        status: 'ACTIVE',
                        OR: [{ agentId: payload.sub }, { customerId: payload.sub }],
                    },
                    select: { id: true },
                });

                for (const session of activeSessions) {
                    const jobId = `pcd-${session.id}-${payload.sub}`;
                    const job = await this.proactiveChatQueue.getJob(jobId);
                    if (job) {
                        await job.remove();
                        this.logger.log(`Cancelled disconnect-timeout job ${jobId} on reconnect`);
                    }
                }
            } catch (err) {
                this.logger.error('Failed to cancel proactive chat disconnect timeout on reconnect', err);
            }
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

            // Proactive chat: schedule disconnect-timeout for active sessions
            try {
                const activeSessions = await this.prisma.proactiveChatSession.findMany({
                    where: {
                        status: 'ACTIVE',
                        OR: [{ agentId: userId }, { customerId: userId }],
                    },
                    select: { id: true },
                });

                for (const session of activeSessions) {
                    await this.proactiveChatQueue.add(
                        'disconnect-timeout',
                        { sessionId: session.id, userId },
                        {
                            delay: 60_000,
                            jobId: `pcd-${session.id}-${userId}`,
                            removeOnComplete: true,
                            removeOnFail: false,
                        },
                    );
                }
            } catch (err) {
                this.logger.error('Failed to schedule proactive chat disconnect timeout', err);
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

    // ─── Proactive Chat Handlers ─────────────────────────────────────────────────

    @SubscribeMessage('proactive_chat:join')
    async joinProactiveChatSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() sessionId: string,
    ) {
        const userId = client.data.userId;
        if (!userId) return { error: 'Unauthorized' };

        // Verify user is a participant of this session
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
            select: { agentId: true, customerId: true },
        });

        if (!session) return { error: 'Session not found' };
        if (session.agentId !== userId && session.customerId !== userId) {
            return { error: 'Unauthorized' };
        }

        await client.join(`proactive_chat:${sessionId}`);
        this.logger.log(`👤 User ${userId} joined proactive chat room: ${sessionId}`);
        return { joined: sessionId };
    }

    @SubscribeMessage('proactive_chat:leave')
    async leaveProactiveChatSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() sessionId: string,
    ) {
        await client.leave(`proactive_chat:${sessionId}`);
        return { left: sessionId };
    }

    @SubscribeMessage('proactive_chat:typing')
    async proactiveChatTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { sessionId: string; isTyping: boolean },
    ) {
        // Relay typing event to the other party — do NOT persist
        client.to(`proactive_chat:${data.sessionId}`).emit('proactive_chat:typing', {
            sessionId: data.sessionId,
            userId: client.data.userId,
            isTyping: data.isTyping,
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

        // 1. Record to database
        await this.aiHealthEventService.record({
            eventType: AiHealthEventType.FALLBACK,
            provider: payload.primaryProvider,
            model: payload.fallbackProvider,
            task: payload.task,
            errorMessage: payload.error,
        });

        // 2. Create persistent notifications for admins/agents
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

        // 3. Broadcast to connected admins/agents via WebSocket
        this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('system:ai_fallback', {
            ...payload,
            timestamp: Date.now()
        });
    }

    async emitCrmChanges(payload: { connectionId: string; entityType: 'account' | 'contact'; changeCount: number }) {
        const entityLabel = payload.entityType === 'account' ? 'account' : 'customer';
        const title = payload.entityType === 'account'
            ? 'CRM account bilgisi güncellendi'
            : 'CRM müşteri bilgisi güncellendi';
        const message = `${payload.changeCount} ${entityLabel} alanı Dynamics 365 üzerinden güncellendi.`;

        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    name: { in: ['admin', 'super-admin', 'department-manager'] },
                },
            },
            select: { id: true },
        });

        if (admins.length > 0) {
            await this.prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title,
                    message,
                    type: 'SYSTEM_ALERT',
                    link: '/customers/crm',
                })),
            });
        }

        this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('crm:changes', {
            ...payload,
            title,
            message,
            timestamp: Date.now(),
        });
    }

    async emitCrmSyncError(payload: { connectionId: string; message: string }) {
        const title = 'CRM delta sync hatası';
        const message = `Dynamics 365 değişiklik senkronizasyonu başarısız oldu: ${payload.message}`;

        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    name: { in: ['admin', 'super-admin', 'department-manager'] },
                },
            },
            select: { id: true },
        });

        if (admins.length > 0) {
            await this.prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title,
                    message,
                    type: 'SYSTEM_ALERT',
                    link: '/customers/crm',
                })),
            });
        }

        this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('crm:sync_error', {
            ...payload,
            title,
            message,
            timestamp: Date.now(),
        });
    }

    sendToUser(userId: string, event: string, payload: any) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }
}
