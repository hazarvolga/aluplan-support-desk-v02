import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from '../webhooks.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebhooksService', () => {
    let service: WebhooksService;
    let prisma: any;

    beforeEach(async () => {
        prisma = {
            webhook: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhooksService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<WebhooksService>(WebhooksService);
        mockedAxios.post.mockResolvedValue({ status: 200 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleTicketEvents', () => {
        it('should send webhooks matching the event', async () => {
            const webhooks = [
                { id: 'w1', name: 'Hook 1', url: 'https://example.com/hook', secret: 'secret1', events: ['ticket.created'] },
            ];
            prisma.webhook.findMany.mockResolvedValue(webhooks);

            await service.handleTicketEvents('ticket.created', { id: 't1' });

            expect(prisma.webhook.findMany).toHaveBeenCalledWith({
                where: { isActive: true, events: { has: 'ticket.created' } },
            });
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://example.com/hook',
                expect.objectContaining({ event: 'ticket.created', payload: { id: 't1' } }),
                expect.objectContaining({
                    timeout: 5000,
                    headers: { 'X-Webhook-Secret': 'secret1', 'Content-Type': 'application/json' },
                }),
            );
        });

        it('should send multiple webhooks for same event', async () => {
            const webhooks = [
                { id: 'w1', name: 'Hook 1', url: 'https://a.com', secret: 's1', events: ['ticket.created'] },
                { id: 'w2', name: 'Hook 2', url: 'https://b.com', secret: 's2', events: ['ticket.created'] },
            ];
            prisma.webhook.findMany.mockResolvedValue(webhooks);

            await service.handleTicketEvents('ticket.created', { id: 't1' });

            expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        });

        it('should not call axios if no webhooks match', async () => {
            prisma.webhook.findMany.mockResolvedValue([]);
            await service.handleTicketEvents('ticket.updated', { id: 't1' });
            expect(mockedAxios.post).not.toHaveBeenCalled();
        });

        it('should catch and log webhook delivery errors', async () => {
            const webhooks = [
                { id: 'w1', name: 'Failing Hook', url: 'https://fail.com', secret: 's1', events: ['ticket.created'] },
            ];
            prisma.webhook.findMany.mockResolvedValue(webhooks);
            mockedAxios.post.mockRejectedValue(new Error('Network error'));

            // Should not throw
            await expect(service.handleTicketEvents('ticket.created', { id: 't1' })).resolves.not.toThrow();
            expect(mockedAxios.post).toHaveBeenCalled();
        });
    });
});
