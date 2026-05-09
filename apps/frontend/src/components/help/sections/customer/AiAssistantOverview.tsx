'use client';

import { Bot, Sparkles, ArrowRight, Search } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * customer.ai_assistant.overview
 * Covers: AI assistant usage, RAG mechanism, how to ask questions
 */
export function AiAssistantOverview() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">AI Asistanı Kullanımı</h2>
        </div>
        <p className="text-muted-foreground">
          Destek talebi açmadan önce <strong>AI Asistanı</strong> ile sorununuzu hızlıca
          çözebilirsiniz. Asistan, tüm bilgi bankasını tarayarak size adım adım çözüm sunar.
        </p>
      </header>

      <DocAccordion
        defaultValue={['how-to-use', 'rag', 'no-answer']}
        items={[
          {
            id: 'how-to-use',
            title: 'AI Asistanını Nasıl Kullanırım?',
            icon: Sparkles,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <ol className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <li className="space-y-1">
                    <p className="font-medium text-foreground">1. AI Asistanı sayfasına gidin</p>
                    <p>Sol menüden <strong>AI Asistanı</strong> bağlantısına tıklayın.</p>
                  </li>
                  <li className="space-y-1">
                    <p className="font-medium text-foreground">2. Sorunuzu yazın</p>
                    <p>
                      Mesaj kutusuna aldığınız hatayı veya öğrenmek istediğiniz konuyu yazın.
                    </p>
                    <CodeBlock
                      code='Duvar çizerken program kapanıyor, ne yapmalıyım?'
                      language="text"
                      inline
                    />
                  </li>
                  <li className="space-y-1">
                    <p className="font-medium text-foreground">3. Yanıtı inceleyin</p>
                    <p>
                      AI, bilgi bankasını tarayarak çözüm adımlarını doğrudan sunar.
                      Çözüm bulunamazsa destek talebi oluşturmanızı önerir.
                    </p>
                  </li>
                </ol>
              </div>
            ),
          },
          {
            id: 'rag',
            title: 'RAG Mekanizması Nedir?',
            icon: Search,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  AI Asistanı, <strong>RAG (Retrieval-Augmented Generation)</strong> teknolojisini
                  kullanır. Bu, asistanın yanıt üretmeden önce şirketin bilgi havuzunu
                  (Knowledge Pool) taraması anlamına gelir.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Sorgunuz vektör aramasıyla ilgili belgelerle eşleştirilir.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Eşleşen belgelerden bağlamsal bir yanıt oluşturulur.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Yanıtın altında kaynak belgeler listelenir.
                  </li>
                </ul>
                <TipBox variant="tip" title="Daha İyi Sonuçlar İçin">
                  Sorularınızda yazılım modülünün adını belirtin (örn.{' '}
                  <CodeBlock code="AX3000" inline />
                  ). Bu, AI&apos;ın daha doğru sonuçlar bulmasını sağlar.
                </TipBox>
              </div>
            ),
          },
          {
            id: 'no-answer',
            title: 'Yanıt Bulunamazsa Ne Olur?',
            icon: Bot,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  AI Asistanı sorunuza uygun bir yanıt bulamazsa, otomatik olarak
                  <strong> destek talebi oluşturmanızı</strong> önerir.
                </p>
                <TipBox variant="info">
                  &quot;Hayır, Talep Oluştur&quot; butonuna tıklayarak AI&apos;ın anladığı
                  bağlamla önceden doldurulmuş bir destek talebi formu açabilirsiniz.
                </TipBox>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
