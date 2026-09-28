import { describe, expect, it } from 'vitest';
import { getReviewCenterDefinition } from './review-center-registry';

describe('review center registry', () => {
    it.each([
        'live-chat-requests',
        'unassigned-tickets',
        'article-reviews',
        'faq-candidates',
        'crawler-candidates',
        'ai-interaction-history',
    ])('defines the backend item %s', (id) => {
        expect(getReviewCenterDefinition(id)).toEqual(expect.objectContaining({ id }));
    });

    it('fails closed for an unknown backend item', () => {
        expect(getReviewCenterDefinition('unknown-task')).toBeNull();
    });
});
