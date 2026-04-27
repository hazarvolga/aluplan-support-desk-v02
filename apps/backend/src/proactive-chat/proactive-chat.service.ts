import {
    Injectable, NotFoundException, ConflictException,
    ForbiddenException, Inject, forwardRef, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProactiveChatStatus, TicketStatus, TicketPriority } from '@aluplan/database';
import { PROACTIVE_CHAT_QUEUE } from './proactive-chat.constants';

const TERMINAL_STATUSES: ProactiveChatStatus[] = [
    ProactiveChatStatus.ENDED,
    ProactiveChatStatus.DECLINED,
    ProactiveChatStatus.MISSED,
];

@Injectable()
export class ProactiveChatService {
    private readonly logger = new Logger(ProactiveChatService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        @Inject(forwardRef(() => NotificationsGateway))
        private readonly gateway: NotificationsGateway,
        @InjectQueue(PROACTIVE_CHAT_QUEUE) private readonly queue: Queue,
    ) { }

    // ─── Task 3: Session Management ─────────────────────────────────────────────

    async createSession(agentId: string, customerId: string) {
        // 1. Verify customer profile exists and is VIP
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId: customerId },
            include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        });

        if (!profile) {
            throw new NotFoundException(`Customer profile for user ${customerId} not found`);
        }

        if (!profile.isVip) {
            throw new ForbiddenException('Proaktif chat hizmeti sadece VIP müşterilere sunulmaktadır.');
        }

        const customer = profile.user;

        // 2. Check for conflicting sessions (PENDING or ACTIVE)
        const existing = await this.prisma.proactiveChatSession.findFirst({
            where: {
                agentId,
                customerId,
                status: { in: [ProactiveChatStatus.PENDING, ProactiveChatStatus.ACTIVE] },
            },
        });
        if (existing) {
            throw new ConflictException(
                `A session with status ${existing.status} already exists between this agent and customer`,
            );
        }

        // 3. Get agent info for WS event
        const agent = await this.prisma.user.findUnique({
            where: { id: agentId },
            select: { id: true, fullName: true, avatarUrl: true },
        });

        // 4. Create session
        const session = await this.prisma.proactiveChatSession.create({
            data: {
                agentId,
                customerId,
                status: ProactiveChatStatus.PENDING,
            },
        });

        // 5. Add BullMQ pending-timeout job (120s)
        await this.queue.add(
            'pending-timeout',
            { sessionId: session.id },
            {
                delay: 120_000,
                jobId: `pct-${session.id}`,
                removeOnComplete: true,
                removeOnFail: false,
            },
        );

        // 6. Send WS event to customer
        const wsPayload = {
            sessionId: session.id,
            agentId: agent?.id,
            agentName: agent?.fullName,
            agentAvatar: agent?.avatarUrl,
            createdAt: session.createdAt,
        };
        this.gateway.sendToUser(customerId, 'proactive_chat:incoming', wsPayload);

        // 7. Create persistent Notification
        await this.prisma.notification.create({
            data: {
                userId: customerId,
                title: 'Proaktif Chat Daveti',
                message: `${agent?.fullName || 'Bir ajan'} sizinle chat başlatmak istiyor.`,
                type: 'PROACTIVE_CHAT_INVITE',
                link: `/chat/${session.id}`,
            },
        });

        this.logger.log(`Proactive chat session created: ${session.id} (agent: ${agentId}, customer: ${customerId})`);
        return session;
    }

    async acceptSession(sessionId: string, customerId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
        if (session.customerId !== customerId) {
            throw new ForbiddenException('You are not the customer of this session');
        }
        if (session.status !== ProactiveChatStatus.PENDING) {
            throw new ConflictException(`Session is not in PENDING status (current: ${session.status})`);
        }

        // Cancel pending-timeout job
        const job = await this.queue.getJob(`pct-${sessionId}`);
        if (job) await job.remove();

        const updated = await this.prisma.proactiveChatSession.update({
            where: { id: sessionId },
            data: { status: ProactiveChatStatus.ACTIVE },
        });

        const payload = { sessionId, acceptedAt: new Date() };
        this.gateway.sendToUser(session.agentId, 'proactive_chat:accepted', payload);
        this.gateway.sendToUser(customerId, 'proactive_chat:accepted', payload);

        return updated;
    }

    async declineSession(sessionId: string, customerId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
        if (session.customerId !== customerId) {
            throw new ForbiddenException('You are not the customer of this session');
        }
        if (session.status !== ProactiveChatStatus.PENDING) {
            throw new ConflictException(`Session is not in PENDING status (current: ${session.status})`);
        }

        // Cancel pending-timeout job
        const job = await this.queue.getJob(`pct-${sessionId}`);
        if (job) await job.remove();

        const updated = await this.prisma.proactiveChatSession.update({
            where: { id: sessionId },
            data: { status: ProactiveChatStatus.DECLINED },
        });

        this.gateway.sendToUser(session.agentId, 'proactive_chat:declined', { sessionId });

        return updated;
    }

    async endSession(sessionId: string, userId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

        // Ownership check: must be agent or customer
        if (session.agentId !== userId && session.customerId !== userId) {
            throw new ForbiddenException('You are not a participant of this session');
        }

        // Terminal status check
        if (TERMINAL_STATUSES.includes(session.status)) {
            throw new ConflictException(`Session is already in terminal status: ${session.status}`);
        }

        const endedAt = new Date();
        const updated = await this.prisma.proactiveChatSession.update({
            where: { id: sessionId },
            data: { status: ProactiveChatStatus.ENDED, endedAt },
        });

        const otherUserId = userId === session.agentId ? session.customerId : session.agentId;
        this.gateway.sendToUser(otherUserId, 'proactive_chat:ended', {
            sessionId,
            endedAt,
            endedBy: userId,
        });
        // Also notify the user who ended it (for multi-tab sync)
        this.gateway.sendToUser(userId, 'proactive_chat:ended', {
            sessionId,
            endedAt,
            endedBy: userId,
        });

        return updated;
    }

    async listSessions(userId: string, role: string) {
        const isAgent = role && role.toLowerCase() !== 'customer';

        if (isAgent) {
            return this.prisma.proactiveChatSession.findMany({
                where: { agentId: userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { id: true, fullName: true, avatarUrl: true } },
                },
            });
        } else {
            return this.prisma.proactiveChatSession.findMany({
                where: { customerId: userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    agent: { select: { id: true, fullName: true, avatarUrl: true } },
                },
            });
        }
    }

    // ─── Task 4: Messaging ───────────────────────────────────────────────────────

    async sendMessage(sessionId: string, senderId: string, content: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

        // Ownership check
        if (session.agentId !== senderId && session.customerId !== senderId) {
            throw new ForbiddenException('You are not a participant of this session');
        }

        // Must be ACTIVE
        if (session.status !== ProactiveChatStatus.ACTIVE) {
            throw new ForbiddenException(`Cannot send message: session status is ${session.status}`);
        }

        const message = await this.prisma.proactiveChatMessage.create({
            data: {
                sessionId,
                senderId,
                content,
            },
        });

        const otherUserId = senderId === session.agentId ? session.customerId : session.agentId;
        this.gateway.sendToUser(otherUserId, 'proactive_chat:message', {
            sessionId,
            messageId: message.id,
            senderId,
            content,
            createdAt: message.createdAt,
        });

        return message;
    }

    async getMessages(sessionId: string, userId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

        // Ownership check
        if (session.agentId !== userId && session.customerId !== userId) {
            throw new ForbiddenException('You are not a participant of this session');
        }

        return this.prisma.proactiveChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
    }

    // ─── Task 6: Ticket Conversion ───────────────────────────────────────────────

    async convertToTicket(sessionId: string, agentId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                customer: { select: { id: true, fullName: true } },
                agent: { select: { id: true, fullName: true } },
            },
        });

        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

        // Ownership check: must be the agent
        if (session.agentId !== agentId) {
            throw new ForbiddenException('Only the session agent can convert to ticket');
        }

        // Already converted check
        if (session.convertedTicketId) {
            throw new ConflictException(`Session already converted to ticket ${session.convertedTicketId}`);
        }

        // Generate ticket number
        const result = await this.prisma.$queryRaw<[{ nextval: bigint }]>`
            SELECT nextval('ticket_number_seq')
        `;
        const seq = Number(result[0].nextval);
        const ticketNumber = `SUP-${seq.toString().padStart(5, '0')}`;

        const customerName = session.customer?.fullName || 'Müşteri';
        const date = new Date().toLocaleDateString('tr-TR');
        const subject = `Proaktif Chat - ${customerName} - ${date}`;

        // Transaction: create ticket + copy messages + update session
        const ticket = await this.prisma.$transaction(async (tx) => {
            // 1. Create ticket
            const newTicket = await tx.ticket.create({
                data: {
                    ticketNumber,
                    subject,
                    userId: session.customerId,
                    assignedTo: session.agentId,
                    status: TicketStatus.NEW,
                    priority: TicketPriority.MEDIUM,
                    channel: 'WEB',
                    hotinfoSnapshot: { proactiveChatSessionId: sessionId },
                },
            });

            // 2. Copy all ProactiveChatMessages as TicketMessages
            if (session.messages.length > 0) {
                await tx.ticketMessage.createMany({
                    data: session.messages.map((msg) => ({
                        ticketId: newTicket.id,
                        senderId: msg.senderId,
                        message: msg.content,
                        isInternal: false,
                        channel: 'WEB',
                    })),
                });
            }

            // 3. Update session with convertedTicketId
            await tx.proactiveChatSession.update({
                where: { id: sessionId },
                data: { convertedTicketId: newTicket.id },
            });

            return newTicket;
        });

        // 4. Send WS event to agent
        this.gateway.sendToUser(agentId, 'proactive_chat:converted', {
            sessionId,
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
        });

        this.logger.log(`Session ${sessionId} converted to ticket ${ticket.ticketNumber}`);
        return ticket;
    }

    // ─── Task 5: Timeout Handlers ────────────────────────────────────────────────

    async handlePendingTimeout(sessionId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.status !== ProactiveChatStatus.PENDING) return;

        await this.prisma.proactiveChatSession.update({
            where: { id: sessionId },
            data: { status: ProactiveChatStatus.MISSED },
        });

        this.gateway.sendToUser(session.agentId, 'proactive_chat:missed', { sessionId });
        this.logger.log(`Session ${sessionId} timed out → MISSED`);
    }

    async handleDisconnectTimeout(sessionId: string, userId: string) {
        const session = await this.prisma.proactiveChatSession.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.status !== ProactiveChatStatus.ACTIVE) return;

        const endedAt = new Date();
        await this.prisma.proactiveChatSession.update({
            where: { id: sessionId },
            data: { status: ProactiveChatStatus.ENDED, endedAt },
        });

        const otherUserId = userId === session.agentId ? session.customerId : session.agentId;
        this.gateway.sendToUser(otherUserId, 'proactive_chat:ended', {
            sessionId,
            endedAt,
            endedBy: 'disconnect',
        });
        this.logger.log(`Session ${sessionId} ended due to disconnect of user ${userId}`);
    }
}
