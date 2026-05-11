'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.approvals
 * Covers: KB Approvals workflow — approve/reject AI learning candidates
 */
export function AiApprovals() {
  const t = useTranslations('help.docs.admin.ai_approvals');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('workflow_title')}</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('step1_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('step1_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step2_title')}</p>
            <p>{t('step2_desc')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step3_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('step3_desc1') }} />
            <p className="mt-1" dangerouslySetInnerHTML={{ __html: t.raw('step3_desc2') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('score_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('score_desc')}
        </p>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          {[
            { range: '80-100%', label: t('score_high'), color: 'text-green-400', desc: t('score_high_desc') },
            { range: '50-79%', label: t('score_med'), color: 'text-amber-400', desc: t('score_med_desc') },
            { range: '0-49%', label: t('score_low'), color: 'text-red-400', desc: t('score_low_desc') },
          ].map(({ range, label, color, desc }) => (
            <div key={range} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className={`font-medium ${color}`}>{label} ({range})</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="tip" title={t('tip_qa_title')}>
        {t('tip_qa_desc')}
      </TipBox>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('bulk_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('bulk_item1')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('bulk_item2')}
          </li>
        </ul>
      </section>
    </article>
  );
}
