'use client';

import { useTranslations } from 'next-intl';
import { FileText, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.announcements.templates
 * Covers: Template library — creating, editing, applying templates
 */
export function AnnouncementsTemplates() {
  const t = useTranslations('help.docs.admin.announcements_templates');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('create_title')}</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('step1_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('step1_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step2_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('step2_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step3_title')}</p>
            <p>{t('step3_desc')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step4_title')}</p>
            <p>{t('step4_desc')}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('use_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('use_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('use_item2')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('use_item3')}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('types_title')}</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { name: t('type_maintenance'), desc: t('type_maintenance_desc') },
            { name: t('type_feature'), desc: t('type_feature_desc') },
            { name: t('type_urgent'), desc: t('type_urgent_desc') },
            { name: t('type_general'), desc: t('type_general_desc') },
          ].map(({ name, desc }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-medium">{name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="info" title={t('tip_update_title')}>
        {t('tip_update_desc')}
      </TipBox>
    </article>
  );
}
