'use client';

import { useTranslations } from 'next-intl';
import { StickyNote, ArrowRight, UserCheck } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.tickets.internal_notes
 * Covers: Internal notes (team-only), assignment workflow
 */
export function TicketsInternalNotes() {
  const t = useTranslations('help.docs.admin.tickets_internal_notes');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <StickyNote className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-400" aria-hidden="true" />
          {t('notes_title')}
        </h3>
        <div className="space-y-3 border-l-2 border-amber-500/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('step1_title')}</p>
            <p>{t('step1_desc')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step2_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('step2_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step3_title')}</p>
            <p>{t('step3_desc')}</p>
          </div>
        </div>
        <TipBox variant="warning" title={t('tip_warning_title')}>
          <span dangerouslySetInnerHTML={{ __html: t.raw('tip_warning_desc') }} />
        </TipBox>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('workflow_title')}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('workflow_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('workflow_item2')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('workflow_item3')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('workflow_item4')}
          </li>
        </ul>
      </section>
    </article>
  );
}
