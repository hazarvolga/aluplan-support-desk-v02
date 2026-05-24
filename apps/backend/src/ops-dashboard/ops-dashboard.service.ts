import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
    AgentStatus,
    CrawlCandidateStatus,
    KnowledgeSourceStatus,
    TicketStatus,
} from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';

type RoleLike = string | { name?: string | null } | null | undefined;

type TrendPoint = {
    date: string;
    label: string;
    [key: string]: string | number;
};

type OpsModalRecord = {
    id: string;
    title: string;
    description: string;
    href: string;
    status?: string | null;
    meta?: Record<string, string | number | null>;
};

type OpsModalSegment = {
    key: string;
    intent: 'period' | 'breakdown' | 'filter';
    series: TrendPoint[];
    metrics: Record<string, number>;
    records: OpsModalRecord[];
    decision: { level: 'ok' | 'info' | 'warning' | 'critical'; title: string; description: string };
};

type OpsDashboardRequest = {
    requesterRole?: RoleLike;
    days?: number;
};

type CrmChangeRow = {
    id: string;
    entityType: string;
    entityId: string;
    localRecordId: string | null;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    source: string;
    status: string;
    changedAt: Date;
};

const ACTIVE_TICKET_STATUSES = [
    TicketStatus.NEW,
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.PENDING_CUSTOMER,
    TicketStatus.PENDING_CUSTOMER_REVIEW,
];

