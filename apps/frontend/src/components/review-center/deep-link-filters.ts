export type TicketQueueDeepLink = {
    chatStatus?: 'REQUESTED';
    assignment?: 'UNASSIGNED';
};

export function getTicketQueueDeepLink(params: URLSearchParams): TicketQueueDeepLink {
    return {
        chatStatus: params.get('chatStatus') === 'REQUESTED' ? 'REQUESTED' : undefined,
        assignment: params.get('assignment') === 'UNASSIGNED' ? 'UNASSIGNED' : undefined,
    };
}

export function getKnowledgeBaseDeepLink(params: URLSearchParams): 'REVIEW' | 'PUBLISHED' {
    return params.get('status') === 'REVIEW' ? 'REVIEW' : 'PUBLISHED';
}

export function getKnowledgePoolDeepLink(params: URLSearchParams): {
    tab: 'crawler' | 'sources';
    status: 'PENDING_REVIEW';
} {
    const isCrawlerReview = params.get('tab') === 'crawler'
        && params.get('status') === 'PENDING_REVIEW';
    return {
        tab: isCrawlerReview ? 'crawler' : 'sources',
        status: 'PENDING_REVIEW',
    };
}
