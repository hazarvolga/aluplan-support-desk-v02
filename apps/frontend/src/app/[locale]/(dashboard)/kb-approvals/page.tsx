'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RefreshCw, Bot, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function KbApprovalsPage() {
    const t = useTranslations('kb_approvals');
    const tc = useTranslations('common');
    const locale = useLocale();
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            // Fetch only PENDING_REVIEW items
            const res = await api.faq.list('PENDING_REVIEW');
            setDrafts(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            toast.error(t('toasts.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.faq.approve(id);
            toast.success(t('toasts.approve_success'));
            fetchDrafts();
        } catch (error) {
            toast.error(t('toasts.approve_error'));
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await api.faq.dismiss(id);
            toast.info(t('toasts.dismiss_success'));
            fetchDrafts();
        } catch (error) {
            toast.error(t('toasts.dismiss_error'));
        }
    };

    const runPipeline = async () => {
        try {
            toast.info(t('toasts.pipeline_started'));
            await api.faq.runPipeline();
            // Fetch drafts down the line or wait for sockets...
        } catch (error) {
            toast.error(t('toasts.pipeline_error', { error: String(error) }));
        }
    };

    return (
        <div className="space-y-4 py-0">
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold tracking-tight uppercase flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        {t('title')}
                    </h1>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest leading-tight">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchDrafts} disabled={loading} className="h-7 text-[10px] uppercase font-bold tracking-widest bg-muted/20 border-border/60">
                        <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        {t('refresh_queue')}
                    </Button>
                    <Button size="sm" onClick={runPipeline} className="h-7 text-[10px] uppercase font-bold tracking-widest bg-emerald-600 hover:bg-emerald-700">
                        {t('run_pipeline')}
                    </Button>
                </div>
            </div>

            <Card className="border-border/60">
                <CardHeader className="py-2.5 px-3 bg-muted/10 border-b border-border/40">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-between text-muted-foreground">
                        <span>{t('queue_title')}</span>
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-900/50 rounded-none h-4 px-1.5 text-[9px] font-mono">
                            {t('units_loaded', { count: drafts.length })}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
                        </div>
                    ) : drafts.length === 0 ? (
                        <div className="text-center py-20">
                            <ShieldCheck className="h-16 w-16 text-green-500/50 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white">{t('empty.title')}</h2>
                            <p className="text-muted-foreground mt-2">{t('empty.desc')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="w-[300px] h-8 text-[9px] uppercase font-bold tracking-widest font-mono">{t('table.query')}</TableHead>
                                    <TableHead className="h-8 text-[9px] uppercase font-bold tracking-widest font-mono">{t('table.answer')}</TableHead>
                                    <TableHead className="w-[120px] text-center h-8 text-[9px] uppercase font-bold tracking-widest font-mono">{t('table.confidence')}</TableHead>
                                    <TableHead className="w-[100px] text-center h-8 text-[9px] uppercase font-bold tracking-widest font-mono">{t('table.source')}</TableHead>
                                    <TableHead className="w-[180px] text-right h-8 text-[9px] uppercase font-bold tracking-widest font-mono">{t('table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drafts.map((draft) => (
                                    <TableRow key={draft.id} className="border-border/20 group">
                                        <TableCell className="font-medium align-top py-3">
                                            <div className="flex gap-2">
                                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="text-[12px] leading-tight tracking-tight uppercase font-bold">{draft.question}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-3">
                                            <p className="text-[11px] text-foreground/70 leading-relaxed italic line-clamp-3">"{draft.answer}"</p>
                                        </TableCell>
                                        <TableCell className="align-top text-center py-3">
                                            <Badge variant="outline" className={`h-4 px-1.5 text-[9px] font-mono rounded-none ${draft.confidenceScore >= 0.85 ? 'text-emerald-400 border-emerald-900/50 bg-emerald-500/5' :
                                                draft.confidenceScore >= 0.60 ? 'text-amber-400 border-amber-900/50 bg-amber-500/5' :
                                                    'text-red-400 border-red-900/50 bg-red-500/5'}
                                            `}>
                                                {t('table.reliable', { percent: Math.round(draft.confidenceScore * 100) })}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="align-top text-center py-3">
                                            {draft.sourceTicketId ? (
                                                <Link href={`/${locale}/tickets/${draft.sourceTicketId}`} target="_blank" className="font-mono text-[9px] text-primary hover:underline uppercase tracking-tighter">
                                                    INC_{draft.sourceTicketId.substring(0, 6)}
                                                </Link>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="align-top text-right py-3">
                                            <div className="flex justify-end gap-1.5">
                                                <Button size="sm" variant="outline" onClick={() => handleApprove(draft.id)} className="h-6 text-[9px] font-bold uppercase border-emerald-900/50 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-none">
                                                    {t('buttons.approve')}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDismiss(draft.id)} className="h-6 text-[9px] font-bold uppercase border-red-900/50 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-none">
                                                    {t('buttons.delete')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
