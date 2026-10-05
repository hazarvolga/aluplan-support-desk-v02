export const TICKET_LIFECYCLE_ACTIONS = [
    'TICKET_RESOLUTION_PROPOSED',
    'TICKET_RESOLUTION_CONFIRMED',
    'TICKET_RESOLUTION_CONTINUED',
    'TICKET_CLOSED_BY_STAFF',
    'TICKET_REOPENED',
    'TICKET_FEEDBACK_SUBMITTED',
    'AUTO_CLOSED_NO_RESPONSE',
] as const;

type LifecycleAction = typeof TICKET_LIFECYCLE_ACTIONS[number];

type LearningTicketRecord = {
    status: string;
    satisfactionScore: number | null;
    deletedAt: Date | null;
    messages: Array<{ metadata: unknown; createdAt: Date }>;
};

type LearningPrisma = {
    ticket: {
        findFirst(args: unknown): Promise<any>;
    };
};

type LifecycleEvent = {
    action: LifecycleAction;
    score?: number;
    createdAt: Date;
};

export type TicketLearningEligibility = {
    eligible: boolean;
    reason:
        | 'legacy-baseline'
        | 'current-cycle-feedback'
        | 'not-resolved'
        | 'low-score'
        | 'lifecycle-confirmation-required'
        | 'fresh-feedback-required'
        | 'invalid-feedback-score';
    cycleKey?: string;
    feedbackScore?: number;
};

const isLifecycleAction = (value: unknown): value is LifecycleAction =>
    typeof value === 'string' && (TICKET_LIFECYCLE_ACTIONS as readonly string[]).includes(value);

const parseLifecycleEvents = (messages: LearningTicketRecord['messages']): LifecycleEvent[] =>
    messages.flatMap((message) => {
        const metadata = message.metadata;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];

        const action = (metadata as Record<string, unknown>).action;
        if (!isLifecycleAction(action)) return [];

        const rawScore = (metadata as Record<string, unknown>).score;
        return [{
            action,
            ...(rawScore !== undefined ? { score: Number(rawScore) } : {}),
            createdAt: message.createdAt,
        }];
    }).sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

/**
 * Checks whether a ticket's current lifecycle can be used for KB/RAG learning.
 * Only scalar ticket state and lifecycle metadata are fetched; internal note text
 * is intentionally never selected here.
 */
export async function getTicketLearningEligibility(
    prisma: LearningPrisma,
    ticketId: string,
): Promise<TicketLearningEligibility> {
    const ticket = await prisma.ticket.findFirst({
        where: { id: ticketId, deletedAt: null },
        select: {
            status: true,
            satisfactionScore: true,
            deletedAt: true,
            messages: {
                where: { isInternal: true, deletedAt: null },
                select: { metadata: true, createdAt: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!ticket || ticket.deletedAt || !['RESOLVED', 'CLOSED'].includes(ticket.status)) {
        return { eligible: false, reason: 'not-resolved' };
    }

    if ((ticket.satisfactionScore ?? 0) < 4) {
        return { eligible: false, reason: 'low-score' };
    }

    const events = parseLifecycleEvents(ticket.messages);
    if (events.length === 0) {
        return { eligible: true, reason: 'legacy-baseline', feedbackScore: ticket.satisfactionScore ?? undefined };
    }

    const cycleBoundary = [...events]
        .reverse()
        .find(event => event.action === 'TICKET_REOPENED' || event.action === 'TICKET_RESOLUTION_CONTINUED');
    const cycleEvents = cycleBoundary
        ? events.filter(event => event.createdAt.getTime() > cycleBoundary.createdAt.getTime())
        : events;
    const confirmed = cycleEvents.some(event => event.action === 'TICKET_RESOLUTION_CONFIRMED');
    if (!confirmed) {
        return { eligible: false, reason: 'lifecycle-confirmation-required', cycleKey: cycleBoundary?.createdAt.toISOString() };
    }

    const feedback = cycleEvents.filter(event => event.action === 'TICKET_FEEDBACK_SUBMITTED').at(-1);
    if (!feedback) {
        return { eligible: false, reason: 'fresh-feedback-required', cycleKey: cycleBoundary?.createdAt.toISOString() };
    }

    const feedbackScore = feedback.score;
    if (typeof feedbackScore !== 'number' || !Number.isInteger(feedbackScore) || feedbackScore < 1 || feedbackScore > 5) {
        return { eligible: false, reason: 'invalid-feedback-score', cycleKey: cycleBoundary?.createdAt.toISOString() };
    }

    if (feedbackScore < 4) {
        return { eligible: false, reason: 'low-score', cycleKey: cycleBoundary?.createdAt.toISOString(), feedbackScore };
    }

    return {
        eligible: true,
        reason: 'current-cycle-feedback',
        cycleKey: cycleBoundary?.createdAt.toISOString(),
        feedbackScore,
    };
}
