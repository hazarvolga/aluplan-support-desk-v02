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

const socketData = (userId: string, role: string) => ({
    userId, role,
    session: { sub: userId, role, exp: Math.floor(Date.now() / 1000) + 3600 },
});
const activeUser = (role: string) => ({ status: 'ACTIVE', deletedAt: null, sessionVersion: 0, role: { name: role } });

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
            proactiveChatSession: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
            notification: { createMany: jest.fn(), create: jest.fn() },
            user: { findMany: jest.fn(), findUnique: jest.fn().mockResolvedValue({ status: 'ACTIVE', deletedAt: null, sessionVersion: 0, role: { name: 'admin' } }) }
        };
        mockRedis = {
            get: jest.fn().mockResolvedValue(null),
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
        it.each([false, true])('releases readiness after immediate authentication rejection (hasToken=%s)', async (hasToken) => {
            mockJwtService.verify.mockImplementation(() => { throw new Error('invalid signature'); });
            const socket: any = { id: 'rejected-socket', handshake: { auth: hasToken ? { token: 'invalid' } : {} }, data: {}, disconnect: jest.fn() };
            await gateway.handleConnection(socket);
            expect(socket.disconnect).toHaveBeenCalled();
            expect((gateway as any).connectionReady.size).toBe(0);
        });
        it.each([true, false])('waits for pending handshake authentication before buffered join (valid=%s)', async (valid) => {
            let release!: (user: unknown) => void;
            mockPrisma.user.findUnique.mockReturnValueOnce(new Promise(resolve => { release = resolve; }));
            mockJwtService.verify.mockReturnValue(socketData('user-1', 'admin').session);
            const socket: any = { handshake: { auth: { token: 'signed-token' } }, data: {}, join: jest.fn(), disconnect: jest.fn() };
            const connected = gateway.handleConnection(socket);
            const joined = gateway.joinTicket(socket, 'ticket-1');
            await Promise.resolve();
            expect(socket.disconnect).not.toHaveBeenCalled();
            expect(socket.join).not.toHaveBeenCalled();
            release(valid ? activeUser('admin') : null);
            await connected;
            await expect(joined).resolves.toEqual(valid ? { joined: 'ticket-1' } : { error: 'Unauthorized' });
            if (valid) expect(socket.disconnect).not.toHaveBeenCalled();
            else expect(socket.join).not.toHaveBeenCalled();
        });
        it.each([
            { label: 'expired', payload: { exp: 1 }, user: activeUser('admin'), revoked: null },
            { label: 'missing expiry', payload: { exp: undefined }, user: activeUser('admin'), revoked: null },
            { label: 'old session version', payload: {}, user: { ...activeUser('admin'), sessionVersion: 1 }, revoked: null },
            { label: 'soft-deleted account', payload: {}, user: { ...activeUser('admin'), deletedAt: new Date() }, revoked: null },
            { label: 'missing account', payload: {}, user: null, revoked: null },
            { label: 'changed role', payload: {}, user: activeUser('CUSTOMER'), revoked: null },
            { label: 'force logout without issued time', payload: {}, user: activeUser('admin'), revoked: String(Date.now()) },
        ])('rejects $label before joining rooms', async ({ payload, user, revoked }) => {
            const socket: any = { handshake: { auth: { token: 'signed-token' } }, data: {}, join: jest.fn(), disconnect: jest.fn() };
            mockJwtService.verify.mockReturnValue({ ...socketData('user-1', 'admin').session, ...payload });
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockRedis.get.mockResolvedValue(revoked);
            await gateway.handleConnection(socket);
            expect(socket.disconnect).toHaveBeenCalled();
            expect(socket.join).not.toHaveBeenCalled();
        });
        it('should verify JWT and join rooms', async () => {
            const mockSocket: any = {
                handshake: { auth: { token: 'valid-token' } },
                data: {},
                join: jest.fn(),
                disconnect: jest.fn(),
            };
            mockJwtService.verify.mockReturnValue(socketData('user-1', 'admin').session);

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

        it.each(['SUSPENDED', 'DELETED'])('rejects signed tokens for a %s account', async (status) => {
            const socket: any = { handshake: { auth: { token: 'signed-token' } }, data: {}, join: jest.fn(), disconnect: jest.fn() };
            mockJwtService.verify.mockReturnValue({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 });
            mockPrisma.user.findUnique.mockResolvedValue({ status, deletedAt: null, sessionVersion: 0, role: { name: 'admin' } });
            await gateway.handleConnection(socket);
            expect(socket.disconnect).toHaveBeenCalled();
            expect(socket.join).not.toHaveBeenCalled();
        });

        it('rejects a revoked signed token before joining any role room', async () => {
            const socket: any = { handshake: { auth: { token: 'signed-token' } }, data: {}, join: jest.fn(), disconnect: jest.fn() };
            mockJwtService.verify.mockReturnValue({ sub: 'user-1', role: 'admin', jti: 'revoked', exp: Math.floor(Date.now() / 1000) + 60 });
            mockRedis.get.mockResolvedValue('1');
            await gateway.handleConnection(socket);
            expect(socket.disconnect).toHaveBeenCalled();
            expect(socket.join).not.toHaveBeenCalled();
        });
    });

    describe('joinTicket', () => {
        beforeEach(() => mockPrisma.user.findUnique.mockResolvedValue(activeUser('agent')));
        const mockSocket: any = {
            data: socketData('user-1', 'agent'),
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
            mockPrisma.user.findUnique.mockResolvedValue(activeUser('CUSTOMER'));
            const customerSocket: any = { data: socketData('customer-1', 'CUSTOMER') };
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
        beforeEach(() => mockPrisma.user.findUnique.mockResolvedValue(activeUser('CUSTOMER')));
        const readerSocket: any = {
            data: socketData('user-1', 'CUSTOMER'),
            rooms: new Set(['ticket:ticket-1']),
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
                select: { id: true, isInternal: true, senderId: true, ticket: { select: { userId: true } } },
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

        it('keeps internal-note read receipts out of the customer room', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(activeUser('AGENT'));
            const socket: any = { data: socketData('staff-1', 'AGENT'), rooms: new Set(['ticket:ticket-1']), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.ticketMessage.findFirst.mockResolvedValue({ id: 'message-1', isInternal: true, senderId: 'other-staff', ticket: { userId: 'customer-1' } });
            await gateway.markAsRead(socket, { ticketId: 'ticket-1', messageId: 'message-1' });
            expect(socket.to).not.toHaveBeenCalledWith('ticket:ticket-1');
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
        });

        it('does not let staff reading a public reply cancel the customer email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(activeUser('AGENT'));
            const socket: any = { data: socketData('staff-1', 'AGENT'), rooms: new Set(['ticket:ticket-1']), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.ticketMessage.findFirst.mockResolvedValue({ id: 'message-1', isInternal: false, senderId: 'other-staff', ticket: { userId: 'customer-1' } });
            await gateway.markAsRead(socket, { ticketId: 'ticket-1', messageId: 'message-1' });
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
        });

        it('rejects a read event from a socket outside the ticket room', async () => {
            const socket: any = { data: socketData('customer-1', 'CUSTOMER'), rooms: new Set(), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.ticketMessage.findFirst.mockResolvedValue({ id: 'message-1', isInternal: false, senderId: 'staff-1', ticket: { userId: 'customer-1' } });
            await expect(gateway.markAsRead(socket, { ticketId: 'ticket-1', messageId: 'message-1' })).resolves.toEqual({ error: 'Unauthorized' });
            expect(mockEmail.cancelEmail).not.toHaveBeenCalled();
        });

        it('preserves customer read cancellation for their own incoming public reply', async () => {
            const socket: any = { data: socketData('customer-1', 'CUSTOMER'), rooms: new Set(['ticket:ticket-1']), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.ticketMessage.findFirst.mockResolvedValue({ id: 'message-1', isInternal: false, senderId: 'staff-1', ticket: { userId: 'customer-1' } });
            await expect(gateway.markAsRead(socket, { ticketId: 'ticket-1', messageId: 'message-1' })).resolves.toEqual({ read: 'message-1' });
            expect(mockEmail.cancelEmail).toHaveBeenCalledWith('email-ntf-msg-message-1');
            expect(socket.to).toHaveBeenCalledWith('ticket:ticket-1');
        });
    });

    describe('announceTyping', () => {
        beforeEach(() => mockPrisma.user.findUnique.mockResolvedValue(activeUser('CUSTOMER')));
        const typingSocket: any = {
            data: socketData('customer-1', 'CUSTOMER'),
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
        it('treats unknown message visibility as private rather than broadcasting to customers', () => {
            gateway.emitNewMessage('ticket-1', { id: 'message-1' });
            expect(mockServer.to).not.toHaveBeenCalledWith('ticket:ticket-1');
        });

        it('treats unknown attachment visibility as private', () => {
            gateway.emitAttachmentAdded({ ticketId: 'ticket-1', messageId: 'message-1', attachment: { id: 'a1' } });
            expect(mockServer.to).not.toHaveBeenCalledWith('ticket:ticket-1');
        });

        it('preserves public message and attachment delivery', () => {
            gateway.emitNewMessage('ticket-1', { id: 'message-1', isInternal: false });
            gateway.emitAttachmentAdded({ ticketId: 'ticket-1', messageId: 'message-1', isInternal: false, attachment: { id: 'a1' } });
            expect(mockServer.to).toHaveBeenCalledWith('ticket:ticket-1');
            expect(mockServer.emit).toHaveBeenCalledWith('ticket:new_message', expect.any(Object));
            expect(mockServer.emit).toHaveBeenCalledWith('ticket:attachment_added', expect.any(Object));
        });
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
        beforeEach(() => mockPrisma.user.findUnique.mockResolvedValue(activeUser('CUSTOMER')));
        it('disconnects an already-connected user after session revocation', async () => {
            const socket: any = { data: socketData('user-1', 'CUSTOMER'), disconnect: jest.fn() };
            mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser('CUSTOMER'), sessionVersion: 1 });
            await gateway.handleHeartbeat(socket);
            expect(socket.disconnect).toHaveBeenCalled();
            expect(mockRedis.getClient().set).not.toHaveBeenCalled();
        });
        it('should update Redis presence key TTL', async () => {
            const mockSocket: any = {
                data: socketData('user-1', 'CUSTOMER'),
            };
            const mockSet = jest.fn();
            mockRedis.getClient.mockReturnValue({
                set: mockSet,
            });

            await gateway.handleHeartbeat(mockSocket);

            expect(mockSet).toHaveBeenCalledWith('ws:presence:user:user-1', 'active', 'EX', 60);
        });
    });

    describe('session sweep and payload boundaries', () => {
        it('disconnects an idle revoked socket without waiting for its heartbeat', async () => {
            const socket: any = { data: socketData('user-1', 'admin'), disconnect: jest.fn() };
            mockServer.local = { fetchSockets: jest.fn().mockResolvedValue([socket]) };
            mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser('admin'), sessionVersion: 5 });
            await gateway.revalidateSessions();
            expect(socket.disconnect).toHaveBeenCalledWith(true);
        });

        it.each([null, undefined, {}, { ticketId: [] }, { ticketId: 'ticket-1', isTyping: 'true' }])('rejects malformed typing data %p before side effects', async (payload) => {
            const socket: any = { data: socketData('user-1', 'admin'), to: jest.fn() };
            await expect(gateway.announceTyping(socket, payload as any)).resolves.toEqual({ error: 'Invalid payload' });
            expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
            expect(socket.to).not.toHaveBeenCalled();
        });

        it('denies proactive typing from a nonparticipant even if it knows a session ID', async () => {
            const socket: any = { data: socketData('user-1', 'admin'), rooms: new Set(['proactive_chat:session-1']), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.proactiveChatSession.findUnique.mockResolvedValue({ agentId: 'other-agent', customerId: 'other-customer' });
            await expect(gateway.proactiveChatTyping(socket, { sessionId: 'session-1', isTyping: true })).resolves.toEqual({ error: 'Unauthorized' });
            expect(socket.to).not.toHaveBeenCalled();
        });

        it('preserves proactive typing between active session participants', async () => {
            const socket: any = { data: socketData('user-1', 'admin'), rooms: new Set(['proactive_chat:session-1']), to: jest.fn().mockReturnThis(), emit: jest.fn() };
            mockPrisma.proactiveChatSession.findUnique.mockResolvedValue({ agentId: 'user-1', customerId: 'other-customer' });
            await gateway.proactiveChatTyping(socket, { sessionId: 'session-1', isTyping: true });
            expect(socket.to).toHaveBeenCalledWith('proactive_chat:session-1');
            expect(socket.emit).toHaveBeenCalledWith('proactive_chat:typing', expect.objectContaining({ userId: 'user-1' }));
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
