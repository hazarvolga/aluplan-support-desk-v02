'use client';

import { Bot, Zap, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.tickets.ai_copilot
 * Covers: AI Co-Pilot draft generation, vector search, editing drafts
 */
export function TicketsAiCopilot() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">AI Co-Pilot</h2>
        </div>
        <p className="text-muted-foreground">
          AI Co-Pilot, müşteri mesajını analiz ederek Knowledge Pool&apos;dan ilgili
          belgeleri bulur ve profesyonel bir yanıt taslağı hazırlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Nasıl Kullanılır?
        </h3>
        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          {[
            {
              step: '1',
              title: 'Bilet detayına girin',
              desc: 'Yanıtlamak istediğiniz destek talebini açın.',
            },
            {
              step: '2',
              title: '"AI Yanıt Taslağı Oluştur" butonuna tıklayın',
              desc: 'Sağ üst köşedeki butona tıklayın. AI işlemi 5-10 saniye sürer.',
            },
            {
              step: '3',
              title: 'Taslağı inceleyin',
              desc: 'AI, müşteri mesajını ve Knowledge Pool\'u tarayarak hazırladığı taslağı sunar. Kaynak belgeler altta listelenir.',
            },
            {
              step: '4',
              title: 'Düzenleyin ve gönderin',
              desc: 'Taslağı kendi üslubunuza göre düzenleyin ve müşteriye gönderin.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {step}
                </span>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground pl-8">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">AI Co-Pilot Nasıl Çalışır?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Müşteri mesajı vektör aramasıyla Knowledge Pool&apos;daki belgelerle eşleştirilir.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            En alakalı belgeler bağlam olarak kullanılır.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Profesyonel bir yanıt taslağı oluşturulur ve kaynak belgeler gösterilir.
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title="Taslağı Her Zaman Düzenleyin">
        AI taslakları bir başlangıç noktasıdır. Müşteriye göndermeden önce kendi
        üslubunuza ve duruma özel detaylara göre düzenlemeniz önerilir.
      </TipBox>
    </article>
  );
}
