import { Injectable } from '@nestjs/common';
import {
    ArticleStatus,
    ChatStatus,
    CrawlCandidateStatus,
    FaqStatus,
    TicketStatus,
} from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';

export type ReviewCenterUser = {
    role?: string | { name?: string } | null;
    permissions?: string[];
};

export type ReviewCenterItem = {
    id: string;
    kind: 'ACTION' | 'AUDIT';
    group: 'OPERATIONAL' | 'EDITORIAL' | 'FOLLOW_UP';
    href: string;
    priority: 'URGENT' | 'NORMAL';
    count?: number;
};

export type ReviewCenterSummary = {
    items: ReviewCenterItem[];
    pendingActions: number;
};

const FAQ_REVIEW_ROLES = new Set([
    'ADMIN',
    'SUPPORT_MANAGER',
    'KB_EDITOR',
    'SUPPORT_AGENT',
]);

const CRAWLER_REVIEW_ROLES = new Set([
    'ADMIN',
    'SUPER_ADMIN',
    'MANAGER',
    'SUPPORT_MANAGER',
]);

const STAFF_ROLES = new Set([
    'ADMIN',
    'AGENT',
    'DEPARTMENT_MANAGER',
    'KB_EDITOR',
    'MANAGER',
    'SENIOR_AGENT',
    'SUPER_ADMIN',
    'SUPERUSER',
    'SUPPORT_AGENT',
    'SUPPORT_MANAGER',
    'TEAM_LEAD',
]);

function normalizeRoleName(role: ReviewCenterUser['role']): string {
    const rawRole = typeof role === 'string' ? role : role?.name;
    return typeof rawRole === 'string'
        ? rawRole.trim().replace(/-/g, '_').toUpperCase()
        : '';
}

@Injectable()
export class ReviewCenterService {
    constructor(private readonly prisma: PrismaService) { }

    async getSummary(user: ReviewCenterUser): Promise<ReviewCenterSummary> {
        const permissions = new Set(user.permissions ?? []);
        const role = normalizeRoleName(user.role);
        const hasWildcard = permissions.has('*') || permissions.has('admin');
        const hasPermission = (permission: string) =>
            hasWildcard || permissions.has(permission);
        const hasAllPermissions = (...required: string[]) =>
            required.every(hasPermission);
        const hasRole = (allowedRoles: ReadonlySet<string>) =>
            permissions.has('*') || allowedRoles.has(role);
        const isStaff = STAFF_ROLES.has(role);

        const itemPromises: Array<Promise<ReviewCenterItem>> = [];

        if (isStaff && hasAllPermissions('ticket:read', 'ticket:update')) {
            itemPromises.push(this.countedItem(
                {
                    id: 'live-chat-requests',
                    kind: 'ACTION',
                    group: 'OPERATIONAL',
                    href: '/tickets?chatStatus=REQUESTED&activeOnly=true',
                    priority: 'URGENT',
                },
                this.prisma.ticket.count({
                    where: {
                        chatStatus: ChatStatus.REQUESTED,
                        status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
                        deletedAt: null,
                    },
                }),
            ));
        }

        if (isStaff && hasAllPermissions('ticket:read', 'ticket:assign')) {
            itemPromises.push(this.countedItem(
                {
                    id: 'unassigned-tickets',
                    kind: 'ACTION',
                    group: 'OPERATIONAL',
                    href: '/tickets?assignment=UNASSIGNED&activeOnly=true',
                    priority: 'URGENT',
                },
                this.prisma.ticket.count({
                    where: {
                        assignedTo: null,
                        status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
                        deletedAt: null,
                    },
                }),
            ));
        }

        if (hasAllPermissions('kb:read', 'kb:approve')) {
            itemPromises.push(this.countedItem(
                {
                    id: 'article-reviews',
                    kind: 'ACTION',
                    group: 'EDITORIAL',
                    href: '/knowledge-base?status=REVIEW',
                    priority: 'NORMAL',
                },
                this.prisma.knowledgeArticle.count({
                    where: {
                        status: ArticleStatus.REVIEW,
                        deletedAt: null,
                        isAutoImported: false,
                    },
                }),
            ));
        }

        if (hasRole(FAQ_REVIEW_ROLES) && hasPermission('faq:review')) {
            itemPromises.push(this.countedItem(
                {
                    id: 'faq-candidates',
                    kind: 'ACTION',
                    group: 'EDITORIAL',
                    href: '/kb-approvals',
                    priority: 'NORMAL',
                },
                this.prisma.faqEntry.count({
                    where: { status: FaqStatus.PENDING_REVIEW, deletedAt: null },
                }),
            ));
        }

        if (hasRole(CRAWLER_REVIEW_ROLES)) {
            itemPromises.push(this.countedItem(
                {
                    id: 'crawler-candidates',
                    kind: 'ACTION',
                    group: 'EDITORIAL',
                    href: '/knowledge-pool?tab=crawler&status=PENDING_REVIEW',
                    priority: 'NORMAL',
                },
                this.prisma.crawlCandidate.count({
                    where: { status: CrawlCandidateStatus.PENDING_REVIEW },
                }),
            ));
        }

        const items = await Promise.all(itemPromises);

        if (hasPermission('ai-interactions:read')) {
            items.push({
                id: 'ai-interaction-history',
                kind: 'AUDIT',
                group: 'FOLLOW_UP',
                href: '/admin/ai-interactions',
                priority: 'NORMAL',
            });
        }

        return {
            items,
            pendingActions: items.reduce(
                (total, item) => total + (item.kind === 'ACTION' ? item.count ?? 0 : 0),
                0,
            ),
        };
    }

    private async countedItem(
        item: Omit<ReviewCenterItem, 'count'>,
        countPromise: Promise<number>,
    ): Promise<ReviewCenterItem> {
        return {
            ...item,
            count: await countPromise,
        };
    }
}
