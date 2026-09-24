import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
import { TicketAccessService } from '../common/services/ticket-access.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

type SocketSession = JwtPayload & { exp: number };
type AiFallbackPayload = { primaryProvider: string; fallbackProvider: string; task: string; error: string };
type SessionClient = { id: string; data: Record<string, unknown>; disconnect(close?: boolean): unknown };

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
    private readonly connectionReady = new Map<string, Promise<void>>();

    private async isSessionValid(payload: SocketSession | undefined): Promise<boolean> {
        if (!payload || typeof payload.sub !== 'string' || !payload.sub
            || typeof payload.role !== 'string' || !payload.role.trim()
            || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) return false;

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { status: true, deletedAt: true, sessionVersion: true, role: { select: { name: true } } },
        });
        if (!user || user.status !== 'ACTIVE' || user.deletedAt
            || user.sessionVersion !== (payload.sessionVersion ?? 0)) return false;
        if (!user.role?.name || this.normalizeRole(user.role.name) !== this.normalizeRole(payload.role)) return false;
        if (payload.jti && await this.redisService.get(`jwt:blacklist:${payload.jti}`)) return false;

        const forceLogoutAt = await this.redisService.get(`user:${payload.sub}:force_logout_at`);
        const issuedAtMs = payload.sessionIssuedAt ?? (payload.iat ? payload.iat * 1000 : undefined);
        if (forceLogoutAt && (!Number.isFinite(issuedAtMs) || !Number.isFinite(Number(forceLogoutAt))
            || issuedAtMs! <= Number(forceLogoutAt))) return false;
        return true;
    }

    private async ensureSession(client: SessionClient): Promise<boolean> {
        try {
            // Nest binds events without awaiting handleConnection. A buffered join
            // or sweep must wait for trusted authentication, never race it.
            await this.connectionReady.get(client.id);
            const session = client.data.session as SocketSession | undefined;
            if (session?.sub === client.data.userId && session?.role === client.data.role
                && await this.isSessionValid(session)) return true;
        } catch {
            this.logger.warn('Socket session validation unavailable; disconnecting client');
        }
        client.disconnect(true);
        return false;
    }

    private isValidIdentifier(value: unknown): value is string {
        return typeof value === 'string' && value.length > 0 && value.length <= 128 && !/\s/.test(value);
    }

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly emailService: EmailService,
        private readonly aiHealthEventService: AiHealthEventService,
        private readonly ticketAccess: TicketAccessService,
        @InjectQueue(PROACTIVE_CHAT_QUEUE) private readonly proactiveChatQueue: Queue,
        private readonly work: MaintenanceWorkService,
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

    handleConnection(client: Socket): Promise<void> {
        const ready = this.initializeConnection(client);
        this.connectionReady.set(client.id, ready);
        return ready.finally(() => {
            if (this.connectionReady.get(client.id) === ready) {
                this.connectionReady.delete(client.id);
            }
        });
    }

    private async initializeConnection(client: Socket) {
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

            const payload = this.jwtService.verify<SocketSession>(token, {
                secret: this.config.get('JWT_SECRET'),
            });

            if (!await this.isSessionValid(payload)) {
                client.disconnect(true);
                return;
            }

            client.data.session = payload;
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            this.connectedClients++;
            this.logger.log(`🔌 Client connected: ${payload.sub} | Role: ${payload.role} (total: ${this.connectedClients})`);

            const redis = this.redisService.getClient();
            const presenceKey = `ws:presence:user:${payload.sub}`;
            await redis.set(presenceKey, 'active', 'EX', 60);

            // Join role room for targeted notifications (lowercase for consistency)
            if (payload.role) {
                await client.join(`role:${payload.role.toLowerCase()}`);

                // Track active users in role-specific Redis Sets for ultra-fast targeting (GAP-PERF-002)
                const roleKey = `ws:active:role:${payload.role.toLowerCase()}`;
                await redis.sadd(roleKey, payload.sub);
                await redis.expire(roleKey, 86400); // 24h safety
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
        this.connectionReady.delete(client.id);
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

            // Remove presence key on disconnect
            await redis.del(`ws:presence:user:${userId}`);

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
        if (!this.server) return;
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
        if (!this.isValidIdentifier(ticketId)) return { error: 'Invalid payload' };
        if (!await this.ensureSession(client)) return { error: 'Unauthorized' };
        const canAccess = await this.ticketAccess.canAccessTicket(
            { id: client.data.userId, role: client.data.role },
            ticketId,
        );
        if (!canAccess) {
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
        if (!this.isValidIdentifier(ticketId)) return { error: 'Invalid payload' };
        if (!await this.ensureSession(client)) return { error: 'Unauthorized' };
        if (!client.rooms?.has(`ticket:${ticketId}`)) return { error: 'Unauthorized' };
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
        if (!data || !this.isValidIdentifier(data.ticketId) || typeof data.isTyping !== 'boolean') return { error: 'Invalid payload' };
        if (!await this.ensureSession(client)) return { error: 'Unauthorized' };
        const room = `ticket:${data.ticketId}`;
        const canAccess = await this.ticketAccess.canAccessTicket(
            { id: client.data.userId, role: client.data.role },
            data.ticketId,
        );
        if (!canAccess || !client.rooms?.has(room)) return { error: 'Unauthorized' };

        client.to(room).emit('ticket:typing', {
            userId: client.data.userId,
            isTyping: data.isTyping,
        });
        return { typing: data.isTyping };
    }

    @SubscribeMessage('ticket:message_read')
    async markAsRead(@ConnectedSocket() client: Socket, @MessageBody() data: { ticketId: string, messageId: string }) {
        let started = false;
        try {
            // Each client event is new ingress, even on an existing connection.
            return await this.work.runRoot('ws.ticket.message-read', () => {
                started = true;
                return this.markAsReadTracked(client, data);
            });
        } catch (error) {
            if (!started && error instanceof ServiceUnavailableException) {
                throw new WsException({ code: 'MAINTENANCE', message: 'Service temporarily unavailable' });
            }
            throw error;
        }
    }

    private async markAsReadTracked(client: Socket, data: { ticketId: string, messageId: string }) {
        if (!data || !this.isValidIdentifier(data.ticketId) || !this.isValidIdentifier(data.messageId)) return { error: 'Invalid payload' };
        if (!await this.ensureSession(client) || !client.rooms?.has(`ticket:${data.ticketId}`)) return { error: 'Unauthorized' };
        const canAccess = await this.ticketAccess.canAccessTicket(
            { id: client.data.userId, role: client.data.role },
            data.ticketId,
        );
        if (!canAccess) return { error: 'Unauthorized' };

        const message = await this.prisma.ticketMessage.findFirst({
            where: { id: data.messageId, ticketId: data.ticketId },
            select: { id: true, isInternal: true, senderId: true, ticket: { select: { userId: true } } },
        });
        if (!message) return { error: 'Message not found' };
        if (message.isInternal && this.isCustomerRole(client.data.role)) return { error: 'Unauthorized' };

        // Only the customer recipient may suppress their own public-reply email.
        // A staff read must not suppress delivery to a different recipient/group.
        if (message.isInternal === false && message.ticket.userId === client.data.userId
            && message.senderId !== client.data.userId) {
            await this.emailService.cancelEmail(`email-ntf-msg-${data.messageId}`);
        }

        if (message.isInternal) {
            this.emitToStaff('ticket:message_read', { messageId: data.messageId, readerId: client.data.userId });
            return { read: data.messageId };
        }

        // Broadcast that a message was read
        client.to(`ticket:${data.ticketId}`).emit('ticket:message_read', {
            messageId: data.messageId,
            readerId: client.data.userId,
        });

        return { read: data.messageId };
    }

    // ─── Proactive Chat Handlers ─────────────────────────────────────────────────

    @SubscribeMessage('proactive_chat:join')
    async joinProactiveChatSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() sessionId: string,
    ) {
        if (!this.isValidIdentifier(sessionId)) return { error: 'Invalid payload' };
        if (!await this.ensureSession(client)) return { error: 'Unauthorized' };
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
        if (!this.isValidIdentifier(sessionId)) return { error: 'Invalid payload' };
        if (!await this.ensureSession(client) || !client.rooms?.has(`proactive_chat:${sessionId}`)) return { error: 'Unauthorized' };
        await client.leave(`proactive_chat:${sessionId}`);
        return { left: sessionId };
    }

    @SubscribeMessage('proactive_chat:typing')
    async proactiveChatTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { sessionId: string; isTyping: boolean },
    ) {
        if (!data || !this.isValidIdentifier(data.sessionId) || typeof data.isTyping !== 'boolean') return { error: 'Invalid payload' };
        if (!await this.ensureSession(client) || !client.rooms?.has(`proactive_chat:${data.sessionId}`)) return { error: 'Unauthorized' };
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: data.sessionId },
            select: { agentId: true, customerId: true },
        });
        if (!session || (session.agentId !== client.data.userId && session.customerId !== client.data.userId)) return { error: 'Unauthorized' };
        // Relay typing event to the other party — do NOT persist
        client.to(`proactive_chat:${data.sessionId}`).emit('proactive_chat:typing', {
            sessionId: data.sessionId,
            userId: client.data.userId,
            isTyping: data.isTyping,
        });
    }

    @OnEvent('ticket.created', { async: true, promisify: true })
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
        if (this.server) {
            this.server.to('role:admin').to('role:super-admin').to('role:department-manager').to('role:team-lead').to('role:agent').emit('ticket:created', payload);
        }
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

        if (this.server) {
            this.server.to(`ticket:${ticket.id}`).emit('ticket:updated', ticket);
            this.server.to('role:admin').to('role:department-manager').emit('ticket:status_changed', {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                status: ticket.status,
            });
        }
    }

    emitTicketEscalated(ticket: any) {
        if (!this.server) return;
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

        if (this.server) {
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
    }

    emitNewMessage(ticketId: string, message: any) {
        if (!this.server) return;
        if (message?.isInternal !== false) {
            this.emitToStaff('ticket:new_message', { ticketId, message });
            return;
        }
        this.server.to(`ticket:${ticketId}`).emit('ticket:new_message', {
            ticketId,
            message,
        });
    }

    @OnEvent('attachment.created', { async: true })
    emitAttachmentAdded(payload: { ticketId: string, messageId: string, isInternal?: boolean, attachment: any }) {
        if (!this.server) return;
        if (payload.isInternal !== false) {
            this.emitToStaff('ticket:attachment_added', payload);
            return;
        }
        this.server.to(`ticket:${payload.ticketId}`).emit('ticket:attachment_added', payload);
    }

    private emitToStaff(event: string, payload: unknown) {
        const staffRoleRooms = [
            'admin',
            'super-admin', 'super_admin',
            'superuser',
            'department-manager', 'department_manager',
            'team-lead', 'team_lead',
            'senior-agent', 'senior_agent',
            'agent',
            'support-agent', 'support_agent',
            'support-manager', 'support_manager',
        ];
        for (const role of staffRoleRooms) {
            this.server.to(`role:${role}`).emit(event, payload);
        }
    }

    private isCustomerRole(role: unknown): boolean {
        const normalized = typeof role === 'string' ? this.normalizeRole(role) : '';
        return normalized === 'CUSTOMER' || normalized === 'VIEWER';
    }

    private normalizeRole(role: string): string {
        return role.trim().toUpperCase().replace(/-/g, '_');
    }

    emitBulkUpdate(ticketIds: string[]) {
        if (!this.server) return;
        this.server
            .to('role:admin')
            .to('role:department-manager')
            .to('role:team-lead')
            .emit('tickets:bulk_updated', { ticketIds });
    }

    @OnEvent('system.ai_fallback')
    handleAiFallback(payload: AiFallbackPayload): Promise<void> {
        // Reserve inside the synchronous listener before emit() returns, not
        // after EventEmitter's deferred scheduling. Keep persistence deferred.
        const parent = this.work.currentLease();
        const operation = async () => {
            await new Promise<void>(resolve => setImmediate(resolve));
            await this.persistAiFallback(payload);
        };
        return parent
            ? this.work.runChild(parent, 'ai.fallback.notification', operation)
            : this.work.runRoot('ai.fallback.notification', operation);
    }

    private async persistAiFallback(payload: AiFallbackPayload): Promise<void> {
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
        if (this.server) {
            this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('system:ai_fallback', {
                ...payload,
                timestamp: Date.now()
            });
        }
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
                    name: { in: ['admin', 'ADMIN', 'super-admin', 'SUPER_ADMIN', 'department-manager', 'DEPARTMENT_MANAGER'] },
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

        if (this.server) {
            this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('crm:changes', {
                ...payload,
                title,
                message,
                timestamp: Date.now(),
            });
        }
    }

    async emitCrmSyncError(payload: { connectionId: string; message: string }) {
        const title = 'CRM delta sync hatası';
        const message = `Dynamics 365 değişiklik senkronizasyonu başarısız oldu: ${payload.message}`;

        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    name: { in: ['admin', 'ADMIN', 'super-admin', 'SUPER_ADMIN', 'department-manager', 'DEPARTMENT_MANAGER'] },
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

        if (this.server) {
            this.server.to('role:admin').to('role:super-admin').to('role:department-manager').emit('crm:sync_error', {
                ...payload,
                title,
                message,
                timestamp: Date.now(),
            });
        }
    }

    sendToUser(userId: string, event: string, payload: any) {
        if (!this.server) return;
        this.server.to(`user:${userId}`).emit(event, payload);
    }

    @SubscribeMessage('heartbeat')
    async handleHeartbeat(@ConnectedSocket() client: Socket) {
        if (!await this.ensureSession(client)) return { error: 'Unauthorized' };
        const userId = client.data.userId;
        if (!userId) return;
        const redis = this.redisService.getClient();
        const presenceKey = `ws:presence:user:${userId}`;
        await redis.set(presenceKey, 'active', 'EX', 60);
    }

    // Idle clients cannot retain revoked role/ticket subscriptions indefinitely.
    @Cron('*/30 * * * * *', { waitForCompletion: true })
    async revalidateSessions() {
        if (!this.server) return;
        try {
            const sockets = await this.server.local.fetchSockets();
            for (let offset = 0; offset < sockets.length; offset += 20) {
                await Promise.all(sockets.slice(offset, offset + 20).map(socket => this.ensureSession(socket)));
            }
        } catch {
            this.logger.warn('Unable to enumerate local sockets for session revalidation');
        }
    }

    @Cron('*/1 * * * *')
    async cleanupGhostUsers() {
        this.logger.log('🧹 Running ghost user presence cleanup...');
        const redis = this.redisService.getClient();
        const roles = ['admin', 'super-admin', 'department-manager', 'team-lead', 'agent'];

        for (const role of roles) {
            const roleKey = `ws:active:role:${role}`;
            const members = await redis.smembers(roleKey);
            for (const userId of members) {
                const presenceKey = `ws:presence:user:${userId}`;
                const hasPresence = await redis.exists(presenceKey);

                if (!hasPresence) {
                    if (this.server) {
                        const localSockets = await this.server.in(`user:${userId}`).fetchSockets();
                        if (localSockets.length === 0) {
                            await redis.srem(roleKey, userId);
                            this.logger.log(`Cleaned up ghost user ${userId} from active set for role ${role}`);
                        }
                    }
                }
            }
        }
    }
}
