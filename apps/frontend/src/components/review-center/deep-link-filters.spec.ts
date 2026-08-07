import { describe, expect, it } from 'vitest';
import {
    getKnowledgeBaseDeepLink,
    getKnowledgePoolDeepLink,
    getTicketQueueDeepLink,
} from './deep-link-filters';

describe('review center deep-link filters', () => {
    it('accepts the two supported ticket work queues', () => {
        expect(getTicketQueueDeepLink(new URLSearchParams('chatStatus=REQUESTED'))).toEqual({
            chatStatus: 'REQUESTED',
            assignment: undefined,
            activeOnly: undefined,
        });
        expect(getTicketQueueDeepLink(new URLSearchParams('assignment=UNASSIGNED&activeOnly=true'))).toEqual({
            chatStatus: undefined,
            assignment: 'UNASSIGNED',
            activeOnly: true,
        });
    });

    it('fails closed for unsupported ticket query values', () => {
        expect(getTicketQueueDeepLink(new URLSearchParams('chatStatus=LIVE&assignment=ALL'))).toEqual({
            chatStatus: undefined,
            assignment: undefined,
            activeOnly: undefined,
        });
    });

    it('opens the article review and crawler approval queues', () => {
        expect(getKnowledgeBaseDeepLink(new URLSearchParams('status=REVIEW'))).toBe('REVIEW');
        expect(getKnowledgePoolDeepLink(new URLSearchParams('tab=crawler&status=PENDING_REVIEW'))).toEqual({
            tab: 'crawler',
            status: 'PENDING_REVIEW',
        });
    });
});
