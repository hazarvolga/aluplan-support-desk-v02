'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api, isBackendUnavailableError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Clock, ServerCrash, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { tr, enUS, de } from 'date-fns/locale';

export default function MyTicketsPage() {
    const t = useTranslations('my_tickets');
    const ct = useTranslations('common');
    const tt = useTranslations('tickets');
    const locale = useLocale();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<'backend_unavailable' | 'unknown' | null>(null);

    const dateLocale = locale === 'tr' ? tr : locale === 'de' ? de : enUS;

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await api.tickets.list();
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            setLoadError(isBackendUnavailableError(error) ? 'backend_unavailable' : 'unknown');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            NEW: 'destructive',
            OPEN: 'default',
            IN_PROGRESS: 'secondary',
            PENDING_CUSTOMER: 'outline',
            RESOLVED: 'success',
            CLOSED: 'ghost',
        };

        return <Badge variant={variants[status] || 'default'}>{tt(`status.${status}`)}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button asChild data-testid="create-ticket-button">
                    <Link href={`/${locale}/tickets/new`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('new_ticket')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10">{ct('loading')}</div>
                ) : loadError ? (
                    <Card className="border-orange-500/20 bg-orange-500/5">
                        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                                <ServerCrash className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium">{t(`errors.${loadError}.title`)}</p>
                                <p className="text-sm text-muted-foreground">{t(`errors.${loadError}.desc`)}</p>
                            </div>
                            <Button variant="outline" onClick={fetchTickets}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                {ct('retry')}
                            </Button>
                        </CardContent>
                    </Card>
                ) : tickets.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-xl border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
                            <div className="space-y-1">
                                <p className="text-lg font-medium">{t('empty.title')}</p>
                                <p className="text-sm text-muted-foreground">{t('empty.desc')}</p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={`/${locale}/tickets/new`}>{t('empty.button')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/${locale}/tickets/${ticket.id}`}>
                            <Card className="bg-card/50 backdrop-blur-xl border-white/5 hover:bg-card/80 transition-all cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: dateLocale })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
