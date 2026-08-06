'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Brain, ChevronLeft, ChevronRight, RefreshCw, Search, Ticket, UserRound } from 'lucide-react';
import { api, AiInteractionHistoryItem } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { AiAnswerContent } from '@/components/ai/ai-answer-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TicketState = 'ALL' | 'TICKETED' | 'TICKETLESS';
type Confidence = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';

export function AiInteractionHistory() {
    const t = useTranslations('admin.ai_interactions');
    const locale = useLocale();
    const interactionId = useSearchParams().get('interactionId') ?? undefined;
    const [items, setItems] = useState<AiInteractionHistoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [ticketState, setTicketState] = useState<TicketState>('ALL');
    const [confidence, setConfidence] = useState<Confidence>('ALL');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await api.ai.listInteractions({ page, limit: 20, ticketState, confidence, search, interactionId });
            setItems(result.data);
            setPages(Math.max(result.pages, 1));
            setTotal(result.total);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [confidence, interactionId, page, search, ticketState]);

    useEffect(() => {
        load();
    }, [load]);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const formatDate = (value: string) => new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));

    return (
        <div className="space-y-4">
            <form onSubmit={submitSearch} className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder={t('search_placeholder')}
                        aria-label={t('search')}
                        className="pl-9"
                    />
                </div>
                <select
                    aria-label={t('ticket_state')}
                    value={ticketState}
                    onChange={(event) => { setPage(1); setTicketState(event.target.value as TicketState); }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="ALL">{t('all_ticket_states')}</option>
                    <option value="TICKETED">{t('ticketed')}</option>
                    <option value="TICKETLESS">{t('ticketless')}</option>
                </select>
                <select
                    aria-label={t('confidence')}
                    value={confidence}
                    onChange={(event) => { setPage(1); setConfidence(event.target.value as Confidence); }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW', 'NO_MATCH'] as Confidence[]).map((value) => (
                        <option key={value} value={value}>{t(`confidence_values.${value}`)}</option>
                    ))}
                </select>
                <Button type="submit">{t('search')}</Button>
            </form>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('result_count', { count: total })}</span>
                <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                </Button>
            </div>

            {loading ? (
                <div className="space-y-3" aria-label={t('loading')}>
                    {[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-lg border border-border/50 bg-muted/20" />)}
                </div>
            ) : error ? (
                <Card><CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-destructive">{t('load_error')}</p>
                    <Button variant="outline" onClick={load}>{t('retry')}</Button>
                </CardContent></Card>
            ) : items.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">{t('empty')}</CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <InteractionCard key={item.id} item={item} formatDate={formatDate} />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label={t('previous')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{t('page', { page, pages })}</span>
                <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)} aria-label={t('next')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function InteractionCard({ item, formatDate }: { item: AiInteractionHistoryItem; formatDate: (value: string) => string }) {
    const t = useTranslations('admin.ai_interactions');
    const confidence = item.confidenceBand ?? 'NO_MATCH';

    return (
        <Card className="border-border/60">
            <CardContent className="space-y-3 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <UserRound className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{item.user?.fullName ?? t('unknown_user')}</span>
                            {item.user?.companyName && <span className="text-xs text-muted-foreground">{item.user.companyName}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.user?.email ?? t('unknown_email')} · {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{t(`confidence_values.${confidence}`)}</Badge>
                        {item.ticket ? (
                            <Link href={`/tickets/${item.ticket.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <Ticket className="h-3.5 w-3.5" />{item.ticket.ticketNumber}
                            </Link>
                        ) : (
                            <Badge variant="secondary">{t('ticketless')}</Badge>
                        )}
                    </div>
                </div>

                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('question')}</p>
                    <p className="whitespace-pre-wrap text-sm">{item.userQuery}</p>
                </div>

                <details className="rounded-md border border-border/50 bg-muted/10 p-3" open>
                    <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-widest text-primary">
                        <span className="inline-flex items-center gap-2"><Brain className="h-3.5 w-3.5" />{t('answer')}</span>
                    </summary>
                    <div className="mt-3 border-t border-border/40 pt-3">
                        {item.responseGenerated?.trim()
                            ? <AiAnswerContent content={item.responseGenerated} />
                            : <p className="text-sm text-muted-foreground">{t('no_answer')}</p>}
                    </div>
                </details>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                    <span>{t('provider')}: {item.provider ?? '-'}</span>
                    <span>{t('model')}: {item.model ?? '-'}</span>
                    <span>{t('source_article')}: {item.matchedArticle?.title ?? '-'}</span>
                </div>
            </CardContent>
        </Card>
    );
}
