'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function GlobalTicketNotification() {
    const { toast } = useToast();
    const t = useTranslations('notifications');

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.connect();

            const handleNewTicket = (ticket: any) => {
                toast({
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
                toast({
                    title: t('system_alert_title'),
                    description: t('system_alert_desc', { primary: data.primaryProvider, fallback: data.fallbackProvider }),
                    variant: 'destructive',
                    duration: 8000,
                });
            };

            socket.on('ticket:created', handleNewTicket);
            socket.on('system:ai_fallback', handleAiFallback);

            return () => {
                socket.off('connect');
                socket.off('ticket:created', handleNewTicket);
                socket.off('system:ai_fallback', handleAiFallback);
            };
        } catch (err) {
            // Socket initialization failures are silently ignored in production
            // to prevent console noise. Development debugging should use
            // the browser's Network tab or backend logs.
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.warn('[GlobalTicketNotification] Socket init failed:', err);
            }
        }
    }, [toast]);

    return null;
}