@Injectable()
export class OpsDashboardService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('knowledge-sync') private readonly knowledgeQueue: Queue,
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
    ) { }

    async getOverview(options: OpsDashboardRequest = {}) {
        const days = this.normalizeDays(options.days);
        const now = new Date();
        const todayStart = this.startOfDay(now);
        const trendStart = this.addDays(todayStart, -(days - 1));
        const thirtyDaysAgo = this.addDays(now, -30);
        const canViewCost = this.canViewCost(options.requesterRole);

        const [
            ticketKpis,
            ticketTrend,
            activeTickets,
            actionQueue,
            aiCost,
            aiQuality,
            aiTrend,
            crmSummary,
            knowledgeSummary,
            learnNowSummary,
            queueSummary,
            systemSummary,
            liveFeed,
            modalDetails,
        ] = await Promise.all([
            this.getTicketKpis(todayStart),
            this.getTicketTrend(trendStart, todayStart, days),
            this.getActiveTickets(),
            this.getActionQueue(todayStart),
            canViewCost ? this.getAiCost(todayStart, thirtyDaysAgo) : Promise.resolve(null),
            this.getAiQuality(thirtyDaysAgo),
            this.getAiTrend(trendStart, todayStart, days),
            this.getCrmSummary(todayStart, trendStart, days),
            this.getKnowledgeSummary(todayStart, trendStart, days),
            this.getLearnNowSummary(),
            this.getQueueSummary(),
            this.getSystemSummary(thirtyDaysAgo),
            this.getLiveFeed(),
            this.getPulseModalDetails(todayStart, trendStart, days),
        ]);

        const decision = this.buildDecision(ticketKpis, aiQuality, crmSummary, queueSummary, systemSummary);

        return {
            generatedAt: now.toISOString(),
            window: { days, todayStart: todayStart.toISOString(), trendStart: trendStart.toISOString() },
            kpis: {
                activeTickets: ticketKpis.active,
                unassignedTickets: ticketKpis.unassigned,
                crmUpdatesToday: crmSummary.updatedToday,
                crawlCandidates: learnNowSummary.pendingReview + knowledgeSummary.genericCandidatesPending,
                aiConfidence: aiQuality.confidenceRate,
                slaBreaches: ticketKpis.slaBreaches,
                resolvedToday: ticketKpis.resolvedToday,
            },
            decision,
            cost: aiCost,
            system: systemSummary,
            queues: queueSummary,
            activeDesk: {
                total: ticketKpis.active,
                tickets: activeTickets,
                trend: ticketTrend,
            },
            actions: actionQueue,
            pulse: {
                ticketTrend,
                aiQuality: {
                    summary: aiQuality,
                    trend: aiTrend,
                },
                crm: crmSummary,
                knowledge: knowledgeSummary,
                details: modalDetails,
            },
            learnNow: learnNowSummary,
            liveFeed,
        };
    }

    private async getPulseModalDetails(todayStart: Date, trendStart: Date, days: number) {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const thirtyDayStart = this.addDays(todayStart, -29);

        const [tickets, ai, crm, knowledge] = await Promise.all([
            this.getTicketModalSegments(todayStart, trendStart, thirtyDayStart, last24h, days),
            this.getAiModalSegments(trendStart, thirtyDayStart, days),
            this.getCrmModalSegments(todayStart, trendStart, last24h, days),
            this.getKnowledgeModalSegments(todayStart, trendStart, days),
        ]);

        return { tickets, ai, crm, knowledge };
    }

    private async getTicketKpis(todayStart: Date) {
        const activeWhere = { deletedAt: null, status: { in: ACTIVE_TICKET_STATUSES } };
        const [active, unassigned, slaBreaches, resolvedToday] = await Promise.all([
            this.prisma.ticket.count({ where: activeWhere }),
            this.prisma.ticket.count({ where: { ...activeWhere, assignedTo: null } }),
            this.prisma.ticket.count({ where: { ...activeWhere, isSlaBreached: true } }),
            this.prisma.ticket.count({ where: { deletedAt: null, status: TicketStatus.RESOLVED, resolvedAt: { gte: todayStart } } }),
        ]);

        return { active, unassigned, slaBreaches, resolvedToday };
    }

    private async getActiveTickets() {
        const rows = await this.prisma.ticket.findMany({
            where: { deletedAt: null, status: { in: ACTIVE_TICKET_STATUSES } },
            orderBy: [{ isSlaBreached: 'desc' }, { createdAt: 'desc' }],
            take: 12,
            select: {
                id: true,
                ticketNumber: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true,
                slaResponseDue: true,
                slaResolveDue: true,
                isSlaBreached: true,
                creator: {
                    select: {
                        fullName: true,
                        email: true,
                        customerProfile: { select: { companyName: true, isVip: true } },
                    },
                },
                assignee: { select: { fullName: true, email: true } },
                department: { select: { id: true, name: true, slug: true } },
            },
        });

        return rows.map((ticket) => ({
            ...ticket,
            createdAt: ticket.createdAt.toISOString(),
            updatedAt: ticket.updatedAt.toISOString(),
            slaResponseDue: ticket.slaResponseDue?.toISOString() ?? null,
            slaResolveDue: ticket.slaResolveDue?.toISOString() ?? null,
        }));
    }

    private async getActionQueue(todayStart: Date) {
        const now = new Date();
        const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const activeWhere = { deletedAt: null, status: { in: ACTIVE_TICKET_STATUSES } };

        const [unassigned, slaRisk, lowConfidence, crawlerReview, crmFailures] = await Promise.all([
            this.prisma.ticket.count({ where: { ...activeWhere, assignedTo: null } }),
            this.prisma.ticket.count({
                where: {
                    ...activeWhere,
                    isSlaBreached: false,
                    OR: [
                        { slaResponseDue: { gte: now, lte: soon }, slaRespondedAt: null },
                        { slaResolveDue: { gte: now, lte: soon } },
                    ],
                },
            }),
            this.prisma.aiInteraction.count({
                where: {
                    createdAt: { gte: todayStart },
                    OR: [{ confidenceBand: 'LOW' }, { confidenceBand: null }],
                },
            }),
            this.prisma.crawlCandidate.count({ where: { status: CrawlCandidateStatus.PENDING_REVIEW } }),
            this.prisma.crmChangeLog.count({ where: { status: { not: 'SUCCESS' }, changedAt: { gte: todayStart } } }),
        ]);

        return [
            { id: 'unassigned', severity: unassigned > 0 ? 'warning' : 'ok', count: unassigned, href: '/tickets?assignedTo=unassigned' },
            { id: 'sla_risk', severity: slaRisk > 0 ? 'critical' : 'ok', count: slaRisk, href: '/tickets?isSlaBreached=false' },
            { id: 'low_confidence_ai', severity: lowConfidence > 0 ? 'warning' : 'ok', count: lowConfidence, href: '/admin/ai-health' },
            { id: 'crawler_review', severity: crawlerReview > 0 ? 'info' : 'ok', count: crawlerReview, href: '/knowledge-pool?tab=candidates' },
            { id: 'crm_failures', severity: crmFailures > 0 ? 'critical' : 'ok', count: crmFailures, href: '/customers/crm' },
        ];
    }

    private async getAiCost(todayStart: Date, thirtyDaysAgo: Date) {
        const [today, month, providers] = await Promise.all([
            this.prisma.aiInteraction.aggregate({
                where: { createdAt: { gte: todayStart } },
                _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
                _count: { id: true },
            }),
            this.prisma.aiInteraction.aggregate({
                where: { createdAt: { gte: thirtyDaysAgo } },
                _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
                _count: { id: true },
            }),
            this.prisma.aiInteraction.groupBy({
                by: ['provider', 'model'],
                where: { createdAt: { gte: thirtyDaysAgo } },
                _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 6,
            }),
        ]);

        return {
            currency: 'USD',
            source: 'estimated_from_ai_interactions',
            today: this.formatAiAggregate(today),
            rolling30d: this.formatAiAggregate(month),
            providers: providers.map((provider) => ({
                provider: provider.provider ?? 'unknown',
                model: provider.model ?? 'unknown',
                requests: provider._count.id,
                inputTokens: provider._sum.inputTokens ?? 0,
                outputTokens: provider._sum.outputTokens ?? 0,
                totalTokens: provider._sum.totalTokens ?? 0,
                estimatedCost: this.toNumber(provider._sum.estimatedCost),
            })),
        };
    }

    private async getAiQuality(thirtyDaysAgo: Date) {
        const [total, high, medium, low, noMatch, ticketCreated, accepted, sourceLeaks, languageRisks] = await Promise.all([
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, confidenceBand: 'HIGH' } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, confidenceBand: 'MEDIUM' } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, confidenceBand: 'LOW' } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, confidenceBand: null } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, ticketCreated: true } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, isAccepted: true } }),
            this.prisma.aiInteraction.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                    responseGenerated: { contains: 'Source:', mode: 'insensitive' },
                },
            }),
            this.prisma.aiInteraction.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                    userContext: { path: ['languageRisk'], equals: true },
                },
            }),
        ]);

        return {
            total,
            high,
            medium,
            low,
            noMatch,
            ticketCreated,
            accepted,
            sourceLeaks,
            languageRisks,
            confidenceRate: total > 0 ? Math.round((high / total) * 100) : 0,
            fallbackRate: total > 0 ? Math.round(((low + noMatch) / total) * 100) : 0,
            deflectionRate: total > 0 ? Math.round(((total - ticketCreated) / total) * 100) : 0,
        };
    }

    private async getCrmSummary(todayStart: Date, trendStart: Date, days: number) {
        const [updatedToday, failuresToday, recentChanges, trend] = await Promise.all([
            this.prisma.crmChangeLog.count({ where: { changedAt: { gte: todayStart } } }),
            this.prisma.crmChangeLog.count({ where: { changedAt: { gte: todayStart }, status: { not: 'SUCCESS' } } }),
            this.prisma.crmChangeLog.findMany({
                orderBy: { changedAt: 'desc' },
                take: 8,
                select: {
                    id: true,
                    entityType: true,
                    entityId: true,
                    localRecordId: true,
                    fieldName: true,
                    status: true,
                    changedAt: true,
                    oldValue: true,
                    newValue: true,
                    source: true,
                },
            }),
            this.getDailyCountTrend('crm_change_logs', 'changed_at', trendStart, days),
        ]);
        const enrichedChanges = await this.enrichCrmChanges(recentChanges);

        return {
            updatedToday,
            failuresToday,
            trend,
            recentChanges: enrichedChanges,
        };
    }

    private async getKnowledgeSummary(todayStart: Date, trendStart: Date, days: number) {
        const [sourcesByStatus, syncFailuresToday, embeddings, genericCandidatesPending, datasetSources, trend] = await Promise.all([
            this.prisma.knowledgeSource.groupBy({ by: ['status'], _count: { id: true } }),
            this.prisma.knowledgeSourceSyncLog.count({ where: { syncStartedAt: { gte: todayStart }, status: { in: ['FAILED', 'PAUSED_BUDGET'] } } }),
            this.prisma.knowledgePoolEmbedding.count(),
            this.prisma.crawlCandidate.count({ where: { source: 'generic_web', status: CrawlCandidateStatus.PENDING_REVIEW } }),
            this.prisma.knowledgeSource.count({
                where: {
                    OR: [
                        { metadata: { path: ['source'], equals: 'dataset' } },
                        { metadata: { path: ['origin'], equals: 'dataset' } },
                    ],
                },
            }),
            this.getDailyCountTrend('knowledge_sources', 'created_at', trendStart, days),
        ]);

        return {
            sourcesByStatus: this.countMap(sourcesByStatus, 'status'),
            activeSources: sourcesByStatus.find((row) => row.status === KnowledgeSourceStatus.ACTIVE)?._count.id ?? 0,
            syncFailuresToday,
            embeddings,
            genericCandidatesPending,
            datasetSources,
            trend,
        };
    }

    private async getLearnNowSummary() {
        const [byStatus, byFormat, recent] = await Promise.all([
            this.prisma.crawlCandidate.groupBy({
                by: ['status'],
                where: { source: 'learnnow' },
                _count: { id: true },
            }),
            this.prisma.crawlCandidate.groupBy({
                by: ['format'],
                where: { source: 'learnnow' },
                _count: { id: true },
            }),
            this.prisma.crawlCandidate.findMany({
                where: { source: 'learnnow' },
                orderBy: { updatedAt: 'desc' },
                take: 8,
                select: { id: true, title: true, status: true, format: true, language: true, sourceUrl: true, updatedAt: true },
            }),
        ]);

        const statusMap = this.countMap(byStatus, 'status');
        return {
            byStatus: statusMap,
            byFormat: this.countMap(byFormat, 'format'),
            pendingReview: statusMap[CrawlCandidateStatus.PENDING_REVIEW] ?? 0,
            recent: recent.map((candidate) => ({
                ...candidate,
                updatedAt: candidate.updatedAt.toISOString(),
            })),
        };
    }

    private async getSystemSummary(thirtyDaysAgo: Date) {
        const [events, activeAgents, dndAgents, recentErrors] = await Promise.all([
            this.prisma.aiHealthEvent.groupBy({
                by: ['eventType'],
                where: { createdAt: { gte: thirtyDaysAgo } },
                _count: { id: true },
            }),
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    deletedAt: null,
                    agentStatus: AgentStatus.ONLINE,
                    role: { name: { not: 'CUSTOMER', mode: 'insensitive' } },
                },
            }),
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    deletedAt: null,
                    agentStatus: AgentStatus.DND,
                    role: { name: { not: 'CUSTOMER', mode: 'insensitive' } },
                },
            }),
            this.prisma.aiHealthEvent.findMany({
                where: { createdAt: { gte: thirtyDaysAgo }, eventType: { in: ['ERROR', 'TIMEOUT', 'FALLBACK'] } },
                orderBy: { createdAt: 'desc' },
                take: 6,
                select: { id: true, eventType: true, provider: true, model: true, task: true, errorMessage: true, createdAt: true },
            }),
        ]);

        const eventCounts = this.countMap(events, 'eventType');
        const criticalEvents = (eventCounts.ERROR ?? 0) + (eventCounts.TIMEOUT ?? 0);
        return {
            status: criticalEvents > 0 ? 'DEGRADED' : 'HEALTHY',
            aiEvents: eventCounts,
            activeAgents,
            dndAgents,
            recentErrors: recentErrors.map((event) => ({
                ...event,
                createdAt: event.createdAt.toISOString(),
            })),
        };
    }

    private async getQueueSummary() {
        const [knowledge, crm, ai] = await Promise.all([
            this.queueCounts(this.knowledgeQueue),
            this.queueCounts(this.crmQueue),
            this.queueCounts(this.aiQueue),
        ]);

        return { knowledge, crm, ai };
    }

    private async getLiveFeed() {
        const [tickets, crm, ai, crawls] = await Promise.all([
            this.prisma.ticket.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, ticketNumber: true, subject: true, status: true, createdAt: true },
            }),
            this.prisma.crmChangeLog.findMany({
                orderBy: { changedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    entityType: true,
                    entityId: true,
                    localRecordId: true,
                    fieldName: true,
                    status: true,
                    changedAt: true,
                    oldValue: true,
                    newValue: true,
                    source: true,
                },
            }),
            this.prisma.aiHealthEvent.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, eventType: true, provider: true, task: true, createdAt: true },
            }),
            this.prisma.crawlCandidate.findMany({
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: { id: true, title: true, source: true, status: true, updatedAt: true },
            }),
        ]);
        const enrichedCrm = await this.enrichCrmChanges(crm);

        return [
            ...tickets.map((ticket) => ({
                id: `ticket-${ticket.id}`,
                type: 'ticket',
                title: ticket.ticketNumber,
                description: ticket.subject,
                status: ticket.status,
                at: ticket.createdAt.toISOString(),
                href: `/tickets/${ticket.id}`,
            })),
            ...enrichedCrm.map((change) => ({
                id: `crm-${change.id}`,
                type: 'crm',
                title: change.displayName,
                description: [change.companyName, change.changeSummary, change.status].filter(Boolean).join(' / '),
                status: change.status,
                at: change.changedAt,
                href: change.href,
            })),
            ...ai.map((event) => ({
                id: `ai-${event.id}`,
                type: 'ai',
                title: event.eventType,
                description: `${event.provider}${event.task ? ` / ${event.task}` : ''}`,
                status: event.eventType,
                at: event.createdAt.toISOString(),
                href: '/admin/ai-health',
            })),
            ...crawls.map((candidate) => ({
                id: `crawl-${candidate.id}`,
                type: 'crawl',
                title: candidate.title,
                description: candidate.source,
                status: candidate.status,
                at: candidate.updatedAt.toISOString(),
                href: '/knowledge-pool?tab=candidates',
            })),
        ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 14);
    }

    private async enrichCrmChanges(changes: CrmChangeRow[]) {
        if (changes.length === 0) return [];

        const contactChanges = changes.filter((change) => change.entityType.toLowerCase() === 'contact');
        const accountChanges = changes.filter((change) => change.entityType.toLowerCase() === 'account');
        const contactLocalIds = this.uniqueValues(contactChanges.map((change) => change.localRecordId));
        const accountLocalIds = this.uniqueValues(accountChanges.map((change) => change.localRecordId));
        const contactExternalIds = this.uniqueValues(contactChanges.map((change) => change.entityId));
        const accountExternalIds = this.uniqueValues(accountChanges.map((change) => change.entityId));

        const contactWhere = [
            contactLocalIds.length ? { id: { in: contactLocalIds } } : null,
            contactExternalIds.length ? { externalContactId: { in: contactExternalIds } } : null,
        ].filter(Boolean) as Array<Record<string, any>>;
        const accountWhere = [
            accountLocalIds.length ? { id: { in: accountLocalIds } } : null,
            accountExternalIds.length ? { externalAccountId: { in: accountExternalIds } } : null,
        ].filter(Boolean) as Array<Record<string, any>>;

        const [contacts, accounts]: [
            Array<{ id: string; firstName: string; lastName: string; companyName: string; externalContactId: string | null; user: { email: string; fullName: string | null } }>,
            Array<{ id: string; name: string; externalAccountId: string | null; phone: string | null }>,
        ] = await Promise.all([
            contactWhere.length
                ? this.prisma.customerProfile.findMany({
                    where: { OR: contactWhere },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        externalContactId: true,
                        user: { select: { email: true, fullName: true } },
                    },
                })
                : Promise.resolve([]),
            accountWhere.length
                ? this.prisma.crmAccount.findMany({
                    where: { OR: accountWhere },
                    select: {
                        id: true,
                        name: true,
                        externalAccountId: true,
                        phone: true,
                    },
                })
                : Promise.resolve([]),
        ]);

        const contactsByKey = new Map<string, (typeof contacts)[number]>();
        contacts.forEach((contact) => {
            contactsByKey.set(contact.id, contact);
            if (contact.externalContactId) contactsByKey.set(contact.externalContactId, contact);
        });

        const accountsByKey = new Map<string, (typeof accounts)[number]>();
        accounts.forEach((account) => {
            accountsByKey.set(account.id, account);
            if (account.externalAccountId) accountsByKey.set(account.externalAccountId, account);
        });

        return changes.map((change) => {
            const entityType = change.entityType.toLowerCase();
            const lookupKeys = [change.localRecordId, change.entityId].filter(Boolean) as string[];
            const contact = entityType === 'contact'
                ? lookupKeys.map((key) => contactsByKey.get(key)).find(Boolean)
                : null;
            const account = entityType === 'account'
                ? lookupKeys.map((key) => accountsByKey.get(key)).find(Boolean)
                : null;
            const contactName = contact
                ? [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || contact.user?.fullName || null
                : null;
            const displayName = contactName || account?.name || `${change.entityType} ${change.entityId}`;
            const href = contact
                ? `/customers/${contact.id}`
                : account
                    ? `/customers/accounts/${account.id}`
                    : '/customers/crm';

            return {
                ...change,
                changedAt: change.changedAt.toISOString(),
                displayName,
                companyName: contact?.companyName ?? account?.name ?? null,
                email: contact?.user?.email ?? null,
                action: this.describeCrmAction(change),
                fieldLabel: change.fieldName,
                changeSummary: this.buildCrmChangeSummary(change),
                href,
            };
        });
    }

    private async getTicketModalSegments(todayStart: Date, trendStart: Date, thirtyDayStart: Date, last24h: Date, days: number) {
        const [last7Trend, last24Trend, last30Trend, departmentTrend, last7Records, last24Records, last30Records, departmentRows] = await Promise.all([
            this.getTicketTrend(trendStart, todayStart, days),
            this.getHourlyTicketTrend(last24h),
            this.getTicketTrend(thirtyDayStart, todayStart, 30),
            this.getTicketDepartmentTrend(),
            this.getTicketRecords({ createdAt: { gte: trendStart } }, 8),
            this.getTicketRecords({ createdAt: { gte: last24h } }, 8),
            this.getTicketRecords({ createdAt: { gte: thirtyDayStart } }, 8),
            this.getTicketDepartmentRows(),
        ]);

        return {
            defaultKey: '7d',
            segments: [
                this.buildTicketSegment('7d', 'period', last7Trend, last7Records),
                this.buildTicketSegment('24h', 'period', last24Trend, last24Records),
                this.buildTicketSegment('30d', 'period', last30Trend, last30Records),
                this.buildTicketSegment('department', 'breakdown', departmentTrend, departmentRows),
            ],
        };
    }

    private async getAiModalSegments(trendStart: Date, thirtyDayStart: Date, days: number) {
        const [last7Trend, providerRows, languageRows, problemRows, summary] = await Promise.all([
            this.getAiTrend(trendStart, this.startOfDay(new Date()), days),
            this.getAiProviderRows(thirtyDayStart),
            this.getAiLanguageRows(thirtyDayStart),
            this.getProblemAiTraceRows(thirtyDayStart),
            this.getAiQuality(thirtyDayStart),
        ]);

        return {
            defaultKey: '7d',
            segments: [
                this.buildAiSegment('7d', 'period', last7Trend, this.aiRowsToRecords(problemRows.slice(0, 5)), summary),
                this.buildAiSegment('provider', 'breakdown', this.rowsToTrend(providerRows), providerRows, summary),
                this.buildAiSegment('language', 'breakdown', this.rowsToTrend(languageRows), languageRows, summary),
                this.buildAiSegment('problem_traces', 'filter', this.rowsToTrend(problemRows), this.aiRowsToRecords(problemRows), summary),
            ],
        };
    }

    private async getCrmModalSegments(todayStart: Date, trendStart: Date, last24h: Date, days: number) {
        const [trend, allRecent, failedRecent, missingEmailRecent, accountMismatchRecent] = await Promise.all([
            this.getDailyCountTrend('crm_change_logs', 'changed_at', trendStart, days),
            this.getCrmChangeRecords({ changedAt: { gte: last24h } }, 12),
            this.getCrmChangeRecords({ changedAt: { gte: trendStart }, status: { not: 'SUCCESS' } }, 12),
            this.getCrmChangeRecords({ changedAt: { gte: trendStart }, entityType: 'contact', fieldName: { in: ['email', 'emailaddress1', 'rawCrmPayload'] } }, 12),
            this.getCrmChangeRecords({ changedAt: { gte: trendStart }, entityType: 'contact', localRecordId: null }, 12),
        ]);

        return {
            defaultKey: '24h',
            segments: [
                this.buildCrmSegment('24h', 'period', trend, allRecent, todayStart),
                this.buildCrmSegment('failed', 'filter', trend, failedRecent, todayStart),
                this.buildCrmSegment('missing_email', 'filter', trend, missingEmailRecent.filter((item) => !item.meta?.email || String(item.meta?.fieldName ?? '').toLowerCase().includes('email')), todayStart),
                this.buildCrmSegment('account_matching', 'filter', trend, accountMismatchRecent, todayStart),
            ],
        };
    }

    private async getKnowledgeModalSegments(todayStart: Date, trendStart: Date, days: number) {
        const [trend, learnNow, reviewRequired, failedImports, summary] = await Promise.all([
            this.getDailyCountTrend('knowledge_sources', 'created_at', trendStart, days),
            this.getCrawlerRecords({ source: 'learnnow' }, 10),
            this.getCrawlerRecords({ status: CrawlCandidateStatus.PENDING_REVIEW }, 10),
            this.getCrawlerRecords({ status: CrawlCandidateStatus.FAILED }, 10),
            this.getKnowledgeSummary(todayStart, trendStart, days),
        ]);

        return {
            defaultKey: '7d',
            segments: [
                this.buildKnowledgeSegment('7d', 'period', trend, learnNow.slice(0, 5), summary),
                this.buildKnowledgeSegment('learnnow', 'filter', this.rowsToTrend(learnNow), learnNow, summary),
                this.buildKnowledgeSegment('review_required', 'filter', this.rowsToTrend(reviewRequired), reviewRequired, summary),
                this.buildKnowledgeSegment('failed_imports', 'filter', this.rowsToTrend(failedImports), failedImports, summary),
            ],
        };
    }

    private buildTicketSegment(key: string, intent: OpsModalSegment['intent'], series: TrendPoint[], records: OpsModalRecord[]): OpsModalSegment {
        const activeStatusSet = new Set<string>(ACTIVE_TICKET_STATUSES);
        const active = records.filter((record) => record.status && activeStatusSet.has(String(record.status))).length;
        const unassigned = records.filter((record) => String(record.meta?.assignee ?? '') === 'unassigned').length;
        const sla = records.filter((record) => Number(record.meta?.slaBreached ?? 0) > 0).length;
        const resolved = records.filter((record) => record.status === TicketStatus.RESOLVED).length;

        return {
            key,
            intent,
            series,
            metrics: { active, unassigned, sla, resolved },
            records,
            decision: {
                level: sla > 0 ? 'critical' : unassigned > 0 ? 'warning' : 'ok',
                title: sla > 0 ? 'SLA risk is visible in this slice.' : unassigned > 0 ? 'Assignment pressure exists in this slice.' : 'Ticket slice is operationally clean.',
                description: `${active} active, ${unassigned} unassigned, ${sla} SLA risk, ${resolved} resolved.`,
            },
        };
    }

    private buildAiSegment(key: string, intent: OpsModalSegment['intent'], series: TrendPoint[], records: OpsModalRecord[], summary: any): OpsModalSegment {
        const problemCount = records.filter((record) => record.status === 'LOW' || record.status === 'NO_MATCH' || record.meta?.languageRisk || record.meta?.sourceLeak).length;

        return {
            key,
            intent,
            series,
            metrics: {
                confidence: summary.confidenceRate ?? 0,
                fallback: summary.fallbackRate ?? 0,
                languageRisks: summary.languageRisks ?? 0,
                sourceLeaks: summary.sourceLeaks ?? 0,
                problemCount,
            },
            records,
            decision: {
                level: problemCount > 0 || (summary.fallbackRate ?? 0) > 30 ? 'warning' : 'ok',
                title: problemCount > 0 ? 'Problem traces need admin review.' : 'AI quality signal is stable.',
                description: `Confidence ${summary.confidenceRate ?? 0}%, fallback ${summary.fallbackRate ?? 0}%, ${problemCount} problematic traces in this view.`,
            },
        };
    }

    private buildCrmSegment(key: string, intent: OpsModalSegment['intent'], series: TrendPoint[], records: OpsModalRecord[], todayStart: Date): OpsModalSegment {
        const failures = records.filter((record) => record.status !== 'SUCCESS').length;
        const updates = records.filter((record) => new Date(String(record.meta?.changedAt ?? 0)).getTime() >= todayStart.getTime()).length;
        const missingEmail = records.filter((record) => !record.meta?.email).length;
        const unmatched = records.filter((record) => record.href === '/customers/crm').length;

        return {
            key,
            intent,
            series,
            metrics: { updates, failures, missingEmail, unmatched },
            records,
            decision: {
                level: failures > 0 || unmatched > 0 ? 'warning' : 'ok',
                title: failures > 0 ? 'CRM failures need attention.' : unmatched > 0 ? 'Some CRM records are not linked to portal profiles.' : 'CRM sync looks clean in this slice.',
                description: `${records.length} records, ${failures} failures, ${missingEmail} missing emails, ${unmatched} unmatched portal links.`,
            },
        };
    }

    private buildKnowledgeSegment(key: string, intent: OpsModalSegment['intent'], series: TrendPoint[], records: OpsModalRecord[], summary: any): OpsModalSegment {
        const failed = records.filter((record) => record.status === CrawlCandidateStatus.FAILED).length;
        const review = records.filter((record) => record.status === CrawlCandidateStatus.PENDING_REVIEW).length;

        return {
            key,
            intent,
            series,
            metrics: {
                sources: summary.activeSources ?? 0,
                embeddings: summary.embeddings ?? 0,
                candidates: summary.genericCandidatesPending ?? 0,
                failed,
                review,
            },
            records,
            decision: {
                level: failed > 0 ? 'warning' : review > 0 ? 'info' : 'ok',
                title: failed > 0 ? 'Failed imports are blocking the knowledge flow.' : review > 0 ? 'Review queue is waiting for operator decision.' : 'Knowledge flow is stable.',
                description: `${records.length} records, ${review} waiting for review, ${failed} failed imports.`,
            },
        };
    }

    private async getTicketRecords(where: Record<string, any>, take: number): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.ticket.findMany({
            where: { deletedAt: null, ...where },
            orderBy: { createdAt: 'desc' },
            take,
            select: {
                id: true,
                ticketNumber: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,
                isSlaBreached: true,
                creator: { select: { fullName: true, customerProfile: { select: { companyName: true } } } },
                assignee: { select: { fullName: true } },
                department: { select: { name: true } },
            },
        });

        return rows.map((ticket) => ({
            id: ticket.id,
            title: `${ticket.ticketNumber} · ${ticket.subject}`,
            description: [ticket.creator?.customerProfile?.companyName || ticket.creator?.fullName, ticket.department?.name, ticket.priority].filter(Boolean).join(' / '),
            href: `/tickets/${ticket.id}`,
            status: ticket.status,
            meta: {
                assignee: ticket.assignee?.fullName ?? 'unassigned',
                slaBreached: ticket.isSlaBreached ? 1 : 0,
                createdAt: ticket.createdAt.toISOString(),
            },
        }));
    }

    private async getTicketDepartmentRows(): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.$queryRaw<Array<{ department_id: string | null; department_name: string | null; active: number; unassigned: number; sla: number }>>`
            SELECT
                t.department_id,
                COALESCE(d.name, 'Unassigned') AS department_name,
                COUNT(*)::int AS active,
                SUM(CASE WHEN t.assigned_to IS NULL THEN 1 ELSE 0 END)::int AS unassigned,
                SUM(CASE WHEN t.is_sla_breached THEN 1 ELSE 0 END)::int AS sla
            FROM tickets t
            LEFT JOIN departments d ON d.id = t.department_id
            WHERE t.deleted_at IS NULL
              AND t.status IN ('NEW', 'OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_CUSTOMER_REVIEW')
            GROUP BY t.department_id, d.name
            ORDER BY active DESC
            LIMIT 10
        `;

        return rows.map((row, index) => ({
            id: row.department_id ?? `department-${index}`,
            title: row.department_name ?? 'Unassigned',
            description: `${this.toNumber(row.active)} active / ${this.toNumber(row.unassigned)} unassigned / ${this.toNumber(row.sla)} SLA`,
            href: row.department_id ? `/teams/departments/${row.department_id}` : '/tickets?assignedTo=unassigned',
            status: this.toNumber(row.sla) > 0 ? 'SLA_RISK' : this.toNumber(row.unassigned) > 0 ? 'ASSIGNMENT_RISK' : 'OK',
            meta: { assignee: this.toNumber(row.unassigned) > 0 ? 'unassigned' : 'assigned', slaBreached: this.toNumber(row.sla) },
        }));
    }

    private async getAiProviderRows(start: Date): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.aiInteraction.groupBy({
            by: ['provider', 'model'],
            where: { createdAt: { gte: start } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 8,
        });

        return rows.map((row, index) => ({
            id: `provider-${row.provider ?? 'unknown'}-${row.model ?? index}`,
            title: row.provider ?? 'unknown',
            description: `${row.model ?? 'unknown'} / ${row._count.id} request`,
            href: '/admin/ai-health',
            status: 'PROVIDER',
            meta: { count: row._count.id },
        }));
    }

    private async getAiLanguageRows(start: Date): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.aiInteraction.findMany({
            where: { createdAt: { gte: start } },
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: { id: true, userContext: true },
        });
        const counts = new Map<string, number>();
        rows.forEach((row) => {
            const context = (row.userContext ?? {}) as Record<string, any>;
            const language = String(context.routeLocale || context.profileLanguage || context.language || 'unknown').toLowerCase();
            counts.set(language, (counts.get(language) ?? 0) + 1);
        });

        return Array.from(counts.entries()).map(([language, count]) => ({
            id: `language-${language}`,
            title: language.toUpperCase(),
            description: `${count} AI interaction`,
            href: `/admin/ai-health?language=${encodeURIComponent(language)}`,
            status: 'LANGUAGE',
            meta: { count },
        }));
    }

    private async getProblemAiTraceRows(start: Date): Promise<any[]> {
        const rows = await this.prisma.aiInteraction.findMany({
            where: {
                createdAt: { gte: start },
                OR: [
                    { confidenceBand: 'LOW' },
                    { confidenceBand: null },
                    { responseGenerated: { contains: 'Source:', mode: 'insensitive' } },
                    { userContext: { path: ['languageRisk'], equals: true } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: {
                id: true,
                userQuery: true,
                confidenceBand: true,
                provider: true,
                model: true,
                responseGenerated: true,
                userContext: true,
                createdAt: true,
            },
        });

        return rows.map((row) => {
            const context = (row.userContext ?? {}) as Record<string, any>;
            const sourceLeak = Boolean(row.responseGenerated?.toLowerCase().includes('source:'));
            return {
                id: row.id,
                title: this.shortenText(row.userQuery) || 'AI trace',
                description: [row.provider, row.model, context.routeLocale || context.profileLanguage].filter(Boolean).join(' / '),
                href: '/admin/ai-health',
                status: row.confidenceBand ?? 'NO_MATCH',
                meta: {
                    languageRisk: context.languageRisk ? 1 : 0,
                    sourceLeak: sourceLeak ? 1 : 0,
                    count: 1,
                    createdAt: row.createdAt.toISOString(),
                },
            };
        });
    }

    private aiRowsToRecords(rows: any[]): OpsModalRecord[] {
        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            href: row.href,
            status: row.status,
            meta: row.meta,
        }));
    }

    private async getCrmChangeRecords(where: Record<string, any>, take: number): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.crmChangeLog.findMany({
            where,
            orderBy: { changedAt: 'desc' },
            take,
            select: {
                id: true,
                entityType: true,
                entityId: true,
                localRecordId: true,
                fieldName: true,
                status: true,
                changedAt: true,
                oldValue: true,
                newValue: true,
                source: true,
            },
        });
        const enriched = await this.enrichCrmChanges(rows);

        return enriched.map((change: any) => ({
            id: change.id,
            title: change.displayName,
            description: [change.companyName, change.email, change.changeSummary, change.status].filter(Boolean).join(' / '),
            href: change.href,
            status: change.status,
            meta: {
                entityType: change.entityType,
                entityId: change.entityId,
                fieldName: change.fieldLabel,
                changedAt: change.changedAt,
                email: change.email ?? null,
            },
        }));
    }

    private async getCrawlerRecords(where: Record<string, any>, take: number): Promise<OpsModalRecord[]> {
        const rows = await this.prisma.crawlCandidate.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take,
            select: { id: true, title: true, source: true, status: true, format: true, language: true, sourceUrl: true, updatedAt: true },
        });

        return rows.map((candidate) => ({
            id: candidate.id,
            title: candidate.title,
            description: [candidate.source, candidate.format, candidate.language, candidate.sourceUrl].filter(Boolean).join(' / '),
            href: '/knowledge-pool?tab=candidates',
            status: candidate.status,
            meta: { count: 1, updatedAt: candidate.updatedAt.toISOString() },
        }));
    }

    private rowsToTrend(rows: Array<OpsModalRecord | any>): TrendPoint[] {
        if (rows.length === 0) return this.normalizeTrend([], 7, { count: 0 });
        return rows.slice(0, 12).map((row, index) => ({
            date: String(row.meta?.createdAt ?? row.meta?.updatedAt ?? row.id ?? index).slice(0, 10),
            label: row.title ?? String(index + 1),
            count: this.toNumber(row.meta?.count ?? 1),
        }));
    }

    private async getHourlyTicketTrend(start: Date): Promise<TrendPoint[]> {
        const rows = await this.prisma.$queryRaw<Array<{ date: string; created: number; resolved: number }>>`
            SELECT
                to_char(hour, 'YYYY-MM-DD HH24:00') AS date,
                (
                    SELECT COUNT(*)::int FROM tickets
                    WHERE deleted_at IS NULL AND created_at >= hour AND created_at < hour + interval '1 hour'
                ) AS created,
                (
                    SELECT COUNT(*)::int FROM tickets
                    WHERE deleted_at IS NULL AND resolved_at >= hour AND resolved_at < hour + interval '1 hour'
                ) AS resolved
            FROM generate_series(date_trunc('hour', ${start}::timestamptz), date_trunc('hour', now()), interval '1 hour') hour
            ORDER BY hour ASC
        `;

        return rows.map((row) => ({
            date: row.date,
            label: row.date.slice(11),
            created: this.toNumber(row.created),
            resolved: this.toNumber(row.resolved),
        }));
    }

    private async getTicketDepartmentTrend(): Promise<TrendPoint[]> {
        const rows = await this.prisma.$queryRaw<Array<{ label: string; count: number }>>`
            SELECT COALESCE(d.name, 'Unassigned') AS label, COUNT(*)::int AS count
            FROM tickets t
            LEFT JOIN departments d ON d.id = t.department_id
            WHERE t.deleted_at IS NULL
              AND t.status IN ('NEW', 'OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_CUSTOMER_REVIEW')
            GROUP BY d.name
            ORDER BY count DESC
            LIMIT 12
        `;

        return rows.map((row, index) => ({
            date: `department-${index}`,
            label: row.label,
            count: this.toNumber(row.count),
        }));
    }

    private async getTicketTrend(start: Date, todayStart: Date, days: number): Promise<TrendPoint[]> {
        const rows = await this.prisma.$queryRaw<Array<{ date: string; created: number; resolved: number }>>`
            SELECT
                to_char(day, 'YYYY-MM-DD') AS date,
                (
                    SELECT COUNT(*)::int FROM tickets
                    WHERE deleted_at IS NULL AND created_at >= day AND created_at < day + interval '1 day'
                ) AS created,
                (
                    SELECT COUNT(*)::int FROM tickets
                    WHERE deleted_at IS NULL AND resolved_at >= day AND resolved_at < day + interval '1 day'
                ) AS resolved
            FROM generate_series(${start}::timestamptz, ${todayStart}::timestamptz, interval '1 day') day
            ORDER BY day ASC
        `;

        return this.normalizeTrend(rows, days, { created: 0, resolved: 0 });
    }

    private async getAiTrend(start: Date, todayStart: Date, days: number): Promise<TrendPoint[]> {
        const rows = await this.prisma.$queryRaw<Array<{ date: string; total: number; high: number; low: number }>>`
            SELECT
                to_char(day, 'YYYY-MM-DD') AS date,
                (
                    SELECT COUNT(*)::int FROM ai_interactions
                    WHERE created_at >= day AND created_at < day + interval '1 day'
                ) AS total,
                (
                    SELECT COUNT(*)::int FROM ai_interactions
                    WHERE created_at >= day AND created_at < day + interval '1 day' AND confidence_band = 'HIGH'
                ) AS high,
                (
                    SELECT COUNT(*)::int FROM ai_interactions
                    WHERE created_at >= day AND created_at < day + interval '1 day'
                    AND (confidence_band = 'LOW' OR confidence_band IS NULL)
                ) AS low
            FROM generate_series(${start}::timestamptz, ${todayStart}::timestamptz, interval '1 day') day
            ORDER BY day ASC
        `;

        return this.normalizeTrend(rows, days, { total: 0, high: 0, low: 0 }).map((point) => ({
            ...point,
            confidence: point.total ? Math.round((Number(point.high) / Number(point.total)) * 100) : 0,
        }));
    }

    private async getDailyCountTrend(tableName: string, dateColumn: string, start: Date, days: number): Promise<TrendPoint[]> {
        const allowedTables = new Set(['crm_change_logs', 'knowledge_sources']);
        const allowedColumns = new Set(['changed_at', 'created_at']);
        if (!allowedTables.has(tableName) || !allowedColumns.has(dateColumn)) {
            return this.normalizeTrend([], days, { count: 0 });
        }

        const rows = await this.prisma.$queryRawUnsafe<Array<{ date: string; count: number }>>(
            `
            SELECT to_char(day, 'YYYY-MM-DD') AS date,
                (
                    SELECT COUNT(*)::int FROM ${tableName}
                    WHERE ${dateColumn} >= day AND ${dateColumn} < day + interval '1 day'
                ) AS count
            FROM generate_series($1::timestamptz, $2::timestamptz, interval '1 day') day
            ORDER BY day ASC
            `,
            start,
            this.addDays(start, days - 1),
        );

        return this.normalizeTrend(rows, days, { count: 0 });
    }

    private normalizeTrend(rows: Array<Record<string, any>>, days: number, defaults: Record<string, number>): TrendPoint[] {
        const byDate = new Map(rows.map((row) => [String(row.date).slice(0, 10), row]));
        const today = this.startOfDay(new Date());
        const start = this.addDays(today, -(days - 1));

        return Array.from({ length: days }, (_, index) => {
            const date = this.addDays(start, index);
            const key = this.isoDate(date);
            const row = byDate.get(key);
            const point: TrendPoint = { date: key, label: key.slice(5) };

            for (const [name, value] of Object.entries(defaults)) {
                point[name] = row ? this.toNumber(row[name]) : value;
            }

            for (const [name, value] of Object.entries(row ?? {})) {
                if (name !== 'date' && point[name] === undefined) point[name] = this.toNumber(value);
            }

            return point;
        });
    }

    private buildDecision(ticketKpis: any, aiQuality: any, crmSummary: any, queueSummary: any, systemSummary: any) {
        const queueFailed = queueSummary.knowledge.failed + queueSummary.crm.failed + queueSummary.ai.failed;
        if (ticketKpis.slaBreaches > 0) return { level: 'critical', code: 'sla_breach', primaryAction: '/tickets?isSlaBreached=true' };
        if (ticketKpis.unassigned > 0) return { level: 'warning', code: 'unassigned_tickets', primaryAction: '/tickets?assignedTo=unassigned' };
        if (crmSummary.failuresToday > 0) return { level: 'warning', code: 'crm_failures', primaryAction: '/customers/crm' };
        if (aiQuality.fallbackRate > 30) return { level: 'warning', code: 'ai_quality_watch', primaryAction: '/admin/ai-health' };
        if (queueFailed > 0 || systemSummary.status !== 'HEALTHY') return { level: 'warning', code: 'system_watch', primaryAction: '/dashboard' };
        return { level: 'ok', code: 'operationally_stable', primaryAction: '/tickets' };
    }

    private formatAiAggregate(aggregate: any) {
        return {
            requests: aggregate._count?.id ?? 0,
            inputTokens: aggregate._sum?.inputTokens ?? 0,
            outputTokens: aggregate._sum?.outputTokens ?? 0,
            totalTokens: aggregate._sum?.totalTokens ?? 0,
            estimatedCost: this.toNumber(aggregate._sum?.estimatedCost),
        };
    }

    private async queueCounts(queue: Queue) {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed', 'paused');
        return {
            waiting: counts.waiting ?? 0,
            active: counts.active ?? 0,
            delayed: counts.delayed ?? 0,
            failed: counts.failed ?? 0,
            completed: counts.completed ?? 0,
            paused: counts.paused ?? 0,
        };
    }

    private countMap<T extends Record<string, any>>(rows: Array<T & { _count: { id: number } }>, key: keyof T) {
        return rows.reduce<Record<string, number>>((acc, row) => {
            acc[String(row[key] ?? 'UNKNOWN')] = row._count.id;
            return acc;
        }, {});
    }

    private describeCrmAction(change: Pick<CrmChangeRow, 'fieldName' | 'oldValue' | 'newValue'>) {
        if (change.fieldName === 'deletedAt') return 'deleted';
        if (!change.oldValue && change.newValue) return 'updated';
        return 'updated';
    }

    private buildCrmChangeSummary(change: Pick<CrmChangeRow, 'fieldName' | 'oldValue' | 'newValue'>) {
        if (change.fieldName === 'rawCrmPayload') return 'CRM payload updated';
        const oldValue = this.shortenText(change.oldValue);
        const newValue = this.shortenText(change.newValue);
        if (!oldValue && !newValue) return change.fieldName;
        if (!oldValue) return `${change.fieldName}: ${newValue}`;
        if (!newValue) return `${change.fieldName}: ${oldValue} -> -`;
        if (oldValue === newValue) return change.fieldName;
        return `${change.fieldName}: ${oldValue} -> ${newValue}`;
    }

    private shortenText(value: string | null | undefined) {
        const text = String(value ?? '').trim();
        if (!text) return '';
        return text.length > 72 ? `${text.slice(0, 69)}...` : text;
    }

    private uniqueValues(values: Array<string | null | undefined>) {
        return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
    }

    private canViewCost(role: RoleLike) {
        const value = typeof role === 'string' ? role : role?.name;
        const normalized = String(value ?? '').toUpperCase();
        return normalized === 'ADMIN' || normalized === 'SUPERUSER';
    }

    private normalizeDays(days?: number) {
        if (!Number.isFinite(days)) return 7;
        return Math.max(3, Math.min(30, Math.trunc(days as number)));
    }

    private startOfDay(date: Date) {
        const value = new Date(date);
        value.setHours(0, 0, 0, 0);
        return value;
    }

    private addDays(date: Date, days: number) {
        const value = new Date(date);
        value.setDate(value.getDate() + days);
        return value;
    }

    private isoDate(date: Date) {
        return date.toISOString().slice(0, 10);
    }

    private toNumber(value: unknown): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'bigint') return Number(value);
        if (typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
            return (value as { toNumber: () => number }).toNumber();
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
}
