'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function GlobalTicketNotification() {
    const { toast } = useToast();

    // We are optionally using next-intl, but since we don't have the exact translation keys 
    // for this new feature, we can construct the text clearly.
    // If you add this to the translation files, you can update it later.

    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        const handleNewTicket = (ticket: any) => {
            toast({
                title: "🎟️ Yeni Ticket Oluşturuldu!",
                description: `${ticket.creatorName} isimli müşteri, ${ticket.productName ? ticket.productName + ' ile ilgili' : ''} yeni bir destek talebi açtı: "${ticket.subject}"`,
                action: (
                    <ToastAction
                        altText="İncele"
                        onClick={() => window.open(`/admin/tickets/${ticket.id}`, '_blank')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        İncele
                    </ToastAction>
                ),
                duration: 10000, // Stay visible for a bit longer
            });
        };

        socket.on('ticket:created', handleNewTicket);

        return () => {
            socket.off('ticket:created', handleNewTicket);
        };
    }, [socket, toast]);

    return null;
}
