'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api, type ReviewCenterItem, type ReviewCenterSummary } from '@/lib/api';
import { getReviewCenterDefinition } from '@/components/review-center/review-center-registry';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type ResolvedItem = ReviewCenterItem & {
    definition: NonNullable<ReturnType<typeof getReviewCenterDefinition>>;
};

export default function ReviewCenterClient() {
    const t = useTranslations('review_center');
    const [summary, setSummary] = useState<ReviewCenterSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadSummary = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            setSummary(await api.reviewCenter.summary());
        } catch {
            setSummary(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    const resolvedItems = useMemo<ResolvedItem[]>(() => (summary?.items ?? [])
        .map((item) => {
            const definition = getReviewCenterDefinition(item.id);
            return definition ? { ...item, definition } : null;
        })
        .filter((item): item is ResolvedItem => item !== null), [summary]);

    const actions = resolvedItems.filter((item) => item.kind === 'ACTION');
    const audits = resolvedItems.filter((item) => item.kind === 'AUDIT');
    const urgentActions = actions.filter((item) => item.priority === 'URGENT');
    const editorialActions = actions.filter((item) => item.priority !== 'URGENT');

    if (loading) {
        return <ReviewCenterSkeleton />;
    }

    if (error) {
        return (
            <main className="flex min-h-full items-center justify-center p-6">
                <section className="w-full max-w-lg border border-red-500/25 bg-red-500/[0.04] p-8 text-center">
                    <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-400" />
                    <h1 className="text-xl font-semibold text-white">{t('error.title')}</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('error.description')}</p>
                    <Button className="mt-6" onClick={() => void loadSummary()}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {t('error.retry')}
                    </Button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-full bg-[#0b0f17] px-5 py-6 lg:px-10 lg:py-9">
            <header className="relative overflow-hidden border border-white/10 bg-[#101722] px-6 py-7 lg:px-8">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-primary/20" />
                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            {t('eyebrow')}
                        </div>
                        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                            {t('title')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>
                    <div className="min-w-40 border-l border-white/10 pl-6">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            {t('pending_label')}
                        </span>
                        <span data-testid="pending-actions-total" className="mt-2 block text-5xl font-light tabular-nums text-white">
                            {summary?.pendingActions ?? 0}
                        </span>
                    </div>
                </div>
            </header>

            {actions.length === 0 && audits.length === 0 ? (
                <section className="mt-6 border border-emerald-400/20 bg-emerald-400/[0.04] p-10 text-center">
                    <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-400" />
                    <h2 className="mt-4 text-xl font-semibold text-white">{t('empty.title')}</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t('empty.description')}</p>
                </section>
            ) : (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <ReviewLane title={t('groups.operational')} subtitle={t('groups.operational_desc')} items={urgentActions} t={t} urgent />
                    <ReviewLane title={t('groups.editorial')} subtitle={t('groups.editorial_desc')} items={editorialActions} t={t} />
                </div>
            )}

            {audits.length > 0 && (
                <section className="mt-6 border-t border-white/10 pt-6">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{t('groups.follow_up')}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">{t('groups.follow_up_desc')}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t('audit_label')}</span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                        {audits.map((item) => <ReviewCard key={item.id} item={item} t={t} />)}
                    </div>
                </section>
            )}
        </main>
    );
}

function ReviewLane({ title, subtitle, items, t, urgent = false }: {
    title: string;
    subtitle: string;
    items: ResolvedItem[];
    t: ReturnType<typeof useTranslations>;
    urgent?: boolean;
}) {
    return (
        <section className={`border p-5 ${urgent ? 'border-amber-400/25 bg-amber-400/[0.025]' : 'border-white/10 bg-white/[0.015]'}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
                </div>
                <span className={`mt-1 h-2 w-2 ${urgent ? 'bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.7)]' : 'bg-primary'}`} />
            </div>
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => <ReviewCard key={item.id} item={item} t={t} />)}
                </div>
            ) : (
                <p className="border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
                    {t('groups.clear')}
                </p>
            )}
        </section>
    );
}

function ReviewCard({ item, t }: { item: ResolvedItem; t: ReturnType<typeof useTranslations> }) {
    const Icon = item.definition.icon;
    const isAudit = item.kind === 'AUDIT';
    return (
        <Link
            href={item.href}
            data-testid={`${isAudit ? 'audit' : 'action'}-${item.id}`}
            className="group grid grid-cols-[auto_1fr_auto] gap-4 border border-white/10 bg-[#0d131d] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
            <div className="flex h-10 w-10 items-center justify-center border border-primary/20 bg-primary/[0.06] text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{t(item.definition.titleKey)}</h3>
                    {item.priority === 'URGENT' && (
                        <span className="border border-amber-400/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                            {t('urgent')}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(item.definition.descriptionKey)}</p>
                <p className="mt-2 text-[10px] leading-4 text-muted-foreground/70">
                    <span className="font-semibold uppercase tracking-wider text-primary/80">{t('why_label')} </span>
                    {t(item.definition.reasonKey)}
                </p>
            </div>
            <div className="flex flex-col items-end justify-between gap-3">
                {!isAudit && (
                    <span className="text-2xl font-light tabular-nums text-white">{item.count ?? 0}</span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
        </Link>
    );
}

function ReviewCenterSkeleton() {
    return (
        <main className="min-h-full bg-[#0b0f17] p-6 lg:p-10" aria-label="loading">
            <Skeleton className="h-52 w-full rounded-none" />
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Skeleton className="h-80 rounded-none" />
                <Skeleton className="h-80 rounded-none" />
            </div>
        </main>
    );
}
