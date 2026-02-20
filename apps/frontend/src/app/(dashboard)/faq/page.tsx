'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FaqPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT'>('ALL');
    const { toast } = useToast();

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await api.faq.list(filter === 'ALL' ? undefined : filter);
            // API returns { data: [], total: ... } or just [] depending on implementation
            // Let's handle both based on previous findings about FaqService
            setFaqs(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            toast({ title: 'Error fetching FAQs', description: String(error), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [filter]);

    const handleApprove = async (id: string) => {
        try {
            await api.faq.approve(id);
            toast({ title: 'FAQ Approved', description: 'Sample has been published.' });
            fetchFaqs();
        } catch (error) {
            toast({ title: 'Operation failed', description: String(error), variant: 'destructive' });
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await api.faq.dismiss(id);
            toast({ title: 'FAQ Dismissed', description: 'Sample moved to draft/deleted.' });
            fetchFaqs();
        } catch (error) {
            toast({ title: 'Operation failed', description: String(error), variant: 'destructive' });
        }
    };

    const runPipeline = async () => {
        try {
            toast({ title: 'Pipeline Started', description: 'FAQ extraction pipeline is running in background.' });
            await api.faq.runPipeline();
        } catch (error) {
            toast({ title: 'Failed to run pipeline', description: String(error), variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold tracking-tight uppercase">FAQ_MANAGEMENT_UNIT</h1>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Review and synchronize automatically extracted operational knowledge specimens.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={loading} className="h-7 text-[10px] uppercase font-bold tracking-widest bg-muted/20">
                        <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        RELOAD_CACHE
                    </Button>
                    <Button size="sm" onClick={runPipeline} className="h-7 text-[10px] uppercase font-bold tracking-widest">
                        <ArrowRight className="mr-2 h-3 w-3" />
                        RUN_EXTRACTION
                    </Button>
                </div>
            </div>

            <div className="flex gap-1.5 pb-2">
                {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'DRAFT'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        onClick={() => setFilter(status as any)}
                        size="sm"
                        className="h-6 px-3 text-[9px] uppercase font-bold tracking-widest rounded-none border-border/60"
                    >
                        {status.replace('_', ' ')}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4">
                {faqs.length === 0 && !loading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No FAQs found</CardTitle>
                            <CardDescription>Try changing the filter or run the pipeline to generate new ones.</CardDescription>
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
                                            {faq.status}
                                        </Badge>
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">FREQ: {faq.frequency}</span>
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">CONFIDENCE: {Math.round(faq.confidenceScore * 100)}%</span>
                                    </div>
                                    <CardTitle className="text-[13px] tracking-tight">{faq.question}</CardTitle>
                                </div>
                                <div className="flex gap-1.5">
                                    {faq.status === 'PENDING_REVIEW' && (
                                        <>
                                            <Button size="sm" variant="outline" className="h-6 text-[9px] uppercase font-bold tracking-wider border-emerald-900/50 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" onClick={() => handleApprove(faq.id)}>
                                                COMMIT
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-6 text-[9px] uppercase font-bold tracking-wider border-orange-900/50 text-orange-500 bg-orange-500/5 hover:bg-orange-500/10" onClick={() => handleDismiss(faq.id)}>
                                                DISCARD
                                            </Button>
                                        </>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleDismiss(faq.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="prose prose-xs dark:prose-invert max-w-none text-foreground/80 leading-relaxed italic">
                                "{faq.answer}"
                            </div>
                            {faq.sourceTicketId && (
                                <div className="mt-4 text-xs text-muted-foreground">
                                    Source Ticket: #{faq.sourceTicketId}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
