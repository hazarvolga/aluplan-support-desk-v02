'use client';

import { useTranslations } from 'next-intl';
import { Inbox, ArrowRight, UserCheck } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * admin.tickets.overview
 * Covers: Ticket pool, status management, assignment
 */
export function TicketsOverview() {
  const t = useTranslations('help.docs.admin.tickets_overview');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Inbox className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p 
          className="text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: t.raw('desc') }}
        />
      </header>

      <DocAccordion
        defaultValue={['pool', 'status', 'assignment']}
        items={[
          {
            id: 'pool',
            title: t('pool_title'),
            icon: Inbox,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('pool_desc')}</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('pool_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('pool_item2')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('pool_item3')}
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'status',
            title: t('status_title'),
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('status_desc')}</p>
                <div className="space-y-2">
                  {[
                    { from: t('status_item1_from'), desc: t('status_item1_desc') },
                    { from: t('status_item2_from'), desc: t('status_item2_desc') },
                    { from: t('status_item3_from'), desc: t('status_item3_desc') },
                    { from: t('status_item4_from'), desc: t('status_item4_desc') },
                  ].map(({ from, desc }) => (
                    <div key={from} className="flex gap-2 items-start">
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span><strong>{from}:</strong> {desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'assignment',
            title: t('assignment_title'),
            icon: UserCheck,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t.raw('assignment_desc') }} />
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('assignment_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('assignment_item2')}
                  </li>
                </ul>
                <TipBox variant="info">
                  {t('tip_sla_desc')}
                </TipBox>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
