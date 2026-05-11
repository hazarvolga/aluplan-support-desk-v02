'use client';

import { useTranslations } from 'next-intl';
import { Tag, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * admin.crm_products.taxonomy
 * Covers: Taxonomy rules, keyword configuration for AI triage
 */
export function CrmTaxonomy() {
  const t = useTranslations('help.docs.admin.crm_taxonomy');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Tag className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('what_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('what_desc')}
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
          <p className="font-medium">{t('example_title')}</p>
          <div className="space-y-2 text-muted-foreground">
            <p dangerouslySetInnerHTML={{ __html: t.raw('example_category') }} />
            <p dangerouslySetInnerHTML={{ __html: t.raw('example_keywords') }} />
            <CodeBlock
              code="kapanıyor, çöküyor, crash, donuyor, siyah ekran, yanıt vermiyor"
              language="text"
            />
            <p className="text-xs">
              {t('example_desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('strategy_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('strategy_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('strategy_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('strategy_item3') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('strategy_item4') }} />
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title={t('tip_conflict_title')}>
        {t('tip_conflict_desc')}
      </TipBox>
    </article>
  );
}
