'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Brain,
    Zap,
    CheckCircle2,
    FileText,
    RefreshCw,
    LineChart,
    Eye,
    Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Link } from '@/i18n/routing';
import { AiAnswerContent } from '@/components/ai/ai-answer-content';

type FaqCandidateSource = {
    id: string;
    sourceType: string;
    ticket?: { id: string; ticketNumber: string } | null;
    interaction?: { id: string; createdAt?: string } | null;
};

type FaqLearningCandidate = {
    id: string;
    question: string;
    answer: string;
    confidenceScore: number;
    frequency: number;
    tags?: string[];
    language?: string;
    sourceTypes?: string[];
    sources?: FaqCandidateSource[];
};

export default function FaqLearningPage() {
    const t = useTranslations('admin.faq_learning');
    const [stats, setStats] = useState<{
        totalInteractions: number;
        deflectionRate: number;
        aiAccuracy: number;
        confidenceDistribution: Array<{ confidence: string; count: number }>;
    }>({
        totalInteractions: 0,
        deflectionRate: 0,
        aiAccuracy: 0,
        confidenceDistribution: []
    });
    const [sourceStats, setSourceStats] = useState({
        pillars: {
            DOCUMENTS: 0,
            ARTICLES: 0,
            URLS: 0,
            TICKETS: 0
        },
        totalSources: 0
    });
    const [candidates, setCandidates] = useState<FaqLearningCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [pipelineInFlight, setPipelineInFlight] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<FaqLearningCandidate | null>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'dismiss' | null>(null);
    const { toast } = useToast();

    const load = async () => {
        setLoading(true);
        try {
            const [faqRes, healthRes, sourceRes] = await Promise.all([
                api.faq.list('PENDING_REVIEW'),
                api.ai.getHealthMetrics(),
                api.ai.getSourcesStats()
            ]);

            setCandidates(Array.isArray(faqRes) ? faqRes : faqRes.data || []);
            setStats(healthRes as any);
            setSourceStats(sourceRes);

        } catch (error) {
            toast({ title: t('toasts.sync_error'), description: String(error), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const runPipeline = async () => {
        setPipelineInFlight(true);
        try {
            toast({ title: t('toasts.pipeline_started'), description: t('toasts.pipeline_desc') });
            await api.faq.runPipeline();
            // In a real scenario, this might take a while, but for now we refetch.
            setTimeout(load, 3000);
        } catch (error) {
            toast({ title: t('toasts.pipeline_exception'), description: String(error), variant: 'destructive' });
        } finally {
            setPipelineInFlight(false);
        }
    };

    const handleCommit = async (id: string) => {
        if (reviewAction) return;
        setReviewAction('approve');
        try {
            await api.faq.approve(id);
            toast({ title: t('toasts.knowledge_committed'), description: t('toasts.knowledge_committed_desc') });
            setSelectedCandidate(null);
            await load();
        } catch (error) {
            toast({ title: t('toasts.commit_error'), description: String(error), variant: 'destructive' });
        } finally {
            setReviewAction(null);
        }
    };

    const handleDismiss = async (id: string) => {
        if (reviewAction) return;
        setReviewAction('dismiss');
        try {
            await api.faq.dismiss(id);
            toast({ title: t('toasts.dismissed'), description: t('toasts.dismissed_desc') });
            setSelectedCandidate(null);
            await load();
        } catch (error) {
            toast({ title: t('toasts.dismiss_error'), description: String(error), variant: 'destructive' });
        } finally {
            setReviewAction(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight uppercase flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {t('title')}
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={load}
                        className="h-8 text-[10px] uppercase font-bold tracking-widest border-border/40 rounded-none"
                    >
                        <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('refresh')}
                    </Button>
                    <Button
                        onClick={runPipeline}
                        disabled={pipelineInFlight || loading}
                        className="h-8 text-[10px] uppercase font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                    >
                        {pipelineInFlight ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                        {t('trigger_loop')}
                    </Button>
                </div>
            </div>

            {/* Health Dashboard & Pipeline Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Removed SourceArchitectureView column */}
                <Card className="lg:col-span-2 border-border/60 bg-muted/5">
                    <CardHeader className="py-3 px-4 border-b border-border/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <LineChart className="h-3.5 w-3.5" /> {t('health_analysis')}
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-primary">
                            {t('realtime_telemetry_label')}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('resolution_rate')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-emerald-400">%{stats.deflectionRate || 0}</span>
                                    <span className="text-[11px] text-muted-foreground">{t('prevented_tickets')}</span>
                                </div>
                                <Progress value={stats.deflectionRate || 0} className="h-1 rounded-none bg-muted" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('writing_accuracy')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-primary">%{stats.aiAccuracy || 0}</span>
                                    <span className="text-[11px] text-muted-foreground">{t('highest_confidence')}</span>
                                </div>
                                <Progress value={stats.aiAccuracy || 0} className="h-1 rounded-none bg-muted accent-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('total_interactions')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-foreground">{stats.totalInteractions || 0}</span>
                                    <span className="text-[11px] text-muted-foreground">{t('last_30_days')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/20">
                            <h4 className="mb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('confidence_distribution')}</h4>
                            <div className="space-y-3">
                                {['HIGH', 'MEDIUM', 'LOW', 'NO_MATCH'].map(band => {
                                    const bandData = (stats as any).confidenceDistribution?.find((d: any) => d.band === band) || { count: 0 };
                                    const percentage = stats.totalInteractions > 0 ? (bandData.count / stats.totalInteractions) * 100 : 0;
                                    const label = t(`bands.${band.toLowerCase()}`);
                                    return (
                                        <div key={band} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                                                <span>{label}</span>
                                                <span>{bandData.count} ({Math.round(percentage)}%)</span>
                                            </div>
                                            <Progress value={percentage} className={`h-1 rounded-none bg-muted ${band === 'HIGH' ? 'bg-emerald-500/20' : band === 'LOW' ? 'bg-orange-500/20' : ''}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-muted/5 flex flex-col">
                    <CardHeader className="py-3 px-4 border-b border-border/20">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5" /> {t('flow_status')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider">{t('ingestion_engine')}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{t('ingestion_engine_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${pipelineInFlight ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted-foreground/40'}`} />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider">{t('abstraction_layer')}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{t('abstraction_layer_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${candidates.length > 0 ? 'bg-orange-400' : 'bg-muted-foreground/40'}`} />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-wider">{t('validation_queue')}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{t('validation_queue_desc', { count: candidates.length })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border/20 pt-4 text-[9px] font-mono text-muted-foreground/60 uppercase text-center">
                            {t('last_sync')}: {new Date().toLocaleTimeString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                    <h2 className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-400" />
                        {t('candidates_title')}
                    </h2>
                    <Badge variant="outline" className="text-[9px] font-mono border-orange-500/20 text-orange-400">
                        {t('waiting_validation')}: {candidates.length}
                    </Badge>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="border border-dashed border-border/40 p-12 text-center bg-muted/5 opacity-50">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">{t('all_synced')}</p>
                        <p className="text-[9px] font-mono mt-1 opacity-60">{t('all_synced_desc')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {candidates.map((c) => (
                            <Card key={c.id} className="border-border/60 group hover:border-primary/40 transition-all bg-black/20">
                                <CardContent className="p-4">
                                    <div className="flex justify-between gap-6">
                                        <div className="flex-1 space-y-3 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <Badge className="text-[9px] h-4 bg-orange-500/10 text-orange-400 border-orange-400/20 uppercase tracking-tighter">
                                                    {t('waiting_validation')}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase">
                                                    <Zap className="h-2.5 w-2.5 text-primary" />
                                                    {t('highest_confidence')}: %{Math.round(c.confidenceScore * 100)}
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase opacity-40">
                                                    | {t('refresh')}: {c.frequency}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[14px] font-bold text-foreground mb-1">
                                                    Q: {c.question}
                                                </h3>
                                                <div className="p-3 bg-muted/10 border-l-2 border-primary/30 prose prose-xs dark:prose-invert max-w-none text-foreground/70 italic line-clamp-3">
                                                    "{c.answer}"
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {c.tags?.map((t: string) => (
                                                    <span key={t} className="text-[9px] font-mono text-primary/40">#{t.toUpperCase()}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedCandidate(c)}
                                                className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest border-primary/30 text-primary hover:bg-primary/10 rounded-none"
                                            >
                                                <Eye className="mr-2 h-3 w-3" />
                                                {t('review_candidate')}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={Boolean(selectedCandidate)}
                onOpenChange={(open) => {
                    if (!open && !reviewAction) setSelectedCandidate(null);
                }}
            >
                <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
                    <DialogHeader className="m-0 px-6 py-5">
                        <DialogTitle className="text-sm">{t('candidate_detail')}</DialogTitle>
                        <DialogDescription>{t('candidate_detail_desc')}</DialogDescription>
                    </DialogHeader>

                    {selectedCandidate && (
                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                            <div className="mb-5 flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                                    {t('highest_confidence')}: %{Math.round(selectedCandidate.confidenceScore * 100)}
                                </Badge>
                                <Badge variant="outline">
                                    {t('frequency')}: {selectedCandidate.frequency}
                                </Badge>
                                {selectedCandidate.language && (
                                    <Badge variant="outline">{t('language')}: {selectedCandidate.language.toUpperCase()}</Badge>
                                )}
                            </div>

                            <section className="space-y-2 border-b border-border/40 pb-5">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('full_question')}
                                </h3>
                                <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-foreground">
                                    {selectedCandidate.question}
                                </p>
                            </section>

                            <section className="space-y-2 border-b border-border/40 py-5">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('full_answer')}
                                </h3>
                                <AiAnswerContent
                                    content={selectedCandidate.answer}
                                    className="break-words border-l-2 border-primary/40 bg-muted/10 p-4 text-sm leading-7 text-foreground/85"
                                />
                            </section>

                            <section className="space-y-3 pt-5">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('source_records')}
                                </h3>
                                {selectedCandidate.sources?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.sources.map(source => source.ticket ? (
                                            <Link
                                                key={source.id}
                                                href={`/tickets/${source.ticket.id}`}
                                                className="border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-mono text-primary hover:bg-primary/10"
                                            >
                                                {source.ticket.ticketNumber}
                                            </Link>
                                        ) : (
                                            <span key={source.id} className="border border-border/50 px-3 py-2 text-xs font-mono text-muted-foreground">
                                                {source.sourceType}: {source.interaction?.id ?? source.id}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">{t('no_source_records')}</p>
                                )}
                            </section>
                        </div>
                    )}

                    <DialogFooter className="m-0 gap-2 bg-card px-6 py-4">
                        <Button
                            variant="ghost"
                            disabled={Boolean(reviewAction)}
                            onClick={() => selectedCandidate && handleDismiss(selectedCandidate.id)}
                            className="h-9 rounded-none text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500"
                        >
                            {reviewAction === 'dismiss' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            {reviewAction === 'dismiss' ? t('dismissing') : t('dismiss')}
                        </Button>
                        <Button
                            disabled={Boolean(reviewAction)}
                            onClick={() => selectedCandidate && handleCommit(selectedCandidate.id)}
                            className="h-9 rounded-none border border-emerald-500/20 bg-emerald-500/10 px-5 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/20"
                        >
                            {reviewAction === 'approve' && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            {reviewAction === 'approve' ? t('approving') : t('add_to_kb')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
