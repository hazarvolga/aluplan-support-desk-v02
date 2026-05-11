'use client';

import { useTranslations } from 'next-intl';
import { UserCheck, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.customers
 * Covers: Customer approval, CRM verification, account management
 */
export function TeamCustomers() {
  const t = useTranslations('help.docs.admin.team_customers');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <UserCheck className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('process_title')}</h3>
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
            <p dangerouslySetInnerHTML={{ __html: t.raw('step3_desc') }} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('crm_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('crm_desc')}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('crm_ok') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('crm_manual') }} />
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: t.raw('crm_not_found') }} />
          </li>
        </ul>
      </section>

      <TipBox variant="info" title={t('tip_bulk_title')}>
        {t('tip_bulk_desc')}
      </TipBox>
    </article>
  );
}
