'use client';

import { Library, Search, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.knowledge_base.overview
 * Covers: What is the knowledge base, how to search, article types
 */
export function KnowledgeBaseOverview() {
  const t = useTranslations('help.docs.customer.knowledge_base_overview');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Library className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('search_title')}
        </h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('search_step1_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('search_step1_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('search_step2_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('search_step2_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('search_step3_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('search_step3_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('types_title')}</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { icon: '📖', title: t('type1_title'), desc: t('type1_desc') },
            { icon: '🔧', title: t('type2_title'), desc: t('type2_desc') },
            { icon: '📋', title: t('type3_title'), desc: t('type3_desc') },
            { icon: '🎓', title: t('type4_title'), desc: t('type4_desc') },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start">
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('statuses_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            { status: t('stat1'), desc: t('stat1_desc') },
            { status: t('stat2'), desc: t('stat2_desc') },
            { status: t('stat3'), desc: t('stat3_desc') },
          ].map(({ status, desc }) => (
            <li key={status} className="flex gap-2 items-start">
              <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span><strong>{status}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <TipBox variant="info" title={t('tip_ai_title')}>
        <span dangerouslySetInnerHTML={{ __html: t.raw('tip_ai_desc') }} />
      </TipBox>
    </article>
  );
}
