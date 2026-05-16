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

        const handleCrmChanges = (data: any) => {
            toastRef.current({
                title: t('crm_change_title'),
                description: t('crm_change_desc', {
                    count: data.changeCount ?? 0,
                    entity: data.entityType === 'account' ? t('crm_entity_account') : t('crm_entity_contact'),
                }),
                action: (
                    <ToastAction
                        altText={t('open_crm_action')}
                        onClick={() => window.open('/customers/crm', '_blank')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {t('open_crm_action')}
                    </ToastAction>
                ),
                duration: 10000,
            });
        };

        const handleCrmSyncError = (data: any) => {
            toastRef.current({
                title: t('crm_sync_error_title'),
                description: t('crm_sync_error_desc', { message: data.message || '-' }),
                variant: 'destructive',
                duration: 10000,
            });
        };

        socket.on('ticket:created', handleNewTicket);
        socket.on('system:ai_fallback', handleAiFallback);
        socket.on('crm:changes', handleCrmChanges);
        socket.on('crm:sync_error', handleCrmSyncError);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('ticket:created', handleNewTicket);
            socket.off('system:ai_fallback', handleAiFallback);
            socket.off('crm:changes', handleCrmChanges);
            socket.off('crm:sync_error', handleCrmSyncError);
        };
    }, [t]);

    return null;
}
