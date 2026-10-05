import { TicketClusteringService } from './ticket-clustering.service';
import { RAG_CONFIG } from '../config/rag.config';

describe('TicketClusteringService', () => {
    it('uses centralized RAG_CONFIG clustering thresholds', () => {
        const service = new TicketClusteringService(
            {} as any,
            {} as any,
            {} as any,
            {} as any,
        );

        expect((service as any).SIMILARITY_THRESHOLD).toBe(RAG_CONFIG.CLUSTERING.SIMILARITY_THRESHOLD);
        expect((service as any).MIN_CLUSTER_SIZE).toBe(RAG_CONFIG.CLUSTERING.MIN_CLUSTER_SIZE);
    });

    it('builds cluster FAQ context from a verified public agent solution only', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
                findMany: jest.fn().mockResolvedValue([{
                    id: 'ticket-1',
                    userId: 'customer-1',
                    subject: 'License issue',
                    description: 'License does not activate',
                    satisfactionScore: 5,
                    messages: [
                        { senderId: 'customer-1', message: 'Customer private details', isInternal: false, deletedAt: null },
                        { senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'Use the License Manager to activate the license.', isInternal: false, deletedAt: null },
                        { senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'STAFF-ONLY COMMERCIAL NOTE', isInternal: true, deletedAt: null },
                    ],
                }]),
            },
        };
        const ai = { reformat: jest.fn().mockResolvedValue({ response: JSON.stringify({ question: 'How to activate?', answer: 'Use License Manager.', tags: ['license'] }) }) };
        const faqService = { createFromCluster: jest.fn().mockResolvedValue(undefined) };
        const service = new TicketClusteringService(prisma as any, ai as any, {} as any, faqService as any);

        await (service as any).generateFaqFromCluster(['ticket-1']);

        const prompt = ai.reformat.mock.calls[0][2];
        expect(prompt).toContain('Use the License Manager to activate the license.');
        expect(prompt).not.toContain('STAFF-ONLY COMMERCIAL NOTE');
        expect(faqService.createFromCluster).toHaveBeenCalledWith(expect.objectContaining({
            ticketIds: ['ticket-1'],
            avgCsat: 5,
        }));
    });

    it('does not create a cluster FAQ when any ticket lacks a verified solution', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }),
                findMany: jest.fn().mockResolvedValue([{
                    id: 'ticket-1', userId: 'customer-1', subject: 'Unresolved', description: 'Still broken',
                    satisfactionScore: 5,
                    messages: [{ senderId: 'customer-1', sender: { role: { name: 'CUSTOMER' } }, message: 'Still broken', isInternal: false, deletedAt: null }],
                }]),
            },
        };
        const ai = { reformat: jest.fn() };
        const faqService = { createFromCluster: jest.fn() };
        const service = new TicketClusteringService(prisma as any, ai as any, {} as any, faqService as any);

        await (service as any).generateFaqFromCluster(['ticket-1']);

        expect(ai.reformat).not.toHaveBeenCalled();
        expect(faqService.createFromCluster).not.toHaveBeenCalled();
    });

    it('does not create a candidate when the model omits a usable answer', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }),
                findMany: jest.fn().mockResolvedValue([{
                    id: 'ticket-1', userId: 'customer-1', subject: 'License issue', description: 'Activation',
                    satisfactionScore: 5,
                    messages: [{ senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'Use License Manager.', isInternal: false, deletedAt: null }],
                }]),
                updateMany: jest.fn(),
            },
        };
        const ai = { reformat: jest.fn().mockResolvedValue({ response: JSON.stringify({ question: '', answer: '   ' }) }) };
        const faqService = { createFromCluster: jest.fn() };
        const service = new TicketClusteringService(prisma as any, ai as any, {} as any, faqService as any);

        await (service as any).generateFaqFromCluster(['ticket-1']);

        expect(faqService.createFromCluster).not.toHaveBeenCalled();
        expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
    });

    it('does not treat another customer message as a verified solution', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }),
                findMany: jest.fn().mockResolvedValue([{
                    id: 'ticket-1', userId: 'customer-1', subject: 'License issue', description: 'Activation',
                    satisfactionScore: 5,
                    messages: [{ senderId: 'customer-2', sender: { role: { name: 'CUSTOMER' } }, message: 'Try restarting.', isInternal: false, deletedAt: null }],
                }]),
            },
        };
        const ai = { reformat: jest.fn() };
        const faqService = { createFromCluster: jest.fn() };
        const service = new TicketClusteringService(prisma as any, ai as any, {} as any, faqService as any);

        await (service as any).generateFaqFromCluster(['ticket-1']);

        expect(ai.reformat).not.toHaveBeenCalled();
        expect(faqService.createFromCluster).not.toHaveBeenCalled();
    });

    it('masks PII before embedding search', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ id: 'ticket-1', subject: 'License user@example.com AB12CD34EF56' }),
            },
        };
        const embeddingService = {
            searchTickets: jest.fn().mockResolvedValue([]),
        };
        const service = new TicketClusteringService(prisma as any, {} as any, embeddingService as any, {} as any);

        await (service as any).findClusters(['ticket-1']);

        expect(embeddingService.searchTickets).toHaveBeenCalledWith(expect.not.stringContaining('user@example.com'), 10);
        expect(embeddingService.searchTickets).toHaveBeenCalledWith(expect.not.stringContaining('AB12CD34EF56'), 10);
    });

    it('masks PII echoed by the cluster model before persistence', async () => {
        const prisma = {
            ticket: {
                findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }),
                findMany: jest.fn().mockResolvedValue([{
                    id: 'ticket-1', userId: 'customer-1', subject: 'License issue', description: 'Activation',
                    satisfactionScore: 5,
                    messages: [{ senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'Use License Manager.', isInternal: false, deletedAt: null }],
                }]),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };
        const ai = { reformat: jest.fn().mockResolvedValue({ response: JSON.stringify({
            question: 'Activate user@example.com', answer: 'Use AB12CD34EF56', tags: [],
        }) }) };
        const faqService = { createFromCluster: jest.fn().mockResolvedValue(undefined) };
        const service = new TicketClusteringService(prisma as any, ai as any, {} as any, faqService as any);

        await (service as any).generateFaqFromCluster(['ticket-1']);

        const candidate = faqService.createFromCluster.mock.calls[0][0];
        expect(candidate.question).not.toContain('user@example.com');
        expect(candidate.answer).not.toContain('AB12CD34EF56');
    });
});
