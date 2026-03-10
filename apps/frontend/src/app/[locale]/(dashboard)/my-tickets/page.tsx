'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function MyTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.tickets.list();
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
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

        const statusMap: Record<string, string> = {
            NEW: 'YENİ',
            OPEN: 'AÇIK',
            IN_PROGRESS: 'İŞLEMDE',
            PENDING_CUSTOMER: 'MÜŞTERİ BEKLENİYOR',
            RESOLVED: 'ÇÖZÜLDÜ',
            CLOSED: 'KAPANDI',
        };

        return <Badge variant={variants[status] || 'default'}>{statusMap[status] || status}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Destek Taleplerim</h1>
                    <p className="text-muted-foreground">Açtığınız tüm destek taleplerini buradan takip edebilirsiniz.</p>
                </div>
                <Button asChild data-testid="create-ticket-button">
                    <Link href="/tickets/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Yeni Talep Oluştur
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10">Yükleniyor...</div>
                ) : tickets.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-xl border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
                            <div className="space-y-1">
                                <p className="text-lg font-medium">Henüz bir talebiniz yok</p>
                                <p className="text-sm text-muted-foreground">Herhangi bir konuda yardıma ihtiyacınız olursa yeni bir talep başlatın.</p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/tickets/new">Hemen Başlat</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                            <Card className="bg-card/50 backdrop-blur-xl border-white/5 hover:bg-card/80 transition-all cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: tr })}
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
