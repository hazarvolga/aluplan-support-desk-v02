'use client';

import { useTranslations } from 'next-intl';
import { Package, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.crm_products.products
 * Covers: Product and module management for ticket classification
 */
export function CrmProducts() {
  const t = useTranslations('help.docs.admin.crm_products');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {t('desc')}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('add_title')}</h3>
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
            <p>
              {t('step3_desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('category_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('category_desc')}
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          <p className="font-medium mb-2">{t('example_title')}</p>
          <div className="space-y-1 text-muted-foreground font-mono text-xs">
            <p>📦 ALLPLAN</p>
            <p className="pl-4">├── Duvar &amp; Döşeme</p>
            <p className="pl-4">├── Lisans Yönetimi</p>
            <p className="pl-4">└── Render &amp; Görselleştirme</p>
            <p className="mt-2">📦 AX3000</p>
            <p className="pl-4">├── Kurulum</p>
            <p className="pl-4">└── Aktivasyon</p>
          </div>
        </div>
      </section>

      <TipBox variant="tip" title={t('tip_keywords_title')}>
        {t('tip_keywords_desc')}
      </TipBox>
    </article>
  );
}
