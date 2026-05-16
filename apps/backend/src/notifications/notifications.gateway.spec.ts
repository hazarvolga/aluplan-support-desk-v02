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

describe('NotificationsGateway', () => {
    let gateway: NotificationsGateway;
    let mockJwtService: any;
    let mockConfig: any;
    let mockPrisma: any;
    let mockRedis: any;
    let mockEmail: any;
    let mockAiHealthEventService: any;
    let mockServer: any;

    beforeEach(async () => {
        mockJwtService = { verify: jest.fn() };
        mockConfig = { get: jest.fn().mockReturnValue('secret') };
        mockPrisma = {
            ticket: { findUnique: jest.fn() },
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
            }),
        };
        mockEmail = { cancelEmail: jest.fn() };
        mockAiHealthEventService = { record: jest.fn() };
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
            mockPrisma.ticket.findUnique.mockResolvedValue({ userId: 'other-user' });

            const result = await gateway.joinTicket(customerSocket, 'tik-1');

            expect(result).toEqual({ error: 'Unauthorized' });
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
});
