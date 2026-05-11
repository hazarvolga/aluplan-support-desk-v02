'use client';

import { useTranslations } from 'next-intl';
import { Clock, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.sla
 * Covers: SLA rule configuration — response time, resolution time, business hours
 */
export function TeamSla() {
  const t = useTranslations('help.docs.admin.team_sla');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('params_title')}</h3>
        <div className="space-y-2 text-sm">
          {[
            {
              param: t('param1_title'),
              desc: t('param1_desc'),
              example: t('param1_example'),
            },
            {
              param: t('param2_title'),
              desc: t('param2_desc'),
              example: t('param2_example'),
            },
            {
              param: t('param3_title'),
              desc: t('param3_desc'),
              example: t('param3_example'),
            },
          ].map(({ param, desc, example }) => (
            <div key={param} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1">
              <p className="font-medium">{param}</p>
              <p className="text-muted-foreground text-xs">{desc}</p>
              <p className="text-primary text-xs">{example}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('priority_title')}</h3>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('table_col1')}</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('table_col2')}</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('table_col3')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { priority: t('row1_pri'), response: t('row1_res'), resolution: t('row1_reso'), color: 'text-red-400' },
                { priority: t('row2_pri'), response: t('row2_res'), resolution: t('row2_reso'), color: 'text-amber-400' },
                { priority: t('row3_pri'), response: t('row3_res'), resolution: t('row3_reso'), color: 'text-blue-400' },
                { priority: t('row4_pri'), response: t('row4_res'), resolution: t('row4_reso'), color: 'text-slate-400' },
              ].map(({ priority, response, resolution, color }) => (
                <tr key={priority} className="border-b border-white/5 last:border-0">
                  <td className={`px-4 py-2.5 font-medium ${color}`}>{priority}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{response}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('table_note')}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('violation_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('vio_item1')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('vio_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('vio_item3')}
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title={t('tip_hours_title')}>
        {t('tip_hours_desc')}
      </TipBox>
    </article>
  );
}
