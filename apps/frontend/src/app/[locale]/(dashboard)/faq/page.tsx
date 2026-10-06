'use client';

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/role-guard';

export default function FaqPage() {
    const t = useTranslations('admin.faq');
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);
    const pendingActionRef = useRef<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT'>('ALL');
    const { toast } = useToast();
    const { user } = useAuth();
    const role = typeof user?.role === 'string'
        ? user.role.trim().replace(/-/g, '_').toUpperCase()
        : '';
    const canDelete = role === 'ADMIN' || Boolean(user?.permissions?.includes('*'));

    const beginAction = (id: string) => {
        if (pendingActionRef.current) return false;
        pendingActionRef.current = id;
        setPendingActionId(id);
        return true;
    };

    const finishAction = () => {
        pendingActionRef.current = null;
        setPendingActionId(null);
    };

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await api.faq.list(filter === 'ALL' ? undefined : filter);
            // API returns { data: [], total: ... } or just [] depending on implementation
            // Let's handle both based on previous findings about FaqService
            setFaqs(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            toast({ title: t('toasts.fetch_error'), description: String(error), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [filter]);

    const handleApprove = async (id: string) => {
        if (!beginAction(id)) return;
        try {
            await api.faq.approve(id);
            toast({ title: t('toasts.approved'), description: t('toasts.approved_desc') });
            await fetchFaqs();
        } catch (error) {
            toast({ title: t('toasts.op_failed'), description: String(error), variant: 'destructive' });
        } finally {
            finishAction();
        }
    };

    const handleDismiss = async (id: string) => {
        if (!beginAction(id)) return;
        try {
            await api.faq.dismiss(id);
            toast({ title: t('toasts.dismissed'), description: t('toasts.dismissed_desc') });
            await fetchFaqs();
        } catch (error) {
            toast({ title: t('toasts.op_failed'), description: String(error), variant: 'destructive' });
        } finally {
            finishAction();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete'))) return;
        if (!beginAction(id)) return;
        try {
            await api.faq.remove(id);
            toast({ title: t('toasts.deleted'), description: t('toasts.deleted_desc') });
            await fetchFaqs();
        } catch (error) {
            toast({ title: t('toasts.op_failed'), description: String(error), variant: 'destructive' });
        } finally {
            finishAction();
        }
    };

    const runPipeline = async () => {
        try {
            toast({ title: t('toasts.extraction_started'), description: t('toasts.extraction_started_desc') });
            await api.faq.runPipeline();
        } catch (error) {
            toast({ title: t('toasts.pipeline_failed'), description: String(error), variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold tracking-tight uppercase">{t('title')}</h1>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={loading} className="h-7 text-[10px] uppercase font-bold tracking-widest bg-muted/20">
                        <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        {t('refresh_cache')}
                    </Button>
                    <Button size="sm" onClick={runPipeline} className="h-7 text-[10px] uppercase font-bold tracking-widest">
                        <ArrowRight className="mr-2 h-3 w-3" />
                        {t('start_extraction')}
                    </Button>
                </div>
            </div>

            <div className="flex gap-1.5 pb-2">
                {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'DRAFT'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        onClick={() => setFilter(status as 'ALL' | 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT')}
                        size="sm"
                        className="h-6 px-3 text-[9px] uppercase font-bold tracking-widest rounded-none border-border/60"
                    >
                        {status === 'ALL' ? t('filters.all') :
                            status === 'PENDING_REVIEW' ? t('filters.pending_review') :
                                status === 'PUBLISHED' ? t('filters.published') :
                                    status === 'DRAFT' ? t('filters.draft') : status.replace('_', ' ')}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4">
                {faqs.length === 0 && !loading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('not_found')}</CardTitle>
                            <CardDescription>{t('not_found_desc')}</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {faqs.map((faq) => (
                    <Card key={faq.id} className="border-border/60">
                        <CardHeader className="py-2.5 px-3 bg-muted/10 border-b border-border/40">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`text-[9px] h-4 tracking-tighter ${faq.status === 'PUBLISHED' ? 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5' :
                                            faq.status === 'PENDING_REVIEW' ? 'border-orange-900/50 text-orange-400 bg-orange-400/5' : 'border-border text-muted-foreground bg-muted/5'
                                            }`}>
                                            {faq.status === 'PUBLISHED' ? t('filters.published') :
                                                faq.status === 'PENDING_REVIEW' ? t('filters.pending_review') :
                                                    faq.status === 'DRAFT' ? t('filters.draft') : faq.status}
                                        </Badge>
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">{t('frequency')}: {faq.frequency}</span>
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">{t('confidence_score')}: {Math.round(faq.confidenceScore * 100)}%</span>
                                    </div>
                                    <CardTitle className="text-[13px] tracking-tight">{faq.question}</CardTitle>
                                </div>
                                <div className="flex gap-1.5">
                                    {faq.status === 'PENDING_REVIEW' && (
                                        <>
                                            <Button disabled={pendingActionId !== null} size="sm" variant="outline" className="h-6 text-[9px] uppercase font-bold tracking-wider border-emerald-900/50 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" onClick={() => handleApprove(faq.id)}>
                                                {t('approve')}
                                            </Button>
                                            <Button disabled={pendingActionId !== null} size="sm" variant="outline" className="h-6 text-[9px] uppercase font-bold tracking-wider border-orange-900/50 text-orange-500 bg-orange-500/5 hover:bg-orange-500/10" onClick={() => handleDismiss(faq.id)}>
                                                {t('dismiss')}
                                            </Button>
                                        </>
                                    )}
                                    {canDelete && (
                                        <Button
                                            aria-label={t('delete')}
                                            title={t('delete')}
                                            disabled={pendingActionId !== null}
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                            onClick={() => handleDelete(faq.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="prose prose-xs dark:prose-invert max-w-none text-foreground/80 leading-relaxed italic">
                                "{faq.answer}"
                            </div>
                            {faq.sourceTicketId && (
                                <div className="mt-4 text-xs text-muted-foreground">
                                    {t('source_ticket')}: #{faq.sourceTicketId}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
