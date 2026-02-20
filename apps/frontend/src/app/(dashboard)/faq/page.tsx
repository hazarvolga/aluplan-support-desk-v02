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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
                    <p className="text-muted-foreground">Review and manage automatically generated FAQs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchFaqs} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={runPipeline}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Run Pipeline Now
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 pb-4">
                {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'DRAFT'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        onClick={() => setFilter(status as any)}
                        size="sm"
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
                    <Card key={faq.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            faq.status === 'PUBLISHED' ? 'default' :
                                                faq.status === 'PENDING_REVIEW' ? 'destructive' : 'secondary'
                                        }>
                                            {faq.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Freq: {faq.frequency}</span>
                                        <span className="text-xs text-muted-foreground">Score: {Math.round(faq.confidenceScore * 100)}%</span>
                                    </div>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    {faq.status === 'PENDING_REVIEW' && (
                                        <>
                                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(faq.id)}>
                                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDismiss(faq.id)}>
                                                <XCircle className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => handleDismiss(faq.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p>{faq.answer}</p>
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
