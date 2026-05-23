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

type OpsDashboardRequest = {
    requesterRole?: RoleLike;
    days?: number;
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
            },
            learnNow: learnNowSummary,
            liveFeed,
        };
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
                select: { id: true, entityType: true, fieldName: true, status: true, changedAt: true, oldValue: true, newValue: true },
            }),
            this.getDailyCountTrend('crm_change_logs', 'changed_at', trendStart, days),
        ]);

        return {
            updatedToday,
            failuresToday,
            trend,
            recentChanges: recentChanges.map((change) => ({
                ...change,
                changedAt: change.changedAt.toISOString(),
            })),
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
                select: { id: true, entityType: true, fieldName: true, status: true, changedAt: true },
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
            ...crm.map((change) => ({
                id: `crm-${change.id}`,
                type: 'crm',
                title: `${change.entityType}.${change.fieldName}`,
                description: change.status,
                status: change.status,
                at: change.changedAt.toISOString(),
                href: '/customers/crm',
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
        if (crmSummary.failuresToday > 0) return { level: 'warning', code: 'crm_failures', primaryAction: '/crm' };
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
