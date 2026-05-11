'use client';

import { useTranslations } from 'next-intl';
import { HardDrive, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * admin.ai_knowledge.pool
 * Covers: Knowledge Pool management — PDF upload, web scraper, raw text
 */
export function AiKnowledgePool() {
  const t = useTranslations('help.docs.admin.ai_knowledge_pool');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <HardDrive className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <DocAccordion
        defaultValue={['pdf', 'scraper', 'raw']}
        items={[
          {
            id: 'pdf',
            title: t('pdf_title'),
            icon: HardDrive,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('pdf_desc')}</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: t.raw('pdf_item1') }} />
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('pdf_item2')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('pdf_item3')}
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'scraper',
            title: t('scraper_title'),
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('scraper_desc')}</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('scraper_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('scraper_item2')}
                  </li>
                </ul>
                <TipBox variant="info">
                  {t('scraper_tip')}
                </TipBox>
              </div>
            ),
          },
          {
            id: 'raw',
            title: t('raw_title'),
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('raw_desc')}</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('raw_item1')}
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {t('raw_item2')}
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
      />

      <TipBox variant="tip" title={t('tip_quality_title')}>
        {t('tip_quality_desc')}
      </TipBox>
    </article>
  );
}
