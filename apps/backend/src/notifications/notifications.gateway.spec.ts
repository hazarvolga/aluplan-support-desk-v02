import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { getQueueToken } from '@nestjs/bullmq';
import { PROACTIVE_CHAT_QUEUE } from '../proactive-chat/proactive-chat.constants';
import { AiHealthEventService } from '../ai/ai-health-event.service';
import { TicketAccessService } from '../common/services/ticket-access.service';

describe('NotificationsGateway', () => {
    let gateway: NotificationsGateway;
    let mockJwtService: any;
    let mockConfig: any;
    let mockPrisma: any;
    let mockRedis: any;
    let mockEmail: any;
    let mockAiHealthEventService: any;
    let mockServer: any;
    let mockTicketAccess: any;

    beforeEach(async () => {
        mockJwtService = { verify: jest.fn() };
        mockConfig = { get: jest.fn().mockReturnValue('secret') };
        mockPrisma = {
            ticket: { findUnique: jest.fn() },
            ticketMessage: { findFirst: jest.fn() },
            proactiveChatSession: { findMany: jest.fn().mockResolvedValue([]) },
            notification: { createMany: jest.fn(), create: jest.fn() },
            user: { findMany: jest.fn() }
        };
        mockRedis = {
            getClient: jest.fn().mockReturnValue({
                sadd: jest.fn(),
                srem: jest.fn(),
                smembers: jest.fn().mockResolvedValue([]),
                sunion: jest.fn().mockResolvedValue([]),
                del: jest.fn(),
                expire: jest.fn(),
                set: jest.fn(),
                exists: jest.fn(),
            }),
        };
        mockEmail = { cancelEmail: jest.fn() };
        mockAiHealthEventService = { record: jest.fn() };
        mockTicketAccess = { canAccessTicket: jest.fn().mockResolvedValue(true) };
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsGateway,
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfig },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedis },
                { provide: EmailService, useValue: mockEmail },
                { provide: AiHealthEventService, useValue: mockAiHealthEventService },
                { provide: TicketAccessService, useValue: mockTicketAccess },
                { provide: getQueueToken(PROACTIVE_CHAT_QUEUE), useValue: { add: jest.fn() } },
            ],
        }).compile();

        gateway = module.get<NotificationsGateway>(NotificationsGateway);
        gateway.server = mockServer;
    });

    describe('handleConnection', () => {
        it('should verify JWT and join rooms', async () => {
            const mockSocket: any = {
                handshake: { auth: { token: 'valid-token' } },
                data: {},
                join: jest.fn(),
                disconnect: jest.fn(),
            };
            mockJwtService.verify.mockReturnValue({ sub: 'user-1', role: 'admin' });

            await gateway.handleConnection(mockSocket);

            expect(mockSocket.data.userId).toBe('user-1');
            expect(mockSocket.join).toHaveBeenCalledWith('role:admin');
            expect(mockSocket.join).toHaveBeenCalledWith('user:user-1');
            expect(mockRedis.getClient().sadd).toHaveBeenCalledWith('ws:active:role:admin', 'user-1');
        });

        it('should disconnect if token is missing', async () => {
            const mockSocket: any = { handshake: { auth: {} }, disconnect: jest.fn() };
            await gateway.handleConnection(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });
    });

    describe('joinTicket', () => {
        const mockSocket: any = {
            data: { userId: 'user-1', role: 'agent' },
            join: jest.fn(),
        };

        it('should allow agent to join ticket room', async () => {
            mockPrisma.ticket.findUnique.mockResolvedValue({ userId: 'other-user' });

            const result = await gateway.joinTicket(mockSocket, 'tik-1');

            expect(result).toEqual({ joined: 'tik-1' });
            expect(mockSocket.join).toHaveBeenCalledWith('ticket:tik-1');
            expect(mockRedis.getClient().sadd).toHaveBeenCalledWith('presence:ticket:tik-1', 'user-1');
        });

        it('should deny customer joining someone elses ticket', async () => {
            const customerSocket: any = { data: { userId: 'customer-1', role: 'CUSTOMER' } };
            mockTicketAccess.canAccessTicket.mockResolvedValueOnce(false);

            const result = await gateway.joinTicket(customerSocket, 'tik-1');

            expect(result).toEqual({ error: 'Unauthorized' });
            expect(mockTicketAccess.canAccessTicket).toHaveBeenCalledWith(
                { id: 'customer-1', role: 'CUSTOMER' },
                'tik-1',
            );
            expect(customerSocket.join).toBeUndefined();
        });
    });

    describe('markAsRead', () => {
        const readerSocket: any = {
            data: { userId: 'user-1', role: 'CUSTOMER' },
            to: jest.fn().mockReturnThis(),
        };

        it('does not cancel an email job when the reader cannot access the ticket', async () => {
            mockTicketAccess.canAccessTicket.mockResolvedValueOnce(false);

            const result = await gateway.markAsRead(readerSocket, { ticketId: 'ticket-1', messageId: 'message-1' });

            expect(result).toEqual({ error: 'Unauthorized' });
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
            expect(readerSocket.to).not.toHaveBeenCalled();
        });

        it('does not cancel an email job when the message belongs to another ticket', async () => {
            mockPrisma.ticketMessage.findFirst.mockResolvedValueOnce(null);

            const result = await gateway.markAsRead(readerSocket, { ticketId: 'ticket-1', messageId: 'message-2' });

            expect(result).toEqual({ error: 'Message not found' });
            expect(mockPrisma.ticketMessage.findFirst).toHaveBeenCalledWith({
                where: { id: 'message-2', ticketId: 'ticket-1' },
                select: { id: true, isInternal: true },
            });
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
        });

        it('does not let a customer cancel an internal-message notification', async () => {
            mockPrisma.ticketMessage.findFirst.mockResolvedValueOnce({ id: 'message-1', isInternal: true });

            const result = await gateway.markAsRead(readerSocket, { ticketId: 'ticket-1', messageId: 'message-1' });

            expect(result).toEqual({ error: 'Unauthorized' });
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
            expect(readerSocket.to).not.toHaveBeenCalled();
        });
    });

    describe('announceTyping', () => {
        const typingSocket: any = {
            data: { userId: 'customer-1', role: 'CUSTOMER' },
            rooms: new Set(['ticket:ticket-1']),
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        it('does not broadcast when the socket is not authorized for the ticket', async () => {
            mockTicketAccess.canAccessTicket.mockResolvedValueOnce(false);

            const result = await gateway.announceTyping(typingSocket, { ticketId: 'ticket-1', isTyping: true });

            expect(result).toEqual({ error: 'Unauthorized' });
            expect(typingSocket.to).not.toHaveBeenCalled();
        });

        it('does not broadcast when the socket has not joined the ticket room', async () => {
            const socketWithoutRoom = { ...typingSocket, rooms: new Set(), to: jest.fn().mockReturnThis() };

            const result = await gateway.announceTyping(socketWithoutRoom, { ticketId: 'ticket-1', isTyping: true });

            expect(result).toEqual({ error: 'Unauthorized' });
            expect(socketWithoutRoom.to).not.toHaveBeenCalled();
        });
    });

    describe('ticket event audience', () => {
        it('does not broadcast an internal message to the customer ticket room', () => {
            gateway.emitNewMessage('ticket-1', { id: 'message-1', isInternal: true });

            expect(mockServer.to).not.toHaveBeenCalledWith('ticket:ticket-1');
            expect(mockServer.to).toHaveBeenCalledWith('role:agent');
            expect(mockServer.to).toHaveBeenCalledWith('role:super-admin');
            expect(mockServer.to).toHaveBeenCalledWith('role:super_admin');
            expect(mockServer.emit).toHaveBeenCalledWith('ticket:new_message', expect.any(Object));
        });

        it('does not broadcast an internal attachment to the customer ticket room', () => {
            gateway.emitAttachmentAdded({ ticketId: 'ticket-1', messageId: 'message-1', isInternal: true, attachment: { id: 'a1' } });

            expect(mockServer.to).not.toHaveBeenCalledWith('ticket:ticket-1');
            expect(mockServer.to).toHaveBeenCalledWith('role:agent');
            expect(mockServer.to).toHaveBeenCalledWith('role:department-manager');
            expect(mockServer.to).toHaveBeenCalledWith('role:department_manager');
            expect(mockServer.emit).toHaveBeenCalledWith('ticket:attachment_added', expect.any(Object));
        });
    });

    describe('emitTicketCreated', () => {
        it('should broadcast and create persistent notifications', async () => {
            const mockTicket = {
                id: 'tik-123',
                ticketNumber: 'SUP-123',
                subject: 'Help me',
                priority: 'HIGH',
                status: 'OPEN'
            };
            mockRedis.getClient().sunion.mockResolvedValue(['agent-1', 'agent-2']);

            await gateway.emitTicketCreated(mockTicket);

            expect(mockServer.to).toHaveBeenCalledWith('role:admin');
            expect(mockServer.emit).toHaveBeenCalledWith('ticket:created', expect.any(Object));
            expect(mockPrisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ userId: 'agent-1' }),
                    expect.objectContaining({ userId: 'agent-2' }),
                ])
            }));
        });
    });

    describe('handleAiFallback', () => {
        it('should notify admins of AI failure', async () => {
            mockPrisma.user.findMany.mockResolvedValue([{ id: 'admin-1' }]);
            const payload = { primaryProvider: 'v1', fallbackProvider: 'v2', task: 't', error: 'e' };

            await gateway.handleAiFallback(payload);

            expect(mockAiHealthEventService.record).toHaveBeenCalledWith(expect.objectContaining({
                eventType: 'FALLBACK',
                provider: 'v1',
                model: 'v2',
                task: 't',
                errorMessage: 'e',
            }));
            expect(mockPrisma.notification.createMany).toHaveBeenCalled();
            expect(mockServer.to).toHaveBeenCalledWith('role:admin');
            expect(mockServer.emit).toHaveBeenCalledWith('system:ai_fallback', expect.any(Object));
        });
    });

    describe('emitCrmChanges', () => {
        it('should broadcast CRM changes and create persistent notifications', async () => {
            mockPrisma.user.findMany.mockResolvedValue([{ id: 'admin-1' }]);

            await gateway.emitCrmChanges({
                connectionId: 'crm-1',
                entityType: 'contact',
                changeCount: 3,
            });

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    role: expect.objectContaining({
                        name: expect.objectContaining({
                            in: expect.arrayContaining(['admin', 'ADMIN']),
                        }),
                    }),
                }),
            }));
            expect(mockPrisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
                data: [expect.objectContaining({
                    userId: 'admin-1',
                    type: 'SYSTEM_ALERT',
                    link: '/customers/crm',
                })],
            }));
            expect(mockServer.to).toHaveBeenCalledWith('role:admin');
            expect(mockServer.emit).toHaveBeenCalledWith('crm:changes', expect.objectContaining({
                connectionId: 'crm-1',
                entityType: 'contact',
                changeCount: 3,
            }));
        });
    });

    describe('handleHeartbeat', () => {
        it('should update Redis presence key TTL', async () => {
            const mockSocket: any = {
                data: { userId: 'user-1' },
            };
            const mockSet = jest.fn();
            mockRedis.getClient.mockReturnValue({
                set: mockSet,
            });

            await gateway.handleHeartbeat(mockSocket);

            expect(mockSet).toHaveBeenCalledWith('ws:presence:user:user-1', 'active', 'EX', 60);
        });
    });

    describe('cleanupGhostUsers', () => {
        it('should clean up ghost users from active sets if missing from presence and local sockets', async () => {
            const mockSmembers = jest.fn().mockResolvedValue(['ghost-user', 'active-user']);
            const mockExists = jest.fn().mockImplementation((key) => {
                if (key === 'ws:presence:user:ghost-user') return 0;
                return 1;
            });
            const mockSrem = jest.fn();

            mockRedis.getClient.mockReturnValue({
                smembers: mockSmembers,
                exists: mockExists,
                srem: mockSrem,
            });

            const mockFetchSockets = jest.fn().mockResolvedValue([]);
            mockServer.in = jest.fn().mockReturnValue({
                fetchSockets: mockFetchSockets,
            });

            await gateway.cleanupGhostUsers();

            expect(mockSrem).toHaveBeenCalledWith('ws:active:role:admin', 'ghost-user');
            expect(mockSrem).not.toHaveBeenCalledWith('ws:active:role:admin', 'active-user');
        });
    });
});
