'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { Activity, AlertCircle, ArrowRight, BarChart3, BookOpen, Bot, CheckCircle2, Clock, Database, DollarSign, Info, PlusCircle, RefreshCw, Search, Server, ShieldCheck, Ticket, TrendingUp, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api, OpsDashboardData } from '@/lib/api';
import { useAuth } from '@/components/auth/role-guard';
import { WireframeBorder } from '@/components/ui/wireframe-border';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DrawerMode = 'cost' | 'system' | null;
type PulseId = 'tickets' | 'ai' | 'crm' | 'knowledge';
type PulseMetric = { label: string; value: string | number; detail: string };
type PulseRecord = {
    id: string;
    title: string;
    description: string;
    href: string;
};
type PulseAction = { label: string; href: string };
type PulseTool = {
    key: string;
    label: string;
    intent: 'period' | 'breakdown' | 'filter';
    count?: number;
};
type PulseSegment = {
    key: string;
    intent: 'period' | 'breakdown' | 'filter';
    series: Array<Record<string, string | number>>;
    metrics: Record<string, number>;
    records: PulseRecord[];
    decision?: {
        level?: 'ok' | 'info' | 'warning' | 'critical';
        title?: string;
        description?: string;
    };
};
type PulseDetail = {
    metrics: PulseMetric[];
    records: PulseRecord[];
    actions: PulseAction[];
    series: number[];
    tools: PulseTool[];
    activeTool: string;
    activeToolLabel: string;
    tags: string[];
    summary: { title: string; description: string };
};

const segmentToolLabelKeys: Record<string, string> = {
    '24h': 'last_24_hours',
    '7d': 'last_7_days',
    '30d': 'last_30_days',
    department: 'department_breakdown',
    provider: 'provider',
    language: 'language',
    problem_traces: 'problem_traces',
    failed: 'failed_only',
    missing_email: 'missing_email',
    account_matching: 'account_matching',
    learnnow: 'learnnow',
    review_required: 'review_required',
    failed_imports: 'failed_imports',
};

const metricLabelKeys: Record<string, string> = {
    active: 'active',
    unassigned: 'unassigned',
    sla: 'sla',
    resolved: 'resolved',
    confidence: 'confidence',
    fallback: 'fallback',
    languageRisks: 'language_risks',
    sourceLeaks: 'source_leaks',
    problemCount: 'problem_count',
    updates: 'updated',
    failures: 'failures',
    missingEmail: 'missing_email',
    unmatched: 'unmatched',
    sources: 'sources',
    embeddings: 'embeddings',
    candidates: 'candidates',
    failed: 'failed',
    review: 'review',
};

const emptyOpsData = (): OpsDashboardData => ({
    generatedAt: new Date().toISOString(),
    window: {
        days: 7,
        todayStart: new Date().toISOString(),
        trendStart: new Date().toISOString(),
    },
    kpis: {
        activeTickets: 0,
        unassignedTickets: 0,
        crmUpdatesToday: 0,
        crawlCandidates: 0,
        aiConfidence: 0,
        slaBreaches: 0,
        resolvedToday: 0,
    },
    decision: {
        level: 'ok',
        code: 'operationally_stable',
        primaryAction: '/tickets',
    },
    cost: null,
    system: {
        status: 'HEALTHY',
        aiEvents: {},
        activeAgents: 0,
        dndAgents: 0,
        recentErrors: [],
    },
    queues: {
        knowledge: {
            waiting: 0,
            active: 0,
            delayed: 0,
            failed: 0,
            completed: 0,
            paused: 0,
        },
        crm: {
            waiting: 0,
            active: 0,
            delayed: 0,
            failed: 0,
            completed: 0,
            paused: 0,
        },
        ai: {
            waiting: 0,
            active: 0,
            delayed: 0,
            failed: 0,
            completed: 0,
            paused: 0,
        },
    },
    activeDesk: { total: 0, tickets: [], trend: [] },
    actions: [],
    pulse: {
        ticketTrend: [],
        aiQuality: { summary: {}, trend: [] },
        crm: {
            updatedToday: 0,
            failuresToday: 0,
            trend: [],
            recentChanges: [],
        },
        knowledge: {
            activeSources: 0,
            syncFailuresToday: 0,
            embeddings: 0,
            genericCandidatesPending: 0,
            datasetSources: 0,
            trend: [],
        },
    },
    learnNow: { pendingReview: 0, byStatus: {}, byFormat: {}, recent: [] },
    liveFeed: [],
});

function formatNumber(value: unknown) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
}

function formatCurrency(value: unknown, currency = 'USD') {
    const numeric = Number(value ?? 0);
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 4,
    }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatRefreshTime(value: Date | null) {
    if (!value) return '';
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(value);
}

function roleList(user: any) {
    return (user?.roles || [user?.role?.name, user?.role]).filter(Boolean).map((role: string) => role.toLowerCase());
}

function StatCard({ icon: Icon, label, value, indicatorColor }: { icon: ElementType; label: string; value: string | number; indicatorColor: string }) {
    const t = useTranslations('dashboard.stats');
    return (
        <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] px-4 py-5 transition-all duration-300">
            <div className={`absolute left-0 right-0 top-0 h-0.5 ${indicatorColor} opacity-70`} />
            <div className="flex items-start justify-between gap-3">
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-muted-foreground transition-colors group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="max-w-[9rem] text-right text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-white">{value}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                {t('status_stable')}
            </div>
        </motion.div>
    );
}

