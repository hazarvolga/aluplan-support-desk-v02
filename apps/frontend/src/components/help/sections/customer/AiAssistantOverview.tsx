'use client';

import { Bot, Sparkles, ArrowRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * customer.ai_assistant.overview
 * Covers: AI assistant usage, RAG mechanism, how to ask questions
 */
export function AiAssistantOverview() {
  const t = useTranslations('help.docs.customer.ai_assistant_overview');

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <DocAccordion
        defaultValue={['how-to-use', 'rag', 'no-answer']}
        items={[
          {
            id: 'how-to-use',
            title: t('usage_title'),
            icon: Sparkles,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <ol className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <li className="space-y-1">
                    <p className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: t.raw('usage_step1_title') }} />
                    <p dangerouslySetInnerHTML={{ __html: t.raw('usage_step1_desc') }} />
                  </li>
                  <li className="space-y-1">
                    <p className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: t.raw('usage_step2_title') }} />
                    <p dangerouslySetInnerHTML={{ __html: t.raw('usage_step2_desc') }} />
                    <CodeBlock
                      code='Duvar çizerken program kapanıyor, ne yapmalıyım?'
                      language="text"
                      inline
                    />
                  </li>
                  <li className="space-y-1">
                    <p className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: t.raw('usage_step3_title') }} />
                    <p dangerouslySetInnerHTML={{ __html: t.raw('usage_step3_desc') }} />
                  </li>
                </ol>
              </div>
            ),
          },
          {
            id: 'rag',
            title: t('rag_title'),
            icon: Search,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t.raw('rag_desc') }} />
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: t.raw('rag_item1') }} />
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: t.raw('rag_item2') }} />
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: t.raw('rag_item3') }} />
                  </li>
                </ul>
                <TipBox variant="tip" title={t('tip_rag_title')}>
                  <span dangerouslySetInnerHTML={{ __html: t.raw('tip_rag_desc') }} />
                </TipBox>
              </div>
            ),
          },
          {
            id: 'no-answer',
            title: t('no_answer_title'),
            icon: Bot,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t.raw('no_answer_desc') }} />
                <TipBox variant="info" title={t('tip_no_answer_title')}>
                  <span dangerouslySetInnerHTML={{ __html: t.raw('tip_no_answer_desc') }} />
                </TipBox>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
