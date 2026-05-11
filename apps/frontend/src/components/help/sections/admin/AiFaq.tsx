'use client';

import { useTranslations } from 'next-intl';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.faq
 * Covers: Automated FAQ extraction and management
 */
export function AiFaq() {
  const t = useTranslations('help.docs.admin.ai_faq');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('process_title')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">{t('auto_title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('auto_desc')}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">{t('manual_title')}</h4>
            <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('manual_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('status_title')}</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-amber-400 block">{t('status_pending')}</strong>
              {t('status_pending_desc')}
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-green-400 block">{t('status_published')}</strong>
              {t('status_published_desc')}
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-400 block">{t('status_draft')}</strong>
              {t('status_draft_desc')}
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('approval_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('approval_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('approval_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('approval_item3')}
          </li>
        </ul>
      </section>

      <TipBox variant="info" title={t('tip_cycle_title')}>
        {t('tip_cycle_desc')}
      </TipBox>
    </article>
  );
}
