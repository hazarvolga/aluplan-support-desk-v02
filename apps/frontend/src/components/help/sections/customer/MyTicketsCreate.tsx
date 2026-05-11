'use client';

import { Plus, Shield, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.my_tickets.create
 * Covers: Step-by-step guide to creating a new support ticket
 */
export function MyTicketsCreate() {
  const t = useTranslations('help.docs.customer.my_tickets_create');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <TipBox variant="tip" title={t('tip_ai_title')}>
        <span dangerouslySetInnerHTML={{ __html: t.raw('tip_ai_desc') }} />
      </TipBox>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('steps_title')}</h3>

        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
              {t('step1_title')}
            </h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('step1_desc') }} />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
              {t('step2_title')}
            </h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('step2_desc') }} />
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" aria-hidden="true" />
              {t('step3_title')}
            </h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('step3_desc') }} />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
              {t('step4_title')}
            </h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('step4_desc') }} />
            <TipBox variant="warning" title={t('tip_crash_title')}>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: t.raw('tip_crash_desc') }} />
            </TipBox>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
              {t('step5_title')}
            </h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('step5_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('priorities_title')}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { level: 'Düşük', color: 'text-slate-400', desc: t('priority_low') },
            { level: 'Orta', color: 'text-blue-400', desc: t('priority_medium') },
            { level: 'Yüksek', color: 'text-amber-400', desc: t('priority_high') },
            { level: 'Acil', color: 'text-red-400', desc: t('priority_urgent') },
          ].map(({ level, color, desc }) => (
            <div key={level} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className={`font-medium ${color}`}>{level}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
