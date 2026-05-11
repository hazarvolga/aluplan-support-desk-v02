'use client';

import { Megaphone, Bell, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.getting_started.announcements
 * Covers: How to read and navigate announcements
 */
export function GettingStartedAnnouncements() {
  const t = useTranslations('help.docs.customer.getting_started_announcements');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Megaphone className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('read_announcements_title')}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground pl-4">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('read_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('read_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('read_item3') }} />
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('types_title')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm" dangerouslySetInnerHTML={{ __html: t.raw('type1').split(':')[0] + ':' }} />
            <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('type1').split(':').slice(1).join(':') }} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm" dangerouslySetInnerHTML={{ __html: t.raw('type2').split(':')[0] + ':' }} />
            <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('type2').split(':').slice(1).join(':') }} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm" dangerouslySetInnerHTML={{ __html: t.raw('type3').split(':')[0] + ':' }} />
            <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('type3').split(':').slice(1).join(':') }} />
          </div>
        </div>
      </section>

      <TipBox variant="tip" title={t('tip_title')}>
        <span dangerouslySetInnerHTML={{ __html: t.raw('tip_desc') }} />
      </TipBox>
    </article>
  );
}
