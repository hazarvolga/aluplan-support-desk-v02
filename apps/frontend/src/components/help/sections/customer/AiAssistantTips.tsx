'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.ai_assistant.tips
 * Covers: Tips for asking effective questions to the AI assistant
 */
export function AiAssistantTips() {
  const t = useTranslations('help.docs.customer.ai_assistant_tips');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('do_title')}</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{t('do_item1_title')}</p>
              <p className="mt-0.5">{t('do_item1_desc')}</p>
              <CodeBlock code="AX3000 modülünde lisans hatası alıyorum" inline className="mt-1" />
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{t('do_item2_title')}</p>
              <p className="mt-0.5">{t('do_item2_desc')}</p>
              <CodeBlock code='Error: "License server not found (0x80070005)"' inline className="mt-1" />
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{t('do_item3_title')}</p>
              <p className="mt-0.5">{t('do_item3_desc')}</p>
              <CodeBlock code="Duvar çizerken, 3. noktayı tıkladığımda program kapanıyor" inline className="mt-1" />
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t('dont_title')}</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3 items-start rounded-lg border border-red-500/10 bg-red-900/10 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{t('dont_item1_title')}</p>
              <CodeBlock code="Program çalışmıyor" inline className="mt-1" />
              <p className="mt-1 text-xs">{t('dont_item1_desc')}</p>
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-red-500/10 bg-red-900/10 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{t('dont_item2_title')}</p>
              <CodeBlock code="Lisans hatası ve ayrıca duvar çizimi ve de raporlama nasıl yapılır?" inline className="mt-1" />
            </div>
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title={t('tip_pro_title')}>
        <span dangerouslySetInnerHTML={{ __html: t.raw('tip_pro_desc') }} />
      </TipBox>
    </article>
  );
}
