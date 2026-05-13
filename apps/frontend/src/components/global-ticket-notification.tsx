'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function GlobalTicketNotification() {
    const { toast } = useToast();
    const t = useTranslations('notifications');
    const toastRef = useRef(toast);
    toastRef.current = toast;

    useEffect(() => {
        const socket = getSocket();

        const handleNewTicket = (ticket: any) => {
            toastRef.current({
                title: t('new_ticket_title'),
                description: t('new_ticket_desc', { name: ticket.creatorName || 'Bir müşteri', subject: ticket.subject }),
                action: (
                    <ToastAction
                        altText={t('view_action')}
                        onClick={() => window.open(`/tickets/${ticket.id}`, '_blank')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {t('view_action')}
                    </ToastAction>
                ),
                duration: 10000,
            });
        };

        const handleAiFallback = (data: any) => {
            toastRef.current({
                title: t('system_alert_title'),
                description: t('system_alert_desc', { primary: data.primaryProvider, fallback: data.fallbackProvider }),
                variant: 'destructive',
                duration: 8000,
            });
        };

        socket.on('ticket:created', handleNewTicket);
        socket.on('system:ai_fallback', handleAiFallback);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('ticket:created', handleNewTicket);
            socket.off('system:ai_fallback', handleAiFallback);
        };
    }, [t]);

    return null;
}