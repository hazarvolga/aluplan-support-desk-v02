'use client';

import { useTranslations } from 'next-intl';
import { Network, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.topology
 * Covers: System topology view — AI nodes, database, infrastructure
 */
export function SystemTopology() {
  const t = useTranslations('help.docs.admin.system_topology');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Network className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('view_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('view_desc')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { name: t('view_ai_name'), desc: t('view_ai_desc'), icon: '🤖' },
            { name: t('view_db_name'), desc: t('view_db_desc'), icon: '🗄️' },
            { name: t('view_api_name'), desc: t('view_api_desc'), icon: '⚡' },
            { name: t('view_uptime_name'), desc: t('view_uptime_desc'), icon: '📊' },
          ].map(({ name, desc, icon }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start">
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-medium" dangerouslySetInnerHTML={{ __html: name }} />
                <p className="text-muted-foreground text-xs mt-0.5" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('status_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('status_online') }} />
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('status_warning') }} />
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('status_offline') }} />
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('telemetry_title')}</h3>
        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('telemetry_desc') }} />
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('telemetry_item1')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('telemetry_item2')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('telemetry_item3')}
          </li>
        </ul>
      </section>

      <TipBox variant="info" title={t('tip_readonly_title')}>
        {t('tip_readonly_desc')}
      </TipBox>
    </article>
  );
}
