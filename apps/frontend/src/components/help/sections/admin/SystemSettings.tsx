'use client';

import { useTranslations } from 'next-intl';
import { Sliders, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.settings
 * Covers: General system settings — CRM integration, email, notifications
 */
export function SystemSettings() {
  const t = useTranslations('help.docs.admin.system_settings');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Sliders className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('crm_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('crm_desc')}
        </p>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('crm_step1_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('crm_step1_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('crm_step2_title')}</p>
            <p>{t('crm_step2_desc')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('crm_step3_title')}</p>
            <p>
              {t('crm_step3_desc')}
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('crm_step4_title')}</p>
            <p>
              {t('crm_step4_desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('other_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('other_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('other_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('other_item3') }} />
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title={t('tip_warning_title')}>
        {t('tip_warning_desc')}
      </TipBox>
    </article>
  );
}
