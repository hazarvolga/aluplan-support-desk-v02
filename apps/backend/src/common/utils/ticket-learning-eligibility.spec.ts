import { getTicketLearningEligibility } from './ticket-learning-eligibility';

const time = (minutes: number) => new Date(`2026-10-05T00:${String(minutes).padStart(2, '0')}:00.000Z`);

const makePrisma = (ticket: any) => ({
    ticket: { findFirst: jest.fn().mockResolvedValue(ticket) },
});

describe('getTicketLearningEligibility', () => {
    it('preserves the legacy baseline when no lifecycle events exist', async () => {
        const prisma = makePrisma({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] });

        await expect(getTicketLearningEligibility(prisma, 'ticket-1')).resolves.toMatchObject({
            eligible: true,
            reason: 'legacy-baseline',
        });
    });

    it('rejects a historical high score after reopen without fresh confirmation and feedback', async () => {
        const prisma = makePrisma({
            status: 'CLOSED', satisfactionScore: 5, deletedAt: null,
            messages: [
                { metadata: { action: 'TICKET_RESOLUTION_CONFIRMED' }, createdAt: time(1) },
                { metadata: { action: 'TICKET_FEEDBACK_SUBMITTED', score: 5 }, createdAt: time(2) },
                { metadata: { action: 'TICKET_REOPENED' }, createdAt: time(3) },
                { metadata: { action: { notText: true }, score: 5 }, createdAt: time(4) },
            ],
        });

        await expect(getTicketLearningEligibility(prisma, 'ticket-1')).resolves.toMatchObject({
            eligible: false,
            reason: 'lifecycle-confirmation-required',
        });
    });

    it('accepts only explicit current-cycle confirmation and valid fresh feedback', async () => {
        const prisma = makePrisma({
            status: 'CLOSED', satisfactionScore: 5, deletedAt: null,
            messages: [
                { metadata: { action: 'TICKET_REOPENED' }, createdAt: time(1) },
                { metadata: { action: 'TICKET_RESOLUTION_CONFIRMED' }, createdAt: time(2) },
                { metadata: { action: 'TICKET_CLOSED_BY_STAFF' }, createdAt: time(3) },
                { metadata: { action: 'AUTO_CLOSED_NO_RESPONSE' }, createdAt: time(4) },
                { metadata: { action: 'TICKET_FEEDBACK_SUBMITTED', score: 4 }, createdAt: time(5) },
            ],
        });

        await expect(getTicketLearningEligibility(prisma, 'ticket-1')).resolves.toMatchObject({
            eligible: true,
            reason: 'current-cycle-feedback',
            feedbackScore: 4,
        });
    });

    it('rejects malformed feedback score and never selects internal note text', async () => {
        const prisma = makePrisma({
            status: 'RESOLVED', satisfactionScore: 5, deletedAt: null,
            messages: [
                { metadata: { action: 'TICKET_RESOLUTION_CONFIRMED' }, createdAt: time(1) },
                { metadata: { action: 'TICKET_FEEDBACK_SUBMITTED', score: 'not-a-score' }, createdAt: time(2) },
            ],
        });

        await expect(getTicketLearningEligibility(prisma, 'ticket-1')).resolves.toMatchObject({
            eligible: false,
            reason: 'invalid-feedback-score',
        });
        expect(prisma.ticket.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            select: expect.objectContaining({
                messages: expect.objectContaining({
                    select: { metadata: true, createdAt: true },
                }),
            }),
        }));
        expect(prisma.ticket.findFirst.mock.calls[0][0].select.messages.select).toEqual({
            metadata: true,
            createdAt: true,
        });
    });
});
