'use client';

import { Settings, User, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.profile.settings
 * Covers: Profile management, password change, notification preferences
 */
export function ProfileSettings() {
  const t = useTranslations('help.docs.customer.profile_settings');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Settings className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          {t('update_title')}
        </h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('update_step1_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('update_step1_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('update_step2_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('update_step2_desc') }} />
          </div>
          <div>
            <p className="font-medium text-foreground">{t('update_step3_title')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('update_step3_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('password_title')}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('pass_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('pass_item2') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('pass_item3') }} />
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('hotinfo_title')}</h3>
        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('hotinfo_desc') }} />
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('hotinfo_item1') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('hotinfo_item2') }} />
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title={t('tip_email_title')}>
        <span dangerouslySetInnerHTML={{ __html: t.raw('tip_email_desc') }} />
      </TipBox>
    </article>
  );
}
