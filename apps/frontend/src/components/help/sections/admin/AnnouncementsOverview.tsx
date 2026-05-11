'use client';

import { useTranslations } from 'next-intl';
import { Send, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.announcements.overview
 * Covers: Creating and publishing announcements — 4-step workflow
 */
export function AnnouncementsOverview() {
  const t = useTranslations('help.docs.admin.announcements_overview');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Send className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('process_title')}</h3>
        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          {[
            {
              step: '1',
              icon: '📝',
              title: t('step1_title'),
              desc: t('step1_desc'),
            },
            {
              step: '2',
              icon: '📢',
              title: t('step2_title'),
              desc: t('step2_desc'),
            },
            {
              step: '3',
              icon: '🎯',
              title: t('step3_title'),
              desc: t('step3_desc'),
            },
            {
              step: '4',
              icon: '🚀',
              title: t('step4_title'),
              desc: t('step4_desc'),
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="space-y-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {step}
                </span>
                <span aria-hidden="true">{icon}</span>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground pl-9">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('filter_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('filter_sector') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('filter_company') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('filter_all') }} />
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title={t('tip_test_title')}>
        {t('tip_test_desc')}
      </TipBox>
    </article>
  );
}
