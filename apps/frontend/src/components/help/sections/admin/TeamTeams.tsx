'use client';

import { useTranslations } from 'next-intl';
import { Building2, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.teams
 * Covers: Team creation, department management, agent assignment
 */
export function TeamTeams() {
  const t = useTranslations('help.docs.admin.team_teams');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('steps_title')}</h3>
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
            <p>{t('step3_desc')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('step4_title')}</p>
            <p>{t('step4_desc')}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('structure_title')}</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { name: t('struct1_title'), desc: t('struct1_desc') },
            { name: t('struct2_title'), desc: t('struct2_desc') },
            { name: t('struct3_title'), desc: t('struct3_desc') },
            { name: t('struct4_title'), desc: t('struct4_desc') },
          ].map(({ name, desc }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-medium">{name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="tip" title={t('tip_auto_title')}>
        {t('tip_auto_desc')}
      </TipBox>
    </article>
  );
}
