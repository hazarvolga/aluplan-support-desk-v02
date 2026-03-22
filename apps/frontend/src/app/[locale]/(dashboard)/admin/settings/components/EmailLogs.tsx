'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Mail, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function EmailLogs() {
    const t = useTranslations('settings.email.logs');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const res = await api.email.logs(page, 10);
            setLogs(res.data);
            setTotal(res.total);
        } catch (error: any) {
            toast.error(t('toasts.logs_load_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [page]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> {t('status.sent')}</Badge>;
            case 'DELIVERED':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> {t('status.delivered')}</Badge>;
            case 'BOUNCED':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" /> {t('status.bounced')}</Badge>;
            case 'FAILED':
                return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" /> {t('status.failed')}</Badge>;
            default:
                return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20"><Clock className="h-3 w-3 mr-1" /> {t('status.pending')}</Badge>;
        }
    };

    return (
        <Card className="bg-card/20 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand-500" /> {t('title')}
                    </CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={loadLogs} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {loading && page === 1 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <div className="rounded-xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">{t('table.recipient')}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">{t('table.template')}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">{t('table.status')}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">{t('table.date')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs italic">
                                            {t('table.empty')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{log.to}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{log.messageId?.slice(0, 12)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-[10px] py-0">{log.templateName}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(log.status)}
                                            </TableCell>
                                            <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {total > 10 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 border-white/5 bg-slate-900/50"
                        >
                            {t('pagination.prev')}
                        </Button>
                        <span className="text-[10px] font-mono text-muted-foreground px-2">{t('pagination.page')} {page}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={logs.length < 10}
                            className="h-8 border-white/5 bg-slate-900/50"
                        >
                            {t('pagination.next')}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
