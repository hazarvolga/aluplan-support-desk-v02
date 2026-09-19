'use client';

import { useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getSocket, isSocketSessionEnded, subscribeSocketSession } from '@/lib/socket';

/** Preserve the current editor when a server session ends instead of navigating away. */
export function RealtimeSessionNotice() {
    const ended = useSyncExternalStore(subscribeSocketSession, isSocketSessionEnded, () => false);
    const t = useTranslations('common');
    const locale = useLocale();
    if (!ended) return null;

    return (
        <div role="alert" className="fixed bottom-4 left-4 right-4 z-[100] rounded-lg border border-destructive bg-background p-4 text-foreground shadow-lg sm:left-auto sm:max-w-lg">
            <p className="text-sm">{t('realtime_session_ended')}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                <a href={`/${locale}/login`} target="_blank" rel="noopener noreferrer" className="underline">
                    {t('realtime_sign_in')}
                </a>
                <button type="button" onClick={() => getSocket().connect()} className="underline">
                    {t('realtime_reconnect')}
                </button>
            </div>
        </div>
    );
}
