'use client';

import { useTranslations } from 'next-intl';
import { UserCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.profile
 * Covers: Admin profile management — personal info, password, preferences
 */
export function SystemProfile() {
  const t = useTranslations('help.docs.admin.system_profile');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('update_title')}</h3>
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
            <p dangerouslySetInnerHTML={{ __html: t.raw('step3_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('password_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('password_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('password_item2')}
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            {t('password_item3')}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('lang_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('lang_desc')}
        </p>
      </section>

      <TipBox variant="tip" title={t('tip_secure_title')}>
        {t('tip_secure_desc')}
      </TipBox>
    </article>
  );
}