function CustomerDashboard({ stats }: { stats: any }) {
    const t = useTranslations('dashboard');
    const tc = useTranslations('common');
    const { user } = useAuth();

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-end justify-between border-b border-border/40 pb-4">
                <div>
                    <h1 className="flex items-center gap-2 text-[18px] font-bold uppercase tracking-tight">
                        <Activity className="h-5 w-5 text-primary" />
                        {t('user_portal')}
                    </h1>
                    <p className="mt-1 font-mono text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
                        {t('user_identity', {
                            name: user?.fullName || '',
                            level: t('access_level_standard'),
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard icon={Ticket} label={t('stats.active_tickets')} value={stats?.total || 0} indicatorColor="bg-blue-500" />
                <StatCard icon={CheckCircle2} label={t('stats.resolved_tickets')} value={stats?.resolvedTotal || 0} indicatorColor="bg-emerald-500" />
                <StatCard icon={Clock} label={t('stats.avg_response')} value={tc('not_available')} indicatorColor="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <QuickCard icon={Search} title={t('knowledge_base.title')} description={t('knowledge_base.description')} cta={t('knowledge_base.cta')} href="/knowledge-base" tone="primary" />
                <QuickCard icon={Bot} title={t('ai_diagnostic.title')} description={t('ai_diagnostic.description')} cta={t('ai_diagnostic.cta')} href="/ai" tone="violet" />
            </div>

            <div className="flex justify-end pt-4">
                <Link href="/tickets/new" className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-sm hover:bg-primary/90">
                    <PlusCircle className="h-4 w-4" />
                    {t('actions.create_ticket')}
                </Link>
            </div>
        </div>
    );
}

function QuickCard({ icon: Icon, title, description, cta, href, tone }: { icon: ElementType; title: string; description: string; cta: string; href: string; tone: 'primary' | 'violet' }) {
    const toneClass = tone === 'violet' ? 'text-violet-400 border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20' : 'text-primary border-primary/20 bg-primary/10 hover:bg-primary/20';
    return (
        <div className="group relative flex min-h-48 flex-col justify-between overflow-hidden border border-border/40 bg-muted/5 p-6">
            <div className="relative z-10">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Icon className="h-4 w-4 text-primary" />
                    {title}
                </h2>
                <p className="mb-6 max-w-[80%] font-mono text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <Link href={href} className={`relative z-10 inline-flex w-fit items-center justify-between border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${toneClass}`}>
                {cta}
            </Link>
            <Icon className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/5 transition-colors group-hover:text-primary/10" />
        </div>
    );
}

function HeaderActions({ data, drawer, refreshing, setDrawer, onRefresh }: { data: OpsDashboardData; drawer: DrawerMode; refreshing: boolean; setDrawer: (mode: DrawerMode) => void; onRefresh: () => void }) {
    const t = useTranslations('dashboard.ops');
    const isSystemHealthy = data.system.status === 'HEALTHY';
    return (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition hover:bg-white/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t('refreshing') : t('refresh')}
            </button>
            <button
                type="button"
                onClick={() => setDrawer(drawer === 'cost' ? null : 'cost')}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-400/15"
            >
                <DollarSign className="h-3.5 w-3.5" />
                {t('live_cost')}
            </button>
            <button
                type="button"
                onClick={() => setDrawer(drawer === 'system' ? null : 'system')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition ${isSystemHealthy ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}
            >
                <span className={`h-1.5 w-1.5 rounded-full ${isSystemHealthy ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`} />
                {isSystemHealthy ? t('system_active') : t('system_watch')}
            </button>
        </div>
    );
}

function TopDrawer({ mode, data, onClose }: { mode: DrawerMode; data: OpsDashboardData; onClose: () => void }) {
    const t = useTranslations('dashboard.ops');
    if (!mode) return null;

    return (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-lg border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{mode === 'cost' ? t('cost.title') : t('system.title')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{mode === 'cost' ? t('cost.description') : t('system.description')}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-md border border-white/10 p-2 text-muted-foreground hover:text-white" aria-label={t('close')}>
                    <X className="h-4 w-4" />
                </button>
            </div>
            {mode === 'cost' ? <CostDrawer data={data} /> : <SystemDrawer data={data} />}
        </motion.div>
    );
}

function CostDrawer({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.cost');
    if (!data.cost) {
        return <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground">{t('restricted')}</div>;
    }

    return (
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_2fr]">
            <MetricStrip label={t('today')} value={formatCurrency(data.cost.today.estimatedCost, data.cost.currency)} detail={t('requests', { count: data.cost.today.requests })} />
            <MetricStrip
                label={t('rolling30')}
                value={formatCurrency(data.cost.rolling30d.estimatedCost, data.cost.currency)}
                detail={t('tokens', {
                    count: formatNumber(data.cost.rolling30d.totalTokens),
                })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
                {data.cost.providers.slice(0, 4).map((provider) => (
                    <div key={`${provider.provider}-${provider.model}`} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-semibold text-white">{provider.provider}</span>
                            <span className="text-[10px] text-muted-foreground">{formatCurrency(provider.estimatedCost, data.cost?.currency)}</span>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">{provider.model}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SystemDrawer({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.system');
    return (
        <div className="grid gap-3 md:grid-cols-4">
            <MetricStrip label={t('health')} value={t(`statuses.${data.system.status}`)} detail={t('health_detail')} />
            <MetricStrip label={t('online_agents')} value={data.system.activeAgents} detail={t('dnd_agents', { count: data.system.dndAgents })} />
            <MetricStrip
                label={t('knowledge_queue')}
                value={data.queues.knowledge.active + data.queues.knowledge.waiting}
                detail={t('failed_jobs', {
                    count: data.queues.knowledge.failed,
                })}
            />
            <MetricStrip
                label={t('ai_events')}
                value={Object.values(data.system.aiEvents || {}).reduce((sum, count) => sum + Number(count), 0)}
                detail={t('recent_errors', {
                    count: data.system.recentErrors.length,
                })}
            />
        </div>
    );
}

function MetricStrip({ label, value, detail }: { label: string; value: string | number; detail: string }) {
    return (
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
        </div>
    );
}

function OpsStatGrid({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.kpis');
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={Ticket} label={t('active_tickets')} value={data.kpis.activeTickets} indicatorColor="bg-blue-500" />
            <StatCard icon={AlertCircle} label={t('unassigned')} value={data.kpis.unassignedTickets} indicatorColor="bg-amber-500" />
            <StatCard icon={Database} label={t('crm_updates')} value={data.kpis.crmUpdatesToday} indicatorColor="bg-cyan-500" />
            <StatCard icon={BookOpen} label={t('crawl_candidates')} value={data.kpis.crawlCandidates} indicatorColor="bg-emerald-500" />
            <StatCard icon={Bot} label={t('ai_confidence')} value={`${data.kpis.aiConfidence}%`} indicatorColor="bg-violet-500" />
        </div>
    );
}

function PulseBand({ data, onSelect }: { data: OpsDashboardData; onSelect: (id: PulseId) => void }) {
    const t = useTranslations('dashboard.ops.pulse');
    const cards = [
        {
            id: 'tickets' as const,
            source: 'tickets.created / tickets.closed',
            series: data.activeDesk.trend.map((point) => Number(point.created ?? 0)),
            tone: 'text-blue-300',
        },
        {
            id: 'ai' as const,
            source: 'ai_traces.confidence',
            series: data.pulse.aiQuality.trend.map((point) => Number(point.confidence ?? 0)),
            tone: 'text-cyan-300',
        },
        {
            id: 'crm' as const,
            source: 'crm_sync_logs.updated',
            series: (data.pulse.crm.trend ?? []).map((point: any) => Number(point.count ?? 0)),
            tone: 'text-emerald-300',
        },
        {
            id: 'knowledge' as const,
            source: 'crawl_candidates / chunks',
            series: (data.pulse.knowledge.trend ?? []).map((point: any) => Number(point.count ?? 0)),
            tone: 'text-violet-300',
        },
    ];

    return (
        <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 md:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ id, source, series, tone }) => (
                <div key={id} className="min-w-0">
                    <button
                        type="button"
                        onClick={() => onSelect(id)}
                        className="grid min-h-[72px] w-full grid-cols-[minmax(0,1fr)_116px] items-center gap-3 rounded-md border border-white/10 bg-slate-950/30 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/60 max-sm:grid-cols-1"
                    >
                        <div className="min-w-0">
                            <strong className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white">{t(`${id}.title`)}</strong>
                            <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">{t(`${id}.description`)}</span>
                            <em className={`mt-1 block truncate text-[8px] not-italic uppercase tracking-[0.14em] ${tone}`}>{source}</em>
                        </div>
                        <SparkPreview values={series} mode={id} />
                    </button>
                </div>
            ))}
        </section>
    );
}

function PulseDetailModal({
    data,
    selected,
    activeSegmentKey,
    onSegmentChange,
    onOpenChange,
}: {
    data: OpsDashboardData;
    selected: PulseId | null;
    activeSegmentKey?: string;
    onSegmentChange: (key: string) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations('dashboard.ops.pulse');
    if (!selected) return null;

    const detail = buildPulseDetail(data, selected, t, activeSegmentKey);

    return (
        <Dialog open={Boolean(selected)} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-hidden border-white/10 bg-slate-950 p-0 sm:w-[calc(100vw-3rem)]">
                <DialogHeader className="m-0 border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        {t(`${selected}.modal_title`)}
                    </DialogTitle>
                    <DialogDescription>{t(`${selected}.modal_description`)}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(92vh-88px)]">
                    <div className="space-y-4 p-4 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {detail.tools.map((tool) => (
                                    <button
                                        key={tool.key}
                                        type="button"
                                        aria-pressed={tool.key === detail.activeTool}
                                        onClick={() => onSegmentChange(tool.key)}
                                        className={`inline-flex items-center gap-2 rounded border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition focus:outline-none focus:ring-1 focus:ring-primary/60 ${tool.key === detail.activeTool ? 'border-primary/35 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.025] text-muted-foreground hover:border-primary/25 hover:text-white'}`}
                                    >
                                        <span>{tool.label}</span>
                                        {typeof tool.count === 'number' ? (
                                            <span className={`rounded px-1.5 py-0.5 text-[8px] tracking-normal ${tool.key === detail.activeTool ? 'bg-primary/15 text-primary' : 'bg-white/[0.06] text-muted-foreground'}`}>{tool.count}</span>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                {t('modal.selected_slice', {
                                    slice: detail.activeToolLabel,
                                    count: detail.records.length,
                                })}
                            </p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
                            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">{t('modal.chart_title')}</h3>
                                        <p className="mt-1 text-[10px] text-muted-foreground">{t('modal.chart_desc')}</p>
                                    </div>
                                    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                                        {detail.series.length} {t('modal.points')}
                                    </span>
                                </div>
                                <LargeTrend values={detail.series} />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {detail.tags.map((tag) => (
                                        <span key={tag} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{t('modal.decision')}</p>
                                    <h3 className="mt-2 text-sm font-bold text-white">{detail.summary.title}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail.summary.description}</p>
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/[0.025]">
                                    <div className="border-b border-white/10 px-4 py-3">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('modal.records')}</h3>
                                    </div>
                                    <div className="space-y-2 p-3">
                                        {detail.records.length === 0 ? (
                                            <EmptyState title={t('modal.empty_title')} description={t('modal.empty_desc')} />
                                        ) : (
                                            detail.records.map((record) => (
                                                <Link key={record.id} href={record.href} className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40 hover:bg-primary/5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-bold text-white">{record.title}</p>
                                                            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{record.description}</p>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                            <div className="mb-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('modal.actions')}</h3>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {detail.actions.map((action) => (
                                    <Button key={action.href} asChild variant="outline" className="justify-between">
                                        <Link href={action.href}>
                                            {action.label}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function buildPulseDetail(data: OpsDashboardData, selected: PulseId, t: (key: string, values?: Record<string, string | number>) => string, activeSegmentKey?: string): PulseDetail {
    const recordMap: Record<PulseId, PulseRecord[]> = {
        tickets: data.activeDesk.tickets.slice(0, 8).map((ticket) => ({
            id: ticket.id,
            title: ticket.ticketNumber || ticket.subject,
            description: [ticket.subject, ticket.creator?.customerProfile?.companyName || ticket.creator?.fullName, ticket.assignee?.fullName || ticket.status].filter(Boolean).join(' / '),
            href: `/tickets/${ticket.id}`,
        })),
        ai: data.liveFeed
            .filter((item) => item.type === 'ai')
            .slice(0, 8)
            .map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description || item.status || '',
                href: item.href,
            })),
        crm: (data.pulse.crm.recentChanges ?? []).slice(0, 8).map((item: any, index: number) => ({
            id: item.id || `crm-${index}`,
            title: item.displayName || item.companyName || item.entityId || item.entityType || t('modal.unknown_record'),
            description: [item.companyName, item.email, item.changeSummary || item.fieldLabel, item.status].filter(Boolean).join(' / ') || t('modal.no_description'),
            href: item.href || '/customers/crm',
        })),
        knowledge: (data.learnNow.recent ?? []).slice(0, 8).map((item: any, index: number) => ({
            id: item.id || `learnnow-${index}`,
            title: item.title || item.sourceUrl || t('modal.unknown_record'),
            description: item.status || item.format || item.source || t('modal.no_description'),
            href: '/knowledge-pool',
        })),
    };
    const detailGroup = data.pulse.details?.[selected];
    const backendSegments = (detailGroup?.segments ?? []) as PulseSegment[];
    const fallbackActiveKey: Record<PulseId, string> = {
        tickets: '7d',
        ai: '7d',
        crm: '24h',
        knowledge: '7d',
    };
    const activeKey = backendSegments.some((segment) => segment.key === activeSegmentKey) ? activeSegmentKey! : (detailGroup?.defaultKey ?? fallbackActiveKey[selected]);
    const activeSegment = backendSegments.find((segment) => segment.key === activeKey);
    const records = activeSegment ? activeSegment.records : recordMap[selected];

    const metricMap: Record<PulseId, PulseMetric[]> = {
        tickets: [
            {
                label: t('modal.metrics.active'),
                value: data.kpis.activeTickets,
                detail: t('modal.details.open_queue'),
            },
            {
                label: t('modal.metrics.unassigned'),
                value: data.kpis.unassignedTickets,
                detail: t('modal.details.needs_routing'),
            },
            {
                label: t('modal.metrics.sla'),
                value: data.kpis.slaBreaches,
                detail: t('modal.details.breaches'),
            },
            {
                label: t('modal.metrics.resolved'),
                value: data.kpis.resolvedToday,
                detail: t('modal.details.today'),
            },
        ],
        ai: [
            {
                label: t('modal.metrics.confidence'),
                value: `${data.pulse.aiQuality.summary.confidenceRate ?? 0}%`,
                detail: t('modal.details.rolling_signal'),
            },
            {
                label: t('modal.metrics.fallback'),
                value: `${data.pulse.aiQuality.summary.fallbackRate ?? 0}%`,
                detail: t('modal.details.today'),
            },
            {
                label: t('modal.metrics.language'),
                value: data.pulse.aiQuality.summary.languageRisks ?? 0,
                detail: t('modal.details.risks'),
            },
            {
                label: t('modal.metrics.leaks'),
                value: data.pulse.aiQuality.summary.sourceLeaks ?? 0,
                detail: t('modal.details.source_signals'),
            },
        ],
        crm: [
            {
                label: t('modal.metrics.updated'),
                value: data.pulse.crm.updatedToday ?? 0,
                detail: t('modal.details.today'),
            },
            {
                label: t('modal.metrics.failures'),
                value: data.pulse.crm.failuresToday ?? 0,
                detail: t('modal.details.today'),
            },
            {
                label: t('modal.metrics.recent'),
                value: data.pulse.crm.recentChanges?.length ?? 0,
                detail: t('modal.details.changes'),
            },
            {
                label: t('modal.metrics.queue'),
                value: data.queues.crm.waiting + data.queues.crm.active,
                detail: t('modal.details.pending_jobs'),
            },
        ],
        knowledge: [
            {
                label: t('modal.metrics.sources'),
                value: data.pulse.knowledge.activeSources ?? 0,
                detail: t('modal.details.active'),
            },
            {
                label: t('modal.metrics.embeddings'),
                value: formatNumber(data.pulse.knowledge.embeddings ?? 0),
                detail: t('modal.details.vectors'),
            },
            {
                label: t('modal.metrics.candidates'),
                value: data.pulse.knowledge.genericCandidatesPending ?? 0,
                detail: t('modal.details.pending'),
            },
            {
                label: t('modal.metrics.failures'),
                value: data.pulse.knowledge.syncFailuresToday ?? 0,
                detail: t('modal.details.today'),
            },
        ],
    };
    const metrics = activeSegment
        ? Object.entries(activeSegment.metrics).map(([key, value]) => ({
              label: t(`modal.metrics.${metricLabelKeys[key] ?? key}`),
              value: key === 'confidence' || key === 'fallback' ? `${value}%` : key === 'embeddings' ? formatNumber(value) : value,
              detail: t('modal.details.current_slice'),
          }))
        : metricMap[selected];

    const actionMap: Record<PulseId, PulseAction[]> = {
        tickets: [
            { label: t('modal.actions_map.open_tickets'), href: '/tickets' },
            { label: t('modal.actions_map.open_teams'), href: '/teams' },
        ],
        ai: [
            {
                label: t('modal.actions_map.ai_health'),
                href: '/admin/ai-health',
            },
            {
                label: t('modal.actions_map.ai_intelligence'),
                href: '/admin/ai-intelligence',
            },
        ],
        crm: [
            {
                label: t('modal.actions_map.crm_management'),
                href: '/customers/crm',
            },
            {
                label: t('modal.actions_map.customer_records'),
                href: '/customers',
            },
        ],
        knowledge: [
            {
                label: t('modal.actions_map.knowledge_pool'),
                href: '/knowledge-pool',
            },
            {
                label: t('modal.actions_map.data_sources'),
                href: '/knowledge-pool/upload',
            },
        ],
    };
    const actions = actionMap[selected];
    const fallbackToolsMap: Record<PulseId, PulseTool[]> = {
        tickets: [
            {
                key: '7d',
                intent: 'period',
                label: t('modal.tools.last_7_days'),
            },
            {
                key: '24h',
                intent: 'period',
                label: t('modal.tools.last_24_hours'),
            },
            {
                key: '30d',
                intent: 'period',
                label: t('modal.tools.last_30_days'),
            },
            {
                key: 'department',
                intent: 'breakdown',
                label: t('modal.tools.department_breakdown'),
            },
        ],
        ai: [
            {
                key: '7d',
                intent: 'period',
                label: t('modal.tools.last_7_days'),
            },
            {
                key: 'provider',
                intent: 'breakdown',
                label: t('modal.tools.provider'),
            },
            {
                key: 'language',
                intent: 'breakdown',
                label: t('modal.tools.language'),
            },
            {
                key: 'problem_traces',
                intent: 'filter',
                label: t('modal.tools.problem_traces'),
            },
        ],
        crm: [
            {
                key: '24h',
                intent: 'period',
                label: t('modal.tools.last_24_hours'),
            },
            {
                key: 'failed',
                intent: 'filter',
                label: t('modal.tools.failed_only'),
            },
            {
                key: 'missing_email',
                intent: 'filter',
                label: t('modal.tools.missing_email'),
            },
            {
                key: 'account_matching',
                intent: 'filter',
                label: t('modal.tools.account_matching'),
            },
        ],
        knowledge: [
            {
                key: '7d',
                intent: 'period',
                label: t('modal.tools.last_7_days'),
            },
            {
                key: 'learnnow',
                intent: 'filter',
                label: t('modal.tools.learnnow'),
            },
            {
                key: 'review_required',
                intent: 'filter',
                label: t('modal.tools.review_required'),
            },
            {
                key: 'failed_imports',
                intent: 'filter',
                label: t('modal.tools.failed_imports'),
            },
        ],
    };
    const tools = backendSegments.length
        ? backendSegments.map((segment) => ({
              key: segment.key,
              intent: segment.intent,
              label: t(`modal.tools.${segmentToolLabelKeys[segment.key] ?? segment.key}`),
              count: segment.records?.length ?? 0,
          }))
        : fallbackToolsMap[selected];
    const tags = metrics.map((metric) => `${metric.label}: ${metric.value}`);
    const activeToolLabel = tools.find((tool) => tool.key === activeKey)?.label ?? activeKey;

    const seriesMap: Record<PulseId, number[]> = {
        tickets: data.activeDesk.trend.map((point) => Number(point.created ?? 0)),
        ai: data.pulse.aiQuality.trend.map((point) => Number(point.confidence ?? 0)),
        crm: (data.pulse.crm.trend ?? []).map((point: any) => Number(point.count ?? 0)),
        knowledge: (data.pulse.knowledge.trend ?? []).map((point: any) => Number(point.count ?? 0)),
    };
    const series = activeSegment ? seriesValuesFromPoints(activeSegment.series) : seriesMap[selected];
    const summaryMap: Record<PulseId, { title: string; description: string }> = {
        tickets: {
            title: t('modal.summaries.tickets.title'),
            description: t('modal.summaries.tickets.description', {
                active: data.kpis.activeTickets,
                unassigned: data.kpis.unassignedTickets,
                sla: data.kpis.slaBreaches,
            }),
        },
        ai: {
            title: t('modal.summaries.ai.title'),
            description: t('modal.summaries.ai.description', {
                confidence: data.pulse.aiQuality.summary.confidenceRate ?? 0,
                fallback: data.pulse.aiQuality.summary.fallbackRate ?? 0,
            }),
        },
        crm: {
            title: t('modal.summaries.crm.title'),
            description: t('modal.summaries.crm.description', {
                updates: data.pulse.crm.updatedToday ?? 0,
                failures: data.pulse.crm.failuresToday ?? 0,
            }),
        },
        knowledge: {
            title: t('modal.summaries.knowledge.title'),
            description: t('modal.summaries.knowledge.description', {
                sources: data.pulse.knowledge.activeSources ?? 0,
                candidates: data.pulse.knowledge.genericCandidatesPending ?? 0,
            }),
        },
    };
    const summary = {
        title: activeSegment?.decision?.title || summaryMap[selected].title,
        description: activeSegment?.decision?.description || buildPulseSummaryDescription(selected, metrics, t),
    };

    return {
        metrics,
        records,
        actions,
        series,
        tools,
        activeTool: activeKey,
        activeToolLabel,
        tags,
        summary,
    };
}

function seriesValuesFromPoints(points: Array<Record<string, string | number>>) {
    const numericKeys = ['created', 'active', 'resolved', 'confidence', 'high', 'low', 'count', 'total'];
    return points.map((point) => {
        const key = numericKeys.find((candidate) => Number.isFinite(Number(point[candidate])));
        return key ? Number(point[key]) : 0;
    });
}

function metricValue(metrics: PulseMetric[], label: string) {
    return metrics.find((metric) => metric.label === label)?.value ?? 0;
}

function buildPulseSummaryDescription(selected: PulseId, metrics: PulseMetric[], t: (key: string, values?: Record<string, string | number>) => string) {
    if (selected === 'tickets') {
        return t('modal.summaries.tickets.description', {
            active: metricValue(metrics, t('modal.metrics.active')),
            unassigned: metricValue(metrics, t('modal.metrics.unassigned')),
            sla: metricValue(metrics, t('modal.metrics.sla')),
        });
    }
    if (selected === 'ai') {
        return t('modal.summaries.ai.description', {
            confidence: String(metricValue(metrics, t('modal.metrics.confidence'))).replace('%', ''),
            fallback: String(metricValue(metrics, t('modal.metrics.fallback'))).replace('%', ''),
        });
    }
    if (selected === 'crm') {
        return t('modal.summaries.crm.description', {
            updates: metricValue(metrics, t('modal.metrics.updated')),
            failures: metricValue(metrics, t('modal.metrics.failures')),
        });
    }
    return t('modal.summaries.knowledge.description', {
        sources: metricValue(metrics, t('modal.metrics.sources')),
        candidates: metricValue(metrics, t('modal.metrics.candidates')),
    });
}

function LargeTrend({ values }: { values: number[] }) {
    const points = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(1, ...points);
    const width = 720;
    const height = 180;
    const xStep = points.length > 1 ? width / (points.length - 1) : width;
    const coordinates = points
        .map((value, index) => {
            const x = index * xStep;
            const y = height - (value / max) * (height - 16) - 8;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="overflow-hidden rounded-md border border-white/10 bg-slate-950/50 p-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img" aria-hidden="true">
                <defs>
                    <linearGradient id="opsTrend" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgb(20 184 166)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="rgb(20 184 166)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                    <line key={line} x1="0" x2={width} y1={(height / 4) * line + 8} y2={(height / 4) * line + 8} stroke="rgba(255,255,255,0.08)" />
                ))}
                <polyline points={`0,${height} ${coordinates} ${width},${height}`} fill="url(#opsTrend)" stroke="none" />
                <polyline points={coordinates} fill="none" stroke="rgb(20 184 166)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {points.map((value, index) => {
                    const [x, y] = coordinates.split(' ')[index].split(',').map(Number);
                    return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="rgb(20 184 166)" />;
                })}
            </svg>
        </div>
    );
}

function SparkPreview({ values, mode }: { values: number[]; mode: PulseId }) {
    const points = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(1, ...points);
    const width = 116;
    const height = 42;
    const coordinates = points.map((value, index) => {
        const x = points.length > 1 ? (index / (points.length - 1)) * (width - 8) + 4 : width / 2;
        const y = height - (value / max) * 28 - 6;
        return [x, y] as const;
    });
    const line = coordinates.map(([x, y]) => `${x},${y}`).join(' ');
    const area = `${coordinates[0][0]},38 ${line} ${coordinates[coordinates.length - 1][0]},38`;
    const isBars = mode === 'crm';
    const isSteps = mode === 'knowledge';
    const stroke = mode === 'tickets' ? '#5aa7ff' : mode === 'ai' ? '#44c7ff' : mode === 'crm' ? '#00f0c8' : '#9d7bff';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[42px] w-[116px] overflow-visible max-sm:w-full" aria-hidden="true">
            <path d="M4 12 H112 M4 24 H112 M4 36 H112" stroke="rgba(148,163,184,.14)" strokeWidth="1" />
            {isBars ? (
                points.map((value, index) => {
                    const barWidth = Math.max(6, (width - 20) / points.length - 4);
                    const x = 8 + index * ((width - 20) / points.length);
                    const barHeight = Math.max(5, (value / max) * 30);
                    return <rect key={`${value}-${index}`} x={x} y={38 - barHeight} width={barWidth} height={barHeight} fill={stroke} opacity={index % 3 === 0 ? 0.78 : 0.48} />;
                })
            ) : (
                <>
                    <polyline points={area} fill={stroke} opacity="0.13" />
                    <polyline points={line} fill="none" stroke={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin={isSteps ? 'miter' : 'round'} />
                    <circle cx={coordinates[coordinates.length - 1][0]} cy={coordinates[coordinates.length - 1][1]} r="3" fill="#0d1118" stroke={stroke} strokeWidth="2" />
                </>
            )}
            <path d="M4 38 H112" stroke="rgba(148,163,184,.18)" strokeWidth="1" />
        </svg>
    );
}

function ActiveDesk({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.active_desk');
    return (
        <WireframeBorder className="border-border/40 bg-transparent xl:self-start">
            <div className="border-b border-border/20 bg-muted/5 px-4 py-3">
                <SectionHeader icon={Ticket} title={t('title')} tooltip={t('tooltip')} badge={t('badge')} />
                <p className="mt-1 text-[10px] text-muted-foreground">{t('description')}</p>
            </div>
            <ScrollArea className={data.activeDesk.tickets.length > 3 ? 'h-[300px]' : 'max-h-[300px]'}>
                <div className="space-y-2 p-3">
                    {data.activeDesk.tickets.length === 0 ? (
                        <EmptyState title={t('empty_title')} description={t('empty_desc')} />
                    ) : (
                        data.activeDesk.tickets.map((ticket) => (
                            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40 hover:bg-primary/5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-white">{ticket.ticketNumber}</p>
                                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{ticket.subject}</p>
                                    </div>
                                    <span className="shrink-0 rounded border border-white/10 px-2 py-1 text-[9px] uppercase text-muted-foreground">{ticket.priority}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                    <span className="truncate">{ticket.creator?.customerProfile?.companyName || ticket.creator?.fullName || t('unknown_customer')}</span>
                                    <span>{ticket.assignee?.fullName || t('unassigned')}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </ScrollArea>
        </WireframeBorder>
    );
}

function ActionQueue({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.actions');
    return (
        <WireframeBorder className="border-border/40 bg-transparent">
            <div className="border-b border-border/20 bg-muted/5 px-4 py-3">
                <SectionHeader icon={ShieldCheck} title={t('title')} tooltip={t('tooltip')} badge={t('badge')} />
            </div>
            <ScrollArea className={data.actions.length > 4 ? 'h-[280px]' : 'max-h-[280px]'}>
                <div className="space-y-2 p-3">
                    {data.actions.map((action) => (
                        <Link key={action.id} href={action.href} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40 hover:bg-primary/5">
                            <div>
                                <p className="text-xs font-bold text-white">{t(`${action.id}.title`)}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground">{t(`${action.id}.description`)}</p>
                            </div>
                            <span
                                className={`rounded px-2 py-1 text-[10px] font-bold ${action.severity === 'critical' ? 'bg-rose-500/15 text-rose-300' : action.severity === 'warning' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}
                            >
                                {action.count}
                            </span>
                        </Link>
                    ))}
                </div>
            </ScrollArea>
        </WireframeBorder>
    );
}

function LiveFeed({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.live_feed');
    return (
        <WireframeBorder className="border-border/40 bg-transparent">
            <div className="border-b border-border/20 bg-muted/5 px-4 py-3">
                <SectionHeader icon={Activity} title={t('title')} tooltip={t('tooltip')} badge={t('badge')} />
            </div>
            <ScrollArea className={data.liveFeed.length > 4 ? 'h-[260px]' : 'max-h-[260px]'}>
                <div className="space-y-2 p-3">
                    {data.liveFeed.length === 0 ? (
                        <EmptyState title={t('empty_title')} description={t('empty_desc')} />
                    ) : (
                        data.liveFeed.map((item) => (
                            <Link key={item.id} href={item.href} className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40 hover:bg-primary/5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                                    <span className="text-[9px] uppercase text-muted-foreground">{t(`types.${item.type}`)}</span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{item.description || item.status}</p>
                            </Link>
                        ))
                    )}
                </div>
            </ScrollArea>
        </WireframeBorder>
    );
}

function WorkspaceTabs({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.workspace');
    const tSystem = useTranslations('dashboard.ops.system');
    const crmRecords = (data.pulse.crm.recentChanges ?? []).slice(0, 4).map((item: any, index: number) => ({
        id: item.id || `workspace-crm-${index}`,
        title: item.displayName || item.companyName || item.entityId || t('unknown_record'),
        description: [item.companyName, item.email, item.changeSummary || item.fieldLabel, item.status].filter(Boolean).join(' / '),
        href: item.href || '/customers/crm',
    }));
    const learnNowReady = Number(data.learnNow.byStatus?.IMPORTED ?? data.learnNow.byStatus?.APPROVED ?? 0);
    const learnNowReview = Number(data.learnNow.pendingReview ?? data.pulse.knowledge.genericCandidatesPending ?? 0);
    const totalKnowledgeSources = Number(data.pulse.knowledge.activeSources ?? 0);
    const embeddings = Number(data.pulse.knowledge.embeddings ?? 0);
    const crmTotal = Number(data.pulse.crm.updatedToday ?? 0) + Number(data.pulse.crm.failuresToday ?? 0);
    const crmHealth = crmTotal > 0 ? Math.max(0, Math.round(((crmTotal - Number(data.pulse.crm.failuresToday ?? 0)) / crmTotal) * 100)) : 100;
    const knowledgeRecords = (data.pulse.details?.knowledge?.segments ?? []).flatMap((segment: PulseSegment) => segment.records ?? []).slice(0, 5) as PulseRecord[];
    const learnNowRecords = (data.learnNow.recent ?? []).slice(0, 5).map((item: any, index: number) => ({
        id: item.id || `workspace-learnnow-${index}`,
        title: item.title || item.sourceUrl || t('unknown_record'),
        description: [item.status, item.format, item.language].filter(Boolean).join(' / '),
        href: item.sourceUrl || '/knowledge-pool?tab=candidates',
    })) as PulseRecord[];

    return (
        <WireframeBorder className="min-h-[680px] border-border/40 bg-transparent xl:self-start">
            <div className="border-b border-border/20 bg-muted/5 px-4 py-3">
                <SectionHeader icon={Server} title={t('title')} tooltip={t('tooltip')} badge={t('badge')} />
            </div>
            <Tabs defaultValue="overview" className="p-3">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-white/[0.03] p-1 md:grid-cols-4">
                    {['overview', 'crm', 'knowledge', 'learnnow'].map((tab) => (
                        <TabsTrigger key={tab} value={tab} className="text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                            {t(`tabs.${tab}`)}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-3">
                    <MetricGrid
                        columns={3}
                        items={[
                            [t('metrics.sla_breaches'), data.kpis.slaBreaches],
                            [t('metrics.resolved_today'), data.kpis.resolvedToday],
                            [t('metrics.ai_confidence'), `${data.kpis.aiConfidence}%`],
                        ]}
                    />
                    <DecisionCard data={data} />
                    <div className="grid gap-3 lg:grid-cols-2">
                        <WorkspaceInfoPanel
                            title={t('metrics.resolved_today')}
                            badge={t('badges.daily_close')}
                            rows={[
                                [t('metrics.resolved_today'), `${data.kpis.resolvedToday}`],
                                [t('metrics.live_events'), `${data.liveFeed.length}`],
                                [t('metrics.queue_failed'), `${Object.values(data.queues).reduce((sum, queue) => sum + queue.failed, 0)}`],
                            ]}
                        />
                        <WorkspaceInfoPanel
                            title={tSystem('title')}
                            badge={data.system.status}
                            rows={[
                                [tSystem('online_agents'), `${data.system.activeAgents}`],
                                [tSystem('knowledge_queue'), `${data.queues.knowledge.active + data.queues.knowledge.waiting}`],
                                [t('metrics.crm_failures'), `${data.pulse.crm.failuresToday ?? 0}`],
                            ]}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="crm" className="mt-4 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-2">
                        <WorkspaceInfoPanel
                            title={t('cards.crm_live')}
                            badge={t('badges.dynamics')}
                            rows={[
                                [t('metrics.crm_updates'), `${data.pulse.crm.updatedToday ?? 0}`],
                                [t('metrics.crm_recent'), `${data.pulse.crm.recentChanges?.length ?? 0}`],
                                [t('metrics.crm_failures'), `${data.pulse.crm.failuresToday ?? 0}`],
                            ]}
                        />
                        <WorkspaceInfoPanel
                            title={t('cards.crm_quality')}
                            badge={t('badges.quality')}
                            rows={[
                                [t('metrics.crm_updates'), `${data.pulse.crm.updatedToday ?? 0}`],
                                [t('cards.missing_email'), `${data.pulse.details?.crm?.segments?.find((segment) => segment.key === 'missing_email')?.records?.length ?? 0}`],
                                [t('cards.portal_match'), `%${crmHealth}`],
                            ]}
                        >
                            <WorkspaceProgress value={crmHealth} />
                        </WorkspaceInfoPanel>
                    </div>
                    <WorkspaceRecordList emptyTitle={t('empty_title')} records={crmRecords} />
                </TabsContent>
                <TabsContent value="knowledge" className="mt-4 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-2">
                        <WorkspaceInfoPanel
                            title={t('cards.dataset_summary')}
                            badge={t('badges.controlled_import')}
                            rows={[
                                [t('metrics.active_sources'), `${totalKnowledgeSources}`],
                                [t('metrics.dataset_sources'), `${data.pulse.knowledge.datasetSources ?? 0}`],
                                [t('metrics.embeddings'), formatNumber(embeddings)],
                            ]}
                        >
                            <WorkspaceProgress value={Math.min(100, Math.round((totalKnowledgeSources / Math.max(1, totalKnowledgeSources + data.pulse.knowledge.syncFailuresToday)) * 100))} />
                        </WorkspaceInfoPanel>
                        <WorkspaceInfoPanel
                            title={t('cards.knowledge_changes')}
                            badge={t('badges.database')}
                            rows={[
                                [t('cards.new_chunks'), formatNumber(embeddings)],
                                [t('metrics.queue_failed'), `${data.queues.knowledge.failed}`],
                                [tSystem('knowledge_queue'), `${data.queues.knowledge.active + data.queues.knowledge.waiting}`],
                            ]}
                        />
                    </div>
                    <WorkspaceRecordList emptyTitle={t('empty_title')} records={knowledgeRecords} />
                </TabsContent>
                <TabsContent value="learnnow" className="mt-4 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-2">
                        <WorkspaceInfoPanel
                            title={t('cards.learnnow_summary')}
                            badge={t('badges.review_queue')}
                            rows={[
                                [t('cards.knowledge_article'), `${data.learnNow.byFormat?.KNOWLEDGE_ARTICLE ?? 0}`],
                                [t('cards.pdf'), `${data.learnNow.byFormat?.PDF ?? 0}`],
                                [t('metrics.pending_review'), `${learnNowReview}`],
                                [t('metrics.imported'), `${data.learnNow.byStatus?.IMPORTED ?? 0}`],
                            ]}
                        >
                            <WorkspaceProgress value={Math.min(100, Math.round((learnNowReady / Math.max(1, learnNowReady + learnNowReview)) * 100))} />
                        </WorkspaceInfoPanel>
                        <WorkspaceInfoPanel
                            title={t('cards.review_decisions')}
                            badge={t('badges.quality_gate')}
                            rows={[
                                [t('metrics.pending_review'), `${learnNowReview}`],
                                [t('metrics.imported'), `${data.learnNow.byStatus?.IMPORTED ?? 0}`],
                                [t('metrics.duplicates'), `${data.learnNow.byStatus?.SKIPPED_DUPLICATE ?? 0}`],
                            ]}
                        />
                    </div>
                    <WorkspaceRecordList emptyTitle={t('empty_title')} records={learnNowRecords} />
                </TabsContent>
            </Tabs>
        </WireframeBorder>
    );
}

function SectionHeader({ icon: Icon, title, tooltip, badge }: { icon: ElementType; title: string; tooltip: string; badge: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <h2 className="flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{title}</span>
                <span className="group relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] text-muted-foreground">
                    i
                    <span className="pointer-events-none absolute left-1/2 top-6 z-50 hidden w-64 -translate-x-1/2 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-left text-[10px] font-medium normal-case leading-relaxed tracking-normal text-muted-foreground shadow-2xl shadow-black/50 group-hover:block">
                        {tooltip}
                    </span>
                </span>
            </h2>
            <span className="shrink-0 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{badge}</span>
        </div>
    );
}

function DecisionCard({ data }: { data: OpsDashboardData }) {
    const t = useTranslations('dashboard.ops.decision');
    return (
        <Link
            href={data.decision.primaryAction}
            className={`block rounded-lg border p-4 transition ${data.decision.level === 'ok' ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10'}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('title')}</p>
                    <h3 className="mt-2 text-base font-bold text-white">{t(`${data.decision.code}.title`)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t(`${data.decision.code}.description`)}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
            </div>
        </Link>
    );
}

function WorkspaceInfoPanel({ title, badge, rows, children }: { title: string; badge: string; rows: Array<[string, string]>; children?: ReactNode }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</h3>
                <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{badge}</span>
            </div>
            <div className="divide-y divide-white/10 px-4 py-2">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-2 text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-white">{value}</span>
                    </div>
                ))}
            </div>
            {children ? <div className="px-4 pb-4">{children}</div> : null}
        </div>
    );
}

function WorkspaceProgress({ value }: { value: number }) {
    const safeValue = Math.max(0, Math.min(100, value));
    return (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${safeValue}%` }} />
        </div>
    );
}

function WorkspaceRecordList({ records, emptyTitle }: { records: PulseRecord[]; emptyTitle: string }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.025]">
            <div className="space-y-2 p-3">
                {records.length === 0 ? (
                    <EmptyState title={emptyTitle} description="" />
                ) : (
                    records.map((record) => (
                        <Link key={record.id} href={record.href} className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40 hover:bg-primary/5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-white">{record.title}</p>
                                    <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{record.description}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function MetricGrid({ items, columns = 4 }: { items: Array<[string, string | number]>; columns?: 3 | 4 }) {
    return (
        <div className={`grid gap-3 sm:grid-cols-2 ${columns === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
            {items.map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p className="mt-3 text-2xl font-bold text-white">{value}</p>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-md border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
            <Info className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold text-white">{title}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
        </div>
    );
}

export default function DashboardClient() {
    const t = useTranslations('dashboard');
    const tOps = useTranslations('dashboard.ops');
    const { user } = useAuth();
    const mountedRef = useRef(true);
    const [aiStatus, setAiStatus] = useState<{
        available: boolean;
        model?: string;
    } | null>(null);
    const [customerStats, setCustomerStats] = useState<any>(null);
    const [opsData, setOpsData] = useState<OpsDashboardData | null>(null);
    const [drawer, setDrawer] = useState<DrawerMode>(null);
    const [selectedPulse, setSelectedPulse] = useState<PulseId | null>(null);
    const [selectedPulseSegment, setSelectedPulseSegment] = useState<Record<PulseId, string>>({
        tickets: '7d',
        ai: '7d',
        crm: '24h',
        knowledge: '7d',
    });
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const userRoles = useMemo(() => roleList(user), [user]);
    const isCustomer = userRoles.includes('customer') || userRoles.includes('viewer');

    const loadData = useCallback(
        async (background = false) => {
            if (background) setRefreshing(true);
            try {
                if (isCustomer) {
                    const statsRes = await (
                        api.tickets as unknown as {
                            getSlaStats: () => Promise<unknown>;
                        }
                    )
                        .getSlaStats()
                        .catch(() => null);
                    if (mountedRef.current) setCustomerStats(statsRes);
                    return;
                }

                const [statusRes, opsRes] = await Promise.all([api.ai.status().catch(() => null), api.dashboard.ops(7).catch(() => emptyOpsData())]);
                if (mountedRef.current) {
                    setAiStatus(statusRes);
                    setOpsData(opsRes);
                    setLastUpdated(new Date());
                }
            } catch (err) {
                console.error('Dashboard load failed', err);
                if (mountedRef.current && !isCustomer) setOpsData(emptyOpsData());
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [isCustomer],
    );

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        void loadData(false);
    }, [loadData]);

    useEffect(() => {
        if (isCustomer) return;
        const interval = window.setInterval(() => {
            void loadData(true);
        }, 60000);
        return () => {
            window.clearInterval(interval);
        };
    }, [isCustomer, loadData]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    if (isCustomer) {
        return <CustomerDashboard stats={customerStats} />;
    }

    const data = opsData ?? emptyOpsData();
    const effectiveSystem =
        aiStatus?.available === false
            ? {
                  ...data,
                  system: { ...data.system, status: 'DEGRADED' as const },
              }
            : data;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto w-full max-w-[1720px] space-y-5">
            <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 lg:flex-row lg:items-center">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        {t('title')}
                    </h1>
                    <p className="ml-11 mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{t('telemetry_version')}</p>
                    {lastUpdated ? (
                        <p className="ml-11 mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                            {tOps('last_updated', {
                                time: formatRefreshTime(lastUpdated),
                            })}
                        </p>
                    ) : null}
                </div>
                <HeaderActions data={effectiveSystem} drawer={drawer} refreshing={refreshing} setDrawer={setDrawer} onRefresh={() => void loadData(true)} />
            </div>

            <TopDrawer mode={drawer} data={effectiveSystem} onClose={() => setDrawer(null)} />
            <OpsStatGrid data={data} />
            <PulseBand data={data} onSelect={setSelectedPulse} />
            <PulseDetailModal
                data={data}
                selected={selectedPulse}
                activeSegmentKey={selectedPulse ? selectedPulseSegment[selectedPulse] : undefined}
                onSegmentChange={(key) => {
                    if (!selectedPulse) return;
                    setSelectedPulseSegment((current) => ({
                        ...current,
                        [selectedPulse]: key,
                    }));
                }}
                onOpenChange={(open) => !open && setSelectedPulse(null)}
            />

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(360px,430px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(390px,430px)_minmax(0,1fr)]">
                <div className="space-y-4 xl:self-start">
                    <ActiveDesk data={data} />
                    <ActionQueue data={data} />
                    <LiveFeed data={data} />
                </div>
                <WorkspaceTabs data={data} />
            </div>
        </motion.div>
    );
}
