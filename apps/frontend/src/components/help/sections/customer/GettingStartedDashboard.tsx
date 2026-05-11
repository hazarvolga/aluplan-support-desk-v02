'use client';

import { LayoutDashboard, Bell, Ticket, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * customer.getting_started.dashboard
 * Covers: Dashboard overview, active tickets, announcements board
 */
export function GettingStartedDashboard() {
  const t = useTranslations('help.docs.customer.getting_started');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <DocAccordion
        defaultValue={['overview', 'tickets', 'announcements']}
        items={[
          {
            id: 'overview',
            title: t('overview_title'),
            icon: LayoutDashboard,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('overview_desc')}</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('overview_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('overview_item2')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('overview_item3')}
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'tickets',
            title: t('tickets_title'),
            icon: Ticket,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t.raw('tickets_desc') }} />
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('tickets_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('tickets_item2')}
                  </li>
                </ul>
                <TipBox variant="info" title={t('tip_quick_access_title')}>
                  <span dangerouslySetInnerHTML={{ __html: t.raw('tip_quick_access') }} />
                </TipBox>
              </div>
            ),
          },
          {
            id: 'announcements',
            title: t('announcements_title'),
            icon: Bell,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t.raw('announcements_desc') }} />
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('announcements_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('announcements_item2')}
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
