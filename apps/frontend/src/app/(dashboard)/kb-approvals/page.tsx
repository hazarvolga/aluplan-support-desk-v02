'use client';

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

export default function KbApprovalsPage() {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            // Fetch only PENDING_REVIEW items
            const res = await api.faq.list('PENDING_REVIEW');
            setDrafts(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            toast.error('Taslaklar alınırken hata oluştu.');
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
            toast.success('Makale Bilgi Bankasında yayınlandı! 🚀');
            fetchDrafts();
        } catch (error) {
            toast.error('Onaylama işlemi başarısız.');
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await api.faq.dismiss(id);
            toast.info('Makale taslağı reddedildi.');
            fetchDrafts();
        } catch (error) {
            toast.error('Reddetme işlemi başarısız.');
        }
    };

    const runPipeline = async () => {
        try {
            toast.info('Boru hattı başlatıldı, bu işlem arkaplanda çalışacaktır...');
            await api.faq.runPipeline();
            // Fetch drafts down the line or wait for sockets...
        } catch (error) {
            toast.error('Pipeline başlatılamadı: ' + String(error));
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-2">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bot className="h-8 w-8 text-violet-500" />
                        AI Doküman Onayları
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Müşteri biletlerinden Yapay Zeka tarafından otomatik çıkarılmış Bilgi Bankası makalelerini (Self-Learning KB) inceleyin ve yayınlayın.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchDrafts} disabled={loading} className="border-white/10 hover:bg-white/5">
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                    <Button onClick={runPipeline} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
                        Boru Hattını Çalıştır
                    </Button>
                </div>
            </div>

            <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/50 pb-4 border-b border-white/5">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Bekleyen Onaylar</span>
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-none">
                            {drafts.length} Taslak
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
                            <h2 className="text-xl font-bold text-white">Tüm makaleler incelendi!</h2>
                            <p className="text-muted-foreground mt-2">Şu an onay bekleyen yeni bir AI taslağı bulunmuyor.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="w-[300px]">Üretilen Soru</TableHead>
                                    <TableHead>Üretilen Cevap</TableHead>
                                    <TableHead className="w-[120px] text-center">AI Güven Skoru</TableHead>
                                    <TableHead className="w-[100px] text-center">İlgili Bilet</TableHead>
                                    <TableHead className="w-[180px] text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drafts.map((draft) => (
                                    <TableRow key={draft.id} className="border-white/5 group">
                                        <TableCell className="font-medium align-top">
                                            <div className="flex gap-2">
                                                <FileText className="h-4 w-4 text-violet-400 shrink-0 mt-1" />
                                                <span className="text-sm line-clamp-3">{draft.question}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="text-sm text-slate-300 line-clamp-3 mb-2">{draft.answer}</p>
                                        </TableCell>
                                        <TableCell className="align-top text-center">
                                            <Badge variant="outline" className={`
                                                ${draft.confidenceScore >= 0.85 ? 'text-green-400 border-green-500/30' :
                                                    draft.confidenceScore >= 0.60 ? 'text-amber-400 border-amber-500/30' :
                                                        'text-red-400 border-red-500/30'}
                                            `}>
                                                {Math.round(draft.confidenceScore * 100)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="align-top text-center">
                                            {draft.sourceTicketId ? (
                                                <Link href={`/tickets/${draft.sourceTicketId}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline">
                                                    #{draft.sourceTicketId.substring(0, 6)} <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleApprove(draft.id)} className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDismiss(draft.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                    <XCircle className="h-5 w-5" />
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
