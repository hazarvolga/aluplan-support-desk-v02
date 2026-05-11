'use client';

import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.my_tickets.tracking
 * Covers: How to track ticket status, status meanings, CSAT feedback
 */
export function MyTicketsTracking() {
  const t = useTranslations('help.docs.customer.my_tickets_tracking');

  const statuses = [
    { label: t('stat_new'), color: 'bg-slate-500', desc: t('stat_new_desc') },
    { label: t('stat_open'), color: 'bg-blue-500', desc: t('stat_open_desc') },
    { label: t('stat_in_progress'), color: 'bg-amber-500', desc: t('stat_in_progress_desc') },
    { label: t('stat_waiting'), color: 'bg-purple-500', desc: t('stat_waiting_desc') },
    { label: t('stat_solution'), color: 'bg-orange-500', desc: t('stat_solution_desc') },
    { label: t('stat_resolved'), color: 'bg-green-500', desc: t('stat_resolved_desc') },
    { label: t('stat_closed'), color: 'bg-slate-600', desc: t('stat_closed_desc') },
  ];

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('status_title')}</h3>
        <div className="space-y-2">
          {statuses.map(({ label, color, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('approval_title')}</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('app_step1_title')}
            </p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('app_step1_desc') }} />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
              {t('app_step2_title')}
            </p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('app_step2_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('csat_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('csat_desc')}
        </p>
        <TipBox variant="tip" title={t('tip_csat_title')}>
          {t('tip_csat_desc')}
        </TipBox>
      </section>
    </article>
  );
}
