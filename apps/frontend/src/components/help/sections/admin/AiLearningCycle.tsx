'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw, ArrowRight, Star } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.learning_cycle
 * Covers: How the AI learning loop works, 5-star tickets, FAQ extraction
 */
export function AiLearningCycle() {
  const t = useTranslations('help.docs.admin.ai_learning_cycle');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
          {t('works_title')}
        </h3>
        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          {[
            {
              step: '1',
              title: t('step1_title'),
              desc: t('step1_desc'),
            },
            {
              step: '2',
              title: t('step2_title'),
              desc: t('step2_desc'),
            },
            {
              step: '3',
              title: t('step3_title'),
              desc: t('step3_desc'),
            },
            {
              step: '4',
              title: t('step4_title'),
              desc: t('step4_desc'),
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {step}
                </span>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground pl-8">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('faq_title')}</h3>
        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('faq_desc') }} />
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('faq_item1')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('faq_item2')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('faq_item3')}
          </li>
        </ul>
      </section>

      <TipBox variant="info" title={t('tip_active_title')}>
        {t('tip_active_desc')}
      </TipBox>
    </article>
  );
}
