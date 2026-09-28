import {
    BookCheck,
    Globe2,
    History,
    MessageSquareQuote,
    MessagesSquare,
    UserRoundSearch,
    type LucideIcon,
} from 'lucide-react';

export type ReviewCenterDefinition = {
    id: string;
    icon: LucideIcon;
    titleKey: string;
    descriptionKey: string;
    reasonKey: string;
};

const DEFINITIONS: Record<string, ReviewCenterDefinition> = {
    'live-chat-requests': {
        id: 'live-chat-requests',
        icon: MessagesSquare,
        titleKey: 'items.live-chat-requests.title',
        descriptionKey: 'items.live-chat-requests.description',
        reasonKey: 'items.live-chat-requests.reason',
    },
    'unassigned-tickets': {
        id: 'unassigned-tickets',
        icon: UserRoundSearch,
        titleKey: 'items.unassigned-tickets.title',
        descriptionKey: 'items.unassigned-tickets.description',
        reasonKey: 'items.unassigned-tickets.reason',
    },
    'article-reviews': {
        id: 'article-reviews',
        icon: BookCheck,
        titleKey: 'items.article-reviews.title',
        descriptionKey: 'items.article-reviews.description',
        reasonKey: 'items.article-reviews.reason',
    },
    'faq-candidates': {
        id: 'faq-candidates',
        icon: MessageSquareQuote,
        titleKey: 'items.faq-candidates.title',
        descriptionKey: 'items.faq-candidates.description',
        reasonKey: 'items.faq-candidates.reason',
    },
    'crawler-candidates': {
        id: 'crawler-candidates',
        icon: Globe2,
        titleKey: 'items.crawler-candidates.title',
        descriptionKey: 'items.crawler-candidates.description',
        reasonKey: 'items.crawler-candidates.reason',
    },
    'ai-interaction-history': {
        id: 'ai-interaction-history',
        icon: History,
        titleKey: 'items.ai-interaction-history.title',
        descriptionKey: 'items.ai-interaction-history.description',
        reasonKey: 'items.ai-interaction-history.reason',
    },
};

export function getReviewCenterDefinition(id: string): ReviewCenterDefinition | null {
    return DEFINITIONS[id] ?? null;
}
