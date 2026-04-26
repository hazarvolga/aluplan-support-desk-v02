'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAnnouncementStore } from '@/stores/announcement-store';

interface AnnouncementReceivedPayload {
  logId: string;
  announcementId: string;
  title: string;
  excerpt: string;
  sentAt: string;
}

export function GlobalAnnouncementNotification() {
  const t = useTranslations('announcements');
  const { incrementUnread, openArchive } = useAnnouncementStore();

  useEffect(() => {
    try {
      const socket = getSocket();
      socket.connect();

      const handler = (payload: AnnouncementReceivedPayload) => {
        incrementUnread();
        toast(payload.title, {
          description: payload.excerpt,
          duration: 6000,
          action: {
            label: t('toast_view'),
            onClick: () => openArchive(payload.logId),
          },
        });
      };

      socket.on('ANNOUNCEMENT_RECEIVED', handler);

      return () => {
        socket.off('ANNOUNCEMENT_RECEIVED', handler);
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('[GlobalAnnouncementNotification] Socket init failed:', err);
      }
    }
  }, []);

  return null;
}
