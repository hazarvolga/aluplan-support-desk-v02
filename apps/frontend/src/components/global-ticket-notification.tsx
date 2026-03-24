'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function GlobalTicketNotification() {
    const { toast } = useToast();

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.connect();

            const handleNewTicket = (ticket: any) => {
                console.log('📢 [GlobalTicketNotification] Received ticket:created event!', ticket);
                toast({
                    title: "🎟️ Yeni Ticket Oluşturuldu!",
                    description: `${ticket.creatorName || 'Bir müşteri'} yeni bir destek talebi açtı: "${ticket.subject}"`,
                    action: (
                        <ToastAction
                            altText="İncele"
                            onClick={() => window.open(`/tickets/${ticket.id}`, '_blank')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            İncele
                        </ToastAction>
                    ),
                    duration: 10000,
                });
            };

            socket.on('connect', () => console.log('🟢 [GlobalTicketNotification] Socket connected:', socket.id));
            socket.on('ticket:created', handleNewTicket);

            return () => {
                socket.off('connect');
                socket.off('ticket:created', handleNewTicket);
            };
        } catch (err) {
            console.warn('[GlobalTicketNotification] Socket init failed:', err);
        }
    }, [toast]);

    return null;
}
